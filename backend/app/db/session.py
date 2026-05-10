"""SQLAlchemy engine + session factory."""
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

# For SQLite, resolve the relative path against backend/ so it's stable
# regardless of where uvicorn / the bot is launched from.
_db_url = settings.database_url
if _db_url.startswith("sqlite:///./"):
    rel = _db_url.removeprefix("sqlite:///./")
    abs_path = (_BACKEND_DIR / rel).resolve()
    abs_path.parent.mkdir(parents=True, exist_ok=True)
    _db_url = f"sqlite:///{abs_path}"

_connect_args = {"check_same_thread": False} if _db_url.startswith("sqlite") else {}
engine = create_engine(_db_url, connect_args=_connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
