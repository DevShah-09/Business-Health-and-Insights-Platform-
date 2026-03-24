/**
 * useAlerts — fetches real-time alerts from GET /businesses/{bid}/alerts
 */
import { useState, useEffect } from 'react';
import { getAlerts } from '../services/analyticsService';

const MOCK_ALERTS = [
  { id: 1, severity: 'critical', title: 'Negative Cash Flow Alert', message: 'Expenses exceed income in the last 30 days. Immediate action required.' },
  { id: 2, severity: 'warning', title: 'Expense Spike Detected', message: 'Expenses increased 35% last month. Review high-cost categories.' },
  { id: 3, severity: 'info', title: 'Revenue Milestone', message: 'You are on track to hit your Q2 revenue target of $130,000.' },
];

export function useAlerts(businessId = '550e8400-e29b-41d4-a716-446655440001') {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await getAlerts(businessId);
        setAlerts(data.alerts || MOCK_ALERTS);
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch alerts, using mock data:', err);
        setAlerts(MOCK_ALERTS);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [businessId]);

  return { alerts, loading, error };
}
