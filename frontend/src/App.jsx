import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/dashboard/Sidebar';
import { TopBar } from './components/dashboard/TopBar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Financials from './pages/Financials';
import Insights from './pages/Insights';
import Forecast from './pages/Forecast';
import Simulation from './pages/Simulation';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen bg-background text-surface-foreground selection:bg-brand-muted overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col relative w-full h-full overflow-hidden">
          <TopBar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/financials" element={<Financials />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="*" element={<div className="p-8">404 - Page not found</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
