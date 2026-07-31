"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { fetchScheduledQueue } from "@/features/ai-writer/api";
import { formatDateTime } from "@/utils/format";

export default function CalendarPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["ai-scheduled-queue"],
    queryFn: fetchScheduledQueue,
  });

  return (
    <div>
      <PageHeader title="Calendar" description="Agenda view of the generic AI-writer schedule queue." />
      {isLoading && <Skeleton className="h-40 w-full" />}
      <div className="space-y-2">
        {posts?.map((post) => (
          <Card key={post.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="line-clamp-1 text-sm">{post.draft}</p>
                <p className="mt-1 text-xs text-slate">{formatDateTime(post.scheduled_time)}</p>
              </div>
              <Badge variant="amber">{post.platform}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
