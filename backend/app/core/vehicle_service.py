"""VIN decoding via NHTSA vPIC."""
import httpx
import logging
from typing import Dict, Any
from app.models.car import Car


class VehicleService:
    NHTSA_DECODE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/"

    async def decode_vin(self, vin: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10) as client:
            url = f"{self.NHTSA_DECODE_URL}{vin}?format=json"
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            results = data.get("Results", [{}])[0]
            return {
                "year": int(results["ModelYear"]) if results.get("ModelYear") else None,
                "make": results.get("Make") or None,
                "model": results.get("Model") or None,
                "trim": results.get("Trim") or None,
                "engine": (
                    f"{results.get('DisplacementL') or '?'}L "
                    f"{results.get('EngineConfiguration') or ''} "
                    f"{results.get('EngineCylinders') or '?'}cyl"
                ).strip(),
                "fuel_type": results.get("FuelTypePrimary") or None,
                "drivetrain": results.get("DriveType") or None,
                "transmission": results.get("TransmissionStyle") or None,
                "body_class": results.get("BodyClass") or None,
            }

    async def augment_car_with_vin(self, car: Car) -> Car:
        if not car.vin or len(car.vin) < 17:
            return car
        try:
            data = await self.decode_vin(car.vin)
            for field, value in data.items():
                if value and getattr(car, field) is None:
                    setattr(car, field, value)
        except Exception as e:
            logging.warning(f"VIN decode failed for {car.vin}: {e}")
        return car
