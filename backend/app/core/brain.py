"""Abstract AI brain interface — any LLM provider implements this."""
from abc import ABC, abstractmethod
from typing import Optional, Tuple, List
from app.models.car import Car


class CarParserBrain(ABC):
    @abstractmethod
    async def parse_text(self, text: str, current_car: Optional[Car] = None) -> Tuple[Car, Optional[str]]:
        """Parse text into a Car. Returns (updated_car_data, optional_reply_text)."""

    @abstractmethod
    async def parse_images(self, image_data: List[dict]) -> Tuple[Car, List[str]]:
        """Multimodal extraction. image_data: [{'mime_type': ..., 'data': bytes}]."""

    @abstractmethod
    async def generate_listing_copy(self, car: Car) -> str:
        """Produce a marketing description for a complete Car."""
