/** Mirrors app/schemas/ai.py and app/api/v1/ai.py exactly. */

export type Platform = "linkedin" | "x"; // AI writer only supports these two, per GenerateRequest
export type Tone = "professional" | "casual" | "bold" | "storytelling";
export type Length = "short" | "medium" | "long";

export interface BrandVoice {
  id: string;
  user_id: string;
  name: string;
  description: string;
  sample_text?: string | null;
}

export interface BrandVoiceCreateInput {
  name: string;
  description: string;
  sample_text?: string;
}

export interface GenerateRequest {
  platform: Platform;
  topic: string;
  tone: Tone;
  length: Length;
  brand_voice_id?: string | null;
  include_hashtags: boolean;
}

export interface GenerateResponse {
  platform: Platform;
  draft: string;
  hashtags: string[];
  is_thread: boolean;
  thread_parts: string[] | null;
}

export interface RefineRequest {
  draft: string;
  instruction: string;
}

export interface RefineResponse {
  status: string;
  refined_content: string;
}

/**
 * POST /ai/schedule — a SEPARATE generic scheduler from Twitter's own
 * /twitter/post/schedule. This one takes a single platform string + a
 * plain draft and hands it to a generic Celery task, not the
 * Twitter-specific validated pipeline. Only meaningful for "x" if you
 * want the AI-writer-generated draft scheduled without going through
 * the Twitter account/media flow — for real Twitter posting/scheduling
 * with account selection, use features/twitter instead.
 */
export interface SchedulePostRequest {
  platform: string;
  draft: string;
  scheduled_time: string;
}

export interface QueueResponse {
  status: string;
  post_id: string;
  celery_task_id: string;
  execution_delay_seconds: number;
}

export interface ScheduledPostRecord {
  id: string;
  user_id: string;
  platform: string;
  draft: string;
  scheduled_time: string;
  status: string;
  attempts: number;
  updated_at: string;
}
