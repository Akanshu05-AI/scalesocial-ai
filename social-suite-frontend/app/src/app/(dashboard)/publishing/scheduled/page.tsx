"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchScheduledQueue } from "@/features/ai-writer/api";
import { CalendarClock } from "lucide-react";
import { formatDateTime } from "@/utils/format";
import type { ScheduledPostRecord } from "@/features/ai-writer/types";

/**
 * Backed by GET /ai/schedule — the ONLY real "list of scheduled posts"
 * endpoint this backend has. It's generic (platform as a plain string,
 * no per-platform account/media detail), separate from Twitter's own
 * /twitter/post/schedule which has no matching list endpoint at all.
 * Falls back to localStorage automatically if the backend is down.
 */
export default function ScheduledPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["ai-scheduled-queue"],
    queryFn: fetchScheduledQueue,
  });

  const columns: Column<ScheduledPostRecord>[] = [
    { key: "platform", header: "Platform" },
    { key: "draft", header: "Draft", render: (p) => <span className="line-clamp-1">{p.draft}</span> },
    { key: "status", header: "Status" },
    { key: "scheduled_time", header: "Scheduled for", render: (p) => formatDateTime(p.scheduled_time) },
  ];

  return (
    <div>
      <PageHeader title="Scheduled" description="Queued via the generic AI-writer scheduler (POST /ai/schedule)." />
      {isLoading && <Skeleton className="h-40 w-full" />}
      {!isLoading && posts?.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="Nothing scheduled"
          description="Generate a post in the AI Writer and schedule it, or post directly through a platform's own composer (Twitter's own schedule endpoint isn't listed here)."
        />
      )}
      {!isLoading && posts && posts.length > 0 && <DataTable columns={columns} rows={posts} />}
    </div>
  );
}
