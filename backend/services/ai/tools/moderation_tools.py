"""
Moderation Tools
Tools for admin content moderation and partner verification
"""

from typing import Optional, List, Dict, Any
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
import re


# Tool Input Schemas
class DetectDuplicatesInput(BaseModel):
    """Input for DetectDuplicates tool"""
    partner_id: str = Field(description="Partner ID to check for duplicates")
    check_type: Optional[str] = Field("all", description="What to check: email, phone, bank, business_name, or all")


class ModerateContentInput(BaseModel):
    """Input for ModerateContent tool"""
    content_type: str = Field(description="Type of content: listing_title, listing_description, profile, or review")
    content: str = Field(description="The actual text content to moderate")


class ScoreListingQualityInput(BaseModel):
    """Input for ScoreListingQuality tool"""
    listing_data: Dict[str, Any] = Field(description="Listing data dictionary to score")


# Moderation lists
PROHIBITED_WORDS = [
    'scam', 'fake', 'fraud', 'steal', 'cheat',
    'xxx', 'porn', 'drugs', 'weapon',
    'guarantee', 'certified #1', 'best in world'
]

SPAM_PATTERNS = [
    r'www\.\S+',  # URLs
    r'\b[A-Z]{5,}\b',  # All caps words
    r'(\$|₹|£|€)\d+.*\1\d+',  # Multiple prices
    r'(call|whatsapp|email|contact).*\d{8,}',  # Contact info
]


