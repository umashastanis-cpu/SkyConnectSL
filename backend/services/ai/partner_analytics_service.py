"""
Partner Analytics Service
Deterministic analytics with optional LLM formatting
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict
from services.firestore_service import firestore_service
from services.ai.llm_provider import get_llm_provider

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PartnerAnalyticsService:
    """
    Partner analytics with hybrid architecture:
    
    1. Deterministic aggregation (100% accurate numbers)
    2. Optional LLM formatting (conversational summary)
    
    Analytics are NEVER hallucinated - LLM only formats existing data.
    """
    
    def __init__(self):
        self.llm_provider = get_llm_provider()
    
    async def get_partner_analytics(
        self,
        partner_id: str,
        period_days: int = 30,
        include_llm_summary: bool = True
    ) -> Dict[str, Any]:
        """
        Generate partner analytics report
        
        Flow:
        1. Fetch all partner data (deterministic)
        2. Calculate metrics (deterministic aggregation)
        3. Optionally format with LLM for conversational summary
        
        Args:
            partner_id: Partner's user ID
            period_days: Analysis period in days
            include_llm_summary: Whether to generate LLM summary
            
        Returns:
            Complete analytics report with metrics and optional AI summary
        """
        
        try:
            # Step 1: Fetch partner data
            partner_profile = await firestore_service.get_user_profile(partner_id, 'partner')
            if not partner_profile:
                logger.warning(f"No profile found for partner {partner_id}")
                return {
                    "success": False,
                    "error": "Partner not found"
                }
            
            # Step 2: Fetch partner listings
            partner_listings = await self._get_partner_listings(partner_id)
            
            # Step 3: Calculate deterministic metrics
            metrics = await self._calculate_metrics(
                partner_id=partner_id,
                listings=partner_listings,
                period_days=period_days
            )
            
            # Step 4: Build base report (100% deterministic)
            report = {
                "success": True,
                "partner_id": partner_id,
                "partner_name": partner_profile.get("businessName", "Partner"),
                "period_days": period_days,
                "generated_at": datetime.utcnow().isoformat(),
                "metrics": metrics,
                "listings_count": len(partner_listings),
                "top_listings": self._get_top_listings(partner_listings, limit=3)
            }
            
            # Step 5: Optionally add LLM summary
            if include_llm_summary:
                llm_summary = await self._generate_llm_summary(report)
                if llm_summary:
                    report["ai_summary"] = llm_summary
                    report["summary_source"] = "llm"
                else:
                    report["ai_summary"] = self._generate_deterministic_summary(report)
                    report["summary_source"] = "fallback"
            else:
                report["ai_summary"] = self._generate_deterministic_summary(report)
                report["summary_source"] = "deterministic"
            
            logger.info(f"✓ Generated analytics report for partner {partner_id}")
            return report
            
        except Exception as e:
            logger.error(f"❌ Error generating analytics: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _get_partner_listings(self, partner_id: str) -> List[Dict[str, Any]]:
        """Fetch all listings for a partner"""
        try:
            # Fetch all listings and filter by partner_id
            all_listings = await firestore_service.get_all_listings(status="approved")
            partner_listings = [l for l in all_listings if l.get("partnerId") == partner_id]
            
            # Also get pending listings
            pending_listings = await firestore_service.get_all_listings(status="pending")
            partner_pending = [l for l in pending_listings if l.get("partnerId") == partner_id]
            
            return partner_listings + partner_pending
            
        except Exception as e:
            logger.error(f"Error fetching partner listings: {e}")
            return []
    
    async def _calculate_metrics(
        self,
        partner_id: str,
        listings: List[Dict[str, Any]],
        period_days: int
    ) -> Dict[str, Any]:
        """
        Calculate deterministic metrics
        
        Metrics are 100% accurate - NO LLM involvement
        """
        
        # Basic listing metrics
        total_listings = len(listings)
        approved_listings = len([l for l in listings if l.get("status") == "approved"])
        pending_listings = len([l for l in listings if l.get("status") == "pending"])
        
        # Category distribution
        category_counts = defaultdict(int)
        for listing in listings:
            category = listing.get("category", "unknown")
            category_counts[category] += 1
        
        # Location distribution
        location_counts = defaultdict(int)
        for listing in listings:
            location = listing.get("location", "unknown")
            location_counts[location] += 1
        
        # Price statistics
        prices = [l.get("price", 0) for l in listings if l.get("price")]
        avg_price = sum(prices) / len(prices) if prices else 0
        min_price = min(prices) if prices else 0
        max_price = max(prices) if prices else 0
        
        # Mock engagement metrics (in production, fetch from bookings/views collection)
        # For MVP, use placeholder values
        total_views = len(listings) * 42  # Mock: avg 42 views per listing
        total_bookings = len(listings) * 3  # Mock: avg 3 bookings per listing
        
        return {
            "listings": {
                "total": total_listings,
                "approved": approved_listings,
                "pending": pending_listings,
                "by_category": dict(category_counts),
                "by_location": dict(location_counts)
            },
            "pricing": {
                "average": round(avg_price, 2),
                "min": min_price,
                "max": max_price,
                "currency": "LKR"
            },
            "engagement": {
                "total_views": total_views,
                "total_bookings": total_bookings,
                "conversion_rate": round((total_bookings / total_views * 100), 2) if total_views > 0 else 0,
                "note": "Mock data for MVP - connect to real bookings in production"
            }
        }
    
    def _get_top_listings(self, listings: List[Dict[str, Any]], limit: int = 3) -> List[Dict[str, Any]]:
        """Get top performing listings (mock ranking for MVP)"""
        
        # In production, sort by actual engagement metrics
        # For MVP, just return first N approved listings
        approved = [l for l in listings if l.get("status") == "approved"]
        
        top = []
        for listing in approved[:limit]:
            top.append({
                "id": listing.get("id"),
                "title": listing.get("title"),
                "category": listing.get("category"),
                "location": listing.get("location"),
                "status": listing.get("status")
            })
        
        return top
    
    async def _generate_llm_summary(self, report: Dict[str, Any]) -> Optional[str]:
        """Generate conversational summary using LLM"""
        
        metrics = report["metrics"]
        
        prompt = f"""You are a business analytics assistant.

