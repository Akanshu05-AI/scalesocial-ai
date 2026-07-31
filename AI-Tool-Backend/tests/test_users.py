# tests/test_users.py
def test_get_settings_unauthorized(client):
    response = client.get("/api/v1/users/me/settings")
    assert response.status_code == 401  # see test_auth.py for the full envelope assertion
    assert response.json()["success"] is False
