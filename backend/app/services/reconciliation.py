from typing import Dict, Any, List, Optional
from datetime import datetime

class ReconciliationEngine:
    """
    Layer 1: Deterministic Reconciliation Equations (§7.1)
    - Order.total = Invoice.subtotal + tax - legitimate_discount
    - Invoice.amount = successful_payment + outstanding_balance + legitimate_adjustments
    - Refund.amount <= eligible_collected_amount
    - Discount <= customer/product/employee policy limit
    - Contract.agreed_amount ≈ sum(Invoice.amount over contract period)
    """

    @staticmethod
    def reconcile_order_invoice(order_amount: float, discount_pct: float, invoice_amount: Optional[float]) -> Dict[str, Any]:
        if invoice_amount is None:
            return {
                "matched": False,
                "discrepancy_type": "MISSING_INVOICE",
                "exposure": order_amount * (1.0 - (discount_pct / 100.0)),
                "message": f"Order amount ₹{order_amount:,.2f} has no associated invoice."
            }

        expected_invoice = round(order_amount * (1.0 - (discount_pct / 100.0)), 2)
        diff = round(expected_invoice - invoice_amount, 2)

        if abs(diff) > 1.0:  # ₹1 rounding tolerance
            return {
                "matched": False,
                "discrepancy_type": "INVOICE_AMOUNT_MISMATCH",
                "exposure": diff if diff > 0 else abs(diff),
                "expected": expected_invoice,
                "actual": invoice_amount,
                "message": f"Invoice amount ₹{invoice_amount:,.2f} differs from expected ₹{expected_invoice:,.2f} (diff: ₹{diff:,.2f})."
            }

        return {"matched": True, "discrepancy_type": None, "exposure": 0.0}

    @staticmethod
    def reconcile_invoice_payment(invoice_amount: float, payment_amount: Optional[float], payment_status: str) -> Dict[str, Any]:
        if payment_status != "SUCCESS" or payment_amount is None:
            return {
                "matched": False,
                "discrepancy_type": "UNPAID_OR_FAILED_PAYMENT",
                "exposure": invoice_amount,
                "message": f"Invoice of ₹{invoice_amount:,.2f} remains unpaid or failed."
            }

        diff = round(invoice_amount - payment_amount, 2)
        if abs(diff) > 1.0:
            return {
                "matched": False,
                "discrepancy_type": "PAYMENT_UNDERCOLLECTION",
                "exposure": diff if diff > 0 else 0.0,
                "message": f"Payment collected ₹{payment_amount:,.2f} for invoice ₹{invoice_amount:,.2f} leaves gap of ₹{diff:,.2f}."
            }

        return {"matched": True, "discrepancy_type": None, "exposure": 0.0}

    @staticmethod
    def reconcile_refund_eligibility(payment_amount: float, refund_amount: float) -> Dict[str, Any]:
        if refund_amount > payment_amount:
            excess = round(refund_amount - payment_amount, 2)
            return {
                "matched": False,
                "discrepancy_type": "EXCESSIVE_OR_DUPLICATE_REFUND",
                "exposure": excess,
                "message": f"Refund of ₹{refund_amount:,.2f} exceeds original paid amount ₹{payment_amount:,.2f} by ₹{excess:,.2f}."
            }
        return {"matched": True, "discrepancy_type": None, "exposure": 0.0}

    @staticmethod
    def reconcile_contract_drift(agreed_contract_amount: float, total_invoiced_amount: float, tolerance_pct: float = 5.0) -> Dict[str, Any]:
        """
        §7.1 & Hero Case 4: Contract vs Billed Drift Check
        Detects systematic underbilling across a customer contract period.
        """
        min_allowed = agreed_contract_amount * (1.0 - (tolerance_pct / 100.0))
        if total_invoiced_amount < min_allowed:
            exposure = round(agreed_contract_amount - total_invoiced_amount, 2)
            drift_pct = round(((agreed_contract_amount - total_invoiced_amount) / agreed_contract_amount) * 100, 1)
            return {
                "matched": False,
                "discrepancy_type": "CONTRACT_BILLED_DRIFT",
                "exposure": exposure,
                "drift_pct": drift_pct,
                "agreed_amount": agreed_contract_amount,
                "billed_amount": total_invoiced_amount,
                "message": f"Contract agreed ₹{agreed_contract_amount:,.2f} vs total billed ₹{total_invoiced_amount:,.2f} (Underbilled by ₹{exposure:,.2f} / {drift_pct}% drift)."
            }
        return {"matched": True, "discrepancy_type": None, "exposure": 0.0}

reconciliation_engine = ReconciliationEngine()
