# app/workers/__init__.py
# Import required so Celery actually registers these tasks -- see
# app/core/celery.py for why autodiscover_tasks alone wasn't finding them
# (it only looks for a submodule literally named `tasks`, not the actual
# filenames used here).
from app.workers.scheduler import publish_post_task
from app.workers.instagram_processors import (
    publish_instagram_post_task,
    process_webhook_event_task,
)

__all__ = [
    "publish_post_task",
    "publish_instagram_post_task",
    "process_webhook_event_task",
]