"use client";

import { useMutation } from "@tanstack/react-query";
import { getTwitterLoginUrl } from "../api";

/**
 * GET /twitter/login returns a JSON authorize_url (per TwitterLoginResponse) —
 * the backend generates state + PKCE code_verifier/code_challenge and
 * keeps the verifier server-side (Redis), so the frontend's only job is
 * to redirect the browser to whatever URL comes back. No PKCE material
 * is handled here.
 */
export function useTwitterConnect() {
  return useMutation({
    mutationFn: getTwitterLoginUrl,
    onSuccess: ({ authorize_url }) => {
      window.location.href = authorize_url;
    },
  });
}
