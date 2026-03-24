"""
app/api/ai_insights.py — AI narrative insights route
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.transaction import Transaction
from app.models.business import Business
from app.services.financial_engine import (
    compute_financial_summary, 
    get_expense_breakdown, 
    get_income_breakdown
)
from app.services.ai_engine import generate_business_insights

router = APIRouter()

@router.get("/businesses/{business_id}/ai/insights")
async def ai_insights(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    print(f"DEBUG: Generating insights for {business_id} using latest code v2")
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()

    if not transactions:
        return generate_business_insights({
            "summary": {"total_income": 0, "total_expenses": 0, "net_profit": 0, "profit_margin": 0},
            "expense_breakdown": {},
            "income_breakdown": {},
            "business_name": biz.name or "Your Business",
            "industry": biz.industry or "General",
        })

    summary = compute_financial_summary(transactions)
    expense_breakdown = get_expense_breakdown(transactions)
    income_breakdown = get_income_breakdown(transactions)
    from app.services.financial_engine import get_monthly_pnl
    monthly_pnl = get_monthly_pnl(transactions)

    return generate_business_insights({
        "summary": {
            "total_income": summary.total_income,
            "total_expenses": summary.total_expenses,
            "net_profit": summary.net_profit,
            "profit_margin": summary.profit_margin,
        },
        "expense_breakdown": expense_breakdown,
        "income_breakdown": income_breakdown,
        "monthly_pnl": monthly_pnl,  # Pass historical trends
        "raw_transactions": [
            {
                "amount": float(t.amount),
                "category": t.category,
                "date": t.transaction_date.isoformat(),
                "type": t.type.value
            } for t in transactions
        ],
        "business_name": biz.name or "Your Business",
        "industry": biz.industry or "General",
    })

