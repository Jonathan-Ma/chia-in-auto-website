"""Pydantic schemas for vehicles.

Car is the in-flight working object the Telegram bot/AI build up.
VehicleOut is the public shape the website API returns.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Car(BaseModel):
    """Working/draft vehicle object — used by the Telegram bot and AI brain."""

    vin: Optional[str] = Field(None, description="Vehicle Identification Number")
    year: Optional[int] = Field(None, description="Manufacturing year")
    make: Optional[str] = Field(None, description="Brand of the car (e.g. Toyota, Honda)")
    model: Optional[str] = Field(None, description="Specific model (e.g. Camry, Civic)")
    trim: Optional[str] = Field(None, description="Trim level (e.g. LE, XLE, Sport)")
    mileage: Optional[int] = Field(None, description="Odometer reading in miles")
    price: Optional[float] = Field(None, description="Asking price in USD")
    color: Optional[str] = Field(None, description="Exterior color")
    condition: Optional[str] = Field(None, description="General condition")
    description: Optional[str] = Field(None, description="Listing description")
    image_urls: List[str] = Field(default_factory=list, description="Public image URLs")

    # VIN-derived
    engine: Optional[str] = None
    fuel_type: Optional[str] = None
    drivetrain: Optional[str] = None
    transmission: Optional[str] = None
    body_class: Optional[str] = None

    def to_summary(self) -> str:
        return (
            f"{self.year or '?'} {self.make or '?'} {self.model or '?'} "
            f"- ${self.price or '?'}"
        )

    def update_from(self, other: "Car") -> None:
        """Merge non-null fields from another Car. Image lists are appended (deduped)."""
        for field, value in other.model_dump(exclude_unset=True).items():
            if field == "image_urls" and value:
                self.image_urls.extend([v for v in value if v not in self.image_urls])
            elif value is not None and getattr(self, field) is None:
                setattr(self, field, value)

    def get_missing_mandatory_fields(self) -> List[str]:
        mandatory = {
            "make": "Make",
            "model": "Model",
            "year": "Year",
            "price": "Asking Price",
            "mileage": "Mileage/Odometer",
        }
        return [label for key, label in mandatory.items() if getattr(self, key) is None]


class VehicleOut(BaseModel):
    """Public read-shape returned by the REST API to the website."""

    id: int
    vin: Optional[str]
    year: Optional[int]
    make: Optional[str]
    model: Optional[str]
    trim: Optional[str]
    mileage: Optional[int]
    price: Optional[float]
    color: Optional[str]
    condition: Optional[str]
    description: Optional[str]
    image_urls: List[str]
    engine: Optional[str]
    fuel_type: Optional[str]
    drivetrain: Optional[str]
    transmission: Optional[str]
    body_class: Optional[str]
    published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
