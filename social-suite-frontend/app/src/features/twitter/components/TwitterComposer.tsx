"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TwitterAccountPicker } from "./TwitterAccountPicker";
import { useUploadTwitterMedia, useCreateTweet, useCreateThread, useScheduleTweets } from "../hooks/useTweetMutations";
import { TWEET_MAX_LENGTH, MAX_MEDIA_PER_TWEET, type ThreadTweetItem } from "../types";
import { cn } from "@/lib/utils";

/**
 * Deliberately separate from the generic PostEditor in
 * features/publishing — Twitter's real contract (per-account posting,
 * threads as a distinct endpoint, media uploaded ahead of the post,
 * scheduling always taking a tweet list) doesn't fit a single
 * "one text box, pick platforms" model. Facebook/Instagram/LinkedIn
 * will each need their own composer once their schemas are confirmed,
 * the same way this one matches Twitter's.
 */
export function TwitterComposer() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [mode, setMode] = useState<"tweet" | "thread">("tweet");
  const [tweets, setTweets] = useState<ThreadTweetItem[]>([{ text: "", media_ids: [] }]);
  const [scheduledAt, setScheduledAt] = useState("");

  const uploadMedia = useUploadTwitterMedia();
  const createTweet = useCreateTweet();
  const createThread = useCreateThread();
  const scheduleTweets = useScheduleTweets();

  function updateTweetText(index: number, text: string) {
    setTweets((prev) => prev.map((t, i) => (i === index ? { ...t, text } : t)));
  }

  async function handleAddMedia(index: number, file: File) {
    const result = await uploadMedia.mutateAsync(file);
    setTweets((prev) =>
      prev.map((t, i) =>
        i === index && t.media_ids.length < MAX_MEDIA_PER_TWEET
          ? { ...t, media_ids: [...t.media_ids, result.media_id] }
          : t
      )
    );
  }

  function addThreadTweet() {
    setTweets((prev) => [...prev, { text: "", media_ids: [] }]);
  }

  function removeThreadTweet(index: number) {
    setTweets((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setTweets([{ text: "", media_ids: [] }]);
    setScheduledAt("");
  }

  function handleSubmit() {
    if (!accountId) return;

    if (scheduledAt) {
      scheduleTweets.mutate(
        { twitter_account_id: accountId, tweets, scheduled_time: new Date(scheduledAt).toISOString() },
        { onSuccess: reset }
      );
      return;
    }

    if (mode === "thread") {
      if (tweets.length < 2) return; // ThreadCreateRequest requires min 2
      createThread.mutate({ twitter_account_id: accountId, tweets }, { onSuccess: reset });
    } else {
      const [first] = tweets;
      if (!first) return;
      createTweet.mutate(
        { twitter_account_id: accountId, text: first.text, media_ids: first.media_ids },
        { onSuccess: reset }
      );
    }
  }

  const isPending = createTweet.isPending || createThread.isPending || scheduleTweets.isPending;
  const canSubmit =
    !!accountId &&
    tweets.every((t) => t.text.trim().length > 0 && t.text.length <= TWEET_MAX_LENGTH) &&
    (mode === "tweet" || tweets.length >= 2);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-medium text-slate">Posting as</p>
        <TwitterAccountPicker selected={accountId} onSelect={setAccountId} />
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "tweet" | "thread")}>
        <TabsList>
          <TabsTrigger value="tweet">Single tweet</TabsTrigger>
          <TabsTrigger value="thread">Thread</TabsTrigger>
        </TabsList>

        <TabsContent value="tweet" className="mt-4 space-y-2">
          <TweetField
            index={0}
            tweet={tweets[0] ?? { text: "", media_ids: [] }}
            onTextChange={(text) => updateTweetText(0, text)}
            onAddMedia={(file) => handleAddMedia(0, file)}
          />
        </TabsContent>

        <TabsContent value="thread" className="mt-4 space-y-3">
          {tweets.map((tweet, i) => (
            <div key={i} className="relative rounded-card border border-border p-3">
              <span className="mb-1 block text-xs font-medium text-slate">Tweet {i + 1}</span>
              <TweetField
                index={i}
                tweet={tweet}
                onTextChange={(text) => updateTweetText(i, text)}
                onAddMedia={(file) => handleAddMedia(i, file)}
              />
              {tweets.length > 2 && (
                <button
                  onClick={() => removeThreadTweet(i)}
                  className="absolute right-2 top-2 text-slate hover:text-rose"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={addThreadTweet}>
            <Plus size={14} />
            Add tweet
          </Button>
        </TabsContent>
      </Tabs>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Schedule for (optional)</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="h-10 rounded-card border border-border px-3 text-sm"
        />
      </div>

      <Button disabled={!canSubmit || isPending} onClick={handleSubmit}>
        {isPending ? "Posting…" : scheduledAt ? "Schedule" : mode === "thread" ? "Post thread" : "Post tweet"}
      </Button>
    </div>
  );
}

function TweetField({
  tweet,
  onTextChange,
  onAddMedia,
}: {
  index: number;
  tweet: ThreadTweetItem;
  onTextChange: (text: string) => void;
  onAddMedia: (file: File) => void;
}) {
  const over = tweet.text.length > TWEET_MAX_LENGTH;
  return (
    <div>
      <Textarea rows={3} value={tweet.text} onChange={(e) => onTextChange(e.target.value)} />
      <div className="mt-1 flex items-center justify-between">
        <label className="cursor-pointer text-xs text-signal-dark">
          <input
            type="file"
            accept="image/*,video/*,image/gif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onAddMedia(e.target.files[0])}
            disabled={tweet.media_ids.length >= MAX_MEDIA_PER_TWEET}
          />
          {tweet.media_ids.length}/{MAX_MEDIA_PER_TWEET} media attached — add
        </label>
        <span className={cn("font-mono text-xs", over ? "text-rose" : "text-slate")}>
          {tweet.text.length}/{TWEET_MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
