# ScaleSocial AI — Security & Compliance Architecture

## Security Overview

ScaleSocial AI enforces zero-trust authentication, role-based access control, token verification, and secret isolation across all API endpoints and frontend features.

---

## 1. Authentication & JWT Validation

- **Token Handler**: `app/api/deps.py` decodes Bearer tokens issued by Supabase Auth using `pyjwt`.
- **Identity Enforcement**: `get_current_user_id` verifies JWT signature and extracts the `sub` claim (user UUID).
- **Unauthorized Standard**: Requests lacking valid tokens receive HTTP 401 Unauthorized JSON envelopes:
  ```json
  {
    "detail": "Not authenticated"
  }
  ```

---

## 2. Authorization & IDOR Protection

- **Resource Ownership**: All Twitter and LinkedIn database queries check `user_id == authenticated_user_id`. Users cannot view or delete accounts belonging to other accounts.
- **IDOR Remediation**: Fixed endpoints (`/api/v1/linkedin/posts`, `/api/v1/twitter/accounts`) to use `Depends(get_current_user_id)` instead of accepting integer/string user IDs as query parameters.

---

## 3. Demo Mode Security Boundary

- **Demo User UUID**: `00000000-0000-0000-0000-000000000000` is reserved for offline demo sessions.
- **Isolation**: Demo credentials are stored exclusively in client `localStorage` and isolated UI state. No production tokens or database rows are mutated during Demo Mode.

---

## 4. Secret & Environment Isolation

- **Zero Exposed Secrets**: All sensitive API keys (`SUPABASE_SERVICE_ROLE_KEY`, `TWITTER_API_SECRET`, `GEMINI_API_KEY`) are stored strictly in server-side `.env` files.
- **Frontend Hygiene**: Next.js client environment variables are limited to public endpoint URLs (`NEXT_PUBLIC_API_BASE_URL`).
