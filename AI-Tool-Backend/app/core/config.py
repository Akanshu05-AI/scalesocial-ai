import os
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Core Application Settings
    PROJECT_NAME: str = "ScaleSocial Engine"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    API_V1_STR: str = "/api/v1"

    # Supabase Secrets Engine
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    ALGORITHM: str = "HS256"
    
    # Database Layer Connection Matrix
    DATABASE_URL: str
    
    # Upstash Distributed Key-Value Core / Local Redis Cache Mesh
    UPSTASH_REDIS_URL: str

    # AI Agent Core Framework Configurations
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Facebook / Meta Integration Matrix
    FACEBOOK_APP_ID: str
    FACEBOOK_APP_SECRET: str
    FACEBOOK_REDIRECT_URI: str
    INSTAGRAM_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/instagram/auth/callback"
    GRAPH_API_VERSION: str = "v25.0"
    FRONTEND_URL: str = "http://localhost:3000"

    # Twitter Platform Integration Matrix
    TWITTER_CLIENT_ID: str
    TWITTER_CLIENT_SECRET: str
    TWITTER_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/twitter/callback"
    TWITTER_OAUTH_SCOPES: str = "tweet.read tweet.write users.read offline.access"
    TWITTER_AUTHORIZE_URL: str = "https://twitter.com/i/oauth2/authorize"

    # LinkedIn Platform Integration Matrix
    LINKEDIN_CLIENT_ID: str
    LINKEDIN_CLIENT_SECRET: str
    LINKEDIN_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/linkedin/callback"

    @property
    def GRAPH_API_BASE_URL(self) -> str:
        return f"https://graph.facebook.com/{self.GRAPH_API_VERSION}"

    # Explicitly calculate absolute path anchor targeting the active directory structure
    # This maps to scalesocial-ai/backend/.env securely across all sub-processes
    model_config = SettingsConfigDict(
        env_file=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env")),
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()