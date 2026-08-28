import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "REVGUARD - Revenue Leakage Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/revguard"
    )
    SQLITE_FALLBACK_URL: str = "sqlite:///./revguard.db"
    
    # Financial thresholds
    MAX_DISCOUNT_PERCENT_POLICY: float = 15.0
    INVOICE_GRACE_DAYS: int = 3
    CONTRACT_DRIFT_TOLERANCE_PCT: float = 5.0
    PAYMENT_OVERDUE_DAYS: int = 30
    
    # Recovery probability lookup table (configurable baselines)
    RECOVERY_PROB_MAP: dict = {
        "MISSING_INVOICE": 0.85,
        "OVERDUE_PAYMENT": 0.65,
        "DUPLICATE_REFUND": 0.80,
        "UNAUTHORIZED_DISCOUNT": 0.40,
        "CONTRACT_DRIFT": 0.75,
        "INVOICE_MISMATCH": 0.70,
        "PAYMENT_MISMATCH": 0.60,
        "FAILED_RENEWAL": 0.50,
        "DEFAULT": 0.60,
    }

settings = Settings()
