import { PageHeader } from "@/components/PageHeader";
import { AiGeneratorForm } from "@/features/ai-writer/components/AiGeneratorForm";

export default function TwitterThreadPage() {
  return (
    <div>
      <PageHeader title="Twitter Thread Generator" description="Multi-tweet threads from one idea." />
      <p className="mb-4 rounded-card border border-amber/40 bg-amber-light px-3 py-2 text-xs text-ink">
        Thread output comes back as <code>is_thread</code> / <code>thread_parts</code> on the same
        generate response — there&apos;s no separate thread endpoint. If the model doesn&apos;t judge
        the topic thread-worthy, you&apos;ll get a single draft back instead.
      </p>
      <AiGeneratorForm platform="x" defaultLength="long" />
    </div>
  );
}
