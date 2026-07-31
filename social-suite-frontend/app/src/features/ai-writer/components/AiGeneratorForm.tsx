"use client";

import { useState } from "react";
import { PromptInput } from "./PromptInput";
import { ToneSelector } from "./ToneSelector";
import { LengthSelector } from "./LengthSelector";
import { GeneratedContentCard } from "./GeneratedContentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGenerateContent } from "../hooks/useGenerateContent";
import { useComposeDraftStore } from "@/store/compose-draft-store";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import type { Platform, Tone, Length } from "../types";

/**
 * One shared form backing all three AI pages — the real backend
 * (app/api/v1/ai.py) has exactly one POST /ai/generate endpoint;
 * "LinkedIn Article Generator" and "Twitter Thread Generator" aren't
 * separate endpoints, just this same call with platform preset and
 * length defaulted to "long". Thread output (for platform="x") comes
 * back via is_thread/thread_parts on the same GenerateResponse, not a
 * different response shape.
 */
export function AiGeneratorForm({
  platform,
  defaultLength = "medium",
}: {
  platform: Platform;
  defaultLength?: Length;
}) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>(defaultLength);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const { mutate, data, isPending } = useGenerateContent();
  const loadFromGeneratedContent = useComposeDraftStore((s) => s.loadFromGeneratedContent);

  function generate() {
    mutate({ platform, topic, tone, length, include_hashtags: includeHashtags });
  }

  function useDraft(draft: string) {
    if (platform === "x") {
      loadFromGeneratedContent(draft, ["twitter"]);
      router.push(ROUTES.compose);
    }
    // LinkedIn has no compose integration yet (features/linkedin is
    // read/post-only against /linkedin/post) — copy-paste is the path
    // for now; see features/linkedin/api.ts.
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-4">
          <PromptInput value={topic} onChange={setTopic} />
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate">Tone</p>
            <ToneSelector value={tone} onChange={setTone} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate">Length</p>
            <LengthSelector value={length} onChange={setLength} />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate">
            <input
              type="checkbox"
              checked={includeHashtags}
              onChange={(e) => setIncludeHashtags(e.target.checked)}
            />
            Include hashtag suggestions
          </label>
          <Button disabled={!topic.trim() || isPending} onClick={generate}>
            {isPending ? "Generating…" : "Generate"}
          </Button>
        </CardContent>
      </Card>

      {data && <GeneratedContentCard content={data} onRegenerate={generate} onUseDraft={useDraft} />}
    </div>
  );
}
