# app/api/v1/instagram/webhooks.py
from fastapi import APIRouter, Depends, Header, Request, Query, status, HTTPException
from app.services.instagram_webhook import InstagramWebhookService
from typing import Optional

router = APIRouter(prefix="/webhook", tags=["Instagram Webhooks"])

def get_webhook_service() -> InstagramWebhookService:
    return InstagramWebhookService(
        app_secret="YOUR_META_APP_SECRET",
        verify_token="my_secure_verify_token"
    )

@router.get("", status_code=status.HTTP_200_OK)
def verify_meta_webhook(
    hub_mode: str = Query(..., alias="hub.mode"),
    hub_challenge: int = Query(..., alias="hub.challenge"),
    hub_verify_token: str = Query(..., alias="hub.verify_token"),
    service: InstagramWebhookService = Depends(get_webhook_service)
):
    """Validates the initial setup handshake requested by the Meta Developer Panel."""
    return service.verify_setup(mode=hub_mode, token=hub_verify_token, challenge=hub_challenge)

@router.post("", status_code=status.HTTP_200_OK)
async def receive_webhook_payload(
    request: Request,
    x_hub_signature_256: Optional[str] = Header(None),
    service: InstagramWebhookService = Depends(get_webhook_service)
):
    """Receives and validates asynchronous payload event distributions from Meta."""
    raw_body = await request.body()
    
    # Validate crypto authenticity before parsing data contents
    if not service.verify_signature(signature=x_hub_signature_256, raw_body=raw_body):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="HMAC SHA256 Signature confirmation failed."
        )

    json_payload = await request.json()
    
    # Enqueue tasks to Celery workers out-of-band
    status_response = await service.enqueue_webhook_event(payload=json_payload)
    return status_response