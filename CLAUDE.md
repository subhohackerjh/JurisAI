# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**JurisAI** (internally `legalconnect`) — a legal services marketplace connecting
**Customers** with **Advocates**, with a **Police Officer** role for station-level case
tracking and an **Admin** role for approvals/moderation. Four dashboards, one codebase.

This is a real, deployed product (Render, `JurisAI`), not a prototype — treat data
integrity, auth, and payment code with production care. The root `README.md` describes an
early mock-data MVP; **ignore it**, it's stale. The actual system has a Django API, Postgres,
Redis, real JWT auth, Cashfree payments, and Groq-powered AI drafting/chat.

## Repo layout — two apps, one repo

```
/                  Next.js 16 frontend (App Router), deploys as its own Render service
  app/             pages + route handlers (app/api/*)
  components/      UI (shadcn/ui + Radix primitives)
  lib/             API client, caching, rate-limiting, doc generation helpers
  hooks/           data-fetching hooks per domain (useCases, useAdvocates, useECourts...)
  context/         AuthContext (JWT session state)

backend/           Django + DRF project (`legalconnect`), deploys as a separate Render service
  legalconnect/    settings, urls, asgi/wsgi (Daphne — ASGI, not plain WSGI)
  accounts/        custom User model (role-based), profiles, JWT auth, analytics endpoints
  cases/           Case, Hearing, CaseDocument, CaseUpdate, DraftRequest
  ecourts/         eCourts India API integration (cached + rate-limited)
  messaging/       real-time chat via Django Channels (WebSocket)
  payments/        Cashfree payment gateway integration
  feedback/        feedback/support tickets
```

The frontend and backend are two independently deployed Render services
(`JurisAI` and `JurisAI-api`, see `render.yaml`) talking over HTTPS + WSS. Treat the
API contract (endpoint shapes, JWT claims, role strings) as a real versioned boundary.

## Commands

**Frontend** (root):
```bash
pnpm install
pnpm dev              # localhost:3000, expects backend at localhost:8000
pnpm build
pnpm lint
```

**Backend** (`backend/`):
```bash
python manage.py runserver          # dev server — but Channels/WebSocket needs Daphne:
daphne legalconnect.asgi:application
python manage.py migrate
python manage.py test                       # all apps
python manage.py test accounts              # single app
python manage.py test cases.tests.CaseTestCase.test_foo   # single test
python manage.py reset_advocate_password    # custom command (accounts)
python manage.py clear_ecourts_cache        # custom command (ecourts)
```

**Full stack locally** (mirrors Render prod topology — Postgres + Redis + both services):
```bash
docker compose up --build
```

**Ad-hoc integration checks**: root-level `test-*.js` files (e.g. `test-api.js`,
`test-advocate-login.js`, `test-complete-workflow.js`) are standalone Node scripts that hit
a running dev server to exercise auth/dashboard/workflow flows — not a test framework, run
individually with `node test-foo.js` against a live local stack.

## Architecture notes worth knowing before touching code

**Roles are a single `User.role` field**, not separate tables: `customer`, `advocate`,
`police`, `admin` (`backend/accounts/models.py`). Advocates carry extra fields on the same
model (`bar_council`, `enrollment_number`, `approval_status`, `rejection_reason`,
`rating`, `cases_handled`) and require **admin approval** before they're active
(`approval_status: pending/approved/rejected`) — this is the moderation gate, analogous to
publisher vetting in other marketplace projects.

**Auth is real JWT (`rest_framework_simplejwt`)**, not mock. Access/refresh tokens live in
`localStorage` (`accessToken`/`refreshToken`/`authSession`), and `lib/api.ts` has a silent
refresh-token flow (`tryRefreshToken`) wired into the fetch wrapper — any new frontend API
call should go through that wrapper, not raw `fetch`, to inherit auto-refresh + error
formatting (`formatApiError` normalizes DRF validation error shapes into a single string).

**AI drafting/chat lives in Next.js route handlers, not Django** (`app/api/ai-draft/route.ts`,
`app/api/ai-chat/route.ts`), calling **Groq** (`llama-3.3-70b-versatile`), not Anthropic —
despite `ANTHROPIC_API_KEY` still being present in backend settings and `@anthropic-ai/sdk`
in `package.json`, the live drafting/chat path is Groq. Streamed via SSE.

