# ScaleSocial AI — System Architecture & Design Specification

## Overview

ScaleSocial AI is designed as a decoupled, multi-tier enterprise SaaS application:
1. **Frontend Presentation & Application Tier**: Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS, Zustand).
2. **Backend API & Orchestration Tier**: FastAPI (Python 3.11+, Pydantic v2, SQLAlchemy).
3. **Database & Auth Tier**: Supabase PostgreSQL + Supabase JWT Authentication.
4. **Asynchronous Worker Tier**: Celery task runner backed by Redis message broker.
5. **AI Services Tier**: Google Gemini API via `google.generativeai` SDK.

---

## Technical Stack & Layering

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   Next.js 15 App Router Frontend                         │
│   src/app/(dashboard)  │  src/features/*  │  src/store (Zustand UI)    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTP REST API (JWT Bearer Header)
┌────────────────────────────────────▼─────────────────────────────────────┐
│                    FastAPI Python Backend (App Server)                   │
│   app/api/v1/* (Endpoints)  │  app/services/*  │  app/deps.py (Auth)     │
└──────────────┬─────────────────────┬─────────────────────┬───────────────┘
               │                     │                     │
               ▼                     ▼                     ▼
┌──────────────────────────┐ ┌──────────────────┐ ┌────────────────────────┐
│   Supabase PostgreSQL    │ │ Redis & Celery   │ │   Social Graph APIs    │
│ (Users, Accounts, Posts) │ │ Worker Queue     │ │ Twitter, LinkedIn, Meta│
└──────────────────────────┘ └──────────────────┘ └────────────────────────┘
```

---

## Post Lifecycle State Machine

Every post managed by ScaleSocial AI passes through a deterministic lifecycle state machine:

```
┌─────────┐       Schedule Post      ┌───────────┐       Trigger Time      ┌────────────┐
│  DRAFT  ├─────────────────────────►│ SCHEDULED ├────────────────────────►│ PROCESSING │
└─────────┘                          └─────┬─────┘                         └─────┬──────┘
                                           │                                     │
                                           │ Immediate Publish                   │ Social API Success
                                           ▼                                     ▼
                                    ┌────────────┐                        ┌───────────┐
                                    │ PUBLISHED  │◄───────────────────────┤ PUBLISHED │
                                    └────────────┘                        └───────────┘
                                                                                 │ Social API Fail
                                                                                 ▼
                                                                          ┌───────────┐
                                                                          │  FAILED   │
                                                                          └───────────┘
```

---

## Key Modules & Responsibilities

### 1. Frontend Architecture (`social-suite-frontend/app/src`)
- **`app/(dashboard)`**: Route layouts for Overview, Composer, Drafts, Scheduled, Published, Calendar, Inbox, AI Writer, Analytics, and Settings.
- **`features/publishing/components/UnifiedBatchComposer.tsx`**: Multi-channel cross-posting composer allowing users to target Twitter/X, LinkedIn, Facebook, and Instagram simultaneously with character counter validation.
- **`store/ui-store.ts`**: Global Zustand store managing sidebar state and the **3-Option Theme System** (`light`, `dark`, `system`).
- **`providers/ThemeProvider.tsx`**: Listens to system `window.matchMedia("(prefers-color-scheme: dark)")` media queries for real-time OS preference syncing.

### 2. Backend Architecture (`AI-Tool-Backend/app`)
- **`api/v1/`**: Endpoint handlers for authentication, AI generation, Twitter, LinkedIn, Facebook, Instagram, and RBAC.
- **`core/config.py`**: Environment settings loader with robust fallbacks for local dev and testing.
- **`api/deps.py`**: JWT validation dependency (`get_current_user_id`) decoding token `sub` and validating identity.
- **`middleware/rate_limiter.py`**: Redis rate limiting with fast 200ms socket timeouts.
- **`workers/celery_worker.py`**: Celery asynchronous background worker executing scheduled post dispatches.
