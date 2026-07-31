from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None
    meta: Optional[dict[str, Any]] = None

class ErrorResponsePayload(BaseModel):
    code: str
    detail: str
    fields: Optional[dict[str, list[str]]] = None