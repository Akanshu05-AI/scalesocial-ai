# app/middleware/authentication.py
import logging
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from app.core.security import verify_supabase_jwt

logger = logging.getLogger("platform.security")

class SupabaseAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Low-level structural interception layer extracting session credentials.
        Binds validated session profiles to the request state context.
        """
        auth_header = request.headers.get("Authorization")
        
        # Initialize an unauthenticated baseline fallback state context
        request.state.user = None

        if auth_header:
            if not auth_header.startswith("Bearer "):
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "error": {
                            "code": "MALFORMED_AUTH_HEADER",
                            "detail": "Authorization header protocol must follow standard 'Bearer <token>' pattern."
                        }
                    }
                )
            
            token = auth_header.split(" ")[1]
            try:
                # Decodes token signatures and passes Pydantic data profiles downstream
                user_payload = verify_supabase_jwt(token)
                request.state.user = user_payload
            except Exception as exc:
                logger.warning(f"Outbound token validation exception intercepted: {str(exc)}")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "error": {
                            "code": "INVALID_AUTH_TOKEN",
                            "detail": str(exc)
                        }
                    }
                )

        return await call_next(request)