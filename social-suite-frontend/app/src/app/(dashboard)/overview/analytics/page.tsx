"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchTweetAnalytics } from "@/features/twitter/api";
import type { TweetAnalyticsResponse } from "@/features/twitter/types";
import {
  TrendingUp,
  Eye,
  Heart,
  Repeat,
  MessageSquare,
  Bookmark,
  BarChart2,
  Search,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const [tweetId, setTweetId] = useState("");
  const [result, setResult] = useState<TweetAnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!tweetId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTweetAnalytics(tweetId.trim());
      setResult(data);
    } catch (e) {
      setError((e as { message: string }).message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance & Analytics"
        description="Monitor multi-channel engagement, track impression velocity, and query live post statistics."
      />

      {/* Aggregate Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate">Total Impressions</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                <Eye size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="font-display text-2xl font-bold text-ink dark:text-white">124,580</p>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-500">
                <ArrowUpRight size={14} /> +18.4%
              </span>
            </div>
            <p className="mt-1 text-xs text-slate">Across connected channels (30 days)</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate">Engagement Rate</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="font-display text-2xl font-bold text-ink dark:text-white">4.82%</p>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-500">
                <ArrowUpRight size={14} /> +2.1%
              </span>
            </div>
            <p className="mt-1 text-xs text-slate">Clicks, likes & shares per impression</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate">Reactions & Likes</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose/10 text-rose">
                <Heart size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="font-display text-2xl font-bold text-ink dark:text-white">8,940</p>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-500">
                <ArrowUpRight size={14} /> +12.0%
              </span>
            </div>
            <p className="mt-1 text-xs text-slate">Total post likes and favorites</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate">Shares & Retweets</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <Repeat size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="font-display text-2xl font-bold text-ink dark:text-white">2,150</p>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-500">
                <ArrowUpRight size={14} /> +8.5%
              </span>
            </div>
            <p className="mt-1 text-xs text-slate">Re-shares across social feeds</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Tweet Lookup + Channel Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Real API Lookup Tool */}
        <Card className="border border-border">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Search size={18} className="text-signal" /> Live Tweet API Analytics Query
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs text-slate">
              Query Twitter API v2 metrics directly for any published tweet ID associated with your connected handle.
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={tweetId}
                onChange={(e) => setTweetId(e.target.value)}
                placeholder="Enter Tweet ID (e.g. 182400192837)"
                className="h-10 text-xs"
              />
              <Button disabled={!tweetId.trim() || loading} onClick={lookup} className="shrink-0">
                {loading ? "Querying…" : "Query Metrics"}
              </Button>
            </div>

            {error && (
              <div className="rounded-xl border border-rose/30 bg-rose/10 p-3 text-xs text-rose">
                {error}
              </div>
            )}

            {result && (
              <div className="rounded-xl border border-border p-4 bg-paper/50 dark:bg-white/5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-xs font-semibold text-ink dark:text-white">Tweet Metrics Result</span>
                  <Badge variant="signal">Live API Data</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-paper dark:bg-white/5 p-2">
                    <p className="text-[10px] text-slate uppercase font-semibold">Likes</p>
                    <p className="font-display text-lg font-bold text-ink dark:text-white">{result.likes}</p>
                  </div>
                  <div className="rounded-lg bg-paper dark:bg-white/5 p-2">
                    <p className="text-[10px] text-slate uppercase font-semibold">Retweets</p>
                    <p className="font-display text-lg font-bold text-ink dark:text-white">{result.retweets}</p>
                  </div>
                  <div className="rounded-lg bg-paper dark:bg-white/5 p-2">
                    <p className="text-[10px] text-slate uppercase font-semibold">Replies</p>
                    <p className="font-display text-lg font-bold text-ink dark:text-white">{result.replies}</p>
                  </div>
                  <div className="rounded-lg bg-paper dark:bg-white/5 p-2">
                    <p className="text-[10px] text-slate uppercase font-semibold">Quotes</p>
                    <p className="font-display text-lg font-bold text-ink dark:text-white">{result.quotes}</p>
                  </div>
                  <div className="rounded-lg bg-paper dark:bg-white/5 p-2">
                    <p className="text-[10px] text-slate uppercase font-semibold">Bookmarks</p>
                    <p className="font-display text-lg font-bold text-ink dark:text-white">{result.bookmarks}</p>
                  </div>
                  <div className="rounded-lg bg-paper dark:bg-white/5 p-2">
                    <p className="text-[10px] text-slate uppercase font-semibold">Impressions</p>
                    <p className="font-display text-lg font-bold text-ink dark:text-white">{result.impressions ?? "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel Share Breakdown */}
        <Card className="border border-border">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart2 size={18} className="text-purple-500" /> Channel Engagement Share
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-sky-500">
                    <Twitter size={14} /> Twitter / X
                  </span>
                  <span>54% (67,270 imp)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-paper dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: "54%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <Linkedin size={14} /> LinkedIn
                  </span>
                  <span>28% (34,880 imp)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-paper dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "28%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Facebook size={14} /> Facebook Pages
                  </span>
                  <span>12% (14,950 imp)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-paper dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-blue-700 rounded-full" style={{ width: "12%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-pink-500">
                    <Instagram size={14} /> Instagram Business
                  </span>
                  <span>6% (7,480 imp)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-paper dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: "6%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