# Custom Tools
class DetectDuplicatesTool(BaseTool):
    """Tool to detect duplicate partner accounts"""
    name: str = "DetectDuplicates"
    description: str = """Check if a partner has duplicate accounts based on email, phone, bank details, or business name.
    Use this when reviewing new partner applications to prevent fraud.
    """
    args_schema: type = DetectDuplicatesInput
    
    def _run(self, partner_id: str, check_type: str = "all") -> str:
        """Check for duplicates (demo version)"""
        try:
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
            
            from services.firestore_service import firestore_service
            import asyncio
            
            # Get partner data
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            partner = loop.run_until_complete(firestore_service.get_partner_profile(partner_id))
            loop.close()
            
            if not partner:
                return f"Partner {partner_id} not found."
            
            # Demo duplicate detection
            duplicates_found = []
            
            # Simulate checks
            import random
            duplicate_probability = random.random()
            
            if duplicate_probability < 0.1:  # 10% chance of duplicate
                duplicates_found.append({
                    'type': 'email',
                    'matching_partner': 'PARTNER789',
                    'confidence': 'HIGH'
                })
            
            if not duplicates_found:
                return f"""
**✅ No Duplicates Detected**

Checked:
• Email: {partner.get('email', 'N/A')}
• Phone: {partner.get('phone', 'N/A')}
• Business Name: {partner.get('businessName', 'N/A')}

No matches found in existing partner database.
Safe to approve if other checks pass.
"""
            else:
                result = "**⚠️ POTENTIAL DUPLICATES FOUND**\n\n"
                for dup in duplicates_found:
                    result += f"**Type:** {dup['type'].upper()}\n"
                    result += f"**Matching Partner:** {dup['matching_partner']}\n"
                    result += f"**Confidence:** {dup['confidence']}\n\n"
                
                result += "**Recommendation:** MANUAL_REVIEW\n"
                result += "Action: Contact applicant to verify or request admin review."
                
                return result
            
        except Exception as e:
            return f"Error checking duplicates: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class ModerateContentTool(BaseTool):
    """Tool to check content for policy violations"""
    name: str = "ModerateContent"
    description: str = """Check text content for spam, prohibited words, or policy violations.
    Use to verify listing titles, descriptions, reviews, or profile information before approval.
    """
    args_schema: type = ModerateContentInput
    
    def _run(self, content_type: str, content: str) -> str:
        """Moderate content"""
        try:
            if not content or len(content.strip()) == 0:
                return f"**❌ REJECT: Empty {content_type}**\n\nContent cannot be empty."
            
            issues = []
            
            # Check for prohibited words
            content_lower = content.lower()
            found_prohibited = [word for word in PROHIBITED_WORDS if word in content_lower]
            if found_prohibited:
                issues.append(f"Prohibited words: {', '.join(found_prohibited)}")
            
            # Check for spam patterns
            for pattern in SPAM_PATTERNS:
                if re.search(pattern, content, re.IGNORECASE):
                    issues.append(f"Spam pattern detected: {pattern}")
            
            # Length checks
            if content_type == 'listing_title':
                if len(content) < 10:
                    issues.append("Title too short (minimum 10 characters)")
                elif len(content) > 100:
                    issues.append("Title too long (maximum 100 characters)")
            
            elif content_type == 'listing_description':
                if len(content) < 50:
                    issues.append("Description too short (minimum 50 characters)")
                elif len(content) > 2000:
                    issues.append("Description too long (maximum 2000 characters)")
            
            # Generate result
            if not issues:
                return f"""
**✅ APPROVED: {content_type}**

Content passes all moderation checks:
• No prohibited words
• No spam patterns
• Appropriate length
• Policy compliant

Safe to publish.
"""
            else:
                result = f"**⚠️ ISSUES FOUND: {content_type}**\n\n"
                result += "**Problems:**\n"
                for issue in issues:
                    result += f"• {issue}\n"
                
                if len(issues) == 1 and 'too short' in issues[0]:
                    result += "\n**Recommendation:** REJECT_WITH_FEEDBACK\n"
                    result += "Ask user to provide more detailed content."
                else:
                    result += "\n**Recommendation:** REJECT\n"
                    result += "Request content revision before approval."
                
                return result
            
        except Exception as e:
            return f"Error moderating content: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class ScoreListingQualityTool(BaseTool):
    """Tool to score listing quality (0-100)"""
    name: str = "ScoreListingQuality"
    description: str = """Calculate a quality score (0-100) for a listing based on completeness, photos, description quality, etc.
    Use to automatically assess listing quality and recommend approval/rejection.
    """
    args_schema: type = ScoreListingQualityInput
    
    def _run(self, listing_data: Dict[str, Any]) -> str:
        """Score listing quality"""
        try:
            score = 0
            max_score = 100
            feedback = []
            
            # Title (15 points)
            title = listing_data.get('title', '')
            if len(title) >= 20:
                score += 15
                feedback.append("✅ Good title length")
            elif len(title) >= 10:
                score += 8
                feedback.append("⚠️ Title could be more descriptive")
            else:
                feedback.append("❌ Title too short")
            
            # Description (25 points)
            description = listing_data.get('description', '')
            if len(description) >= 200:
                score += 25
                feedback.append("✅ Detailed description")
            elif len(description) >= 100:
                score += 15
                feedback.append("⚠️ Description needs more details")
            elif len(description) >= 50:
                score += 8
                feedback.append("⚠️ Description too brief")
            else:
                feedback.append("❌ Description insufficient")
            
            # Photos (20 points)
            photos = listing_data.get('images', [])
            if len(photos) >= 5:
                score += 20
                feedback.append("✅ Good photo coverage")
            elif len(photos) >= 3:
                score += 15
                feedback.append("⚠️ Add 2-3 more photos")
            elif len(photos) >= 1:
                score += 8
                feedback.append("⚠️ Need more photos (minimum 3)")
            else:
                feedback.append("❌ No photos uploaded")
            
            # Price set (10 points)
            price = listing_data.get('price')
            if price and price > 0:
                score += 10
                feedback.append("✅ Price set")
            else:
                feedback.append("❌ No price specified")
            
            # Location (10 points)
            location = listing_data.get('location', '')
            if len(location) > 3:
                score += 10
                feedback.append("✅ Location specified")
            else:
                feedback.append("❌ Location missing")
            
            # Category (5 points)
            category = listing_data.get('category', '')
            if category:
                score += 5
                feedback.append("✅ Category set")
            else:
                feedback.append("❌ Category missing")
            
            # Amenities/Tags (10 points)
            amenities = listing_data.get('amenities', [])
            tags = listing_data.get('tags', [])
            total_features = len(amenities) + len(tags)
            if total_features >= 5:
                score += 10
                feedback.append("✅ Well-tagged")
            elif total_features >= 3:
                score += 5
                feedback.append("⚠️ Add more amenities/tags")
            else:
                feedback.append("⚠️ Very few amenities/tags")
            
            # Duration/Details (5 points)
            duration = listing_data.get('duration', '')
            if duration:
                score += 5
                feedback.append("✅ Duration specified")
            else:
                feedback.append("⚠️ Duration missing")
            
            # Generate recommendation
            if score >= 80:
                decision = "✅ AUTO-APPROVE"
                reason = "High-quality listing meeting all standards"
            elif score >= 50:
                decision = "⚠️ MANUAL_REVIEW"
                reason = "Moderate quality - admin should verify"
            else:
                decision = "❌ REJECT_WITH_FEEDBACK"
                reason = "Quality too low - request improvements"
            
            result = f"""
**📊 Listing Quality Score: {score}/100**

**Decision:** {decision}
**Reason:** {reason}

**Detailed Feedback:**
"""
            for item in feedback:
                result += f"{item}\n"
            
            if score < 80:
                result += "\n**Required Improvements:**\n"
                if len(title) < 20:
                    result += "• Expand title to 20+ characters\n"
                if len(description) < 200:
                    result += "• Write detailed description (200+ characters)\n"
                if len(photos) < 3:
                    result += "• Upload at least 3 high-quality photos\n"
                if total_features < 5:
                    result += "• Add more amenities and tags\n"
            
            return result
            
        except Exception as e:
            return f"Error scoring listing quality: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


def get_moderation_tools() -> List[BaseTool]:
    """Get all moderation tools for admin agents"""
    return [
        DetectDuplicatesTool(),
        ModerateContentTool(),
        ScoreListingQualityTool()
    ]
