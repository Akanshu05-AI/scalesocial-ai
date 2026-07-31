# app/repositories/audit.py
from supabase import Client
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class AuditLogCreate(BaseModel):
    """
    Pydantic schema definition matching the audit_logs structural SQL layout metrics.
    """
    user_id: Optional[UUID] = None
    action: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    payload: Optional[dict] = None

class AuditRepository:
    def __init__(self, client: Client):
        """
        Initializes the analytical state tracker layer bypassing default RLS constraints.
        """
        self.client = client

    def write_log(self, log_entry: AuditLogCreate) -> None:
        """
        Performs an asynchronous thread insertion directly inside public.audit_logs.
        """
        raw_data = log_entry.model_dump()
        
        # Ensure UUID structure attributes safely map to standard text formats
        if raw_data["user_id"]:
            raw_data["user_id"] = str(raw_data["user_id"])
            
        self.client.table("audit_logs").insert(raw_data).execute()