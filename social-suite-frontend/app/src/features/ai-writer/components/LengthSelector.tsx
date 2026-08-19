"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Length } from "../types";

export function LengthSelector({ value, onChange }: { value: Length; onChange: (l: Length) => void }) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Length)}>
      <TabsList className="bg-paper/80 p-1 dark:bg-white/10">
        <TabsTrigger value="short" className="text-slate dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-ink dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white font-medium">
          Short
        </TabsTrigger>
        <TabsTrigger value="medium" className="text-slate dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-ink dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white font-medium">
          Medium
        </TabsTrigger>
        <TabsTrigger value="long" className="text-slate dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-ink dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white font-medium">
          Long
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
