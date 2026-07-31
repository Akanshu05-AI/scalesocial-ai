# app/api/v1/rbac.py
from fastapi import APIRouter, Depends, status, HTTPException
from uuid import UUID

from app.api.deps import get_current_user, get_rbac_repository, PermissionChecker
from app.core.security import JWTUserPayload
from app.repositories.rbac import RBACRepository
from app.schemas.common import APIResponse

router = APIRouter()

@router.post("/assign", response_model=APIResponse[bool], status_code=status.HTTP_200_OK)
def assign_user_role(
    user_id: UUID,
    role_id: UUID,
    current_user: JWTUserPayload = Depends(get_current_user),
    rbac_repo: RBACRepository = Depends(get_rbac_repository),
    _auth: bool = Depends(PermissionChecker("rbac:roles:assign"))
):
    """
    Administrative gateway to bind a security role configuration to a target user.
    Enforces strict access validation via the 'rbac:roles:assign' permission token.
    """
    if user_id == current_user.sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-privilege escalation is strictly forbidden by platform policies."
        )

    success = rbac_repo.assign_role_to_user(user_id, role_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Role assignment failed. Verify that the target user and role exist."
        )

    return APIResponse(
        success=True,
        message="Role successfully associated with target user framework.",
        data=True
    )

@router.delete("/revoke", response_model=APIResponse[bool], status_code=status.HTTP_200_OK)
def revoke_user_role(
    user_id: UUID,
    role_id: UUID,
    current_user: JWTUserPayload = Depends(get_current_user),
    rbac_repo: RBACRepository = Depends(get_rbac_repository),
    _auth: bool = Depends(PermissionChecker("rbac:roles:revoke"))
):
    """
    Administrative gateway to revoke access privileges by removing a role from a user.
    Requires the 'rbac:roles:revoke' permission claim.
    """
    if user_id == current_user.sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-demotion is disabled to prevent accidental lockout anomalies."
        )

    success = rbac_repo.remove_role_from_user(user_id, role_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revocation targets mismatched. Association entry not found."
        )

    return APIResponse(
        success=True,
        message="Role access privileges successfully stripped from target user.",
        data=True
    )