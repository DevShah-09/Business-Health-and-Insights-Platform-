/**
 * useSimulation — handles scenario simulation for what-if analysis
 */
import { useState, useCallback } from 'react';
import { getScenarioRevenue, getScenarioExpense, getScenarioBatch } from '../services/forecastService';

export function useSimulation(businessId = '550e8400-e29b-41d4-a716-446655440001') {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const simulateRevenueChange = useCallback(async (changePct) => {
    try {
      setLoading(true);
      const result = await getScenarioRevenue(businessId, changePct);
      return result;
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const simulateExpenseChange = useCallback(async (changePct) => {
    try {
      setLoading(true);
      const result = await getScenarioExpense(businessId, changePct);
      return result;
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const loadScenarioBatch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getScenarioBatch(businessId);
      setScenarios(result.scenarios || {});
      return result;
    } catch (err) {
      console.error('Failed to load scenarios:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  return {
    scenarios,
    loading,
    error,
    simulateRevenueChange,
    simulateExpenseChange,
    loadScenarioBatch
  };
}
