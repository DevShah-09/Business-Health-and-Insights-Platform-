import React from 'react';
import { ShieldAlert, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useForecast } from '../hooks/useForecast';
import { Card } from '../components/ui/Card';
import { ForecastChart } from '../components/charts/ForecastChart';


export default function Forecast() {
  const { forecast, loading } = useForecast();

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">



      <main className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1600px] w-full mx-auto">
        <div className="lg:col-span-3 space-y-6">
          <ForecastChart data={forecast?.monthly} loading={loading} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex items-center gap-4">
               <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                  <TrendingUp size={24} />
               </div>
               <div>
                  <p className="text-xs text-surface-muted-foreground">Projected Revenue</p>
                  <p className="text-xl font-bold text-surface-foreground">
                    ₹{(forecast?.summary?.predicted_revenue || 0).toLocaleString()}
                  </p>
               </div>
            </Card>
            <Card className="flex items-center gap-4 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
               <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <p className="text-xs text-surface-muted-foreground">Projected Expenses</p>
                  <p className="text-xl font-bold text-surface-foreground">
                    ₹{(forecast?.summary?.predicted_expenses || 0).toLocaleString()}
                  </p>
               </div>
            </Card>
            <Card className="flex items-center gap-4 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
               <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                  <WalletIcon />
               </div>
               <div>
                  <p className="text-xs text-surface-muted-foreground">End-of-Year Cash</p>
                  <p className="text-xl font-bold text-surface-foreground">
                    ₹{(forecast?.summary?.predicted_cashflow || 0).toLocaleString()}
                  </p>
               </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-surface-foreground mb-4">Model Confidence</h3>
            <div className="space-y-4">
              <div>
                 <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-muted-foreground">Revenue Prediction</span>
                    <span className="text-green-400">{forecast?.summary?.revenue_confidence}%</span>
                 </div>
                 <div className="w-full bg-surface-muted rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${forecast?.summary?.revenue_confidence || 0}%` }}></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-muted-foreground">Expense Prediction</span>
                    <span className="text-brand">{forecast?.summary?.expense_confidence}%</span>
                 </div>
                 <div className="w-full bg-surface-muted rounded-full h-1.5">
                    <div className="bg-brand h-1.5 rounded-full" style={{ width: `${forecast?.summary?.expense_confidence || 0}%` }}></div>
                 </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-surface-muted/30 border border-surface-border/30">
              <p className="text-xs text-surface-muted-foreground leading-relaxed flex items-start gap-2">
                 <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                 Confidence levels above 80% indicate stable historical patterns with low volatility in recent months.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
