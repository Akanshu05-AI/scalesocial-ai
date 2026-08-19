"use client";

import { PageHeader } from "@/components/PageHeader";
import { AiGeneratorForm } from "@/features/ai-writer/components/AiGeneratorForm";

export default function TwitterThreadPage() {
  return (
    <div>
      <PageHeader title="Twitter Thread Generator" description="Multi-tweet threads from one idea." />
      <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-500/40 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200">
        Thread output is automatically segmented into numbered tweet parts when generated.
      </p>
      <AiGeneratorForm platform="x" defaultLength="long" />
    </div>
  );
}
