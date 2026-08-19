"use client";

import { useState } from "react";
import { Textarea, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Twitter, Linkedin, Facebook, Instagram, Send, CheckCircle2, Sparkles } from "lucide-react";
import { PLATFORM_CONFIG, type Platform } from "@/constants";

export function UnifiedBatchComposer() {
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<Platform, boolean>>({
    twitter: true,
    linkedin: true,
    facebook: false,
    instagram: false,
  });
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  function togglePlatform(p: Platform) {
    setSelectedPlatforms((prev) => ({ ...prev, [p]: !prev[p] }));
  }

  async function handleBatchPublish() {
    setIsPending(true);
    try {
      const activePlatforms = (Object.keys(selectedPlatforms) as Platform[]).filter((p) => selectedPlatforms[p]);
      if (activePlatforms.length === 0) {
        toast({ title: "Select at least one social channel", variant: "error" });
        return;
      }

      // Simulate multi-channel queue dispatch
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({
        title: scheduledAt ? "Post scheduled across channels" : "Dispatched to selected channels",
        description: `Successfully targeted: ${activePlatforms.map((p) => PLATFORM_CONFIG[p].label).join(", ")}`,
        variant: "success",
      });
      setContent("");
      setScheduledAt("");
    } catch (e) {
      toast({ title: "Failed to publish batch post", description: (e as { message: string }).message, variant: "error" });
    } finally {
      setIsPending(false);
    }
  }

  const activeCount = Object.values(selectedPlatforms).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Target Channel Selector */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate">
          Target Channels ({activeCount} selected)
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => togglePlatform("twitter")}
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
              selectedPlatforms.twitter
                ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300"
                : "border-border text-slate opacity-60 hover:opacity-100"
            }`}
          >
            <Twitter size={16} className="text-sky-500" />
            <span>Twitter / X</span>
            {selectedPlatforms.twitter && <CheckCircle2 size={14} className="ml-auto text-sky-500" />}
          </button>

          <button
            type="button"
            onClick={() => togglePlatform("linkedin")}
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
              selectedPlatforms.linkedin
                ? "border-blue-600 bg-blue-600/10 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300"
                : "border-border text-slate opacity-60 hover:opacity-100"
            }`}
          >
            <Linkedin size={16} className="text-blue-600" />
            <span>LinkedIn</span>
            {selectedPlatforms.linkedin && <CheckCircle2 size={14} className="ml-auto text-blue-600" />}
          </button>

          <button
            type="button"
            onClick={() => togglePlatform("facebook")}
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
              selectedPlatforms.facebook
                ? "border-blue-700 bg-blue-700/10 text-blue-800 dark:bg-blue-700/20 dark:text-blue-300"
                : "border-border text-slate opacity-60 hover:opacity-100"
            }`}
          >
            <Facebook size={16} className="text-blue-700" />
            <span>Facebook</span>
            {selectedPlatforms.facebook && <CheckCircle2 size={14} className="ml-auto text-blue-700" />}
          </button>

          <button
            type="button"
            onClick={() => togglePlatform("instagram")}
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
              selectedPlatforms.instagram
                ? "border-pink-500 bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300"
                : "border-border text-slate opacity-60 hover:opacity-100"
            }`}
          >
            <Instagram size={16} className="text-pink-500" />
            <span>Instagram</span>
            {selectedPlatforms.instagram && <CheckCircle2 size={14} className="ml-auto text-pink-500" />}
          </button>
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate">Post Content</label>
          <div className="flex items-center gap-2 text-xs">
            {selectedPlatforms.twitter && (
              <span className={content.length > 280 ? "text-rose font-bold" : "text-slate"}>
                Twitter: {content.length}/280
              </span>
            )}
            {selectedPlatforms.linkedin && (
              <span className="text-slate">LinkedIn: {content.length}/3000</span>
            )}
          </div>
        </div>
        <Textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Craft your post content here... It will automatically be formatted for all selected channels."
        />
      </div>

      {/* Schedule Datetime */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate">
          Schedule Execution (Optional)
        </label>
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="h-10 w-full sm:w-72 text-xs"
        />
      </div>

      {/* Publish Action */}
      <Button
        disabled={!content.trim() || activeCount === 0 || isPending}
        onClick={handleBatchPublish}
        className="w-full sm:w-auto"
      >
        <Send size={16} className="mr-1.5" />
        {isPending ? "Dispatching Batch…" : scheduledAt ? "Schedule Cross-Post" : "Publish to Selected Channels"}
      </Button>
    </div>
  );
}
