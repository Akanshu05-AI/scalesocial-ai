# Social Suite — Backend + Frontend

This repo contains two projects that run side by side:

```
AI-Tool-Backend/        ← your existing FastAPI backend (unmodified)
social-suite-frontend/  ← the Next.js frontend built to match it
```

The frontend works with the backend running, and **also works with it stopped** — see [Offline fallback](#offline-fallback-mode) below.

---

## 1. Prerequisites

- **Python 3.11+** (backend)
- **Node.js 18.18+** (frontend) — check with `node -v`
- **Redis** — either installed locally, or via Docker (see below)
- A **Supabase project** (free tier is fine) — auth is handled entirely by Supabase, not the backend itself
- API keys for whichever platforms you're testing: Twitter/X Developer App, Meta App (Facebook/Instagram), LinkedIn App, Gemini API key

You don't need all of these to explore the app — without them, the relevant features just show connection errors or fall back to demo data (see below).

---

## 2. Backend setup

```bash
cd AI-Tool-Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
```

Now edit `.env` and fill in real values. At minimum, for auth to work at all:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

(Get these from your Supabase dashboard → Project Settings → API.) The platform-specific keys (Twitter/Facebook/LinkedIn/Gemini) only need to be real if you're testing that specific integration.

**Redis** — the backend needs this for Celery. Either:
```bash
# Option A: Docker
docker run -d -p 6379:6379 redis:7-alpine

# Option B: your own local Redis, then set in .env
UPSTASH_REDIS_URL=redis://127.0.0.1:6379
```

**Run the API:**
```bash
uvicorn app.main:app --reload --port 8000
```
Confirm it's up: `http://localhost:8000/docs` should show the Swagger UI.

**Run the Celery worker** (needed for scheduling — a separate terminal):
```bash
python -m celery -A app.core.celery.celery_app worker --loglevel=info
```

**Or, all of the above via Docker Compose** (web + worker + redis in one go):
```bash
docker compose up
```

---

## 3. Frontend setup

```bash
cd social-suite-frontend/app
npm install --legacy-peer-deps
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```
Use the **same** Supabase project as the backend — the frontend logs in directly against Supabase (not through the FastAPI backend, which only verifies the token afterward), so they have to agree on which project that is.

**Run it:**
```bash
npm run dev
```
Open `http://localhost:3000`. You'll be redirected to `/login`.

**Create a test user** — either in Supabase dashboard → Authentication → Users → Add user, or build your own signup flow (not included; this app assumes accounts already exist).

---

## 4. Offline fallback mode

The brief asked for the frontend to keep working if the backend or database is down. Here's exactly what that means in this app, feature by feature — it's deliberately **not** a blanket "fake everything" switch, because that would be actively misleading for some things.

**Falls back to localStorage automatically** (network failure → local data, no error shown):
- Twitter: connected accounts list, posting a tweet/thread, scheduling
- AI Writer: brand voices, the generic schedule queue

**Never falls back — shows the real error instead:**
- Login (Supabase itself, not this backend, so "backend down" doesn't apply)
- AI content generation (`POST /ai/generate`) — there's no meaningful local stand-in for "write me a post"; faking a draft would be worse than an honest error
- Any request the backend actually *answered* with a real error (401, 404, 422, 500) — only a genuinely unreachable backend triggers fallback; a live server telling you "that's invalid" is a real answer, not a reason to pretend it succeeded

**Always local, never networked** (no backend endpoint exists for these at all, so there's nothing to "fall back" from):
- **Unified Inbox** — this backend has no DM/message-listing endpoints for any platform. It's demo data so the UI is explorable, clearly labeled as such in the app.
- **Facebook** — this backend never persists Facebook access tokens server-side; the frontend holds them in `localStorage` by necessity, not as a resilience feature.

**How the mechanism works:** every API call goes through `axios`. If the request never reaches the backend (connection refused, timeout, DNS failure), the error's `status` comes back `null`; a `withOfflineFallback()` wrapper (`src/services/resilient-request.ts`) checks for exactly that and swaps in a `localStorage`-backed equivalent (`src/lib/local-store.ts`). If the backend *did* respond — even with an error — that response is treated as real and passed through untouched.

**To test it yourself:** stop the backend (`Ctrl+C` on uvicorn) and keep using the app — Twitter posting/scheduling and the AI schedule queue should keep working using local data, refilling from the real backend automatically next time it's reachable.

---

## 5. Known gaps and inconsistencies (read before extending this)

These came directly out of analyzing the actual backend code, not guesses:

- **LinkedIn's routes use `user_id: int`** as a query parameter instead of deriving identity from the Supabase JWT the way every other authenticated router does. There's no real mapping between a logged-in Supabase UUID and this integer today — the frontend uses a locally-stored placeholder (Settings → Connections) as a stopgap. The real fix is backend-side: switch LinkedIn's router to `Depends(get_current_user)` like `users.py`/`ai.py`/`rbac.py` already do.
- **Facebook has no server-side token persistence** — `services/facebook.py` is a raw Graph API passthrough. The frontend holds the access token and each page's `page_access_token` in `localStorage` and sends them on every request. This is functional but not how the other platforms work, and not how you'd want real user tokens handled long-term.
- **No unified post/list endpoint exists anywhere.** Twitter can create/schedule but nothing lists history back; Facebook/Instagram/LinkedIn have no listing at all. The only real "list of scheduled things" is the generic `GET /ai/schedule` queue, which the Overview/Scheduled/Calendar pages use — Drafts and Published pages honestly show "no backend endpoint for this yet" rather than fabricated data.
- **OAuth callback redirects are inconsistent.** LinkedIn's callback redirects to `FRONTEND_URL` with `?connected=true|false` (the frontend's `/oauth/callback` page expects this). Twitter's and Facebook's callback handlers currently return raw JSON instead of redirecting anywhere — hitting them via a real browser OAuth redirect will show JSON, not bring the user back into the app. Fixing that (having those two redirect to `FRONTEND_URL` the same way LinkedIn's does) is a backend change, not something the frontend can work around.
- **The AI Writer is one endpoint, not three.** The "LinkedIn Article Generator" and "Twitter Thread Generator" pages both call the same `POST /ai/generate` as the main AI Writer, just with different defaults — there's no dedicated articles or hashtags route despite schemas existing for them in `schemas/ai.py`.
