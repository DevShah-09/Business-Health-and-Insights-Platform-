/**
 * Forecast & Simulation Service
 */
import api from './api';

const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';

/** Get revenue / expense / cash-flow forecast */
export const getForecast = (businessId = BUSINESS_ID, months = 6) => 
  api.get(`/businesses/${businessId}/forecast?months=${months}`).then((r) => r.data);

/** Simulate revenue change */
export const getScenarioRevenue = (businessId = BUSINESS_ID, changePct) =>
  api.get(`/businesses/${businessId}/scenario/revenue?change_pct=${changePct}`).then((r) => r.data);

/** Simulate expense change */
export const getScenarioExpense = (businessId = BUSINESS_ID, changePct) =>
  api.get(`/businesses/${businessId}/scenario/expense?change_pct=${changePct}`).then((r) => r.data);

/** Get batch of common scenarios */
export const getScenarioBatch = (businessId = BUSINESS_ID) =>
  api.get(`/businesses/${businessId}/scenario/batch`).then((r) => r.data);
