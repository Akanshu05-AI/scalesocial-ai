from fastapi import APIRouter
from app.api.v1 import users, rbac, ai, facebook
from app.api.v1.twitter import twitter_router
from app.api.v1.linkedin.router import router as linkedin_router

api_router = APIRouter()

# Mount System Modules
api_router.include_router(users.router, prefix="/users", tags=["User Engine"])
api_router.include_router(rbac.router, prefix="/rbac", tags=["Role Management Engine"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Writer Operations"])
api_router.include_router(facebook.router, prefix="/facebook", tags=["Facebook Operations"])

# Mount Platform Engines
api_router.include_router(twitter_router)
api_router.include_router(linkedin_router)  # <-- Mounts cleanly under /api/v1