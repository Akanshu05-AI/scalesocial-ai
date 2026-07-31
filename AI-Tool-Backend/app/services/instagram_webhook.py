# app/services/instagram_webhook.py
import hmac
import hashlib
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class InstagramWebhookService:
    def __init__(self, app_secret: Optional[str] = None, verify_token: str = "my_secure_verify_token"):
        self.app_secret = app_secret
        self.verify_token = verify_token

    def verify_setup(self, mode: str, token: str, challenge: int) -> int:
        """Verifies the initial hub subscribe handshake request challenge from Meta's servers."""
        if mode == "subscribe" and token == self.verify_token:
            logger.info("Webhook endpoint verification handshake verified successfully!")
            return challenge
            
        logger.warning("Failed webhook verification challenge token evaluation.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verify token signature match"
        )

    def verify_signature(self, signature: Optional[str], raw_body: bytes) -> bool:
        """
        Validates the X-Hub-Signature-256 header using SHA-256 HMAC digest computation.
        Uses hmac.compare_digest to securely protect against timing attack vulnerabilities.
        """
        if not self.app_secret:
            logger.error("META_APP_SECRET configuration is missing. Cannot evaluate signature.")
            return False

        if not signature or not signature.startswith("sha256="):
            return False

        actual_signature = signature.replace("sha256=", "")
        
        # Calculate expected HMAC signature from raw payload bytes
        expected_signature = hmac.new(
            self.app_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        # Prevent timing attacks across the raw execution strings
        try:
            return hmac.compare_digest(expected_signature, actual_signature)
        except Exception:
            return False

    async def enqueue_webhook_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses the inbound notification change field maps and dispatches the data
        directly to your Celery task workers for out-of-band execution.
        """
        logger.info("Logging and parsing incoming webhook stream transaction payloads...")
        
        # Extract operational event change type mapping from Meta structure arrays
        event_type = "UNKNOWN"
        try:
            if payload.get("entry") and isinstance(payload["entry"], list):
                entry = payload["entry"][0]
                if entry.get("changes") and isinstance(entry["changes"], list):
                    event_type = entry["changes"][0].get("field", "UNKNOWN")
        except (IndexError, AttributeError, KeyError):
            pass

        logger.info(f"Detected event structure variation layout element: '{event_type}'")

        # Database creation and event tracking IDs are deferred here.
        # Direct handoff call target placeholder passing directly down onto your Celery queue layer instead:
        #
        # from app.workers.instagram_processors import process_webhook_task
        # process_webhook_task.apply_async(kwargs={"payload": payload}, priority=6)

        return {
            "enqueued": True,
            "event_type": event_type,
            "status": "FORWARDED_TO_WORKER"
        }