from fastapi import status

class PlatformException(Exception):
    """Base exception for all domain errors."""
    def __init__(self, message: str, code: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)

class AuthenticationError(PlatformException):
    def __init__(self, message: str = "Invalid credentials or expired token"):
        super().__init__(message, "AUTH_FAILURE", status.HTTP_401_UNAUTHORIZED)

class AuthorizationError(PlatformException):
    def __init__(self, message: str = "Insufficient permissions to execute action"):
        super().__init__(message, "FORBIDDEN_ACTION", status.HTTP_403_FORBIDDEN)

class ResourceNotFoundError(PlatformException):
    def __init__(self, resource: str, identifier: str):
        super().__init__(f"{resource} identified by {identifier} not found", "RESOURCE_NOT_FOUND", status.HTTP_404_NOT_FOUND)