/**
 * TopBar — page header with title and user info
 */
import React from 'react';
import { Bell, User } from 'lucide-react';

export function TopBar({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#464554]/20 bg-[#0b1326]/50 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-bold text-[#dae2fd] leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#171f33] text-slate-400 transition hover:text-white">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#6366f1]" />
        </button>
        <div className="flex items-center gap-2 rounded-xl bg-[#171f33] px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8083ff]">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">SME Owner</p>
            <p className="text-[10px] text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
