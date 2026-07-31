"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Length } from "../types";

export function LengthSelector({ value, onChange }: { value: Length; onChange: (l: Length) => void }) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Length)}>
      <TabsList>
        <TabsTrigger value="short">Short</TabsTrigger>
        <TabsTrigger value="medium">Medium</TabsTrigger>
        <TabsTrigger value="long">Long</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
