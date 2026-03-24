"""
scenario_engine.py — What-if scenario simulation for financial impact analysis
Supports: Revenue changes, expense changes, and combined scenarios
"""
from typing import Any
from app.schemas.schemas import FinancialSummary


class ScenarioResult:
    def __init__(self, scenario_name: str, base_financials: dict, adjusted_financials: dict):
        self.scenario_name = scenario_name
        self.base = base_financials
        self.adjusted = adjusted_financials
        self.changes = self._calculate_changes()
    
    def _calculate_changes(self) -> dict:
        """Calculate impact metrics."""
        return {
            "revenue_change": self.adjusted.get("total_income", 0) - self.base.get("total_income", 0),
            "revenue_change_pct": ((self.adjusted.get("total_income", 0) - self.base.get("total_income", 0)) / max(self.base.get("total_income", 1), 1)) * 100,
            "expense_change": self.adjusted.get("total_expenses", 0) - self.base.get("total_expenses", 0),
            "expense_change_pct": ((self.adjusted.get("total_expenses", 0) - self.base.get("total_expenses", 0)) / max(self.base.get("total_expenses", 1), 1)) * 100,
            "profit_change": self.adjusted.get("net_profit", 0) - self.base.get("net_profit", 0),
            "profit_change_pct": ((self.adjusted.get("net_profit", 0) - self.base.get("net_profit", 0)) / max(abs(self.base.get("net_profit", 1)), 1)) * 100,
            "profit_margin_change": self.adjusted.get("profit_margin", 0) - self.base.get("profit_margin", 0),
        }
    
    def to_dict(self) -> dict:
        return {
            "scenario": self.scenario_name,
            "base": self.base,
            "adjusted": self.adjusted,
            "impact": {
                "revenue_impact": round(self.changes["revenue_change"], 2),
                "revenue_impact_pct": round(self.changes["revenue_change_pct"], 2),
                "expense_impact": round(self.changes["expense_change"], 2),
                "expense_impact_pct": round(self.changes["expense_change_pct"], 2),
                "profit_impact": round(self.changes["profit_change"], 2),
                "profit_impact_pct": round(self.changes["profit_change_pct"], 2),
                "profit_margin_impact": round(self.changes["profit_margin_change"], 2),
            },
            "analysis": self._generate_analysis()
        }
    
    def _generate_analysis(self) -> str:
        """Generate human-readable scenario analysis."""
        profit_impact = self.changes["profit_change"]
        revenue_impact = self.changes["revenue_change"]
        expense_impact = self.changes["expense_change"]
        
        analysis = f"Scenario: {self.scenario_name}\n"
        
        if revenue_impact != 0:
            direction = "increases" if revenue_impact > 0 else "decreases"
            analysis += f"Revenue {direction} by ${abs(revenue_impact):,.2f} ({self.changes['revenue_change_pct']:.1f}%)\n"
        
        if expense_impact != 0:
            direction = "decrease" if expense_impact < 0 else "increase"
            analysis += f"Expenses {direction} by ${abs(expense_impact):,.2f} ({abs(self.changes['expense_change_pct']):.1f}%)\n"
        
        if profit_impact > 0:
            analysis += f"✓ Profit IMPROVES by ${profit_impact:,.2f}\n"
        elif profit_impact < 0:
            analysis += f"✗ Profit WORSENS by ${abs(profit_impact):,.2f}\n"
        
        # Status of new profit
        new_profit = self.adjusted.get("net_profit", 0)
        if new_profit > 0:
            analysis += f"Result: Profitable (${new_profit:,.2f} net profit, {self.adjusted.get('profit_margin', 0):.1f}% margin)"
        else:
            analysis += f"Result: LOSS of ${abs(new_profit):,.2f}"
        
        return analysis


def simulate_revenue_change(base_financials: dict, change_pct: float, scenario_name: str = None) -> ScenarioResult:
    """
    Simulate impact of revenue change.
    
    Args:
        base_financials: Current financial metrics (dict)
        change_pct: Percentage change in revenue (e.g., -20 for 20% drop, +30 for 30% increase)
        scenario_name: Custom scenario name
    
    Returns:
        ScenarioResult with impact analysis
    """
    
    scenario_name = scenario_name or f"Revenue {change_pct:+.0f}%"
    
    base_income = base_financials.get("total_income", 0)
    base_expenses = base_financials.get("total_expenses", 0)
    base_profit = base_financials.get("net_profit", 0)
    
    # Calculate new revenue
    multiplier = 1 + (change_pct / 100)
    new_income = base_income * multiplier
    new_profit = new_income - base_expenses
    new_margin = (new_profit / new_income * 100) if new_income > 0 else 0
    
    adjusted = {
        "total_income": round(new_income, 2),
        "total_expenses": round(base_expenses, 2),
        "net_profit": round(new_profit, 2),
        "profit_margin": round(new_margin, 2),
        "avg_monthly_income": round((base_financials.get("avg_monthly_income", 0) * multiplier), 2),
    }
    
    return ScenarioResult(scenario_name, base_financials, adjusted)


