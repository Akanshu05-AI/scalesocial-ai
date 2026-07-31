import { create } from "zustand";
import type { UserSettings } from "@/features/auth/api";

interface AuthState {
  /** Source of truth for identity is Supabase's session — id/email plus
   *  whatever user_metadata the account has (full_name, avatar_url are
   *  common Supabase Auth conventions, but not guaranteed to exist). */
  supabaseUserId: string | null;
  supabaseEmail: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  /** Real backend data: GET /users/me/settings. */
  settings: UserSettings | null;
  setSession: (params: { id: string; email: string | null; fullName: string | null; avatarUrl: string | null }) => void;
  setSettings: (settings: UserSettings) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  supabaseUserId: null,
  supabaseEmail: null,
  fullName: null,
  avatarUrl: null,
  settings: null,
  setSession: ({ id, email, fullName, avatarUrl }) =>
    set({ supabaseUserId: id, supabaseEmail: email, fullName, avatarUrl }),
  setSettings: (settings) => set({ settings }),
  clearSession: () =>
    set({ supabaseUserId: null, supabaseEmail: null, fullName: null, avatarUrl: null, settings: null }),
}));
