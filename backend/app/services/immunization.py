from typing import Dict, Any

class ImmunizationEngine:
    """
    §8.6 Leak Immunization Engine
    Pairs with Root-Cause Clustering to deliver proactive prevention suggestions
    instead of just reactive flagging.
    """

    PREVENTION_CATALOG = {
        "RULE_UNAUTHORIZED_DISCOUNT_OVERRIDE": {
            "title": "Dual Approval Policy Guardrail",
            "control": "Enforce automated ERP workflow rule: Discounts >15% require secondary finance director sign-off in CPQ/CRM.",
            "difficulty": "Low",
            "estimated_mitigation": "100% elimination of unauthorized employee discount overrides",
            "system_target": "Salesforce CRM / NetSuite CPQ"
        },
        "RULE_MISSING_INVOICE_ON_COMPLETED_ORDER": {
            "title": "T+24h Fulfillment-to-Billing Auto-Sync",
            "control": "Add scheduled reconciliation check between Order.status == 'COMPLETED' and Invoice existence at T+24h with auto-drafting.",
            "difficulty": "Low",
            "estimated_mitigation": "99.4% reduction in missing invoice process leakage",
            "system_target": "ERP Billing Webhook / SAP Order Management"
        },
        "RULE_CONTRACT_BILLED_DRIFT": {
            "title": "Contract Schedule Schedule Sync Validator",
            "control": "Implement automated contract milestone billing validation that alerts account managers 30 days prior to contract anniversary if cumulative billing < 95% of committed ARR.",
            "difficulty": "Medium",
            "estimated_mitigation": "100% elimination of unbilled contract commitments",
            "system_target": "Contract Lifecycle Management (CLM) / Billing Engine"
        },
        "RULE_EXCESSIVE_REFUND_OVER_PAYMENT": {
            "title": "Gateway Refund Cap Enforcement",
            "control": "Configure payment gateway / Stripe rule blocking refund issuances that exceed original settled transaction amount.",
            "difficulty": "Low",
            "estimated_mitigation": "100% elimination of duplicate/excess refunds",
            "system_target": "Payment Gateway API / Ledger"
        },
        "RULE_DUNNING_PAYMENT_RETRIES_EXHAUSTED": {
            "title": "Smart Smart Dunning & Card Account Updater",
            "control": "Activate Visa/Mastercard Account Updater for auto-refreshing expired tokens + SMS/Email fallback payment links after Retry #2.",
            "difficulty": "Medium",
            "estimated_mitigation": "45% recovery improvement on involuntary payment churn",
            "system_target": "Stripe Billing / Adyen Dunning Engine"
        },
        "DEFAULT": {
            "title": "Automated Cross-System Reconciliation Guardrail",
            "control": "Implement continuous hourly cross-system reconciliation job between CRM, Billing, and Banking systems.",
            "difficulty": "Low",
            "estimated_mitigation": "80% reduction in data drift leakage",
            "system_target": "REVGUARD Engine"
        }
    }

    @classmethod
    def get_suggestion_for_rule(cls, rule_name: str) -> Dict[str, Any]:
        return cls.PREVENTION_CATALOG.get(rule_name, cls.PREVENTION_CATALOG["DEFAULT"])

    @classmethod
    def get_suggestion_for_root_cause(cls, cause_type: str, cause_key: str) -> Dict[str, Any]:
        if "EMP" in cause_key or cause_type == "EMPLOYEE_OVERRIDE":
            return cls.PREVENTION_CATALOG["RULE_UNAUTHORIZED_DISCOUNT_OVERRIDE"]
        elif "WEBHOOK" in cause_key or cause_type == "WORKFLOW_TIMEOUT":
            return cls.PREVENTION_CATALOG["RULE_MISSING_INVOICE_ON_COMPLETED_ORDER"]
        elif "CONTRACT" in cause_type:
            return cls.PREVENTION_CATALOG["RULE_CONTRACT_BILLED_DRIFT"]
        return cls.PREVENTION_CATALOG["DEFAULT"]

immunization_engine = ImmunizationEngine()
