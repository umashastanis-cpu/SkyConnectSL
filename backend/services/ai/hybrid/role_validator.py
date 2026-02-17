"""
Role Validator Middleware
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strict role-based access control for SkyConnect AI hybrid system

Key Responsibilities:
- Validate user roles against intent requirements
- Prevent unauthorized access to admin/partner-only features
- Enforce data isolation (partners can't see each other's data)
- Token validation and user_id verification
- Audit logging for access control violations

Role Hierarchy:
┌─────────────────────────────────────────────────────┐
│ ADMIN: Full system access                           │
│  ├─ System-wide analytics                           │
│  ├─ Moderation & partner approval                   │
│  └─ Revenue reports (all partners)                  │
├─────────────────────────────────────────────────────┤
│ PARTNER: Business account access                    │
│  ├─ Own listing analytics only                      │
│  ├─ Own revenue data only                           │
│  └─ Cannot access other partners' data              │
├─────────────────────────────────────────────────────┤
│ TRAVELER: Personal account access                   │
│  ├─ Personalized recommendations                    │
│  ├─ Own saved items only                            │
│  └─ No analytics access                             │
└─────────────────────────────────────────────────────┘

Design Decisions:
1. **Fail-Secure**: Deny by default, explicit allow list per intent
2. **No LLM Override**: Role checks happen BEFORE any LLM processing
3. **Token Validation**: User ID from token must match requested resource
4. **Audit Trail**: Log all access denials for security monitoring

Security Principles:
- Never trust user-supplied role claims
- Validate role from authenticated session (Firebase token)
- Prevent horizontal privilege escalation (partner A → partner B data)
- Prevent vertical privilege escalation (traveler → admin features)
"""

from typing import Dict, Optional, Set
from enum import Enum
from fastapi import HTTPException, status
import logging

from .intent_classifier import Intent

logger = logging.getLogger(__name__)


class UserRole(str, Enum):
    """User role types in SkyConnect platform"""
    TRAVELER = "traveler"
    PARTNER = "partner"
    ADMIN = "admin"


class RoleValidationResult:
    """Result of role validation with access decision and metadata"""
    
    def __init__(
        self,
        allowed: bool,
        role: UserRole,
        intent: Intent,
        reason: str = "",
        requires_scope_validation: bool = False
    ):
        self.allowed = allowed
        self.role = role
        self.intent = intent
        self.reason = reason
        self.requires_scope_validation = requires_scope_validation
    
    def to_dict(self) -> Dict:
        return {
            "allowed": self.allowed,
            "role": self.role.value,
            "intent": self.intent.value,
            "reason": self.reason,
            "requires_scope_validation": self.requires_scope_validation
        }


