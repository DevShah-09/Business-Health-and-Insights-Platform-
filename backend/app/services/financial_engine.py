"""
financial_engine.py — Comprehensive Financial KPI & Analysis Engine
Provides P&L, cash flow, profitability metrics, and period-based analysis.
"""
import pandas as pd
from typing import Any, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
from app.schemas.schemas import FinancialSummary


# ─────────────────────────────────────────────────────────────────────────────
# Utility: Convert transactions to DataFrame
# ─────────────────────────────────────────────────────────────────────────────

def _to_df(transactions: list[Any]) -> pd.DataFrame:
    """Convert transaction list to pandas DataFrame for analysis."""
    if not transactions:
        return pd.DataFrame()
    
    return pd.DataFrame([
        {
            "id": str(t.id),
            "type": t.type.value,
            "amount": float(t.amount),
            "category": t.category,
            "transaction_date": pd.to_datetime(t.transaction_date),
            "description": t.description or "",
        }
        for t in transactions
    ])


# ─────────────────────────────────────────────────────────────────────────────
# Core Financial Calculations
# ─────────────────────────────────────────────────────────────────────────────

def compute_financial_summary(transactions: list[Any]) -> FinancialSummary:
    """Compute comprehensive financial summary."""
    if not transactions:
        return FinancialSummary(
            total_income=0, total_expenses=0, net_profit=0,
            profit_margin=0, avg_monthly_income=0, avg_monthly_expenses=0,
            top_expense_categories={}, top_income_categories={},
            period_start=None, period_end=None,
        )
    
    df = _to_df(transactions)
    inc = df[df["type"] == "income"]
    exp = df[df["type"] == "expense"]

    total_income   = float(inc["amount"].sum())
    total_expenses = float(exp["amount"].sum())
    net_profit     = total_income - total_expenses
    profit_margin  = (net_profit / total_income * 100) if total_income > 0 else 0.0

    # Monthly averages
    mi = inc.groupby(inc["transaction_date"].dt.to_period("M"))["amount"].sum()
    me = exp.groupby(exp["transaction_date"].dt.to_period("M"))["amount"].sum()

    return FinancialSummary(
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        net_profit=round(net_profit, 2),
        profit_margin=round(profit_margin, 2),
        avg_monthly_income=round(float(mi.mean()) if not mi.empty else 0, 2),
        avg_monthly_expenses=round(float(me.mean()) if not me.empty else 0, 2),
        top_expense_categories={k: round(v, 2) for k, v in exp.groupby("category")["amount"].sum().nlargest(5).items()} if not exp.empty else {},
        top_income_categories={k: round(v, 2) for k, v in inc.groupby("category")["amount"].sum().nlargest(5).items()} if not inc.empty else {},
        period_start=df["transaction_date"].min().date() if not df.empty else None,
        period_end=df["transaction_date"].max().date() if not df.empty else None,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Period-Based P&L: Daily, Weekly, Monthly
# ─────────────────────────────────────────────────────────────────────────────

def get_daily_pnl(transactions: list[Any]) -> list[dict]:
    """Get daily Profit & Loss."""
    if not transactions:
        return []
    
    df = _to_df(transactions)
    df["date"] = df["transaction_date"].dt.date
    
    daily = df.groupby(["date", "type"])["amount"].sum().unstack(fill_value=0).reset_index()
    daily.columns.name = None
    
    result = []
    for _, row in daily.iterrows():
        income = float(row.get("income", 0))
        expense = float(row.get("expense", 0))
        pnl = income - expense
        margin = (pnl / income * 100) if income > 0 else (0 if pnl == 0 else -100)
        
        result.append({
            "date": str(row["date"]),
            "income": round(income, 2),
            "expenses": round(expense, 2),
            "profit_loss": round(pnl, 2),
            "profit_margin": round(margin, 2),
        })
    
    return sorted(result, key=lambda x: x["date"])


def get_weekly_pnl(transactions: list[Any]) -> list[dict]:
    """Get weekly Profit & Loss."""
    if not transactions:
        return []
    
    df = _to_df(transactions)
    df["week"] = df["transaction_date"].dt.isocalendar().week
    df["year"] = df["transaction_date"].dt.isocalendar().year
    df["week_key"] = df["year"].astype(str) + "-W" + df["week"].astype(str).str.zfill(2)
    
    weekly = df.groupby(["week_key", "type"])["amount"].sum().unstack(fill_value=0).reset_index()
    weekly.columns.name = None
    
    result = []
    for _, row in weekly.iterrows():
        income = float(row.get("income", 0))
        expense = float(row.get("expense", 0))
        pnl = income - expense
        margin = (pnl / income * 100) if income > 0 else (0 if pnl == 0 else -100)
        
        result.append({
            "week": row["week_key"],
            "income": round(income, 2),
            "expenses": round(expense, 2),
            "profit_loss": round(pnl, 2),
            "profit_margin": round(margin, 2),
        })
    
    return sorted(result, key=lambda x: x["week"])


def get_yearly_pnl(transactions: list[Any]) -> list[dict]:
    """Get yearly Profit & Loss."""
    if not transactions:
        return []
    
    df = _to_df(transactions)
    df["year"] = df["transaction_date"].dt.year.astype(str)
    
    yearly = df.groupby(["year", "type"])["amount"].sum().unstack(fill_value=0).reset_index()
    yearly.columns.name = None
    
    result = []
    for _, row in yearly.iterrows():
        income = float(row.get("income", 0))
        expense = float(row.get("expense", 0))
        pnl = income - expense
        margin = (pnl / income * 100) if income > 0 else (0 if pnl == 0 else -100)
        
        result.append({
            "year": row["year"],
            "income": round(income, 2),
            "expenses": round(expense, 2),
            "profit_loss": round(pnl, 2),
            "profit_margin": round(margin, 2),
        })
    
    return sorted(result, key=lambda x: x["year"])


def get_monthly_pnl(transactions: list[Any]) -> list[dict]:
    """Get monthly Profit & Loss."""
    if not transactions:
        return []
    
    df = _to_df(transactions)
    df["month"] = df["transaction_date"].dt.to_period("M").astype(str)
    
    monthly = df.groupby(["month", "type"])["amount"].sum().unstack(fill_value=0).reset_index()
    monthly.columns.name = None
    
    result = []
    for _, row in monthly.iterrows():
        income = float(row.get("income", 0))
        expense = float(row.get("expense", 0))
        pnl = income - expense
        margin = (pnl / income * 100) if income > 0 else (0 if pnl == 0 else -100)
        
        result.append({
            "month": row["month"],
            "income": round(income, 2),
            "expenses": round(expense, 2),
            "profit_loss": round(pnl, 2),
            "profit_margin": round(margin, 2),
        })
    
    return sorted(result, key=lambda x: x["month"])


def fill_month_gaps(monthly_data: list[dict]) -> list[dict]:
    """
    Ensure the monthly Profit & Loss series has no calendar gaps.
    Pads missing months with zero-value entries.
    """
    if not monthly_data:
        return []
    
    # Sort data by month string
    sorted_data = sorted(monthly_data, key=lambda x: x["month"])
    
    start_dt = datetime.strptime(sorted_data[0]["month"], "%Y-%m")
    # Take the later of the last data point or the current month
    end_dt = datetime.strptime(sorted_data[-1]["month"], "%Y-%m")
    now = datetime.now()
    if now.year > end_dt.year or (now.year == end_dt.year and now.month > end_dt.month):
        end_dt = datetime(now.year, now.month, 1)

    data_map = {item["month"]: item for item in sorted_data}
    result = []
    
    curr = start_dt
    while curr <= end_dt:
        m_str = curr.strftime("%Y-%m")
        if m_str in data_map:
            result.append(data_map[m_str])
        else:
            result.append({
                "month": m_str,
                "income": 0.0,
                "expenses": 0.0,
                "profit_loss": 0.0,
                "profit_margin": 0.0
            })
        
        # Advance to next month
        if curr.month == 12:
            curr = datetime(curr.year + 1, 1, 1)
        else:
            curr = datetime(curr.year, curr.month + 1, 1)
            
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Cash Flow Tracking & Analysis
# ─────────────────────────────────────────────────────────────────────────────

def compute_cash_flow(transactions: list[Any]) -> dict:
    """
    Compute cash flow metrics: inflow, outflow, net flow.
    Returns current balance and flow statistics.
    """
    if not transactions:
        return {
            "total_inflow": 0,
            "total_outflow": 0,
            "net_cash_flow": 0,
            "working_capital": 0,
        }
    
    df = _to_df(transactions)
    inc = df[df["type"] == "income"]["amount"].sum()
    exp = df[df["type"] == "expense"]["amount"].sum()
    net_flow = float(inc - exp)
    
    return {
        "total_inflow": round(float(inc), 2),
        "total_outflow": round(float(exp), 2),
        "net_cash_flow": round(net_flow, 2),
        "working_capital": round(net_flow, 2),  # Net cash available
    }


def get_cash_flow_trend(transactions: list[Any]) -> list[dict]:
    """
    Get cumulative cash flow trend over time.
    Shows running balance day-by-day.
    """
    if not transactions:
        return []
    
    df = _to_df(transactions)
    df = df.sort_values("transaction_date")
    df["flow"] = df.apply(lambda row: row["amount"] if row["type"] == "income" else -row["amount"], axis=1)
    df["cumulative_flow"] = df["flow"].cumsum()
    
    result = []
    for _, row in df.iterrows():
        result.append({
            "date": str(row["transaction_date"].date()),
            "inflow": row["amount"] if row["type"] == "income" else 0,
            "outflow": row["amount"] if row["type"] == "expense" else 0,
            "cumulative_balance": round(float(row["cumulative_flow"]), 2),
            "transaction_type": row["type"],
            "category": row["category"],
        })
    
    return result


def detect_negative_cash_flow(transactions: list[Any], period: str = "monthly") -> list[dict]:
    """
    Detect periods with negative cash flow (expenses > income).
    
    Args:
        transactions: List of transaction objects
        period: "daily", "weekly", or "monthly" (default: monthly)
    
    Returns: List of periods with negative cash flow
    """
    if period == "daily":
        pnl_data = get_daily_pnl(transactions)
    elif period == "weekly":
        pnl_data = get_weekly_pnl(transactions)
    else:  # monthly
        pnl_data = get_monthly_pnl(transactions)
    
    # Map the dynamic period key ('date', 'week', 'month') to the generic 'period' field required by schema
    period_key_map = {"daily": "date", "weekly": "week", "monthly": "month"}
    actual_key = period_key_map.get(period, "month")
    
    negative_periods = []
    for p in pnl_data:
        if p["profit_loss"] < 0:
            # Create a copy and add the generic 'period' field for Pydantic validation
            newItem = p.copy()
            newItem["period"] = str(p.get(actual_key, ""))
            negative_periods.append(newItem)
    
    return negative_periods


def get_burn_rate(transactions: list[Any], days: int = 30) -> dict:
    """
    Calculate burn rate (how much cash is being spent per day).
    Useful for runway calculations.
    """
    if not transactions:
        return {
            "daily_burn_rate": 0,
            "monthly_burn_rate": 0,
            "runway_days": 0,
        }
    
    df = _to_df(transactions)
    recent_threshold = df["transaction_date"].max() - timedelta(days=days)
    recent_df = df[df["transaction_date"] >= recent_threshold]
    
    total_expenses = float(recent_df[recent_df["type"] == "expense"]["amount"].sum())
    
    daily_burn = total_expenses / days if days > 0 else 0
    monthly_burn = daily_burn * 30
    
    return {
        "daily_burn_rate": round(daily_burn, 2),
        "monthly_burn_rate": round(monthly_burn, 2),
        "period_days": days,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Category & Expense Breakdown
# ─────────────────────────────────────────────────────────────────────────────

def get_expense_breakdown(transactions: list[Any]) -> dict:
    """
    Get detailed category-wise expense breakdown with MoM trends.
    """
    if not transactions:
        return {}
    
    df = _to_df(transactions)
    # Ensure datetime for period calculations
    if 'transaction_date' in df.columns and not pd.api.types.is_datetime64_any_dtype(df['transaction_date']):
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])

    exp = df[df["type"] == "expense"].copy()
    
    if exp.empty:
        return {}
    
    total_expenses = float(exp["amount"].sum())
    category_breakdown = {}
    
    # Use a copy to avoid SettingWithCopyWarning
    exp = exp.copy()
    exp['month_period'] = exp['transaction_date'].dt.to_period('M')
    all_months = sorted(exp['month_period'].unique())
    
    latest_month = all_months[-1] if all_months else None
    prev_month = all_months[-2] if len(all_months) > 1 else None
    
    curr_month_exp = exp[exp['month_period'] == latest_month]
    prev_month_exp = exp[exp['month_period'] == prev_month] if prev_month is not None else pd.DataFrame()
    
    curr_cat_totals = curr_month_exp.groupby('category')['amount'].sum()
    prev_cat_totals = prev_month_exp.groupby('category')['amount'].sum() if not prev_month_exp.empty else pd.Series(dtype=float)

    for category in exp["category"].unique():
        cat_data = exp[exp["category"] == category]
        amount = float(cat_data["amount"].sum())
        percentage = (amount / total_expenses * 100) if total_expenses > 0 else 0
        count = len(cat_data)
        avg_transaction = amount / count if count > 0 else 0
        
        # MoM Trend calculation
        curr_amt = float(curr_cat_totals.get(category, 0))
        prev_amt = float(prev_cat_totals.get(category, 0))
        
        import math
        trend = 0.0
        if prev_amt > 0:
            trend = ((curr_amt - prev_amt) / prev_amt) * 100
        elif curr_amt > 0 and prev_month in all_months:
            trend = 100.0
        
        # Ensure it's never a non-finite number
        if not math.isfinite(trend):
            trend = 0.0
        
        category_breakdown[category] = {
            "amount": round(amount, 2),
            "percentage": round(percentage, 2),
            "transaction_count": count,
            "average_transaction": round(avg_transaction, 2),
            "trend": round(trend, 1)
        }
    
    # Sort by amount descending
    return dict(sorted(category_breakdown.items(), key=lambda x: x[1]["amount"], reverse=True))


