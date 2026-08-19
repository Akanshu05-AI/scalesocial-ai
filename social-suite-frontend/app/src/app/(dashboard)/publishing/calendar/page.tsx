"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchScheduledQueue } from "@/features/ai-writer/api";
import { formatDateTime } from "@/utils/format";
import { ROUTES } from "@/constants";
import { Calendar as CalendarIcon, Clock, Plus, Twitter, Linkedin, Facebook, Instagram, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"agenda" | "grid">("agenda");
  const { data: posts, isLoading } = useQuery({
    queryKey: ["ai-scheduled-queue"],
    queryFn: fetchScheduledQueue,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Publishing Calendar"
        description="Visual scheduling timeline across Twitter/X, LinkedIn, Facebook, and Instagram."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-paper p-1 dark:bg-white/5">
              <button
                onClick={() => setViewMode("agenda")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "agenda" ? "bg-white text-ink shadow-sm dark:bg-white/20 dark:text-white" : "text-slate"
                }`}
              >
                Agenda Timeline
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "grid" ? "bg-white text-ink shadow-sm dark:bg-white/20 dark:text-white" : "text-slate"
                }`}
              >
                Weekly Grid
              </button>
            </div>
            <Link href={ROUTES.compose}>
              <Button className="font-semibold">
                <Plus size={16} className="mr-1.5" /> Schedule Post
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading && <Skeleton className="h-64 w-full rounded-2xl" />}

      {/* Agenda Timeline View */}
      {viewMode === "agenda" && (
        <div className="space-y-3">
          {posts?.map((post) => (
            <Card key={post.id} className="border border-border transition-all hover:shadow-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold text-ink dark:text-white">{post.draft}</p>
                    <p className="mt-0.5 text-xs text-slate">{formatDateTime(post.scheduled_time)}</p>
                  </div>
                </div>
                <Badge variant="amber" className="uppercase text-[10px] shrink-0 font-bold">
                  {post.platform}
                </Badge>
              </CardContent>
            </Card>
          ))}

          {(!posts || posts.length === 0) && !isLoading && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <CalendarIcon size={40} className="mx-auto text-slate/40 mb-3" />
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">Calendar is empty</h3>
              <p className="mt-1 text-xs text-slate max-w-md mx-auto">
                No scheduled posts queued for execution. Use the Multi-Platform Composer to schedule new content.
              </p>
              <Link href={ROUTES.compose} className="mt-4 inline-block">
                <Button size="sm" className="font-semibold">
                  <Plus size={15} className="mr-1.5" /> Schedule First Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Weekly Grid View */}
      {viewMode === "grid" && (
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
            <CardTitle className="text-base font-semibold">August 2026 Timeline</CardTitle>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <ChevronLeft size={16} />
              </Button>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="py-2 border-b border-border/50">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-[220px]">
              {[18, 19, 20, 21, 22, 23, 24].map((day, index) => (
                <div
                  key={day}
                  className="rounded-xl border border-border/60 p-2 text-left bg-paper/30 dark:bg-white/5 space-y-1.5 flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-ink dark:text-white">{day} Aug</span>
                  {index === 1 && (
                    <div className="rounded-lg bg-sky-500/10 border border-sky-500/30 p-1.5 text-[10px] text-sky-600 dark:text-sky-300 font-medium">
                      <div className="flex items-center gap-1 font-bold">
                        <Twitter size={10} /> 10:00 AM
                      </div>
                      <p className="line-clamp-1 mt-0.5">AI Suite Launch...</p>
                    </div>
                  )}
                  {index === 3 && (
                    <div className="rounded-lg bg-blue-600/10 border border-blue-600/30 p-1.5 text-[10px] text-blue-600 dark:text-blue-300 font-medium">
                      <div className="flex items-center gap-1 font-bold">
                        <Linkedin size={10} /> 03:30 PM
                      </div>
                      <p className="line-clamp-1 mt-0.5">FastAPI Deep Dive...</p>
                    </div>
                  )}
                  <div className="text-[10px] text-slate/50 text-right">0 posts</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
