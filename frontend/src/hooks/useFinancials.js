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
        setReport(reportData.status === 'fulfilled' ? reportData.value : null);
        setDailyPnL(dailyData.status === 'fulfilled' ? dailyData.value : null);
        setWeeklyPnL(weeklyData.status === 'fulfilled' ? weeklyData.value : null);
        setMonthlyPnL(monthlyData.status === 'fulfilled' ? monthlyData.value : null);
        setCashFlow(cfData.status === 'fulfilled' ? cfData.value : null);
        setCashFlowTrend(cfTrendData.status === 'fulfilled' ? cfTrendData.value : null);
        setNegativeCashFlow(negCFData.status === 'fulfilled' ? negCFData.value : null);
        setBurnRate(brData.status === 'fulfilled' ? brData.value : null);
        setExpenseBreakdown(expData.status === 'fulfilled' ? expData.value : null);
        setIncomeBreakdown(incData.status === 'fulfilled' ? incData.value : null);
        setProfitability(profData.status === 'fulfilled' ? profData.value : null);
      } catch (err) {
        console.error('Failed to fetch financials:', err);
        setError(err.message);
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
