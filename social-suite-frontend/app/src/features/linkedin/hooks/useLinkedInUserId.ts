"use client";

/**
 * Stopgap for the user_id:int mismatch described in features/linkedin/api.ts
 * — persists a single placeholder integer id in localStorage per browser
 * so the LinkedIn calls have SOMETHING to send. This is not real
 * multi-user identity; it's here so the LinkedIn composer is testable at
 * all pending a backend fix to use get_current_user like every other
 * authenticated router does.
 */
import { useState, useEffect } from "react";

const KEY = "social-suite:linkedin-user-id";

export function useLinkedInUserId() {
  const [userId, setUserId] = useState<number>(1);

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored) setUserId(Number(stored));
  }, []);

  function updateUserId(next: number) {
    setUserId(next);
    window.localStorage.setItem(KEY, String(next));
  }

  return { userId, setUserId: updateUserId };
}
