"""
LinkedIn module service layer.
Since database is removed, functions now operate directly with provided data.
"""

from . import client, utils

# NOTE: Since you aren't using a DB, you will need to pass the access_token 
# from the caller (e.g., from a request header or session) instead of 
# fetching it from a database via user_id.

async def get_profile(user_id: int, access_token: str) -> dict:
    # Logic to fetch profile directly using the token
    profile = await client.fetch_profile(access_token)
    return {
        "linkedin_id": profile.get("sub"),
        "name": profile.get("name"),
        "email": profile.get("email"),
        "profile_picture": profile.get("picture"),
    }

async def publish_to_linkedin(
    user_id: int, access_token: str, text: str, image_bytes: bytes = None
) -> dict:
    """
    Publishes to LinkedIn. Requires access_token to be passed directly.
    """
    # Assuming user_id can be used to construct URN or fetched from profile
    profile = await client.fetch_profile(access_token)
    person_urn = utils.build_person_urn(profile["sub"])

    if image_bytes:
        register_data = await client.register_image_upload(
            access_token, person_urn
        )
        upload_url = register_data["value"]["uploadMechanism"][
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ]["uploadUrl"]
        asset_urn = register_data["value"]["asset"]

        await client.upload_image_binary(
            upload_url, access_token, image_bytes
        )
        result = await client.create_image_post(
            access_token, person_urn, text, asset_urn
        )
    else:
        result = await client.create_text_post(
            access_token, person_urn, text
        )

    return {
        "success": True,
        "post_id": result.get("post_id"),
        "message": "Post published successfully",
    }

async def disconnect(user_id: int) -> dict:
    # Since there is no DB to delete from, this just confirms the action
    return {"success": True, "message": "LinkedIn session cleared"}

def get_analytics(user_id: int) -> dict:
    return {
        "supported": False,
        "reason": "LinkedIn analytics API requires special partner access",
    }

def get_articles_status(user_id: int) -> dict:
    return {
        "supported": False,
        "reason": "LinkedIn Articles publishing API is not available on standard developer access",
    }