"""Public REST endpoints — read-only for the website."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import repository
from app.db.session import get_db
from app.models.car import VehicleOut

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("", response_model=list[VehicleOut])
def list_published(db: Session = Depends(get_db)):
    return repository.list_vehicles(db, only_published=True)


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    v = repository.get(db, vehicle_id)
    if v is None or not v.published:
        raise HTTPException(404, "Vehicle not found")
    return v
