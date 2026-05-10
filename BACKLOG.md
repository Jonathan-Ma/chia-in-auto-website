# Chia-In Auto — Backlog

Living document. Grouped roughly by priority. Tick boxes as work lands;
move things between sections as plans change.

---

## Now — launch blockers

Things that should be done before showing the live site to customers.

### Logo & brand
- [ ] Design real logo (see options in conversation: AI concept → Fiverr cleanup, or 99designs)
- [ ] Deliverables: SVG, PNG 512×512 + 1024×1024 transparent, favicon, one-color version, horizontal + stacked lockups
- [ ] Drop SVG at `web/public/logo.svg`, swap the 🚗 emoji in `web/src/components/Header.tsx` for `<img src="/logo.svg" …>`
- [ ] Add `favicon.ico` and `apple-touch-icon.png` to `web/public/` (Next.js picks them up automatically)
- [ ] Update `web/src/app/[locale]/layout.tsx` `generateMetadata` to include `icons` for OpenGraph

### Real shop content
- [ ] Fill in `web/src/lib/site.ts`: address, phone, email, Google Maps embed URL, mapsLink
- [ ] Confirm services list reflects what Chia-In actually offers (slugs in site.ts + entries in all three message files)
- [ ] Add a real OpenGraph image (`web/public/og-image.png`, 1200×630)

### Translation review
- [ ] Have a native Chinese speaker review `web/messages/zh.json` — particularly tagline, intro, services blurbs, and the Chinese form of "Chia-In" (currently the English wordmark is used everywhere; you may want 佳音 / 嘉音 / etc.)
- [ ] Same review for `web/messages/es.json` by a native Spanish speaker

### Deployment

End-to-end checklist for taking the site from localhost to live. Substeps roughly in the order you'd do them.

**1. Domain**
- [ ] Pick a domain name (e.g. `chia-in-auto.com`, `chiainauto.com`). Stick with `.com` if available; optionally also grab `.net` and common typos to redirect later
- [ ] Choose a registrar. Recommended: **Cloudflare Registrar** (sells at cost, no upsells) or **Porkbun**. Avoid GoDaddy / Network Solutions — overpriced renewals
- [ ] Create the registrar account
- [ ] Purchase the domain
- [ ] Enable WHOIS privacy (free on Cloudflare and Porkbun)
- [ ] Enable auto-renewal so it doesn't lapse

**2. DNS (recommended: Cloudflare)**
- [ ] Create a Cloudflare account if not using Cloudflare Registrar
- [ ] Add the domain to Cloudflare
- [ ] Update nameservers at the registrar to point to Cloudflare
- [ ] Plan the records: `@` (apex) → frontend, `www` → frontend, `api.` → backend

**3. Frontend hosting (Vercel)**
- [ ] Create Vercel account (sign in with GitHub for one-click repo import)
- [ ] Import the `chia-in-auto-website` repo
- [ ] Set "Root Directory" to `web/`
- [ ] Add env var: `NEXT_PUBLIC_API_URL=https://api.<your-domain>`
- [ ] Verify the build succeeds on Vercel
- [ ] Add custom domain `<your-domain>` and `www.<your-domain>` in Vercel project settings
- [ ] Add the DNS records Vercel asks for (in Cloudflare)
- [ ] Confirm HTTPS works (automatic)

