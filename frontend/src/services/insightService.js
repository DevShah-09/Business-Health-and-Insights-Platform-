/**
 * Insight Service — wraps GET /insights
 */
import api from './api';

/** AI-generated business insights and recommendations */
export const getInsights = () => api.get('/insights').then((r) => r.data);
