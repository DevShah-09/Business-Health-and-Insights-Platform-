import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useAnalytics, useAlerts } from '../hooks/useAnalytics';
import { KPICard } from '../components/dashboard/KPICard';
import { HealthScore } from '../components/dashboard/HealthScore';
import { RevenueExpenseChart } from '../components/charts/RevenueExpenseChart';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { ExpensePieChart } from '../components/charts/ExpensePieChart';
import { AlertList } from '../components/alerts/AlertList';


export default function Dashboard() {
  const { data, loading } = useAnalytics();
  const { alerts, loading: alertsLoading } = useAlerts();

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">


      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Total Revenue" value={data?.kpis?.total_revenue} delta={data?.kpis?.revenue_delta} icon={TrendingUp} color="#22c55e" loading={loading} />
          <KPICard label="Total Expenses" value={data?.kpis?.total_expenses} delta={data?.kpis?.expense_delta} icon={TrendingDown} color="#ef4444" loading={loading} />
          <KPICard label="Net Profit" value={data?.kpis?.net_profit} delta={data?.kpis?.profit_delta} icon={DollarSign} color="#6366f1" loading={loading} />
          <KPICard label="Cash Balance" value={data?.kpis?.cash_balance} delta={data?.kpis?.cash_delta} icon={Wallet} color="#3b82f6" loading={loading} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueExpenseChart data={data?.trend} loading={loading} />
          </div>
          <div>
            <ExpensePieChart data={data?.expense_breakdown} loading={loading} />
          </div>
        </div>

        {/* Lower Grid: Bar Chart + Health + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CategoryBarChart data={data?.categories} loading={loading} />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
