"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationList } from "@/features/inbox/components/ConversationList";
import { InboxFilterBar } from "@/features/inbox/components/InboxFilterBar";
import { useConversations } from "@/features/inbox/hooks/useConversations";
import { Inbox } from "lucide-react";
import type { ConversationType } from "@/types";

export default function InboxPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: conversations, isLoading } = useConversations(
    typeFilter === "all" ? {} : { type: typeFilter as ConversationType }
  );

  return (
    <div>
      <PageHeader
        title="Inbox"
        description="Demo data only — this backend has no unified-inbox or DM endpoints yet (see features/inbox/api.ts)."
      />
      <div className="mb-4">
        <InboxFilterBar active={typeFilter} onChange={setTypeFilter} />
      </div>
      {isLoading && <Skeleton className="h-64 w-full" />}
      {!isLoading && conversations?.length === 0 && (
        <EmptyState icon={Inbox} title="Inbox zero" description="New DMs, comments, and mentions will land here." />
      )}
      {!isLoading && conversations && conversations.length > 0 && (
        <div className="overflow-hidden rounded-card border border-border bg-white">
          <ConversationList
            conversations={conversations}
            activeId={null}
            onSelect={(id) => router.push(`/inbox/${id}`)}
          />
        </div>
      )}
    </div>
  );
}
