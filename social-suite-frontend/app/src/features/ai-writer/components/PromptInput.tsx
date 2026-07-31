"use client";

import { Textarea } from "@/components/ui/input";

export function PromptInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Textarea
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="What do you want to write about? e.g. 'Announcing our Series A funding round'"
    />
  );
}
