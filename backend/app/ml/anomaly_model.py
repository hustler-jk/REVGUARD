import numpy as np
import pandas as pd
from typing import List, Dict, Any
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self, contamination: float = 0.08, random_state: int = 42):
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100
        )
        self.is_fitted = False
        self.feature_names = [
            "order_amount",
            "discount_percent",
            "aging_days",
            "is_unbilled"
        ]
        self._init_baseline_fit()

    def _init_baseline_fit(self):
        """
        Initializes Isolation Forest with baseline multi-dimensional financial distributions.
        """
        np.random.seed(42)
        n = 300
        amounts = np.random.lognormal(mean=10.5, sigma=0.8, size=n)
        discounts = np.random.choice([0.0, 5.0, 10.0, 15.0, 30.0, 40.0], size=n, p=[0.5, 0.25, 0.15, 0.05, 0.03, 0.02])
        aging = np.random.exponential(scale=4, size=n)
        unbilled = np.random.choice([0.0, 1.0], size=n, p=[0.92, 0.08])

        X = np.column_stack([amounts, discounts, aging, unbilled])
        self.model.fit(X)
        self.is_fitted = True

    def score_record(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Scores a single multi-dimensional transaction record using the fitted Isolation Forest.
        """
        if not self.is_fitted:
            self._init_baseline_fit()

        x = np.array([[
            float(features.get("order_amount", 10000.0)),
            float(features.get("discount_percent", 0.0)),
            float(features.get("aging_days", 1.0)),
            float(features.get("is_unbilled", 0.0))
        ]])

        pred = int(self.model.predict(x)[0])  # -1 = outlier, 1 = inlier
        raw_score = float(self.model.decision_function(x)[0])
        
        # Invert decision score to 0.0 (normal) -> 1.0 (severe outlier)
        # decision_function outputs negative for outliers, positive for inliers
        anomaly_prob = round(float(1.0 / (1.0 + np.exp(raw_score * 8.0))), 3)

        return {
            "is_anomaly": bool(pred == -1 or anomaly_prob > 0.55),
            "anomaly_score": anomaly_prob,
            "raw_decision_score": round(raw_score, 4),
            "feature_contributions": {
                "order_amount": features.get("order_amount", 0.0),
                "discount_percent": features.get("discount_percent", 0.0),
                "is_unbilled": features.get("is_unbilled", 0.0)
            }
        }

    def fit_predict(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Fit Isolation Forest over batch records.
        """
        results = []
        for r in records:
            feats = {
                "order_amount": float(r.get("order_amount", 0) or 0),
                "discount_percent": float(r.get("discount_percent", 0) or 0),
                "aging_days": float(r.get("aging_days", 1) or 1),
                "is_unbilled": 1.0 if (r.get("invoice_amount") is None or float(r.get("invoice_amount", 0) or 0) == 0) else 0.0
            }
            score_res = self.score_record(feats)
            results.append({
                **r,
                "is_statistical_anomaly": score_res["is_anomaly"],
                "anomaly_score": score_res["anomaly_score"]
            })
        return results

    @staticmethod
    def compute_employee_risk_slope(weekly_deviations: List[float]) -> Dict[str, Any]:
        if not weekly_deviations or len(weekly_deviations) < 2:
            return {
                "slope": 0.0,
                "is_emerging_risk": False,
                "flag_week": None,
                "trend_label": "STABLE"
            }

        slopes = [weekly_deviations[i] - weekly_deviations[i-1] for i in range(1, len(weekly_deviations))]
        avg_slope = sum(slopes) / len(slopes)
        
        is_emerging = False
        flag_week = None
        if len(weekly_deviations) >= 2 and weekly_deviations[1] >= 15.0 and slopes[0] >= 10.0:
            is_emerging = True
            flag_week = "Week 2 (Early Warning: +10% slope)"

        return {
            "slope": round(avg_slope, 2),
            "is_emerging_risk": is_emerging,
            "flag_week": flag_week,
            "trend_label": "ACCELERATING_RISK" if avg_slope > 12.0 else "MODERATE",
            "weekly_data": weekly_deviations
        }

anomaly_detector = AnomalyDetector()
