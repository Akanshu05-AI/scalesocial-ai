# app/repositories/user.py
from uuid import UUID
from typing import Optional
from supabase import Client
from app.repositories.base import BaseRepository
from app.schemas.user import UserResponse, UserSettingsResponse

class UserRepository(BaseRepository[UserResponse]):
    def __init__(self, client: Client):
        """
        Initializes the User Data Access Layer.
        Inherits base operations and extends targeting logic for user preferences.
        """
        super().__init__(client, "users", UserResponse)

    def get_settings(self, user_id: UUID) -> Optional[UserSettingsResponse]:
        """
        Fetches the user setting metadata properties.
        """
        response = self.client.table("user_settings") \
            .select("*") \
            .eq("user_id", str(user_id)) \
            .execute()
            
        if not response.data:
            return None
        return UserSettingsResponse.model_validate(response.data[0])

    def update_settings(self, user_id: UUID, settings_data: dict) -> UserSettingsResponse:
        """
        Performs atomic patching updates on user settings attributes.
        """
        response = self.client.table("user_settings") \
            .update(settings_data) \
            .eq("user_id", str(user_id)) \
            .execute()
            
        return UserSettingsResponse.model_validate(response.data[0])