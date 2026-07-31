"use client";

import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

export function FilterBar({
  options,
  active,
  onChange,
}: {
  options: FilterOption[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            active === opt.value
              ? "border-signal bg-signal-light text-signal-dark"
              : "border-border text-slate hover:bg-ink/5"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
