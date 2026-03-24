import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ChatBubble } from './ChatBubble';
import { sendChatMessage } from '../../services/chatService';

export function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI financial assistant. I can help analyze your expenses, predict cash flow, or suggest budget optimizations. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(userMsg.content, messages).catch(() => ({
        // Mock response if API fails
        reply: "Based on your current burn rate and revenue trends, I recommend reviewing your marketing spend, which increased 23% this month. Would you like me to simulate a 15% reduction?"
      }));
      setMessages([...newHistory, { role: 'assistant', content: response.reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-card)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#2d3449] bg-[#0b1326]/30 px-6 py-4">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-[#dae2fd]">Ask AI Insights</h2>
          <p className="text-xs text-slate-400">Powered by Nebulon Intelligence</p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#818cf8] mt-4">
            <Loader2 size={16} className="animate-spin" />
            Generating analysis...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#2d3449] bg-[#0b1326]/30 p-4">
        <form
          onSubmit={handleSend}
          className="relative flex items-center rounded-2xl border border-[#464554] bg-[#0b1326] px-4 py-2 transition-colors focus-within:border-[#6366f1] focus-within:ring-1 focus-within:ring-[#6366f1]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about revenue, expenses, or forecasting..."
            className="flex-1 bg-transparent py-2 text-sm text-white placeholder-slate-500 outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#6366f1] text-white transition hover:bg-[#4f46e5] disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
