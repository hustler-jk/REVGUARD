import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.reconciliation import reconciliation_engine
from app.services.rules import rule_engine
from app.services.financial import financial_engine
from app.services.audit import audit_service
from app.ml.anomaly_model import anomaly_detector
from app.ml.churn_model import churn_model


def test_reconciliation_order_invoice():
    # Missing invoice
    res = reconciliation_engine.reconcile_order_invoice(75000.0, 0.0, None)
    assert res["matched"] is False
    assert res["discrepancy_type"] == "MISSING_INVOICE"
    assert res["exposure"] == 75000.0

    # Invoice mismatch
    res2 = reconciliation_engine.reconcile_order_invoice(10000.0, 0.0, 8000.0)
    assert res2["matched"] is False
    assert res2["discrepancy_type"] == "INVOICE_AMOUNT_MISMATCH"
    assert res2["exposure"] == 2000.0

def test_contract_drift_hero_case_4():
    # Agreed 6,00,000 vs Billed 4,80,000
    res = reconciliation_engine.reconcile_contract_drift(600000.0, 480000.0, tolerance_pct=5.0)
    assert res["matched"] is False
    assert res["discrepancy_type"] == "CONTRACT_BILLED_DRIFT"
    assert res["exposure"] == 120000.0
    assert res["drift_pct"] == 20.0

def test_employee_discount_rule_hero_case_2():
    order = {
        "order_id": "ORD-EMP402-001",
        "customer_id": "CUST-103",
        "order_amount": 20000.0,
        "discount_percent": 30.0,
        "employee_id": "EMP-402"
    }
    res = rule_engine.evaluate_order(order)
    assert res is not None
    assert res["category"] == "FINANCIAL_LEAKAGE"
    assert res["owner"] == "Company-Side"
    # Excess discount = 30% - 15% = 15% of 20,000 = 3,000
    assert res["exposure_amt"] == 3000.0

def test_early_warning_slope_calculation():
    # Weekly deviations: 5%, 16%, 28%, 38%
    res = anomaly_detector.compute_employee_risk_slope([5.0, 16.0, 28.0, 38.0])
    assert res["is_emerging_risk"] is True
    assert "Week 2" in res["flag_week"]

def test_churn_and_shap_model():
    pred = churn_model.predict_customer({
        "payment_failure_count": 3,
        "overdue_invoice_days": 45.0,
        "support_escalation_count": 4,
        "contract_tenure_months": 6.0,
        "order_velocity_pct_change": -40.0
    })
    assert pred["churn_probability"] > 0.60
    assert pred["risk_tier"] == "HIGH"
    assert len(pred["shap_factors"]) > 0

def test_financial_engine_calculations():
    rec = financial_engine.calculate_expected_recovery(100000.0, "MISSING_INVOICE")
    assert rec["expected_recovery"] == 85000.0  # 85% lookup baseline

    score = financial_engine.calculate_escalation_score(75000.0, case_aging_days=14)
    assert score["total_score"] > 50.0

def test_audit_log_record_and_verify():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        entry = audit_service.record_action(
            db=db,
            case_id="TEST-CASE-001",
            action="CONFIRM_LEAKAGE",
            reviewer_id="test_auditor",
            previous_status="VALIDATED",
            new_status="CONFIRMED",
            notes="Test audit log creation."
        )
        assert entry.id is not None
        assert len(entry.current_hash) == 64

        verify_res = audit_service.verify_integrity(db)
        assert verify_res["is_valid"] is True
    finally:
        db.close()

def test_policy_persistence_in_db():
    from app.database import SessionLocal, engine, Base
    import app.models
    Base.metadata.create_all(bind=engine)
    from app.models import EnterprisePolicy
    db = SessionLocal()
    try:
        policy = db.query(EnterprisePolicy).filter(EnterprisePolicy.policy_name == "DEFAULT_ENTERPRISE_POLICY").first()
        if not policy:
            policy = EnterprisePolicy(policy_name="DEFAULT_ENTERPRISE_POLICY", max_authorized_discount_pct=14.0)
            db.add(policy)
            db.commit()
            db.refresh(policy)
        else:
            policy.max_authorized_discount_pct = 14.0
            db.commit()

        fetched = db.query(EnterprisePolicy).filter(EnterprisePolicy.policy_name == "DEFAULT_ENTERPRISE_POLICY").first()
        assert fetched.max_authorized_discount_pct == 14.0
    finally:
        db.close()

