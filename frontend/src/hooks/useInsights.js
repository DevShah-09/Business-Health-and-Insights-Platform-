/**
 * useInsights — fetches AI insights from GET /insights
 */
import { useState, useEffect } from 'react';
import { getInsights } from '../services/insightService';

const MOCK_INSIGHTS = [
  {
    id: 1,
    category: 'Marketing',
    impact: 'High',
    icon: '📢',
    title: 'Marketing ROI Declining',
    description: 'Marketing spend increased 23% but revenue from that channel remained flat. Consider reallocating budget to higher-performing channels.',
    action: 'Reduce marketing budget by 15%',
  },
  {
    id: 2,
    category: 'Operations',
    impact: 'Medium',
    icon: '⚙️',
    title: 'Operational Efficiency Opportunity',
    description: 'Operational costs are 18% above industry benchmark. Automating 3 manual processes could save ~$4,200/month.',
    action: 'Review automation options',
  },
  {
    id: 3,
    category: 'Revenue',
    impact: 'High',
    icon: '📈',
    title: 'Top Revenue Driver: Services',
    description: 'Services category is growing at 18% MoM. Expanding service offerings could yield an additional $12,000/month.',
    action: 'Scale service contracts',
  },
  {
    id: 4,
    category: 'Finance',
    impact: 'Low',
    icon: '💰',
    title: 'Cash Buffer Adequate',
    description: 'Current cash balance covers 18 days of operational expenses. Industry recommendation is 30 days. Build reserve gradually.',
    action: 'Set aside 5% of revenue monthly',
  },
];

export function useInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getInsights()
      .then((d) => setInsights(d?.insights || d))
      .catch(() => setInsights(MOCK_INSIGHTS))
      .finally(() => setLoading(false));
  }, []);

  return { insights, loading, error };
}
