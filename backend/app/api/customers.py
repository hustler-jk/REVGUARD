from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Customer, Contract, CanonicalOrder
from app.schemas import CustomerResponseSchema

router = APIRouter()

@router.get("", response_model=List[CustomerResponseSchema])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.revenue_at_risk.desc()).all()

@router.get("/{customer_id}/risk")
def get_customer_risk_profile(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    contracts = db.query(Contract).filter(Contract.customer_id == customer_id).all()
    orders = db.query(CanonicalOrder).filter(CanonicalOrder.customer_id == customer_id).all()

    return {
        "customer": customer,
        "contracts": contracts,
        "recent_orders": orders[:10],
        "churn_probability_pct": f"{customer.churn_probability * 100:.1f}%",
        "revenue_at_risk_90d": customer.revenue_at_risk,
        "shap_breakdown": customer.shap_factors or []
    }
