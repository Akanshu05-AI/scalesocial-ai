from datetime import datetime, timezone
from urllib.parse import urlencode
import logging
import uuid

from app.core.config import settings
from app.schemas.twitter_account_schema import TwitterAccountResponse
from app.core.oauth_pkce import generate_csrf_state, generate_pkce_pair

logger = logging.getLogger("platform.twitter.oauth")
_STATE_KEY_PREFIX = "twitter:oauth:state:"


class TwitterOAuthService:
    def __init__(self, redis_client=None) -> None:
        # Accepting None keeps this decoupled during construction in deps
        self._redis = redis_client

    async def build_authorize_url(self, user_id: str) -> str:
        state = generate_csrf_state()
        code_verifier, code_challenge = generate_pkce_pair()

        # Redis fallback mapping if client hasn't been instantiated globally
        if self._redis:
            await self._redis.set_json(
                key=f"{_STATE_KEY_PREFIX}{state}",
                value={"user_id": user_id, "code_verifier": code_verifier},
                ttl_seconds=settings.OAUTH_STATE_TTL_SECONDS,
            )

        query_params = {
            "response_type": "code",
            "client_id": settings.TWITTER_CLIENT_ID,
            "redirect_uri": settings.TWITTER_REDIRECT_URI,
            "scope": settings.TWITTER_OAUTH_SCOPES,
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }
        
        authorize_url = f"{settings.TWITTER_AUTHORIZE_URL}?{urlencode(query_params)}"
        logger.info(f"Generated Twitter authorize URL for user_id={user_id}")
        return authorize_url

    async def handle_callback(self, *, code: str, state: str) -> TwitterAccountResponse:
        # STUB — see audit report. This does not call Twitter's token endpoint,
        # does not verify `state` against the PKCE value issued at
        # authorization time (CSRF protection), and always returns the same
        # fake account. Needs a real implementation before this can connect
        # actual Twitter accounts.
        token_response = {
            "access_token": "mock_access_token_XYZ",
            "expires_in": 7200,
            "refresh_token": "mock_refresh_token_ABC",
            "scope": "tweet.read tweet.write users.read offline.access"
        }
        
        # Simulating external hit if credentials are present, otherwise using fallback mock data
        profile = {
            "id": "123456789",
            "username": "scalesocial_ai",
            "name": "ScaleSocial AI Workspace",
            "profile_image_url": "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
        }

        generated_id = str(uuid.uuid4())
        
        return TwitterAccountResponse(
            id=generated_id,
            twitter_user_id=profile["id"],
            username=profile["username"],
            display_name=profile["name"],
            profile_image_url=profile.get("profile_image_url"),
            scope=token_response["scope"],
            is_active=True,
            connected_at=datetime.now(timezone.utc),
        )