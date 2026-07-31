# app/services/publisher.py
import httpx
import logging
import asyncio

from app.core.config import settings

logger = logging.getLogger(__name__)

async def create_media_container(ig_user_id: str, access_token: str, media_url: str, media_type: str, caption: str) -> str:
    """Step 1: Create the media container at Meta Graph API."""
    url = f"{settings.GRAPH_API_BASE_URL}/{ig_user_id}/media"
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
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, params=params, timeout=30.0)
        response.raise_for_status()
        return response.json()["id"]

async def wait_for_video_processing(creation_id: str, access_token: str, max_attempts: int = 20) -> None:
    """Step 2: Poll container encoding status every 15 seconds until FINISHED."""
    url = f"{settings.GRAPH_API_BASE_URL}/{creation_id}"
    params = {
        "fields": "status_code",
        "access_token": access_token
    }
    
    async with httpx.AsyncClient() as client:
        for attempt in range(max_attempts):
            response = await client.get(url, params=params, timeout=15.0)
            response.raise_for_status()
            status = response.json().get("status_code")
            
            if status == "FINISHED":
                logger.info(f"Video container {creation_id} processing FINISHED.")
                return
            elif status == "ERROR":
                raise Exception("Meta failed to process the video container.")
            
            logger.info(f"Video processing status: {status}. Attempt {attempt + 1}/{max_attempts}. Waiting 15s...")
            await asyncio.sleep(15)
            
        raise TimeoutError("Timeout while waiting for video processing to finish.")

async def publish_media_container(ig_user_id: str, creation_id: str, access_token: str) -> str:
    """Step 3: Publish the container live onto the user's Instagram profile."""
    url = f"{settings.GRAPH_API_BASE_URL}/{ig_user_id}/media_publish"
    params = {
        "creation_id": creation_id,
        "access_token": access_token
    }
    
    logger.info(f"Publishing container {creation_id}...")
    async with httpx.AsyncClient() as client:
        response = await client.post(url, params=params, timeout=30.0)
        response.raise_for_status()
        return response.json()["id"]

async def publish_instagram(ig_user_id: str, access_token: str, media_url: str, media_type: str, caption: str) -> dict:
    """
    Main orchestration function for publishing to Instagram.
    """
    # 1. Create Container
    creation_id = await create_media_container(ig_user_id, access_token, media_url, media_type, caption)
    
    # 2. Wait for Processing if it is a Video/Reel
    if media_type.upper() == "VIDEO":
        await wait_for_video_processing(creation_id, access_token)
        
    # 3. Publish Container Live
    platform_post_id = await publish_media_container(ig_user_id, creation_id, access_token)
    
    return {
        "status": "PUBLISHED",
        "platform_post_id": platform_post_id,
        "creation_id": creation_id
    }

async def publish_post(platform: str, draft: str, user_id: str) -> dict:
    """
    Existing placeholder method for handling non-Instagram social platforms.
    """
    logger.info(f"Fallback publishing handler hit for platform: {platform}")
    # Your pre-existing generic or platform-specific posting code runs here...
    return {"status": "SUCCESS", "platform": platform}