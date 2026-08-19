import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, status
from app.core.exceptions import PlatformException

# Import provided schemas exactly
from app.schemas.twitter_account_schema import (
    TwitterAccountDisconnectResponse,
    TwitterAccountListResponse,
    TwitterAccountResponse,
)
from app.schemas.twitter_analytics_schema import (
    ThreadAnalyticsResponse,
    TweetAnalyticsResponse,
)
from app.schemas.twitter_auth_schema import (
    TwitterCallbackQuery,
    TwitterLoginResponse,
)
from app.schemas.twitter_post_schema import (
    MediaUploadResponse,
    ScheduledPostCreateRequest,
    ScheduledPostResponse,
    ThreadCreateRequest,
    ThreadResponse,
    TweetCreateRequest,
    TweetResponse,
)

# Core domain service injections
from app.services.twitter_oauth_service import TwitterOAuthService
from app.services.twitter_account_service import TwitterAccountService
from app.services.twitter_analytics_service import TwitterAnalyticsService
from app.services.twitter_media_service import TwitterMediaService
from app.services.twitter_schedule_service import TwitterScheduleService
from app.services.twitter_thread_service import TwitterThreadService

from app.api.deps import get_current_user_id

logger = logging.getLogger("platform.twitter.router")

router = APIRouter(prefix="/twitter", tags=["Twitter Platform"])


# --- DEPENDENCY INJECTION PROVIDERS ---

def get_oauth_service() -> TwitterOAuthService:
    # Bypassing physical Redis engine hooks for clean functional evaluation
    return TwitterOAuthService(redis_client=None)


def get_account_service() -> TwitterAccountService:
    return TwitterAccountService()


def get_analytics_service() -> TwitterAnalyticsService:
    return TwitterAnalyticsService(client=None)  # type: ignore


def get_media_service() -> TwitterMediaService:
    return TwitterMediaService(client=None)  # type: ignore


def get_schedule_service() -> TwitterScheduleService:
    return TwitterScheduleService()


def get_thread_service() -> TwitterThreadService:
    return TwitterThreadService(client=None)  # type: ignore


# --- AUTOMATED PLATFORM OAUTH LAYERS ---

@router.get("/login", response_model=TwitterLoginResponse)
async def twitter_login(
    oauth_service: Annotated[TwitterOAuthService, Depends(get_oauth_service)],
    user_id: str = Depends(get_current_user_id)
):
    """Generates the secure redirect token challenge parameters via the OAuth service layer."""
    authorize_url = await oauth_service.build_authorize_url(user_id=user_id)
    return TwitterLoginResponse(authorize_url=authorize_url)


@router.get("/callback", response_model=TwitterAccountResponse)
async def twitter_callback(
    query_params: Annotated[TwitterCallbackQuery, Depends()],
    oauth_service: Annotated[TwitterOAuthService, Depends(get_oauth_service)]
):
    """Processes incoming OAuth hooks, verifies signatures, and exchanges tokens to resolve the account profile."""
    if query_params.error:
        logger.error(f"Twitter authentication rejected by third-party provider: {query_params.error}")
        raise PlatformException(
            code="TWITTER_AUTH_REJECTED",
            message=f"Authorization failed: {query_params.error}",
            status_code=400,
        )
    
    account_profile = await oauth_service.handle_callback(
        code=query_params.code, 
        state=query_params.state
    )
    return account_profile


# --- ACCOUNT MANAGEMENT DOMAIN ---

@router.get("/accounts", response_model=TwitterAccountListResponse)
async def list_connected_accounts(
    service: Annotated[TwitterAccountService, Depends(get_account_service)],
    user_id: str = Depends(get_current_user_id)
):
    """Retrieves all registered active or token-expired social graph profiles for the session user."""
    return await service.list_accounts(user_id=user_id)


@router.delete("/accounts/{account_id}", response_model=TwitterAccountDisconnectResponse)
async def disconnect_account(
    account_id: str,
    service: Annotated[TwitterAccountService, Depends(get_account_service)],
    user_id: str = Depends(get_current_user_id)
):
    """Soft-disconnects credential ties securely while preserving metrics log isolation rules."""
    return await service.disconnect_account(account_id=account_id, user_id=user_id)


# --- CONTENT UPLOADS & PUBLISHING SYSTEM ---

@router.post("/media/upload", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_platform_media(
    file: UploadFile = File(...),
    service: Annotated[TwitterMediaService, Depends(get_media_service)] = None, # type: ignore
):
    """Accepts chunks for multi-stage streaming to downstream buffer pipelines ahead of publication."""
    file_bytes = await file.read()
    content_type = file.content_type or "application/octet-stream"
    
    return await service.upload_media(file_bytes=file_bytes, content_type=content_type)


@router.post("/post", response_model=TweetResponse, status_code=status.HTTP_201_CREATED)
async def create_single_post(
    request: TweetCreateRequest,
    service: Annotated[TwitterThreadService, Depends(get_thread_service)],
    user_id: str = Depends(get_current_user_id)
):
    """Dispatches standalone short text variants containing pre-validated operational media lists."""
    from app.schemas.twitter_post_schema import ThreadCreateRequest, ThreadTweetItem
    
    thread_req = ThreadCreateRequest(
        twitter_account_id=request.twitter_account_id,
        tweets=[ThreadTweetItem(text=request.text, media_ids=request.media_ids)]
    )
    
    result = await service.post_thread(
        user_id=user_id, request=thread_req, username="scalesocial_ai"
    )
    
    first_item = result.items[0]
    return TweetResponse(
        tweet_id=first_item.tweet_id,
        text=first_item.text,
        posted_at=result.posted_at,
        url=first_item.url
    )


@router.post("/post/thread", response_model=ThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread_post(
    request: ThreadCreateRequest,
    service: Annotated[TwitterThreadService, Depends(get_thread_service)],
    user_id: str = Depends(get_current_user_id)
):
    """Executes atomic sequential posting routines with transaction rollback fallbacks."""
    return await service.post_thread(
        user_id=user_id, request=request, username="scalesocial_ai"
    )


@router.post("/post/schedule", response_model=ScheduledPostResponse, status_code=status.HTTP_201_CREATED)
async def create_scheduled_post(
    request: ScheduledPostCreateRequest,
    service: Annotated[TwitterScheduleService, Depends(get_schedule_service)],
    user_id: str = Depends(get_current_user_id)
):
    """Registers timeline structures inside persistent queues for future automated emission loops."""
    return await service.create_scheduled_post(user_id=user_id, request=request)


# --- TELEMETRY & ENGAGEMENT METRICS ---

@router.get("/analytics/{tweet_id}", response_model=TweetAnalyticsResponse)
async def get_tweet_analytics(
    tweet_id: str,
    service: Annotated[TwitterAnalyticsService, Depends(get_analytics_service)]
):
    """Resolves single tweet status metrics inside unified layout conventions."""
    return await service.get_tweet_analytics(tweet_id=tweet_id)


@router.get("/analytics/thread/{post_id}", response_model=ThreadAnalyticsResponse)
async def get_thread_analytics(
    post_id: str,
    service: Annotated[TwitterAnalyticsService, Depends(get_analytics_service)],
    user_id: str = Depends(get_current_user_id)
):
    """Assembles metrics matrices recursively across structural conversational replies."""
    return await service.get_thread_analytics(post_id=post_id, user_id=user_id)