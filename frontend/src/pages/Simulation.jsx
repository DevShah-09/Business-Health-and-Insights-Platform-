import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { Card } from '../components/ui/Card';


const BusinessID = '550e8400-e29b-41d4-a716-446655440001';

function ScenarioCard({ scenario }) {
  const impact = scenario.impact;
  const adjusted = scenario.adjusted;
  
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      <h3 className="font-semibold text-gray-900 mb-4">{scenario.scenario}</h3>
      
      <div className="space-y-4">
        {/* Impact Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-xs text-blue-600 font-medium">Revenue Impact</p>
            <p className={`text-lg font-bold ${impact.revenue_impact_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {impact.revenue_impact_pct >= 0 ? '+' : ''}{impact.revenue_impact_pct.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-orange-50 p-3 rounded">
            <p className="text-xs text-orange-600 font-medium">Cost Impact</p>
            <p className={`text-lg font-bold ${impact.expense_impact_pct < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {impact.expense_impact_pct < 0 ? '' : '+'}{impact.expense_impact_pct.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Profit Impact - Main */}
        <div className={`${impact.profit_impact > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-lg p-4 border`}>
          <p className={`text-xs font-medium mb-2 ${impact.profit_impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
            Profit Impact
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${impact.profit_impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {impact.profit_impact > 0 ? '+' : ''}{(impact.profit_impact).toLocaleString('en-US', {maximumFractionDigits: 0})}
              </p>
              <p className={`text-xs mt-1 ${impact.profit_impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {impact.profit_impact_pct > 0 ? '+' : ''}{impact.profit_impact_pct.toFixed(1)}% margin change
              </p>
            </div>
            {impact.profit_impact > 0 ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>

        {/* New Values */}
        <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
          <p className="text-gray-600"><span className="font-semibold">Revenue:</span> ${(adjusted.total_income).toLocaleString('en-US', {maximumFractionDigits: 0})}</p>
          <p className="text-gray-600"><span className="font-semibold">Expenses:</span> ${(adjusted.total_expenses).toLocaleString('en-US', {maximumFractionDigits: 0})}</p>
          <p className="text-gray-600"><span className="font-semibold">New Profit:</span> ${(adjusted.net_profit).toLocaleString('en-US', {maximumFractionDigits: 0})} ({adjusted.profit_margin.toFixed(1)}%)</p>
        </div>
      </div>
    </div>
  );
}

export default function Simulation() {
  const { scenarios, loading, loadScenarioBatch } = useSimulation(BusinessID);

  useEffect(() => {
    loadScenarioBatch();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">


      <main className="p-6 space-y-8 max-w-[1400px] w-full mx-auto pb-12">
        {/* Header Card */}
        <Card>
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What-If Analysis</h3>
              <p className="text-sm text-gray-600">
                Simulate different business scenarios to understand their financial impact. See how changes in revenue and expenses affect your profit, cash flow, and overall business health.
              </p>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : scenarios && Object.keys(scenarios).length > 0 ? (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pre-built Scenarios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(scenarios).map(([key, scenario]) => (
                  <ScenarioCard key={key} scenario={scenario} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No scenarios available</p>
            <p className="text-gray-500 text-sm mt-1">Add transactions to your business to enable scenario analysis</p>
          </div>
        )}

        {/* API Documentation */}
        <Card>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">API Endpoints</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use these endpoints to create custom scenario simulations programmatically:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 font-mono text-xs overflow-x-auto">
              <div className="text-gray-700"># Revenue Change</div>
              <div className="text-blue-600">GET /api/v1/businesses/{'{'}id{'}'}/scenario/revenue?change_pct=-20</div>
              
              <div className="text-gray-700 mt-3"># Expense Change</div>
              <div className="text-blue-600">GET /api/v1/businesses/{'{'}id{'}'}/scenario/expense?change_pct=15</div>
              
              <div className="text-gray-700 mt-3">// Combined Scenario</div>
              <div className="text-blue-600">POST /api/v1/businesses/{'{'}id{'}'}/scenario/combined</div>
              <div className="text-gray-600 ml-4">{'{'} "revenue_change_pct": -20, "expense_change_pct": 15 {'}'}</div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
