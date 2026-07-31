from typing import Annotated
from fastapi import APIRouter, Depends
from app.api.deps import get_account_service, get_current_user_id
from app.schemas.twitter_account import (
    TwitterAccountDisconnectResponse,
    TwitterAccountListResponse,
)
from app.services.twitter_account_service import TwitterAccountService

router = APIRouter(prefix="/twitter/accounts", tags=["Twitter - Accounts"])


@router.get(
    "",
    response_model=TwitterAccountListResponse,
    summary="List connected Twitter accounts",
)
async def list_twitter_accounts(
    user_id: Annotated[str, Depends(get_current_user_id)],
    account_service: Annotated[TwitterAccountService, Depends(get_account_service)],
) -> TwitterAccountListResponse:
    return await account_service.list_accounts(user_id)


@router.delete(
    "/{account_id}",
    response_model=TwitterAccountDisconnectResponse,
    summary="Disconnect a Twitter account",
)
async def disconnect_twitter_account(
    account_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    account_service: Annotated[TwitterAccountService, Depends(get_account_service)],
) -> TwitterAccountDisconnectResponse:
    return await account_service.disconnect_account(account_id, user_id)