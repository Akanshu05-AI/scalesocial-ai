# app/api/v1/facebook.py
from fastapi import APIRouter, Query, status
from app.services.facebook import FacebookService
from app.models.facebook_models import FacebookPostRequest, FacebookReplyRequest

from fastapi.responses import RedirectResponse
from app.core.config import settings

router = APIRouter()
facebook = FacebookService()


@router.get("/login", status_code=status.HTTP_200_OK)
def facebook_login():
    """Generates the Facebook OAuth dialog login link and returns it as a JSON object."""
    url = facebook.get_login_url()
    return {"url": url}


@router.get("/callback", status_code=status.HTTP_200_OK)
def callback(code: str, redirect: bool = Query(default=False)):
    token_data = facebook.exchange_code_for_token(code)
    if redirect:
        access_token = token_data.get("access_token", "")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/settings/connections?connected=facebook&token={access_token}")
    return token_data


@router.get("/pages", status_code=status.HTTP_200_OK)
def pages(access_token: str = Query(...)):
    return facebook.get_pages(access_token)


@router.post("/post", status_code=status.HTTP_200_OK)
def create_post(request: FacebookPostRequest):
    return facebook.create_post(
        request.page_id,
        request.page_access_token,
        request.message
    )


@router.get("/comments/{post_id}", status_code=status.HTTP_200_OK)
def get_comments(post_id: str, page_access_token: str):
    return facebook.get_comments(post_id, page_access_token)


@router.post("/reply", status_code=status.HTTP_200_OK)
def reply(request: FacebookReplyRequest):
    return facebook.reply_to_comment(
        request.comment_id,
        request.page_access_token,
        request.message
    )