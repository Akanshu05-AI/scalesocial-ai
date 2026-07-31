import type { NormalizedApiError } from "./response-helpers";

/**
 * Runs `primary` (a real backend call). If it fails because the backend
 * itself couldn't be reached at all — connection refused, DNS failure,
 * timeout — `status` on the normalized error is null (see
 * normalizeError), and this falls back to local data instead of
 * propagating the error. If the backend WAS reached and returned a real
 * error (401, 404, 422, 500...), that's a genuine answer from a live
 * server, not a "backend is down" situation — this does NOT fall back
 * for those, since silently hiding a real 403 or validation error behind
 * fake success would be actively misleading.
 */
export async function withOfflineFallback<T>(
  primary: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    const normalized = error as NormalizedApiError;
    if (normalized.status === null) {
      return await fallback();
    }
    throw error;
  }
}
