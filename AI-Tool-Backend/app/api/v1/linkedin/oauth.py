"""
Ye file OAuth flow ko manage karti hai.
"""
from app.api.v1.linkedin import client

def get_login_url(user_id: int) -> str:
    return client.build_authorization_url(state=str(user_id))

async def handle_callback(user_id: int, code: str):
    """
    Authorization code aane ke baad token fetch karo.
    """
    token_data = await client.fetch_access_token(code)
    access_token = token_data["access_token"]
    
    # Since you aren't using a DB, you likely need a different way 
    # to cache/store these tokens temporarily if needed.
    return {"user_id": user_id, "token": access_token}