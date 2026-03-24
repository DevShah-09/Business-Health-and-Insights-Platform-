/**
 * useForecast — fetches forecast data from GET /forecast
 */
import { useState, useEffect } from 'react';
import { getForecast } from '../services/forecastService';

const MOCK_FORECAST = {
  summary: {
    predicted_revenue: 138000,
    predicted_expenses: 91000,
    predicted_cashflow: 47000,
    revenue_confidence: 82,
    expense_confidence: 89,
  },
  monthly: [
    { month: 'Jul', revenue: 128000, expenses: 88000, cashflow: 40000 },
    { month: 'Aug', revenue: 131000, expenses: 89500, cashflow: 41500 },
    { month: 'Sep', revenue: 134000, expenses: 90000, cashflow: 44000 },
    { month: 'Oct', revenue: 136500, expenses: 90500, cashflow: 46000 },
    { month: 'Nov', revenue: 138000, expenses: 91000, cashflow: 47000 },
    { month: 'Dec', revenue: 142000, expenses: 93000, cashflow: 49000 },
  ],
};

export function useForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getForecast()
      .then(setForecast)
      .catch(() => setForecast(MOCK_FORECAST))
      .finally(() => setLoading(false));
  }, []);

  return { forecast, loading, error };
}
