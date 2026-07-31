# app/repositories/rbac.py
from uuid import UUID
from supabase import Client
from typing import List

class RBACRepository:
    def __init__(self, client: Client):
        """
        Initializes the RBAC repository layer with a dedicated Supabase PostgREST client.
        Uses the service_role client to bypass RLS for authorization evaluations.
        """
        self.client = client

    def get_user_permissions(self, user_id: UUID) -> List[str]:
        """
        Retrieves a flat list of all unique permission codes assigned to a user 
        by joining user_roles -> roles -> role_permissions -> permissions.
        
        Returns:
            List[str]: A list of unique permission string keys (e.g., ['posts:create', 'user:settings:update'])
        """
        # Execute a deeply nested join query via Supabase PostgREST relationships syntax
        response = self.client.table("user_roles") \
            .select("roles(role_permissions(permissions(code)))") \
            .eq("user_id", str(user_id)) \
            .execute()
            
        permissions = set()
        
        # Safely parse the structural JSON tree returned by PostgREST
        if response.data:
            for role_envelope in response.data:
                role_node = role_envelope.get("roles")
                if not role_node:
                    continue
                    
                role_perms_list = role_node.get("role_permissions", [])
                for perm_envelope in role_perms_list:
                    perm_node = perm_envelope.get("permissions")
                    if perm_node and "code" in perm_node:
                        permissions.add(perm_node["code"])
                        
        return list(permissions)

    def assign_role_to_user(self, user_id: UUID, role_id: UUID) -> bool:
        """
        Binds a specific role identity to a user target.
        """
        response = self.client.table("user_roles").insert({
            "user_id": str(user_id),
            "role_id": str(role_id)
        }).execute()
        return bool(response.data)

    def remove_role_from_user(self, user_id: UUID, role_id: UUID) -> bool:
        """
        Revokes a specific role identity from a user target.
        """
        response = self.client.table("user_roles") \
            .delete() \
            .eq("user_id", str(user_id)) \
            .eq("role_id", str(role_id)) \
            .execute()
        return bool(response.data)