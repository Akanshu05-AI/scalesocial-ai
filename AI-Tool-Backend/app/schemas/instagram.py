# app/schemas/instagram.py
from enum import Enum
from typing import Optional
from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime

class MediaType(str, Enum):
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"

class CreatePostRequest(BaseModel):
    ig_user_id: str = Field(..., description="The Instagram Business Account ID")
    caption: Optional[str] = Field(None, description="The post caption or Reel description")
    media_url: HttpUrl = Field(..., description="The direct public URL of the image or video hosted asset")
    media_type: MediaType = Field(..., description="Must be either IMAGE or VIDEO")
    scheduled_at: Optional[datetime] = Field(None, description="Optional ISO 8601 timestamp for scheduling future posts")

    class Config:
        use_enum_values = True

class OAuthCallbackRequest(BaseModel):
    code: Optional[str] = Field(None, description="The temporary authorization code returned by Meta")
    error: Optional[str] = Field(None, description="Error code if the authorization failed")
    error_reason: Optional[str] = Field(None, description="The reason code for the authentication failure")
    error_description: Optional[str] = Field(None, description="Human-readable explanation of the error")

class ReplyCommentRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="The automated text content of the reply to publish")

class FetchCommentsRequest(BaseModel):
    limit: Optional[int] = Field(25, ge=1, le=100, description="Number of comment nodes to fetch per pagination batch")
    after: Optional[str] = Field(None, description="Cursor pointer token for fetching the next data page")

class WebhookVerificationRequest(BaseModel):
    hub_mode: str = Field(..., alias="hub.mode", description="The operational mode, typically 'subscribe'")
    hub_challenge: int = Field(..., alias="hub.challenge", description="The challenge token sent by Meta to echo back")
    hub_verify_token: str = Field(..., alias="hub.verify_token", description="The custom validation token configured on the app dashboard")

    class Config:
        allow_population_by_field_name = True