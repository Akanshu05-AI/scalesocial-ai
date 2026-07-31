# app/services/instagram_auth.py
import logging
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class InstagramAuthService:
    def __init__(
        self,
        app_id: Optional[str] = None,
        app_secret: Optional[str] = None,
        redirect_uri: Optional[str] = None,
        graph_api_version: str = "v19.0",
        config_id: Optional[str] = None
    ):
        self.graph_api_version = graph_api_version
        self.app_id = app_id
        self.app_secret = app_secret
        self.redirect_uri = redirect_uri
        self.config_id = config_id
        self.base_url = "https://graph.facebook.com"

    def get_oauth_login_url(self) -> str:
        """Constructs the URL to redirect the user to Meta for authentication."""
        if not self.app_id or not self.redirect_uri:
            raise ValueError("META_APP_ID and META_OAUTH_REDIRECT_URI must be configured.")

        if self.config_id:
            # Facebook Login for Business flow
            logger.info(f"Generating OAuth URL using Business config_id: {self.config_id}")
            return (
                f"https://www.facebook.com/{self.graph_api_version}/dialog/oauth?"
                f"client_id={self.app_id}&redirect_uri={self.redirect_uri}&"
                f"config_id={self.config_id}&response_type=code"
            )

        # Standard Facebook Login flow
        logger.info("Generating OAuth URL using standard scopes")
        scopes = [
            "instagram_basic",
            "instagram_content_publish",
            "pages_show_list",
            "pages_read_engagement",
        ]
        scope_str = ",".join(scopes)

        return (
            f"https://www.facebook.com/{self.graph_api_version}/dialog/oauth?"
            f"client_id={self.app_id}&redirect_uri={self.redirect_uri}&"
            f"scope={scope_str}&response_type=code"
        )

    async def exchange_code_for_token(self, code: str, user_id: str) -> Dict[str, Any]:
        """Exchanges authorization code for short-lived, long-lived, and page access tokens."""
        if not self.app_id or not self.app_secret or not self.redirect_uri:
            raise ValueError("Missing required app configuration for Meta OAuth exchange.")

        async with httpx.AsyncClient() as client:
            try:
                logger.info(f"Exchanging code for short-lived token for user {user_id}...")
                
                # 1. Get Short-Lived Token
                token_url = f"{self.base_url}/{self.graph_api_version}/oauth/access_token"
                short_lived_res = await client.get(
                    token_url,
                    params={
                        "client_id": self.app_id,
                        "redirect_uri": self.redirect_uri,
                        "client_secret": self.app_secret,
                        "code": code,
                    }
                )
                short_lived_res.raise_for_status()
                short_lived_token = short_lived_res.json().get("access_token")

                # 2. Exchange for Long-Lived Token
                logger.info("Exchanging short-lived token for long-lived token...")
                long_lived_res = await client.get(
                    token_url,
                    params={
                        "grant_type": "fb_exchange_token",
                        "client_id": self.app_id,
                        "client_secret": self.app_secret,
                        "fb_exchange_token": short_lived_token,
                    }
                )
                long_lived_res.raise_for_status()
                long_lived_token = long_lived_res.json().get("access_token")
                
                # 3. Process fields using token properties
                return await self._fetch_and_resolve_meta_accounts(client, long_lived_token, user_id)

            except httpx.HTTPStatusError as e:
                logger.error(f"Failed Meta OAuth exchange pipeline: {e.response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to link Instagram account: {e.response.json().get('error', {}).get('message', 'API Error')}"
                )
            except Exception as e:
                logger.error(f"Internal error during token exchange: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to link Instagram account: {str(e)}"
                )

    async def connect_with_access_token(self, user_access_token: str, user_id: str) -> Dict[str, Any]:
        """Accepts a raw User Access Token directly to look up and resolve metadata."""
        async with httpx.AsyncClient() as client:
            try:
                logger.info("[Quick Connect] Verifying user access token...")
                
                # 1. Verify token validity
                me_url = f"{self.base_url}/{self.graph_api_version}/me"
                me_res = await client.get(me_url, params={"fields": "id,name", "access_token": user_access_token})
                me_res.raise_for_status()
                logger.info(f"[Quick Connect] Token valid for user: {me_res.json().get('name')}")

                # 2. Extract and match Page accounts
                return await self._fetch_and_resolve_meta_accounts(client, user_access_token, user_id)

            except httpx.HTTPStatusError as e:
                logger.error(f"[Quick Connect] Meta API verification failed: {e.response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=e.response.json().get("error", {}).get("message", "Quick Connect Failed")
                )
            except Exception as e:
                logger.error(f"[Quick Connect] Unexpected resolution failure: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )

    async def _fetch_and_resolve_meta_accounts(self, client: httpx.AsyncClient, token: str, user_id: str) -> Dict[str, Any]:
        """Internal routine to navigate the Facebook Page -> Instagram Business Account connection layer."""
        
        # 1. Fetch Facebook Pages
        pages_url = f"{self.base_url}/{self.graph_api_version}/me/accounts"
        pages_res = await client.get(pages_url, params={"access_token": token})
        pages_res.raise_for_status()
        pages_data = pages_res.json().get("data", [])

        if not pages_data:
            raise ValueError("No Facebook Pages found. You must manage a Facebook Page linked to an Instagram Business account.")

        # Match the first page item layout for deployment mapping
        target_page = pages_data[0]
        page_access_token = target_page.get("access_token")
        facebook_page_id = target_page.get("id")
        logger.info(f"Targeting Facebook Page: {target_page.get('name')} ({facebook_page_id})")

        # 2. Fetch linked Instagram Business Account ID
        ig_lookup_url = f"{self.base_url}/{self.graph_api_version}/{facebook_page_id}"
        ig_res = await client.get(
            ig_lookup_url, 
            params={"fields": "instagram_business_account", "access_token": page_access_token}
        )
        ig_res.raise_for_status()
        ig_user_id = ig_res.json().get("instagram_business_account", {}).get("id")

        if not ig_user_id:
            raise ValueError("No linked Instagram Business/Creator account found for this Facebook Page.")

        # 3. Fetch Instagram Profile details
        profile_url = f"{self.base_url}/{self.graph_api_version}/{ig_user_id}"
        profile_res = await client.get(profile_url, params={"fields": "username", "access_token": page_access_token})
        profile_res.raise_for_status()
        username = profile_res.json().get("username", "instagram_user")

        logger.info(f"Successfully resolved integration: @{username} (IG ID: {ig_user_id})")

        # Database database operation deferred: returning payload layer directly
        return {
            "success": True,
            "message": "Instagram account successfully linked.",
            "user_id": user_id,
            "igUserId": ig_user_id,
            "facebookPageId": facebook_page_id,
            "username": username,
            "accessToken": page_access_token  # Long-lived Page token to be stored
        }