Critical pattern in `ai-draft/route.ts`: it **never trusts client-supplied role/paid headers**
— it re-verifies the JWT against the Django backend (`/api/auth/profile/`) and, for
`customer` role, cross-checks `/api/payments/` for a completed payment server-side before
allowing generation. Any change to gating logic must preserve that server-side re-check —
don't move the paid-check back to the client or trust a header.

**Payments are Cashfree, not Stripe/PayPal/Razorpay** — `backend/payments/` (model:
`Payment`, `payment_for`: consultation / case_filing / document_drafting / retainer) and
`cashfree-pg` SDK. `.env.example` at repo root still lists `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
— that's stale/unused, don't wire new Stripe code off it.

**Messaging is Django Channels over WebSocket** (`backend/messaging/consumers.py`), one
channel group per conversation (`chat_<conversation_id>`), with per-connection auth checks
(rejects unauthenticated sockets and users not part of the conversation) and marks messages
read on connect. `CHANNEL_LAYERS` is `InMemoryChannelLayer` in `settings.py` but Render/
docker-compose provision Redis for it — if you touch channel layer config, use
`channels_redis` in production paths, in-memory only works single-process.

**eCourts integration is aggressively cached and rate-limited** (`backend/ecourts/services.py`),
because the eCourts API is treated as slow/costly: per-method cache durations (CNR lookups
24h, search 6h, cause lists 2h) and per-hour rate limit counters via Django's cache backend.
Never bypass `ECourtsService`'s caching by calling the API directly. Frontend mirrors this
with its own localStorage cache (`lib/cache.ts`) and debouncing (`lib/debounce.ts`,
500ms on search) — see `ECOURTS_OPTIMIZATION.md` for the full rationale if you need to tune it.

**`Case` vs `DraftRequest` are separate models** (`backend/cases/models.py`) — a `Case` is
court litigation (hearings, CNR number, court/judge info), a `DraftRequest` is a document-
drafting engagement between customer and advocate (document type, AI-generated `draft_text`
or uploaded file, pricing). Don't conflate them; a customer can have draft requests with no
case, and vice versa.

**Security posture**: `SECRET_KEY` has no insecure production fallback (must be set via env),
`DEBUG` defaults to `False`, production security headers (HSTS, secure cookies, XSS filter,
`X-Frame-Options: DENY`) auto-enable when `DEBUG=False`. DRF throttling is configured with
tighter scopes for `login` (10/hour) and `register` (20/hour) to blunt brute force — respect
these when adding new auth-adjacent endpoints. `ADMIN_URL` is env-configurable specifically so
prod doesn't expose `/admin/`.

**Database**: Postgres in every real environment (Supabase or Render-provisioned, via
`DATABASE_URL`); falls back to local SQLite only when `DATABASE_URL` is unset. Custom
`AUTH_USER_MODEL = 'accounts.User'`.

## Environment variables

Frontend (`.env.local`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_APP_URL`,
`GROQ_API_KEY` (server-side only, used in `app/api/*` route handlers), `NEXT_PUBLIC_CASHFREE_ENV`.

Backend (`backend/.env`): `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `ADMIN_URL`, `DATABASE_URL`,
`REDIS_URL`, `CASHFREE_APP_ID`/`CASHFREE_SECRET_KEY`/`CASHFREE_ENV`, `ECOURTS_API_KEY`,
`ECOURTS_BASE_URL`, `SUPABASE_URL`/`SUPABASE_KEY` (only if calling Supabase directly, DB
access itself goes through `DATABASE_URL`), `CORS_ALLOWED_ORIGINS`, `SENTRY_DSN` (optional).

## Deployment

Render Blueprint (`render.yaml`): 4 services — Postgres, Redis, `JurisAI-api` (Django/Daphne,
`backend/Dockerfile`), `JurisAI` (Next.js, root `Dockerfile`, standalone output). Free tier by
default (spins down when idle) — starter plan needed for always-on/persistent storage.
`docker-compose.yml` mirrors this topology exactly for local dev.
