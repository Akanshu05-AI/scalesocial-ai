from typing import Annotated
from fastapi import APIRouter, Depends, Query
from app.api.deps import build_twitter_client, get_current_user_id, get_token_service
from app.schemas.twitter_analytics import ThreadAnalyticsResponse, TweetAnalyticsResponse
from app.services.twitter_analytics_service import TwitterAnalyticsService
from app.services.twitter_token_service import TwitterTokenService

router = APIRouter(prefix="/twitter/analytics", tags=["Twitter - Analytics"])


@router.get(
    "/tweet/{tweet_id}",
    response_model=TweetAnalyticsResponse,
    summary="Get analytics for a single tweet",
)
async def get_tweet_analytics(
    tweet_id: str,
    twitter_account_id: Annotated[str, Query(..., description="Which connected account to read metrics through.")],
    user_id: Annotated[str, Depends(get_current_user_id)],
    token_service: Annotated[TwitterTokenService, Depends(get_token_service)],
) -> TweetAnalyticsResponse:
    client = await build_twitter_client(twitter_account_id, user_id, token_service)
    analytics_service = TwitterAnalyticsService(client)
    return await analytics_service.get_tweet_analytics(tweet_id)


@router.get(
    "/thread/{post_id}",
    response_model=ThreadAnalyticsResponse,
    summary="Get analytics for an entire thread",
)
async def get_thread_analytics(
    post_id: str,
    twitter_account_id: Annotated[str, Query(..., description="Which connected account to read metrics through.")],
    user_id: Annotated[str, Depends(get_current_user_id)],
    token_service: Annotated[TwitterTokenService, Depends(get_token_service)],
) -> ThreadAnalyticsResponse:
    client = await build_twitter_client(twitter_account_id, user_id, token_service)
    analytics_service = TwitterAnalyticsService(client)
    return await analytics_service.get_thread_analytics(post_id, user_id)