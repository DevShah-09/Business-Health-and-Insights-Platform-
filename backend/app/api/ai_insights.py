"""app/api/ai_insights.py — AI narrative insights route"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.transaction import Transaction
from app.models.business import Business
from app.schemas.schemas import AIInsightResponse
from app.services.financial_engine import compute_financial_summary
from app.services.ai_engine import generate_business_insights

router = APIRouter()

@router.get("/businesses/{business_id}/ai/insights", response_model=AIInsightResponse)
async def ai_insights(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()

    if not transactions:
        raise HTTPException(status_code=422, detail="No transactions found to analyse")

    summary = compute_financial_summary(transactions)
    return await generate_business_insights(summary, biz.name, biz.industry)
