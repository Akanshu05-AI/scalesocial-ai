import { apiClient } from "@/services/api-client";
import { withOfflineFallback } from "@/services/resilient-request";
import { localStore, generateLocalId } from "@/lib/local-store";
import type {
  BrandVoice,
  BrandVoiceCreateInput,
  GenerateRequest,
  GenerateResponse,
  RefineRequest,
  RefineResponse,
  SchedulePostRequest,
  QueueResponse,
  ScheduledPostRecord,
} from "./types";

const LOCAL_VOICES_KEY = "ai_brand_voices";
const LOCAL_SCHEDULE_KEY = "ai_scheduled_posts";

export async function createBrandVoice(input: BrandVoiceCreateInput): Promise<BrandVoice> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.post<BrandVoice>("/ai/voices", input);
      return data;
    },
    () => {
      const voice: BrandVoice = { id: generateLocalId("voice"), user_id: "offline", ...input };
      return localStore.insert(LOCAL_VOICES_KEY, voice);
    }
  );
}

export async function fetchBrandVoices(): Promise<BrandVoice[]> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.get<BrandVoice[]>("/ai/voices");
      return data;
    },
    () => localStore.list<BrandVoice>(LOCAL_VOICES_KEY)
  );
}

/**
 * No offline fallback here — generation genuinely needs the Gemini-backed
 * AI service (per core/config.py's GEMINI_API_KEY), there's no meaningful
 * local stand-in for "write me a post". This surfaces the real error
 * instead of pretending to generate something.
 */
export async function generateContent(input: GenerateRequest): Promise<GenerateResponse> {
  const { data } = await apiClient.post<GenerateResponse>("/ai/generate", input);
  return data;
}

export async function refineContent(input: RefineRequest): Promise<RefineResponse> {
  const { data } = await apiClient.post<RefineResponse>("/ai/refine", input);
  return data;
}

export async function scheduleGenericPost(input: SchedulePostRequest): Promise<QueueResponse> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.post<QueueResponse>("/ai/schedule", input);
      return data;
    },
    () => {
      const postId = generateLocalId("post");
      const record: ScheduledPostRecord = {
        id: postId,
        user_id: "offline",
        platform: input.platform,
        draft: input.draft,
        scheduled_time: input.scheduled_time,
        status: "scheduled",
        attempts: 0,
        updated_at: new Date().toISOString(),
      };
      localStore.insert(LOCAL_SCHEDULE_KEY, record);
      return {
        status: "queued",
        post_id: postId,
        celery_task_id: "offline",
        execution_delay_seconds: 0,
      };
    }
  );
}

export async function fetchScheduledQueue(): Promise<ScheduledPostRecord[]> {
  return withOfflineFallback(
    async () => {
      const { data } = await apiClient.get<ScheduledPostRecord[]>("/ai/schedule");
      return data;
    },
    () => localStore.list<ScheduledPostRecord>(LOCAL_SCHEDULE_KEY)
  );
}
