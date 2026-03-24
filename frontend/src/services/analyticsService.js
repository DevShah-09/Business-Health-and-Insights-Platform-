/**
 * Analytics Service — wraps GET /analytics and GET /alerts
 */
import api from './api';

/** Full analytics payload: KPIs, trend data, category breakdown */
export const getAnalytics = () => api.get('/analytics').then((r) => r.data);

/** Active alerts: critical / warning / info */
export const getAlerts = () => api.get('/alerts').then((r) => r.data);
