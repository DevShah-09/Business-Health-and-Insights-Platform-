"""app/api/simulation.py — What-if scenario simulation endpoints"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.transaction import Transaction
from app.models.business import Business
from app.services.financial_engine import compute_financial_summary
from app.services.scenario_engine import (
    simulate_revenue_change,
    simulate_expense_change,
    simulate_combined_scenario,
    generate_scenario_batch
)

router = APIRouter()


class ScenarioRequest(BaseModel):
    revenue_change_pct: float = 0
    expense_change_pct: float = 0
    scenario_name: str = None


@router.get("/businesses/{business_id}/scenario/revenue", summary="Simulate Revenue Change")
async def simulate_revenue(
    business_id: uuid.UUID,
    change_pct: float = Query(..., description="Revenue change percentage (-100 to +100)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Simulate the impact of revenue changes.
    
    Example: change_pct=-20 means 20% revenue drop
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
    }

    result = simulate_revenue_change(summary_dict, change_pct)
    return result.to_dict()


@router.get("/businesses/{business_id}/scenario/expense", summary="Simulate Expense Change")
async def simulate_expense(
    business_id: uuid.UUID,
    change_pct: float = Query(..., description="Expense change percentage (-100 to +100)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Simulate the impact of expense changes.
    
    Example: change_pct=-10 means 10% cost reduction
    Example: change_pct=+15 means 15% expense increase (e.g., rent hike)
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
    }

    result = simulate_expense_change(summary_dict, change_pct)
    return result.to_dict()


@router.post("/businesses/{business_id}/scenario/combined", summary="Simulate Combined Scenario")
async def simulate_combined(
    business_id: uuid.UUID,
    scenario: ScenarioRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulate combined revenue and expense changes.
    
    Example: "What if sales drop 20% AND rent increases 15%?"
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
    }

    result = simulate_combined_scenario(
        summary_dict,
        revenue_change_pct=scenario.revenue_change_pct,
        expense_change_pct=scenario.expense_change_pct,
        scenario_name=scenario.scenario_name
    )
    return result.to_dict()


@router.get("/businesses/{business_id}/scenario/batch", summary="Generate Multiple Common Scenarios")
async def get_scenario_batch(
    business_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a batch of common scenario simulations:
    - Revenue Drop 20%
    - Revenue Growth 15%
    - Cut Expenses 10%
    - Rent Increase 15%
    - Worst Case (Revenue ↓20% + Expenses ↑15%)
    - Best Case (Revenue ↑20% + Expenses ↓10%)
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
    }

    scenarios = generate_scenario_batch(summary_dict)
    return scenarios
