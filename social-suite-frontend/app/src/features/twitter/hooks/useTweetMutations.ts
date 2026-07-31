"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTweet, createThread, scheduleTweets, uploadTwitterMedia } from "../api";
import { useToast } from "@/components/ui/toast";
import type { TweetCreateRequest, ThreadCreateRequest, ScheduledPostCreateRequest } from "../types";

export function useUploadTwitterMedia() {
  return useMutation({ mutationFn: (file: File) => uploadTwitterMedia(file) });
}

export function useCreateTweet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (input: TweetCreateRequest) => createTweet(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["twitter-posts"] });
      toast({ title: "Tweet published", variant: "success" });
    },
    onError: (error: { message: string }) => {
      toast({ title: "Couldn't post tweet", description: error.message, variant: "error" });
    },
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (input: ThreadCreateRequest) => createThread(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["twitter-posts"] });
      toast({ title: "Thread published", variant: "success" });
    },
    onError: (error: { message: string }) => {
      toast({ title: "Couldn't post thread", description: error.message, variant: "error" });
    },
  });
}

export function useScheduleTweets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (input: ScheduledPostCreateRequest) => scheduleTweets(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["twitter-posts"] });
      toast({ title: "Tweet(s) scheduled", variant: "success" });
    },
    onError: (error: { message: string }) => {
      toast({ title: "Couldn't schedule", description: error.message, variant: "error" });
    },
  });
}
