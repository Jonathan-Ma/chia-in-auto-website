"""Gemini implementation of CarParserBrain."""
import json
from typing import List, Optional, Tuple

from google import genai
from google.genai import types

from app.config import settings
from app.core.brain import CarParserBrain
from app.models.car import Car


class GeminiBrain(CarParserBrain):
    MODEL_NAME = "gemini-2.5-pro"

    def __init__(self):
        if not settings.gemini_api_key:
            raise ValueError(
                "Gemini API key not found. Set GEMINI_API_KEY (or GOOGLE_API_KEY) in .env."
            )
        self.client = genai.Client(api_key=settings.gemini_api_key)

    async def parse_text(self, text: str, current_car: Optional[Car] = None) -> Tuple[Car, Optional[str]]:
        car_context = current_car.model_dump_json() if current_car else "No data yet."
        prompt = f"""
You are an autoshop inventory assistant for Chia-In Auto.
The operator is describing a vehicle they want to list for sale.

CURRENT VEHICLE DATA:
{car_context}

OPERATOR MESSAGE:
"{text}"

Return a JSON object with two keys:
- "data": newly extracted/updated fields matching the schema below
- "answer": a short clarification or reply if the message is a question or ambiguous; otherwise null

Schema for "data":
{{
  "vin": "string", "year": "integer", "make": "string", "model": "string",
  "trim": "string", "mileage": "integer", "price": "number",
  "color": "string", "condition": "string"
}}
"""
        response = self.client.models.generate_content(
            model=self.MODEL_NAME, contents=prompt
        )
        result = json.loads(self._clean(response.text))
        return Car(**result.get("data", {})), result.get("answer")

    async def parse_images(self, image_data: List[dict]) -> Tuple[Car, List[str]]:
        prompt = """
Analyze these vehicle photos. Extract:
- VIN (door jamb, dashboard, paperwork)
- Odometer / Mileage
- Year, Make, Model, Trim, Color
- Condition (note any visible damage, wear)

Return JSON:
{
  "data": { "vin": "...", "year": 0, "make": "...", "model": "...",
            "trim": "...", "mileage": 0, "color": "...", "condition": "..." },
  "missing_fields": ["fields that could not be determined"]
}
"""
        contents = [prompt]
        for img in image_data:
            contents.append(
                types.Part.from_bytes(data=img["data"], mime_type=img["mime_type"])
            )
        response = self.client.models.generate_content(
            model=self.MODEL_NAME, contents=contents
        )
        result = json.loads(self._clean(response.text))
        return Car(**result.get("data", {})), result.get("missing_fields", [])

    async def generate_listing_copy(self, car: Car) -> str:
        prompt = f"""
Write an honest, engaging listing description for this used vehicle, suitable for the
Chia-In Auto inventory page. Keep it concise (around 80–120 words). Highlight one or two
key selling points and mention condition. No markdown code blocks.

VEHICLE DATA:
{car.model_dump_json(indent=2)}
"""
        response = self.client.models.generate_content(
            model=self.MODEL_NAME, contents=prompt
        )
        return response.text.strip()

    @staticmethod
    def _clean(text: str) -> str:
        return text.replace("```json", "").replace("```", "").strip()
