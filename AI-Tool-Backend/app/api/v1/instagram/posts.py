# app/api/v1/instagram/posts.py
from fastapi import APIRouter, status
from datetime import datetime, timezone
from app.schemas.instagram import CreatePostRequest
from app.workers.instagram_processors import publish_instagram_post_task

router = APIRouter(prefix="/posts", tags=["Instagram Posts"])

@router.post("/schedule", status_code=status.HTTP_202_ACCEPTED)
def schedule_post(payload: CreatePostRequest):
    """Accepts media distribution assets and assigns them to the background worker queue."""
    mock_post_id = "post_dev_12345"
    mock_access_token = "EAAb...." # Token would realistically be pulled from DB lookup via ig_user_id
    
    # Compute countdown delay matrix if a scheduled timestamp is supplied
    countdown = 0
    if payload.scheduled_at:
        now = datetime.now(timezone.utc)
        target_time = payload.scheduled_at.replace(tzinfo=timezone.utc)
        if target_time > now:
            countdown = int((target_time - now).total_seconds())

    # Dispatch down to Celery Broker
    publish_instagram_post_task.apply_async(
        kwargs={
            "post_id": mock_post_id,
            "ig_user_id": payload.ig_user_id,
            "media_url": str(payload.media_url),
            "media_type": payload.media_type,
            "caption": payload.caption or "",
            "access_token": mock_access_token
        },
        countdown=countdown
    )

    return {
        "success": True,
        "post_id": mock_post_id,
        "status": "QUEUED" if countdown > 0 else "PROCESSING",
        "delay_seconds": countdown
    }