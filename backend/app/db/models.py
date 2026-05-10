"""SQLAlchemy ORM models for the inventory store."""
from datetime import datetime
import json

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.orm import validates

from app.db.session import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    vin = Column(String(17), index=True, nullable=True)
    year = Column(Integer, nullable=True)
    make = Column(String, nullable=True)
    model = Column(String, nullable=True)
    trim = Column(String, nullable=True)
    mileage = Column(Integer, nullable=True)
    price = Column(Float, nullable=True)
    color = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    # JSON-encoded list of image URLs (Cloudinary)
    image_urls_json = Column(Text, default="[]", nullable=False)

    engine = Column(String, nullable=True)
    fuel_type = Column(String, nullable=True)
    drivetrain = Column(String, nullable=True)
    transmission = Column(String, nullable=True)
    body_class = Column(String, nullable=True)

    published = Column(Boolean, default=False, nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    @property
    def image_urls(self) -> list[str]:
        try:
            return json.loads(self.image_urls_json or "[]")
        except json.JSONDecodeError:
            return []

    @image_urls.setter
    def image_urls(self, value: list[str]) -> None:
        self.image_urls_json = json.dumps(list(value or []))

    @validates("vin")
    def _normalize_vin(self, _key, vin):
        return vin.upper().strip() if vin else vin
