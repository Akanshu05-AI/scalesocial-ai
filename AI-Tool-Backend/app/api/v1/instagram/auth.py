# app/api/v1/instagram/auth.py
from fastapi import APIRouter, Depends, Query, status
from app.services.instagram_auth import InstagramAuthService
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Instagram Auth"])

# Dependency injection for the service linking global configs
def get_auth_service() -> InstagramAuthService:
    return InstagramAuthService(
        app_id=settings.FACEBOOK_APP_ID,
        app_secret=settings.FACEBOOK_APP_SECRET,
        redirect_uri=settings.INSTAGRAM_REDIRECT_URI
    )

@router.get("/login-url", status_code=status.HTTP_200_OK)
def get_login_url(service: InstagramAuthService = Depends(get_auth_service)):
    """Generates the Meta Graph API OAuth dialog login link."""
    url = service.get_oauth_login_url()
    return {"url": url}

@router.get("/callback", status_code=status.HTTP_200_OK)
async def oauth_callback(
    user_id: str,
    code: str = Query(None),
    error: str = Query(None),
    error_reason: str = Query(None),
    error_description: str = Query(None),
    service: InstagramAuthService = Depends(get_auth_service)
):
    """Handles the Meta OAuth redirect handshake engine."""
    if error:
        return {
            "success": False,
            "error": error,
            "reason": error_reason,
            "description": error_description
        }
    
    # Trigger the token exchange pipeline
    result = await service.exchange_code_for_token(code=code, user_id=user_id)
    return result

@router.post("/quick-connect", status_code=status.HTTP_200_OK)
async def quick_connect(
    user_id: str,
    access_token: str = Query(...),
    service: InstagramAuthService = Depends(get_auth_service)
):
    """Developer Quick Connect bypassing the redirect UI flow."""
    result = await service.connect_with_access_token(user_access_token=access_token, user_id=user_id)
    return result