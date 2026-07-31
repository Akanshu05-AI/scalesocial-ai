"use client";

import { useState } from "react";
import { Copy, RefreshCw, SendHorizonal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useRefineContent } from "../hooks/useGenerateContent";
import type { GenerateResponse } from "../types";

export function GeneratedContentCard({
  content,
  onRegenerate,
  onUseDraft,
}: {
  content: GenerateResponse;
  onRegenerate: () => void;
  onUseDraft: (draft: string) => void;
}) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(content.draft);
  const [instruction, setInstruction] = useState("");
  const refine = useRefineContent();

  function handleRefine() {
    if (!instruction.trim()) return;
    refine.mutate(
      { draft, instruction },
      { onSuccess: (res) => setDraft(res.refined_content) }
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <Textarea rows={6} value={draft} onChange={(e) => setDraft(e.target.value)} />
        {content.hashtags.length > 0 && (
          <p className="text-xs text-signal-dark">{content.hashtags.map((h) => `#${h}`).join(" ")}</p>
        )}

        <div className="flex gap-2">
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. make it shorter, add a hook, more casual…"
            className="h-9 flex-1 rounded-card border border-border px-3 text-xs"
          />
          <Button size="sm" variant="outline" disabled={refine.isPending} onClick={handleRefine}>
            {refine.isPending ? "Refining…" : "Refine"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(draft);
              toast({ title: "Copied to clipboard" });
            }}
          >
            <Copy size={14} />
            Copy
          </Button>
          <Button size="sm" variant="outline" onClick={onRegenerate}>
            <RefreshCw size={14} />
            Regenerate
          </Button>
          <Button size="sm" onClick={() => onUseDraft(draft)}>
            <SendHorizonal size={14} />
            {content.platform === "x" ? "Send to Twitter composer" : "Use this draft"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
