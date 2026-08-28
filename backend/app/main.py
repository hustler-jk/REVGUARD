import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import Customer, RevenueCase
from app.services.seeder import seed_database
from app.api import dashboard, cases, root_causes, customers, ingestion, audit

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("REVGUARD")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup
    logger.info("Initializing REVGUARD database schema...")
    import app.models
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed if database is freshly created
    db = SessionLocal()

    try:
        count = db.query(RevenueCase).count()
        if count == 0:
            logger.info("Fresh database detected. Auto-seeding canonical dataset with 4 Hero Cases...")
            seed_database(db)
            logger.info("Auto-seeding complete.")
    except Exception as e:
        logger.warning(f"Auto-seeding skipped or encountered note: {e}")
    finally:
        db.close()

    # Pre-warm AI and ML models at startup to avoid runtime request latency
    try:
        logger.info("⚡ Pre-warming AI Models (HuggingFace, Isolation Forest, Churn Model, TabPFN)...")
        from app.ml.transformer_matcher import hf_semantic_matcher
        from app.ml.anomaly_model import anomaly_detector
        from app.ml.churn_model import churn_model
        from app.ml.tabpfn_model import tabpfn_model

        hf_semantic_matcher.load_model()
        anomaly_detector.score_record({"order_amount": 50000, "discount_percent": 10, "aging_days": 2, "is_unbilled": 0})
        churn_model.train_baseline()
        tabpfn_model.predict_tabular_batch([{"order_amount": 50000, "discount_percent": 10}])
        logger.info("✅ AI Models pre-warmed and ready for instant sub-10ms inference.")
    except Exception as e:
        logger.warning(f"Note on AI model pre-warming: {e}")
    
    yield
    logger.info("Shutting down REVGUARD API server...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Cross-system Revenue Leakage Intelligence layer with Root-Cause Clustering, Leak Immunization, and Tamper-Evident Audit Trails.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api import dashboard, cases, root_causes, customers, ingestion, audit, webhook, models_hub, integrations, policy_simulator

# Register API Routers
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(cases.router, prefix="/api/v1/cases", tags=["Cases"])
app.include_router(root_causes.router, prefix="/api/v1/root-causes", tags=["Root Causes"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["Customers"])
app.include_router(ingestion.router, prefix="/api/v1/ingest", tags=["Ingestion"])
app.include_router(audit.router, prefix="/api/v1/audit-log", tags=["Audit Log"])
app.include_router(webhook.router, prefix="/api/v1/remediate", tags=["Remediation Webhook"])
app.include_router(models_hub.router, prefix="/api/v1/models", tags=["AI Models Hub"])
app.include_router(integrations.router, prefix="/api/v1/integrations", tags=["Enterprise Connectors"])
app.include_router(policy_simulator.router, prefix="/api/v1/policy", tags=["Policy & What-If Simulator"])


# Mount static web dashboard (React build or fallback)
frontend_dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(frontend_dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_dir, "assets")), name="assets")
elif os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def serve_dashboard():
    # Prefer compiled React SPA
    react_index = os.path.join(frontend_dist_dir, "index.html")
    if os.path.exists(react_index):
        return FileResponse(react_index)
    
    # Fallback to static index
    fallback_index = os.path.join(static_dir, "index.html")
    if os.path.exists(fallback_index):
        return FileResponse(fallback_index)
    return {"message": "REVGUARD API is running. Web dashboard not found."}


@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "system": "REVGUARD Revenue Leakage Intelligence Engine",
        "version": "2.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
