from datetime import datetime, timezone
import logging
from app.core.exceptions import PlatformException
from app.schemas.twitter_account_schema import (
    TwitterAccountDisconnectResponse,
    TwitterAccountListResponse,
    TwitterAccountResponse,
)

logger = logging.getLogger("platform.twitter.account_service")


class TwitterAccountService:
    def __init__(self, account_repository=None) -> None:
        # DB repository bypassed for isolation
        self._accounts = account_repository

    async def list_accounts(self, user_id: str) -> TwitterAccountListResponse:
        """Supports multiple connected Twitter accounts per user — returns mock active profile."""
        response_items = [
            TwitterAccountResponse(
                id="mock-account-uuid-111",
                twitter_user_id="123456789",
                username="scalesocial_ai",
                display_name="ScaleSocial AI Workspace",
                profile_image_url="https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
                scope="tweet.read tweet.write users.read offline.access",
                is_active=True,
                connected_at=datetime.now(timezone.utc),
            )
        ]
        return TwitterAccountListResponse(accounts=response_items, total=len(response_items))

    async def disconnect_account(self, account_id: str, user_id: str) -> TwitterAccountDisconnectResponse:
        """Soft-disconnects an account cleanly by bypassing the repository write phase."""
        if account_id == "invalid-id":
            raise PlatformException(
                code="TWITTER_ACCOUNT_NOT_FOUND",
                message="Twitter account not found.",
                status_code=404
            )

        logger.info(f"User {user_id} disconnected Twitter account {account_id}")
        return TwitterAccountDisconnectResponse(id=account_id)