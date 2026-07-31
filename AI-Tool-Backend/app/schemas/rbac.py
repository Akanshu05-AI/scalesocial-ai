from typing import Optional
from uuid import UUID
from pydantic import BaseModel

class RoleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    
    class Config:
        from_attributes = True

class PermissionResponse(BaseModel):
    id: UUID
    code: str
    description: Optional[str]
    
    class Config:
        from_attributes = True