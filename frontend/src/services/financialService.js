/**
 * Financial Service — wraps all financial analytics and reporting APIs
 */
import api from './api';

/** Fetch daily P&L analysis */
export const getDailyPnL = () =>
  api.get('/financials/pnl/daily').then((r) => r.data);

/** Fetch weekly P&L analysis */
export const getWeeklyPnL = () =>
  api.get('/financials/pnl/weekly').then((r) => r.data);

/** Fetch monthly P&L analysis */
export const getMonthlyPnL = () =>
  api.get('/financials/pnl/monthly').then((r) => r.data);

/** Fetch cash flow summary (inflow, outflow, net) */
export const getCashFlow = () =>
  api.get('/financials/cash-flow').then((r) => r.data);

/** Fetch cumulative cash flow trend over time */
export const getCashFlowTrend = () =>
  api.get('/financials/cash-flow/trend').then((r) => r.data);

/** Fetch periods with negative cash flow (deficit periods) */
export const getNegativeCashFlow = (granularity = 'daily') =>
  api.get('/financials/negative-cash-flow', { params: { granularity } }).then((r) => r.data);

/** Fetch burn rate (daily and monthly) */
export const getBurnRate = (lookbackDays = 30) =>
  api.get('/financials/burn-rate', { params: { lookback_days: lookbackDays } }).then((r) => r.data);

/** Fetch expense breakdown by category */
export const getExpenseBreakdown = () =>
  api.get('/financials/expense-breakdown').then((r) => r.data);

/** Fetch income breakdown by category */
export const getIncomeBreakdown = () =>
  api.get('/financials/income-breakdown').then((r) => r.data);

/** Fetch profitability metrics (margins, ratios) */
export const getProfitability = () =>
  api.get('/financials/profitability').then((r) => r.data);

/** Fetch comprehensive financial report */
export const getFinancialReport = () =>
  api.get('/financials/report').then((r) => r.data);

/** Detect anomalies (unusual transactions) */
export const getAnomalies = () =>
  api.get('/financials/anomalies').then((r) => r.data);
