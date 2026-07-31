import { createClient } from "@supabase/supabase-js";

/**
 * Auth happens directly against Supabase from the browser — the FastAPI
 * backend (per app/api/deps.py) only ever *verifies* the JWT Supabase
 * issues; it has no login/refresh endpoints of its own. Supabase's SDK
 * handles token refresh automatically (autoRefreshToken below), so the
 * axios interceptor in services/api-client.ts just reads whatever
 * session it currently holds rather than calling a backend refresh route.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
