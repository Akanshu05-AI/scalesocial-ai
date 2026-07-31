import { cn } from "@/lib/utils";
import { formatRelative } from "@/utils/format";
import type { Message } from "@/types";

export function ChatWindow({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.map((m) => (
        <div key={m.id} className={cn("flex", m.author === "user" ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-xs rounded-card px-3 py-2 text-sm",
              m.author === "user" ? "bg-signal text-white" : "bg-ink/5 text-ink"
            )}
          >
            <p>{m.content}</p>
            <p className={cn("mt-1 text-[10px]", m.author === "user" ? "text-white/70" : "text-slate")}>
              {formatRelative(m.sentAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
