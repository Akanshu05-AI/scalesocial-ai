# app/schemas/user.py
from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserSettingsUpdate(BaseModel):
    """
    Schema tracking incoming delta updates for user-specific preferences.
    Ensures safe, partial structural updates (PATCH) without destructive overrides.
    """
    timezone: Optional[str] = Field(None, json_schema_extra={"example": "Asia/Kolkata"})
    language: Optional[str] = Field(None, max_length=10, json_schema_extra={"example": "en"})
    notification_preferences: Optional[dict[str, bool]] = Field(
        None, 
        json_schema_extra={"example": {"system_alerts": True, "post_failures": True}}
    )

class UserSettingsResponse(BaseModel):
    """
    Unified serialization target mapping public.user_settings records.
    """
    user_id: UUID
    timezone: str
    language: str
    notification_preferences: dict[str, bool]
    
    # Modern Pydantic V2 wrapper replacing legacy class Config
    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    """
    Core user identity profile representation data contract.
    Decoupled directly from Supabase core authentication metadata tables.
    """
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    # Modern Pydantic V2 wrapper replacing legacy class Config
    model_config = ConfigDict(from_attributes=True)