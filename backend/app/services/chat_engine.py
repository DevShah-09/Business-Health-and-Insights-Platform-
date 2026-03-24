"""
chat_engine.py — AI-powered chat for financial Q&A
Integrates with OpenAI to answer financial questions using business data
"""
from typing import Any
from datetime import datetime
from openai import AsyncOpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Check for OpenRouter API Key first
or_key = os.getenv("OPENROUTER_API_KEY", "")
oa_key = os.getenv("OPENAI_API_KEY", "")

if or_key:
    # Use OpenRouter
    openai_client = AsyncOpenAI(
        api_key=or_key,
        base_url="https://openrouter.ai/api/v1"
    )
elif oa_key:
    # Use OpenAI directly
    openai_client = AsyncOpenAI(api_key=oa_key)
else:
    openai_client = None



def _build_financial_context(business_name: str, summary: dict) -> str:
    """Build context string from financial summary for LLM."""
    total_income = summary.get("total_income", 0)
    total_expenses = summary.get("total_expenses", 0)
    net_profit = summary.get("net_profit", 0)
    profit_margin = summary.get("profit_margin", 0)
    avg_monthly_income = summary.get("avg_monthly_income", 0)
    avg_monthly_expenses = summary.get("avg_monthly_expenses", 0)
    top_expense_categories = summary.get("top_expense_categories", {})
    top_income_categories = summary.get("top_income_categories", {})
    
    expenses_str = ", ".join([f"{cat}: ₹{amt:,.0f}" for cat, amt in list(top_expense_categories.items())[:3]])
    income_str = ", ".join([f"{cat}: ₹{amt:,.0f}" for cat, amt in list(top_income_categories.items())[:3]])
    
    context = f"""
You are a financial advisor analyzing {business_name}'s business.
All financial amounts are in Indian Rupees (₹). Please use the ₹ symbol in your responses.

**Financial Summary:**
- Total Revenue: ₹{total_income:,.2f}
- Total Expenses: ₹{total_expenses:,.2f}
- Net Profit: ₹{net_profit:,.2f}
- Profit Margin: {profit_margin:.1f}%
- Monthly Avg Income: ₹{avg_monthly_income:,.2f}
- Monthly Avg Expenses: ₹{avg_monthly_expenses:,.2f}

**Top Expense Categories:** {expenses_str if expenses_str else "None"}
**Top Income Categories:** {income_str if income_str else "None"}

Provide concise, actionable financial advice based on this data.
"""
    return context


async def chat_with_ai(
    user_message: str,
    business_name: str,
    financial_summary: dict,
    conversation_history: list[dict] = None
) -> str:
    """
    Chat with OpenAI about financial data.
    
    Args:
        user_message: User's question/statement
        business_name: Name of the business
        financial_summary: Financial metrics dictionary
        conversation_history: Previous messages [{"role": "user"|"assistant", "content": "..."}]
    
    Returns:
        AI response text
    """
    
    if not openai_client.api_key:
        # Fallback if no API key
        return _get_fallback_response(user_message, business_name, financial_summary)
    
    try:
        # Build context
        context = _build_financial_context(business_name, financial_summary)
        
        # Build messages
        messages = [
            {"role": "system", "content": context}
        ]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current message
        messages.append({"role": "user", "content": user_message})
        
        # Determine which model to use
        model_name = "google/gemini-2.5-flash" if or_key else "gpt-3.5-turbo"

        # Call OpenAI API
        response = await openai_client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return _get_fallback_response(user_message, business_name, financial_summary)


def _get_fallback_response(user_message: str, business_name: str, summary: dict) -> str:
    """Provide fallback response when LLM unavailable."""
    
    total_income = summary.get("total_income", 0)
    total_expenses = summary.get("total_expenses", 0)
    net_profit = summary.get("net_profit", 0)
    profit_margin = summary.get("profit_margin", 0)
    
    # Pattern matching for common questions
    msg_lower = user_message.lower()
    
    if any(word in msg_lower for word in ["profit", "profitable", "earning"]):
        if profit_margin > 0:
            return f"{business_name} is profitable with a {profit_margin:.1f}% profit margin (₹{net_profit:,.2f} net profit). This is a healthy position if margins are above 20%. Consider reinvesting in growth initiatives."
        else:
            return f"{business_name} is currently operating at a loss. Focus on reducing expenses or increasing revenue to reach profitability."
    
    elif any(word in msg_lower for word in ["lose", "losing", "money"]):
        if total_expenses > total_income:
            return f"You're losing ₹{abs(net_profit):,.2f} overall. Your expenses (₹{total_expenses:,.2f}) exceed income (₹{total_income:,.2f}). Immediate action needed: cut non-essential expenses or boost revenue."
        else:
            return f"Your business is making money overall. Net profit is ₹{net_profit:,.2f}. If you're concerned about specific areas, review your expense categories."
    
    elif any(word in msg_lower for word in ["expense", "cost", "spending"]):
        high_categories = dict(sorted(summary.get("top_expense_categories", {}).items(), key=lambda x: x[1], reverse=True)[:3])
        if high_categories:
            cats = ", ".join([f"{cat} (₹{amt:,.0f})" for cat, amt in high_categories.items()])
            return f"Your top expenses are: {cats}. Review these categories to identify reduction opportunities."
        return "Monitor your expense categories regularly."
    
    elif any(word in msg_lower for word in ["revenue", "income", "sales"]):
        return f"Your total revenue is ₹{total_income:,.2f}. Focus on growing your top income channels and verify they align with your business goals."
    
    elif any(word in msg_lower for word in ["cash", "flow"]):
        return f"Your net cash flow is ₹{net_profit:,.2f}. Maintain positive cash flow by tracking income and expenses closely."
    
    elif any(word in msg_lower for word in ["help", "advice", "recommend"]):
        return f"I can help! Try asking: 'Why is my profit low?', 'Where am I losing money?', 'How are my expenses?', or 'Is my business profitable?'"
    
    else:
        return f"I analyzed {business_name}'s financials. What specific aspect would you like to know about? (profit, expenses, revenue, cash flow, etc.)"
