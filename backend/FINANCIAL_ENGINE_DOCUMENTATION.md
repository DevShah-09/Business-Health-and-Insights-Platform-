# Financial Engine & Analysis APIs

## Overview

The Financial Engine provides comprehensive financial analysis including:
- ✅ Profit & Loss (daily/weekly/monthly)
- ✅ Profit margin and profitability metrics
- ✅ Cash flow tracking (inflow vs outflow)
- ✅ Negative cash flow detection
- ✅ Expense breakdown (category-wise)
- ✅ Income breakdown (category-wise)
- ✅ Burn rate calculations
- ✅ Comprehensive financial reports

---

## Base URL
```
http://localhost:8000/api/v1
```

---

## 1. OVERVIEW & SUMMARY ENDPOINTS

### Get Financial Summary
**GET** `/businesses/{business_id}/financials/summary`

Provides a quick overview of key financial metrics.

**Response (200 OK):**
```json
{
  "total_income": 150000.00,
  "total_expenses": 95000.00,
  "net_profit": 55000.00,
  "profit_margin": 36.67,
  "avg_monthly_income": 50000.00,
  "avg_monthly_expenses": 31666.67,
  "top_expense_categories": {
    "Services": 25000.00,
    "utilities": 15000.00,
    "food": 12500.00,
    "transportation": 8000.00,
    "entertainment": 5000.00
  },
  "top_income_categories": {
    "salary": 100000.00,
    "investment": 30000.00,
    "freelance": 20000.00
  },
  "period_start": "2024-01-15",
  "period_end": "2024-03-20"
}
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/summary"
```

---

### Get Comprehensive Financial Report
**GET** `/businesses/{business_id}/financials/report`

Get a complete financial analysis with all metrics in one request.

**Response (200 OK):**
```json
{
  "summary": {
    "total_income": 150000.00,
    "total_expenses": 95000.00,
    "net_profit": 55000.00,
    "profit_margin": 36.67,
    "avg_monthly_income": 50000.00,
    "avg_monthly_expenses": 31666.67,
    "top_expense_categories": {...},
    "top_income_categories": {...},
    "period_start": "2024-01-15",
    "period_end": "2024-03-20"
  },
  "profitability": {
    "gross_margin": 36.67,
    "operating_ratio": 63.33,
    "net_margin": 36.67,
    "expense_ratio": 63.33
  },
  "cash_flow": {
    "total_inflow": 150000.00,
    "total_outflow": 95000.00,
    "net_cash_flow": 55000.00,
    "working_capital": 55000.00
  },
  "burn_rate": {
    "daily_burn_rate": 3166.67,
    "monthly_burn_rate": 95000.00,
    "period_days": 30
  },
  "monthly_pnl": [
    {
      "month": "2024-01",
      "income": 50000.00,
      "expenses": 31000.00,
      "profit_loss": 19000.00,
      "profit_margin": 38.00
    },
    {
      "month": "2024-02",
      "income": 50000.00,
      "expenses": 32000.00,
      "profit_loss": 18000.00,
      "profit_margin": 36.00
    },
    {
      "month": "2024-03",
      "income": 50000.00,
      "expenses": 32000.00,
      "profit_loss": 18000.00,
      "profit_margin": 36.00
    }
  ],
  "negative_cash_flow_periods": [],
  "expense_breakdown": {...},
  "income_breakdown": {...}
}
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/report"
```

---

## 2. PERIOD-BASED P&L ENDPOINTS

### Daily P&L
**GET** `/businesses/{business_id}/financials/pnl/daily`

Get daily income, expenses, and profit/loss.

**Response (200 OK):**
```json
[
  {
    "date": "2024-03-15",
    "income": 5000.00,
    "expenses": 2500.00,
    "profit_loss": 2500.00,
    "profit_margin": 50.00
  },
  {
    "date": "2024-03-16",
    "income": 0.00,
    "expenses": 3000.00,
    "profit_loss": -3000.00,
    "profit_margin": -100.00
  },
  {
    "date": "2024-03-17",
    "income": 7500.00,
    "expenses": 1500.00,
    "profit_loss": 6000.00,
    "profit_margin": 80.00
  }
]
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/pnl/daily"
```

---

