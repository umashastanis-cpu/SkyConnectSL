"""
Admin Moderation Agent - Phase 1 MVP
Assists admins with partner verification and content moderation

Features:
- Duplicate account detection
- Text content moderation
- Rule-based auto-approve/reject recommendations
- Decision logging
"""

from typing import Optional, Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_react_agent
from datetime import datetime
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from services.ai.tools.moderation_tools import get_moderation_tools


ADMIN_MODERATOR_SYSTEM_PROMPT = """
You are SkyConnect Admin Moderation AI - an intelligent assistant for platform administrators.

YOUR ROLE:
- Help admins efficiently review partner applications
- Detect fraud, duplicates, and policy violations
- Provide clear approval/rejection recommendations with evidence
- Ensure platform quality and safety

YOUR CAPABILITIES:
- Duplicate account detection (email, phone, bank details)
- Content moderation (spam, profanity, policy violations)
- Automated quality scoring and decision recommendations
- Risk assessment and fraud pattern detection

RESPONSE GUIDELINES:
1. ✅ Always provide clear APPROVE/REJECT/REVIEW recommendations
2. ✅ List specific evidence and reasons for each decision
3. ✅ Flag high-risk cases immediately
4. ✅ Be thorough but efficient - admins are busy
5. ✅ Use structured formatting for easy scanning
6. ✅ Include confidence level for automated decisions

DECISION FRAMEWORK:
**AUTO-APPROVE if:**
- All required information complete and verified
- No duplicates detected
- Content passes moderation
- Quality score ≥ 80/100
- No red flags

**MANUAL_REVIEW if:**
- Missing some optional information
- Minor content issues
- Quality score 50-79/100
- Needs human judgment

**AUTO-REJECT if:**
- Duplicate account detected
- Serious policy violations
- Spam or fraudulent content
- Quality score < 50/100
- Clear safety concerns

TONE:
- Professional and objective
- Clear and decisive
- Evidence-based
- Helpful to admin (save them time)

EXAMPLE INTERACTION:
Admin: "Review application for partner ID ABC123"
Agent: "🤖 **Application Review: Partner ABC123**

**Automated Decision: ⚠️ MANUAL_REVIEW**
Confidence: 65/100

**FINDINGS:**
✅ **Passed Checks:**
- Email unique (no duplicates)
- Phone number valid
- Business name acceptable
- Description passes content moderation

⚠️ **Concerns:**
- No bank details provided yet
- Only 2 photos uploaded (recommend 5+)
- Limited business description (80 chars)

📊 **Quality Score: 68/100**
- Completeness: 70/100
- Content Quality: 65/100
- Verification: 70/100

💡 **RECOMMENDATION:**
Send back to partner with request for:
1. Bank account details
2. 3 more photos of business/services
3. Expanded business description (min 200 chars)

Not fraudulent or spam - just needs more information."

Remember: Balance thoroughness with efficiency. Protect platform quality while being fair to partners.
"""


class AdminModeratorAgent:
    """
    Admin Moderation Agent - Phase 1 MVP
    
    Helps admins review partner applications and moderate content
    """
    
    def __init__(self, llm):
        """
        Initialize Admin Moderator Agent
        
        Args:
            llm: LangChain LLM instance
        """
        self.llm = llm
        self.tools = get_moderation_tools()
        self.agent = self._create_agent()
    
    def _create_agent(self) -> AgentExecutor:
        """Create the agent"""
        from langchain_core.prompts import MessagesPlaceholder
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", ADMIN_MODERATOR_SYSTEM_PROMPT + "\n\nYou have access to the following tools:\n\n{tools}\n\nUse the following format:\nQuestion: the input question\nThought: you should always think about what to do\nAction: the action to take (one of [{tool_names}])\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question"),
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
    
    async def review(self, application_id: str, partner_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Review a partner application
        
        Args:
            application_id: Application ID
            partner_data: Partner application data
            
        Returns:
            Dict with decision and reasoning
        """
        try:
            # Build review query
            query = f"""Review this partner application:
            
            Application ID: {application_id}
            Business Name: {partner_data.get('businessName', 'N/A')}
            Email: {partner_data.get('email', 'N/A')}
            Phone: {partner_data.get('phone', 'N/A')}
            Description: {partner_data.get('description', 'N/A')}
            
            Please provide your recommendation.
            """
            
            print(f"\n🛡️ Admin Moderator Agent Processing:")
            print(f"   Application: {application_id}")
            
            # Run agent
            result = self.agent.invoke({"input": query})
            
            response_text = result.get("output", "")
            
            # Extract decision (simple keyword matching for MVP)
            decision = self._extract_decision(response_text)
            
            return {
                "response": response_text,
                "decision": decision,
                "application_id": application_id,
                "reviewed_at": datetime.utcnow().isoformat(),
                "agent_type": "admin_moderator"
            }
            
        except Exception as e:
            print(f"❌ Admin Moderator Agent error: {e}")
            
            return {
                "response": f"Error reviewing application: {str(e)}",
                "decision": "ERROR",
                "application_id": application_id,
                "agent_type": "admin_moderator"
            }
    
    def _extract_decision(self, response: str) -> str:
        """Extract decision from agent response (simple keyword matching)"""
        response_lower = response.lower()
        
        if "auto-approve" in response_lower or "auto_approve" in response_lower:
            return "APPROVE"
        elif "auto-reject" in response_lower or "auto_reject" in response_lower:
            return "REJECT"
        elif "manual" in response_lower or "review" in response_lower:
            return "MANUAL_REVIEW"
        else:
            return "UNKNOWN"
