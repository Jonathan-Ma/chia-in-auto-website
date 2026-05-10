"""FastAPI app entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.vehicles import router as vehicles_router
from app.config import settings
from app.db.session import Base, engine
from app.db import models  # noqa: F401  — register ORM models with Base

# Auto-create tables on startup. For real migrations, swap to Alembic.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chia-In Auto API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(vehicles_router)


@app.get("/health")
def health():
    return {"status": "ok"}
