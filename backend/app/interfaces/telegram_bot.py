"""Telegram bot — full inventory CRUD for Chia-In Auto.

Commands:
  /start            — greet
  /add              — start a new draft listing (photos + text)
  /save             — save the current draft into the inventory (unpublished)
  /publish          — save & publish (visible on website) [from current draft]
  /cancel           — discard current draft
  /list             — list all vehicles (published + drafts)
  /show <id>        — show a vehicle's stored details
  /edit <id> <k=v>  — edit a stored vehicle (e.g., /edit 4 price=12500)
  /delete <id>      — delete a vehicle
  /publish_id <id>  — publish a stored (unpublished) vehicle
  /unpublish <id>   — hide a vehicle from the website

Auth: only chat IDs in TELEGRAM_ALLOWED_USER_IDS may use any command other than /start.
"""
from __future__ import annotations

import logging
import sys
import os

# Allow running as a script without -m by inserting backend/ into sys.path
_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

import cloudinary
import cloudinary.uploader
from telegram import Update
from telegram.ext import (
    ApplicationBuilder, ContextTypes,
    CommandHandler, MessageHandler, filters,
)

from app.config import settings
from app.core.providers.gemini import GeminiBrain
from app.core.vehicle_service import VehicleService
from app.db import repository
from app.db.session import Base, SessionLocal, engine
from app.db import models as _models  # noqa: F401  — register
from app.models.car import Car

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)

# Make sure tables exist (in case the bot is run before the API has been hit)
Base.metadata.create_all(bind=engine)


def _is_authorized(update: Update) -> bool:
    if not settings.telegram_allowed_user_ids:
        return True  # open mode if no allowlist configured
    user = update.effective_user
    return bool(user and user.id in settings.telegram_allowed_user_ids)


