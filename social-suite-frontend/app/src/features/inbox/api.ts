/**
 * IMPORTANT: this backend has NO unified-inbox endpoints at all. The
 * only message-shaped things anywhere are Facebook/Instagram COMMENTS
 * (GET/POST under /facebook/comments, /instagram/comments/{media_id}) —
 * there is no DM listing for Twitter, LinkedIn messaging, or a combined
 * feed matching the {platform, account, sender, type, content,
 * timestamp, thread_id, status} schema the project brief describes.
 *
 * This module is therefore ALWAYS local-storage-backed, not a
 * network-down fallback like other features — there's no real endpoint
 * to fall back FROM. It exists so the Inbox UI is demoable and the data
 * shape is ready to swap in real endpoints once they exist.
 */
import { localStore, generateLocalId } from "@/lib/local-store";
import type { Conversation, Message, ConversationType, Platform } from "@/types";

const CONVERSATIONS_KEY = "inbox_conversations";
const MESSAGES_KEY = "inbox_messages";

function seedIfEmpty() {
  if (localStore.list<Conversation>(CONVERSATIONS_KEY).length > 0) return;
  const demo: Conversation[] = [
    {
      id: generateLocalId("conv"),
      platform: "twitter",
      type: "dm",
      participantName: "Demo Contact",
      lastMessagePreview: "This is demo data — no backend inbox endpoint exists yet.",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 1,
    },
  ];
  localStore.set(CONVERSATIONS_KEY, demo);
}

export interface ConversationFilters {
  platform?: Platform;
  type?: ConversationType;
}

export async function fetchConversations(filters: ConversationFilters = {}): Promise<Conversation[]> {
  seedIfEmpty();
  let items = localStore.list<Conversation>(CONVERSATIONS_KEY);
  if (filters.platform) items = items.filter((c) => c.platform === filters.platform);
  if (filters.type) items = items.filter((c) => c.type === filters.type);
  return items;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  return localStore.list<Message>(MESSAGES_KEY).filter((m) => m.conversationId === conversationId);
}

export async function sendReply(conversationId: string, content: string): Promise<Message> {
  const message: Message = {
    id: generateLocalId("msg"),
    conversationId,
    author: "user",
    content,
    sentAt: new Date().toISOString(),
  };
  localStore.insert(MESSAGES_KEY, message);
  localStore.update<Conversation>(CONVERSATIONS_KEY, conversationId, {
    lastMessagePreview: content,
    lastMessageAt: message.sentAt,
  });
  return message;
}

export async function markRead(conversationId: string): Promise<void> {
  localStore.update<Conversation>(CONVERSATIONS_KEY, conversationId, { unreadCount: 0 });
}
