import { apiClient } from "@/services/api-client";
import type { FacebookPage, FacebookComment } from "./types";

/**
 * IMPORTANT: this backend does not persist Facebook tokens server-side
 * at all (no repository/service storage layer — services/facebook.py is
 * a raw pass-through to the Graph API). The frontend itself has to hold
 * the user access token and each page's access_token and send them back
 * on every call. See useFacebookSession for where those live (in-memory
 * + localStorage) — there is no "connected accounts" list from the
 * backend for Facebook the way Twitter has one.
 */

export function getFacebookLoginUrl() {
  return apiClient.get<{ url: string }>("/facebook/login").then((r) => r.data);
}

/** GET /facebook/callback?code=... — returns the raw Meta token exchange JSON. */
export function exchangeFacebookCode(code: string) {
  return apiClient.get<{ access_token: string; token_type: string; expires_in: number }>(
    "/facebook/callback",
    { params: { code } }
  ).then((r) => r.data);
}

export function fetchFacebookPages(accessToken: string) {
  return apiClient
    .get<{ data: FacebookPage[] }>("/facebook/pages", { params: { access_token: accessToken } })
    .then((r) => r.data.data);
}

export function createFacebookPost(pageId: string, pageAccessToken: string, message: string) {
  return apiClient
    .post("/facebook/post", { page_id: pageId, page_access_token: pageAccessToken, message })
    .then((r) => r.data);
}

export function fetchFacebookComments(postId: string, pageAccessToken: string) {
  return apiClient
    .get<{ data: FacebookComment[] }>(`/facebook/comments/${postId}`, {
      params: { page_access_token: pageAccessToken },
    })
    .then((r) => r.data.data);
}

export function replyToFacebookComment(commentId: string, pageAccessToken: string, message: string) {
  return apiClient
    .post("/facebook/reply", { comment_id: commentId, page_access_token: pageAccessToken, message })
    .then((r) => r.data);
}
