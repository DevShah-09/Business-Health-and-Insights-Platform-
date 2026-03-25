import React from 'react';
import { useInsights } from '../hooks/useInsights';

import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ChatWindow } from '../components/chat/ChatWindow';


export default function Insights() {
  const { insights, loading, refetch } = useInsights();

  /** Convert snake_case to Title Case (e.g. Services → Professional Services) */
  const formatText = (text) =>
    typeof text === 'string'
      ? text.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : text;

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">



      <main className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 max-w-[1600px] w-full mx-auto h-[calc(100vh-80px)]">
        
        {/* Left Panel: Insights List */}
        <div className="xl:col-span-3 space-y-4 overflow-y-auto pr-2 pb-6">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-background py-2 z-10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-muted-foreground">
              Actionable Opportunities
            </h3>
            <button 
              onClick={() => refetch()}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                loading 
                ? 'bg-surface-card text-surface-muted-foreground cursor-not-allowed' 
                : 'bg-brand hover:bg-brand-hover text-white shadow-lg hover:shadow-brand/20 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate Insights
                </>
              )}
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <Card key={i} className="h-32 animate-pulse bg-surface-card" />)}
            </div>
          ) : (
            insights.map((insight) => (
              <Card key={insight.id} className="relative overflow-hidden group">
                {/* Accent line based on impact */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  insight.impact === 'High' ? 'bg-amber-500' : 
                  insight.impact === 'Medium' ? 'bg-brand' : 'bg-green-500'
                }`} />
                
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-xl">
                      <span>{insight.icon}</span>
                      <h4 className="text-base font-bold text-surface-foreground">{formatText(insight.title)}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="default">{insight.category}</Badge>
                      <Badge variant={insight.impact === 'High' ? 'warning' : 'info'}>{insight.impact} Impact</Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-surface-muted-foreground leading-relaxed mb-4 mt-2 max-w-2xl">
                    {formatText(insight.description)}
                  </p>
                  
                  <button className="text-sm font-semibold text-brand hover:text-brand transition flex items-center gap-1 group-hover:translate-x-1">
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
