from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class RiskBreakdownSchema(BaseModel):
    financial_impact: float = 0.0
    frequency: float = 0.0
    urgency: float = 0.0
    pattern_severity: float = 0.0
    case_aging: float = 0.0
    total: float = 0.0

class SuggestedImmunizationSchema(BaseModel):
    title: str
    control: str
    difficulty: str = "Low"
    estimated_mitigation: str = "100% recurrence elimination"

class CaseResponseSchema(BaseModel):
    id: str
    case_number: Optional[int] = None
    title: str
    category: str
    status: str
    owner: str
    entity_ref: str
    root_cause_id: Optional[str] = None
    exposure_amt: float
    recoverable_amt: float
    recovery_probability: float
    expected_recovery: float
    confidence: float
    escalation_score: float
    case_aging_days: int
    opened_at: datetime
    approval_stage: Optional[str] = "STAGE_1_REVIEW"
    endorsed_by: Optional[str] = None
    approved_by: Optional[str] = None
    approval_history: List[Dict[str, Any]] = []
    reason_codes: List[str] = []
    evidence_data: Dict[str, Any] = {}
    risk_breakdown: Dict[str, Any] = {}
    suggested_immunization: Dict[str, Any] = {}
    graph_payload: Dict[str, Any] = {}
    is_hero: bool = False
    hero_case_number: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RootCauseResponseSchema(BaseModel):
    id: str
    cause_type: str
    cause_key: str
    description: str
    case_count: int
    total_exposure: float
    first_seen: datetime
    last_seen: datetime
    immunization_rule: Optional[str] = None
    implementation_difficulty: str
    early_warning_trend: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerResponseSchema(BaseModel):
    customer_id: str
    name: str
    segment: str
    status: str
    lifetime_revenue: float
    churn_probability: float
    revenue_at_risk: float
    shap_factors: List[Dict[str, Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewActionRequest(BaseModel):
    action: str  # ENDORSE_TO_CFO, CFO_SIGN_OFF, REJECT, ESCALATE, RECOVER
    reviewer_id: str = "cfo_demo"
    reviewer_name: str = "Sarah Jenkins"
    reviewer_role: str = "CFO"
    notes: Optional[str] = None


class AuditLogResponseSchema(BaseModel):
    id: int
    case_id: str
    reviewer_id: str
    action: str
    timestamp: datetime
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    previous_hash: str
    current_hash: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class DashboardSummarySchema(BaseModel):
    total_exposure: float
    probable_leakage: float
    recoverable_amount: float
    expected_recovery: float
    revenue_at_risk_90d: float
    total_cases_count: int
    active_cases_count: int
    recovered_amount_to_date: float
    funnel: Dict[str, float]
    categories: Dict[str, float]
    monthly_trend: List[Dict[str, Any]]
    cost_of_inaction_projection: Dict[str, Any]
    heatmap_dimensions: List[Dict[str, Any]]
    model_confidence: Dict[str, Any]
    evaluation_metrics: Dict[str, Any]
