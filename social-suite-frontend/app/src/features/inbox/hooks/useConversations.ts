"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { fetchConversations, fetchMessages, sendReply, markRead, type ConversationFilters } from "../api";

export function useConversations(filters: ConversationFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.conversations(filters),
    queryFn: () => fetchConversations(filters),
    refetchInterval: 30_000, // polling fallback if the WebSocket hook isn't wired up
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.conversation(conversationId ?? ""),
    queryFn: () => fetchMessages(conversationId as string),
    enabled: !!conversationId,
  });
}

export function useSendReply(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendReply(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => markRead(conversationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });
}
