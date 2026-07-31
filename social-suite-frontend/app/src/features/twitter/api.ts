import { apiClient } from "@/services/api-client";
import { withOfflineFallback } from "@/services/resilient-request";
import { localStore, generateLocalId } from "@/lib/local-store";
import type {
  MediaUploadResponse,
  TweetCreateRequest,
  TweetResponse,
  ThreadCreateRequest,
  ThreadResponse,
  ScheduledPostCreateRequest,
  ScheduledPostResponse,
  TwitterLoginResponse,
  TwitterAccountResponse,
  TwitterAccountListResponse,
  TwitterAccountDisconnectResponse,
  TweetAnalyticsResponse,
} from "./types";

// Every path below comes straight from app/api/v1/twitter/router.py.

export async function getTwitterLoginUrl() {
  const { data } = await apiClient.get<TwitterLoginResponse>("/twitter/login");
  return data;
}

export async function uploadTwitterMedia(file: File, onProgress?: (pct: number) => void) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<MediaUploadResponse>("/twitter/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return data;
}

const LOCAL_ACCOUNTS_KEY = "twitter_accounts";
const LOCAL_POSTS_KEY = "twitter_posts";

export async function fetchTwitterAccounts(): Promise<TwitterAccountListResponse> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.get<TwitterAccountListResponse>("/twitter/accounts");
      return data;
    },
    () => {
      const accounts = localStore.list<TwitterAccountResponse>(LOCAL_ACCOUNTS_KEY);
      return { accounts, total: accounts.length };
    }
  );
}

export async function disconnectTwitterAccount(accountId: string): Promise<TwitterAccountDisconnectResponse> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.delete<TwitterAccountDisconnectResponse>(
        `/twitter/accounts/${accountId}`
      );
      return data;
    },
    () => {
      localStore.remove(LOCAL_ACCOUNTS_KEY, accountId);
      return { id: accountId, disconnected: true, message: "Disconnected locally (offline mode)." };
    }
  );
}

export async function createTweet(input: TweetCreateRequest): Promise<TweetResponse> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.post<TweetResponse>("/twitter/post", input);
      return data;
    },
    () => {
      const now = new Date().toISOString();
      const response: TweetResponse = {
        tweet_id: generateLocalId("tweet"),
        text: input.text,
        posted_at: now,
        url: "#offline",
      };
      localStore.insert(LOCAL_POSTS_KEY, { id: response.tweet_id, kind: "tweet", ...response });
      return response;
    }
  );
}

export async function createThread(input: ThreadCreateRequest): Promise<ThreadResponse> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.post<ThreadResponse>("/twitter/post/thread", input);
      return data;
    },
    () => {
      const now = new Date().toISOString();
      const postId = generateLocalId("thread");
      const response: ThreadResponse = {
        post_id: postId,
        tweet_ids: input.tweets.map((_, i) => `${postId}_${i}`),
        items: input.tweets.map((t, i) => ({
          sequence_order: i,
          tweet_id: `${postId}_${i}`,
          text: t.text,
          url: "#offline",
        })),
        posted_at: now,
      };
      localStore.insert(LOCAL_POSTS_KEY, { id: postId, kind: "thread", ...response });
      return response;
    }
  );
}

export async function scheduleTweets(input: ScheduledPostCreateRequest): Promise<ScheduledPostResponse> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.post<ScheduledPostResponse>("/twitter/post/schedule", input);
      return data;
    },
    () => {
      const postId = generateLocalId("scheduled");
      const response: ScheduledPostResponse = {
        post_id: postId,
        status: "scheduled",
        scheduled_time: input.scheduled_time,
        queue_metadata: { offline: true },
      };
      localStore.insert(LOCAL_POSTS_KEY, { id: postId, kind: "scheduled", tweets: input.tweets, ...response });
      return response;
    }
  );
}

export async function fetchTweetAnalytics(tweetId: string): Promise<TweetAnalyticsResponse> {
  const { data } = await apiClient.get<TweetAnalyticsResponse>(`/twitter/analytics/${tweetId}`);
  return data;
}
