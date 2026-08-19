"use client";

import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitch() {
  const { theme, setTheme } = useUiStore();

  const getActiveIcon = () => {
    if (theme === "light") return <Sun size={16} className="text-amber-500" />;
    if (theme === "dark") return <Moon size={16} className="text-indigo-400" />;
    return <Laptop size={16} className="text-signal" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 w-9 items-center justify-center rounded-card text-slate hover:bg-ink/5 dark:hover:bg-white/10 outline-none transition-colors"
        aria-label="Theme selector"
      >
        {getActiveIcon()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between font-medium"
        >
          <span className="flex items-center gap-2">
            <Sun size={15} className="text-amber-500" /> Day Mode
          </span>
          {theme === "light" && <Check size={14} className="text-signal" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between font-medium"
        >
          <span className="flex items-center gap-2">
            <Moon size={15} className="text-indigo-400" /> Night Mode
          </span>
          {theme === "dark" && <Check size={14} className="text-signal" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between font-medium"
        >
          <span className="flex items-center gap-2">
            <Laptop size={15} className="text-signal" /> System (Laptop)
          </span>
          {theme === "system" && <Check size={14} className="text-signal" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
