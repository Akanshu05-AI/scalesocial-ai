"use client";

import { useState } from "react";
import { Textarea, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { schedulePostInstagram } from "../api";
import type { MediaType } from "../types";

export function InstagramComposer() {
  const [igUserId, setIgUserId] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE");
  const [caption, setCaption] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  async function handleSubmit() {
    setIsPending(true);
    try {
      const result = await schedulePostInstagram({
        ig_user_id: igUserId,
        media_url: mediaUrl,
        media_type: mediaType,
        caption,
      });
      toast({ title: `Instagram post ${result.status.toLowerCase()}`, variant: "success" });
      setCaption("");
      setMediaUrl("");
    } catch (error) {
      toast({ title: "Couldn't queue post", description: (error as { message: string }).message, variant: "error" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="rounded-card border border-amber/40 bg-amber-light px-3 py-2 text-xs text-ink">
        Instagram&apos;s Graph API needs a public HTTPS URL for media — it fetches the image/video
        itself server-side. There&apos;s no file-upload endpoint here like Twitter&apos;s, so host
        your media somewhere first and paste the URL.
      </p>
      <Input value={igUserId} onChange={(e) => setIgUserId(e.target.value)} placeholder="Instagram Business Account ID" />
      <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="Public media URL (https://...)" />
      <Tabs value={mediaType} onValueChange={(v) => setMediaType(v as MediaType)}>
        <TabsList>
          <TabsTrigger value="IMAGE">Image</TabsTrigger>
          <TabsTrigger value="VIDEO">Video</TabsTrigger>
        </TabsList>
      </Tabs>
      <Textarea rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption…" />
      <Button disabled={!igUserId || !mediaUrl || isPending} onClick={handleSubmit}>
        {isPending ? "Queuing…" : "Post to Instagram"}
      </Button>
    </div>
  );
}
