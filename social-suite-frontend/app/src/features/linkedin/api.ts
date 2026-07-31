import { apiClient } from "@/services/api-client";

/**
 * IMPORTANT INCONSISTENCY, not papered over: every endpoint here takes
 * `user_id: int` as an explicit query param (app/api/v1/linkedin/router.py)
 * instead of deriving identity from the Supabase JWT the way
 * users.py/ai.py/rbac.py do via get_current_user. Supabase's user id is a
 * UUID, not an int, so there's no real mapping between "who's logged in"
 * and this int. Until the backend is changed to use get_current_user like
 * its other routers, this uses a locally-stored placeholder integer ID
 * (see useLinkedInUserId) — functionally this only works sensibly for a
 * single-user/dev setup, not real multi-user auth.
 */
import type {
  LinkedInPostRequest,
  LinkedInProfileResponse,
  LinkedInPostResponse,
  LinkedInDisconnectResponse,
} from "./types";

export function getLinkedInConnectUrl(userId: number) {
  return apiClient.get<{ url: string }>("/linkedin/connect", { params: { user_id: userId } }).then((r) => r.data);
}

export function fetchLinkedInProfile(userId: number) {
  return apiClient.get<LinkedInProfileResponse>("/linkedin/profile", { params: { user_id: userId } }).then((r) => r.data);
}

export function createLinkedInPost(userId: number, input: LinkedInPostRequest) {
  return apiClient
    .post<LinkedInPostResponse>("/linkedin/post", input, { params: { user_id: userId } })
    .then((r) => r.data);
}

export function createLinkedInImagePost(userId: number, text: string, image: File) {
  const form = new FormData();
  form.append("text", text);
  form.append("image", image);
  return apiClient
    .post<LinkedInPostResponse>("/linkedin/post-image", form, {
      params: { user_id: userId },
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
}

export function disconnectLinkedIn(userId: number) {
  return apiClient
    .delete<LinkedInDisconnectResponse>("/linkedin/disconnect", { params: { user_id: userId } })
    .then((r) => r.data);
}

export function fetchLinkedInAnalytics(userId: number) {
  return apiClient.get("/linkedin/analytics", { params: { user_id: userId } }).then((r) => r.data);
}
