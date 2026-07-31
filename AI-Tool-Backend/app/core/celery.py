# app/core/celery.py
import ssl

from celery import Celery
from app.core.config import settings

# Injects the internal Redis network path from settings.UPSTASH_REDIS_URL
celery_app = Celery(
    "scale_social_worker",
    broker=settings.UPSTASH_REDIS_URL,
    backend=settings.UPSTASH_REDIS_URL,
)

celery_app.conf.update(
    task_track_started=True,
    broker_connection_retry_on_startup=True,
    timezone="UTC",
)

# Configure SSL for Upstash Redis (rediss://) -- without this, Celery's
# TLS handshake to Upstash fails outright (this was missing from the
# earlier audit pass; caught during real end-to-end testing against a
# live Upstash instance).
if settings.UPSTASH_REDIS_URL.startswith("rediss://"):
    celery_app.conf.broker_use_ssl = {
        "ssl_cert_reqs": ssl.CERT_NONE,
    }

    celery_app.conf.redis_backend_use_ssl = {
        "ssl_cert_reqs": ssl.CERT_NONE,
    }

# Explicit import instead of autodiscover_tasks(["app.workers"]): Celery's
# autodiscover_tasks looks for a submodule literally named `tasks` inside
# each listed package by default (i.e. app.workers.tasks) -- this project's
# actual task modules are named scheduler.py and instagram_processors.py,
# so autodiscovery silently found nothing and celery_app.tasks stayed
# empty even after celery_app.finalize(). Importing the package directly
# runs app/workers/__init__.py, which imports every task module and
# registers all three tasks reliably regardless of file naming.
import app.workers  # noqa: E402,F401