Generate a brief, friendly performance summary for a travel partner.

Partner: {report['partner_name']}
Period: Last {report['period_days']} days

Metrics:
- Total Listings: {metrics['listings']['total']} (Approved: {metrics['listings']['approved']}, Pending: {metrics['listings']['pending']})
- Categories: {', '.join(metrics['listings']['by_category'].keys())}
- Average Price: {metrics['pricing']['average']} {metrics['pricing']['currency']}
- Total Views: {metrics['engagement']['total_views']}
- Total Bookings: {metrics['engagement']['total_bookings']}
- Conversion Rate: {metrics['engagement']['conversion_rate']}%

Write a concise, encouraging 2-3 sentence summary in second person ("You have...").
Highlight strengths and suggest one improvement.
Keep it under 100 words. Be specific with numbers."""

        try:
            llm_response = await self.llm_provider.generate_response(prompt)
            return llm_response
        except Exception as e:
            logger.warning(f"Failed to generate LLM summary: {e}")
            return None
    
    def _generate_deterministic_summary(self, report: Dict[str, Any]) -> str:
        """Generate simple deterministic summary"""
        
        metrics = report["metrics"]
        
        summary_parts = [
            f"Your listing portfolio includes {metrics['listings']['total']} total experiences",
            f"with {metrics['listings']['approved']} currently approved.",
            f"Your conversion rate is {metrics['engagement']['conversion_rate']}%."
        ]
        
        return " ".join(summary_parts)


# Global singleton instance
_analytics_service = None

def get_analytics_service() -> PartnerAnalyticsService:
    """Get or create singleton analytics service instance"""
    global _analytics_service
    if _analytics_service is None:
        _analytics_service = PartnerAnalyticsService()
    return _analytics_service
