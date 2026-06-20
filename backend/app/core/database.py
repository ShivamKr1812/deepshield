import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError

logger = logging.getLogger("db")

# Avoid circular import — import settings lazily
def _get_settings():
    from app.core.config import settings
    return settings

def _build_engine():
    settings = _get_settings()
    pg_url = settings.DATABASE_URL

    # Try PostgreSQL first
    try:
        eng = create_engine(
            pg_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3},
        )
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Connected to PostgreSQL successfully.")
        return eng
    except Exception as e:
        logger.warning(f"PostgreSQL unavailable ({e}). Falling back to SQLite.")

    # SQLite fallback
    sqlite_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "deepshield.db"
    )
    eng = create_engine(
        f"sqlite:///{sqlite_path}",
        connect_args={"check_same_thread": False},
    )
    logger.info(f"Using SQLite at {sqlite_path}")
    return eng


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
