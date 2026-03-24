import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react';
import { useFinancials } from '../hooks/useFinancials';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/dashboard/TopBar';
import { PnLChart } from '../components/charts/PnLChart';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { ExpensePieChart } from '../components/charts/ExpensePieChart';
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
        <TopBar title="Financial Statements" subtitle="Comprehensive financial analysis and reports" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-slate-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const summary = report?.summary || {};
  const metrics = profitability || {};

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">
      <TopBar title="Financial Statements" subtitle="Comprehensive financial analysis and reports" />

      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Income"
            value={`$${(summary.total_income || 0).toLocaleString()}`}
            change="+12%"
            icon={TrendingUp}
            trend="up"
          />
          <MetricCard
            label="Total Expenses"
            value={`$${(summary.total_expenses || 0).toLocaleString()}`}
            change="+5%"
            icon={TrendingDown}
            trend="neutral"
          />
          <MetricCard
            label="Net Profit"
            value={`$${(summary.net_profit || 0).toLocaleString()}`}
            change={`${(summary.profit_margin || 0).toFixed(1)}%`}
            icon={DollarSign}
            trend={(summary.net_profit || 0) > 0 ? 'up' : 'down'}
          />
          <MetricCard
            label="Profit Margin"
            value={`${(summary.profit_margin || 0).toFixed(1)}%`}
            change={`Net margin: ${(metrics.net_margin || 0).toFixed(1)}%`}
            icon={Zap}
            trend={(summary.profit_margin || 0) > 25 ? 'up' : 'neutral'}
          />
        </div>

        {/* Profitability Metrics */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">Profitability Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1a2436] p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Gross Margin</p>
              <p className="text-xl font-bold text-white">{(metrics.gross_margin || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-[#1a2436] p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Net Margin</p>
              <p className="text-xl font-bold text-white">{(metrics.net_margin || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-[#1a2436] p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Operating Ratio</p>
              <p className="text-xl font-bold text-white">{(metrics.operating_ratio || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-[#1a2436] p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Expense Ratio</p>
              <p className="text-xl font-bold text-white">{(metrics.expense_ratio || 0).toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        {/* P&L Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <h3 className="text-sm font-semibold text-white mb-4">Profit & Loss Statement</h3>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPeriod === 'monthly'
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[#2d3449] text-slate-300 hover:bg-[#3a4456]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPeriod('weekly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPeriod === 'weekly'
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[#2d3449] text-slate-300 hover:bg-[#3a4456]'
                  }`}
                >
                  Weekly
                </button>
              </div>
              {monthlyPnL && <PnLChart data={monthlyPnL} />}
            </Card>
          </div>

          <Card className="h-full">
            <h3 className="text-sm font-semibold text-white mb-4">Cash Flow Summary</h3>
            <div className="space-y-4">
              <div className="bg-[#1a2436] p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Total Inflow</p>
                <p className="text-lg font-bold text-green-400">
                  ${(cashFlow?.total_inflow || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1a2436] p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Total Outflow</p>
                <p className="text-lg font-bold text-red-400">
                  ${(cashFlow?.total_outflow || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1a2436] p-4 rounded-lg border border-[#6366f1]/30">
                <p className="text-xs text-slate-400 mb-1">Net Cash Flow</p>
                <p className={`text-lg font-bold ${
                  (cashFlow?.net_cash_flow || 0) > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${(cashFlow?.net_cash_flow || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1a2436] p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Avg Daily Flow</p>
                <p className="text-lg font-bold text-white">
                  ${(cashFlow?.average_daily_flow || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Cash Flow Trend & Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Cash Flow Trend</h3>
            {cashFlowTrend && <CashFlowChart data={cashFlowTrend} />}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Expense Breakdown</h3>
            {expenseBreakdown && <ExpensePieChart data={expenseBreakdown} />}
          </Card>
        </div>

        {/* Burn Rate & Income Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Burn Rate Analysis</h3>
            <div className="space-y-4">
              <div className="bg-[#1a2436] p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Daily Burn Rate</p>
                <p className={`text-xl font-bold ${
                  (burnRate?.daily_burn_rate || 0) < 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  ${(burnRate?.daily_burn_rate || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-[#1a2436] p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Monthly Burn Rate</p>
                <p className={`text-xl font-bold ${
                  (burnRate?.monthly_burn_rate || 0) < 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  ${(burnRate?.monthly_burn_rate || 0).toFixed(2)}
                </p>
              </div>
              {burnRate?.runway_months && (
                <div className="bg-[#1a2436] p-4 rounded-lg border border-[#f97316]/30">
                  <p className="text-xs text-slate-400 mb-1">Runway</p>
                  <p className="text-xl font-bold text-[#f97316]">{burnRate.runway_months.toFixed(1)} months</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Income Breakdown</h3>
            <div className="space-y-3">
              {incomeBreakdown?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#1a2436] rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.category}</p>
                    <p className="text-xs text-slate-400">{item.percentage}% of total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">${(item.amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Expense Breakdown Table */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">Expense Breakdown Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#131b2e] text-xs uppercase text-slate-500 border-b border-[#2d3449]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">% of Total</th>
                  <th className="px-4 py-3 text-right font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3449]">
                {expenseBreakdown?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#1a2436] transition">
                    <td className="px-4 py-3 text-white">{item.category}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      ${(item.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block bg-[#6366f1]/20 text-[#c0c1ff] px-2.5 py-1 rounded text-xs font-medium">
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
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
