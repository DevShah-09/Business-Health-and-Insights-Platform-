"""
reports_engine.py — Automated report generation with insights and recommendations
Generates weekly/monthly summaries with trend analysis and business recommendations
"""
from datetime import datetime, timedelta
from typing import Any
from enum import Enum
import json
import pandas as pd


class ReportType(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"


class GeneratedReport:
    def __init__(
        self,
        report_type: ReportType,
        business_name: str,
        period_start: datetime,
        period_end: datetime,
        summary: dict,
        previous_period: dict = None
    ):
        self.report_type = report_type
        self.business_name = business_name
        self.period_start = period_start
        self.period_end = period_end
        self.summary = summary
        self.previous_period = previous_period or {}
        self.generated_at = datetime.utcnow()
    
    def to_dict(self) -> dict:
        return {
            "type": self.report_type.value,
            "business_name": self.business_name,
            "period": {
                "start": self.period_start.isoformat(),
                "end": self.period_end.isoformat(),
            },
            "generated_at": self.generated_at.isoformat(),
            "summary": self._build_summary_section(),
            "trends": self._build_trends_section(),
            "recommendations": self._build_recommendations(),
            "alerts": self._build_alerts_section(),
            "email_content": self._build_email_content(),
            "whatsapp_message": self._build_whatsapp_message(),
        }
    
    def _build_summary_section(self) -> dict:
        """Build executive summary."""
        total_income = self.summary.get("total_income", 0)
        total_expenses = self.summary.get("total_expenses", 0)
        net_profit = self.summary.get("net_profit", 0)
        profit_margin = self.summary.get("profit_margin", 0)
        
        # Compare with previous period
        prev_income = self.previous_period.get("total_income", 0)
        prev_expenses = self.previous_period.get("total_expenses", 0)
        prev_profit = self.previous_period.get("net_profit", 0)
        
        revenue_trend = "↑" if total_income > prev_income else "↓" if total_income < prev_income else "→"
        expense_trend = "↓" if total_expenses < prev_expenses else "↑" if total_expenses > prev_expenses else "→"
        profit_trend = "↑" if net_profit > prev_profit else "↓" if net_profit < prev_profit else "→"
        
        return {
            "total_revenue": round(total_income, 2),
            "revenue_trend": revenue_trend,
            "total_expenses": round(total_expenses, 2),
            "expense_trend": expense_trend,
            "net_profit": round(net_profit, 2),
            "profit_trend": profit_trend,
            "profit_margin": round(profit_margin, 2),
            "status": "Healthy ✓" if profit_margin > 20 else "Monitor ⚠" if profit_margin > 0 else "Critical ✗",
        }
    
    def _build_trends_section(self) -> dict:
        """Build trend analysis."""
        total_income = self.summary.get("total_income", 0)
        total_expenses = self.summary.get("total_expenses", 0)
        net_profit = self.summary.get("net_profit", 0)
        
        prev_income = self.previous_period.get("total_income", 1)
        prev_expenses = self.previous_period.get("total_expenses", 1)
        prev_profit = self.previous_period.get("net_profit", 1)
        
        revenue_change_pct = ((total_income - prev_income) / prev_income * 100) if prev_income > 0 else 0
        expense_change_pct = ((total_expenses - prev_expenses) / prev_expenses * 100) if prev_expenses > 0 else 0
        profit_change_pct = ((net_profit - prev_profit) / abs(prev_profit) * 100) if prev_profit != 0 else 0
        
        top_categories = self.summary.get("top_expense_categories", {})
        top_exp_str = ", ".join([f"{cat}: ${amt:,.0f}" for cat, amt in list(top_categories.items())[:3]])
        
        return {
            "revenue_change_pct": round(revenue_change_pct, 2),
            "expense_change_pct": round(expense_change_pct, 2),
            "profit_change_pct": round(profit_change_pct, 2),
            "top_expense_categories": top_exp_str or "No expense data",
            "analysis": f"Revenue {('increased' if revenue_change_pct > 0 else 'decreased' if revenue_change_pct < 0 else 'remained stable')} by {abs(revenue_change_pct):.1f}%. "
                       f"Expenses {('decreased' if expense_change_pct < 0 else 'increased' if expense_change_pct > 0 else 'remained stable')} by {abs(expense_change_pct):.1f}%."
        }
    
    def _build_recommendations(self) -> list[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        net_profit = self.summary.get("net_profit", 0)
        profit_margin = self.summary.get("profit_margin", 0)
        total_income = self.summary.get("total_income", 1)
        total_expenses = self.summary.get("total_expenses", 0)
        
        # Profitability recommendations
        if profit_margin < 0:
            recommendations.append("🔴 URGENT: Operating at a loss. Conduct immediate cost review and boost revenue.")
        elif profit_margin < 10:
            recommendations.append("⚠️ Low profit margin (<10%). Review pricing and reduce non-essential expenses.")
        elif profit_margin > 30:
            recommendations.append("✓ Strong profitability. Consider reinvesting in growth or R&D.")
        
        # Expense recommendations
        if total_expenses / total_income > 0.8:
            recommendations.append("⚠️ Expenses are >80% of revenue. Optimize cost structure.")
        
        # Growth recommendations
        prev_income = self.previous_period.get("total_income", 1)
        if total_income < prev_income:
            recommendations.append("📉 Revenue declined vs previous period. Investigate declining channels.")
        else:
            recommendations.append("📈 Continue current revenue-generating strategies.")
        
        # Cash flow recommendations
        top_categories = self.summary.get("top_expense_categories", {})
        if top_categories:
            highest_cat = list(top_categories.items())[0]
            recommendations.append(f"💰 Monitor {highest_cat[0]} costs (${highest_cat[1]:,.0f}) — your largest expense.")
        
        if not recommendations:
            recommendations.append("✓ Business metrics are stable. Maintain current performance.")
        
        return recommendations
    
    def _build_alerts_section(self) -> list[dict]:
        """Build alert summary."""
        alerts = []
        
        if self.summary.get("profit_margin", 0) < 0:
            alerts.append({
                "severity": "critical",
                "title": "Operating at a loss",
                "message": f"Net loss of ${abs(self.summary.get('net_profit', 0)):,.2f}"
            })
        
        if self.summary.get("total_expenses", 0) > self.summary.get("total_income", 0):
            alerts.append({
                "severity": "critical",
                "title": "Expenses exceed income",
                "message": "Immediate action required to restore profitability"
            })
        
        if self.summary.get("profit_margin", 0) < 10:
            alerts.append({
                "severity": "warning",
                "title": "Low profit margin",
                "message": f"Only {self.summary.get('profit_margin', 0):.1f}% profit margin detected"
            })
        
        return alerts
    
    def _build_email_content(self) -> str:
        """Generate email-ready report."""
        summary = self._build_summary_section()
        trends = self._build_trends_section()
        recommendations = self._build_recommendations()
        
        email = f"""
<h2>{self.business_name} - {self.report_type.value.upper()} REPORT</h2>
<p>Period: {self.period_start.strftime('%B %d, %Y')} - {self.period_end.strftime('%B %d, %Y')}</p>

<h3>📊 Financial Summary</h3>
<ul>
  <li><strong>Revenue:</strong> ${summary['total_revenue']:,.2f} {summary['revenue_trend']}</li>
  <li><strong>Expenses:</strong> ${summary['total_expenses']:,.2f} {summary['expense_trend']}</li>
  <li><strong>Net Profit:</strong> ${summary['net_profit']:,.2f} {summary['profit_trend']}</li>
  <li><strong>Status:</strong> {summary['status']}</li>
</ul>

<h3>📈 Trends</h3>
<p>{trends['analysis']}</p>
<p>Revenue Change: {trends['revenue_change_pct']:+.1f}% | Expense Change: {trends['expense_change_pct']:+.1f}%</p>

<h3>💡 Recommendations</h3>
<ul>
{"".join([f"<li>{rec}</li>" for rec in recommendations])}
</ul>
"""
        return email
    
    def _build_whatsapp_message(self) -> str:
        """Generate WhatsApp-ready message."""
        summary = self._build_summary_section()
        
        msg = f"""
*{self.business_name} {self.report_type.value.upper()} Report*

📊 Financial Summary:
Revenue: ${summary['total_revenue']:,.0f} {summary['revenue_trend']}
Expenses: ${summary['total_expenses']:,.0f} {summary['expense_trend']}
Profit: ${summary['net_profit']:,.0f} {summary['profit_trend']}
Status: {summary['status']}

✓ Recommendations:
• Monitor expenses closely
• Continue revenue growth efforts
• Review top cost categories

Full report available in app.
"""
        return msg.strip()


def generate_weekly_report(business_name: str, current_summary: dict, previous_summary: dict = None) -> GeneratedReport:
    """Generate weekly business report."""
    now = datetime.utcnow()
    period_start = now - timedelta(days=7)
    period_end = now
    
    return GeneratedReport(
        ReportType.WEEKLY,
        business_name,
        period_start,
        period_end,
        current_summary,
        previous_summary
    )


def generate_monthly_report(business_name: str, current_summary: dict, previous_summary: dict = None) -> GeneratedReport:
    """Generate monthly business report."""
    now = datetime.utcnow()
    first_day = now.replace(day=1)
    period_start = first_day - timedelta(days=1)
    period_end = now
    
    return GeneratedReport(
        ReportType.MONTHLY,
        business_name,
        period_start,
        period_end,
        current_summary,
        previous_summary
    )


def generate_quarterly_report(business_name: str, current_summary: dict, previous_summary: dict = None) -> GeneratedReport:
    """Generate quarterly business report."""
    now = datetime.utcnow()
    quarter = (now.month - 1) // 3
    first_month_of_quarter = quarter * 3 + 1
    period_start = now.replace(month=first_month_of_quarter, day=1)
    period_end = now
    
    return GeneratedReport(
        ReportType.QUARTERLY,
        business_name,
        period_start,
        period_end,
        current_summary,
        previous_summary
    )
