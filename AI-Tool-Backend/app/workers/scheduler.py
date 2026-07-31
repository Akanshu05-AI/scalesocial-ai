# app/workers/scheduler.py
import asyncio
from celery import shared_task
from celery.utils.log import get_task_logger

from app.api.deps import get_supabase_client
from app.repositories.scheduler import SchedulerRepository
from app.services import publisher  # Placeholder target for the channel publishing engine

logger = get_task_logger(__name__)

@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=10,
    retry_backoff_max=120,
    retry_jitter=True,
)
def publish_post_task(self, post_id: str, platform: str, draft: str, user_id: str):
    attempt = self.request.retries + 1
    logger.info(f"Asynchronous engine processing post {post_id} to {platform} (Attempt {attempt})")
    
    # Initialize connection context safely outside the web framework
    client = get_supabase_client()
    repo = SchedulerRepository(client)
    repo.update_status(post_id, status="publishing", attempts=attempt)

    try:
        # For Instagram, we need access tokens and media fields stored in the post record or user integration tables
        if platform.lower() in ["instagram", "insta"]:
            # Fetch the comprehensive post data (access_token, ig_user_id, media_url, etc.)
            # stored on the scheduled_posts record for this post.
            post_data = repo.get_scheduled_post(post_id) or {}
            
            # Extract Meta parameters (defaulting to safe placeholders if not populated)
            access_token = post_data.get("access_token") or post_data.get("page_access_token")
            ig_user_id = post_data.get("ig_user_id")
            media_url = post_data.get("media_url")
            media_type = post_data.get("media_type", "IMAGE")  # IMAGE or VIDEO

            if not access_token or not ig_user_id or not media_url:
                raise ValueError("Missing required Instagram credentials (access_token, ig_user_id, or media_url) in post context.")

            # Executes the structured Instagram-specific publisher module route asynchronously
            result = asyncio.run(
                publisher.publish_instagram(
                    ig_user_id=ig_user_id,
                    access_token=access_token,
                    media_url=media_url,
                    media_type=media_type,
                    caption=draft
                )
            )
        else:
            # Executes the generic social integration posting engine routine asynchronously for other networks
            result = asyncio.run(publisher.publish_post(platform, draft, user_id))
            
    except Exception as exc:
        is_final_attempt = attempt > self.max_retries
        if is_final_attempt:
            repo.update_status(post_id, status="failed", attempts=attempt, error=str(exc))
            logger.error(f"Post {post_id} permanently failed after {attempt} attempts: {exc}")
            raise
            
        repo.update_status(post_id, status="scheduled", attempts=attempt, error=str(exc))
        raise self.retry(exc=exc)

    repo.update_status(post_id, status="published", attempts=attempt)
    logger.info(f"Post {post_id} successfully broadcasted across platform node networks: {result}")
    return result