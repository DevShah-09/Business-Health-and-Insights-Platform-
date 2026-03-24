"""app/api/chat.py — AI-powered financial chat endpoint"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.transaction import Transaction
from app.models.business import Business
from app.services.financial_engine import compute_financial_summary
from app.services.chat_engine import chat_with_ai

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    message: str
    business_id: str


@router.post("/businesses/{business_id}/chat", response_model=ChatResponse, summary="Chat with AI Financial Advisor")
async def ai_chat(
    business_id: uuid.UUID,
    chat_input: ChatMessage,
    db: AsyncSession = Depends(get_db)
):
    """
    Ask financial questions about your business.
    The AI analyzes your data and provides insights.
    
    Example queries:
    - "Why is my profit low?"
    - "Where am I losing money?"
    - "Is my business healthy?"
    - "How can I improve profitability?"
    """
    
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()

    if not transactions:
        return ChatResponse(
            business_id=str(business_id),
            message="Hello! I'm ready to help analyze your finances. Start by adding some transaction data."
        )

    # Compute financial summary
    summary = compute_financial_summary(transactions)
    
    # Convert summary to dict for chat engine
    summary_dict = {
        "total_income": summary.total_income,
        "total_expenses": summary.total_expenses,
        "net_profit": summary.net_profit,
        "profit_margin": summary.profit_margin,
        "avg_monthly_income": summary.avg_monthly_income,
        "avg_monthly_expenses": summary.avg_monthly_expenses,
        "top_expense_categories": summary.top_expense_categories,
        "top_income_categories": summary.top_income_categories,
    }

    # Get AI response
    ai_response = await chat_with_ai(
        user_message=chat_input.message,
        business_name=biz.name,
        financial_summary=summary_dict,
        conversation_history=chat_input.conversation_history
    )

    return ChatResponse(
        business_id=str(business_id),
        message=ai_response
    )
