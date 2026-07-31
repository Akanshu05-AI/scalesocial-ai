"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuthStore } from "@/store/auth-store";

function extractProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  return {
    id: user.id,
    email: user.email ?? null,
    fullName: (user.user_metadata?.full_name as string) ?? (user.user_metadata?.name as string) ?? null,
    avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
  };
}

/**
 * Mounted once near the root (see AppProviders). Keeps useAuthStore in
 * sync with Supabase's own session lifecycle and maintains the
 * non-HttpOnly "logged_in" flag cookie that middleware.ts checks at the
 * edge (Supabase's session itself lives in localStorage, which
 * middleware can't read).
 */
export function AuthListener() {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(extractProfile(session.user));
        document.cookie = "logged_in=true; path=/; max-age=86400";
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(extractProfile(session.user));
        document.cookie = "logged_in=true; path=/; max-age=86400";
      } else {
        clearSession();
        document.cookie = "logged_in=; path=/; max-age=0";
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, clearSession]);

  return null;
}
