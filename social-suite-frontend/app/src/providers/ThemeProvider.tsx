"use client";

import { useEffect } from "react";
import { useUiStore, type ThemeMode } from "@/store/ui-store";

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    // System laptop preference
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (systemPrefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
}

export function ThemeListener() {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (useUiStore.getState().theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return null;
}