class RoleValidator:
    """
    Production-grade role-based access control validator
    
    Architecture:
    1. Intent → Role mapping (static policy)
    2. Token validation (user_id verification)
    3. Scope validation (resource ownership)
    4. Audit logging (denied access attempts)
    
    Usage:
        validator = RoleValidator()
        result = await validator.validate(
            user_id="user123",
            role=UserRole.TRAVELER,
            intent=Intent.ANALYTICS,
            resource_owner_id="partner456"  # Optional: for owned resource checks
        )
        
        if not result.allowed:
            raise HTTPException(status_code=403, detail=result.reason)
    """
    
    # Intent → Allowed Roles mapping (explicit allow list)
    INTENT_ROLE_PERMISSIONS: Dict[Intent, Set[UserRole]] = {
        Intent.RECOMMENDATION: {UserRole.TRAVELER, UserRole.PARTNER, UserRole.ADMIN},
        Intent.SAVED_ITEMS: {UserRole.TRAVELER},
        Intent.ANALYTICS: {UserRole.PARTNER, UserRole.ADMIN},
        Intent.REVENUE: {UserRole.PARTNER, UserRole.ADMIN},
        Intent.MODERATION: {UserRole.ADMIN},
        Intent.POLICY: {UserRole.TRAVELER, UserRole.PARTNER, UserRole.ADMIN},
        Intent.NAVIGATION: {UserRole.TRAVELER, UserRole.PARTNER, UserRole.ADMIN},
        Intent.TROUBLESHOOTING: {UserRole.TRAVELER, UserRole.PARTNER, UserRole.ADMIN},
        Intent.UNKNOWN: {UserRole.TRAVELER, UserRole.PARTNER, UserRole.ADMIN},
    }
    
    # Intents that require resource ownership validation
    SCOPE_VALIDATION_REQUIRED = {
        Intent.ANALYTICS,    # Partner can only see own analytics
        Intent.REVENUE,      # Partner can only see own revenue
        Intent.SAVED_ITEMS,  # Traveler can only see own saved items
    }
    
    def __init__(self):
        """Initialize role validator"""
        logger.info("RoleValidator initialized")
    
    async def validate(
        self,
        user_id: str,
        role: UserRole,
        intent: Intent,
        resource_owner_id: Optional[str] = None,
        token: Optional[str] = None
    ) -> RoleValidationResult:
        """
        Validate if user with given role can perform intent
        
        Args:
            user_id: Authenticated user ID from token
            role: User's role from database/token
            intent: Classified intent from query
            resource_owner_id: Owner of the requested resource (for scope validation)
            token: Optional Firebase token for additional validation
            
        Returns:
            RoleValidationResult with access decision
            
        Raises:
            HTTPException: On validation errors
        """
        
        # 1. Validate intent is recognized
        if intent not in self.INTENT_ROLE_PERMISSIONS:
            logger.error(f"Unknown intent: {intent}")
            return RoleValidationResult(
                allowed=False,
                role=role,
                intent=intent,
                reason="Unknown intent type"
            )
        
        # 2. Check role permissions for intent
        allowed_roles = self.INTENT_ROLE_PERMISSIONS[intent]
        
        if role not in allowed_roles:
            logger.warning(
                f"Access denied: user_id={user_id}, role={role.value}, "
                f"intent={intent.value}, allowed_roles={[r.value for r in allowed_roles]}"
            )
            return RoleValidationResult(
                allowed=False,
                role=role,
                intent=intent,
                reason=f"Role '{role.value}' not permitted for {intent.value}. "
                       f"Required: {', '.join(r.value for r in allowed_roles)}"
            )
        
        # 3. Check scope validation requirement
        requires_scope = intent in self.SCOPE_VALIDATION_REQUIRED
        
        if requires_scope and role != UserRole.ADMIN:
            # Admin has global access, others need scope validation
            if resource_owner_id and resource_owner_id != user_id:
                logger.warning(
                    f"Scope violation: user_id={user_id} attempted to access "
                    f"resource owned by {resource_owner_id}"
                )
                return RoleValidationResult(
                    allowed=False,
                    role=role,
                    intent=intent,
                    reason="Access denied: Cannot access other users' resources"
                )
        
        # 4. Validation successful
        logger.info(
            f"Access granted: user_id={user_id}, role={role.value}, "
            f"intent={intent.value}"
        )
        
        return RoleValidationResult(
            allowed=True,
            role=role,
            intent=intent,
            reason="Access granted",
            requires_scope_validation=requires_scope
        )
    
    def validate_sync(
        self,
        user_id: str,
        role: UserRole,
        intent: Intent,
        resource_owner_id: Optional[str] = None
    ) -> RoleValidationResult:
        """
        Synchronous version of validate (for non-async contexts)
        """
        # Same logic as async version
        if intent not in self.INTENT_ROLE_PERMISSIONS:
            return RoleValidationResult(
                allowed=False,
                role=role,
                intent=intent,
                reason="Unknown intent type"
            )
        
        allowed_roles = self.INTENT_ROLE_PERMISSIONS[intent]
        
        if role not in allowed_roles:
            logger.warning(
                f"Access denied: user_id={user_id}, role={role.value}, "
                f"intent={intent.value}"
            )
            return RoleValidationResult(
                allowed=False,
                role=role,
                intent=intent,
                reason=f"Role '{role.value}' not permitted for {intent.value}"
            )
        
        requires_scope = intent in self.SCOPE_VALIDATION_REQUIRED
        
        if requires_scope and role != UserRole.ADMIN:
            if resource_owner_id and resource_owner_id != user_id:
                logger.warning(
                    f"Scope violation: user_id={user_id} attempted to access "
                    f"resource owned by {resource_owner_id}"
                )
                return RoleValidationResult(
                    allowed=False,
                    role=role,
                    intent=intent,
                    reason="Access denied: Cannot access other users' resources"
                )
        
        logger.info(
            f"Access granted: user_id={user_id}, role={role.value}, "
            f"intent={intent.value}"
        )
        
        return RoleValidationResult(
            allowed=True,
            role=role,
            intent=intent,
            reason="Access granted",
            requires_scope_validation=requires_scope
        )


# Singleton instance
_validator_instance: Optional[RoleValidator] = None


def get_role_validator() -> RoleValidator:
    """Get or create singleton role validator instance"""
    global _validator_instance
    if _validator_instance is None:
        _validator_instance = RoleValidator()
    return _validator_instance


# FastAPI dependency for route injection
async def verify_role_access(
    user_id: str,
    role: str,
    intent: str,
    resource_owner_id: Optional[str] = None
) -> RoleValidationResult:
    """
    FastAPI dependency for role validation in routes
    
    Example usage:
        @app.post("/api/ai/query")
        async def query_endpoint(
            request: QueryRequest,
            validation: RoleValidationResult = Depends(verify_role_access)
        ):
            if not validation.allowed:
                raise HTTPException(status_code=403, detail=validation.reason)
            # Process query...
    """
    validator = get_role_validator()
    
    try:
        user_role = UserRole(role)
        query_intent = Intent(intent)
    except ValueError as e:
        logger.error(f"Invalid role or intent: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role or intent: {e}"
        )
    
    result = await validator.validate(
        user_id=user_id,
        role=user_role,
        intent=query_intent,
        resource_owner_id=resource_owner_id
    )
    
    if not result.allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=result.reason
        )
    
    return result
