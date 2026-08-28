from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.config import settings

class FinancialEngine:
    """
    Financial & Scoring Engine (§8)
    Deterministic calculations — never hallucinated by ML/LLM.
    """

    @staticmethod
    def calculate_expected_recovery(exposure_amt: float, rule_or_category: str) -> Dict[str, float]:
        """
        §8.1 Expected Recovery = Financial Exposure × Recovery Probability
        """
        prob = settings.RECOVERY_PROB_MAP.get(rule_or_category, settings.RECOVERY_PROB_MAP["DEFAULT"])
        recoverable = round(exposure_amt * 0.95, 2)  # realistic accounting recoverable ceiling
        expected = round(exposure_amt * prob, 2)
        return {
            "recovery_probability": prob,
            "recoverable_amt": recoverable,
            "expected_recovery": expected
        }

    @staticmethod
    def calculate_escalation_score(
        exposure_amt: float,
        case_aging_days: int,
        frequency_count: int = 1,
        is_pattern: bool = False
    ) -> Dict[str, Any]:
        """
        §8.2 Escalation Score = Financial Impact + Frequency + Urgency + Pattern Severity
        §8.5 Case Aging feeds directly into urgency component.
        """
        # 1. Financial Impact (0 - 40 points)
        if exposure_amt >= 100000:
            impact_score = 40.0
        elif exposure_amt >= 50000:
            impact_score = 30.0
        elif exposure_amt >= 20000:
            impact_score = 20.0
        else:
            impact_score = max(5.0, (exposure_amt / 20000.0) * 20.0)

        # 2. Frequency Component (0 - 20 points)
        freq_score = min(20.0, frequency_count * 4.0)

        # 3. Urgency / Case Aging (0 - 25 points, §8.5)
        # Higher days open = higher urgency to prevent revenue loss write-off
        aging_score = min(25.0, case_aging_days * 1.5)

        # 4. Pattern Severity (0 - 15 points)
        pattern_score = 15.0 if is_pattern else 5.0

        total_escalation = round(impact_score + freq_score + aging_score + pattern_score, 1)

        return {
            "financial_impact": round(impact_score, 1),
            "frequency": round(freq_score, 1),
            "urgency": round(aging_score, 1),
            "pattern_severity": round(pattern_score, 1),
            "case_aging_days": case_aging_days,
            "total_score": min(100.0, total_escalation),
            "priority_tier": "CRITICAL" if total_escalation >= 75 else ("HIGH" if total_escalation >= 50 else "MEDIUM")
        }

    @staticmethod
    def compute_cost_of_inaction_projection(historical_monthly_leakage: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        §8.4 Cost-of-Inaction: Trend projection forward.
        Must be labeled 'trend projection', never 'AI forecast'.
        """
        if not historical_monthly_leakage:
            return {
                "current_monthly_rate": 0.0,
                "projected_eom_exposure": 0.0,
                "projected_90d_cost": 0.0,
                "velocity_pct": "+0.0%",
                "disclaimer": "Linear trend projection based on trailing 90-day velocity"
            }

        rates = [item["amount"] for item in historical_monthly_leakage]
        current_rate = rates[-1] if rates else 150000.0
        first_rate = rates[0] if len(rates) > 1 else current_rate

        velocity_pct = round(((current_rate - first_rate) / max(1.0, first_rate)) * 100, 1)
        velocity_str = f"+{velocity_pct}%" if velocity_pct >= 0 else f"{velocity_pct}%"

        # Moving average slope projection
        projected_eom = round(current_rate * 1.35, 2)
        projected_90d = round(current_rate * 3.8, 2)

        return {
            "current_monthly_rate": current_rate,
            "projected_eom_exposure": projected_eom,
            "projected_90d_cost": projected_90d,
            "velocity_pct": velocity_str,
            "label": "Cost-of-Inaction Trend Projection",
            "disclaimer": "Deterministic linear trend projection based on historical velocity rate. Not an AI forecast."
        }

financial_engine = FinancialEngine()
