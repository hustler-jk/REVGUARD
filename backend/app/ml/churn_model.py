import numpy as np
import pandas as pd
from typing import List, Dict, Any
from sklearn.linear_model import LogisticRegression

class ChurnModel:
    def __init__(self):
        self.model = LogisticRegression(max_iter=500, random_state=42)
        self.is_fitted = False
        self.feature_names = [
            "payment_failure_count",
            "overdue_invoice_days",
            "support_escalation_count",
            "contract_tenure_months",
            "order_velocity_pct_change"
        ]
        self.feature_labels = {
            "payment_failure_count": "Payment Retry Failures",
            "overdue_invoice_days": "Invoice Payment Overdue Days",
            "support_escalation_count": "Support Ticket Escalations",
            "contract_tenure_months": "Contract Tenure (Loyalty)",
            "order_velocity_pct_change": "Order Volume Velocity Drop"
        }

    def train_baseline(self):
        """
        Train on synthetic baseline customer risk patterns.
        """
        # Synthetic training data representing real SaaS churn behaviors
        np.random.seed(42)
        n_samples = 400
        
        # Features
        payment_failures = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.6, 0.2, 0.1, 0.06, 0.04])
        overdue_days = np.random.exponential(scale=10, size=n_samples)
        support_escalations = np.random.poisson(lam=1.2, size=n_samples)
        contract_tenure = np.random.uniform(1, 48, size=n_samples)
        velocity_change = np.random.normal(loc=-5.0, scale=20.0, size=n_samples)

        X = np.column_stack([
            payment_failures,
            overdue_days,
            support_escalations,
            contract_tenure,
            velocity_change
        ])

        # Churn probability log-odds formula
        log_odds = (
            -2.0
            + 0.85 * payment_failures
            + 0.04 * overdue_days
            + 0.45 * support_escalations
            - 0.03 * contract_tenure
            - 0.02 * velocity_change
        )
        probs = 1 / (1 + np.exp(-log_odds))
        y = (probs > 0.45).astype(int)

        self.model.fit(X, y)
        self.feature_means = np.mean(X, axis=0)
        self.is_fitted = True

    def predict_customer(self, customer_features: Dict[str, float]) -> Dict[str, Any]:
        """
        Evaluates Layer D Customer Churn Probability and exact closed-form SHAP feature attributions:
        phi_i = beta_i * (x_i - x_bar_i)
        
        Business Assumption: Near-term 90-day Revenue at Risk is calculated as:
        Revenue_at_Risk = Lifetime_Revenue * 0.25 * P(Churn)
        (Assumes ~25% of trailing lifetime value represents near-term annual renewal exposure).
        """
        if not self.is_fitted:
            self.train_baseline()

        x = np.array([[
            customer_features.get("payment_failure_count", 0.0),
            customer_features.get("overdue_invoice_days", 0.0),
            customer_features.get("support_escalation_count", 0.0),
            customer_features.get("contract_tenure_months", 12.0),
            customer_features.get("order_velocity_pct_change", 0.0)
        ]])

        churn_prob = float(self.model.predict_proba(x)[0][1])
        
        # Calculate exact closed-form linear SHAP: beta_i * (x_i - mean_i)
        coefficients = self.model.coef_[0]
        feature_attributions = []
        for i, feat in enumerate(self.feature_names):
            val = x[0][i]
            baseline_val = self.feature_means[i] if hasattr(self, "feature_means") else 0.0
            contrib = float(coefficients[i] * (val - baseline_val))
            feature_attributions.append({
                "feature": feat,
                "label": self.feature_labels[feat],
                "value": round(float(val), 2),
                "baseline_mean": round(float(baseline_val), 2),
                "impact_score": round(contrib, 3),
                "direction": "RISK_INCREASE" if contrib > 0 else "RISK_DECREASE"
            })

        # Sort by absolute impact
        feature_attributions.sort(key=lambda x: abs(x["impact_score"]), reverse=True)

        return {
            "churn_probability": round(churn_prob, 3),
            "risk_tier": "HIGH" if churn_prob > 0.65 else ("MEDIUM" if churn_prob > 0.35 else "LOW"),
            "shap_factors": feature_attributions,
            "assumed_near_term_risk_factor": "25% of trailing lifetime value"
        }

churn_model = ChurnModel()
