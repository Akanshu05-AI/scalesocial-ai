"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSendReply } from "../hooks/useConversations";

export function ReplyBox({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("");
  const { mutate, isPending } = useSendReply(conversationId);

  function handleSend() {
    if (!content.trim()) return;
    mutate(content, { onSuccess: () => setContent("") });
  }

  return (
    <div className="flex items-end gap-2 border-t border-border p-3">
      <Textarea
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button size="icon" disabled={isPending || !content.trim()} onClick={handleSend}>
        <Send size={16} />
      </Button>
    </div>
  );
}
