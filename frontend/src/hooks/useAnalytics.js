/**
 * useAnalytics — fetches KPI + trend + category data from GET /analytics
 * Falls back to rich mock data when the API is unreachable.
 */
import { useState, useEffect, useCallback } from 'react';
import { getAnalytics, getAlerts } from '../services/analyticsService';

const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';

const MOCK_ANALYTICS = {
  kpis: {
    total_revenue: 124500,
    total_expenses: 87200,
    net_profit: 37300,
    cash_balance: 52100,
    revenue_delta: 12.4,
    expense_delta: -3.1,
    profit_delta: 18.2,
    cash_delta: 7.6,
  },
  trend: [
    { month: 'Jan', revenue: 95000, expenses: 72000 },
    { month: 'Feb', revenue: 102000, expenses: 78000 },
    { month: 'Mar', revenue: 98000, expenses: 74000 },
    { month: 'Apr', revenue: 110000, expenses: 80000 },
    { month: 'May', revenue: 118000, expenses: 84000 },
    { month: 'Jun', revenue: 124500, expenses: 87200 },
  ],
  categories: [
    { name: 'Products', revenue: 58000, expenses: 32000 },
    { name: 'Marketing', revenue: 12000, expenses: 18000 },
    { name: 'Operations', revenue: 0, expenses: 22000 },
    { name: 'Salaries', revenue: 0, expenses: 28000 },
    { name: 'Services', revenue: 54500, expenses: 5200 },
  ],
  expense_breakdown: [
    { name: 'Salaries', value: 28000 },
    { name: 'Operations', value: 22000 },
    { name: 'Products', value: 32000 },
    { name: 'Marketing', value: 18000 },
    { name: 'Other', value: 5200 },
  ],
  health_score: 74,
  profit_margin: 29.9,
  growth_rate: 18.2,
  expense_ratio: 70.1,
};

const MOCK_ALERTS = [
  { id: 1, severity: 'critical', title: 'Cash Flow Risk', message: 'Cash reserves may fall below threshold in 30 days based on current burn rate.' },
  { id: 2, severity: 'warning', title: 'Marketing Overspend', message: 'Marketing expenses increased 23% this month with no measurable revenue impact.' },
  { id: 3, severity: 'info', title: 'Revenue Milestone', message: 'You are on track to hit your Q2 revenue target of ₹1,30,000.' },
];

export function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = () => {
    setLoading(true);
    getAnalytics()
      .then(setData)
      .catch((err) => {
        console.warn('API unreachable, using mock analytics data:', err.message);
        setData(MOCK_ANALYTICS);
        setError(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
    
    window.addEventListener('financial-data-refresh', fetchAnalytics);
    return () => window.removeEventListener('financial-data-refresh', fetchAnalytics);
  }, []);

  return { data, loading, error };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(() => {
    getAlerts(BUSINESS_ID)
      .then((res) => setAlerts(res.alerts || []))
      .catch((err) => {
        console.warn('API unreachable, using mock alerts:', err.message);
        setAlerts(MOCK_ALERTS);
        setError(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAlerts();
    window.addEventListener('financial-data-refresh', fetchAlerts);
    return () => window.removeEventListener('financial-data-refresh', fetchAlerts);
  }, [fetchAlerts]);

  return { alerts, loading, error };
}
