from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import RootCause, RevenueCase
from app.schemas import RootCauseResponseSchema, CaseResponseSchema

router = APIRouter()

@router.get("", response_model=List[RootCauseResponseSchema])
def get_root_causes(db: Session = Depends(get_db)):
    """
    §7.8 Root Cause View: List of clustered causes ranked by total financial exposure.
    """
    causes = db.query(RootCause).order_by(RootCause.total_exposure.desc()).all()
    return causes

@router.get("/analytics/dbscan-clustering")
def run_dbscan_clustering(db: Session = Depends(get_db)):
    """
    Innovation 3: Triggers DBSCAN density-based spatial clustering across all active cases.
    """
    from app.ml.clustering import density_clusterer
    from app.models import RevenueCase

    cases = db.query(RevenueCase).all()
    cases_data = [
        {
            "id": c.id,
            "entity_ref": c.entity_ref,
            "owner": c.owner,
            "category": c.category,
            "exposure_amt": c.exposure_amt,
            "recovery_probability": c.recovery_probability,
            "employee_id": c.evidence_data.get("employee_id", "EMP-UNKNOWN") if c.evidence_data else "EMP-UNKNOWN"
        }
        for c in cases
    ]
    return density_clusterer.cluster_cases(cases_data)

@router.get("/{cause_id}")
def get_root_cause_detail(cause_id: str, db: Session = Depends(get_db)):
    cause = db.query(RootCause).filter(RootCause.id == cause_id).first()
    if not cause:
        raise HTTPException(status_code=404, detail="Root Cause not found")

    linked_cases = db.query(RevenueCase).filter(RevenueCase.root_cause_id == cause_id).all()

    return {
        "root_cause": {
            "id": cause.id,
            "cause_type": cause.cause_type,
            "cause_key": cause.cause_key,
            "description": cause.description,
            "case_count": cause.case_count,
            "total_exposure": cause.total_exposure,
            "first_seen": cause.first_seen,
            "last_seen": cause.last_seen,
            "immunization_rule": cause.immunization_rule,
            "implementation_difficulty": cause.implementation_difficulty,
            "early_warning_trend": cause.early_warning_trend
        },
        "linked_cases": [
            {
                "id": c.id,
                "title": c.title,
                "exposure_amt": c.exposure_amt,
                "expected_recovery": c.expected_recovery,
                "status": c.status,
                "opened_at": c.opened_at,
                "case_aging_days": c.case_aging_days,
                "evidence_data": c.evidence_data
            }
            for c in linked_cases
        ]
    }
