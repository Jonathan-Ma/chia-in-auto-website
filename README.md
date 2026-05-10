# Chia-In Auto

Website for Chia-In Auto. Mobile-friendly, trilingual (English / 中文 / Español),
Google-Maps-friendly, with a used-vehicle inventory page that's managed entirely
from a Telegram bot.

## Architecture

```
                       ┌───────────────────────────┐
                       │  Telegram bot (operator)  │
                       │  /add /list /edit /delete │
                       └─────────────┬─────────────┘
                                     │
                                     ▼
       ┌──────────────┐       ┌─────────────┐
       │  Next.js     │ HTTP  │   FastAPI   │ ──► Cloudinary (vehicle photos)
       │  website     │ ────► │   port 8000 │ ──► Gemini    (AI text/image parsing)
       │  port 3000   │ ◄──── │   /vehicles │
       └──────────────┘ JSON  └─────┬───────┘
                                    │
                                    ▼
                            ┌────────────────┐
                            │   SQLite DB    │
                            │ data/inventory │
                            └────────────────┘
```

One database is the source of truth. The Telegram bot is the only writer.
The FastAPI server exposes a read-only `/vehicles` API for the website.

## Repo layout

```
chia-in-auto/
├── backend/                   FastAPI + Telegram bot + SQLite
│   └── app/
│       ├── api/               Read-only REST endpoints (/vehicles)
│       ├── interfaces/        telegram_bot.py — full inventory CRUD
│       ├── core/              Brain (Gemini), VehicleService (NHTSA VIN)
│       ├── adapters/          Optional: Facebook Catalog push
│       ├── db/                SQLAlchemy models + repository
│       └── models/            Pydantic schemas (Car, VehicleOut)
├── web/                       Next.js 14 + Tailwind, mobile-first
│   ├── messages/              en.json / zh.json / es.json
│   └── src/
│       ├── app/[locale]/      All pages live under a locale segment
│       ├── components/        Header, Footer, VehicleCard, LanguageSwitcher
│       ├── i18n/              Tiny custom dictionary loader
│       └── lib/               api.ts (backend client), site.ts (shop info)
├── .env.example               Backend secrets template
└── README.md
```

## Languages

The site ships in three languages: **English**, **中文**, **Español**.

- `/` redirects to `/en`
- `/en/...`, `/zh/...`, `/es/...` are the three locale roots
- A globe icon in the header lets visitors switch languages without losing their place
- All translatable strings live in `web/messages/<locale>.json` — three parallel files with the same keys
- Non-translatable shop info (address, phone, Google Maps embed URL) is in `web/src/lib/site.ts`

To add a string: add the key to all three JSON files, then reference it via `dict.namespace.key` in any server component.

## Quick start

You need Python 3.9+ and Node 20+. Three terminals.

```bash
# 1. Backend setup (one-time)
cp .env.example .env           # then fill in tokens (see below)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Run the API (terminal 1)
python3 -m uvicorn app.main:app --reload

# 3. Run the Telegram bot (terminal 2)
python3 -m app.interfaces.telegram_bot

# 4. Run the website (terminal 3)
cd ../web
cp .env.local.example .env.local
npm install
npm run dev
```

Then open http://localhost:3000.

## Required environment variables

In `chia-in-auto/.env`:

| Key | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_ALLOWED_USER_IDS` | comma-separated list of Telegram user IDs allowed to manage inventory |
| `GEMINI_API_KEY` | Google AI Studio API key — for parsing photos and text |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | image hosting |
| `FRONTEND_ORIGIN` | defaults to `http://localhost:3000` — used for CORS |

In `web/.env.local`:

| Key | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | defaults to `http://localhost:8000` |

## Telegram bot commands

The bot is operator-only. Add your Telegram user ID to `TELEGRAM_ALLOWED_USER_IDS`.

| Command | Purpose |
|---|---|
| `/start` | Show the help menu |
| `/add` | Start a new vehicle draft — send photos and details, AI fills in the rest |
| `/save` | Save the current draft (hidden from website) |
| `/publish` | Save the current draft AND make it visible on the website |
| `/cancel` | Discard the current draft |
| `/list` | Show all vehicles (🟢 = live, ⚪ = draft) |
| `/show <id>` | Show full details for one vehicle |
| `/edit <id> <field>=<value> ...` | Update fields, e.g. `/edit 4 price=12500 mileage=58000` |
| `/publish_id <id>` | Make a draft live on the website |
| `/unpublish <id>` | Hide a vehicle from the website (keep in DB) |
| `/delete <id>` | Remove a vehicle |

## Customizing for your shop

- `web/src/lib/site.ts` — shop name, address, phone, email, Google Maps embed URL, service icons
- `web/messages/{en,zh,es}.json` — all visible UI text, in parallel
- `web/tailwind.config.ts` — `brand` color palette (currently red)

## How the database works

- One SQLite file at `backend/data/inventory.db` (auto-created on first launch)
- One `vehicles` table — see `backend/app/db/models.py`
- The bot writes through `repository.py`; the API reads through it. Nobody else touches the DB
- Switching to Postgres later is one line: change `DATABASE_URL` in `.env`

## License

Private project. All rights reserved.
