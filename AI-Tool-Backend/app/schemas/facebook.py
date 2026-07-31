from pydantic import BaseModel


class FacebookPostRequest(BaseModel):
    page_id: str
    message: str


class FacebookReplyRequest(BaseModel):
    comment_id: str
    message: str