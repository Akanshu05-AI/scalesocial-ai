# app/services/instagram_publishing.py
import httpx
import logging
import asyncio
from typing import Dict, Any
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)

class InstagramPublishingService:
    def __init__(self, graph_api_version: str = None):
        self.graph_api_version = graph_api_version or settings.GRAPH_API_VERSION
        self.base_url = "https://graph.facebook.com"

    async def create_media_container(
        self, 
        client: httpx.AsyncClient, 
        ig_user_id: str, 
        media_url: str, 
        media_type: str, 
        caption: str, 
        access_token: str
    ) -> str:
        """Step 1: Create the media container at Meta Graph API."""
        url = f"{self.base_url}/{self.graph_api_version}/{ig_user_id}/media"
        params = {
            "access_token": access_token,
            "caption": caption
        }
        
        if media_type.upper() == "IMAGE":
            params["image_url"] = media_url
        elif media_type.upper() == "VIDEO":
            params["media_type"] = "VIDEO"
            params["video_url"] = media_url

        logger.info(f"Creating Instagram media container for user {ig_user_id} (Type: {media_type})")
        
        response = await client.post(url, params=params, timeout=30.0)
        response.raise_for_status()
        return response.json()["id"]

    async def wait_for_video_processing(
        self, 
        client: httpx.AsyncClient, 
        creation_id: str, 
        access_token: str, 
        max_attempts: int = 20
    ) -> None:
        """Step 2: Poll container encoding status every 15 seconds until FINISHED."""
        url = f"{self.base_url}/{self.graph_api_version}/{creation_id}"
        params = {
            "fields": "status_code",
            "access_token": access_token
        }
        
        for attempt in range(max_attempts):
            response = await client.get(url, params=params, timeout=15.0)
            response.raise_for_status()
            status_code = response.json().get("status_code")
            
            if status_code == "FINISHED":
                logger.info(f"Video container {creation_id} processing FINISHED.")
                return
            elif status_code == "ERROR":
                raise Exception("Meta failed to process the video container.")
            
            logger.info(f"Video processing status: {status_code}. Attempt {attempt + 1}/{max_attempts}. Waiting 15s...")
            await asyncio.sleep(15)
            
        raise TimeoutError("Timeout while waiting for video processing to finish.")

    async def publish_media_container(
        self, 
        client: httpx.AsyncClient, 
        ig_user_id: str, 
        creation_id: str, 
        access_token: str
    ) -> str:
        """Step 3: Publish the container live onto the user's Instagram profile."""
        url = f"{self.base_url}/{self.graph_api_version}/{ig_user_id}/media_publish"
        params = {
            "creation_id": creation_id,
            "access_token": access_token
        }
        
        logger.info(f"Publishing container {creation_id} to feed...")
        response = await client.post(url, params=params, timeout=30.0)
        response.raise_for_status()
        return response.json()["id"]

    async def publish_to_instagram(
        self, 
        ig_user_id: str, 
        media_url: str, 
        media_type: str, 
        caption: str, 
        access_token: str
    ) -> Dict[str, Any]:
        """Orchestrates the full 3-step pipeline sequence for Instagram broadcasting."""
        async with httpx.AsyncClient() as client:
            try:
                # 1. Create Media Container
                creation_id = await self.create_media_container(
                    client, ig_user_id, media_url, media_type, caption, access_token
                )
                
                # 2. Wait for processing if the file asset is a Video/Reel
                if media_type.upper() == "VIDEO":
                    await self.wait_for_video_processing(client, creation_id, access_token)
                
                # 3. Publish container live to feed
                platform_post_id = await self.publish_media_container(
                    client, ig_user_id, creation_id, access_token
                )
                
                return {
                    "status": "PUBLISHED",
                    "platform_post_id": platform_post_id,
                    "creation_id": creation_id
                }
                
            except httpx.HTTPStatusError as e:
                logger.error(f"Meta Graph API publishing pipeline error: {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=e.response.json().get("error", {}).get("message", "Failed to publish post to Instagram.")
                )
            except Exception as e:
                logger.error(f"Unexpected error in publishing flow execution: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )