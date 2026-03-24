import React, { useMemo } from 'react';
import { IndianRupee, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useAnalytics, useAlerts } from '../hooks/useAnalytics';
import { useTransactions } from '../hooks/useTransactions';
import { KPICard } from '../components/dashboard/KPICard';
import { HealthScore } from '../components/dashboard/HealthScore';
import { RevenueExpenseChart } from '../components/charts/RevenueExpenseChart';
import { AlertList } from '../components/alerts/AlertList';

function formatCurrency(val) {
  const number = Number(val) || 0;
  if (number >= 1_000_000) return `₹${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `₹${(number / 1_000).toFixed(1)}K`;
  return `₹${number.toLocaleString()}`;
}

export default function Dashboard() {
  const { data, loading, error } = useAnalytics();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { transactions } = useTransactions();

  // Compute how pending transactions would affect the cash balance
  const { pendingAdjustment, pendingCount } = useMemo(() => {
    const pending = (transactions || []).filter((tx) => tx.status === 'pending');
    const adjustment = pending.reduce((sum, tx) => {
      return tx.type === 'income'
        ? sum + Number(tx.amount)
        : sum - Number(tx.amount);
    }, 0);
    return { pendingAdjustment: adjustment, pendingCount: pending.length };
  }, [transactions]);

  const cashBalance = data?.kpis?.cash_balance ?? 0;
  const adjustedBalance = cashBalance + pendingAdjustment;

  if (error) {
    return (
      <div className="flex flex-col h-full bg-[var(--color-surface)] items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 max-w-md">
          <p className="text-red-400 font-semibold mb-2">Connection Error</p>
          <p className="text-surface-muted-foreground text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">

      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Total Revenue" value={data?.kpis?.total_revenue} delta={data?.kpis?.revenue_delta} icon={TrendingUp} color="#22c55e" loading={loading} />
          <KPICard label="Total Expenses" value={data?.kpis?.total_expenses} delta={data?.kpis?.expense_delta} icon={TrendingDown} color="#ef4444" loading={loading} />
          <KPICard label="Net Profit" value={data?.kpis?.net_profit} delta={data?.kpis?.profit_delta} icon={IndianRupee} color="#6366f1" loading={loading} />

          {/* Cash Balance — custom card with pending adjustment */}
          <div className="card group relative overflow-hidden transition-all duration-200 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-0.5 min-h-[160px] flex flex-col items-center justify-center text-center p-6">
            <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-80" style={{ background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)' }} />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#3b82f622' }}>
              <Wallet size={24} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-surface-muted-foreground opacity-80">Cash Balance</p>
              {loading ? (
                <div className="h-8 w-32 rounded bg-surface-muted mt-2 mx-auto animate-pulse" />
              ) : (
                <>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-surface-foreground" style={{ letterSpacing: '-0.04em' }}>
                    {formatCurrency(cashBalance)}
                  </p>
                  {pendingCount > 0 && (
                    <p className={`mt-1.5 text-sm font-medium ${adjustedBalance >= cashBalance ? 'text-green-400' : 'text-amber-400'}`}>
                      ({formatCurrency(adjustedBalance)} after {pendingCount} pending)
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6">
          <RevenueExpenseChart data={data?.trend} loading={loading} />
        </div>

        {/* Lower Grid: Health + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthScore
              score={data?.health_score}
              profitMargin={data?.profit_margin}
              growthRate={data?.growth_rate}
              expenseRatio={data?.expense_ratio}
              loading={loading}
            />
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-muted-foreground">Active Alerts</h3>
              <AlertList alerts={alerts} loading={alertsLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
