"""
app/services/twitter_client.py

Low-level async HTTP wrapper around Twitter's API. Every other service
in this module (oauth, post, media, thread, analytics) goes through
THIS file to talk to Twitter — no service ever calls httpx directly.
"""

import asyncio
import time
import logging
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.core.exceptions import PlatformException

logger = logging.getLogger("platform.twitter.client")

# Twitter API error codes that are safe to retry automatically —
# transient server-side issues, not our request being wrong.
_RETRYABLE_STATUS_CODES = {500, 502, 503, 504}


class TwitterAPIClient:
    """
    Thin async wrapper for authenticated calls to Twitter's REST API.

    One instance is created per-request (via dependency injection) with
    the CALLER'S decrypted bearer/access token.
    """

    def __init__(self, access_token: str) -> None:
        self._access_token = access_token
        self._base_url = getattr(settings, "TWITTER_API_BASE_URL", "https://api.twitter.com/2")

    def _headers(self, *, content_type: str = "application/json") -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": content_type,
        }

    async def request(
        self,
        method: str,
        path: str,
        *,
        json_body: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
        idempotent: bool = False,
    ) -> dict[str, Any]:
        """
        Executes an authenticated request against `{base_url}{path}` with
        automatic retry on transient failures and structured handling of
        rate limits.
        """
        url = f"{self._base_url}{path}"
        last_exception: Optional[Exception] = None

        max_retries = getattr(settings, "HTTP_MAX_RETRIES", 3)
        timeout_seconds = getattr(settings, "HTTP_TIMEOUT_SECONDS", 30)
        max_attempts = max_retries if idempotent else 1

        for attempt in range(1, max_attempts + 1):
            try:
                async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                    response = await client.request(
                        method,
                        url,
                        headers=self._headers(),
                        json=json_body,
                        params=params,
                    )
            except httpx.RequestError as exc:
                last_exception = exc
                logger.warning(
                    f"Network error calling Twitter (attempt {attempt}/{max_attempts}): {str(exc)}"
                )
                if attempt < max_attempts:
                    await asyncio.sleep(_backoff_delay(attempt))
                    continue
                raise PlatformException(
                    code="TWITTER_API_ERROR",
                    message="Failed to reach Twitter API after retries.",
                    status_code=502
                ) from exc

            if response.status_code == 429:
                retry_after = _extract_retry_after(response)
                logger.warning(f"Twitter rate limit hit on {path} — retry_after={retry_after}s")
                raise PlatformException(
                    code="TWITTER_RATE_LIMIT_ERROR",
                    message=f"Twitter API rate limit exceeded. Retry after {retry_after} seconds.",
                    status_code=429
                )

            if response.status_code in _RETRYABLE_STATUS_CODES and attempt < max_attempts:
                logger.warning(
                    f"Retryable Twitter error {response.status_code} on {path} (attempt {attempt}/{max_attempts})",
                )
                await asyncio.sleep(_backoff_delay(attempt))
                continue

            if response.status_code >= 400:
                error_body = _safe_json(response)
                logger.error(
                    f"Twitter API error status={response.status_code} path={path} body={str(error_body)}",
                )
                raise PlatformException(
                    code="TWITTER_API_ERROR",
                    message=f"Twitter API returned status code {response.status_code}.",
                    status_code=response.status_code
                )

            return _safe_json(response)

        raise PlatformException(
            code="TWITTER_API_ERROR",
            message="Twitter API request failed due to an unexpected infrastructure exception.",
            status_code=500
        ) from last_exception

    async def upload_media(
        self,
        file_bytes: bytes,
        *,
        media_category: str,
        media_type: str,
    ) -> dict[str, Any]:
        """
        Uploads media via Twitter's chunked upload endpoint (v1.1 media upload).
        """
        upload_base = getattr(settings, "TWITTER_UPLOAD_BASE_URL", "https://upload.twitter.com/1.1")
        timeout_seconds = getattr(settings, "HTTP_TIMEOUT_SECONDS", 30)
        headers = {"Authorization": f"Bearer {self._access_token}"}

        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            # INIT — declare total size and category, get a media_id back
            init_response = await client.post(
                f"{upload_base}/media/upload.json",
                headers=headers,
                data={
                    "command": "INIT",
                    "total_bytes": len(file_bytes),
                    "media_type": media_type,
                    "media_category": media_category,
                },
            )
            if init_response.status_code >= 400:
                raise PlatformException(
                    code="TWITTER_MEDIA_INIT_FAILED",
                    message="Media upload initialization phase failed.",
                    status_code=init_response.status_code
                )
            media_id = _safe_json(init_response)["media_id_string"]

            # APPEND — upload in chunks (5MB each, well under Twitter's limits)
            chunk_size = 5 * 1024 * 1024
            for segment_index, offset in enumerate(range(0, len(file_bytes), chunk_size)):
                chunk = file_bytes[offset : offset + chunk_size]
                append_response = await client.post(
                    f"{upload_base}/media/upload.json",
                    headers=headers,
                    data={"command": "APPEND", "media_id": media_id, "segment_index": segment_index},
                    files={"media": chunk},
                )
                if append_response.status_code >= 400:
                    raise PlatformException(
                        code="TWITTER_MEDIA_APPEND_FAILED",
                        message="Media upload data chunk ingestion phase failed.",
                        status_code=append_response.status_code
                    )

            # FINALIZE — tell Twitter the upload is complete
            finalize_response = await client.post(
                f"{upload_base}/media/upload.json",
                headers=headers,
                data={"command": "FINALIZE", "media_id": media_id},
            )
            if finalize_response.status_code >= 400:
                raise PlatformException(
                    code="TWITTER_MEDIA_FINALIZE_FAILED",
                    message="Media upload settlement consolidation phase failed.",
                    status_code=finalize_response.status_code
                )

            finalize_body = _safe_json(finalize_response)

            # Video/GIF processing is asynchronous server-side — poll STATUS
            processing_info = finalize_body.get("processing_info")
            if processing_info:
                finalize_body = await self._poll_media_processing(client, headers, media_id)

            return finalize_body

    async def _poll_media_processing(
        self, client: httpx.AsyncClient, headers: dict[str, str], media_id: str
    ) -> dict[str, Any]:
        """
        Polls Twitter's media STATUS command until a video/GIF finishes server-side transcoding.
        """
        upload_base = getattr(settings, "TWITTER_UPLOAD_BASE_URL", "https://upload.twitter.com/1.1")
        max_polls = 20

        for _ in range(max_polls):
            status_response = await client.get(
                f"{upload_base}/media/upload.json",
                headers=headers,
                params={"command": "STATUS", "media_id": media_id},
            )
            body = _safe_json(status_response)
            processing_info = body.get("processing_info", {})
            state = processing_info.get("state")

            if state == "succeeded":
                return body
            if state == "failed":
                raise PlatformException(
                    code="TWITTER_MEDIA_PROCESSING_FAILED",
                    message="Twitter failed to transcode and process uploaded asset.",
                    status_code=422
                )

            wait_seconds = processing_info.get("check_after_secs", 3)
            await asyncio.sleep(wait_seconds)

        raise PlatformException(
            code="TWITTER_MEDIA_PROCESSING_TIMEOUT",
            message="Media asynchronous optimization checks timed out.",
            status_code=408
        )


def _extract_retry_after(response: httpx.Response) -> Optional[int]:
    reset_header = response.headers.get("x-rate-limit-reset")
    if not reset_header:
        return None
    try:
        return max(int(reset_header) - int(time.time()), 1)
    except ValueError:
        return None


def _safe_json(response: httpx.Response) -> dict[str, Any]:
    try:
        return response.json()
    except ValueError:
        return {"raw_body": response.text}


def _backoff_delay(attempt: int) -> float:
    """Exponential backoff with a small base — 0.5s, 1s, 2s, 4s..."""
    return 0.5 * (2 ** (attempt - 1))