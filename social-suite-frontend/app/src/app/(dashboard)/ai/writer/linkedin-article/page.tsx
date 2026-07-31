import { PageHeader } from "@/components/PageHeader";
import { AiGeneratorForm } from "@/features/ai-writer/components/AiGeneratorForm";

export default function LinkedInArticlePage() {
  return (
    <div>
      <PageHeader
        title="LinkedIn Article Generator"
        description="Longer-form thought leadership pieces — same generator, tuned for length."
      />
      <p className="mb-4 rounded-card border border-amber/40 bg-amber-light px-3 py-2 text-xs text-ink">
        The backend&apos;s ArticleRequest/ArticleResponse schemas exist but aren&apos;t wired to a
        route yet — this uses the same <code>/ai/generate</code> endpoint as the main AI Writer,
        with length set to long, rather than a dedicated articles endpoint.
      </p>
      <AiGeneratorForm platform="linkedin" defaultLength="long" />
    </div>
  );
}