### Weekly P&L
**GET** `/businesses/{business_id}/financials/pnl/weekly`

Get weekly income, expenses, and profit/loss.

**Response (200 OK):**
```json
[
  {
    "week": "2024-W11",
    "income": 35000.00,
    "expenses": 21000.00,
    "profit_loss": 14000.00,
    "profit_margin": 40.00
  },
  {
    "week": "2024-W12",
    "income": 37500.00,
    "expenses": 22000.00,
    "profit_loss": 15500.00,
    "profit_margin": 41.33
  }
]
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/pnl/weekly"
```

---

### Monthly P&L
**GET** `/businesses/{business_id}/financials/pnl/monthly`

Get monthly income, expenses, and profit/loss.

**Response (200 OK):**
```json
[
  {
    "month": "2024-01",
    "income": 50000.00,
    "expenses": 31000.00,
    "profit_loss": 19000.00,
    "profit_margin": 38.00
  },
  {
    "month": "2024-02",
    "income": 50000.00,
    "expenses": 32000.00,
    "profit_loss": 18000.00,
    "profit_margin": 36.00
  },
  {
    "month": "2024-03",
    "income": 50000.00,
    "expenses": 32000.00,
    "profit_loss": 18000.00,
    "profit_margin": 36.00
  }
]
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/pnl/monthly"
```

---

### Monthly Trend (Legacy)
**GET** `/businesses/{business_id}/financials/trend`

Get monthly income/expense trend for visualization.

**Response (200 OK):**
```json
[
  {
    "month": "2024-01",
    "income": 50000.00,
    "expenses": 31000.00
  },
  {
    "month": "2024-02",
    "income": 50000.00,
    "expenses": 32000.00
  }
]
```

---

## 3. CASH FLOW ENDPOINTS

### Cash Flow Summary
**GET** `/businesses/{business_id}/financials/cash-flow`

Get overall cash flow metrics.

**Response (200 OK):**
```json
{
  "total_inflow": 150000.00,
  "total_outflow": 95000.00,
  "net_cash_flow": 55000.00,
  "working_capital": 55000.00
}
```

**Metrics:**
- **Total Inflow**: Total income (all income transactions)
- **Total Outflow**: Total expenses (all expense transactions)
- **Net Cash Flow**: Inflow - Outflow (net cash position)
- **Working Capital**: Available cash for operations

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/cash-flow"
```

---

### Cash Flow Trend
**GET** `/businesses/{business_id}/financials/cash-flow/trend`

Get cumulative cash flow over time (running balance).

**Response (200 OK):**
```json
[
  {
    "date": "2024-03-15",
    "inflow": 5000.00,
    "outflow": 2500.00,
    "cumulative_balance": 2500.00,
    "transaction_type": "income",
    "category": "salary"
  },
  {
    "date": "2024-03-16",
    "inflow": 0.00,
    "outflow": 3000.00,
    "cumulative_balance": -500.00,
    "transaction_type": "expense",
    "category": "Services"
  },
  {
    "date": "2024-03-17",
    "inflow": 7500.00,
    "outflow": 1500.00,
    "cumulative_balance": 5500.00,
    "transaction_type": "income",
    "category": "freelance"
  }
]
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/cash-flow/trend"
```

---

### Detect Negative Cash Flow
**GET** `/businesses/{business_id}/financials/negative-cash-flow`

Detect periods where expenses exceeded income.

**Query Parameters:**
- `period`: "daily", "weekly", or "monthly" (default: monthly)

**Response (200 OK):**
```json
[
  {
    "period": "2024-02-10",
    "income": 2000.00,
    "expenses": 3500.00,
    "profit_loss": -1500.00,
    "profit_margin": -75.00
  }
]
```

**cURL:**
```bash
# Monthly (default)
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/negative-cash-flow"

# Weekly
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/negative-cash-flow?period=weekly"

