# tests/test_bugfixes.py
"""
Regression tests for bugs found and fixed during the production-readiness
audit. Each test is named after the bug it guards against so a future
regression fails loudly and points straight at the relevant history.
"""
import inspect
from unittest import mock

import pytest


def test_rbac_schemas_import_without_error():
    """
    app/schemas/rbac.py used to reference BaseModel/UUID/Optional without
    importing any of them -- crashed with NameError the instant the module
    was imported. Guards against that regressing.
    """
    from app.schemas.rbac import RoleResponse, PermissionResponse
    from uuid import uuid4

    role = RoleResponse(id=uuid4(), name="admin", description="Full access")
    assert role.name == "admin"

    perm = PermissionResponse(id=uuid4(), code="posts:create", description=None)
    assert perm.code == "posts:create"


def test_scheduler_worker_calls_a_real_repository_method():
    """
    app/workers/scheduler.py's Instagram branch used to call
    repo.get_post_by_id(...), a method that never existed on
    SchedulerRepository -- hasattr() silently returned False every time,
    so Instagram scheduled posts always failed with a fake "missing
    credentials" error, no matter what was actually stored.
    """
    from app.repositories.scheduler import SchedulerRepository
    from app.workers import scheduler as scheduler_module

    # The method the worker calls must actually exist on the repository.
    source = inspect.getsource(scheduler_module.publish_post_task)
    assert "get_post_by_id" not in source, (
        "scheduler.py is calling a repository method that doesn't exist "
        "on SchedulerRepository again -- this makes every Instagram "
        "scheduled post fail permanently. See publisher.py bug history."
    )
    assert "get_scheduled_post" in source
    assert hasattr(SchedulerRepository, "get_scheduled_post")


@pytest.mark.asyncio
async def test_publisher_polls_the_real_graph_api_status_field():
    """
    publisher.py's wait_for_video_processing() used to request/read
    'status_statusCode' -- not a real Meta Graph API field (the real one
    is 'status_code') -- so it could never detect a finished video and
    always timed out after 5 minutes, even on a successful upload.
    """
    from app.services import publisher

    calls = []

    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {"status_code": "FINISHED"}

    class FakeAsyncClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            pass

        async def get(self, url, params=None, timeout=None):
            calls.append(params)
            return FakeResponse()

    with mock.patch("httpx.AsyncClient", FakeAsyncClient):
        # Should return immediately on the first poll since status is
        # FINISHED -- if this hangs or raises TimeoutError, the field name
        # regressed.
        await publisher.wait_for_video_processing("fake-creation-id", "fake-token")

    assert calls, "expected at least one poll request"
    assert calls[0]["fields"] == "status_code", (
        "wait_for_video_processing is requesting the wrong Graph API field "
        "again -- 'status_statusCode' isn't real, Meta's field is "
        "'status_code'."
    )


def test_publisher_uses_configured_graph_api_version_not_hardcoded():
    """
    publisher.py used to hardcode GRAPH_API_VERSION = "v19.0" and a
    separate BASE_URL constant, completely ignoring settings.GRAPH_API_VERSION
    -- changing the version in .env had zero effect. Now it should build
    URLs from settings.GRAPH_API_BASE_URL.
    """
    import app.services.publisher as publisher_module

    source = inspect.getsource(publisher_module)
    assert "v19.0" not in source
    assert "GRAPH_API_BASE_URL" in source


def test_ai_service_uses_configured_model_not_hardcoded():
    """
    AIService used to hardcode self.model_name = "gemini-1.5-flash",
    ignoring settings.GEMINI_MODEL entirely -- changing GEMINI_MODEL in
    .env had no effect on which model actually got called.
    """
    from app.core.config import settings
    from app.repositories.ai import AIRepository
    from app.services.ai import AIService

    fake_repo = mock.MagicMock(spec=AIRepository)
    service = AIService(fake_repo)
    assert service.model_name == settings.GEMINI_MODEL


def test_gemini_client_and_prompts_modules_were_removed():
    """
    app/services/gemini_client.py and prompts.py were dead code left over
    from an earlier iteration -- unused anywhere in the app, and broken
    (imported `google.generativeai`, an SDK not in requirements.txt; the
    app actually uses `google-genai` via app/services/ai.py). Guards
    against them quietly reappearing and causing import confusion.
    """
    import importlib

    for mod in ("app.services.gemini_client", "app.services.prompts"):
        with pytest.raises(ModuleNotFoundError):
            importlib.import_module(mod)


def test_jwt_verification_handles_asymmetric_es256_tokens():
    """
    verify_supabase_jwt() used to only support HS256 against a static
    shared secret -- but Supabase projects created on/after Oct 1, 2025
    default to asymmetric (ES256) signing, so every real token from a
    new project failed signature verification unconditionally, even with
    a perfectly correct SUPABASE_JWT_SECRET. Confirmed against a real
    token during manual testing (see AUDIT_REPORT.md). This test verifies
    the JWKS-based path with a mocked signing key.
    """
    import time
    from unittest import mock
    from uuid import UUID

    import jwt as pyjwt
    from cryptography.hazmat.primitives.asymmetric import ec

    import app.core.security as security_module

    private_key = ec.generate_private_key(ec.SECP256R1())
    payload = {
        "sub": "22222222-2222-2222-2222-222222222222",
        "email": "test@example.com",
        "role": "authenticated",
        "aud": "authenticated",
        "aal": "aal1",
        "exp": int(time.time()) + 3600,
    }
    token = pyjwt.encode(payload, private_key, algorithm="ES256", headers={"kid": "test-key"})

    fake_signing_key = mock.MagicMock()
    fake_signing_key.key = private_key.public_key()
    fake_jwks_client = mock.MagicMock()
    fake_jwks_client.get_signing_key_from_jwt.return_value = fake_signing_key

    with mock.patch.object(security_module, "_get_jwks_client", return_value=fake_jwks_client):
        result = security_module.verify_supabase_jwt(token)

    assert result.sub == UUID("22222222-2222-2222-2222-222222222222")
    assert result.email == "test@example.com"


def test_jwt_verification_falls_back_to_legacy_hs256():
    """
    Companion to the ES256 test above: projects still on the legacy
    shared-secret signing method (or where the JWKS endpoint is
    unreachable) must still verify correctly via the original HS256 +
    SUPABASE_JWT_SECRET path.
    """
    import time
    from uuid import UUID

    import jwt as pyjwt

    from app.core.config import settings
    from app.core.security import verify_supabase_jwt

    payload = {
        "sub": "11111111-1111-1111-1111-111111111111",
        "email": "test@example.com",
        "role": "authenticated",
        "aud": "authenticated",
        "aal": "aal1",
        "exp": int(time.time()) + 3600,
    }
    # No mocking of the JWKS client here -- SUPABASE_URL in the test env
    # doesn't resolve, so this also exercises the connection-error ->
    # fallback path, not just the "no keys configured" case.
    token = pyjwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    result = verify_supabase_jwt(token)

    assert result.sub == UUID("11111111-1111-1111-1111-111111111111")
