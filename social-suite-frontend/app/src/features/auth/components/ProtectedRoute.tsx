"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { fetchUserSettings } from "../api";
import { QUERY_KEYS, ROUTES } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * AuthListener (mounted in AppProviders) determines whether a Supabase
 * session exists. This gates rendering on that, plus best-effort fetches
 * GET /users/me/settings — if the backend is down this quietly fails
 * (isError just gets ignored) rather than blocking the whole dashboard,
 * since a live session with the backend down should still let someone
 * click around the UI.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabaseUserId = useAuthStore((s) => s.supabaseUserId);
  const setSettings = useAuthStore((s) => s.setSettings);

  const { data } = useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: fetchUserSettings,
    enabled: !!supabaseUserId,
    retry: false,
  });

  useEffect(() => {
    if (data) setSettings(data);
  }, [data, setSettings]);

  // Give AuthListener's initial supabase.auth.getSession() a moment to
  // resolve before deciding there's no session — it's async on mount.
  useEffect(() => {
    if (supabaseUserId === null) {
      const timeout = setTimeout(() => {
        if (useAuthStore.getState().supabaseUserId === null) router.replace(ROUTES.login);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [supabaseUserId, router]);

  if (!supabaseUserId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
