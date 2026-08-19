# ScaleSocial AI — Enterprise Multi-Channel Social Management Suite

[![Next.js](https://img.shields.io/badge/Next.js-15.5.21-black?logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://www.python.org/)
[![Celery](https://img.shields.io/badge/Celery-5.0+-37B24D?logo=celery)](https://docs.celeryq.dev/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis)](https://upstash.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.5--Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-10%20Passed-brightgreen)](https://github.com/)

**ScaleSocial AI** is a production-ready, enterprise-grade social media management suite designed to automate multi-channel content publishing, AI generation, and engagement analytics across **Twitter / X**, **LinkedIn**, **Facebook**, and **Instagram**.

---

## 🌟 Key Features & Architecture Highlights

### ⚡ 1. Unified Multi-Platform Batch Composer
- Write once and cross-post to **Twitter/X**, **LinkedIn**, **Facebook**, and **Instagram** simultaneously.
- Live per-platform character counter validation (280 chars for Twitter, 3,000 for LinkedIn).
- Instant or scheduled multi-channel dispatching.

### 🤖 2. Gemini 2.5 AI Writer Engine
- Generate platform-optimized copy with customizable tone, length, and trending hashtag suggestions.
- Interactive iterative refiner tool ("Make it shorter", "Add call-to-action", "Bolder tone").
- One-click transfer directly into the Multi-Platform Composer.

### 🎨 3. 3-Option Theme System with OS Preference Sync
- Seamless dropdown switching between **Day ☀️ (Light Mode)**, **Night 🌙 (Dark Mode)**, and **Laptop System 💻 (Auto OS Sync)**.
- High-contrast dark mode styling for all text inputs, textareas, notice banners, and datetime pickers.
- Zero Flash of Unstyled Content (FOUC) during SSR.

### 📊 4. Enterprise Performance & Analytics Dashboard
- Visual breakdown of impressions, engagement rate, reactions, and share distribution across channels.
- **Live Tweet Metric Query Tool**: Look up live Twitter API v2 engagement statistics for any published Tweet ID.

### 📅 5. Visual Publishing Calendar & Saved Drafts
- **Agenda Timeline** & **Weekly Grid** calendar views showing scheduled content pipeline.
- Interactive Saved Drafts workspace with search, platform tags, and composer loading.

### 🔒 6. Zero-Trust Security & JWT Auth
- Bearer JWT token verification via Supabase Auth.
- Strict IDOR prevention: All user endpoints derive identity from `get_current_user_id`.
- Fast **200ms fail-open socket timeout** on Redis rate limiters to prevent API hangs.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   Next.js 15 App Router Frontend                         │
│   src/app/(dashboard)  │  src/features/*  │  src/store (Zustand UI)    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTP REST API (Bearer JWT Header)
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

## 📁 Repository Structure

```
scalesocial-ai-final/
├── AI-Tool-Backend/                   # FastAPI Python App Server & Celery Workers
│   ├── app/
│   │   ├── api/v1/                    # API Routers (Auth, AI, Twitter, LinkedIn, Meta)
│   │   ├── core/                      # Config, Celery App, Security, Exceptions
│   │   ├── middleware/                # Fast Redis Rate Limiter
│   │   ├── services/                  # AI Service, Instagram Publishing, Publisher
│   │   └── workers/                   # Celery Background Scheduler & Webhook Task Processors
│   ├── tests/                         # Pytest Integration Suite (10 Passed)
│   ├── pytest.ini
│   └── requirements.txt
│
├── social-suite-frontend/
│   └── app/                           # Next.js 15 App Router Frontend
│       ├── src/
│       │   ├── app/(dashboard)/       # Dashboard Routes (Overview, Compose, Analytics, etc.)
│       │   ├── components/            # UI Components & Layout Shell (Sidebar, Topbar, ThemeSwitch)
│       │   ├── features/              # Feature Modules (UnifiedBatchComposer, Twitter, LinkedIn)
│       │   ├── providers/             # AppProviders & ThemeProvider (OS Preference Sync)
│       │   └── store/                 # Zustand Stores (ui-store, compose-draft-store)
│       ├── package.json
│       └── tsconfig.json
│
├── PROJECT_AUDIT.md                   # Full System Audit & Diagnostics Report
├── ARCHITECTURE.md                    # Technical Architecture & State Machine Spec
├── SECURITY.md                        # Security & Compliance Specification
├── TEAM_CHANGES.md                    # Developer Engineering Log
└── FINAL_PROJECT_REPORT.md            # Audit Verification Summary
```

---

## ⚡ Quickstart Guide: Running Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **Redis**: Local Redis instance or Upstash Redis URL

---

### 2. Backend Setup (`AI-Tool-Backend`)

```bash
# Navigate to backend directory
cd AI-Tool-Backend

# Activate Virtual Environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r requirements.txt

# Run FastAPI Server (Port 8000)
uvicorn app.main:app --reload --port 8000

# Run Celery Worker (In a separate terminal tab)
python -m celery -A app.core.celery_app worker --loglevel=info
```

> **Backend API Docs**: Open `http://localhost:8000/docs` for interactive Swagger UI documentation.

---

### 3. Frontend Setup (`social-suite-frontend/app`)

```bash
# Navigate to frontend directory
cd social-suite-frontend/app

# Install Dependencies
npm install

# Run Next.js Development Server (Port 3000)
npm run dev
```

> **Web Application**: Open `http://localhost:3000` in your web browser.

---

## 🧪 Testing & Verification

### Run Backend Pytest Suite
```bash
cd AI-Tool-Backend
.\venv\Scripts\pytest
```
*Result*: `10 passed in 1.17s`

### Run Frontend Type Check
```bash
cd social-suite-frontend/app
npx tsc --noEmit
```
*Result*: `0 errors`

---

## ⚡ Continuous Demo Mode

Forget your email/password? Click the **⚡ Continue as Demo User (Bypass Sign-In)** button on the login screen (`http://localhost:3000/login`) to launch directly into the dashboard with pre-loaded demo metrics and channels.

---

## 📄 License & Attribution

Designed & Engineered for **ScaleSocial AI Enterprise**. All rights reserved.
