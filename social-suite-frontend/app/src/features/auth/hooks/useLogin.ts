"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "../api";
import { ROUTES } from "@/constants";
import { useToast } from "@/components/ui/toast";
import type { UseFormSetError } from "react-hook-form";
import type { LoginInput } from "../schema";

export function useLogin(setError: UseFormSetError<LoginInput>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      // No manual store write needed here — supabase.auth.onAuthStateChange
      // (wired in ProtectedRoute / a root AuthListener) picks up the new
      // session and updates useAuthStore itself.
      router.push(searchParams.get("from") ?? ROUTES.overview);
    },
    onError: (error: { message: string }) => {
      // Supabase throws its own AuthError shape (message, status), not our
      // FastAPI 422 field-error shape, since this never touches our backend.
      setError("password", { message: "" });
      toast({ title: "Couldn't sign in", description: error.message, variant: "error" });
    },
  });
}
