# app/repositories/ai.py
from typing import Optional, List, Dict, Any
from supabase import Client

class AIRepository:
    def __init__(self, client: Client):
        """
        Manages structural storage interactions for AI context models.
        Injects the core shared Supabase client handle.
        """
        self.client = client
        self.table_name = "brand_voices"

    def save_brand_voice(self, voice_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Upserts an isolated brand voice signature blueprint record to the cluster matrix.
        """
        result = self.client.table(self.table_name).upsert(voice_data).execute()
        return result.data[0] if result.data else voice_data

    def get_brand_voice(self, voice_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches an individual matching voice footprint parameters by unique primary identifier key.
        """
        result = self.client.table(self.table_name).select("*").eq("id", voice_id).limit(1).execute()
        return result.data[0] if result.data else None

    def list_brand_voices(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Gathers complete arrays of all registered profiles tracked by the owner's client ID.
        """
        result = self.client.table(self.table_name).select("*").eq("user_id", user_id).execute()
        return result.data if result.data else []