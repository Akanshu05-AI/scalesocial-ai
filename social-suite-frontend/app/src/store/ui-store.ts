import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ui-preferences" } // localStorage — fine to persist across sessions
  )
);
