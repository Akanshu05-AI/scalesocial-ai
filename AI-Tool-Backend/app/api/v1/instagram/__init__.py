# app/api/v1/instagram/__init__.py
from fastapi import APIRouter
from app.api.v1.instagram.auth import router as auth_router
from app.api.v1.instagram.posts import router as posts_router
from app.api.v1.instagram.comments import router as comments_router
from app.api.v1.instagram.webhooks import router as webhooks_router

instagram_router = APIRouter(prefix="/instagram")

instagram_router.include_router(auth_router)
instagram_router.include_router(posts_router)
instagram_router.include_router(comments_router)
instagram_router.include_router(webhooks_router)