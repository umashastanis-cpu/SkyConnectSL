"""
Firebase Authentication Middleware
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verifies Firebase ID tokens for API authentication

Features:
- Token verification via Firebase Admin SDK
- User info extraction (uid, email, role)
- Role-based access control
- Token expiration handling
- Comprehensive error handling

Usage:
    from services.auth_middleware import get_current_user, require_role
    
    @app.get("/protected")
    async def protected_route(user: dict = Depends(get_current_user)):
        return {"user_id": user['user_id']}
    
    @app.get("/admin-only")
    async def admin_route(user: dict = Depends(require_role("admin"))):
        return {"message": "Admin access granted"}
"""

from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer()


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    Verify Firebase ID token and return decoded user info
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        
    Returns:
        dict: User information including:
            - user_id: Firebase UID
            - email: User email
            - role: User role (traveler/partner/admin)
            - partner_id: Partner ID (if applicable)
            - verified: Email verification status
    
    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        
        # Extract user information
        user_info = {
            'user_id': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'email_verified': decoded_token.get('email_verified', False),
            'name': decoded_token.get('name'),
            
            # Custom claims (set via Firebase Admin SDK)
            'role': decoded_token.get('role', 'traveler'),
            'partner_id': decoded_token.get('partner_id'),
            
            # Token metadata
            'auth_time': decoded_token.get('auth_time'),
            'exp': decoded_token.get('exp')
        }
        
        logger.info(
            f"Token verified successfully: user_id={user_info['user_id']}, "
            f"role={user_info['role']}, email={user_info['email']}"
        )
        
        return user_info
    
    except auth.ExpiredIdTokenError:
        logger.warning(f"Expired token attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    except auth.InvalidIdTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    except auth.RevokedIdTokenError:
        logger.warning("Revoked token attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    except Exception as e:
        logger.error(f"Token verification error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    FastAPI dependency to get current authenticated user
    
    Usage:
        @app.get("/me")
        async def get_me(user: dict = Depends(get_current_user)):
            return user
    """
    return await verify_firebase_token(credentials)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Optional[dict]:
    """
    Optional authentication - returns None if no token provided
    
    Usage:
        @app.get("/public-or-private")
        async def route(user: Optional[dict] = Depends(get_current_user_optional)):
            if user:
                return {"message": f"Hello {user['email']}"}
            return {"message": "Hello guest"}
    """
    if not credentials:
        return None
    
    try:
        return await verify_firebase_token(credentials)
    except HTTPException:
        return None


def require_role(*allowed_roles: str):
    """
    Dependency factory for role-based access control
    
    Args:
        allowed_roles: One or more allowed roles (traveler, partner, admin)
        
    Returns:
        Dependency function that checks user role
        
    Usage:
        @app.get("/partners-only")
        async def partners_route(
            user: dict = Depends(require_role("partner", "admin"))
        ):
            return {"message": "Partner access granted"}
    """
    async def role_checker(user: dict = Depends(get_current_user)) -> dict:
        user_role = user.get('role', 'traveler')
        
        if user_role not in allowed_roles:
            logger.warning(
                f"Access denied: user {user['user_id']} with role '{user_role}' "
                f"tried to access endpoint requiring {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        
        return user
    
    return role_checker


def require_verified_email():
    """
    Dependency to require email verification
    
    Usage:
        @app.post("/sensitive-action")
        async def sensitive_route(
            user: dict = Depends(require_verified_email())
        ):
            return {"message": "Action completed"}
    """
    async def email_checker(user: dict = Depends(get_current_user)) -> dict:
        if not user.get('email_verified', False):
            logger.warning(
                f"Unverified email access attempt: user {user['user_id']}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email verification required. Please verify your email."
            )
        
        return user
    
    return email_checker


def require_partner_id():
    """
    Dependency to ensure user has a partner_id
    
    Usage:
        @app.get("/partner-dashboard")
        async def partner_dashboard(
            user: dict = Depends(require_partner_id())
        ):
            return {"partner_id": user['partner_id']}
    """
    async def partner_checker(
        user: dict = Depends(require_role("partner", "admin"))
    ) -> dict:
        if not user.get('partner_id') and user.get('role') == 'partner':
            logger.warning(
                f"Partner without partner_id: user {user['user_id']}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Partner account not fully configured"
            )
        
        return user
    
    return partner_checker


# Convenience dependencies for common use cases
require_traveler = require_role("traveler")
require_partner = require_role("partner")
require_admin = require_role("admin")
require_partner_or_admin = require_role("partner", "admin")
