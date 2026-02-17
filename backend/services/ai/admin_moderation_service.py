"""
Admin Moderation Service
Pure rule-based moderation logic - NO LLM required
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from services.firestore_service import firestore_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AdminModerationService:
    """
    Deterministic moderation service
    
    Uses rule-based logic for:
    - Duplicate detection
    - Profile completeness scoring
    - Auto-approval/rejection decisions
    
    NO LLM - 100% transparent, explainable, fast, free
    """
    
    # Scoring weights for profile completeness
    REQUIRED_FIELDS_WEIGHT = 50  # 50% of score
    OPTIONAL_FIELDS_WEIGHT = 30  # 30% of score
    QUALITY_SIGNALS_WEIGHT = 20  # 20% of score
    
    # Decision thresholds
    AUTO_APPROVE_THRESHOLD = 80
    MANUAL_REVIEW_THRESHOLD = 50
    
    def __init__(self):
        pass
    
    async def moderate_partner_application(self, partner_id: str) -> Dict[str, Any]:
        """
        Moderate partner application using rule-based logic
        
        Decision Flow:
        1. Check for duplicate email/business
        2. Calculate profile completeness score
        3. Apply decision rules:
           - Score > 80% → AUTO_APPROVE
           - Score 50-80% → MANUAL_REVIEW
           - Score < 50% → AUTO_REJECT
        
        Args:
            partner_id: Partner application ID
            
        Returns:
            {
                "decision": "APPROVE" | "MANUAL_REVIEW" | "REJECT",
                "score": 0-100,
                "reasons": [list of reasons],
                "details": {...}
            }
        """
        
        try:
            # Fetch partner profile
            partner = await firestore_service.get_user_profile(partner_id, 'partner')
            
            if not partner:
                return {
                    "decision": "ERROR",
                    "score": 0,
                    "reasons": ["Partner profile not found"],
                    "success": False
                }
            
            # Step 1: Check for duplicates
            duplicate_check = await self._check_duplicates(partner)
            
            if duplicate_check["is_duplicate"]:
                return {
                    "decision": "REJECT",
                    "score": 0,
                    "reasons": [f"Duplicate detected: {duplicate_check['reason']}"],
                    "duplicate_details": duplicate_check,
                    "success": True
                }
            
            # Step 2: Calculate profile completeness score
            score_result = self._calculate_completeness_score(partner)
            
            # Step 3: Make decision based on score
            decision = self._make_decision(score_result["score"])
            
            return {
                "decision": decision,
                "score": score_result["score"],
                "reasons": score_result["reasons"],
                "details": score_result["details"],
                "partner_id": partner_id,
                "partner_name": partner.get("businessName", "Unknown"),
                "evaluated_at": datetime.utcnow().isoformat(),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"❌ Error moderating partner {partner_id}: {e}")
            return {
                "decision": "ERROR",
                "score": 0,
                "reasons": [f"Error: {str(e)}"],
                "success": False
            }
    
    async def _check_duplicates(self, partner: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check for duplicate partners
        
        Duplicate signals:
        - Same email address
        - Same business name (exact match)
        - Same phone number
        """
        
        email = partner.get("email", "").lower().strip()
        business_name = partner.get("businessName", "").lower().strip()
        phone = partner.get("phone", "").strip()
        
        # In production, query Firestore for existing partners
        # For MVP, we'll do a simple check
        
        # TODO: Implement actual duplicate checking against database
        # For now, return no duplicates
        
        return {
            "is_duplicate": False,
            "reason": None,
            "matched_partner_id": None
        }
    
    def _calculate_completeness_score(self, partner: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate profile completeness score (0-100)
        
        Scoring breakdown:
        
        Required Fields (50%):
        - businessName (15%)
        - email (15%)
        - phone (10%)
        - businessType (10%)
        
        Optional Fields (30%):
        - description (10%)
        - location (10%)
        - website (5%)
        - logo (5%)
        
        Quality Signals (20%):
        - Email verified (10%)
        - Phone verified (5%)
        - Has profile picture (5%)
        """
        
        score = 0
        reasons = []
        details = {}
        
        # --- Required Fields (50 points) ---
        required_score = 0
        
        # businessName (15 points)
        if partner.get("businessName"):
            required_score += 15
        else:
            reasons.append("Missing business name (-15)")
        
        # email (15 points)
        if partner.get("email"):
            required_score += 15
        else:
            reasons.append("Missing email (-15)")
        
        # phone (10 points)
        if partner.get("phone"):
            required_score += 10
        else:
            reasons.append("Missing phone number (-10)")
        
        # businessType (10 points)
        if partner.get("businessType"):
            required_score += 10
        else:
            reasons.append("Missing business type (-10)")
        
        details["required_fields_score"] = required_score
        score += required_score
        
        # --- Optional Fields (30 points) ---
        optional_score = 0
        
        # description (10 points)
        description = partner.get("description", "")
        if description and len(description) > 50:  # Meaningful description
            optional_score += 10
        elif description:
            optional_score += 5  # Partial credit
            reasons.append("Description too short (+5 instead of +10)")
        else:
            reasons.append("Missing description (-10)")
        
        # location (10 points)
        if partner.get("location"):
            optional_score += 10
        else:
            reasons.append("Missing location (-10)")
        
        # website (5 points)
        if partner.get("website"):
            optional_score += 5
        
        # logo (5 points)
        if partner.get("logo") or partner.get("logoUrl"):
            optional_score += 5
        
        details["optional_fields_score"] = optional_score
        score += optional_score
        
        # --- Quality Signals (20 points) ---
        quality_score = 0
        
        # Email verified (10 points)
        if partner.get("emailVerified") is True:
            quality_score += 10
        else:
            reasons.append("Email not verified (-10)")
        
        # Phone verified (5 points)
        if partner.get("phoneVerified") is True:
            quality_score += 5
        else:
            reasons.append("Phone not verified (-5)")
        
        # Profile picture (5 points)
        if partner.get("profilePicture") or partner.get("photoURL"):
            quality_score += 5
        
        details["quality_signals_score"] = quality_score
        score += quality_score
        
        # Final score
        details["total_score"] = score
        details["max_score"] = 100
        details["percentage"] = f"{score}%"
        
        return {
            "score": score,
            "reasons": reasons,
            "details": details
        }
    
    def _make_decision(self, score: int) -> str:
        """
        Make moderation decision based on score
        
        Rules:
        - Score >= 80: AUTO_APPROVE
        - Score 50-79: MANUAL_REVIEW
        - Score < 50: AUTO_REJECT
        """
        
        if score >= self.AUTO_APPROVE_THRESHOLD:
            return "APPROVE"
        elif score >= self.MANUAL_REVIEW_THRESHOLD:
            return "MANUAL_REVIEW"
        else:
            return "REJECT"
    
    async def moderate_listing(self, listing_id: str) -> Dict[str, Any]:
        """
        Moderate listing using rule-based checks
        
        Checks:
        - All required fields present
        - Description length (min 50 chars)
        - Price is valid (> 0)
        - Has at least one image
        - Category is valid
        """
        
        try:
            listing = await firestore_service.get_listing_by_id(listing_id)
            
            if not listing:
                return {
                    "decision": "ERROR",
                    "reasons": ["Listing not found"],
                    "success": False
                }
            
            score = 0
            max_score = 100
            issues = []
            
            # Title (20 points)
            if listing.get("title") and len(listing.get("title", "")) >= 10:
                score += 20
            else:
                issues.append("Title too short or missing")
            
            # Description (20 points)
            if listing.get("description") and len(listing.get("description", "")) >= 50:
                score += 20
            else:
                issues.append("Description too short or missing (min 50 chars)")
            
            # Price (15 points)
            price = listing.get("price", 0)
            if isinstance(price, (int, float)) and price > 0:
                score += 15
            else:
                issues.append("Invalid or missing price")
            
            # Category (15 points)
            valid_categories = ["adventure", "cultural", "wellness", "food", "nature", "accommodation"]
            if listing.get("category") in valid_categories:
                score += 15
            else:
                issues.append(f"Invalid category (must be one of: {', '.join(valid_categories)})")
            
            # Location (15 points)
            if listing.get("location"):
                score += 15
            else:
                issues.append("Missing location")
            
            # Images (15 points)
            images = listing.get("images", [])
            if isinstance(images, list) and len(images) > 0:
                score += 15
            else:
                issues.append("No images provided")
            
            # Make decision
            if score >= 80:
                decision = "APPROVE"
            elif score >= 50:
                decision = "MANUAL_REVIEW"
            else:
                decision = "REJECT"
            
            return {
                "decision": decision,
                "score": score,
                "max_score": max_score,
                "percentage": round((score / max_score) * 100, 1),
                "issues": issues,
                "listing_id": listing_id,
                "listing_title": listing.get("title", "Untitled"),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"❌ Error moderating listing {listing_id}: {e}")
            return {
                "decision": "ERROR",
                "reasons": [str(e)],
                "success": False
            }


# Global singleton instance
_moderation_service = None

def get_moderation_service() -> AdminModerationService:
    """Get or create singleton moderation service instance"""
    global _moderation_service
    if _moderation_service is None:
        _moderation_service = AdminModerationService()
    return _moderation_service
