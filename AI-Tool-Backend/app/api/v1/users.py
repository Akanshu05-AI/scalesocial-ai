# app/api/v1/users.py
from fastapi import APIRouter, Depends, status
from app.api.deps import get_current_user, get_user_service, PermissionChecker
from app.core.security import JWTUserPayload
from app.services.user import UserService
from app.schemas.user import UserSettingsResponse, UserSettingsUpdate
from app.schemas.common import APIResponse

router = APIRouter()

@router.get("/me/settings", response_model=APIResponse[UserSettingsResponse], status_code=status.HTTP_200_OK)
def fetch_settings(
    current_user: JWTUserPayload = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """
    Identity profile configuration resolver dashboard route.
    Returns targeted timezone, localization parameters, and system notification rules.
    """
    data = user_service.get_user_settings(current_user.sub)
    return APIResponse(
        success=True,
        message="User localization parameters successfully loaded.",
        data=data
    )

@router.patch("/me/settings", response_model=APIResponse[UserSettingsResponse], status_code=status.HTTP_200_OK)
def update_settings(
    payload: UserSettingsUpdate,
    current_user: JWTUserPayload = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    _rbac: bool = Depends(PermissionChecker("user:settings:update"))
):
    """
    Atomic preferences updater interface.
    Guarded via strict RBAC evaluation checking for the 'user:settings:update' permission claim.
    """
    data = user_service.update_user_settings(current_user.sub, payload)
    return APIResponse(
        success=True,
        message="System preferences parameters successfully updated.",
        data=data
    )