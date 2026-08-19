import os
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Core Application Settings
    PROJECT_NAME: str = "ScaleSocial Engine"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    API_V1_STR: str = "/api/v1"

    # Supabase Secrets Engine
    SUPABASE_URL: str = "https://mock.supabase.co"
    SUPABASE_ANON_KEY: str = "mock-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "mock-service-role-key"
    SUPABASE_JWT_SECRET: str = "mock-jwt-secret-at-least-32-bytes-long-123456"
    ALGORITHM: str = "HS256"
    
    # Database Layer Connection Matrix
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/postgres"
    
    # Upstash Distributed Key-Value Core / Local Redis Cache Mesh
    UPSTASH_REDIS_URL: str = "redis://localhost:6379"

    # AI Agent Core Framework Configurations
    GEMINI_API_KEY: str = "mock-gemini-api-key"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Facebook / Meta Integration Matrix
    FACEBOOK_APP_ID: str = "mock_facebook_app_id"
    FACEBOOK_APP_SECRET: str = "mock_facebook_app_secret"
    FACEBOOK_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/facebook/callback"
    INSTAGRAM_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/instagram/auth/callback"
    GRAPH_API_VERSION: str = "v25.0"
    FRONTEND_URL: str = "http://localhost:3000"

    # Twitter Platform Integration Matrix
    TWITTER_CLIENT_ID: str = "mock_twitter_client_id"
    TWITTER_CLIENT_SECRET: str = "mock_twitter_client_secret"
    TWITTER_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/twitter/callback"
    TWITTER_OAUTH_SCOPES: str = "tweet.read tweet.write users.read offline.access"
    TWITTER_AUTHORIZE_URL: str = "https://twitter.com/i/oauth2/authorize"

    # LinkedIn Platform Integration Matrix
    LINKEDIN_CLIENT_ID: str = "mock_linkedin_client_id"
    LINKEDIN_CLIENT_SECRET: str = "mock_linkedin_client_secret"
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