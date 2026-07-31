import type { AxiosError } from "axios";
import type { FieldError } from "@/types";

export interface NormalizedApiError {
  /** null means the request never reached the backend at all (network
   *  down, timeout) — see withOfflineFallback, which uses this to decide
   *  whether to fall back to local data. A real number here means the
   *  backend WAS reached and gave a genuine error response. */
  status: number | null;
  message: string;
  fieldErrors: FieldError[];
}

/**
 * Matches the actual global error envelope from app/main.py's exception
 * handlers (PlatformException / RequestValidationError / HTTPException /
 * generic Exception — all four registered handlers use this exact shape):
 *
 *   { success: false, error: { code, detail, fields? }, data: null, meta: null }
 *
 * `fields` (only present on 422 validation errors) is a dict keyed by
 * field path with a list of message strings, e.g.
 *   { "text": ["Tweet text cannot be empty or whitespace only."] }
 * — not FastAPI's raw default `{ detail: [{loc, msg, type}] }` shape,
 * since this backend overrides that with its own handler.
 */
export function normalizeError(error: AxiosError): NormalizedApiError {
  const status = error.response?.status ?? null;
  const body = error.response?.data as
    | { success?: boolean; error?: { code?: string; detail?: string; fields?: Record<string, string[]> } }
    | undefined;

  if (body?.error) {
    const fieldErrors: FieldError[] = body.error.fields
      ? Object.entries(body.error.fields).map(([field, messages]) => ({
          field,
          message: messages[0] ?? "Invalid value",
        }))
      : [];
    return {
      status,
      message: body.error.detail ?? "Something went wrong",
      fieldErrors,
    };
  }

  return {
    status,
    message: error.message || "Network error — the backend may be unreachable",
    fieldErrors: [],
  };
}

/** Applies normalized field errors onto a react-hook-form instance. */
export function applyFieldErrors(
  fieldErrors: FieldError[],
  setError: (name: string, error: { message: string }) => void
) {
  fieldErrors.forEach(({ field, message }) => setError(field, { message }));
}
