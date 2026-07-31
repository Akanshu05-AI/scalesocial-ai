# app/repositories/base.py
from typing import Generic, TypeVar, Type, Optional, List
from uuid import UUID
from supabase import Client
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

class BaseRepository(Generic[T]):
    def __init__(self, client: Client, table_name: str, model_type: Type[T]):
        """
        Abstract base data layout orchestration engine.
        Implements foundational data access capabilities using strict Pydantic parsing maps.
        """
        self.client = client
        self.table_name = table_name
        self.model_type = model_type

    def get_by_id(self, id: UUID) -> Optional[T]:
        """
        Fetches an entity by its primary UUID key value.
        """
        response = self.client.table(self.table_name).select("*").eq("id", str(id)).execute()
        if not response.data:
            return None
        return self.model_type.model_validate(response.data[0])

    def get_all(self, limit: int = 100, offset: int = 0) -> List[T]:
        """
        Retrieves a paginated list of entity instances.
        """
        response = self.client.table(self.table_name) \
            .select("*") \
            .range(offset, offset + limit - 1) \
            .execute()
        return [self.model_type.model_validate(item) for item in response.data]