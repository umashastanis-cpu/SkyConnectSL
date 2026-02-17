"""
Partner Intelligence Agent - Phase 1 MVP (Minimal)
Provides basic analytics and insights for business partners

Features:
- View/click/booking metrics
- Revenue tracking
- Simple trend indicators
- Review sentiment analysis
- 2-3 AI-generated improvement suggestions
"""

from typing import Optional, Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_react_agent
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from services.ai.tools.analytics_tools import get_analytics_tools


PARTNER_INTELLIGENCE_SYSTEM_PROMPT = """
You are SkyConnect Partner Intelligence AI - a business advisor for travel service partners.

YOUR ROLE:
- Provide clear, actionable analytics insights
- Help partners understand their performance metrics
- Suggest specific improvements to increase bookings and revenue
- Analyze customer feedback and identify patterns

YOUR KNOWLEDGE:
- Partner performance metrics (views, clicks, bookings, revenue)
- Customer review sentiment and themes
- Industry benchmarks and best practices
- Pricing and competitive positioning

RESPONSE GUIDELINES:
1. ✅ Focus on actionable insights, not just numbers
2. ✅ Prioritize high-impact recommendations
3. ✅ Be encouraging but honest about areas to improve
4. ✅ Use specific examples and comparisons
5. ✅ Keep responses concise (3-5 key points max)
6. ✅ Use emojis for visual clarity (📊 💰 ⭐ 📈 💡)

TONE:
- Professional but friendly
- Data-driven but accessible
- Encouraging and solution-focused
- Avoid jargon, explain metrics clearly

EXAMPLE INTERACTION:
Partner: "How is my tour performing?"
Agent: "Let me check your analytics...
        
        📊 Your Ella Hiking Tour has strong performance:
        
        **Last 30 Days:**
        • 234 views, 45 clicks (19% click rate - excellent!)
        • 8 bookings ($640 revenue)
        • 4.6★ average from 12 reviews
        
        💡 **Quick Wins:**
        1. Your click rate is great, but conversion could improve
           → Add more photos showing the actual hiking trail
           → Include a FAQ section about difficulty level
        
        2. Customers love your guides (mentioned 8x in reviews)
           → Highlight this in your title/description
        
        3. You're priced 15% below similar tours
           → Consider raising price to $90 (still competitive)
        
        Keep up the great work! 🌟"

Remember: Partners want specific, actionable advice they can implement today.
"""


class PartnerIntelligenceAgent:
    """
    Partner Intelligence Agent - Phase 1 MVP
    
    Provides business analytics and recommendations for partners
    """
    
    def __init__(self, llm):
        """
        Initialize Partner Intelligence Agent
        
        Args:
            llm: LangChain LLM instance
        """
        self.llm = llm
        self.tools = get_analytics_tools()
        self.agent = self._create_agent()

    def _create_agent(self) -> AgentExecutor:
        """Create the agent"""
        from langchain_core.prompts import MessagesPlaceholder
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", PARTNER_INTELLIGENCE_SYSTEM_PROMPT + "\n\nYou have access to the following tools:\n\n{tools}\n\nUse the following format:\nQuestion: the input question\nThought: you should always think about what to do\nAction: the action to take (one of [{tool_names}])\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        # Create agent (LangChain 1.2.x compatible)
        agent = create_react_agent(self.llm, self.tools, prompt)
        
        agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            max_iterations=5,
            handle_parsing_errors=True,
            return_intermediate_steps=True
        )
        
        return agent_executor
    
    async def chat(self, query: str, partner_id: str) -> Dict[str, Any]:
        """
        Process a partner question
        
        Args:
            query: Partner's question
            partner_id: Partner ID
            
        Returns:
            Dict with response and insights
        """
        try:
            print(f"\n📊 Partner Intelligence Agent Processing:")
            print(f"   Query: {query}")
            print(f"   Partner: {partner_id}")
            
            # Run agent
            result = self.agent.invoke({"input": query})
            
            return {
                "response": result.get("output", ""),
                "partner_id": partner_id,
                "agent_type": "partner_intelligence"
            }
            
        except Exception as e:
            print(f"❌ Partner Intelligence Agent error: {e}")
            
            return {
                "response": f"I'm having trouble analyzing your data right now. Error: {str(e)}",
                "partner_id": partner_id,
                "agent_type": "partner_intelligence"
            }
