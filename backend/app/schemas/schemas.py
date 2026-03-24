import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ── User ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=8)

class UserRead(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Business ──────────────────────────────────────────────────────────────────
class BusinessCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    description: Optional[str] = None
    currency: str = "USD"

class BusinessRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    industry: Optional[str]
    description: Optional[str]
    currency: str
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Transaction ───────────────────────────────────────────────────────────────
class TransactionCreate(BaseModel):
    type: str  # "income" | "expense"
    amount: Decimal = Field(gt=0)
    category: str
    description: Optional[str] = None
    transaction_date: date
    status: Optional[str] = "completed"  # "pending" | "completed"

class TransactionRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    type: str
    amount: Decimal
    category: str
    description: Optional[str]
    transaction_date: date
    status: str
    source: str
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Report ────────────────────────────────────────────────────────────────────
class ReportRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    title: str
    report_type: str
    summary: Optional[str]
    data: Optional[dict]
    ai_narrative: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Analytics Response Models ─────────────────────────────────────────────────
class FinancialSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_profit: float
    profit_margin: float
    avg_monthly_income: float
    avg_monthly_expenses: float
    top_expense_categories: dict[str, float]
    top_income_categories: dict[str, float]
    period_start: Optional[date]
    period_end: Optional[date]

class ForecastPoint(BaseModel):
    date: str
    predicted_income: float
    predicted_expenses: float
    confidence_lower: float
    confidence_upper: float

class AnomalyRecord(BaseModel):
    transaction_id: uuid.UUID
    transaction_date: date
    amount: float
    category: str
    type: str
    z_score: float
    reason: str

class AIInsightResponse(BaseModel):
    narrative: str
    recommendations: list[str]
    health_score: int
    risk_flags: list[str]


# ── Ingestion & Parsing Response Models ───────────────────────────────────────
class UploadResponse(BaseModel):
    """Response after file upload and transaction ingestion."""
    inserted: int
    skipped: int
    errors: Optional[list[str]] = None
    source: str
    summary: Optional[str] = None

class BulkIngestionResponse(BaseModel):
    """Response from bulk transaction ingestion."""
    total_processed: int
    successful: int
    failed: int
    errors: Optional[list[str]] = None

class InvoiceExtractionResponse(BaseModel):
    """Response from invoice/PDF extraction."""
    vendor: Optional[str]
    amount: Optional[Decimal]
    invoice_date: Optional[date]
    invoice_number: Optional[str]
    description: Optional[str]
    extracted_text: Optional[str] = None

class TransactionCategorization(BaseModel):
    """Transaction with auto-categorization."""
    id: uuid.UUID
    category: str
    confidence: Optional[float] = None
    alternative_categories: Optional[list[str]] = None


# ── Period-Based P&L Models ───────────────────────────────────────────────────
class PeriodPnL(BaseModel):
    """Period-based Profit & Loss statement."""
    period: str  # date, week, or month
    income: float
    expenses: float
    profit_loss: float
    profit_margin: float

class DailyPnL(BaseModel):
    """Daily P&L."""
    date: str
    income: float
    expenses: float
    profit_loss: float
    profit_margin: float

class WeeklyPnL(BaseModel):
    """Weekly P&L."""
    week: str
    income: float
    expenses: float
    profit_loss: float
    profit_margin: float

class MonthlyPnL(BaseModel):
    """Monthly P&L."""
    month: str
    income: float
    expenses: float
    profit_loss: float
    profit_margin: float


# ── Cash Flow Models ──────────────────────────────────────────────────────────
class CashFlow(BaseModel):
    """Cash flow summary."""
    total_inflow: float
    total_outflow: float
    net_cash_flow: float
    avg_daily_flow: float
    working_capital: float

class CashFlowTrendItem(BaseModel):
    """Single point in cash flow trend."""
    date: str
    inflow: float
    outflow: float
    cumulative_balance: float
    transaction_type: str
    category: str

class NegativeCashFlowPeriod(BaseModel):
    """Period with negative cash flow."""
    period: str  # date, week, or month
    income: float
    expenses: float
    profit_loss: float
    profit_margin: float

class BurnRate(BaseModel):
    """Cash burn rate metrics."""
    daily_burn_rate: float
    monthly_burn_rate: float
    period_days: int


# ── Expense/Income Breakdown Models ───────────────────────────────────────────
class CategoryBreakdownItem(BaseModel):
    """Category-wise breakdown of expenses/income."""
    amount: float
    percentage: float
    transaction_count: int
    average_transaction: float

class ExpenseBreakdown(BaseModel):
    """Complete expense breakdown by category."""
    categories: dict[str, CategoryBreakdownItem]

class IncomeBreakdown(BaseModel):
    """Complete income breakdown by category."""
    categories: dict[str, CategoryBreakdownItem]


# ── Profitability Metrics ─────────────────────────────────────────────────────
class ProfitabilityMetrics(BaseModel):
    """Detailed profitability metrics and ratios."""
    gross_margin: float  # %
    operating_ratio: float  # %
    net_margin: float  # %
    expense_ratio: float  # %


# ── Comprehensive Financial Report ────────────────────────────────────────────
class ComprehensiveFinancialReport(BaseModel):
    """Complete financial analysis report."""
    summary: FinancialSummary
    profitability: ProfitabilityMetrics
    cash_flow: CashFlow
    burn_rate: BurnRate
    monthly_pnl: list[MonthlyPnL]
    negative_cash_flow_periods: list[NegativeCashFlowPeriod]
    expense_breakdown: dict[str, CategoryBreakdownItem]
    income_breakdown: dict[str, CategoryBreakdownItem]
