# app/services/audit.py
from typing import Optional
from uuid import UUID
from app.repositories.audit import AuditRepository, AuditLogCreate

class AuditService:
    def __init__(self, audit_repo: AuditRepository):
        """
        Orchestration business validation layers tracking systemic system mutations.
        """
        self.audit_repo = audit_repo

    def track_action(
        self, 
        action: str, 
        user_id: Optional[UUID] = None, 
        ip_address: Optional[str] = None, 
        user_agent: Optional[str] = None, 
        payload: Optional[dict] = None
    ) -> None:
        """
        Encapsulates audit logging logic into a single method signature.
        """
        entry = AuditLogCreate(
            user_id=user_id,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent,
            payload=payload
        )
        self.audit_repo.write_log(entry)