class TelegramInterface:
    def __init__(self):
        if not settings.telegram_bot_token:
            raise ValueError("TELEGRAM_BOT_TOKEN not set in .env")
        self.token = settings.telegram_bot_token
        self.brain = GeminiBrain()
        self.vehicle_service = VehicleService()

        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
        )

        # Per-chat draft sessions for the /add flow. In-memory; replace with Redis if needed.
        self.drafts: dict[int, Car] = {}

    # ---------- helpers ----------

    async def _guard(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
        if _is_authorized(update):
            return True
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="🔒 Not authorized. Ask the shop owner to add your Telegram user ID.",
        )
        return False

    def _draft(self, chat_id: int) -> Car:
        if chat_id not in self.drafts:
            self.drafts[chat_id] = Car()
        return self.drafts[chat_id]

    @staticmethod
    def _format_vehicle_line(v) -> str:
        flag = "🟢" if v.published else "⚪"
        price = f"${int(v.price):,}" if v.price else "?"
        return (
            f"{flag} #{v.id} — {v.year or '?'} {v.make or '?'} {v.model or '?'} • "
            f"{(v.mileage or 0):,} mi • {price}"
        )

    @staticmethod
    def _format_car_summary(car: Car) -> str:
        lines = ["📝 *Current draft:*"]
        lines.append(f"🚗 {car.year or '?'} {car.make or '?'} {car.model or '?'} {car.trim or ''}".rstrip())
        if car.price: lines.append(f"💰 ${int(car.price):,}")
        if car.mileage: lines.append(f"📟 {car.mileage:,} mi")
        if car.color: lines.append(f"🎨 {car.color}")
        if car.vin: lines.append(f"🆔 `{car.vin}`")
        if car.image_urls: lines.append(f"🖼 {len(car.image_urls)} photo(s)")
        missing = car.get_missing_mandatory_fields()
        if missing:
            lines.append("\n⏳ Still need: " + ", ".join(missing))
        else:
            lines.append("\n✅ Ready — use /save (draft) or /publish (live).")
        return "\n".join(lines)

    # ---------- commands ----------

    async def cmd_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = update.effective_chat.id
        await context.bot.send_message(
            chat_id=chat_id,
            text=(
                "👋 *Chia-In Auto Inventory Bot*\n\n"
                "*Drafting:*\n"
                "/add — start a new vehicle (send photos + text)\n"
                "/save — save the current draft\n"
                "/publish — save & make live on the website\n"
                "/cancel — discard the draft\n\n"
                "*Managing:*\n"
                "/list — show inventory\n"
                "/show <id> — show one\n"
                "/edit <id> <field>=<value> — edit fields\n"
                "/publish\\_id <id> — make live\n"
                "/unpublish <id> — hide from website\n"
                "/delete <id> — remove\n"
            ),
            parse_mode="Markdown",
        )

    async def cmd_add(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not await self._guard(update, context): return
        chat_id = update.effective_chat.id
        self.drafts[chat_id] = Car()
        await context.bot.send_message(
            chat_id=chat_id,
            text="🆕 New draft started. Send photos and/or describe the vehicle.",
        )

    async def cmd_cancel(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not await self._guard(update, context): return
        self.drafts.pop(update.effective_chat.id, None)
        await context.bot.send_message(chat_id=update.effective_chat.id, text="🗑 Draft discarded.")

    async def cmd_save(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await self._save_draft(update, context, publish=False)

    async def cmd_publish(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await self._save_draft(update, context, publish=True)

    async def _save_draft(self, update: Update, context: ContextTypes.DEFAULT_TYPE, *, publish: bool):
        if not await self._guard(update, context): return
        chat_id = update.effective_chat.id
        car = self.drafts.get(chat_id)
        if car is None or not any([car.make, car.model, car.year]):
            await context.bot.send_message(chat_id=chat_id, text="No draft to save. Use /add first.")
            return
        missing = car.get_missing_mandatory_fields()
        if missing:
            await context.bot.send_message(
                chat_id=chat_id,
                text=f"⏳ Still missing: {', '.join(missing)}",
            )
            return

        # Auto-generate description if none yet
        if not car.description:
            try:
                car.description = await self.brain.generate_listing_copy(car)
            except Exception as e:
                logging.warning(f"description generation failed: {e}")

        with SessionLocal() as db:
            v = repository.create_from_car(db, car, published=publish)

        self.drafts.pop(chat_id, None)
        status = "🟢 published" if publish else "⚪ saved as draft"
        await context.bot.send_message(
            chat_id=chat_id,
            text=f"✅ Vehicle #{v.id} {status}.",
        )

    async def cmd_list(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not await self._guard(update, context): return
        with SessionLocal() as db:
            vs = repository.list_vehicles(db, only_published=False)
        if not vs:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="📭 Inventory is empty.")
            return
        lines = [self._format_vehicle_line(v) for v in vs]
        await context.bot.send_message(chat_id=update.effective_chat.id, text="\n".join(lines))

    async def cmd_show(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not await self._guard(update, context): return
        vehicle_id = self._parse_id(context.args)
        if vehicle_id is None:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="Usage: /show <id>")
            return
        with SessionLocal() as db:
            v = repository.get(db, vehicle_id)
            if v is None:
                await context.bot.send_message(chat_id=update.effective_chat.id, text=f"No vehicle #{vehicle_id}.")
                return
            text = (
                f"{'🟢 LIVE' if v.published else '⚪ DRAFT'} #{v.id}\n"
                f"{v.year or '?'} {v.make or '?'} {v.model or '?'} {v.trim or ''}\n"
                f"💰 ${int(v.price):,}  📟 {(v.mileage or 0):,} mi  🎨 {v.color or '?'}\n"
                f"🆔 {v.vin or '—'}\n"
                f"🖼 {len(v.image_urls)} photo(s)\n\n"
                f"{(v.description or '(no description)')[:500]}"
            )
        await context.bot.send_message(chat_id=update.effective_chat.id, text=text)

    async def cmd_edit(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Usage: /edit 4 price=12500 mileage=58000 color=Silver"""
        if not await self._guard(update, context): return
        if not context.args or len(context.args) < 2:
            await context.bot.send_message(chat_id=update.effective_chat.id,
                text="Usage: /edit <id> <field>=<value> ...")
            return
        try:
            vehicle_id = int(context.args[0])
        except ValueError:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="Bad id.")
            return
        updates = {}
        for tok in context.args[1:]:
            if "=" not in tok:
                continue
            k, _, v = tok.partition("=")
            updates[k.strip()] = self._coerce(k.strip(), v.strip())
        if not updates:
            await context.bot.send_message(chat_id=update.effective_chat.id,
                text="No valid field=value pairs.")
            return
        with SessionLocal() as db:
            v = repository.update_fields(db, vehicle_id, **updates)
        if v is None:
            await context.bot.send_message(chat_id=update.effective_chat.id, text=f"No vehicle #{vehicle_id}.")
            return
        await context.bot.send_message(chat_id=update.effective_chat.id,
            text=f"✏️ Updated #{vehicle_id}: {', '.join(updates.keys())}")

    async def cmd_delete(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not await self._guard(update, context): return
        vehicle_id = self._parse_id(context.args)
        if vehicle_id is None:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="Usage: /delete <id>")
            return
        with SessionLocal() as db:
            ok = repository.delete(db, vehicle_id)
        msg = f"🗑 Deleted #{vehicle_id}." if ok else f"No vehicle #{vehicle_id}."
        await context.bot.send_message(chat_id=update.effective_chat.id, text=msg)

    async def cmd_publish_id(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await self._set_published(update, context, True)

    async def cmd_unpublish(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await self._set_published(update, context, False)

    async def _set_published(self, update, context, value: bool):
        if not await self._guard(update, context): return
        vehicle_id = self._parse_id(context.args)
        if vehicle_id is None:
            await context.bot.send_message(chat_id=update.effective_chat.id,
                text=f"Usage: {'/publish_id' if value else '/unpublish'} <id>")
            return
        with SessionLocal() as db:
            v = repository.set_published(db, vehicle_id, value)
        if v is None:
            await context.bot.send_message(chat_id=update.effective_chat.id, text=f"No vehicle #{vehicle_id}.")
            return
        flag = "🟢 LIVE" if value else "⚪ hidden"
        await context.bot.send_message(chat_id=update.effective_chat.id,
            text=f"#{vehicle_id} is now {flag}.")

    # ---------- message handlers (free text + photos build the draft) ----------

    async def handle_text(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not await self._guard(update, context): return
        chat_id = update.effective_chat.id
        text = update.message.text or ""
        if chat_id not in self.drafts:
            await context.bot.send_message(
                chat_id=chat_id,
                text="Use /add to start a new vehicle, /list to see the current inventory, "
                     "or /edit <id> <field>=<value> to update one.",
            )
            return
        draft = self._draft(chat_id)
        await context.bot.send_chat_action(chat_id=chat_id, action="typing")
        try:
            new_data, ai_answer = await self.brain.parse_text(text, current_car=draft)
            draft.update_from(new_data)
            if draft.vin and not draft.engine:
                await self.vehicle_service.augment_car_with_vin(draft)
            if ai_answer:
                await context.bot.send_message(chat_id=chat_id, text=ai_answer)
            await context.bot.send_message(
                chat_id=chat_id, text=self._format_car_summary(draft), parse_mode="Markdown"
            )
        except Exception as e:
            logging.error(f"text handling failed: {e}")
            await context.bot.send_message(chat_id=chat_id, text=f"⚠️ {e}")

    async def handle_photo(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not await self._guard(update, context): return
        chat_id = update.effective_chat.id
        if chat_id not in self.drafts:
            await context.bot.send_message(chat_id=chat_id,
                text="Use /add first, then send photos.")
            return
        draft = self._draft(chat_id)
        photo_file = await update.message.photo[-1].get_file()
        photo_bytes = bytes(await photo_file.download_as_bytearray())

        await context.bot.send_chat_action(chat_id=chat_id, action="typing")
        try:
            upload = cloudinary.uploader.upload(photo_bytes)
            url = upload.get("secure_url")
            if url and url not in draft.image_urls:
                draft.image_urls.append(url)

            new_data, _missing = await self.brain.parse_images(
                [{"mime_type": "image/jpeg", "data": photo_bytes}]
            )
            draft.update_from(new_data)
            if draft.vin and not draft.engine:
                await self.vehicle_service.augment_car_with_vin(draft)
            await context.bot.send_message(
                chat_id=chat_id, text=self._format_car_summary(draft), parse_mode="Markdown"
            )
        except Exception as e:
            err = str(e)
            if len(err) > 500:
                err = err[:500] + "… [truncated]"
            logging.error(f"photo handling failed: {err}")
            await context.bot.send_message(chat_id=chat_id, text=f"⚠️ {err}")

    # ---------- arg coercion ----------

    @staticmethod
    def _parse_id(args) -> int | None:
        if not args: return None
        try: return int(args[0])
        except ValueError: return None

    @staticmethod
    def _coerce(field: str, raw: str):
        if field in {"year", "mileage"}:
            return int(raw)
        if field == "price":
            return float(raw.replace(",", "").replace("$", ""))
        if field == "published":
            return raw.lower() in {"1", "true", "yes", "y"}
        return raw

    # ---------- bootstrap ----------

    def run(self):
        app = ApplicationBuilder().token(self.token).build()

        app.add_handler(CommandHandler("start", self.cmd_start))
        app.add_handler(CommandHandler("add", self.cmd_add))
        app.add_handler(CommandHandler("cancel", self.cmd_cancel))
        app.add_handler(CommandHandler("save", self.cmd_save))
        app.add_handler(CommandHandler("publish", self.cmd_publish))
        app.add_handler(CommandHandler("list", self.cmd_list))
        app.add_handler(CommandHandler("show", self.cmd_show))
        app.add_handler(CommandHandler("edit", self.cmd_edit))
        app.add_handler(CommandHandler("delete", self.cmd_delete))
        app.add_handler(CommandHandler("publish_id", self.cmd_publish_id))
        app.add_handler(CommandHandler("unpublish", self.cmd_unpublish))

        app.add_handler(MessageHandler(filters.PHOTO, self.handle_photo))
        app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), self.handle_text))

        print("Chia-In Auto Inventory Bot is polling Telegram...")
        app.run_polling()


if __name__ == "__main__":
    TelegramInterface().run()
