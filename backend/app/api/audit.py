from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditLog
from app.schemas import AuditLogResponseSchema
from app.services.audit import audit_service

router = APIRouter()

@router.get("", response_model=List[AuditLogResponseSchema])
def get_audit_logs(db: Session = Depends(get_db)):
    """
    Returns the complete tamper-evident audit history.
    """
    return db.query(AuditLog).order_by(AuditLog.id.desc()).all()

@router.get("/verify")
def verify_audit_trail_integrity(db: Session = Depends(get_db)):
    """
    Cryptographically verifies the entire SHA-256 hash chain.
    """
    res = audit_service.verify_integrity(db)
    return res
