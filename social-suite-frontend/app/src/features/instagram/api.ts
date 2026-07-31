import { apiClient } from "@/services/api-client";
import type { CreatePostRequest, SchedulePostAck } from "./types";

export function getInstagramLoginUrl() {
  return apiClient.get<{ url: string }>("/instagram/auth/login-url").then((r) => r.data);
}

export function schedulePostInstagram(input: CreatePostRequest) {
  return apiClient.post<SchedulePostAck>("/instagram/posts/schedule", input).then((r) => r.data);
}

export function fetchInstagramComments(mediaId: string, token: string) {
  return apiClient
    .get(`/instagram/comments/${mediaId}`, { params: { token } })
    .then((r) => r.data);
}

export function replyToInstagramComment(commentId: string, token: string, message: string) {
  return apiClient
    .post(`/instagram/comments/${commentId}/reply`, null, { params: { token, message } })
    .then((r) => r.data);
}
