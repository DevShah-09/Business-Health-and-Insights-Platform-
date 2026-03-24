/**
 * Analytics Service — wraps GET /analytics and GET /alerts
 */
import api from './api';

const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';

/** Full analytics payload: KPIs, trend data, category breakdown */
export const getAnalytics = () => api.get('/analytics').then((r) => r.data);

/** Active alerts: critical / warning / info */
export const getAlerts = (businessId = BUSINESS_ID) => 
  api.get(`/businesses/${businessId}/alerts`).then((r) => r.data);
