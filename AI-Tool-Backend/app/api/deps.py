# app/api/deps.py
from typing import TYPE_CHECKING

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

from app.core.config import settings
from app.core.security import verify_supabase_jwt, JWTUserPayload
from app.repositories.user import UserRepository
from app.repositories.rbac import RBACRepository
from app.repositories.audit import AuditRepository
from app.repositories.ai import AIRepository
from app.repositories.scheduler import SchedulerRepository
from app.services.user import UserService
from app.services.audit import AuditService
from app.services.ai import AIService

if TYPE_CHECKING:
    from app.services.twitter_oauth_service import TwitterOAuthService

# Instantiates standard bearer scheme utility tracking authorization headers
security_scheme = HTTPBearer()

def get_supabase_client() -> Client:
    """
    Dependency factory providing a scoped connection to Supabase services.
    Uses service_role context globally to ensure proper RBAC capability processing.
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def get_current_user(credential: HTTPAuthorizationCredentials = Depends(security_scheme)) -> JWTUserPayload:
    """
    Frontline authentication gate extracting and decoding session JWT parameters.
    """
    return verify_supabase_jwt(credential.credentials)

def get_current_user_id(current_user: JWTUserPayload = Depends(get_current_user)) -> str:
    """
    Extracts the unique user identifier string from the validated JWT payload.
    """
    return current_user.sub

# --- REPOSITORY INJECTIONS ---

def get_user_repository(client: Client = Depends(get_supabase_client)) -> UserRepository:
    return UserRepository(client)

def get_rbac_repository(client: Client = Depends(get_supabase_client)) -> RBACRepository:
    return RBACRepository(client)

def get_audit_repository(client: Client = Depends(get_supabase_client)) -> AuditRepository:
    return AuditRepository(client)

def get_ai_repository(client: Client = Depends(get_supabase_client)) -> AIRepository:
    return AIRepository(client)

def get_scheduler_repository(client: Client = Depends(get_supabase_client)) -> SchedulerRepository:
    return SchedulerRepository(client)

# --- SERVICE INJECTIONS ---

def get_user_service(repo: UserRepository = Depends(get_user_repository)) -> UserService:
    return UserService(repo)

def get_audit_service(repo: AuditRepository = Depends(get_audit_repository)) -> AuditService:
    return AuditService(repo)

def get_ai_service(repo: AIRepository = Depends(get_ai_repository)) -> AIService:
    return AIService(repo)

def get_oauth_service() -> "TwitterOAuthService":
    """
    Dependency provider for the Twitter OAuth lifecycle operations.
    """
    from app.services.twitter_oauth_service import TwitterOAuthService
    return TwitterOAuthService(redis_client=None)

# --- DYNAMIC RBAC GUARD CLASS ---

class PermissionChecker:
    def __init__(self, required_permission: str):
        """
        Structural dependency checking permission arrays before executing routes.
        """
        self.required_permission = required_permission

    def __call__(
        self, 
        current_user: JWTUserPayload = Depends(get_current_user), 
        rbac_repo: RBACRepository = Depends(get_rbac_repository)
    ) -> bool:
        user_permissions = rbac_repo.get_user_permissions(current_user.sub)
        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Structural authorization requires claim: {self.required_permission}"
            )
        return True