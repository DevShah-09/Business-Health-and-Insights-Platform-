import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Activity, Save, RefreshCw, IndianRupee, PieChart } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card } from '../components/ui/Card';


const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';

export default function Simulation() {
  const { results, loading: simulationLoading, runSimulation, error } = useSimulation();
  const { data: analytics, loading: analyticsLoading } = useAnalytics();
  
  const [params, setParams] = useState({
    income_change_pct: 0,
    expense_change_pct: 0,
    mode: 'sandbox'
  });

  const [isSandbox, setIsSandbox] = useState(true);

  // Initial simulation on load or when analytics change
  useEffect(() => {
    if (analytics?.kpis) {
      handleSimulate();
    }
  }, [analytics]);

  const handleSimulate = async () => {
    await runSimulation({
      ...params,
      business_id: BUSINESS_ID,
      mode: 'sandbox'
    });
  };

  const handleCommitToMarket = async () => {
    setIsSandbox(false);
    try {
      // Logic for actually committing would go here
      // For now, we simulate success
      await new Promise(resolve => setTimeout(resolve, 800));
      alert("Decision Implemented: Market State Updated. (Mock behavior)");
    } finally {
      setIsSandbox(true);
    }
  };

  if (analyticsLoading && !analytics) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const current = results?.current || {
    total_income: analytics?.kpis?.total_revenue || 0,
    total_expenses: analytics?.kpis?.total_expenses || 0,
    net_profit: analytics?.kpis?.net_profit || 0,
    profit_margin: analytics?.profit_margin || 0,
  };
  const projected = results?.projected || current;
  const impact = results?.impact || {};

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">

      
      {/* Page Header */}
      <div className="px-8 py-6 border-b border-surface-border/30 bg-surface-card/50">
        <h1 className="text-3xl font-bold text-surface-foreground mb-2">Scenario Simulation</h1>
        <p className="text-sm text-surface-muted-foreground">Test how business changes affect your bottom line</p>
      </div>

      <main className="p-6 space-y-6 max-w-[1400px] w-full mx-auto pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <Card className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-bold text-surface-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand" />
              Simulation Controls
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-muted-foreground mb-2 uppercase tracking-wider">
                  Income Change (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    step="1"
                    value={params.income_change_pct}
                    onChange={(e) => setParams({ ...params, income_change_pct: parseInt(e.target.value) })}
                    className="flex-1 accent-brand"
                  />
                  <span className={`w-12 text-right font-bold ${params.income_change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {params.income_change_pct}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-muted-foreground mb-2 uppercase tracking-wider">
                  Expense Change (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    step="1"
                    value={params.expense_change_pct}
                    onChange={(e) => setParams({ ...params, expense_change_pct: parseInt(e.target.value) })}
                    className="flex-1 accent-red-400"
                  />
                  <span className={`w-12 text-right font-bold ${params.expense_change_pct <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {params.expense_change_pct}%
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={handleSimulate}
                  disabled={simulationLoading}
                  className="w-full bg-brand text-surface-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${simulationLoading ? 'animate-spin' : ''}`} />
                  Run Sandbox Simulation
                </button>
                
                <button
                  onClick={handleCommitToMarket}
                  disabled={simulationLoading}
                  className="w-full bg-surface-muted text-surface-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-surface-border hover:bg-surface-card transition"
                >
                  <Save className="w-4 h-4" />
                  Commit to Market Plan
                </button>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-200/80 leading-relaxed">
                Changes in Sandbox mode are temporary and do not affect your actual transaction records. Commit only when you want to update your projections.
              </p>
            </div>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Income Delta */}
              <Card className="border-l-4 border-l-brand">
                <p className="text-xs text-surface-muted-foreground mb-1">Projected Income</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-surface-foreground">
                    ₹{(projected.total_income || 0).toLocaleString()}
                  </p>
                  <p className={`text-sm mb-1 ${impact.income_delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {impact.income_delta >= 0 ? '↑' : '↓'} {Math.abs(params.income_change_pct)}%
                  </p>
                </div>
                <p className="text-[10px] text-surface-muted-foreground mt-2 italic">
                  Current: ₹{(current.total_income || 0).toLocaleString()}
                </p>
              </Card>

              {/* Expense Delta */}
              <Card className="border-l-4 border-l-red-500">
                <p className="text-xs text-surface-muted-foreground mb-1">Projected Expenses</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-surface-foreground">
                    ₹{(projected.total_expenses || 0).toLocaleString()}
                  </p>
                  <p className={`text-sm mb-1 ${impact.expense_delta <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {params.expense_change_pct >= 0 ? '↑' : '↓'} {Math.abs(params.expense_change_pct)}%
                  </p>
                </div>
                <p className="text-[10px] text-surface-muted-foreground mt-2 italic">
                  Current: ₹{(current.total_expenses || 0).toLocaleString()}
                </p>
              </Card>
            </div>

            {/* Profit Analysis */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-foreground mb-6 uppercase tracking-widest flex items-center gap-2">
                <PieChart className="w-4 h-4 text-brand" />
                Impact on Profitability
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-surface-muted-foreground">Profit Margin Impact</span>
                      <span className={`${(projected.profit_margin - current.profit_margin) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {projected.profit_margin?.toFixed(1)}% ({(projected.profit_margin - current.profit_margin)?.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand h-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.max(0, projected.profit_margin || 0))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-card rounded-xl border border-surface-border/50">
                    <p className="text-xs text-surface-muted-foreground mb-2">Net Profit Change</p>
                    <p className={`text-3xl font-bold ${(projected.net_profit - current.net_profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{(projected.net_profit || 0).toLocaleString()}
                    </p>
                    <p className="text-xs mt-1 text-surface-muted-foreground">
                      Difference: ₹{(projected.net_profit - current.net_profit || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-muted/30 p-6 rounded-2xl border border-dashed border-surface-border">
                  <h4 className="text-xs font-bold text-surface-foreground mb-4">Strategic Insight</h4>
                  <ul className="space-y-3">
                    <li className="flex gap-2 text-xs text-surface-muted-foreground">
                      <div className="w-1 h-1 bg-brand rounded-full mt-1.5 flex-shrink-0"></div>
                      {params.income_change_pct > 0 
                        ? `A ${params.income_change_pct}% expansion in revenue scales net profit by ₹${(projected.net_profit - current.net_profit).toLocaleString()}.`
                        : "Revenue contraction will significantly strain working capital."}
                    </li>
                    <li className="flex gap-2 text-xs text-surface-muted-foreground">
                      <div className="w-1 h-1 bg-brand rounded-full mt-1.5 flex-shrink-0"></div>
                      {params.expense_change_pct > 0
                        ? `Overhead increase of ${params.expense_change_pct}% reduces margin by ${(current.profit_margin - projected.profit_margin).toFixed(1)}%.`
                        : "Expense reduction optimization is improving operational efficiency."}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}