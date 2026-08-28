import hashlib
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models import AuditLog

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class AuditLogService:
    """
    §13 Tamper-Evident Hash-Chained Audit Logging Service
    Cryptographically links audit records with SHA-256 hashes.
    Ensures complete, immutable review history for financial auditors.
    """

    @staticmethod
    def calculate_hash(
        previous_hash: str,
        case_id: str,
        reviewer_id: str,
        action: str,
        previous_status: Optional[str],
        new_status: Optional[str],
        timestamp_str: str,
        notes: Optional[str] = ""
    ) -> str:
        payload = f"{previous_hash}|{case_id}|{reviewer_id}|{action}|{previous_status}|{new_status}|{timestamp_str}|{notes or ''}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @classmethod
    def record_action(
        cls,
        db: Session,
        case_id: str,
        action: str,
        reviewer_id: str,
        previous_status: Optional[str],
        new_status: Optional[str],
        notes: Optional[str] = None
    ) -> AuditLog:
        # Fetch the latest audit record to get previous_hash
        last_record = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
        prev_hash = last_record.current_hash if last_record else GENESIS_HASH

        now = datetime.utcnow()
        timestamp_str = now.isoformat()
        current_hash = cls.calculate_hash(
            previous_hash=prev_hash,
            case_id=case_id,
            reviewer_id=reviewer_id,
            action=action,
            previous_status=previous_status,
            new_status=new_status,
            timestamp_str=timestamp_str,
            notes=notes
        )

        entry = AuditLog(
            case_id=case_id,
            reviewer_id=reviewer_id,
            action=action,
            timestamp=now,
            previous_status=previous_status,
            new_status=new_status,
            previous_hash=prev_hash,
            current_hash=current_hash,
            notes=notes
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @classmethod
    def log_action(
        cls,
        db: Session,
        case_id: str,
        action: str,
        reviewer_id: str,
        previous_status: Optional[str] = None,
        new_status: Optional[str] = None,
        notes: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Alias for record_action with support for optional details dict."""
        note_str = notes or (str(details) if details else "")
        return cls.record_action(
            db=db,
            case_id=case_id,
            action=action,
            reviewer_id=reviewer_id,
            previous_status=previous_status,
            new_status=new_status,
            notes=note_str
        )

    @classmethod
    def verify_integrity(cls, db: Session) -> Dict[str, Any]:
        """
        Validates that no historical log entry has been tampered with or modified.
        """
        logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
        if not logs:
            return {"status": "SECURE", "verified_count": 0, "is_valid": True, "tampered_at_id": None}

        expected_prev = GENESIS_HASH
        for log in logs:
            if log.previous_hash != expected_prev:
                return {
                    "status": "TAMPERED",
                    "is_valid": False,
                    "tampered_at_id": log.id,
                    "message": f"Broken hash chain at Audit Record #{log.id}."
                }
            
            # Recalculate hash
            recalc = cls.calculate_hash(
                previous_hash=log.previous_hash,
                case_id=log.case_id,
                reviewer_id=log.reviewer_id,
                action=log.action,
                previous_status=log.previous_status,
                new_status=log.new_status,
                timestamp_str=log.timestamp.isoformat(),
                notes=log.notes
            )
            # Compare
            if recalc != log.current_hash:
                return {
                    "status": "TAMPERED",
                    "is_valid": False,
                    "tampered_at_id": log.id,
                    "message": f"Hash mismatch at Audit Record #{log.id}. Stored hash does not match computed payload."
                }
            expected_prev = log.current_hash

        return {
            "status": "VERIFIED_SECURE",
            "is_valid": True,
            "verified_count": len(logs),
            "latest_hash": logs[-1].current_hash if logs else GENESIS_HASH,
            "message": "All audit log entries cryptographically verified. Zero tampering detected."
        }

audit_service = AuditLogService()
