import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ui-preferences" }
  )
);
