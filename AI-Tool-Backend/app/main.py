import logging
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.exceptions import PlatformException
from app.middleware.error_handler import StandardizedOpsMiddleware
from app.middleware.rate_limiter import UpstashRateLimitMiddleware
from app.middleware.logging import StructuralAPILoggingMiddleware
from app.api.v1.api import api_router
from app.api.v1.instagram import instagram_router

# Initialize Structured Core Logging Channel
logger = logging.getLogger("platform.core")

def create_application() -> FastAPI:
    """
    Factory function initializing the complete core application matrix.
    Configures structural validation schemas, docs UI endpoints, and base routing.
    """
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description="Production enterprise backbone foundation layer for ScaleSocial platform.",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # -------------------------------------------------------------------------
    # CORS CONFIGURATION (Cross-Origin Resource Sharing)
    # -------------------------------------------------------------------------
    origins = [
        "http://localhost:3000",  # Next.js Frontend Development Target
        settings.FRONTEND_URL,
    ]
    if settings.SUPABASE_URL and settings.SUPABASE_URL not in origins:
        origins.append(settings.SUPABASE_URL)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -------------------------------------------------------------------------
    # MIDDLEWARE ORCHESTRATION PIPELINE
    # -------------------------------------------------------------------------
    # Request Interception Order: 
    # StandardizedOpsMiddleware -> StructuralAPILoggingMiddleware -> UpstashRateLimitMiddleware
    
    application.add_middleware(UpstashRateLimitMiddleware, limit=100, window=60)
    application.add_middleware(StructuralAPILoggingMiddleware)
    application.add_middleware(StandardizedOpsMiddleware)

    # -------------------------------------------------------------------------
    # GLOBAL SYSTEM EXCEPTION MAPPING
    # -------------------------------------------------------------------------
    
    @application.exception_handler(PlatformException)
    async def platform_exception_handler(request: Request, exc: PlatformException) -> JSONResponse:
        """Catches domain-driven logic exceptions and maps them to clean API specs."""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "detail": exc.message
                },
                "data": None,
                "meta": None
            }
        )

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """Intercepts Pydantic validation anomalies and extracts field error definitions."""
        error_details = {}
        for error in exc.errors():
            loc = ".".join([str(x) for x in error["loc"][1:]]) if len(error["loc"]) > 1 else "body"
            error_details[loc] = [error["msg"]]

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "detail": "The payload provided failed strict typing validation metrics.",
                    "fields": error_details
                },
                "data": None,
                "meta": None
            }
        )

    @application.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        """
        FastAPI/Starlette intercept HTTPException before it would ever reach
        the generic Exception handler below, so without this dedicated
        handler every plain `raise HTTPException(...)` -- the standard
        pattern used throughout auth/deps.py and elsewhere -- returns raw
        `{"detail": ...}` instead of the app's own envelope. Registered
        explicitly to close that gap.
        """
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": "HTTP_ERROR",
                    "detail": exc.detail
                },
                "data": None,
                "meta": None
            },
            headers=getattr(exc, "headers", None)
        )

    @application.exception_handler(Exception)
    async def global_unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Catch-all architectural boundary isolating internal runtime panics."""
        logger.critical(f"System panic event caught by global fallback: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "detail": "An unexpected infrastructure error occurred."
                },
                "data": None,
                "meta": None
            }
        )

    # -------------------------------------------------------------------------
    # CORE SYSTEM ROUTING MATRIX
    # -------------------------------------------------------------------------
    
    @application.get("/", tags=["System Root"], status_code=status.HTTP_200_OK)
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "status": "online",
            "environment": settings.ENVIRONMENT,
            "docs": "/docs",
            "health": "/health",
            "api": f"{settings.API_V1_STR}",
        }

    @application.get("/health", tags=["System Architecture Health Check"], status_code=status.HTTP_200_OK)
    async def health_check():
        return {
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0"
        }

    # Mount structural versioned routes
    application.include_router(api_router, prefix=settings.API_V1_STR)
    
    # Mount Instagram integration module endpoints
    application.include_router(instagram_router, prefix=settings.API_V1_STR)

    return application

# Primary app execution handle targeted by web servers (Uvicorn/Gunicorn)
app = create_application()