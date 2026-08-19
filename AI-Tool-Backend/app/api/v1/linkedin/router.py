from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from app.core.config import settings 
from app.api.deps import get_current_user_id
from . import oauth, service
from .schemas import (
    LinkedInPostRequest,
    LinkedInProfileResponse,
    LinkedInPostResponse,
    LinkedInDisconnectResponse,
)
from .exceptions import (
    LinkedInAccountNotFoundError,
    LinkedInTokenExpiredError,
    LinkedInAPIError,
    LinkedInAuthError,
)

router = APIRouter(prefix="/linkedin", tags=["LinkedIn"])

@router.get("/connect", status_code=status.HTTP_200_OK)
def connect(user_id: str = Depends(get_current_user_id)):
    login_url = oauth.get_login_url(user_id)
    return {"url": login_url}

@router.get("/callback", status_code=status.HTTP_200_OK)
async def callback(code: str, state: str):
    user_id = state
    try:
        await oauth.handle_callback(user_id, code)
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/settings/connections?connected=linkedin")
    except LinkedInAuthError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/profile", response_model=LinkedInProfileResponse, status_code=status.HTTP_200_OK)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    try:
        return await service.get_profile(user_id)
    except LinkedInAccountNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LinkedInTokenExpiredError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/post", response_model=LinkedInPostResponse, status_code=status.HTTP_200_OK)
async def create_post(payload: LinkedInPostRequest, user_id: str = Depends(get_current_user_id)):
    try:
        return await service.publish_to_linkedin(user_id, payload.text)
    except LinkedInAccountNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LinkedInTokenExpiredError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except LinkedInAPIError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=str(e))

@router.post("/post-image", response_model=LinkedInPostResponse, status_code=status.HTTP_200_OK)
async def create_image_post(text: str = Form(...), image: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
    try:
        image_bytes = await image.read()
        return await service.publish_to_linkedin(user_id, text, image_bytes=image_bytes)
    except LinkedInAccountNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LinkedInTokenExpiredError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except LinkedInAPIError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=str(e))

@router.delete("/disconnect", response_model=LinkedInDisconnectResponse, status_code=status.HTTP_200_OK)
async def disconnect(user_id: str = Depends(get_current_user_id)):
    try:
        return await service.disconnect(user_id)
    except LinkedInAccountNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/analytics", status_code=status.HTTP_200_OK)
def get_analytics(user_id: str = Depends(get_current_user_id)):
    return service.get_analytics(user_id)

@router.get("/articles", status_code=status.HTTP_200_OK)
def get_articles(user_id: str = Depends(get_current_user_id)):
    return service.get_articles_status(user_id)