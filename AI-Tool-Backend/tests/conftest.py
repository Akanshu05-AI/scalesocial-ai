# tests/conftest.py
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from uuid import uuid4
from unittest import mock  # Standard library import to fix the IDE warning

from app.main import app
from app.api.deps import get_supabase_client

# 1. MOCK LAYER FOR REDIS PIPELINE OPERATIONS (Upstash Non-blocking Limiter Mocks)
class MockRedisPipeline:
    async def zremrangebyscore(self, *args, **kwargs): return self
    async def zcard(self, *args, **kwargs): return self
    async def zadd(self, *args, **kwargs): return self
    async def expire(self, *args, **kwargs): return self
    async def execute(self):
        # returns [deleted_count, current_requests_count, added_count, expire_status]
        # Current active hits set to 1 ensures the 429 Too Many Requests rule never triggers
        return [0, 1, 1, True]
    async def __aenter__(self): return self
    async def __aexit__(self, exc_type, exc_val, exc_tb): pass

class MockRedisClient:
    def pipeline(self, *args, **kwargs):
        return MockRedisPipeline()

# 2. STRUCTURAL MOCK FOR SUPABASE POSTGREST REPOS
class MockSupabaseQuery:
    def select(self, *args, **kwargs): return self
    def update(self, *args, **kwargs): return self
    def insert(self, *args, **kwargs): return self
    def eq(self, *args, **kwargs): return self
    
    def execute(self):
        class PostgrestResponse:
            def __init__(self):
                self.data = [{
                    "id": str(uuid4()),
                    "user_id": "00000000-0000-0000-0000-000000000000",
                    "email": "test@scalesocial.ai",
                    "timezone": "Asia/Kolkata",
                    "language": "en",
                    "notification_preferences": {"system_alerts": True},
                    "is_active": True,
                    "created_at": "2026-07-15T00:00:00Z"
                }]
        return PostgrestResponse()

class MockSupabaseClient:
    def table(self, table_name: str):
        return MockSupabaseQuery()

# 3. INTERCEPT GLOBAL NETWORKING HOOKS
@pytest.fixture(scope="module", autouse=True)
def mock_redis_network_layer():
    """Intercepts outbound network initialization to Upstash Redis during engine tests."""
    with mock.patch("redis.asyncio.from_url") as mock_url:
        mock_url.return_value = MockRedisClient()
        yield

@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    """Provides a decoupled FastAPI TestClient wrapper with overridden DB dependencies."""
    app.dependency_overrides[get_supabase_client] = lambda: MockSupabaseClient()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()