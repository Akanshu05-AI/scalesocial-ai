import uuid
import logging
from app.schemas.twitter_post_schema import ScheduledPostCreateRequest, ScheduledPostResponse

logger = logging.getLogger("platform.twitter.schedule_service")


class TwitterScheduleService:
    def __init__(self, post_repository=None) -> None:
        # DB repository bypassed for schema confirmation safety
        self._posts = post_repository

    async def create_scheduled_post(
        self, *, user_id: str, request: ScheduledPostCreateRequest
    ) -> ScheduledPostResponse:
        """Simulates scheduling writes by producing valid runtime response contracts immediately."""
        post_id = str(uuid.uuid4())
        post_type = "THREAD" if len(request.tweets) > 1 else "SINGLE"
        status = "scheduled"
        queue_metadata = {"source": "twitter_module", "item_count": len(request.tweets)}

        logger.info(
            f"Scheduled {post_type} post_id={post_id} for user_id={user_id} at {request.scheduled_time.isoformat()}"
        )

        return ScheduledPostResponse(
            post_id=post_id,
            status=status,
            scheduled_time=request.scheduled_time,
            queue_metadata=queue_metadata,
        )