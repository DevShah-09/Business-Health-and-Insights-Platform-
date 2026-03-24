/**
 * Financial Service — wraps all financial analytics and reporting APIs
 */
import api from './api';

const DEFAULT_BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';
const BASE_PATH = `/api/v1/businesses/${DEFAULT_BUSINESS_ID}/financials`;

/** Fetch daily P&L analysis */
export const getDailyPnL = () =>
  api.get(`${BASE_PATH}/pnl/daily`).then((r) => r.data);

/** Fetch weekly P&L analysis */
export const getWeeklyPnL = () =>
  api.get(`${BASE_PATH}/pnl/weekly`).then((r) => r.data);

/** Fetch monthly P&L analysis */
export const getMonthlyPnL = () =>
  api.get(`${BASE_PATH}/pnl/monthly`).then((r) => r.data);

/** Fetch cash flow summary (inflow, outflow, net) */
export const getCashFlow = () =>
  api.get(`${BASE_PATH}/cash-flow`).then((r) => r.data);

/** Fetch cumulative cash flow trend over time */
export const getCashFlowTrend = () =>
  api.get(`${BASE_PATH}/cash-flow/trend`).then((r) => r.data);

/** Fetch periods with negative cash flow (deficit periods) */
export const getNegativeCashFlow = (granularity = 'daily') =>
  api.get(`${BASE_PATH}/negative-cash-flow`, { params: { granularity } }).then((r) => r.data);

/** Fetch burn rate (daily and monthly) */
export const getBurnRate = (lookbackDays = 30) =>
  api.get(`${BASE_PATH}/burn-rate`, { params: { lookback_days: lookbackDays } }).then((r) => r.data);

/** Fetch expense breakdown by category */
export const getExpenseBreakdown = () =>
  api.get(`${BASE_PATH}/expense-breakdown`).then((r) => r.data);

/** Fetch income breakdown by category */
export const getIncomeBreakdown = () =>
  api.get(`${BASE_PATH}/income-breakdown`).then((r) => r.data);

/** Fetch profitability metrics (margins, ratios) */
export const getProfitability = () =>
  api.get(`${BASE_PATH}/profitability`).then((r) => r.data);

/** Fetch comprehensive financial report */
export const getFinancialReport = () =>
  api.get(`${BASE_PATH}/report`).then((r) => r.data);

/** Detect anomalies (unusual transactions) */
export const getAnomalies = () =>
  api.get(`${BASE_PATH}/anomalies`).then((r) => r.data);
