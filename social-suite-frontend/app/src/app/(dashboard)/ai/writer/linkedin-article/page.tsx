"use client";

import { PageHeader } from "@/components/PageHeader";
import { AiGeneratorForm } from "@/features/ai-writer/components/AiGeneratorForm";

export default function LinkedInArticlePage() {
  return (
    <div>
      <PageHeader
        title="LinkedIn Article Generator"
        description="Longer-form thought leadership pieces — same generator, tuned for length."
      />
      <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-500/40 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200">
        Generates long-form thought leadership articles using tuned AI model parameters.
      </p>
      <AiGeneratorForm platform="linkedin" defaultLength="long" />
    </div>
  );
}
