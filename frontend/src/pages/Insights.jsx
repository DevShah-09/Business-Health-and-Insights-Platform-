import React from 'react';
import { useInsights } from '../hooks/useInsights';
import { TopBar } from '../components/dashboard/TopBar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ChatWindow } from '../components/chat/ChatWindow';

export default function Insights() {
  const { insights, loading } = useInsights();

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">
      <TopBar title="AI Insights" subtitle="Predictive intelligence and recommendations" />

      <main className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 max-w-[1600px] w-full mx-auto h-[calc(100vh-80px)]">
        
        {/* Left Panel: Insights List */}
        <div className="xl:col-span-3 space-y-4 overflow-y-auto pr-2 pb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 sticky top-0 bg-[#0b1326] py-2 z-10">
            Actionable Opportunities
          </h3>
          
          {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <Card key={i} className="h-32 animate-pulse bg-[#171f33]" />)}
            </div>
          ) : (
            insights.map((insight) => (
              <Card key={insight.id} className="relative overflow-hidden group">
                {/* Accent line based on impact */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  insight.impact === 'High' ? 'bg-amber-500' : 
                  insight.impact === 'Medium' ? 'bg-[#6366f1]' : 'bg-green-500'
                }`} />
                
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-xl">
                      <span>{insight.icon}</span>
                      <h4 className="text-base font-bold text-white">{insight.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="default">{insight.category}</Badge>
                      <Badge variant={insight.impact === 'High' ? 'warning' : 'info'}>{insight.impact} Impact</Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 leading-relaxed mb-4 mt-2 max-w-2xl">
                    {insight.description}
                  </p>
                  
                  <button className="text-sm font-semibold text-[#818cf8] hover:text-[#c0c1ff] transition flex items-center gap-1 group-hover:translate-x-1">
                    ↳ {insight.action}
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="xl:col-span-2 h-full pb-6">
          <ChatWindow />
        </div>
        
      </main>
    </div>
  );
}
