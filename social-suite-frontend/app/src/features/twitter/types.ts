/** Mirrors app/schemas/twitter_*.py exactly, confirmed against the real backend. */

export const TWEET_MAX_LENGTH = 280;
export const MAX_MEDIA_PER_TWEET = 4;

export interface MediaUploadResponse {
  media_id: string;
  media_key?: string;
  media_type: string;
}

export interface TweetCreateRequest {
  twitter_account_id: string;
  text: string;
  media_ids: string[];
}

export interface TweetResponse {
  tweet_id: string;
  text: string;
  posted_at: string;
  url: string;
}

export interface ThreadTweetItem {
  text: string;
  media_ids: string[];
}

export interface ThreadCreateRequest {
  twitter_account_id: string;
  tweets: ThreadTweetItem[]; // min 2
}

export interface ThreadTweetResult {
  sequence_order: number;
  tweet_id: string;
  text: string;
  url: string;
}

export interface ThreadResponse {
  post_id: string;
  tweet_ids: string[];
  items: ThreadTweetResult[];
  posted_at: string;
}

export interface ScheduledPostCreateRequest {
  twitter_account_id: string;
  tweets: ThreadTweetItem[]; // min 1
  scheduled_time: string;
}

export interface ScheduledPostResponse {
  post_id: string;
  status: string;
  scheduled_time: string;
  queue_metadata: Record<string, unknown>;
}

export interface TwitterLoginResponse {
  authorize_url: string;
}

/** GET /twitter/accounts, DELETE /twitter/accounts/{id} — schemas/twitter_account_schema.py */
export interface TwitterAccountResponse {
  id: string;
  twitter_user_id: string;
  username: string;
  display_name: string;
  profile_image_url: string | null;
  scope: string;
  is_active: boolean;
  connected_at: string;
}

export interface TwitterAccountListResponse {
  accounts: TwitterAccountResponse[];
  total: number;
}

export interface TwitterAccountDisconnectResponse {
  id: string;
  disconnected: boolean;
  message: string;
}

/** GET /twitter/analytics/{tweet_id} and /twitter/analytics/thread/{post_id} — schemas/twitter_analytics_schema.py */
export interface TweetAnalyticsResponse {
  tweet_id: string;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  impressions: number | null;
  fetched_at: string;
}

export interface ThreadAnalyticsResponse {
  post_id: string;
  tweets: TweetAnalyticsResponse[];
  totals: TweetAnalyticsResponse;
}
