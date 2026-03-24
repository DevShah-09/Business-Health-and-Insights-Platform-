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
            ? 'bg-[#edd6c1] text-[#714f3b]' 
            : 'bg-gradient-to-br from-[#a35e30] to-[#804218] text-[#f9f9f8]'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-surface-muted-foreground">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
            isUser 
              ? 'bg-[#e2c5ae] text-[#332117] rounded-tr-sm border border-[#d2b399]' 
              : 'bg-gradient-to-br from-[#dfcdb9] to-[#d3bda6] border border-[#c4a991] text-[#2b1b11] rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
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
