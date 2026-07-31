# app/services/facebook.py
from urllib.parse import urlencode
import requests
from app.core.config import settings

class FacebookService:

    def get_login_url(self) -> str:
        params = {
            "client_id": settings.FACEBOOK_APP_ID,
            "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
            "response_type": "code",
            "scope": ",".join([
                "public_profile",
                "pages_show_list",
                "pages_manage_posts",
                "pages_read_engagement",
                "pages_manage_engagement"
            ])
        }

        return (
            f"https://www.facebook.com/{settings.GRAPH_API_VERSION}/dialog/oauth?"
            + urlencode(params)
        )

    def exchange_code_for_token(self, code: str) -> dict:
        url = f"{settings.GRAPH_API_BASE_URL}/oauth/access_token"

        params = {
            "client_id": settings.FACEBOOK_APP_ID,
            "client_secret": settings.FACEBOOK_APP_SECRET,
            "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
            "code": code
        }

        response = requests.get(url, params=params)
        return response.json()

    def get_pages(self, access_token: str) -> dict:
        url = f"{settings.GRAPH_API_BASE_URL}/me/accounts"

        params = {
            "access_token": access_token
        }

        response = requests.get(url, params=params)
        return response.json()

    def create_post(self, page_id: str, page_access_token: str, message: str) -> dict:
        url = f"{settings.GRAPH_API_BASE_URL}/{page_id}/feed"

        data = {
            "message": message,
            "access_token": page_access_token
        }

        response = requests.post(url, data=data)
        return response.json()

    def get_comments(self, post_id: str, page_access_token: str) -> dict:
        url = f"{settings.GRAPH_API_BASE_URL}/{post_id}/comments"

        params = {
            "access_token": page_access_token
        }

        response = requests.get(url, params=params)
        return response.json()

    def reply_to_comment(self, comment_id: str, page_access_token: str, message: str) -> dict:
        url = f"{settings.GRAPH_API_BASE_URL}/{comment_id}/comments"

        data = {
            "message": message,
            "access_token": page_access_token
        }

        response = requests.post(url, data=data)
        return response.json()