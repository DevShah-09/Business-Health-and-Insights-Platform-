/**
 * Financial Service — wraps all financial analytics and reporting APIs
 */
import api from './api';

const DEFAULT_BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';
const BASE_PATH = `/api/v1/businesses/${DEFAULT_BUSINESS_ID}/financials`;

// Mock data for fallback
const MOCK_MONTHLY_PNL = [
  { month: 'Jan', income: 95000, expenses: 72000, profit_loss: 23000, profit_margin: 24.2 },
  { month: 'Feb', income: 102000, expenses: 78000, profit_loss: 24000, profit_margin: 23.5 },
  { month: 'Mar', income: 98000, expenses: 74000, profit_loss: 24000, profit_margin: 24.5 },
  { month: 'Apr', income: 110000, expenses: 80000, profit_loss: 30000, profit_margin: 27.3 },
  { month: 'May', income: 118000, expenses: 84000, profit_loss: 34000, profit_margin: 28.8 },
  { month: 'Jun', income: 124500, expenses: 87200, profit_loss: 37300, profit_margin: 29.9 },
];

const MOCK_FINANCIAL_REPORT = {
  summary: {
    total_income: 647500,
    total_expenses: 475200,
    net_profit: 172300,
    profit_margin: 26.6,
    avg_monthly_income: 107916.67,
    avg_monthly_expenses: 79200,
    top_expense_categories: { Salaries: 28000, Operations: 22000, Products: 32000 },
    top_income_categories: { Services: 54500, Products: 58000 },
    period_start: '2024-01-01',
    period_end: '2024-06-30',
  },
  profitability: {
    gross_margin: 45.5,
    net_margin: 26.6,
    operating_ratio: 73.4,
    expense_ratio: 73.4,
  },
  cash_flow: {
    total_inflow: 647500,
    total_outflow: 475200,
    net_cash_flow: 172300,
  },
  monthly_pnl: MOCK_MONTHLY_PNL,
  burn_rate: {
    daily_burn_rate: -944.51,
    monthly_burn_rate: -28738.33,
    runway_months: 6,
  },
};

const MOCK_CASH_FLOW = {
  total_inflow: 647500,
  total_outflow: 475200,
  net_cash_flow: 172300,
};

const MOCK_CASH_FLOW_TREND = [
  { date: '2024-01-01', cumulative_cash: 0 },
  { date: '2024-02-01', cumulative_cash: 23000 },
  { date: '2024-03-01', cumulative_cash: 47000 },
  { date: '2024-04-01', cumulative_cash: 71000 },
  { date: '2024-05-01', cumulative_cash: 101000 },
  { date: '2024-06-01', cumulative_cash: 135000 },
  { date: '2024-06-30', cumulative_cash: 172300 },
];

const MOCK_BURN_RATE = {
  daily_burn_rate: -944.51,
  monthly_burn_rate: -28738.33,
  runway_months: 6,
};

const MOCK_PROFITABILITY = {
  gross_margin: 45.5,
  net_margin: 26.6,
  operating_ratio: 73.4,
  expense_ratio: 73.4,
};

const MOCK_EXPENSE_BREAKDOWN = [
  { category: 'Salaries', amount: 28000, percentage: 37.3 },
  { category: 'Products', amount: 32000, percentage: 42.7 },
  { category: 'Operations', amount: 22000, percentage: 29.3 },
  { category: 'Marketing', amount: 18000, percentage: 24.0 },
  { category: 'Other', amount: 5200, percentage: 6.9 },
];

const MOCK_INCOME_BREAKDOWN = [
  { category: 'Products', amount: 58000, percentage: 45.5 },
  { category: 'Services', amount: 54500, percentage: 42.8 },
  { category: 'Consulting', amount: 12000, percentage: 9.4 },
];

/** Fetch daily P&L analysis */
export const getDailyPnL = () =>
  api.get(`${BASE_PATH}/pnl/daily`, { params: { _: Date.now() } }).then((r) => r.data).catch(() => []);

/** Fetch weekly P&L analysis */
export const getWeeklyPnL = () =>
  api.get(`${BASE_PATH}/pnl/weekly`, { params: { _: Date.now() } }).then((r) => r.data).catch(() => []);

/** Fetch monthly P&L analysis */
export const getMonthlyPnL = () =>
  api.get(`${BASE_PATH}/pnl/monthly`, { params: { _: Date.now() } }).then((r) => r.data).catch(() => []);

/** Fetch cash flow summary (inflow, outflow, net) */
export const getCashFlow = () =>
  api.get(`${BASE_PATH}/cash-flow`, { params: { _: Date.now() } }).then((r) => r.data).catch(() => null);

/** Fetch cumulative cash flow trend over time */
export const getCashFlowTrend = () =>
  api.get(`${BASE_PATH}/cash-flow/trend`, { params: { _: Date.now() } }).then((r) => r.data).catch(() => []);

/** Fetch periods with negative cash flow (deficit periods) */
export const getNegativeCashFlow = (period = 'monthly') =>
  api.get(`${BASE_PATH}/negative-cash-flow`, { params: { period, _: Date.now() } }).then((r) => r.data).catch(() => []);

/** Fetch burn rate (daily and monthly) */
export const getBurnRate = (days = 30) =>
  api.get(`${BASE_PATH}/burn-rate`, { params: { days, _: Date.now() } }).then((r) => r.data).catch(() => null);

/** Fetch expense breakdown by category */
export const getExpenseBreakdown = () =>
  api.get(`${BASE_PATH}/expense-breakdown`, { params: { _: Date.now() } })
    .then((r) => {
      if (r.data?.categories && typeof r.data.categories === 'object') {
        return Object.entries(r.data.categories).map(([category, data]) => ({
          category,
          amount: data?.amount || 0,
          percentage: data?.percentage || 0,
          trend: data?.trend || 0,
        }));
      }
      return [];
    })
    .catch(() => []);

/** Fetch income breakdown by category */
export const getIncomeBreakdown = () =>
  api.get(`${BASE_PATH}/income-breakdown`, { params: { _: Date.now() } })
    .then((r) => {
      if (r.data?.categories && typeof r.data.categories === 'object') {
        return Object.entries(r.data.categories).map(([category, data]) => ({
          category,
          amount: data?.amount || 0,
          percentage: data?.percentage || 0,
          trend: data?.trend || 0,
        }));
      }
      return [];
    })
    .catch(() => []);

/** Fetch profitability metrics (margins, ratios) */
export const getProfitability = () =>
  api.get(`${BASE_PATH}/profitability`, { params: { _: Date.now() } }).then((r) => r.data).catch(() => null);

/** Fetch comprehensive financial report */
export const getFinancialReport = () =>
  api.get(`${BASE_PATH}/report`, { params: { _: Date.now() } }).then((r) => r.data).catch(() => null);

/** Detect anomalies (unusual transactions) */
export const getAnomalies = () =>
  api.get(`${BASE_PATH}/anomalies`).then((r) => r.data).catch(() => []);
