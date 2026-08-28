from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
)
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    segment = Column(String(64), default="Enterprise")  # Enterprise, Mid-Market, SMB
    status = Column(String(32), default="ACTIVE")  # ACTIVE, CHURN_RISK, CHURNED
    lifetime_revenue = Column(Float, default=0.0)
    churn_probability = Column(Float, default=0.0)
    revenue_at_risk = Column(Float, default=0.0)
    shap_factors = Column(JSON, default=list)  # Top risk factors with attribution weights
    created_at = Column(DateTime, default=datetime.utcnow)

class Contract(Base):
    __tablename__ = "contracts"

    contract_id = Column(String(64), primary_key=True, index=True)
    customer_id = Column(String(64), ForeignKey("customers.customer_id"), index=True)
    agreed_amount = Column(Float, nullable=False)
    terms = Column(String(255), default="Annual Pre-Paid")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(32), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

class CanonicalOrder(Base):
    __tablename__ = "orders_canonical"

    order_id = Column(String(64), primary_key=True, index=True)
    customer_id = Column(String(64), index=True)
    contract_id = Column(String(64), nullable=True, index=True)
    order_date = Column(DateTime, default=datetime.utcnow)
    order_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    order_status = Column(String(32), default="COMPLETED")  # COMPLETED, PENDING, CANCELLED
    
    # Billing & Invoice
    invoice_id = Column(String(64), nullable=True, index=True)
    invoice_amount = Column(Float, nullable=True)
    invoice_status = Column(String(32), nullable=True)  # ISSUED, PAID, OVERDUE, UNBILLED
    invoice_issued_at = Column(DateTime, nullable=True)
    
    # Payments & Collections
    payment_id = Column(String(64), nullable=True, index=True)
    payment_amount = Column(Float, nullable=True)
    payment_status = Column(String(32), nullable=True)  # SUCCESS, FAILED, RETRYING
    payment_attempts = Column(Integer, default=1)
    
    # Refunds & Discounts
    refund_id = Column(String(64), nullable=True)
    refund_amount = Column(Float, default=0.0)
    discount_percent = Column(Float, default=0.0)
    employee_id = Column(String(64), nullable=True, index=True)
    
    # Dimensions for Heatmap & Analytics
    region = Column(String(64), default="North America")
    product_line = Column(String(64), default="Cloud Platform")
    channel = Column(String(64), default="Direct Sales")
    notes = Column(Text, nullable=True)

class RootCause(Base):
    __tablename__ = "root_causes"

    id = Column(String(64), primary_key=True, index=True)  # e.g., "RC-EMP-402"
    cause_type = Column(String(64), nullable=False)  # EMPLOYEE_OVERRIDE, WORKFLOW_TIMEOUT, INTEGRATION_LAG
    cause_key = Column(String(128), nullable=False)  # e.g., "EMP-402" or "BILLING_WEBHOOK"
    description = Column(String(255), nullable=False)
    case_count = Column(Integer, default=0)
    total_exposure = Column(Float, default=0.0)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    immunization_rule = Column(Text, nullable=True)
    implementation_difficulty = Column(String(32), default="Low")  # Low, Medium, High
    early_warning_trend = Column(JSON, default=dict)  # {"weeks": ["W1","W2","W3","W4"], "scores": [5, 15, 40, 78]}
    created_at = Column(DateTime, default=datetime.utcnow)

class RevenueCase(Base):
    __tablename__ = "revenue_cases"

    id = Column(String(64), primary_key=True, index=True)  # e.g., "CASE-1001"
    case_number = Column(Integer, autoincrement=True, unique=True)
    title = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False)  # FINANCIAL_LEAKAGE, PROCESS_LEAKAGE, INTEGRATION_LEAKAGE, REVENUE_AT_RISK, NORMAL
    status = Column(String(32), default="VALIDATED")  # OPEN, VALIDATED, CONFIRMED, RECOVERED, REJECTED, CLOSED
    owner = Column(String(32), default="Company-Side")  # Company-Side, Customer-Side
    entity_ref = Column(String(64), nullable=False)  # Order ID, Customer ID, Contract ID
    root_cause_id = Column(String(64), ForeignKey("root_causes.id"), nullable=True, index=True)
    
    # Financial Quantification (Deterministic)
    exposure_amt = Column(Float, default=0.0)
    recoverable_amt = Column(Float, default=0.0)
    recovery_probability = Column(Float, default=0.60)
    expected_recovery = Column(Float, default=0.0)
    
    # Scoring & Aging
    confidence = Column(Float, default=0.92)
    escalation_score = Column(Float, default=0.0)
    case_aging_days = Column(Integer, default=0)
    opened_at = Column(DateTime, default=datetime.utcnow)
    
    # Enterprise Multi-Level Approval Hierarchy
    approval_stage = Column(String(32), default="STAGE_1_REVIEW")  
    # STAGE_1_TRIAGE (Analyst), STAGE_2_OPS_ENDORSED (Ops/Manager), STAGE_3_CFO_APPROVED (CFO Final)
    endorsed_by = Column(String(128), nullable=True)
    approved_by = Column(String(128), nullable=True)
    approval_history = Column(JSON, default=list)  # [{"stage": "Level 1", "actor": "Marcus Vance", "action": "Endorsed", "timestamp": "..."}]
    
    # Structured JSON Payloads
    reason_codes = Column(JSON, default=list)  # e.g. ["RULE_MISSING_INVOICE", "POLICY_TIMEOUT"]

    evidence_data = Column(JSON, default=dict)  # Mismatched order, contract, payment attributes
    risk_breakdown = Column(JSON, default=dict)  # {"impact": 40, "frequency": 25, "urgency": 20, "pattern": 15}
    suggested_immunization = Column(JSON, default=dict)  # {"control": "Add 24h ERP reconciliation trigger"}
    graph_payload = Column(JSON, default=dict)  # Node & edge graph for visual traversal
    
    # Hero Flag for easy pitch demo filtering
    is_hero = Column(Boolean, default=False)
    hero_case_number = Column(Integer, nullable=True)  # 1, 2, 3, 4
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(64), nullable=False, index=True)
    reviewer_id = Column(String(64), default="finance_lead_demo")
    action = Column(String(64), nullable=False)  # CONFIRM, REJECT, ESCALATE, IMMUNIZE, RECOVER
    timestamp = Column(DateTime, default=datetime.utcnow)
    previous_status = Column(String(32), nullable=True)
    new_status = Column(String(32), nullable=True)
    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False)
    notes = Column(Text, nullable=True)

class GroundTruth(Base):
    __tablename__ = "ground_truth"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(String(64), unique=True, index=True)
    actual_problem = Column(String(128), nullable=False)
    problem_type = Column(String(64), nullable=False)  # FINANCIAL_LEAKAGE, PROCESS_LEAKAGE, NORMAL, etc.
    actual_exposure = Column(Float, default=0.0)
    is_true_leakage = Column(Boolean, default=True)
    shared_root_cause = Column(String(128), nullable=True)

class EnterprisePolicy(Base):
    __tablename__ = "enterprise_policies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    policy_name = Column(String(64), default="DEFAULT_ENTERPRISE_POLICY", unique=True, index=True)
    max_authorized_discount_pct = Column(Float, default=15.0)
    invoice_grace_days_limit = Column(Integer, default=5)
    dunning_max_retries = Column(Integer, default=3)
    sla_decay_lambda = Column(Float, default=0.05)
    dual_signoff_threshold_inr = Column(Float, default=50000.0)
    auto_escalate_cfo_threshold_inr = Column(Float, default=100000.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