# Daily
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/negative-cash-flow?period=daily"
```

---

### Burn Rate
**GET** `/businesses/{business_id}/financials/burn-rate`

Calculate daily and monthly cash burn rate (expense rate).

**Query Parameters:**
- `days`: Look-back window in days (default: 30)

**Response (200 OK):**
```json
{
  "daily_burn_rate": 3166.67,
  "monthly_burn_rate": 95000.00,
  "period_days": 30
}
```

**Interpretation:**
- **Daily Burn Rate**: $3,166.67 per day
- **Monthly Burn Rate**: $95,000 per month (annualized: $1,140,000)
- **Period Days**: Calculated over 30 days

**cURL:**
```bash
# Last 30 days (default)
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/burn-rate"

# Last 90 days
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/burn-rate?days=90"
```

---

## 4. CATEGORY BREAKDOWN ENDPOINTS

### Expense Breakdown
**GET** `/businesses/{business_id}/financials/expense-breakdown`

Get category-wise expense analysis.

**Response (200 OK):**
```json
{
  "categories": {
    "Services": {
      "amount": 25000.00,
      "percentage": 26.32,
      "transaction_count": 5,
      "average_transaction": 5000.00
    },
    "utilities": {
      "amount": 15000.00,
      "percentage": 15.79,
      "transaction_count": 3,
      "average_transaction": 5000.00
    },
    "food": {
      "amount": 12500.00,
      "percentage": 13.16,
      "transaction_count": 25,
      "average_transaction": 500.00
    },
    "transportation": {
      "amount": 8000.00,
      "percentage": 8.42,
      "transaction_count": 16,
      "average_transaction": 500.00
    },
    "marketing": {
      "amount": 15000.00,
      "percentage": 15.79,
      "transaction_count": 3,
      "average_transaction": 5000.00
    },
    "entertainment": {
      "amount": 5000.00,
      "percentage": 5.26,
      "transaction_count": 10,
      "average_transaction": 500.00
    }
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/expense-breakdown"
```

---

### Income Breakdown
**GET** `/businesses/{business_id}/financials/income-breakdown`

Get category-wise income analysis.

**Response (200 OK):**
```json
{
  "categories": {
    "salary": {
      "amount": 100000.00,
      "percentage": 66.67,
      "transaction_count": 12,
      "average_transaction": 8333.33
    },
    "investment": {
      "amount": 30000.00,
      "percentage": 20.00,
      "transaction_count": 1,
      "average_transaction": 30000.00
    },
    "freelance": {
      "amount": 20000.00,
      "percentage": 13.33,
      "transaction_count": 4,
      "average_transaction": 5000.00
    }
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/income-breakdown"
```

---

## 5. PROFITABILITY METRICS

### Profitability Metrics
**GET** `/businesses/{business_id}/financials/profitability`

Get profitability ratios and margins.

**Response (200 OK):**
```json
{
  "gross_margin": 36.67,
  "operating_ratio": 63.33,
  "net_margin": 36.67,
  "expense_ratio": 63.33
}
```

**Metrics Explained:**

| Metric | Calculation | Interpretation |
|--------|-------------|-----------------|
| **Gross Margin** | (Net Profit / Total Income) × 100 | % of income retained after expenses |
| **Operating Ratio** | (Expenses / Income) × 100 | % of income spent on operations |
| **Net Margin** | Same as Gross Margin | Overall profitability % |
| **Expense Ratio** | (Expenses / Income) × 100 | % of income consumed by expenses |

**Example:**
- If Gross Margin = 36.67%, you keep $36.67 for every $100 of income
- If Expense Ratio = 63.33%, you spend $63.33 for every $100 of income

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/profitability"
```

---

## 6. ANOMALY DETECTION

### Detect Anomalies
**GET** `/businesses/{business_id}/financials/anomalies`

Find unusual transactions (statistical outliers).

**Response (200 OK):**
```json
[
  {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "transaction_date": "2024-03-15",
    "amount": 50000.00,
    "category": "Services",
    "type": "expense",
    "z_score": 3.5,
    "reason": "Significantly higher than average Services expense"
  }
]
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/financials/anomalies"
```

---

## Python Testing Examples

```python
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"
BUSINESS_ID = "YOUR_BUSINESS_ID"

class FinancialAPI:
    def __init__(self, base_url, business_id):
        self.base_url = base_url
        self.business_id = business_id
    
    # Summary endpoints
    def get_summary(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/summary"
        return requests.get(url).json()
    
    def get_report(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/report"
        return requests.get(url).json()
    
    # P&L endpoints
    def get_daily_pnl(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/pnl/daily"
        return requests.get(url).json()
    
    def get_weekly_pnl(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/pnl/weekly"
        return requests.get(url).json()
    
    def get_monthly_pnl(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/pnl/monthly"
        return requests.get(url).json()
    
    # Cash flow endpoints
    def get_cash_flow(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/cash-flow"
        return requests.get(url).json()
    
    def get_cash_flow_trend(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/cash-flow/trend"
        return requests.get(url).json()
    
    def get_negative_cash_flow(self, period="monthly"):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/negative-cash-flow"
        return requests.get(url, params={"period": period}).json()
    
    def get_burn_rate(self, days=30):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/burn-rate"
        return requests.get(url, params={"days": days}).json()
    
    # Breakdown endpoints
    def get_expense_breakdown(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/expense-breakdown"
        return requests.get(url).json()
    
    def get_income_breakdown(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/income-breakdown"
        return requests.get(url).json()
    
    # Metrics
    def get_profitability(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/profitability"
        return requests.get(url).json()
    
    def get_anomalies(self):
        url = f"{self.base_url}/businesses/{self.business_id}/financials/anomalies"
        return requests.get(url).json()

# Usage
if __name__ == "__main__":
    api = FinancialAPI(BASE_URL, BUSINESS_ID)
    
    # Get summary
    print("Financial Summary:")
    print(json.dumps(api.get_summary(), indent=2))
    
    # Get complete report
    print("\nComprehensive Report:")
    print(json.dumps(api.get_report(), indent=2))
    
    # Get monthly P&L
    print("\nMonthly P&L:")
    print(json.dumps(api.get_monthly_pnl(), indent=2))
    
    # Get cash flow
    print("\nCash Flow:")
    print(json.dumps(api.get_cash_flow(), indent=2))
    
    # Get expense breakdown
    print("\nExpense Breakdown:")
    print(json.dumps(api.get_expense_breakdown(), indent=2))
    
    # Get profitability
    print("\nProfitability Metrics:")
    print(json.dumps(api.get_profitability(), indent=2))
```

---

## Implementation Summary

| Feature | Endpoint | Status |
|---------|----------|--------|
| Financial Summary | GET /financials/summary | ✅ Implemented |
| Comprehensive Report | GET /financials/report | ✅ Implemented |
| Daily P&L | GET /financials/pnl/daily | ✅ Implemented |
| Weekly P&L | GET /financials/pnl/weekly | ✅ Implemented |
| Monthly P&L | GET /financials/pnl/monthly | ✅ Implemented |
| Cash Flow Summary | GET /financials/cash-flow | ✅ Implemented |
| Cash Flow Trend | GET /financials/cash-flow/trend | ✅ Implemented |
| Negative Cash Flow Detection | GET /financials/negative-cash-flow | ✅ Implemented |
| Burn Rate | GET /financials/burn-rate | ✅ Implemented |
| Expense Breakdown | GET /financials/expense-breakdown | ✅ Implemented |
| Income Breakdown | GET /financials/income-breakdown | ✅ Implemented |
| Profitability Metrics | GET /financials/profitability | ✅ Implemented |
| Anomaly Detection | GET /financials/anomalies | ✅ Implemented |

---

## Technical Details

### Performance Considerations
- All calculations use efficient Pandas operations
- Results are aggregated and cached in memory
- Add pagination for large transaction datasets if needed
- Consider database indexing on `transaction_date` and `business_id`

### Accuracy
- Decimal precision maintained (2 decimal places)
- Profit margin calculated correctly: (Net Profit / Total Income) × 100
- All amounts in business's configured currency
- Dates include timezone information

---

## Error Handling

All endpoints return standard HTTP error codes:

- **200 OK** - Successful request
- **404 Not Found** - Business or transaction not found
- **422 Unprocessable Entity** - Invalid parameters
- **500 Internal Server Error** - Server error

---

## Notes for Developers

1. **Empty Data**: All endpoints handle empty transaction lists gracefully, returning zero values or empty lists
2. **No Data Filter**: All endpoints use all-time data. Add date filters if needed
3. **Timezone**: All dates use UTC with timezone info
4. **Currency**: Results are in business's configured currency (default: USD)
