# Social Suite — Frontend

Production Next.js 15 App Router frontend for the **ScaleSocial AI** enterprise social media management platform.

- **Live Production URL**: [https://scalesocial-ai.vercel.app](https://scalesocial-ai.vercel.app)
- **Direct AI Writer**: [https://scalesocial-ai.vercel.app/ai/writer](https://scalesocial-ai.vercel.app/ai/writer)
- **Connected Backend**: [https://scalesocial-ai.onrender.com](https://scalesocial-ai.onrender.com)

## Getting started locally

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to http://localhost:8000/api/v1
npm run dev
```

## Architecture & Layout

- `src/app` — routes only, split into `(auth)` and `(dashboard)` route groups
- `src/features` — module architecture (auth, publishing, inbox, ai-writer, twitter, linkedin, meta): components, hooks, api calls, zod schemas, types
- `src/components` — generic UI (DataTable, EmptyState, PageHeader, and Radix UI primitives)
- `src/services/api-client.ts` — resilient Axios instance with JWT auth headers, auto-retry, and circuit breaking
- `src/store` — Zustand stores: `auth-store` (tokens & demo mode), `ui-store` (theme & sidebar), `compose-draft-store` (batch composer drafts & AI writer handoff)
- `src/middleware.ts` — edge-level route protection

