"use client";

import { PageHeader } from "@/components/PageHeader";
import { AiGeneratorForm } from "@/features/ai-writer/components/AiGeneratorForm";

export default function AiWriterPage() {
  return (
    <div>
      <PageHeader title="AI Writer" description="Generate a LinkedIn post or a tweet, then edit before publishing." />
      <AiGeneratorForm platform="linkedin" defaultLength="medium" />
    </div>
  );
}
