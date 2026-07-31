# app/workers/instagram_processors.py
import asyncio
import logging
from typing import Dict, Any
from app.core.celery import celery_app
from app.services.instagram_publishing import InstagramPublishingService

logger = logging.getLogger(__name__)
publishing_service = InstagramPublishingService()

@celery_app.task(name="app.workers.instagram_processors.publish_instagram_post_task", bind=True, max_retries=3)
def publish_instagram_post_task(self, post_id: str, ig_user_id: str, media_url: str, media_type: str, caption: str, access_token: str) -> Dict[str, Any]:
    """
    Celery background worker task that orchestrates the 3-step publishing flow for Instagram posts and Reels.
    Runs the asynchronous publishing service within Celery's synchronous execution context.
    """
    logger.info(f"Initializing background publication execution for post ID: {post_id}")
    
    try:
        # Execute the async publishing routine inside the worker thread loop
        result = asyncio.run(
            publishing_service.publish_to_instagram(
                ig_user_id=ig_user_id,
                media_url=media_url,
                media_type=media_type,
                caption=caption,
                access_token=access_token
            )
        )
        
        logger.info(f"Post {post_id} successfully broadcasted to Instagram. Platform ID: {result['platform_post_id']}")
        return result

    except Exception as exc:
        logger.error(f"Publishing execution failed for post {post_id}: {str(exc)}")
        # Exponential backoff retry configuration for temporal platform or network drops
        countdown = 2 ** self.request.retries * 60  
        raise self.retry(exc=exc, countdown=countdown)

@celery_app.task(name="app.workers.instagram_processors.process_webhook_event_task", max_retries=3)
def process_webhook_event_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Celery background worker task that consumes enqueued real-time Meta webhook notifications.
    Parses live mentions, comments, or messaging metadata for automated programmatic responses.
    """
    logger.info("Processing enqueued Meta webhook transaction layout payload...")
    
    try:
        # Parse the structured entry tree payload arrays
        entries = payload.get("entry", [])
        processed_events = 0

        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                field = change.get("field")
                value = change.get("value", {})
                
                if field == "comments":
                    # comment_id extracted but not yet used -- PRD's Unified
                    # Inbox "reply from tool" isn't wired to this webhook path
                    # yet; app/api/v1/instagram/comments.py already has a
                    # reply-by-comment-id endpoint this could call into.
                    _comment_id = value.get("id")
                    text = value.get("text")
                    media_id = value.get("media", {}).get("id")
                    username = value.get("from", {}).get("username")
                    
                    logger.info(f"Extracted real-time comment notification: '{text}' by @{username} on media {media_id}")
                    # Future point of extension: trigger automated comment reply logic directly from here
                    processed_events += 1
                    
        return {
            "status": "PROCESSED",
            "events_parsed": processed_events
        }
        
    except Exception as e:
        logger.error(f"Failed to process enqueued webhook transaction: {str(e)}")
        raise e