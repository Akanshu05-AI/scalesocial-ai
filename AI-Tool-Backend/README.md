# ScaleOn Backend

An all-in-one social media management API: OAuth connections for
LinkedIn/X/Facebook/Instagram, auto-posting with scheduling and retry,
AI-generated content (Gemini), RBAC, and audit logging. This is the
backend only — the Next.js frontend hasn't been scaffolded yet.

**As of this pass, the backend has been through a full production-readiness
audit** — see `AUDIT_REPORT.md` for the complete list of what was found
and fixed. Short version: it now actually starts, all 39 routes across
every module are confirmed reachable, Celery tasks actually register
(they silently didn't before), and the test suite passes. The database
still needs to be provisioned manually — see below.

## Stack

- **Backend**: FastAPI
- **Database**: Supabase (Postgres, accessed via the Supabase REST client
  — not a direct Postgres connection; see "Database" below)
- **Auth**: Supabase Auth (JWT verified on protected routes)
- **Job queue**: Celery + Redis (Upstash in production)
- **AI**: Gemini API (`google-genai`)
- **CI/CD**: GitHub Actions

## Configuration

All config goes through `app/core/config.py` (`Settings`, pydantic-settings)
— nothing in the app reads `os.environ` directly. Copy the template and
fill in real values:

```bash
cd backend
cp .env.example .env
```

| Variable | Notes |
|---|---|
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_JWT_SECRET` | From Supabase dashboard → Project Settings → API |
| `ALGORITHM` | `HS256` — used only as the fallback signing method for projects still on Supabase's legacy shared-secret JWT signing. **Projects created on/after Oct 1, 2025 default to asymmetric ES256 signing** — `verify_supabase_jwt()` now checks Supabase's JWKS endpoint first and only falls back to this value if no asymmetric keys are configured. If you see `"invalid signature"` errors with a real token, this is almost certainly why (confirmed live during this audit — see `AUDIT_REPORT.md`). |
| `DATABASE_URL` | Only used by Alembic for migrations, not by the app itself (Supabase REST client is the real data path) |
| `UPSTASH_REDIS_URL` | **Local (`uvicorn`/`celery worker` directly, no Docker):** `redis://127.0.0.1:6379`. **Docker Compose:** must be `redis://redis:6379` (the service name, not `127.0.0.1` — the worker container can't reach Redis through `127.0.0.1`, that's itself). **Production:** the `rediss://` URL from your Upstash dashboard — `app/core/celery.py` automatically enables TLS when it sees the `rediss://` prefix, no extra config needed. |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Get a key at [ai.google.dev](https://ai.google.dev). Model names get renamed/deprecated over time — verify `GEMINI_MODEL` against Google's current docs before a demo. |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` / `FACEBOOK_REDIRECT_URI` / `INSTAGRAM_REDIRECT_URI` / `GRAPH_API_VERSION` | From Meta's developer dashboard. `GRAPH_API_VERSION` should be a current version string (e.g. `v25.0`) — publisher.py reads this from settings now rather than a hardcoded value. |
| `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` / `TWITTER_REDIRECT_URI` / `TWITTER_OAUTH_SCOPES` / `TWITTER_AUTHORIZE_URL` | From the X Developer Portal. Note: the OAuth *callback* handler is currently a stub that doesn't call Twitter's real API yet — see `AUDIT_REPORT.md`. |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` / `LINKEDIN_REDIRECT_URI` | From the LinkedIn Developer Portal |
| `FRONTEND_URL` | Where OAuth redirects should send the user back to once the frontend exists |

Never commit a real `.env` — it's gitignored, and if one's ever been
committed before (check `git log --all -- .env`), rotate every credential
in it regardless of whether it's tracked now.

## Database

The app talks to Supabase via its REST client (`SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY`), not a raw Postgres connection —
`DATABASE_URL` exists in settings only for Alembic.

**Tables aren't created automatically.** Run the schema once:

```bash
# Option A — paste db/schema.sql into the Supabase SQL editor and run it
# Option B — via Alembic (also raw SQL under the hood, no ORM models):
alembic upgrade head
```

This creates 9 tables: `users`, `user_settings`, `brand_voices`,
`scheduled_posts`, `audit_logs`, `roles`, `permissions`,
`role_permissions`, `user_roles` — plus grants `service_role` (and
schema-level `USAGE` to `authenticated`) the actual privileges needed to
read/write them. **This last part matters**: creating tables via raw SQL
in the editor, rather than through Supabase's own dashboard/migration
flow, skips the default grants Supabase normally applies automatically —
without them, `service_role` can see the tables exist but every
read/write from the backend fails. See `db/schema.sql` for exactly what
each table looks like and which code references it.

**Verify it worked:**

```bash
python -c "
from app.core.config import settings
from supabase import create_client
client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
for t in ['users','user_settings','brand_voices','scheduled_posts','audit_logs','roles','permissions','role_permissions','user_roles']:
    try:
        client.table(t).select('*').limit(1).execute()
        print(f'{t}: OK')
    except Exception as e:
        print(f'{t}: MISSING or ERROR — {e}')
"
```

## Run it locally

### 1. Install

```bash
cd backend
python -m venv venv
venv/Scripts/activate      # Windows
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env       # then fill in real values, see Configuration above
```

### 2. Redis

Needed for Celery. Either run one locally:

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

or point `UPSTASH_REDIS_URL` at a free Upstash database and skip running
anything locally.

### 3. Run the API

```bash
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs — Swagger UI loading with a full list of
endpoints confirms the app started correctly. A `/health` request should
return `200`.

### 4. Run the Celery worker

**Separate process** — the API only enqueues jobs, this worker is what
actually executes them.

```bash
# Mac/Linux
celery -A app.core.celery.celery_app worker --loglevel=info

# Windows (Celery's default pool doesn't support Windows)
celery -A app.core.celery.celery_app worker --loglevel=info --pool=solo
```

If `celery` isn't recognized: make sure the venv is activated in that
terminal (`venv\Scripts\activate`) and that you're in the `backend`
folder — it needs to find `app.core.celery.celery_app` relative to where
it's run from.

Leave this running in its own terminal — without it, scheduled posts sit
at status `scheduled` forever.

**So you can see it end-to-end:** two terminals — `uvicorn` (API) and
`celery -A app.core.celery.celery_app worker ...` (scheduler).

### Docker Compose (alternative to steps 2–4)

```bash
docker compose up --build
```

Runs `web`, `worker`, and `redis` together. Requires
`UPSTASH_REDIS_URL=redis://redis:6379` in `.env` (not `127.0.0.1`, see
Configuration table above).

## Verifying it's actually working

```bash
# Lint — should report zero issues
ruff check app/ tests/

# Tests — should be 10/10 passing
pytest -v

# Confirm every route is actually registered (not just present in code)
python -c "
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
spec = client.get('/api/v1/openapi.json').json()
print('Registered routes:', len(spec['paths']))
"

# Confirm Celery tasks actually register (this silently failed before —
# see AUDIT_REPORT.md)
python -c "
from app.core.celery import celery_app
print([t for t in celery_app.tasks if not t.startswith('celery.')])
"
```

## API overview

| Module | Prefix | Notes |
|---|---|---|
| Users | `/api/v1/users` | Profile + settings |
| RBAC | `/api/v1/rbac` | Assign/revoke roles (no list endpoints yet) |
| AI Writer | `/api/v1/ai` | Gemini-backed generation — LinkedIn & X only, per PRD |
| Facebook | `/api/v1/facebook` | Login, post, comments |
| Twitter | `/api/v1/twitter` | Account, posts, analytics, media, threads. **OAuth callback is currently a stub — see below.** |
| LinkedIn | `/api/v1/linkedin` | Client, OAuth, posting |
| Instagram | `/api/v1/instagram` | Auth, posts, comments, webhooks — mounted directly in `main.py`, not through `api.py`'s aggregator |

Full endpoint-level detail is in Swagger (`/docs`) once the app is
running — more reliable than a hand-maintained table here, since it's
generated from the actual code.

## Known gaps (see `AUDIT_REPORT.md` for full detail)

- **Twitter OAuth callback is mocked** — doesn't call Twitter's real
  token endpoint, doesn't verify `state` (CSRF protection), always
  returns fake account data. Needs a real implementation before Twitter
  connections work for actual users.
- **RBAC has no list endpoints** — `RoleResponse`/`PermissionResponse`
  schemas exist but nothing serves them yet.
- **86 mypy errors**, mostly `UUID`/`str` mismatches at service
  boundaries — likely harmless at runtime, not yet cleaned up.
- **`black`/`isort` not applied** — would reformat 73/82 files (CRLF +
  mixed quote styles). Deliberately left as a decision for you rather
  than a sweeping automatic rewrite.
- **Pydantic V1-style `class Config` deprecation warnings** — several
  schema files (`instagram.py`, `rbac.py`, likely others) use the
  deprecated `class Config:` pattern instead of Pydantic V2's
  `ConfigDict`. Not broken (still works, just warns), not fixed here —
  same "touches many files" tradeoff as the black/isort decision above.
- **No Next.js frontend yet** — backend-only so far.

## Verifying JWT authentication end-to-end

Beyond the automated tests, it's worth confirming auth works against a
real Supabase user once you have credentials configured:

```bash
# 1. Get a real JWT for a test user (create one in Supabase Auth first)
python -c "
from supabase import create_client
from app.core.config import settings
client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
response = client.auth.sign_in_with_password({'email': 'test@example.com', 'password': 'your-password'})
print(response.session.access_token)
"

# 2. Confirm the endpoint is actually protected (expect 401, not 200)
python -c "
import requests
r = requests.get('http://127.0.0.1:8000/api/v1/users/me/settings')
print(r.status_code, r.text)
"

# 3. Confirm a real token works
python -c "
import requests
token = 'PASTE_JWT_HERE'
r = requests.get('http://127.0.0.1:8000/api/v1/users/me/settings', headers={'Authorization': f'Bearer {token}'})
print(r.status_code, r.text)
"
```

If Step 3 returns `401` with `"invalid signature"` even though the token
came straight from Supabase, see the `ALGORITHM` note in Configuration
above — this was a real, confirmed bug (Supabase's ES256 default vs. the
old HS256-only verification code), now fixed.

If Step 3 returns a `500` instead of `200`, check whether the signed-in
user's `id` actually has a matching row in the `users` table — `user_settings`
has a foreign key against it, and `db/schema.sql` creates the table but
doesn't seed rows for existing Supabase Auth users.

## Prompt tuning

AI prompt templates live inside `app/services/ai.py`'s prompt-building
logic — keep them tunable without needing a code deploy for wording
changes where practical.

## Notes on Gemini

`GEMINI_MODEL` in `.env` pins the exact model version — check it against
Google's current docs periodically; model names get renamed/deprecated
over time (this bit an earlier project on this same account already).
