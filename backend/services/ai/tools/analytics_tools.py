"""
Analytics Tools
Tools for partner business intelligence and performance metrics
"""

from typing import Optional, List, Dict, Any
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import random


# Tool Input Schemas
class GetPartnerAnalyticsInput(BaseModel):
    """Input for GetPartnerAnalytics tool"""
    partner_id: str = Field(description="Partner user ID")
    listing_id: Optional[str] = Field(None, description="Specific listing ID (optional)")
    time_period: Optional[str] = Field("30days", description="Time period: 7days, 30days, 90days, or 1year")


class AnalyzeReviewsInput(BaseModel):
    """Input for AnalyzeReviews tool"""
    listing_id: str = Field(description="Listing ID to analyze reviews for")


class GetRevenueReportInput(BaseModel):
    """Input for GetRevenueReport tool"""
    partner_id: str = Field(description="Partner user ID")
    time_period: Optional[str] = Field("30days", description="Time period: 7days, 30days, 90days, or 1year")


# Custom Tools
class GetPartnerAnalyticsTool(BaseTool):
    """Tool to get partner performance metrics"""
    name: str = "GetPartnerAnalytics"
    description: str = """Get performance metrics for a partner's listings including views, clicks, bookings, and conversion rates.
    Use this when partners ask about their performance, stats, or how their listings are doing.
    """
    args_schema: type = GetPartnerAnalyticsInput
    
    def _run(self, partner_id: str, listing_id: Optional[str] = None, time_period: str = "30days") -> str:
        """Get analytics data (demo data for now)"""
        try:
            # In production, fetch from Firestore analytics collection
            # For now, generate demo data
            
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
            
            from services.firestore_service import firestore_service
            import asyncio
            
            # Get partner's listings
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            if listing_id:
                listing = loop.run_until_complete(firestore_service.get_listing_by_id(listing_id))
                listings = [listing] if listing else []
            else:
                # Get all partner listings (this function doesn't exist yet!)
                # For demo, generate mock data
                listings = [{
                    'id': 'demo123',
                    'title': 'Demo Listing',
                    'category': 'tour',
                    'price': 75
                }]
            
            loop.close()
            
            if not listings:
                return "No listings found for this partner."
            
            # Generate demo analytics
            days = 30 if time_period == "30days" else 7 if time_period == "7days" else 90
            
            total_views = random.randint(100, 1000)
            total_clicks = random.randint(20, total_views // 3)
            total_bookings = random.randint(1, total_clicks // 5)
            total_revenue = total_bookings * random.randint(50, 200)
            
            click_rate = (total_clicks / total_views * 100) if total_views > 0 else 0
            conversion_rate = (total_bookings / total_clicks * 100) if total_clicks > 0 else 0
            
            result = f"""
**📊 Performance Report - Last {days} Days**

**Overview:**
• 👁️ Views: {total_views:,}
• 🖱️ Clicks: {total_clicks:,} ({click_rate:.1f}% click rate)
• ✅ Bookings: {total_bookings} ({conversion_rate:.1f}% conversion)
• 💰 Revenue: ${total_revenue:,}

**Per-Listing Breakdown:**
"""
            
            for idx, listing in enumerate(listings, 1):
                views = random.randint(50, total_views // len(listings) + 50)
                clicks = random.randint(10, views // 3)
                bookings = random.randint(0, clicks // 5)
                
                result += f"\n{idx}. **{listing.get('title', 'Unknown')}**\n"
                result += f"   • Views: {views} | Clicks: {clicks} | Bookings: {bookings}\n"
                result += f"   • Conversion: {(bookings/clicks*100) if clicks > 0 else 0:.1f}%\n"
            
            # Add insights
            result += "\n**💡 Insights:**\n"
            if click_rate > 15:
                result += "✅ Excellent click rate! Your titles/photos are working.\n"
            else:
                result += "⚠️ Low click rate - try improving your listing photos and titles.\n"
            
            if conversion_rate > 5:
                result += "✅ Good conversion! Customers like what they see.\n"
            elif conversion_rate > 2:
                result += "⚠️ Average conversion - consider adding more details or FAQs.\n"
            else:
                result += "⚠️ Low conversion - price, description, or availability may be issues.\n"
            
            return result.strip()
            
        except Exception as e:
            return f"Error getting analytics: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class AnalyzeReviewsTool(BaseTool):
    """Tool to analyze customer reviews and sentiment"""
    name: str = "AnalyzeReviews"
    description: str = """Analyze customer reviews for a listing to identify common themes, sentiment, strengths, and areas to improve.
    Use when partners want to understand what customers are saying about their listing.
    """
    args_schema: type = AnalyzeReviewsInput
    
    def _run(self, listing_id: str) -> str:
        """Analyze reviews (demo version)"""
        try:
            # In production: fetch reviews from Firestore and use NLP
            # For now: generate demo analysis
            
            # Demo review themes
            positive_themes = [
                ("Excellent guides", 8),
                ("Beautiful scenery", 12),
                ("Good value for money", 6),
                ("Professional service", 9),
                ("Well-organized", 5)
            ]
            
            negative_themes = [
                ("Long waiting time", 3),
                ("Need better communication", 2),
                ("Lunch could be improved", 4)
            ]
            
            avg_rating = random.uniform(4.2, 4.8)
            total_reviews = random.randint(15, 50)
            
            result = f"""
**⭐ Review Analysis**

**Overall Rating:** {avg_rating:.1f}/5.0 ({total_reviews} reviews)

**Rating Distribution:**
• 5 stars: {random.randint(10, 25)} reviews ({random.randint(40, 70)}%)
• 4 stars: {random.randint(5, 15)} reviews
• 3 stars: {random.randint(1, 5)} reviews
• 2 stars: {random.randint(0, 2)} reviews
• 1 star: 0 reviews

**✅ What Customers Love:**
"""
            for theme, count in positive_themes:
                result += f"• {theme} (mentioned {count}x)\n"
            
            result += "\n**⚠️ Areas to Improve:**\n"
            for theme, count in negative_themes:
                result += f"• {theme} (mentioned {count}x)\n"
            
            result += """
**💡 Recommended Actions:**
1. Highlight your excellent guides in listing description
2. Add more photos of the scenery
3. Improve communication about pickup times
4. Consider upgrading lunch options
5. Add FAQ section addressing common questions
"""
            
            return result.strip()
            
        except Exception as e:
            return f"Error analyzing reviews: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class GetRevenueReportTool(BaseTool):
    """Tool to generate revenue reports"""
    name: str = "GetRevenueReport"
    description: str = """Generate detailed revenue report for a partner showing earnings, trends, and projections.
    Use when partners ask about earnings, income, or financial performance.
    """
    args_schema: type = GetRevenueReportInput
    
    def _run(self, partner_id: str, time_period: str = "30days") -> str:
        """Generate revenue report (demo)"""
        try:
            days = 30 if time_period == "30days" else 7 if time_period == "7days" else 90
            
            # Demo data
            total_revenue = random.randint(500, 5000)
            total_bookings = random.randint(5, 50)
            avg_booking_value = total_revenue / total_bookings if total_bookings > 0 else 0
            
            # Platform fee (15%)
            platform_fee = total_revenue * 0.15
            net_revenue = total_revenue - platform_fee
            
            # Growth (vs previous period)
            growth_percent = random.uniform(-10, 35)
            
            result = f"""
**💰 Revenue Report - Last {days} Days**

**Summary:**
• Gross Revenue: ${total_revenue:,.2f}
• Platform Fee (15%): -${platform_fee:,.2f}
• **Net Earnings: ${net_revenue:,.2f}**

**Performance:**
• Total Bookings: {total_bookings}
• Average Booking Value: ${avg_booking_value:.2f}
• Growth vs Previous Period: {"+" if growth_percent > 0 else ""}{growth_percent:.1f}%

**Top Performing Listings:**
1. Adventure Tour - ${random.randint(500, 1500):,} (45% of revenue)
2. City Experience - ${random.randint(300, 800):,} (28% of revenue)
3. Sunset Cruise - ${random.randint(200, 600):,} (18% of revenue)

**📈 Trend Analysis:**
"""
            if growth_percent > 20:
                result += "🔥 Excellent growth! Your listings are gaining traction.\n"
            elif growth_percent > 0:
                result += "📈 Positive growth but room for improvement.\n"
            else:
                result += "📉 Revenue declined - may be seasonal or need marketing boost.\n"
            
            result += f"""
**💡 Revenue Optimization Tips:**
1. {('Maintain momentum with consistent service' if growth_percent > 0 else 'Review pricing and availability')}
2. Promote top-performing listings more
3. Consider package deals for higher booking values
4. Fill low-booking periods with special offers

**Projected Annual Revenue:** ${net_revenue * (365/days):,.0f} (based on current rate)
"""
            
            return result.strip()
            
        except Exception as e:
            return f"Error generating revenue report: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


def get_analytics_tools() -> List[BaseTool]:
    """Get all analytics tools for partner intelligence"""
    return [
        GetPartnerAnalyticsTool(),
        AnalyzeReviewsTool(),
        GetRevenueReportTool()
    ]
