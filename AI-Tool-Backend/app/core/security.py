# app/core/security.py
import jwt
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings
from app.core.exceptions import AuthenticationError

class JWTUserPayload(BaseModel):
    """
    Structured representation of decoded Supabase JWT claims.
    Binds essential security identities to prevent payload tampering.
    """
    sub: UUID = Field(..., description="The unique identity token of the authenticated user.")
    email: str = Field(..., description="The primary verified email address string.")
    role: str = Field(..., description="The core auth role assertion claim (typically 'authenticated').")
    aal: Optional[str] = Field("aal1", description="Authenticator Assurance Level tracking Multi-Factor state.")

# Supabase projects created on/after Oct 1, 2025 default to asymmetric
# (ES256) JWT signing rather than the legacy shared-secret (HS256)
# approach -- verifying every token against a single SUPABASE_JWT_SECRET
# with HS256 only works for older projects still on the legacy method,
# and fails signature verification unconditionally otherwise (confirmed
# against a real token during testing -- see AUDIT_REPORT.md). PyJWKClient
# fetches + caches Supabase's public signing keys so ES256/RS256 tokens
# verify correctly; falls back to the legacy path if the project has no
# JWKS keys configured (Supabase's JWKS endpoint returns none in that
# case, per their own docs).
_jwks_client: Optional["jwt.PyJWKClient"] = None


def _get_jwks_client() -> "jwt.PyJWKClient":
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def verify_supabase_jwt(token: str) -> JWTUserPayload:
    """
    Decodes and structurally validates an incoming Supabase access token.
    Tries asymmetric verification via Supabase's JWKS endpoint first
    (the current default), falling back to the legacy shared JWT secret
    for projects that haven't migrated.

    Raises:
        AuthenticationError: If signature evaluation, expiration window, or payload mapping fails.
    """
    try:
        try:
            signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                audience="authenticated"
            )
        except jwt.PyJWKClientError:
            # No JWKS keys available for this project -- legacy HS256
            # shared-secret project. Fall back to the original approach.
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=[settings.ALGORITHM],
                audience="authenticated"
            )
        
        # Parse and type-validate decoded payload map into our clean data schema contract
        return JWTUserPayload(
            sub=UUID(payload.get("sub")),
            email=payload.get("email"),
            role=payload.get("role"),
            aal=payload.get("aal", "aal1")
        )
        
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("The session access token has expired. Request a refresh sequence.")
    except jwt.InvalidTokenError:
        raise AuthenticationError("The provided session cryptographic token signature is invalid.")
    except (ValidationError, ValueError, TypeError):
        raise AuthenticationError("The token claims matrix failed structured architecture mapping validations.")