# app/exceptions/instagram.py
from app.core.exceptions import PlatformException

class InstagramApiException(PlatformException):
    """Base exception for all Instagram API related communication failures."""
    def __init__(self, message: str = "Instagram API integration error occurred.", status_code: int = 400):
        super().__init__(message=message, status_code=status_code, code="INSTAGRAM_API_ERROR")

class RateLimitException(PlatformException):
    """Raised when Instagram's graph API tier limits are exceeded."""
    def __init__(self, message: str = "Instagram API rate limit exceeded. Please try again later.", status_code: int = 429):
        super().__init__(message=message, status_code=status_code, code="INSTAGRAM_RATE_LIMIT")