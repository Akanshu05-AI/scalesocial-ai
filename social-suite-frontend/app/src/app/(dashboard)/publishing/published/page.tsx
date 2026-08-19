"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants";
import { Send, CheckCircle2, Search, ExternalLink, Twitter, Linkedin, Facebook, Instagram, Eye, Heart, Repeat } from "lucide-react";

interface PublishedItem {
  id: string;
  platform: "twitter" | "linkedin" | "facebook" | "instagram";
  account: string;
  content: string;
  publishedAt: string;
  likes: number;
  shares: number;
  impressions: number;
}

const PUBLISHED_HISTORY: PublishedItem[] = [
  {
    id: "pub-1",
    platform: "twitter",
    account: "@scalesocial_ai",
    content: "Excited to launch our multi-channel social management suite with native Celery task automation and Gemini AI integration! 🚀",
    publishedAt: "August 18, 2026 at 02:30 PM",
    likes: 142,
    shares: 38,
    impressions: 4250,
  },
  {
    id: "pub-2",
    platform: "linkedin",
    account: "ScaleSocial Tech",
    content: "Why building decoupled Next.js 15 & FastAPI architectures provides superior scalability for SaaS operations. Read our technical deep dive below.",
    publishedAt: "August 17, 2026 at 11:15 AM",
    likes: 89,
    shares: 24,
    impressions: 2180,
  },
];

export default function PublishedPage() {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const filtered = PUBLISHED_HISTORY.filter((p) => {
    const matchesSearch = p.content.toLowerCase().includes(search.toLowerCase()) || p.account.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter === "all" || p.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Published Content Log"
        description="Review successfully dispatched posts, track engagement performance, and verify platform status."
        actions={
          <Link href={ROUTES.compose}>
            <Button className="font-semibold">
              <Send size={16} className="mr-1.5" /> New Post
            </Button>
          </Link>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search published posts…"
            className="pl-9 h-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              platformFilter === "all" ? "border-signal bg-signal/10 text-signal dark:bg-signal/20" : "border-border text-slate hover:bg-ink/5"
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setPlatformFilter("twitter")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              platformFilter === "twitter" ? "border-sky-500 bg-sky-500/10 text-sky-500" : "border-border text-slate hover:bg-ink/5"
            }`}
          >
            Twitter / X
          </button>
          <button
            onClick={() => setPlatformFilter("linkedin")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              platformFilter === "linkedin" ? "border-blue-600 bg-blue-600/10 text-blue-600" : "border-border text-slate hover:bg-ink/5"
            }`}
          >
            LinkedIn
          </button>
        </div>
      </div>

      {/* Published List */}
      <div className="grid gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="border border-border">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-ink dark:text-white">{item.account}</span>
                    <span className="ml-2 text-xs text-slate">{item.publishedAt}</span>
                  </div>
                </div>
                <Badge variant="signal" className="gap-1 text-[11px]">
                  Published
                </Badge>
              </div>

              <p className="text-sm text-ink dark:text-slate-200">{item.content}</p>

              {/* Engagement Stats Footer */}
              <div className="flex flex-wrap items-center justify-between border-t border-border/50 pt-3 text-xs text-slate">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-medium text-ink dark:text-slate-300">
                    <Eye size={14} className="text-sky-500" /> {item.impressions.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1 font-medium text-ink dark:text-slate-300">
                    <Heart size={14} className="text-rose" /> {item.likes} likes
                  </span>
                  <span className="flex items-center gap-1 font-medium text-ink dark:text-slate-300">
                    <Repeat size={14} className="text-purple-500" /> {item.shares} shares
                  </span>
                </div>
                <Link href={ROUTES.analytics} className="flex items-center gap-1 text-signal hover:underline font-semibold text-xs">
                  View Analytics <ExternalLink size={12} />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Send size={40} className="mx-auto text-slate/40 mb-3" />
            <h3 className="font-display text-lg font-bold text-ink dark:text-white">No published posts found</h3>
            <p className="mt-1 text-xs text-slate max-w-md mx-auto">
              No published posts match your filters. Dispatched posts from the composer or scheduler will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
