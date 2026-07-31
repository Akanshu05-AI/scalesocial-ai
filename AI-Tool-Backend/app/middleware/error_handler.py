# app/middleware/error_handler.py
import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

logger = logging.getLogger("platform.security")

class StandardizedOpsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Response-Time-Stamps"] = str(process_time)
            return response
        except Exception as exc:
            logger.error(f"Unhandled architectural panic: {str(exc)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "detail": "A critical platform event was intercepted system-wide."
                    }
                }
            )