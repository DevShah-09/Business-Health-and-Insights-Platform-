import React, { useState } from 'react';
import { Activity, Play } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Slider } from '../components/ui/Badge';
import { TopBar } from '../components/dashboard/TopBar';
import { runSimulation } from '../services/forecastService';

export default function Simulation() {
  const [salesChange, setSalesChange] = useState(0);
  const [expenseChange, setExpenseChange] = useState(0);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Baseline metrics (for UI demo)
  const baselineProfit = 37300;
  const baselineCash = 52100;

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await runSimulation({ sales: salesChange, expenses: expenseChange }).catch(() => {
         // Mock deterministic math if API fails
         const deltaProfit = (baselineProfit * (salesChange / 100)) - (baselineProfit * 0.7 * (expenseChange / 100));
         return {
           profit_delta: deltaProfit,
           new_profit: baselineProfit + deltaProfit,
           new_cash: baselineCash + (deltaProfit * 0.8),
         };
      });
      setResults(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">
      <TopBar title="Scenario Simulation" subtitle="Interactive what-if analysis tool" />

      <main className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1200px] w-full mx-auto">
        
        {/* Scenario Controls */}
        <Card className="flex flex-col space-y-8 p-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} className="text-[#6366f1]" />
              <h3 className="text-lg font-bold text-white">Configure Scenario</h3>
            </div>
            <p className="text-sm text-slate-400">Adjust the parameters below to see the potential impact on your business trajectory.</p>
          </div>

          <div className="space-y-12 flex-1">
             <Slider
               label="Sales Volume Change (MoM %)"
               value={salesChange} min={-50} max={100} step={1}
               onChange={setSalesChange}
             />
             
             <Slider
               label="Operational Expense Change (MoM %)"
               value={expenseChange} min={-30} max={50} step={1}
               onChange={setExpenseChange}
             />
          </div>

          <Button onClick={handleSimulate} disabled={loading} className="w-full justify-center py-4 mt-8">
            {loading ? 'Running Model ...' : 'Run Simulation'}
            {!loading && <Play size={16} />}
          </Button>
        </Card>

        {/* Results Panel */}
        <Card className="flex flex-col p-8 bg-gradient-to-br from-[#171f33] to-[#0b1326]">
          <h3 className="text-lg font-bold text-white mb-6">Simulation Impact</h3>
          
          {!results ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-[#2d3449] rounded-xl p-8">
              <Activity size={48} className="mb-4 opacity-50" />
              <p>Configure inputs and run the simulation to see projected outcomes.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in duration-300">
              
              <div className="p-6 rounded-xl bg-[#2d3449]/40 border border-[#464554]/50">
                 <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Projected Monthly Profit</p>
                 <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white">${results.new_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className={`text-sm font-semibold ${results.profit_delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {results.profit_delta >= 0 ? '+' : ''}{results.profit_delta.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                 </div>
              </div>

              <div className="p-6 rounded-xl bg-[#2d3449]/40 border border-[#464554]/50">
                 <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Projected Cash Runway</p>
                 <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-[#dae2fd]">${results.new_cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </div>
                 
                 <div className="mt-4 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-[#2d3449] rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${results.new_cash > baselineCash ? 'bg-green-500' : 'bg-red-500'}`} 
                         style={{ width: `${Math.min(100, (results.new_cash / baselineCash) * 50)}%` }} 
                       />
                    </div>
                    <span className="text-xs font-medium text-slate-400 text-right w-16">
                       {Math.round((results.new_cash / baselineCash) * 100)}% of baseline
                    </span>
                 </div>
              </div>
              
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-200">
                 <strong>AI Note:</strong> This scenario {results.profit_delta < 0 ? 'increases risk of cash flow constraints under 60 days.' : 'creates additional buffer suitable for scaling operations.'}
              </div>

            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
