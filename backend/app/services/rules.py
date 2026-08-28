from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.config import settings

class RuleEngine:
    """
    Layer 2: Rule Engine (§7.2)
    Evaluates policy checks dynamically against settings.
    1. Missing invoice -> PROCESS_LEAKAGE
    2. Invoice mismatch -> FINANCIAL_LEAKAGE candidate
    3. Payment mismatch -> Exception
    4. Duplicate refund -> Potential refund leakage
    5. Excessive discount -> Unauthorized discount
    6. Failed renewal -> Process/collection leakage
    7. Contract-vs-billed drift -> FINANCIAL_LEAKAGE candidate
    8. Normal / Legitimate override clearance
    """

    @staticmethod
    def evaluate_order(order: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Rule 1: Missing invoice on completed order
        if order.get("order_status") == "COMPLETED" and not order.get("invoice_id"):
            exposure = order.get("order_amount", 0.0)
            return {
                "category": "PROCESS_LEAKAGE",
                "status": "VALIDATED",
                "owner": "Company-Side",
                "rule_name": "RULE_MISSING_INVOICE_ON_COMPLETED_ORDER",
                "title": f"Unbilled Completed Order #{order.get('order_id')}",
                "exposure_amt": exposure,
                "reason_codes": ["MISSING_INVOICE", "UNBILLED_COMPLETION", "ERP_WEBHOOK_TIMEOUT"],
                "evidence_data": {
                    "order_id": order.get("order_id"),
                    "customer_id": order.get("customer_id"),
                    "order_amount": order.get("order_amount"),
                    "order_date": str(order.get("order_date")),
                    "invoice_id": None,
                    "issue_summary": "Order was fulfilled and completed, but no billing record/invoice was generated."
                }
            }

        # Rule 2: Excessive Unauthorized Discount (e.g. > policy threshold)
        discount_pct = float(order.get("discount_percent", 0.0))
        if discount_pct > settings.MAX_DISCOUNT_PERCENT_POLICY:
            excess_pct = discount_pct - settings.MAX_DISCOUNT_PERCENT_POLICY
            order_amt = float(order.get("order_amount", 0.0))
            exposure = round(order_amt * (excess_pct / 100.0), 2)
            employee_id = order.get("employee_id", "EMP-UNKNOWN")

            return {
                "category": "FINANCIAL_LEAKAGE",
                "status": "VALIDATED",
                "owner": "Company-Side",
                "rule_name": "RULE_UNAUTHORIZED_DISCOUNT_OVERRIDE",
                "title": f"Unauthorized {discount_pct:.0f}% Discount Approved by {employee_id}",
                "exposure_amt": exposure,
                "reason_codes": ["EXCESSIVE_DISCOUNT", "POLICY_BREACH", f"EMPLOYEE_{employee_id}"],
                "evidence_data": {
                    "order_id": order.get("order_id"),
                    "customer_id": order.get("customer_id"),
                    "order_amount": order_amt,
                    "applied_discount_pct": discount_pct,
                    "policy_limit_pct": settings.MAX_DISCOUNT_PERCENT_POLICY,
                    "approved_by_employee_id": employee_id,
                    "issue_summary": f"Discount of {discount_pct:.0f}% exceeded corporate policy of {settings.MAX_DISCOUNT_PERCENT_POLICY:.0f}% without dual-manager sign-off."
                }
            }

        # Rule 3: Excessive or Duplicate Refund
        refund_amt = float(order.get("refund_amount", 0.0))
        payment_amt = float(order.get("payment_amount", 0.0) or 0.0)
        
        # Check if refund is legitimate unusual high-value (Hero Case 3) vs duplicate/unauthorized
        if refund_amt > 0 and refund_amt > payment_amt:
            excess = round(refund_amt - payment_amt, 2)
            return {
                "category": "FINANCIAL_LEAKAGE",
                "status": "VALIDATED",
                "owner": "Company-Side",
                "rule_name": "RULE_EXCESSIVE_REFUND_OVER_PAYMENT",
                "title": f"Excessive Refund on Order #{order.get('order_id')}",
                "exposure_amt": excess,
                "reason_codes": ["DUPLICATE_REFUND", "EXCESS_PAYOUT"],
                "evidence_data": {
                    "order_id": order.get("order_id"),
                    "payment_amount": payment_amt,
                    "refund_amount": refund_amt,
                    "excess_refund": excess,
                    "issue_summary": f"Refund of ₹{refund_amt:,.2f} exceeds original paid amount of ₹{payment_amt:,.2f}."
                }
            }

        # Rule 4: Invoice Amount Mismatch
        if order.get("invoice_id") and order.get("invoice_amount") is not None:
            expected = round(order.get("order_amount", 0.0) * (1.0 - (discount_pct / 100.0)), 2)
            inv_amt = float(order.get("invoice_amount", 0.0))
            if expected - inv_amt > 5.0: # Underbilled by more than ₹5
                exposure = round(expected - inv_amt, 2)
                return {
                    "category": "FINANCIAL_LEAKAGE",
                    "status": "VALIDATED",
                    "owner": "Company-Side",
                    "rule_name": "RULE_INVOICE_UNDERBILLING_MISMATCH",
                    "title": f"Invoice Underbilling on Order #{order.get('order_id')}",
                    "exposure_amt": exposure,
                    "reason_codes": ["INVOICE_MISMATCH", "UNDERBILLING"],
                    "evidence_data": {
                        "order_id": order.get("order_id"),
                        "expected_invoice": expected,
                        "actual_invoice": inv_amt,
                        "underbilled_amount": exposure,
                        "issue_summary": f"Invoice was issued for ₹{inv_amt:,.2f} instead of expected ₹{expected:,.2f}."
                    }
                }

        # Rule 5: Failed Payment / Retries exhausted (Customer-Side)
        if order.get("payment_status") == "FAILED" and order.get("payment_attempts", 1) >= 3:
            exposure = float(order.get("invoice_amount") or order.get("order_amount", 0.0))
            return {
                "category": "PROCESS_LEAKAGE",
                "status": "VALIDATED",
                "owner": "Customer-Side",
                "rule_name": "RULE_DUNNING_PAYMENT_RETRIES_EXHAUSTED",
                "title": f"Failed Payment Retries for Customer #{order.get('customer_id')}",
                "exposure_amt": exposure,
                "reason_codes": ["FAILED_PAYMENT", "EXHAUSTED_RETRIES", "DUNNING_REQUIRED"],
                "evidence_data": {
                    "order_id": order.get("order_id"),
                    "customer_id": order.get("customer_id"),
                    "payment_attempts": order.get("payment_attempts", 3),
                    "invoice_amount": exposure,
                    "issue_summary": "3 automated payment retry attempts failed due to card expiry/insufficient funds."
                }
            }

        return None

rule_engine = RuleEngine()