def get_income_breakdown(transactions: list[Any]) -> dict:
    """
    Get detailed category-wise income breakdown.
    """
    if not transactions:
        return {}
    
    df = _to_df(transactions)
    inc = df[df["type"] == "income"]
    
    if inc.empty:
        return {}
    
    total_income = inc["amount"].sum()
    category_breakdown = {}
    
    for category in inc["category"].unique():
        cat_data = inc[inc["category"] == category]
        amount = float(cat_data["amount"].sum())
        percentage = (amount / total_income * 100) if total_income > 0 else 0
        count = len(cat_data)
        avg_transaction = amount / count if count > 0 else 0
        
        category_breakdown[category] = {
            "amount": round(amount, 2),
            "percentage": round(percentage, 2),
            "transaction_count": count,
            "average_transaction": round(avg_transaction, 2),
            "trend": 0.0  # Income trend not implemented yet
        }
    
    return dict(sorted(category_breakdown.items(), key=lambda x: x[1]["amount"], reverse=True))


# ─────────────────────────────────────────────────────────────────────────────
# Profitability Ratios & Health Metrics
# ─────────────────────────────────────────────────────────────────────────────

def compute_profitability_metrics(transactions: list[Any]) -> dict:
    """
    Compute detailed profitability metrics:
    - Profit margin
    - Operating ratio
    - Return metrics
    """
    if not transactions:
        return {
            "gross_margin": 0,
            "operating_ratio": 100,
            "net_margin": 0,
            "expense_ratio": 0,
        }
    
    df = _to_df(transactions)
    total_income = float(df[df["type"] == "income"]["amount"].sum())
    total_expenses = float(df[df["type"] == "expense"]["amount"].sum())
    net_profit = total_income - total_expenses
    
    # Prevent division by zero
    if total_income == 0:
        return {
            "gross_margin": 0,
            "operating_ratio": 100,
            "net_margin": 0,
            "expense_ratio": 100,
        }
    
    gross_margin = 0
    operating_ratio = 100
    net_margin = 0
    expense_ratio = 100

    if total_income > 0:
        # Define typical Cost of Goods Sold (COGS) vs Operating Expenses (OPEX)
        cogs_categories = ["inventory", "materials", "freelancers", "contractors", "equipment", "software", "production", "direct costs"]
        
        # Calculate exactly how much is COGS
        expenses_df = df[df["type"] == "expense"]
        cogs = float(expenses_df[expenses_df["category"].str.lower().isin(cogs_categories)]["amount"].sum())
        
        # OPEX is everything else
        opex = total_expenses - cogs
        
        gross_profit = total_income - cogs
        
        gross_margin = (gross_profit / total_income) * 100
        net_margin = (net_profit / total_income) * 100
        
        operating_ratio = (opex / total_income) * 100
        expense_ratio = (total_expenses / total_income) * 100
    
    return {
        "gross_margin": round(gross_margin, 2),
        "operating_ratio": round(operating_ratio, 2),
        "net_margin": round(net_margin, 2),
        "expense_ratio": round(expense_ratio, 2),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Legacy Compatibility
# ─────────────────────────────────────────────────────────────────────────────

def get_monthly_trend(transactions: list[Any]) -> list[dict]:
    """Legacy: Get monthly income and expense trend."""
    return get_monthly_pnl(transactions)
