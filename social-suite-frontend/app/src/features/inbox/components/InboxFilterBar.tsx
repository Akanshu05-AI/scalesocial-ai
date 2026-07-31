"use client";

import { FilterBar } from "@/components/FilterBar";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "dm", label: "DMs" },
  { value: "comment", label: "Comments" },
  { value: "mention", label: "Mentions" },
];

export function InboxFilterBar({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  return <FilterBar options={TYPE_OPTIONS} active={active} onChange={onChange} />;
}
