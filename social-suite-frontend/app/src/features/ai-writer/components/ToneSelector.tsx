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
            "rounded-full border px-3 py-1 text-xs font-medium",
            value === tone.value ? "border-signal bg-signal-light text-signal-dark" : "border-border text-slate"
          )}
        >
          {tone.label}
        </button>
      ))}
    </div>
  );
}
