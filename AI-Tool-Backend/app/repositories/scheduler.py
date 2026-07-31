# app/repositories/scheduler.py
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from supabase import Client

class SchedulerRepository:
    def __init__(self, client: Client):
        self.client = client
        self.table_name = "scheduled_posts"

    def create_scheduled_post(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        post_data = dict(post_data)
        post_data.setdefault("status", "scheduled")
        post_data.setdefault("attempts", 0)
        post_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = self.client.table(self.table_name).upsert(post_data).execute()
        return result.data[0] if result.data else post_data

    def update_status(self, post_id: str, status: str, attempts: Optional[int] = None, error: Optional[str] = None) -> None:
        updates = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
        if attempts is not None:
            updates["attempts"] = attempts
        if error is not None:
            updates["last_error"] = error
            
        self.client.table(self.table_name).update(updates).eq("id", post_id).execute()

    def get_scheduled_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        result = self.client.table(self.table_name).select("*").eq("id", post_id).limit(1).execute()
        return result.data[0] if result.data else None

    def list_scheduled_posts(self, user_id: str) -> List[Dict[str, Any]]:
        result = (
            self.client.table(self.table_name)
            .select("*")
            .eq("user_id", user_id)
            .order("scheduled_time")
            .execute()
        )
        return result.data if result.data else []