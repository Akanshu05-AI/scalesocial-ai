# Social Suite — Frontend

Production-oriented Next.js 15 frontend for a social media management platform, built against an existing FastAPI backend (JWT + HttpOnly refresh cookie auth, server-brokered OAuth for Twitter/LinkedIn/Facebook/Instagram).

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your FastAPI base URL
npm run dev
```

## What's here

- `src/app` — routes only, split into `(auth)` and `(dashboard)` route groups
- `src/features` — one folder per module (auth, publishing, inbox, ai-writer): components, hooks, api calls, zod schemas, types
- `src/components` — generic, feature-agnostic UI (DataTable, EmptyState, PageHeader, and the `ui/` primitives)
- `src/services/api-client.ts` — axios instance with JWT attach + silent-refresh interceptor
- `src/store` — Zustand: `auth-store` (in-memory token), `ui-store` (theme/sidebar, persisted), `compose-draft-store` (session-persisted draft, also used by the AI Writer → Composer handoff)
- `src/middleware.ts` — edge-level redirect for unauthenticated dashboard access

## Known stubs / things to wire up against your real backend

- All `features/*/api.ts` files assume REST endpoints matching the paths used (`/posts`, `/inbox/conversations`, `/ai/generate`, etc.) — adjust to your actual FastAPI routes.
- `useInboxSocket` expects a WebSocket at `NEXT_PUBLIC_WS_URL + /inbox`; if the backend is polling-only today, the `refetchInterval` in `useConversations` already covers you and this hook is a safe no-op.
- The calendar page is a simple upcoming-agenda list, not a full month grid — a real drag-to-reschedule calendar (e.g. via `react-big-calendar`) is a natural next step over the same `usePosts` data.
- `middleware.ts` expects a non-HttpOnly `logged_in` flag cookie set alongside your HttpOnly refresh cookie at login — set that from wherever your backend issues the login response, or adjust the check to whatever session marker you use.
