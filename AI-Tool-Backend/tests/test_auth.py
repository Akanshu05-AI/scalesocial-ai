# tests/test_auth.py
from fastapi import status

def test_user_settings_route_guards_against_missing_token(client):
    """
    GIVEN the user management platform infrastructure
    WHEN a request hits a protected domain route without a Bearer authentication token
    THEN the app's error envelope should report 401 Unauthorized
    """
    response = client.get("/api/v1/users/me/settings")

    # get_current_user (app/api/deps.py) raises 401, not HTTPBearer's raw
    # 403 default -- correct per HTTP semantics (401 = not authenticated,
    # 403 = authenticated but forbidden).
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Every error response goes through the app's envelope (rules.md #4) --
    # this used to fail because plain HTTPException bypassed it entirely.
    json_data = response.json()
    assert json_data["success"] is False
    assert json_data["error"]["detail"] == "Not authenticated"
