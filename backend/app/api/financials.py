"""
app/api/financials.py — Comprehensive Financial Analysis & KPI Routes
Includes P&L analysis, cash flow tracking, profitability metrics, and expense breakdown.
"""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.transaction import Transaction
from app.schemas.schemas import (
    FinancialSummary, AnomalyRecord, 
    DailyPnL, WeeklyPnL, MonthlyPnL,
    CashFlow, CashFlowTrendItem, NegativeCashFlowPeriod, BurnRate,
    ExpenseBreakdown, IncomeBreakdown, CategoryBreakdownItem,
    ProfitabilityMetrics, ComprehensiveFinancialReport
)
from app.services.financial_engine import (
    compute_financial_summary, get_monthly_trend,
    get_daily_pnl, get_weekly_pnl, get_monthly_pnl,
    compute_cash_flow, get_cash_flow_trend, detect_negative_cash_flow, get_burn_rate,
    get_expense_breakdown, get_income_breakdown,
    compute_profitability_metrics
)
from app.services.anomaly_detection import detect_anomalies

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# 1. OVERVIEW & SUMMARY ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/businesses/{business_id}/financials/summary", response_model=FinancialSummary)
async def financial_summary(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get comprehensive financial summary.
    Includes: total income, expenses, profit margin, averages, and top categories.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    return compute_financial_summary(transactions)


@router.get("/businesses/{business_id}/financials/report", response_model=ComprehensiveFinancialReport)
async def comprehensive_report(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get complete financial report with all metrics.
    Includes P&L, cash flow, burn rate, profitability, and breakdowns.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    
    return ComprehensiveFinancialReport(
        summary=compute_financial_summary(transactions),
        profitability=compute_profitability_metrics(transactions),
        cash_flow=compute_cash_flow(transactions),
        burn_rate=get_burn_rate(transactions),
        monthly_pnl=[MonthlyPnL(**pnl) for pnl in get_monthly_pnl(transactions)],
        negative_cash_flow_periods=[NegativeCashFlowPeriod(**period) for period in detect_negative_cash_flow(transactions, period="monthly")],
        expense_breakdown=get_expense_breakdown(transactions),
        income_breakdown=get_income_breakdown(transactions),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. PERIOD-BASED P&L ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/businesses/{business_id}/financials/pnl/daily", response_model=list[DailyPnL])
async def daily_pnl(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get daily Profit & Loss.
    Returns daily income, expenses, profit/loss, and profit margin.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    pnl_data = get_daily_pnl(transactions)
    return [DailyPnL(**item) for item in pnl_data]


@router.get("/businesses/{business_id}/financials/pnl/weekly", response_model=list[WeeklyPnL])
async def weekly_pnl(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get weekly Profit & Loss.
    Returns weekly income, expenses, profit/loss, and profit margin.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    pnl_data = get_weekly_pnl(transactions)
    return [WeeklyPnL(**item) for item in pnl_data]


@router.get("/businesses/{business_id}/financials/pnl/monthly", response_model=list[MonthlyPnL])
async def monthly_pnl(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get monthly Profit & Loss.
    Returns monthly income, expenses, profit/loss, and profit margin.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    pnl_data = get_monthly_pnl(transactions)
    return [MonthlyPnL(**item) for item in pnl_data]


@router.get("/businesses/{business_id}/financials/trend")
async def monthly_trend(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get monthly income/expense trend (legacy endpoint).
    Returns monthly income and expenses for trend visualization.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    return get_monthly_trend(result.scalars().all())


# ─────────────────────────────────────────────────────────────────────────────
# 3. CASH FLOW ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/businesses/{business_id}/financials/cash-flow", response_model=CashFlow)
async def cash_flow(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get cash flow summary.
    Includes: total inflow, outflow, net flow, daily average, and working capital.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    return compute_cash_flow(transactions)


@router.get("/businesses/{business_id}/financials/cash-flow/trend", response_model=list[CashFlowTrendItem])
async def cash_flow_trend(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get cumulative cash flow trend.
    Shows running balance over time with daily inflow/outflow tracking.
    Useful for visualizing cash position evolution.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    trend_data = get_cash_flow_trend(transactions)
    return [CashFlowTrendItem(**item) for item in trend_data]


@router.get("/businesses/{business_id}/financials/negative-cash-flow", response_model=list[NegativeCashFlowPeriod])
async def negative_cash_flow(
    business_id: uuid.UUID,
    period: str = Query("monthly", description="Period: 'daily', 'weekly', or 'monthly'"),
    db: AsyncSession = Depends(get_db)
):
    """
    Detect periods with negative cash flow (deficit).
    Helps identify when expenses exceeded income.
    
    Query Parameters:
    - period: "daily", "weekly", or "monthly" (default: monthly)
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    negative_periods = detect_negative_cash_flow(transactions, period=period)
    return [NegativeCashFlowPeriod(**item) for item in negative_periods]


@router.get("/businesses/{business_id}/financials/burn-rate", response_model=BurnRate)
async def burn_rate(
    business_id: uuid.UUID,
    days: int = Query(30, description="Look back window in days"),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate burn rate (daily/monthly cash expense).
    Useful for runway calculations and cash management.
    
    Query Parameters:
    - days: Number of days to look back (default: 30)
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    return get_burn_rate(transactions, days=days)


# ─────────────────────────────────────────────────────────────────────────────
# 4. CATEGORY BREAKDOWN ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/businesses/{business_id}/financials/expense-breakdown", response_model=ExpenseBreakdown)
async def expense_breakdown(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get detailed category-wise expense breakdown.
    Shows amount, percentage, count, and average per category.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    breakdown = get_expense_breakdown(transactions)
    return ExpenseBreakdown(categories=breakdown)


@router.get("/businesses/{business_id}/financials/income-breakdown", response_model=IncomeBreakdown)
async def income_breakdown(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get detailed category-wise income breakdown.
    Shows amount, percentage, count, and average per category.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    breakdown = get_income_breakdown(transactions)
    return IncomeBreakdown(categories=breakdown)


# ─────────────────────────────────────────────────────────────────────────────
# 5. PROFITABILITY METRICS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/businesses/{business_id}/financials/profitability", response_model=ProfitabilityMetrics)
async def profitability_metrics(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get profitability metrics and financial ratios.
    
    Metrics:
    - Gross Margin: (Net Profit / Total Income) × 100
    - Operating Ratio: (Expenses / Income) × 100
    - Net Margin: Same as gross margin
    - Expense Ratio: (Expenses / Income) × 100
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()
    return compute_profitability_metrics(transactions)


# ─────────────────────────────────────────────────────────────────────────────
# 6. ANOMALY DETECTION (LEGACY)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/businesses/{business_id}/financials/anomalies", response_model=list[AnomalyRecord])
async def anomalies(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Detect unusual transactions (anomalies).
    Uses statistical analysis to find outliers.
    """
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    return detect_anomalies(result.scalars().all())
