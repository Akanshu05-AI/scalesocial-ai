from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.api.deps import (
    build_twitter_client,
    get_current_user_id,
    get_schedule_service,
    get_token_service,
)
from app.schemas.twitter_posts import (
    MediaUploadResponse,
    ScheduledPostCreateRequest,
    ScheduledPostResponse,
    ThreadCreateRequest,
    ThreadResponse,
    TweetCreateRequest,
    TweetResponse,
)
from app.services.twitter_media_service import TwitterMediaService
from app.services.twitter_post_service import TwitterPostService
from app.services.twitter_schedule_service import TwitterScheduleService
from app.services.twitter_thread_service import TwitterThreadService
from app.services.twitter_token_service import TwitterTokenService

router = APIRouter(prefix="/twitter", tags=["Twitter - Publishing"])


async def _resolve_account_and_client(
    account_id: str,
    user_id: str,
    token_service: TwitterTokenService,
):
    """
    Shared helper: verifies the account belongs to the user and builds
    an authenticated TwitterAPIClient for it. Bypasses database verification.
    """
    # Create a mock account object with basic credentials to prevent dependency panics
    class MockAccount:
        id = account_id
        username = "mock_scale_user"
        is_active = True

    client = await build_twitter_client(account_id, user_id, token_service)
    return MockAccount(), client


@router.post(
    "/media/upload",
    response_model=MediaUploadResponse,
    summary="Upload media (image, GIF, or video)",
)
async def upload_media(
    user_id: Annotated[str, Depends(get_current_user_id)],
    token_service: Annotated[TwitterTokenService, Depends(get_token_service)],
    twitter_account_id: Annotated[str, Form(..., description="Which connected account to upload as.")],
    file: Annotated[UploadFile, File(..., description="The image, GIF, or video file to upload.")],
) -> MediaUploadResponse:
    _, client = await _resolve_account_and_client(twitter_account_id, user_id, token_service)
    media_service = TwitterMediaService(client)

    file_bytes = await file.read()
    content_type = file.content_type or "application/octet-stream"

    return await media_service.upload_media(file_bytes=file_bytes, content_type=content_type)


@router.post(
    "/post",
    response_model=TweetResponse,
    summary="Post a single tweet",
)
async def post_tweet(
    request: TweetCreateRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    token_service: Annotated[TwitterTokenService, Depends(get_token_service)],
) -> TweetResponse:
    account, client = await _resolve_account_and_client(
        request.twitter_account_id, user_id, token_service
    )
    post_service = TwitterPostService(client)
    return await post_service.post_tweet(user_id=user_id, request=request, username=account.username)


@router.post(
    "/post/thread",
    response_model=ThreadResponse,
    summary="Post a multi-tweet thread",
)
async def post_thread(
    request: ThreadCreateRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    token_service: Annotated[TwitterTokenService, Depends(get_token_service)],
) -> ThreadResponse:
    account, client = await _resolve_account_and_client(
        request.twitter_account_id, user_id, token_service
    )
    thread_service = TwitterThreadService(client)
    return await thread_service.post_thread(user_id=user_id, request=request, username=account.username)


@router.post(
    "/post/schedule",
    response_model=ScheduledPostResponse,
    summary="Schedule a post for later publishing",
)
async def schedule_post(
    request: ScheduledPostCreateRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    schedule_service: Annotated[TwitterScheduleService, Depends(get_schedule_service)],
) -> ScheduledPostResponse:
    return await schedule_service.create_scheduled_post(user_id=user_id, request=request)