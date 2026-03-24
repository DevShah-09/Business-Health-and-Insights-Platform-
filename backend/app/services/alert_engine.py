"""
alert_engine.py — Real-time alert detection for financial anomalies
Detects: Expense spikes, Revenue drops, Negative cash flow
"""
from datetime import datetime, timedelta
from typing import Any
import pandas as pd
from enum import Enum

class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class Alert:
    def __init__(self, alert_id: int, title: str, message: str, severity: AlertSeverity, timestamp: datetime = None):
        self.id = alert_id
        self.title = title
        self.message = message
        self.severity = severity
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "severity": self.severity.value,
            "timestamp": self.timestamp.isoformat()
        }


def _to_df(transactions: list[Any]) -> pd.DataFrame:
    """Convert transaction list to pandas DataFrame."""
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


def detect_expense_spike(transactions: list[Any], threshold_pct: float = 30.0) -> list[Alert]:
    """
    Detect if expenses spiked unexpectedly.
    
    Args:
        transactions: List of transaction objects
        threshold_pct: Percentage increase to trigger alert (default 30%)
    
    Returns:
        List of Alert objects for expense spikes
    """
    if not transactions:
        return []
    
    alerts = []
    df = _to_df(transactions)
    
    # Filter expenses only
    expenses = df[df["type"] == "expense"].copy()
    if expenses.empty:
        return []
    
    # Group by month
    expenses["month"] = expenses["transaction_date"].dt.to_period("M")
    monthly_expenses = expenses.groupby("month")["amount"].sum()
    
    if len(monthly_expenses) < 2:
        return []
    
    # Compare last month to previous average
    last_month = monthly_expenses.iloc[-1]
    prev_avg = monthly_expenses.iloc[:-1].mean()
    
    if prev_avg > 0:
        pct_change = ((last_month - prev_avg) / prev_avg) * 100
        
        if pct_change > threshold_pct:
            message = f"Expenses increased {pct_change:.1f}% last month (₹{last_month:,.2f}) vs average of ₹{prev_avg:,.2f}. Review high-cost categories."
            alerts.append(Alert(
                alert_id=1,
                title="Expense Spike Detected",
                message=message,
                severity=AlertSeverity.WARNING if pct_change < 50 else AlertSeverity.CRITICAL
            ))
    
    return alerts


def detect_revenue_drop(transactions: list[Any], threshold_pct: float = 20.0) -> list[Alert]:
    """
    Detect if revenue dropped unexpectedly.
    
    Args:
        transactions: List of transaction objects
        threshold_pct: Percentage decrease to trigger alert (default 20%)
    
    Returns:
        List of Alert objects for revenue drops
    """
    if not transactions:
        return []
    
    alerts = []
    df = _to_df(transactions)
    
    # Filter income only
    income = df[df["type"] == "income"].copy()
    if income.empty:
        return []
    
    # Group by month
    income["month"] = income["transaction_date"].dt.to_period("M")
    monthly_income = income.groupby("month")["amount"].sum()
    
    if len(monthly_income) < 2:
        return []
    
    # Compare last month to previous average
    last_month = monthly_income.iloc[-1]
    prev_avg = monthly_income.iloc[:-1].mean()
    
    if prev_avg > 0:
        pct_change = ((last_month - prev_avg) / prev_avg) * 100
        
        if pct_change < -threshold_pct:
            message = f"Revenue declined {abs(pct_change):.1f}% last month (₹{last_month:,.2f}) vs average of ₹{prev_avg:,.2f}. Investigate sales channels."
            alerts.append(Alert(
                alert_id=2,
                title="Revenue Drop Detected",
                message=message,
                severity=AlertSeverity.WARNING if abs(pct_change) < 40 else AlertSeverity.CRITICAL
            ))
    
    return alerts


def detect_negative_cashflow(transactions: list[Any], days_window: int = 30) -> list[Alert]:
    """
    Detect if cash flow is negative or trending negative.
    
    Args:
        transactions: List of transaction objects
        days_window: Number of days to analyze (default 30)
    
    Returns:
        List of Alert objects for negative cash flow
    """
    if not transactions:
        return []
    
    alerts = []
    df = _to_df(transactions)
    
    if df.empty:
        return []
    
    # Get transactions from last N days
    cutoff_date = df["transaction_date"].max() - timedelta(days=days_window)
    recent = df[df["transaction_date"] >= cutoff_date].copy()
    
    if recent.empty:
        return []
    
    # Calculate net cash flow
    income = float(recent[recent["type"] == "income"]["amount"].sum())
    expenses = float(recent[recent["type"] == "expense"]["amount"].sum())
    net_flow = income - expenses
    
    if net_flow < 0:
        message = f"Negative cash flow in last {days_window} days! Income: ₹{income:,.2f}, Expenses: ₹{expenses:,.2f}, Net: ₹{net_flow:,.2f}."
        alerts.append(Alert(
            alert_id=3,
            title="Negative Cash Flow Alert",
            message=message,
            severity=AlertSeverity.CRITICAL
        ))
    elif net_flow < expenses * 0.1:  # Less than 10% of expenses
        message = f"Cash flow is tight (₹{net_flow:,.2f}). Income barely covers expenses. Preserve cash."
        alerts.append(Alert(
            alert_id=4,
            title="Low Cash Margin",
            message=message,
            severity=AlertSeverity.WARNING
        ))
    
    return alerts


def detect_high_expense_ratio(transactions: list[Any], threshold_pct: float = 75.0) -> list[Alert]:
    """
    Detect if expenses are too high relative to income.
    
    Args:
        transactions: List of transaction objects
        threshold_pct: Expense-to-income ratio threshold (default 75%)
    
    Returns:
        List of Alert objects for high expense ratios
    """
    if not transactions:
        return []
    
    alerts = []
    df = _to_df(transactions)
    
    income = float(df[df["type"] == "income"]["amount"].sum())
    expenses = float(df[df["type"] == "expense"]["amount"].sum())
    
    if income > 0:
        ratio = (expenses / income) * 100
        
        if ratio > threshold_pct:
            message = f"Expenses are {ratio:.1f}% of income. Target should be below {threshold_pct}%. Review cost structure."
            alerts.append(Alert(
                alert_id=5,
                title="High Expense Ratio",
                message=message,
                severity=AlertSeverity.WARNING
            ))
    
    return alerts


def detect_all_alerts(transactions: list[Any]) -> list[Alert]:
    """
    Run all alert detection algorithms and return consolidated list.
    
    Args:
        transactions: List of transaction objects
    
    Returns:
        Consolidated list of all detected alerts
    """
    all_alerts = []
    
    # Run all detectors
    all_alerts.extend(detect_expense_spike(transactions))
    all_alerts.extend(detect_revenue_drop(transactions))
    all_alerts.extend(detect_negative_cashflow(transactions))
    all_alerts.extend(detect_high_expense_ratio(transactions))
    
    # Remove duplicates and sort by severity
    seen = set()
    unique_alerts = []
    for alert in all_alerts:
        if alert.title not in seen:
            seen.add(alert.title)
            unique_alerts.append(alert)
    
    # Sort: Critical first, then Warning, then Info
    severity_order = {AlertSeverity.CRITICAL: 0, AlertSeverity.WARNING: 1, AlertSeverity.INFO: 2}
    unique_alerts.sort(key=lambda a: severity_order[a.severity])
    
    return unique_alerts
