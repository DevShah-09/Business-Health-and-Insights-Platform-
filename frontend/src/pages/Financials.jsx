import React, { useState } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, Zap } from 'lucide-react';
import { useFinancials } from '../hooks/useFinancials';
import { Card } from '../components/ui/Card';

import { PnLChart } from '../components/charts/PnLChart';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { MetricCard } from '../components/dashboard/MetricCard';


export default function Financials() {
  const {
    report,
    monthlyPnL,
    cashFlow,
    cashFlowTrend,
    burnRate,
    expenseBreakdown,
    incomeBreakdown,
    profitability,
    loading,
  } = useFinancials();

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[var(--color-surface)]">

        <div className="px-8 py-6 border-b border-surface-border/30 bg-surface-card/50">
          <h1 className="text-3xl font-bold text-surface-foreground mb-2">Analytics</h1>
          <p className="text-sm text-surface-muted-foreground">Detailed financial analysis and KPIs</p>
        </div>
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-surface-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const summary = report?.summary || {};
  const metrics = profitability || {};

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">

      
      {/* Page Header */}
      <div className="px-8 py-6 border-b border-surface-border/30 bg-surface-card/50">
        <h1 className="text-3xl font-bold text-surface-foreground mb-2">Analytics</h1>
        <p className="text-sm text-surface-muted-foreground">Detailed financial analysis and KPIs</p>
      </div>

      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Top KPI Cards */}

        {/* Profitability Metrics */}
        <Card>
          <h3 className="text-sm font-semibold text-surface-foreground mb-4">Profitability Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-card p-4 rounded-lg">
              <p className="text-xs text-surface-muted-foreground mb-1">Gross Margin</p>
              <p className="text-xl font-bold text-surface-foreground">{(metrics.gross_margin || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-surface-card p-4 rounded-lg">
              <p className="text-xs text-surface-muted-foreground mb-1">Net Margin</p>
              <p className="text-xl font-bold text-surface-foreground">{(metrics.net_margin || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-surface-card p-4 rounded-lg">
              <p className="text-xs text-surface-muted-foreground mb-1">Operating Ratio</p>
              <p className="text-xl font-bold text-surface-foreground">{(metrics.operating_ratio || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-surface-card p-4 rounded-lg">
              <p className="text-xs text-surface-muted-foreground mb-1">Expense Ratio</p>
              <p className="text-xl font-bold text-surface-foreground">{(metrics.expense_ratio || 0).toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        {/* P&L Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <h3 className="text-sm font-semibold text-surface-foreground mb-4">Profit & Loss Statement</h3>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPeriod === 'monthly'
                      ? 'bg-brand text-surface-foreground'
                      : 'bg-surface-muted text-surface-muted-foreground hover:bg-surface-muted'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPeriod('weekly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPeriod === 'weekly'
                      ? 'bg-brand text-surface-foreground'
                      : 'bg-surface-muted text-surface-muted-foreground hover:bg-surface-muted'
                  }`}
                >
                  Weekly
                </button>
              </div>
              {monthlyPnL && <PnLChart data={monthlyPnL} />}
            </Card>
          </div>

          <Card className="h-full">
            <h3 className="text-sm font-semibold text-surface-foreground mb-4">Cash Flow Summary</h3>
            <div className="space-y-4">
              <div className="bg-surface-card p-4 rounded-lg">
                <p className="text-xs text-surface-muted-foreground mb-1">Total Inflow</p>
                <p className="text-lg font-bold text-green-400">
                  ₹{(cashFlow?.total_inflow || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-surface-card p-4 rounded-lg">
                <p className="text-xs text-surface-muted-foreground mb-1">Total Outflow</p>
                <p className="text-lg font-bold text-red-400">
                  ₹{(cashFlow?.total_outflow || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-surface-card p-4 rounded-lg border border-brand/30">
                <p className="text-xs text-surface-muted-foreground mb-1">Net Cash Flow</p>
                <p className={`text-lg font-bold ${
                  (cashFlow?.net_cash_flow || 0) > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ₹{(cashFlow?.net_cash_flow || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-surface-card p-4 rounded-lg">
                <p className="text-xs text-surface-muted-foreground mb-1">Avg Daily Flow</p>
                <p className="text-lg font-bold text-surface-foreground">
                  ₹{(cashFlow?.average_daily_flow || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Category Spending */}
        <Card>
          <h3 className="text-sm font-semibold text-surface-foreground mb-4">Category Spending</h3>
          {expenseBreakdown && (
            <CategoryBarChart 
              data={expenseBreakdown.map(item => ({
                name: item.category,
                expenses: item.amount
              }))} 
            />
          )}
        </Card>


        {/* Burn Rate & Income Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-surface-foreground mb-4">Burn Rate Analysis</h3>
            <div className="space-y-4">
              <div className="bg-surface-card p-4 rounded-lg">
                <p className="text-xs text-surface-muted-foreground mb-1">Daily Burn Rate</p>
                <p className={`text-xl font-bold ${
                  (burnRate?.daily_burn_rate || 0) < 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  ₹{(burnRate?.daily_burn_rate || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-surface-card p-4 rounded-lg">
                <p className="text-xs text-surface-muted-foreground mb-1">Monthly Burn Rate</p>
                <p className={`text-xl font-bold ${
                  (burnRate?.monthly_burn_rate || 0) < 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  ₹{(burnRate?.monthly_burn_rate || 0).toFixed(2)}
                </p>
              </div>
              {burnRate?.runway_months && (
                <div className="bg-surface-card p-4 rounded-lg border border-[#f97316]/30">
                  <p className="text-xs text-surface-muted-foreground mb-1">Runway</p>
                  <p className="text-xl font-bold text-[#f97316]">{burnRate.runway_months.toFixed(1)} months</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-surface-foreground mb-4">Income Breakdown</h3>
            <div className="space-y-3">
              {incomeBreakdown?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface-card rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-foreground">{item.category}</p>
                    <p className="text-xs text-surface-muted-foreground">{item.percentage}% of total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">₹{(item.amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Expense Breakdown Table */}
        <Card>
          <h3 className="text-sm font-semibold text-surface-foreground mb-4">Expense Breakdown Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase text-surface-muted-foreground border-b border-surface-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">% of Total</th>
                  <th className="px-4 py-3 text-right font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3449]">
                {expenseBreakdown?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-card transition">
                    <td className="px-4 py-3 text-surface-foreground">{item.category}</td>
                    <td className="px-4 py-3 text-right text-surface-foreground font-medium">
                      ₹{(item.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block bg-brand/20 text-brand px-2.5 py-1 rounded text-xs font-medium">
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-surface-muted-foreground">
                      <span className="text-green-400">↓ 2.3%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
