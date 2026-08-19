"use client";

import { useState } from "react";
import { Textarea, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useFacebookSession } from "../hooks/useFacebookSession";
import { getFacebookLoginUrl, fetchFacebookPages, createFacebookPost } from "../api";

export function FacebookComposer() {
  const { accessToken, setAccessToken, selectedPage, setSelectedPage } = useFacebookSession();
  const [pages, setPages] = useState<Awaited<ReturnType<typeof fetchFacebookPages>>>([]);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  async function connect() {
    const { url } = await getFacebookLoginUrl();
    window.location.href = url;
  }

  async function loadPages() {
    if (!accessToken) return;
    const result = await fetchFacebookPages(accessToken);
    setPages(result);
  }

  async function handlePost() {
    if (!selectedPage) return;
    setIsPending(true);
    try {
      await createFacebookPost(selectedPage.id, selectedPage.access_token, message);
      toast({ title: "Posted to Facebook Page", variant: "success" });
      setMessage("");
    } catch (error) {
      toast({ title: "Couldn't post", description: (error as { message: string }).message, variant: "error" });
    } finally {
      setIsPending(false);
    }
  }

  if (!accessToken) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate">
          No Facebook access token on this device yet. This backend doesn&apos;t store Facebook
          tokens server-side (see the note in features/facebook/api.ts) — connecting here holds
          the token in this browser only.
        </p>
        <Button size="sm" variant="outline" onClick={connect}>
          Connect Facebook
        </Button>
        <div className="pt-2">
          <label className="mb-1 block text-xs font-medium text-slate">
            Or paste a token directly (dev/testing)
          </label>
          <Input
            className="h-9 text-xs"
            placeholder="Page or user access token"
            onBlur={(e) => e.target.value && setAccessToken(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pages.length === 0 ? (
        <Button size="sm" variant="outline" onClick={loadPages}>
          Load my Pages
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page)}
              className={`rounded-full border px-3 py-1 text-xs ${
                selectedPage?.id === page.id ? "border-signal bg-signal-light" : "border-border"
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>
      )}

      <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your Page post…" />
      <Button disabled={!selectedPage || !message.trim() || isPending} onClick={handlePost}>
        {isPending ? "Posting…" : "Post to Page"}
      </Button>
    </div>
  );
}