def simulate_expense_change(base_financials: dict, change_pct: float, scenario_name: str = None) -> ScenarioResult:
    """
    Simulate impact of expense change.
    
    Args:
        base_financials: Current financial metrics (dict)
        change_pct: Percentage change in expenses (e.g., -15 for 15% reduction, +25 for 25% increase)
        scenario_name: Custom scenario name
    
    Returns:
        ScenarioResult with impact analysis
    """
    
    scenario_name = scenario_name or f"Expenses {change_pct:+.0f}%"
    
    base_income = base_financials.get("total_income", 0)
    base_expenses = base_financials.get("total_expenses", 0)
    base_profit = base_financials.get("net_profit", 0)
    
    # Calculate new expenses
    multiplier = 1 + (change_pct / 100)
    new_expenses = base_expenses * multiplier
    new_profit = base_income - new_expenses
    new_margin = (new_profit / base_income * 100) if base_income > 0 else 0
    
    adjusted = {
        "total_income": round(base_income, 2),
        "total_expenses": round(new_expenses, 2),
        "net_profit": round(new_profit, 2),
        "profit_margin": round(new_margin, 2),
        "avg_monthly_expenses": round((base_financials.get("avg_monthly_expenses", 0) * multiplier), 2),
    }
    
    return ScenarioResult(scenario_name, base_financials, adjusted)


def simulate_combined_scenario(
    base_financials: dict,
    revenue_change_pct: float = 0,
    expense_change_pct: float = 0,
    scenario_name: str = None
) -> ScenarioResult:
    """
    Simulate combined revenue and expense changes.
    
    Args:
        base_financials: Current financial metrics (dict)
        revenue_change_pct: Percentage change in revenue
        expense_change_pct: Percentage change in expenses
        scenario_name: Custom scenario name
    
    Returns:
        ScenarioResult with impact analysis
    """
    
    if not scenario_name:
        scenario_name = f"Revenue {revenue_change_pct:+.0f}% + Expenses {expense_change_pct:+.0f}%"
    
    base_income = base_financials.get("total_income", 0)
    base_expenses = base_financials.get("total_expenses", 0)
    
    # Calculate new values
    revenue_multiplier = 1 + (revenue_change_pct / 100)
    expense_multiplier = 1 + (expense_change_pct / 100)
    
    new_income = base_income * revenue_multiplier
    new_expenses = base_expenses * expense_multiplier
    new_profit = new_income - new_expenses
    new_margin = (new_profit / new_income * 100) if new_income > 0 else 0
    
    adjusted = {
        "total_income": round(new_income, 2),
        "total_expenses": round(new_expenses, 2),
        "net_profit": round(new_profit, 2),
        "profit_margin": round(new_margin, 2),
        "avg_monthly_income": round((base_financials.get("avg_monthly_income", 0) * revenue_multiplier), 2),
        "avg_monthly_expenses": round((base_financials.get("avg_monthly_expenses", 0) * expense_multiplier), 2),
    }
    
    return ScenarioResult(scenario_name, base_financials, adjusted)


def generate_scenario_batch(base_financials: dict) -> dict:
    """
    Generate common scenario simulations.
    
    Args:
        base_financials: Current financial metrics
    
    Returns:
        Dictionary with multiple scenario results
    """
    
    scenarios = {
        "revenue_drop_20": simulate_revenue_change(base_financials, -20, "Revenue Drop 20%"),
        "revenue_growth_15": simulate_revenue_change(base_financials, 15, "Revenue Growth 15%"),
        "expense_cut_10": simulate_expense_change(base_financials, -10, "Cut Expenses 10%"),
        "expense_increase_15": simulate_expense_change(base_financials, 15, "Rent Increase 15%"),
        "worst_case": simulate_combined_scenario(base_financials, -20, 15, "Worst Case: Revenue ↓20% + Expenses ↑15%"),
        "best_case": simulate_combined_scenario(base_financials, 20, -10, "Best Case: Revenue ↑20% + Expenses ↓10%"),
    }
    
    return {
        "scenarios": {name: result.to_dict() for name, result in scenarios.items()},
        "base_metrics": base_financials
    }
