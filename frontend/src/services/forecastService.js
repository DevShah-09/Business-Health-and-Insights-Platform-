/**
 * Forecast & Simulation Service
 */
import api from './api';

/** Get revenue / expense / cash-flow forecast */
export const getForecast = () => api.get('/forecast').then((r) => r.data);

/** Run a what-if simulation: { sales_change_pct, expense_change_pct } */
export const runSimulation = (params) =>
  api.post('/simulate', params).then((r) => r.data);
