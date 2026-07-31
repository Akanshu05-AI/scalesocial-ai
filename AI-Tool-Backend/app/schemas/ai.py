# app/schemas/ai.py
from typing import Literal, Optional
from pydantic import BaseModel, Field

Platform = Literal["linkedin", "x"]
Tone = Literal["professional", "casual", "bold", "storytelling"]
Length = Literal["short", "medium", "long"]

class BrandVoiceBase(BaseModel):
    name: str = Field(..., description="Label for this voice profile, e.g. 'Personal - LinkedIn'")
    description: str = Field(..., description="Free-text notes: industry, audience, values, phrases to use/avoid")
    sample_text: Optional[str] = Field(None, description="Optional writing sample to imitate")

class BrandVoiceCreate(BrandVoiceBase):
    pass

class BrandVoiceResponse(BrandVoiceBase):
    id: str
    user_id: str

class GenerateRequest(BaseModel):
    platform: Platform
    topic: str = Field(..., description="Topic, idea, or rough notes to turn into a post")
    tone: Tone = "professional"
    length: Length = "medium"
    brand_voice_id: Optional[str] = None
    include_hashtags: bool = True

class GenerateResponse(BaseModel):
    platform: Platform
    draft: str
    hashtags: list[str] = []
    is_thread: bool = False
    thread_parts: Optional[list[str]] = None

class RefineRequest(BaseModel):
    platform: Platform
    current_draft: str
    instruction: str = Field(..., description="e.g. 'make it shorter', 'add a hook', 'more casual'")
    brand_voice_id: Optional[str] = None

class RefineResponse(BaseModel):
    draft: str

class ArticleRequest(BaseModel):
    topic: str
    tone: Tone = "professional"
    brand_voice_id: Optional[str] = None
    target_sections: int = Field(4, ge=2, le=8)

class ArticleResponse(BaseModel):
    title: str
    sections: list[dict]  # [{"heading": str, "body": str}]
    conclusion: str
    hashtags: list[str] = []

class HashtagRequest(BaseModel):
    platform: Platform
    text: str
    count: int = 5

class HashtagResponse(BaseModel):
    hashtags: list[str]