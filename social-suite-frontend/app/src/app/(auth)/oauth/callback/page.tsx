"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants";

/**
 * Landing point after the backend brokers a platform OAuth handshake
 * (Twitter/LinkedIn/Facebook/Instagram). The backend redirects here with a
 * status query param; this page just reads it and routes onward — it does
 * not talk to the OAuth provider directly.
 */
function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    const timeout = setTimeout(() => {
      router.replace(
        status === "success"
          ? `${ROUTES.settingsConnections}?connected=true`
          : `${ROUTES.settingsConnections}?connected=false`
      );
    }, 1200);
    return () => clearTimeout(timeout);
  }, [router, searchParams]);

  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-signal border-t-transparent" />
      <p className="text-sm text-slate">Finishing account connection…</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-slate">Loading…</div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
