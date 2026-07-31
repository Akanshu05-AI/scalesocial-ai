# app/services/instagram_comments.py
import json
import logging
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, status
from app.exceptions.instagram import RateLimitException, InstagramApiException

logger = logging.getLogger(__name__)

class InstagramCommentsService:
    def __init__(self, graph_api_version: str = "v19.0"):
        self.graph_api_version = graph_api_version
        self.base_url = "https://graph.facebook.com"

    def _check_rate_limit(self, headers: httpx.Headers) -> None:
        """
        Parses Meta's 'x-business-use-case-usage' header.
        Proactively raises a RateLimitException if resource usage hits or exceeds 90%.
        """
        usage_header = headers.get("x-business-use-case-usage")
        if not usage_header:
            return

        try:
            usage_data = json.loads(usage_header)
            for app_id, limits in usage_data.items():
                for limit in limits:
                    max_usage = max(
                        limit.get("call_count", 0),
                        limit.get("total_time", 0),
                        limit.get("total_cputime", 0)
                    )
                    logger.debug(f"Current Instagram API Usage: {max_usage}%")
                    
                    if max_usage >= 90:
                        logger.warning(f"Proactive Rate Limit Warning! Resource threshold at {max_usage}%")
                        raise RateLimitException(
                            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail=f"Meta Graph API Rate Limit threshold reached: {max_usage}%"
                        )
        except json.JSONDecodeError:
            logger.error("Failed to parse Meta 'x-business-use-case-usage' JSON payload header.")
        except RateLimitException:
            raise
        except Exception as e:
            logger.error(f"Error handling rate limit evaluation: {str(e)}")

    async def fetch_comments(
        self, 
        media_id: str, 
        limit: int, 
        after: Optional[str], 
        page_access_token: str
    ) -> Dict[str, Any]:
        """Fetches threaded comments for an Instagram Media object with pagination support."""
        url = f"{self.base_url}/{self.graph_api_version}/{media_id}/comments"
        params = {
            "access_token": page_access_token,
            "fields": "id,text,timestamp,username,replies",
            "limit": limit
        }
        if after:
            params["after"] = after

        logger.info(f"Fetching comments for Instagram media node: {media_id}")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=15.0)
                self._check_rate_limit(response.headers)
                
                # If an error payload is bundled inside a non-200 state, catch it here
                if response.status_code != 200:
                    raise InstagramApiException(response.json())
                    
                response.raise_for_status()
                data = response.json()
                
                # Database sync logic is deferred here. Payloads return directly to execution layer.
                return {
                    "data": data.get("data", []),
                    "paging": data.get("paging", {})
                }
            except RateLimitException:
                raise
            except httpx.HTTPStatusError as e:
                logger.error(f"Meta Graph API comment fetch error: {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=e.response.json().get("error", {}).get("message", "Failed to retrieve comments.")
                )
            except Exception as e:
                logger.error(f"Unexpected exception down pipeline fetch routine: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to fetch comments from Instagram."
                )

    async def reply_to_comment(self, comment_id: str, message: str, page_access_token: str) -> str:
        """Publishes an automated comment reply thread response underneath a parent comment node."""
        url = f"{self.base_url}/{self.graph_api_version}/{comment_id}/replies"
        params = {
            "access_token": page_access_token,
            "message": message
        }

        logger.info(f"Publishing nested comment reply to target platform comment ID: {comment_id}")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, params=params, timeout=15.0)
                self._check_rate_limit(response.headers)
                
                if response.status_code != 200:
                    raise InstagramApiException(response.json())
                    
                response.raise_for_status()
                reply_id = response.json().get("id")
                
                # Database injection update layer is deferred here.
                return reply_id
            except RateLimitException:
                raise
            except httpx.HTTPStatusError as e:
                logger.error(f"Meta Graph API comment response posting error: {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=e.response.json().get("error", {}).get("message", "Failed to post comment reply.")
                )
            except Exception as e:
                logger.error(f"Unexpected exception down pipeline posting routine: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to post reply to Instagram."
                )