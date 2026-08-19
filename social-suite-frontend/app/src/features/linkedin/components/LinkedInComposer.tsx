"use client";

import { useState } from "react";
import { Textarea, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useLinkedInUserId } from "../hooks/useLinkedInUserId";
import { createLinkedInPost, createLinkedInImagePost } from "../api";

export function LinkedInComposer() {
  const { userId } = useLinkedInUserId();
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  async function handlePost() {
    setIsPending(true);
    try {
      const result = imageFile
        ? await createLinkedInImagePost(userId, text, imageFile)
        : await createLinkedInPost(userId, { text, image_url: imageUrl || undefined });
      toast({
        title: result.success ? "Posted to LinkedIn" : "LinkedIn returned an error",
        description: result.message,
        variant: result.success ? "success" : "error",
      });
      if (result.success) {
        setText("");
        setImageUrl("");
        setImageFile(null);
      }
    } catch (error) {
      toast({
        title: "Couldn't post to LinkedIn",
        description: (error as { message: string }).message,
        variant: "error",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-500/40 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200">
        Using authenticated LinkedIn user session — connect or manage details in Settings → Connections.
      </p>
      <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your LinkedIn post…" />
      <div className="flex items-center gap-2">
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
          className="h-9 flex-1 text-xs"
          disabled={!!imageFile}
        />
        <span className="text-xs text-slate">or</span>
        <label className="cursor-pointer text-xs text-signal-dark">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          {imageFile ? imageFile.name : "upload a file"}
        </label>
      </div>
      <Button disabled={!text.trim() || isPending} onClick={handlePost}>
        {isPending ? "Posting…" : "Post to LinkedIn"}
      </Button>
    </div>
  );
}
