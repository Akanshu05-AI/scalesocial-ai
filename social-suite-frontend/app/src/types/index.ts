import type { Platform } from "@/constants";

export type { Platform } from "@/constants";

export type PostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed";

export interface MediaAsset {
  id: string;
  url: string;
  type: "image" | "video";
  thumbnailUrl?: string;
}

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  media: MediaAsset[];
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  errorMessage?: string;
}

export interface ConnectedAccount {
  id: string;
  platform: Platform;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
}

export type ConversationType = "dm" | "comment" | "mention";

export interface Conversation {
  id: string;
  platform: Platform;
  type: ConversationType;
  participantName: string;
  participantAvatarUrl?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  author: "user" | "contact";
  content: string;
  sentAt: string;
}

/** Matches schemas/user.py UserResponse exactly — snake_case as FastAPI returns it. */
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  error?: { code: string; message: string } | null;
}

export interface FieldError {
  field: string;
  message: string;
}
