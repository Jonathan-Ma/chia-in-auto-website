"""Optional adapter to push listings to Facebook Catalog. Disabled if no creds set."""
import time
import logging
import httpx

from app.config import settings
from app.models.car import Car


class FacebookAdapter:
    GRAPH_VERSION = "v20.0"

    def __init__(self):
        self.access_token = settings.fb_access_token
        self.catalog_id = settings.fb_catalog_id
        self.base_url = f"https://graph.facebook.com/{self.GRAPH_VERSION}"

    def is_configured(self) -> bool:
        return bool(self.access_token and self.catalog_id)

    async def push_listing(self, car: Car, description: str) -> bool:
        if not self.is_configured():
            logging.error("FacebookAdapter not configured.")
            return False

        item_id = car.vin or f"car_{int(time.time())}"
        main_image = car.image_urls[0] if car.image_urls else "https://via.placeholder.com/800x600?text=No+Image"

        payload = {
            "requests": [{
                "method": "CREATE",
                "data": {
                    "id": item_id,
                    "title": f"{car.year} {car.make} {car.model} {car.trim or ''}".strip(),
                    "description": description,
                    "availability": "in stock",
                    "condition": "used",
                    "price": f"{car.price} USD",
                    "link": "https://chia-in-auto.example/inventory",
                    "image_link": main_image,
                    "brand": car.make,
                    "additional_image_links": car.image_urls[1:],
                },
            }]
        }
        url = f"{self.base_url}/{self.catalog_id}/items_batch"
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    url, json=payload,
                    headers={"Authorization": f"Bearer {self.access_token}"},
                )
                data = resp.json()
                if resp.status_code == 200 and not data.get("error"):
                    return True
                logging.error(f"Facebook API error: {data}")
                return False
        except Exception as e:
            logging.error(f"Facebook push failed: {e}")
            return False
