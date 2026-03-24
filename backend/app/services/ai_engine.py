"""
AI Engine Service — generates business insights and recommendations
(Stub implementation - ready for OpenAI integration)
"""
from datetime import datetime


def generate_business_insights(business_data: dict) -> dict:
    """
    Generate AI-powered business insights from financial data.
    
    Args:
        business_data: Dictionary containing business metrics and transactions
        
    Returns:
        Dictionary with narrative, recommendations, health score, and risk flags
    """
    
    # Extract summary metrics
    summary = business_data.get("summary", {})
    total_income = summary.get("total_income", 0)
    total_expenses = summary.get("total_expenses", 0)
    net_profit = summary.get("net_profit", 0)
    profit_margin = summary.get("profit_margin", 0)
    
    # Generate insights narrative
    insights = []
    recommendations = []
    health_score = 75  # Default health score (0-100)
    risk_flags = []
    
    # Profit & Loss Insights
    if profit_margin > 0:
        insights.append(f"Your business is profitable with a {profit_margin:.1f}% profit margin.")
        if profit_margin > 30:
            insights.append("Strong profitability! Consider reinvesting in growth.")
            health_score = min(100, health_score + 10)
        elif profit_margin < 10:
            insights.append("Profit margin is tight. Review costs and pricing strategy.")
            health_score = max(0, health_score - 10)
            risk_flags.append("low_profit_margin")
    else:
        insights.append("Your business is currently operating at a loss.")
        health_score = max(0, health_score - 25)
        risk_flags.append("operating_at_loss")
        recommendations.append("Review expense categories and identify cost reduction opportunities.")
    
    # Cash Flow Insights
    cash_flow = business_data.get("cash_flow", {})
    total_inflow = cash_flow.get("total_inflow", 0)
    total_outflow = cash_flow.get("total_outflow", 0)
    
    if total_outflow > 0:
        expense_ratio = (total_outflow / total_inflow) * 100 if total_inflow > 0 else 0
        if expense_ratio > 70:
            risk_flags.append("high_expense_ratio")
            recommendations.append(f"Expenses are {expense_ratio:.1f}% of income. Focus on cost efficiency.")
    
    # Burn Rate Insights
    burn_rate = business_data.get("burn_rate", {})
    if burn_rate.get("runway_months"):
        runway = burn_rate.get("runway_months", 0)
        if runway < 6:
            risk_flags.append("low_runway")
            health_score = max(0, health_score - 15)
            recommendations.append(f"Runway is only {runway:.1f} months. Increase revenue or reduce expenses urgently.")
        elif runway > 12:
            insights.append(f"Healthy runway of {runway:.1f} months gives you time to scale.")
    
    # Revenue Insights
    if total_income > 0:
        insights.append(f"Total revenue from all sources: ${total_income:,.2f}")
        if total_income > total_expenses:
            recommendations.append("Maintain current revenue trends while monitoring expense growth.")
    
    # Default recommendations if none generated
    if not recommendations:
        recommendations = [
            "Continue monitoring cash flow regularly",
            "Review and categorize all transactions for better insights",
            "Set targets for revenue growth and expense reduction"
        ]
    
    return {
        "narrative": " ".join(insights) or "Business analysis in progress. Add more transactions for detailed insights.",
        "recommendations": recommendations,
        "health_score": health_score,
        "risk_flags": risk_flags,
        "generated_at": datetime.utcnow().isoformat()
    }
