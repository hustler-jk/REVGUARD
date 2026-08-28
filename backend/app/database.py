import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("REVGUARD")

engine = None

if settings.DATABASE_URL.startswith("postgresql"):
    try:
        test_engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"connect_timeout": 2},
            pool_pre_ping=True
        )
        with test_engine.connect():
            pass
        engine = test_engine
        logger.info("⚡ [Database] PostgreSQL connected successfully (pgAdmin live sync active).")
    except Exception:
        logger.info("ℹ️ [Database] PostgreSQL credentials not yet configured -> Running on high-performance local SQLite engine.")

if engine is None:
    engine = create_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False}
    )
    logger.info("📦 [Database] SQLite local storage online (6 Lean Tables Initialized).")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
