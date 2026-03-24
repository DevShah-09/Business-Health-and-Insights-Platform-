import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ChatBubble } from './ChatBubble';
import { useChat } from '../../hooks/useChat';

export function ChatWindow({ businessId = '550e8400-e29b-41d4-a716-446655440001' }) {
  const { messages, loading, sendMessage } = useChat(businessId);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    
    try {
      await sendMessage(userMsg);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const displayMessages = messages.length > 0 ? messages : [
    { role: 'assistant', content: 'Hello! I am your AI financial assistant. I can help analyze your expenses, predict cash flow, or suggest budget optimizations. How can I help you today?' }
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-card)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-surface-border bg-background/30 px-6 py-4">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-surface-foreground">Ask AI Insights</h2>
          <p className="text-xs text-surface-muted-foreground">Powered by AI Financial Advisor</p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6">
        {displayMessages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-brand mt-4">
            <Loader2 size={16} className="animate-spin" />
            Generating analysis...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-surface-border bg-background/30 p-4">
        <form
          onSubmit={handleSend}
          className="relative flex items-center rounded-2xl border border-surface-border bg-background px-4 py-2 transition-colors focus-within:border-brand focus-within:ring-1 focus-within:ring-[#6366f1]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about revenue, expenses, or forecasting..."
            className="flex-1 bg-transparent py-2 text-sm text-surface-foreground placeholder-slate-500 outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-surface-foreground transition hover:bg-brand-hover disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
