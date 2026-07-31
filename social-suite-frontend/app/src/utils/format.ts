import { format, formatDistanceToNow } from "date-fns";
import { PLATFORM_CONFIG, type Platform } from "@/constants";

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

/** Character count against a platform's limit; used by CharacterCounter. */
export function charCountForPlatform(content: string, platform: Platform) {
  const limit = PLATFORM_CONFIG[platform].charLimit;
  return { count: content.length, limit, isOver: limit !== null && content.length > limit };
}
