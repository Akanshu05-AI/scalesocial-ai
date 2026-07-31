"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchTweetAnalytics } from "@/features/twitter/api";
import type { TweetAnalyticsResponse } from "@/features/twitter/types";

/**
 * There's no aggregate "/analytics/overview" endpoint anywhere in this
 * backend — analytics are per-tweet only (GET /twitter/analytics/{id})
 * or per-LinkedIn-user (GET /linkedin/analytics?user_id=). This is a
 * lookup tool against the real per-tweet endpoint rather than a
 * fabricated dashboard chart.
 */
export default function AnalyticsPage() {
  const [tweetId, setTweetId] = useState("");
  const [result, setResult] = useState<TweetAnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTweetAnalytics(tweetId);
      setResult(data);
    } catch (e) {
      setError((e as { message: string }).message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Analytics" description="Look up engagement metrics for a specific tweet." />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Tweet analytics lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={tweetId} onChange={(e) => setTweetId(e.target.value)} placeholder="Tweet ID" />
            <Button disabled={!tweetId || loading} onClick={lookup}>
              {loading ? "Loading…" : "Look up"}
            </Button>
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          {result && (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-xs text-slate">Likes</p><p>{result.likes}</p></div>
              <div><p className="text-xs text-slate">Retweets</p><p>{result.retweets}</p></div>
              <div><p className="text-xs text-slate">Replies</p><p>{result.replies}</p></div>
              <div><p className="text-xs text-slate">Quotes</p><p>{result.quotes}</p></div>
              <div><p className="text-xs text-slate">Bookmarks</p><p>{result.bookmarks}</p></div>
              <div><p className="text-xs text-slate">Impressions</p><p>{result.impressions ?? "—"}</p></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
