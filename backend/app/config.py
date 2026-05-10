"""Centralized environment/config loading."""
from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

# Load from repo-root .env (one level above backend/)
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_REPO_ROOT = _BACKEND_DIR.parent
load_dotenv(_REPO_ROOT / ".env")


class Settings:
    # Telegram
    telegram_bot_token: str | None = os.getenv("TELEGRAM_BOT_TOKEN")
    telegram_allowed_user_ids: set[int] = {
        int(x) for x in (os.getenv("TELEGRAM_ALLOWED_USER_IDS") or "").split(",") if x.strip()
    }

    # AI
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    # Cloudinary
    cloudinary_cloud_name: str | None = os.getenv("CLOUDINARY_CLOUD_NAME")
    cloudinary_api_key: str | None = os.getenv("CLOUDINARY_API_KEY")
    cloudinary_api_secret: str | None = os.getenv("CLOUDINARY_API_SECRET")

    # DB
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/inventory.db")

    # API
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    backend_host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))

    # Facebook (optional)
    fb_catalog_id: str | None = os.getenv("FB_CATALOG_ID")
    fb_access_token: str | None = os.getenv("FB_ACCESS_TOKEN")


settings = Settings()
