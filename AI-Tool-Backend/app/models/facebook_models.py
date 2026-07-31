# app/models/facebook_models.py
from typing import List, Optional
from pydantic import BaseModel


class FacebookPostRequest(BaseModel):
    page_id: str
    page_access_token: str
    message: str


class FacebookImagePostRequest(BaseModel):
    page_id: str
    page_access_token: str
    image_url: str
    caption: Optional[str] = ""


class FacebookReplyRequest(BaseModel):
    comment_id: str
    page_access_token: str
    message: str


class FacebookTokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int


class FacebookCategory(BaseModel):
    id: str
    name: str


class FacebookPage(BaseModel):
    id: str
    name: str
    access_token: str
    category: Optional[str] = None
    category_list: List[FacebookCategory] = []
    tasks: List[str] = []


class FacebookPagesResponse(BaseModel):
    data: List[FacebookPage]


class FacebookComment(BaseModel):
    id: str
    message: str
    from_name: Optional[str] = None