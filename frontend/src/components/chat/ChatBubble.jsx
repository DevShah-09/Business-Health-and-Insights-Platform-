import React from 'react';
import { User, Bot } from 'lucide-react';

export function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isUser 
            ? 'bg-[#2d3449] text-slate-300' 
            : 'bg-gradient-to-br from-[#6366f1] to-[#8083ff] text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
            isUser 
              ? 'bg-[#2d3449] text-[#dae2fd] rounded-tr-sm' 
              : 'bg-gradient-to-br from-[#171f33] to-[#131b2e] border border-[#2d3449] text-[#dae2fd] rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
          }`}>
            {message.content.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
