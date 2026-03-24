# Financial Engine Quick Reference

## Quick API Reference

### Get Everything in One Call
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/report"
```

### Daily Operations
```bash
# Daily P&L
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/pnl/daily"

# Current cash flow status
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/cash-flow"

# Budget burn rate
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/burn-rate"
```

### Monthly Analysis
```bash
# Monthly P&L
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/pnl/monthly"

# Expense breakdown
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/expense-breakdown"

# Income breakdown
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/income-breakdown"
```

### Problem Detection
```bash
# Check for negative cash flow months
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/negative-cash-flow"

# Find unusual transactions
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/anomalies"

# Check profitability metrics
curl -X GET "http://localhost:8000/api/v1/businesses/{business_id}/financials/profitability"
```

---

## Metrics Cheat Sheet

### Profit & Loss
- **P&L Statement**: Income - Expenses = Net Profit
- **Profit Margin**: (Net Profit / Total Income) × 100
- **Break-even**: When Profit Margin = 0%

### Cash Flow
- **Operating Cash**: Income flowing in from operations
- **Cash Burn**: Expenses flowing out (use burn-rate endpoint)
- **Net Cash Position**: Total Inflow - Total Outflow
- **Working Capital**: Available cash for operations

### Profitability Ratios
| Ratio | Formula | Good Value |
|-------|---------|-----------|
| Gross Margin | (Net Profit / Income) × 100 | > 20-30% |
| Expense Ratio | (Expenses / Income) × 100 | < 70-80% |
| Operating Ratio | (Expenses / Income) × 100 | < 70-80% |

### Category Analysis
- **Top Expense Categories**: Where money is spent
- **Largest Expense**: Category with highest spending
- **Average Transaction**: (Total / Count) - if high, few large purchases

---

## Common Use Cases

### 1. Monthly Financial Close
```python
# Get month-end P&L
GET /financials/pnl/monthly

# Get category breakdown for variance analysis
GET /financials/expense-breakdown
GET /financials/income-breakdown
```

### 2. Cash Flow Management
```python
# Monitor cash position
GET /financials/cash-flow

# Check trend to predict cash needs
GET /financials/cash-flow/trend

# Calculate runway if burn rate continues
GET /financials/burn-rate?days=30
```

### 3. Budget Alert System
```python
# Find months with negative cash flow
GET /financials/negative-cash-flow?period=monthly

# Alert if burn rate exceeds threshold
GET /financials/burn-rate

# Check if actual expenses > budget
GET /financials/expense-breakdown
```

### 4. Financial Health Check
```python
# Get profitability metrics
GET /financials/profitability

# Check if margins are decreasing
GET /financials/pnl/monthly

# Find cost anomalies
GET /financials/anomalies
```

### 5. Investor Reporting
```python
# Complete financial report
GET /financials/report

# Historical P&L trend
GET /financials/pnl/monthly

# Profitability metrics
GET /financials/profitability
```

---

## Integration Examples

### Dashboard Widget: Key Metrics
```json
{
  "title": "Financial Dashboard",
  "data": {
    "current_month_profit": "from /financials/pnl/monthly[latest]",
    "ytd_profit_margin": "from /financials/summary.profit_margin",
    "cash_position": "from /financials/cash-flow.net_cash_flow",
    "monthly_burn": "from /financials/burn-rate.monthly_burn_rate"
  }
}
```

### Alert System: Negative Cash Flow
```python
# Trigger alert if any month has negative flow
def check_cash_health(business_id):
    negative = GET /financials/negative-cash-flow?period=monthly
    if negative:
        ALERT: "Business had negative cash flow in {months}"
```

### Expense Tracking: Budget Variance
```python
# Compare actual vs budget for each category
def expense_analysis(business_id, budgets):
    actual = GET /financials/expense-breakdown
    for category, budget in budgets.items():
        actual_amount = actual.categories[category].amount
        variance = actual_amount - budget
        status = "OVER" if variance > 0 else "UNDER"
        print(f"{category}: {variance} {status} budget")
```

### Forecasting: Burn Rate Runway
```python
# Calculate how many months until cash runs out
def calculate_runway(business_id, current_cash):
    burn_data = GET /financials/burn-rate?days=30
    monthly_burn = burn_data.monthly_burn_rate
    runway_months = current_cash / monthly_burn
    return runway_months
```

---

## Data Quality Notes

### For Accurate Calculations
1. **Transaction Categorization**: Ensure transactions are properly categorized
2. **Consistent Dating**: Use correct transaction dates (not creation date)
3. **Transaction Type**: Clearly mark income vs expense
4. **Decimal Precision**: Amounts stored with 2 decimal places

### Edge Cases Handled
- Empty transaction list: Returns zero values
- Single transaction: Calculates margins correctly
- No income: Profit margin = -100% (if expenses exist)
- No expenses: Profit margin = 0% or 100% (depends on logic)

---

## Performance Tips

1. **Batch Calculations**: Use `/financials/report` to get all metrics at once (faster than multiple requests)
2. **Caching**: Cache daily/weekly reports; update monthly as transactions close
3. **Date Filters**: For large datasets, add date range filters to endpoints
4. **Async**: All endpoints are async; safe for high concurrency

---

## Troubleshooting

### Issue: Profit margin shows as -100%
**Cause**: No income transactions (only expenses)
**Solution**: Add income transactions or review data

### Issue: Burn rate seems incorrect
**Cause**: Looking at full history instead of recent period
**Solution**: Use `/burn-rate?days=30` or `/burn-rate?days=90` for recent trend

### Issue: Category breakdown missing
**Cause**: Transactions not categorized
**Solution**: Run auto-categorization or manually categorize transactions

### Issue: Negative cash flow not showing
**Cause**: No periods with expenses > income
**Solution**: If business is profitable, list will be empty (correct behavior)
