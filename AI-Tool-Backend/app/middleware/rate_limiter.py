# app/middleware/rate_limiter.py
import logging
import time
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger("platform.middleware.ratelimit")

class UpstashRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 100, window: int = 60):
        """
        Non-blocking high-throughput sliding window rate limiter.
        Uses standard async redis connections compatible with both Upstash and local Redis.
        """
        super().__init__(app)
        self.limit = limit
        self.window = window
        # Create a persistent async connection pool from the environment configurations
        self.redis_pool = aioredis.ConnectionPool.from_url(
            settings.UPSTASH_REDIS_URL, 
            decode_responses=True
        )

    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Intercepts incoming traffic to enforce algorithmic token bucket restrictions.
        Tracks unique client footprints across isolated sliding windows.
        """
        # Short-circuit early: Pass automated heartbeat/health checks without tracking
        if request.url.path == "/health":
            return await call_next(request)

        # Build a distinct cache footprint based on the client IP address
        client_ip = request.client.host if request.client else "unknown"
        redis_key = f"ratelimit:{client_ip}:{request.url.path}"
        
        current_time = time.time()
        clear_before = current_time - self.window

        try:
            # Initialize connection from pool context
            client = aioredis.Redis(connection_pool=self.redis_pool)
            
            # Execute an atomic transactional pipeline to process the sliding window check
            async with client.pipeline(transaction=True) as pipe:
                # 1. Purge hits that fell outside the current historical sliding window frame
                pipe.zremrangebyscore(redis_key, 0, clear_before)
                # 2. Count active elements remaining inside this client's unique window
                pipe.zcard(redis_key)
                # 3. Log the current request timestamp as an entry token score
                pipe.zadd(redis_key, {str(current_time): current_time})
                # 4. Refresh key expiration tracking to prevent persistent database bloat
                pipe.expire(redis_key, self.window)
                
                # Execute pipeline instructions sequentially in a single network trip
                results = await pipe.execute()
                
            # Extract current active request total from step 2 (index 1 of execution array)
            current_requests = results[1]

            if current_requests > self.limit:
                logger.warning(f"Rate limit restriction triggered for target boundary host: {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "success": False,
                        "error": {
                            "code": "TOO_MANY_REQUESTS",
                            "detail": f"API consumption limits exceeded. Maximum allowed: {self.limit} calls per {self.window}s window."
                        }
                    }
                )

        except Exception as exc:
            # Defensive Fail-open principle: If local or external Redis drops, log the critical event
            # but allow business logic flow to continue without dropping active customer traffic.
            logger.critical(f"Unhandled architectural panic: {str(exc)}", exc_info=True)

        return await call_next(request)