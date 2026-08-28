import re
from datetime import datetime
from typing import Dict, Any, List, Optional
import pandas as pd

class DataNormalizationEngine:
    """
    §5 & §6 Raw Data Ingestion & Canonical Normalization Layer:
    Takes disparate raw company datasets (Salesforce Orders, NetSuite Invoices,
    Stripe Payments, Zendesk Support Tickets, CLM Contracts) and standardizes
    them into the unified Canonical Schema.
    """

    # Field mapping dictionary for various enterprise ERP/CRM schemas
    FIELD_SYNONYMS = {
        "order_id": ["order_id", "order_number", "id", "order_ref", "transaction_id", "po_number"],
        "customer_id": ["customer_id", "client_id", "account_id", "cust_id", "customer_number"],
        "order_amount": ["order_amount", "amount", "total", "subtotal", "order_total", "grand_total", "price"],
        "invoice_id": ["invoice_id", "inv_id", "bill_id", "invoice_number", "billing_ref"],
        "invoice_amount": ["invoice_amount", "inv_amount", "billed_amount", "invoice_total"],
        "payment_id": ["payment_id", "charge_id", "txn_id", "pay_id", "stripe_id"],
        "payment_amount": ["payment_amount", "paid_amount", "collected_amount", "settled_amount"],
        "discount_percent": ["discount_percent", "discount_pct", "discount", "disc_rate", "promo_pct"],
        "employee_id": ["employee_id", "rep_id", "sales_rep", "approver_id", "created_by_employee"],
        "order_date": ["order_date", "created_at", "date", "timestamp", "order_time"],
        "refund_amount": ["refund_amount", "refunded_amt", "credit_note_amount", "refund_val"]
    }

    @classmethod
    def map_raw_record(cls, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Maps a single raw company dictionary to canonical fields.
        """
        canonical = {}
        # Lowercase raw keys
        clean_raw = {k.lower().strip().replace("-", "_").replace(" ", "_"): v for k, v in raw_record.items()}

        for canonical_field, synonyms in cls.FIELD_SYNONYMS.items():
            for syn in synonyms:
                if syn in clean_raw and clean_raw[syn] is not None:
                    canonical[canonical_field] = clean_raw[syn]
                    break

        # Standardize numeric values
        for num_field in ["order_amount", "invoice_amount", "payment_amount", "discount_percent", "refund_amount"]:
            if num_field in canonical and canonical[num_field] is not None:
                try:
                    # Strip currency symbols if string e.g. "₹75,000" or "$1,200"
                    if isinstance(canonical[num_field], str):
                        clean_str = re.sub(r"[^\d.-]", "", canonical[num_field])
                        canonical[num_field] = float(clean_str)
                    else:
                        canonical[num_field] = float(canonical[num_field])
                except (ValueError, TypeError):
                    canonical[num_field] = 0.0

        # Standardize order status
        raw_status = str(clean_raw.get("status", clean_raw.get("order_status", "COMPLETED"))).upper()
        canonical["order_status"] = "COMPLETED" if "COMPLET" in raw_status or "FULFILL" in raw_status or "SUCCESS" in raw_status else raw_status

        # Standardize payment status
        pay_status = str(clean_raw.get("payment_status", "SUCCESS" if canonical.get("payment_amount", 0) > 0 else "PENDING")).upper()
        canonical["payment_status"] = "SUCCESS" if "SUCC" in pay_status or "PAID" in pay_status or "SETTL" in pay_status else ("FAILED" if "FAIL" in pay_status else "PENDING")

        return canonical

    @classmethod
    def normalize_batch(cls, raw_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes raw batch data and outputs cleaned canonical records.
        """
        return [cls.map_raw_record(r) for r in raw_data_list]

normalization_engine = DataNormalizationEngine()
