"use client";

import { cn } from "@/lib/utils";
import type { Tone } from "../types";

const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "bold", label: "Bold" },
  { value: "storytelling", label: "Storytelling" },
];

export function ToneSelector({ value, onChange }: { value: Tone; onChange: (t: Tone) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TONES.map((tone) => (
        <button
          key={tone.value}
          type="button"
          onClick={() => onChange(tone.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            value === tone.value
              ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-400"
              : "border-border text-slate dark:text-slate-300 hover:bg-ink/5 dark:hover:bg-white/10"
          )}
        >
          {tone.label}
        </button>
      ))}
    </div>
  );
}
