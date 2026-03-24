/**
 * Sidebar navigation component with React Router NavLinks
 */
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Lightbulb,
  TrendingUp, Sliders, Bot, ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',            label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions',label: 'Transactions', icon: ArrowLeftRight   },
  { to: '/financials',  label: 'Financials',   icon: BarChart3        },
  { to: '/insights',    label: 'AI Insights',  icon: Lightbulb        },
  { to: '/forecast',    label: 'Forecast',     icon: TrendingUp       },
  { to: '/simulation',  label: 'Simulation',   icon: Sliders          },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-[#131b2e] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8083ff]">
          <Bot size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">Nebulon AI</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Business Health</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 px-2 py-2 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#6366f1]/20 text-[#c0c1ff] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:bg-[#2d3449]/60 hover:text-slate-200'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2d3449] text-slate-400 shadow hover:text-white transition"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Footer */}
      <div className={`px-4 py-4 border-t border-[#464554]/20 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">SME Platform v1.0</p>
        )}
      </div>
    </aside>
  );
}
