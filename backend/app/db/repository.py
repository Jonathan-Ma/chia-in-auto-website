"""Inventory repository — the only place that knows how Car <-> Vehicle map."""
from typing import Optional
from sqlalchemy.orm import Session

from app.db.models import Vehicle
from app.models.car import Car


_CAR_FIELDS = (
    "vin", "year", "make", "model", "trim", "mileage", "price", "color",
    "condition", "description", "engine", "fuel_type", "drivetrain",
    "transmission", "body_class",
)


def create_from_car(db: Session, car: Car, *, published: bool = False) -> Vehicle:
    v = Vehicle(published=published)
    for f in _CAR_FIELDS:
        setattr(v, f, getattr(car, f))
    v.image_urls = car.image_urls
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


def list_vehicles(db: Session, *, only_published: bool = True) -> list[Vehicle]:
    q = db.query(Vehicle)
    if only_published:
        q = q.filter(Vehicle.published.is_(True))
    return q.order_by(Vehicle.created_at.desc()).all()


def get(db: Session, vehicle_id: int) -> Optional[Vehicle]:
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()


def update_fields(db: Session, vehicle_id: int, **fields) -> Optional[Vehicle]:
    """Update arbitrary scalar fields. Use for /edit price=12000 etc."""
    v = get(db, vehicle_id)
    if v is None:
        return None
    for k, value in fields.items():
        if k == "image_urls":
            v.image_urls = value
        elif hasattr(v, k):
            setattr(v, k, value)
    db.commit()
    db.refresh(v)
    return v


def delete(db: Session, vehicle_id: int) -> bool:
    v = get(db, vehicle_id)
    if v is None:
        return False
    db.delete(v)
    db.commit()
    return True


def set_published(db: Session, vehicle_id: int, published: bool) -> Optional[Vehicle]:
    return update_fields(db, vehicle_id, published=published)
