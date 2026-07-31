"use client";

import { Sun, Moon } from "lucide-react";
import { useUiStore } from "@/store/ui-store";

export function ThemeSwitch() {
  const { theme, setTheme } = useUiStore();

  return (
    <button
      onClick={() => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }}
      className="flex h-9 w-9 items-center justify-center rounded-card text-slate hover:bg-ink/5"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
