import math
from datetime import datetime, timedelta
from typing import Dict, Any

class TemporalRevenueStateMachine:
    """
    Innovation 2: Temporal Revenue State Machine & SLA Grace-Period Transition (§7.2)
    Prevents false alarms during normal asynchronous ERP processing lag.
    Calculates time-decay leakage probability:
    P(Leakage | t) = 1 - exp(-lambda * (t - t_grace))
    """

    DEFAULT_GRACE_HOURS = {
        "STANDARD_ORDER_INVOICING": 24, # 24-hour billing job batch buffer
        "PAYMENT_SETTLEMENT": 48,       # 48-hour gateway settlement
        "CONTRACT_MILESTONE": 72,       # 72-hour contract reconciliation
    }

    LAMBDA_DECAY = 0.05 # Rate of leakage probability growth per hour after grace

    @classmethod
    def evaluate_temporal_state(cls, event_time: datetime, event_type: str = "STANDARD_ORDER_INVOICING") -> Dict[str, Any]:
        """
        Determines if an event is in GRACE_PERIOD, PENDING_INVESTIGATION, or LEAKAGE_CONFIRMED.
        """
        now = datetime.utcnow()
        elapsed_hours = max(0.0, (now - event_time).total_seconds() / 3600.0)
        grace_limit = cls.DEFAULT_GRACE_HOURS.get(event_type, 24)

        if elapsed_hours <= grace_limit:
            remaining_grace = round(grace_limit - elapsed_hours, 1)
            return {
                "state": "GRACE_PERIOD",
                "is_leakage": False,
                "elapsed_hours": round(elapsed_hours, 1),
                "grace_limit_hours": grace_limit,
                "leakage_probability": 0.05,
                "status_message": f"Within standard {grace_limit}h ERP sync window ({remaining_grace}h remaining)."
            }
        
        # Beyond SLA grace window -> calculate exponential time-decay leakage probability
        hours_overdue = elapsed_hours - grace_limit
        leak_prob = round(1.0 - math.exp(-cls.LAMBDA_DECAY * hours_overdue), 3)

        return {
            "state": "SLA_BREACH_LEAKAGE" if leak_prob > 0.70 else "PENDING_INVESTIGATION",
            "is_leakage": leak_prob > 0.70,
            "elapsed_hours": round(elapsed_hours, 1),
            "grace_limit_hours": grace_limit,
            "hours_overdue": round(hours_overdue, 1),
            "leakage_probability": leak_prob,
            "status_message": f"SLA breached by {round(hours_overdue, 1)} hours. Leakage confidence: {round(leak_prob*100, 1)}%."
        }

temporal_engine = TemporalRevenueStateMachine()
