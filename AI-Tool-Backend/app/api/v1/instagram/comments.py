# app/api/v1/instagram/comments.py
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.instagram import ReplyCommentRequest
from app.services.instagram_comments import InstagramCommentsService

router = APIRouter(prefix="/comments", tags=["Instagram Comments"])

def get_comments_service() -> InstagramCommentsService:
    return InstagramCommentsService()

@router.get("/{media_id}", status_code=status.HTTP_200_OK)
async def get_media_comments(
    media_id: str,
    token: str = Query(...),
    limit: int = Query(25, ge=1, le=100),
    after: Optional[str] = Query(None),
    service: InstagramCommentsService = Depends(get_comments_service)
):
    """Fetches comment pagination rows belonging to an isolated media object node."""
    result = await service.fetch_comments(
        media_id=media_id,
        limit=limit,
        after=after,
        page_access_token=token
    )
    return result

@router.post("/{comment_id}/reply", status_code=status.HTTP_201_CREATED)
async def post_comment_reply(
    comment_id: str,
    token: str = Query(...),
    payload: ReplyCommentRequest = Depends(),
    service: InstagramCommentsService = Depends(get_comments_service)
):
    """Publishes a nested threaded comment reply response underneath a platform node."""
    reply_id = await service.reply_to_comment(
        comment_id=comment_id,
        message=payload.message,
        page_access_token=token
    )
    return {"success": True, "reply_id": reply_id}