**4. Backend hosting (Fly.io or Railway)**
- [ ] Pick one. Recommended: **Fly.io** for the flexibility to also run the Telegram bot as a sibling process
- [ ] Create account, install CLI (`brew install flyctl`)
- [ ] Write `backend/Dockerfile` (python:3.11-slim + requirements + uvicorn)
- [ ] Generate `backend/fly.toml` via `fly launch`
- [ ] Deploy: `fly deploy`
- [ ] Add custom subdomain `api.<your-domain>` in Fly dashboard
- [ ] Add CNAME in Cloudflare pointing to Fly's hostname
- [ ] Verify HTTPS (automatic via Let's Encrypt)

**5. Production database (Postgres)**
- [ ] **Before this:** migrate from auto-create-tables to **Alembic** (see Tech/ops section) — required for safe schema changes in production
- [ ] Pick a provider:
  - **Supabase** — managed, generous free tier, automatic daily backups
  - **Neon** — modern, branching, free tier
  - **Fly.io Postgres** — convenient if backend is on Fly, but you manage backups
- [ ] Provision the DB, copy the connection string
- [ ] Set secret on the backend host: `fly secrets set DATABASE_URL=postgres://...`
- [ ] Run initial Alembic migration against production

**6. Backend secrets (production .env values)**
- [ ] On Fly/Railway, set these as secrets (mirroring `.env.example`):
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_ALLOWED_USER_IDS`
  - `GEMINI_API_KEY`
  - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
  - `DATABASE_URL` (production Postgres)
  - `FRONTEND_ORIGIN=https://<your-domain>` (for CORS)
- [ ] Never commit production secrets to git

**7. Telegram bot as a long-running worker**
- [ ] On Fly: add a second process in `fly.toml` (e.g. `processes.bot = "python -m app.interfaces.telegram_bot"`)
- [ ] On Railway: create a separate "worker" service in the same project
- [ ] Set restart policy: always restart on crash
- [ ] Test: send `/list` to the bot in production, confirm it responds

**8. Verification**
- [ ] Visit `https://<your-domain>` — site loads, all three languages work
- [ ] Devtools network tab: API requests go to `https://api.<your-domain>` over HTTPS
- [ ] Publish a vehicle via the bot — confirm it appears on the production website within 10 seconds
- [ ] No CORS errors in the browser console

**9. Backups & monitoring**
- [ ] Confirm daily Postgres backups are running (Supabase/Neon do automatically; Fly Postgres needs config)
- [ ] Test restoring a backup at least once
- [ ] Add **Sentry** to backend (`pip install sentry-sdk`) and frontend (`@sentry/nextjs`) — free tier
- [ ] Set up uptime monitoring (**UptimeRobot** or **Better Stack**, free tier) — ping `https://api.<your-domain>/health` every minute, alert by email/SMS on failure

**10. Email (needed once appointment booking ships)**
- [ ] Sign up for **Resend** or **Postmark** (free transactional tiers)
- [ ] Add an `RESEND_API_KEY` env var
- [ ] Verify the sending domain (DNS records in Cloudflare)

### Online presence (do alongside deployment — this is what actually puts you on Google Maps)

The Google Maps embed in the site is decorative. The real traffic driver for an
autoshop is the **Google Business Profile** + reviews.

- [ ] **Google Business Profile** (formerly "Google My Business") — verify the shop's physical address (Google mails a postcard with a verification code, ~5 business days). Add photos, hours, all services, the website URL once it's live. Free.
- [ ] **Google Search Console** — verify domain ownership (TXT record in Cloudflare), submit sitemap.xml once it exists
- [ ] **Apple Business Connect** — Apple Maps listing, free
- [ ] **Bing Places** — small audience but trivial to set up
- [ ] **Yelp** business listing — claim it if one already exists, fill it out, ask happy customers to leave reviews
- [ ] **Facebook page** — for community / WeChat-style discoverability with local customers
- [ ] Add Schema.org `AutoRepair` and `AutoDealer` structured data on the home page (also listed under Site polish)

---

## Next — planned features

### Appointment booking

Let customers request a service appointment from the website.

**Scope (v1):**
- New page `/[locale]/book` with a form: name, phone, email, service type, vehicle (year/make/model), preferred date + time window, notes
- Service type dropdown sourced from `site.serviceSlugs`
- Form submits to a new FastAPI endpoint `POST /appointments`
- New `appointments` table in SQLite/Postgres (id, name, phone, email, service, vehicle_summary, preferred_at, status, created_at)
- Bot gets new commands: `/appts` (list pending), `/appt <id>` (details), `/confirm <id>`, `/decline <id>`
- New row in `appointments` triggers a Telegram message to the operator(s) so they see it immediately
- After confirm/decline, optional email back to the customer (use Resend or Postmark)

**Open questions:**
- Are appointment slots free-form ("Tuesday afternoon") or strict slots (every 30 min from a schedule)? v1 should be free-form requests — operator confirms manually. v2 could add a real calendar.
- Do we want a customer-facing "track my appointment" page? Probably not v1 — just email/SMS updates.
- Spam prevention: reCAPTCHA or simple honeypot field?

**Acceptance criteria for v1:**
- A customer can submit a request in any of the three languages
- Operator gets notified within seconds via Telegram
- Operator can confirm or decline from the bot
- Customer receives a confirmation/decline email

### Car rental

Operate a small rental fleet alongside the for-sale inventory.

**Scope (v1):**
- New `rentals` table (or extend `vehicles` with a `category` enum: `for_sale` / `for_rent` / `sold` / `archived`)
- New page `/[locale]/rentals` listing available rental vehicles with daily/weekly rates
- Each rental shows: photos, specs, daily rate, weekly rate, deposit, availability calendar
- Booking form on each rental: name, contact, driver's license, start date, end date, notes
- Submits to `POST /rentals/{id}/booking` — creates a booking record (separate from appointments)
- Bot commands: `/add_rental`, `/list_rentals`, `/bookings`, `/confirm_booking <id>`
- New `rental_bookings` table (id, vehicle_id, customer info, start_date, end_date, status, total_price, created_at)

**Open questions:**
- Do we display real-time availability or just "request to rent"? v1 = request to rent (operator confirms availability manually). v2 = real calendar with blocked dates.
- Insurance/deposit handling — paper process or integrated? v1 = paper. v2 maybe Stripe payment intents for the deposit.
- Mileage limits, fuel policy, late return fees — capture as free-text rental terms per vehicle, shown on the listing page.
- Driver's license collection — secure upload? v1 can ask them to bring it in person; capturing photos online opens up PII storage concerns.

**Acceptance criteria for v1:**
- Operator can mark a vehicle as `for_rent` instead of `for_sale` (same upload flow in the bot)
- Customer can browse rentals in any language and submit a rental request
- Operator confirms via Telegram; customer is emailed

---

## Inventory polish

Incremental improvements to the existing for-sale listings.

- [ ] Pagination on `/inventory` once stock exceeds ~24 vehicles (use `?limit=24&offset=0` on the API)
- [ ] Filter sidebar: make, body class, price range, year range
- [ ] Sort: newest, lowest price, lowest mileage
- [ ] Sold marker — keep the listing visible with a "Sold" badge instead of just `/delete`-ing (new column `sold_at`)
- [ ] In the bot's `/show <id>`, also send the photos as a media group (currently only text is shown)
- [ ] In the bot's `/add` flow, support reordering photos and deleting one photo from the draft
- [ ] Confirmation prompt before `/delete` (e.g. "Reply YES to confirm")
- [ ] `/list` should support filters too: `/list rentals`, `/list drafts`, `/list sold`

---

## Site polish

- [ ] About us page (`/[locale]/about`) — shop history, team photos
- [ ] Service detail pages (`/[locale]/services/[slug]`) with longer descriptions, pricing if appropriate
- [ ] Customer testimonials section on home page
- [ ] Photos of the shop itself (interior, bays, team) — not just inventory
- [ ] Contact form on `/contact` (separate from appointment booking — for general questions). Submits to a `/messages` endpoint, forwards to Telegram
- [ ] Schema.org `AutoRepair` and `AutoDealer` structured data for local SEO
- [ ] `sitemap.xml` + `robots.txt`
- [ ] Per-page OpenGraph images for vehicle detail pages
- [ ] Analytics (Plausible or GA4)

---

## Tech / ops

- [ ] Swap auto-create-tables for **Alembic** migrations — required before any schema change in production
- [ ] Backend tests (`pytest` for the repository + API endpoints)
- [ ] Frontend lint/typecheck in CI (`tsc --noEmit`, `next lint`)
- [ ] Switch to Python 3.11+ in production (cleaner type syntax, no EOL warnings, no LibreSSL issue)
- [ ] Replace in-memory bot session dict with Redis if the bot is restarted often
- [ ] Add structured logging (JSON logs) to the FastAPI server, ship to a log aggregator
- [ ] Health check endpoint already exists (`/health`) — wire it to your hosting platform's health probes
- [ ] Rate-limit the public API (`/vehicles`) to prevent scraping

---

## Done

(Move items here as they ship — keeps a running record without inflating Git tags.)

- [x] FastAPI backend + SQLite inventory store
- [x] Telegram bot with full CRUD (`/add`, `/save`, `/publish`, `/list`, `/show`, `/edit`, `/delete`, `/publish_id`, `/unpublish`)
- [x] Next.js 14 + Tailwind, mobile-first
- [x] Google Maps embed on home page
- [x] Trilingual EN/中文/Español with globe-icon language switcher
- [x] Gemini integration for parsing photos + text from the bot
- [x] Cloudinary for image hosting
- [x] NHTSA VIN decoder fills in engine/transmission/etc. automatically
- [x] GitHub repo at https://github.com/Jonathan-Ma/chia-in-auto-website
