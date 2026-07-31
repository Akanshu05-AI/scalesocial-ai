"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatWindow } from "@/features/inbox/components/ChatWindow";
import { ReplyBox } from "@/features/inbox/components/ReplyBox";
import { useMessages } from "@/features/inbox/hooks/useConversations";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const { data: messages, isLoading } = useMessages(params.conversationId);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-card border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <button onClick={() => router.push("/inbox")} className="text-slate hover:text-ink">
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-medium">Conversation</span>
      </div>
      {isLoading && <Skeleton className="m-4 h-40" />}
      {messages && <ChatWindow messages={messages} />}
      <ReplyBox conversationId={params.conversationId} />
    </div>
  );
}
