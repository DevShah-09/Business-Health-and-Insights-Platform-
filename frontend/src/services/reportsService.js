/**
 * Reports Service — automated report generation
 */
import api from './api';

const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';

/** Get weekly report */
export const getWeeklyReport = (businessId = BUSINESS_ID) =>
  api.get(`/businesses/${businessId}/reports/weekly`).then((r) => r.data);

/** Get monthly report */
export const getMonthlyReport = (businessId = BUSINESS_ID) =>
  api.get(`/businesses/${businessId}/reports/monthly`).then((r) => r.data);

/** Get quarterly report */
export const getQuarterlyReport = (businessId = BUSINESS_ID) =>
  api.get(`/businesses/${businessId}/reports/quarterly`).then((r) => r.data);
