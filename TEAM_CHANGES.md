# ScaleSocial AI — Team Changes & Architecture Log

This document tracks all architectural improvements, security enhancements, UI redesigns, and developer workflows implemented across the repository.

---

## 📅 Summary of Key Improvements (August 19, 2026)

### 1. 🔒 Security & Authentication Hardening
- **LinkedIn IDOR Vulnerability Fix** ([`linkedin/router.py`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/AI-Tool-Backend/app/api/v1/linkedin/router.py)): Replaced raw integer query parameters with authenticated `user_id: str = Depends(get_current_user_id)`.
- **Twitter User Identity** ([`twitter.py`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/AI-Tool-Backend/app/api/v1/twitter.py)): Replaced mock hardcoded user ID with token-verified JWT identity `Depends(get_current_user_id)`.
- **Auth Error Envelopes** ([`deps.py`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/AI-Tool-Backend/app/api/deps.py)): Enforced HTTP 401 Unauthorized responses on invalid or missing tokens.
- **Safe Demo Mode**: Maintained isolated local state for Demo User (`00000000-0000-0000-0000-000000000000`), ensuring production databases remain untouched during live demos.

### 2. ⚡ Performance & Backend Resiliency
- **Fast Socket Timeouts** ([`rate_limiter.py`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/AI-Tool-Backend/app/middleware/rate_limiter.py)): Configured `socket_timeout=0.2` & `socket_connect_timeout=0.2` on Redis client. If Redis is unreachable, backend fails open in 200ms without blocking HTTP API requests.
- **Config Defaults** ([`config.py`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/AI-Tool-Backend/app/core/config.py)): Added robust fallback defaults for local development without `.env` errors.
- **Backend Test Suite Passed**: Ran `pytest` in `AI-Tool-Backend` (`9 passed, 1 skipped`).

### 3. 🎨 UI/UX Redesign & 3-Theme System
- **3-Option Theme Dropdown** ([`ThemeSwitch.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/components/layout/ThemeSwitch.tsx)): Implemented Day ☀️, Night 🌙, and System (Laptop OS Sync) 💻 theme selector.
- **Real-Time OS Sync** ([`ThemeProvider.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/providers/ThemeProvider.tsx)): Added media query listener (`prefers-color-scheme: dark`) to dynamically update theme when user changes laptop system mode.
- **Command Center Dashboard** ([`overview/page.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/app/%28dashboard%29/overview/page.tsx)): Redesigned Overview with teal gradient hero banner, metric cards, platform status indicators, and quick action buttons.
- **Unified Multi-Post Batch Tab** ([`UnifiedBatchComposer.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/features/publishing/components/UnifiedBatchComposer.tsx)): Added a featured cross-posting tab in Composer to target Twitter/X, LinkedIn, Facebook, and Instagram simultaneously with live character limits.
- **Analytics Dashboard Page** ([`overview/analytics/page.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/app/%28dashboard%29/overview/analytics/page.tsx)): Upgraded Analytics into a full-scale metric overview dashboard with impression trends, channel distribution bars, and live tweet API lookup tool.
- **Saved Drafts Workspace** ([`drafts/page.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/app/%28dashboard%29/publishing/drafts/page.tsx)): Upgraded Drafts page into an interactive workspace with search, platform tags, and direct transfer into Composer.
- **Published Content Log** ([`published/page.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/app/%28dashboard%29/publishing/published/page.tsx)): Upgraded Published page with post history cards, status badges, and engagement metrics.
- **Content Calendar** ([`calendar/page.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/app/%28dashboard%29/publishing/calendar/page.tsx)): Added Agenda Timeline and Weekly Grid views with scheduled execution badges.
- **Channel Connection Hub** ([`connections/page.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/app/%28dashboard%29/settings/connections/page.tsx)): Upgraded Connections settings with brand cards, active status badges, and OAuth actions.
- **High-Contrast Dark Mode Rules** ([`globals.css`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/app/globals.css) & [`input.tsx`](file:///c:/Users/Akanshu/.gemini/antigravity-ide/scratch/scalesocial-ai-final/social-suite-frontend/app/src/components/ui/input.tsx)): Fixed text contrast in inputs, textareas, notice banners, date pickers, and tab triggers in dark mode.

---

## 🛠️ Developer Impact & Running Instructions

### Backend (FastAPI + Celery)
```powershell
# Terminal 1: API Server
cd AI-Tool-Backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Terminal 2: Worker Queue
cd AI-Tool-Backend
.\venv\Scripts\Activate.ps1
celery -A app.core.celery_app worker --loglevel=info
```

### Frontend (Next.js 15)
```powershell
# Terminal 3: Web App
cd social-suite-frontend\app
npm run dev
```

Visit `http://localhost:3000` to interact with the application.
