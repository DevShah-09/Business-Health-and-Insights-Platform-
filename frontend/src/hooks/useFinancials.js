/**
 * useFinancials Hook — fetches all financial metrics with mock data fallback
 */
import { useState, useEffect } from 'react';
import {
  getFinancialReport,
  getDailyPnL,
  getWeeklyPnL,
  getMonthlyPnL,
  getCashFlow,
  getCashFlowTrend,
  getNegativeCashFlow,
  getBurnRate,
  getExpenseBreakdown,
  getIncomeBreakdown,
  getProfitability,
} from '../services/financialService';

const MOCK_FINANCIAL_REPORT = {
  summary: {
    total_income: 125000,
    total_expenses: 85000,
    net_profit: 40000,
    profit_margin: 32,
    average_monthly_income: 31250,
    average_monthly_expenses: 21250,
  },
  profitability_metrics: {
    gross_margin: 32,
    operating_ratio: 68,
    net_margin: 32,
    expense_ratio: 68,
  },
  cash_flow: {
    total_inflow: 125000,
    total_outflow: 85000,
    net_cash_flow: 40000,
    average_daily_flow: 328.77,
    working_capital: 40000,
  },
  burn_rate: {
    daily_burn_rate: -328.77,
    monthly_burn_rate: -9863,
    runway_months: null,
  },
  monthly_pnl: [
    { period: 'Jan', income: 32000, expenses: 22000, profit: 10000 },
    { period: 'Feb', income: 31000, expenses: 20000, profit: 11000 },
    { period: 'Mar', income: 31000, expenses: 21000, profit: 10000 },
    { period: 'Apr', income: 31000, expenses: 22000, profit: 9000 },
  ],
  expense_breakdown: [
    { category: 'Utilities', amount: 8500, percentage: 10 },
    { category: 'Marketing', amount: 12750, percentage: 15 },
    { category: 'Salaries', amount: 34000, percentage: 40 },
    { category: 'Operations', amount: 29750, percentage: 35 },
  ],
  income_breakdown: [
    { category: 'Services', amount: 75000, percentage: 60 },
    { category: 'Products', amount: 50000, percentage: 40 },
  ],
};

const MOCK_DAILY_PNL = [
  { date: '2024-03-18', income: 1200, expenses: 800, profit: 400 },
  { date: '2024-03-19', income: 1400, expenses: 750, profit: 650 },
  { date: '2024-03-20', income: 1100, expenses: 900, profit: 200 },
  { date: '2024-03-21', income: 1300, expenses: 850, profit: 450 },
  { date: '2024-03-22', income: 1250, expenses: 920, profit: 330 },
];

const MOCK_CASH_FLOW_TREND = [
  { date: '2024-03-18', inflow: 1200, outflow: 800, cumulative: 400 },
  { date: '2024-03-19', inflow: 1400, outflow: 750, cumulative: 850 },
  { date: '2024-03-20', inflow: 1100, outflow: 900, cumulative: 1050 },
  { date: '2024-03-21', inflow: 1300, outflow: 850, cumulative: 1500 },
  { date: '2024-03-22', inflow: 1250, outflow: 920, cumulative: 1830 },
];

export function useFinancials() {
  const [report, setReport] = useState(null);
  const [dailyPnL, setDailyPnL] = useState(null);
  const [weeklyPnL, setWeeklyPnL] = useState(null);
  const [monthlyPnL, setMonthlyPnL] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [cashFlowTrend, setCashFlowTrend] = useState(null);
  const [negativeCashFlow, setNegativeCashFlow] = useState(null);
  const [burnRate, setBurnRate] = useState(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState(null);
  const [incomeBreakdown, setIncomeBreakdown] = useState(null);
  const [profitability, setProfitability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllFinancials = async () => {
      setLoading(true);
      try {
        const [
          reportData,
          dailyData,
          weeklyData,
          monthlyData,
          cfData,
          cfTrendData,
          negCFData,
          brData,
          expData,
          incData,
          profData,
        ] = await Promise.allSettled([
          getFinancialReport(),
          getDailyPnL(),
          getWeeklyPnL(),
          getMonthlyPnL(),
          getCashFlow(),
          getCashFlowTrend(),
          getNegativeCashFlow(),
          getBurnRate(),
          getExpenseBreakdown(),
          getIncomeBreakdown(),
          getProfitability(),
        ]);

        // Extract values or use fallbacks
        setReport(reportData.status === 'fulfilled' ? reportData.value : MOCK_FINANCIAL_REPORT);
        setDailyPnL(dailyData.status === 'fulfilled' ? dailyData.value : MOCK_DAILY_PNL);
        setWeeklyPnL(weeklyData.status === 'fulfilled' ? weeklyData.value : null);
        setMonthlyPnL(monthlyData.status === 'fulfilled' ? monthlyData.value : MOCK_FINANCIAL_REPORT.monthly_pnl);
        setCashFlow(cfData.status === 'fulfilled' ? cfData.value : MOCK_FINANCIAL_REPORT.cash_flow);
        setCashFlowTrend(cfTrendData.status === 'fulfilled' ? cfTrendData.value : MOCK_CASH_FLOW_TREND);
        setNegativeCashFlow(negCFData.status === 'fulfilled' ? negCFData.value : null);
        setBurnRate(brData.status === 'fulfilled' ? brData.value : MOCK_FINANCIAL_REPORT.burn_rate);
        setExpenseBreakdown(expData.status === 'fulfilled' ? expData.value : MOCK_FINANCIAL_REPORT.expense_breakdown);
        setIncomeBreakdown(incData.status === 'fulfilled' ? incData.value : MOCK_FINANCIAL_REPORT.income_breakdown);
        setProfitability(profData.status === 'fulfilled' ? profData.value : MOCK_FINANCIAL_REPORT.profitability_metrics);
      } catch (err) {
        setError(err.message);
        // Set fallback data
        setReport(MOCK_FINANCIAL_REPORT);
        setDailyPnL(MOCK_DAILY_PNL);
        setMonthlyPnL(MOCK_FINANCIAL_REPORT.monthly_pnl);
        setCashFlow(MOCK_FINANCIAL_REPORT.cash_flow);
        setCashFlowTrend(MOCK_CASH_FLOW_TREND);
        setBurnRate(MOCK_FINANCIAL_REPORT.burn_rate);
        setExpenseBreakdown(MOCK_FINANCIAL_REPORT.expense_breakdown);
        setIncomeBreakdown(MOCK_FINANCIAL_REPORT.income_breakdown);
        setProfitability(MOCK_FINANCIAL_REPORT.profitability_metrics);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFinancials();
  }, []);

  return {
    report,
    dailyPnL,
    weeklyPnL,
    monthlyPnL,
    cashFlow,
    cashFlowTrend,
    negativeCashFlow,
    burnRate,
    expenseBreakdown,
    incomeBreakdown,
    profitability,
    loading,
    error,
  };
}
