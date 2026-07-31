"use client";

import { cn } from "@/lib/utils";
import { PLATFORM_CONFIG } from "@/constants";
import { formatRelative } from "@/utils/format";
import type { Conversation } from "@/types";

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-border overflow-y-auto">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={cn(
            "signal-rail flex w-full flex-col items-start gap-0.5 px-3 py-3 text-left",
            activeId === c.id ? "bg-signal-light" : "hover:bg-ink/5"
          )}
          style={{ color: PLATFORM_CONFIG[c.platform].color }}
        >
          <div className="flex w-full items-center justify-between text-ink">
            <span className="text-sm font-medium">{c.participantName}</span>
            <span className="text-[11px] text-slate">{formatRelative(c.lastMessageAt)}</span>
          </div>
          <p className="line-clamp-1 text-xs text-slate">{c.lastMessagePreview}</p>
          {c.unreadCount > 0 && (
            <span className="mt-0.5 rounded-full bg-signal px-1.5 text-[10px] font-medium text-white">
              {c.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
