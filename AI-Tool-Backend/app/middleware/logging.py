# app/middleware/logging.py
import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("platform.api")

class StructuralAPILoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Intercepts incoming requests to profile latency metrics and 
        log structured HTTP metadata.
        """
        start_time = time.perf_counter()
        
        # Capture raw traffic metadata parameters
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"
        
        # Proceed down the execution pipeline chain
        response = await call_next(request)
        
        # Calculate execution duration metrics
        duration = time.perf_counter() - start_time
        status_code = response.status_code
        
        # Log structured information about the HTTP event
        log_message = (
            f"HTTP {method} {path} | Status: {status_code} | "
            f"Latency: {duration:.4f}s | IP: {client_ip}"
        )
        
        if status_code >= 500:
            logger.error(log_message)
        elif status_code >= 400:
            logger.warning(log_message)
        else:
            logger.info(log_message)
            
        return response