"""app/api/reports.py — Automated report generation endpoints"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.transaction import Transaction
from app.models.business import Business
from app.services.financial_engine import compute_financial_summary
from app.services.reports_engine import (
    generate_weekly_report,
    generate_monthly_report,
    generate_quarterly_report
)

router = APIRouter()


@router.get("/businesses/{business_id}/reports/weekly", summary="Generate Weekly Report")
async def get_weekly_report(
    business_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a comprehensive weekly business report.
    Includes: summary, trends, recommendations, alerts, and formatted email/WhatsApp content.
    """
    
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()

    if not transactions:
        raise HTTPException(status_code=422, detail="No transactions found")

    summary = compute_financial_summary(transactions)
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

    report = generate_weekly_report(biz.name, summary_dict)
    return report.to_dict()


@router.get("/businesses/{business_id}/reports/monthly", summary="Generate Monthly Report")
async def get_monthly_report(
    business_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a comprehensive monthly business report.
    Includes: summary, trends, recommendations, alerts, and formatted email/WhatsApp content.
    """
    
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()

    if not transactions:
        raise HTTPException(status_code=422, detail="No transactions found")

    summary = compute_financial_summary(transactions)
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

    report = generate_monthly_report(biz.name, summary_dict)
    return report.to_dict()


@router.get("/businesses/{business_id}/reports/quarterly", summary="Generate Quarterly Report")
async def get_quarterly_report(
    business_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a comprehensive quarterly business report.
    Includes: summary, trends, recommendations, alerts, and formatted email/WhatsApp content.
    """
    
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()

    if not transactions:
        raise HTTPException(status_code=422, detail="No transactions found")

    summary = compute_financial_summary(transactions)
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

    report = generate_quarterly_report(biz.name, summary_dict)
    return report.to_dict()
