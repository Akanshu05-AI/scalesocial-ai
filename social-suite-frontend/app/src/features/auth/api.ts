import { supabase } from "@/lib/supabase-client";
import { apiClient } from "@/services/api-client";
import type { LoginInput } from "./schema";

export async function login({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

/**
 * Confirmed: app/api/v1/users.py has NO "get current user profile"
 * endpoint at all — only GET/PATCH /users/me/settings (timezone,
 * language, notification_preferences). There is no backend source for
 * full_name/avatar_url; those come from Supabase's own session.user
 * (email, user_metadata) instead — see useAuthStore / AuthListener.
 * This function is for the settings backend actually has.
 */
export interface UserSettings {
  user_id: string;
  timezone: string;
  language: string;
  notification_preferences: Record<string, boolean>;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data: T;
  meta: Record<string, unknown> | null;
}

export async function fetchUserSettings() {
  const { data } = await apiClient.get<ApiEnvelope<UserSettings>>("/users/me/settings");
  return data.data;
}

export async function updateUserSettings(patch: Partial<Pick<UserSettings, "timezone" | "language" | "notification_preferences">>) {
  const { data } = await apiClient.patch<ApiEnvelope<UserSettings>>("/users/me/settings", patch);
  return data.data;
}
