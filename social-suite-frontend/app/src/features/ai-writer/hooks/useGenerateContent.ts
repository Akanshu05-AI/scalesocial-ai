"use client";

import { useMutation } from "@tanstack/react-query";
import { generateContent, refineContent, scheduleGenericPost } from "../api";
import { useToast } from "@/components/ui/toast";

export function useGenerateContent() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: generateContent,
    onError: (error: { message: string }) => {
      toast({ title: "Generation failed", description: error.message, variant: "error" });
    },
  });
}

export function useRefineContent() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: refineContent,
    onError: (error: { message: string }) => {
      toast({ title: "Refine failed", description: error.message, variant: "error" });
    },
  });
}

export function useScheduleGenericPost() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: scheduleGenericPost,
    onSuccess: () => toast({ title: "Post queued", variant: "success" }),
    onError: (error: { message: string }) => {
      toast({ title: "Couldn't queue post", description: error.message, variant: "error" });
    },
  });
}
