/** Mirrors app/schemas/instagram.py. */

export type MediaType = "IMAGE" | "VIDEO";

export interface CreatePostRequest {
  ig_user_id: string;
  caption?: string;
  /** Must be a publicly reachable HTTPS URL — Instagram's Graph API
   *  fetches media FROM this URL server-side; there's no file-upload
   *  endpoint like Twitter's, so a local file has to be hosted
   *  somewhere first (e.g. uploaded to your own storage/CDN). */
  media_url: string;
  media_type: MediaType;
  scheduled_at?: string;
}

export interface SchedulePostAck {
  success: boolean;
  post_id: string;
  status: string;
  delay_seconds: number;
}
