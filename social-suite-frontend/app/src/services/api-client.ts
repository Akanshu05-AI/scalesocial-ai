import axios, { type AxiosError } from "axios";
import { supabase } from "@/lib/supabase-client";
import { normalizeError } from "./response-helpers";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

/**
 * Every request reads whatever Supabase session currently exists.
 * Supabase's SDK refreshes the token in the background on its own
 * schedule (autoRefreshToken: true), so there's no custom 401 → refresh
 * → retry dance here like a self-issued-JWT backend would need — if
 * the session is gone, Supabase's onAuthStateChange (wired in
 * ProtectedRoute) is what redirects to /login, not this interceptor.
 */
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Supabase's own session is invalid/expired and its background
      // refresh didn't save it — sign out locally and let
      // onAuthStateChange in ProtectedRoute redirect to /login.
      await supabase.auth.signOut();
    }
    return Promise.reject(normalizeError(error));
  }
);
