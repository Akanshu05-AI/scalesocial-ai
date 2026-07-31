# app/services/user.py
from uuid import UUID
from fastapi import status

from app.repositories.user import UserRepository
from app.schemas.user import UserSettingsUpdate, UserSettingsResponse
from app.core.exceptions import PlatformException

class UserService:
    def __init__(self, user_repo: UserRepository):
        """
        Initializes the User Management Engine Domain Logic Layer.
        """
        self.user_repo = user_repo

    def get_user_settings(self, user_id: UUID) -> UserSettingsResponse:
        """
        Retrieves structural settings details or handles missing record recovery logic.
        """
        settings_data = self.user_repo.get_settings(user_id)
        if not settings_data:
            raise PlatformException(
                message="User settings records could not be resolved for this identity framework.",
                code="SETTINGS_NOT_FOUND",
                status_code=status.HTTP_404_NOT_FOUND
            )
        return settings_data

    def update_user_settings(self, user_id: UUID, update_payload: UserSettingsUpdate) -> UserSettingsResponse:
        """
        Validates delta variables and processes atomic database updates.
        """
        # Convert Pydantic payload tracking model elements explicitly dropping unset fields
        data_to_patch = update_payload.model_dump(exclude_unset=True)
        
        if not data_to_patch:
            # Short-circuit out if no explicit configuration adjustment parameters are provided
            return self.get_user_settings(user_id)
            
        return self.user_repo.update_settings(user_id, data_to_patch)