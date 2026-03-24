import React, { useEffect, useRef } from 'react';
import { Message, Sender } from '../types';
import { User, Shield, Volume2 } from 'lucide-react';

interface ArenaProps {
  messages: Message[];
}

export const Arena: React.FC<ArenaProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 w-full overflow-y-auto p-4 md:p-8 space-y-6 relative z-10 pb-[450px] md:pb-[280px] scroll-smooth"
    >
      {messages.map((msg) => {
        const isUser = msg.sender === Sender.USER;
        const isSystem = msg.sender === Sender.SYSTEM;
        
        if (isSystem) {
            return (
                <div key={msg.id} className="flex justify-center w-full animate-pulse">
                    <div className="bg-[#1a1410]/90 border border-[#78350f] text-[#d97706] text-xs font-['Cinzel'] px-4 py-2 uppercase tracking-widest backdrop-blur-sm shadow-lg">
                        <span className="mr-2 text-red-500">⚠ THE SPIRITS WHISPER:</span>
                        {msg.text}
                    </div>
                </div>
            );
        }

        return (
          <div 
            key={msg.id} 
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                relative max-w-[90%] md:max-w-[80%] flex gap-3
                ${isUser ? 'flex-row-reverse' : 'flex-row'}
              `}
            >
              {/* Avatar Icon */}
              <div className={`
                shrink-0 w-12 h-12 flex items-center justify-center border-2 shadow-lg
                ${isUser 
                    ? 'border-[#8c7a6b] bg-[#2a2118] text-[#e7e5e4]' 
                    : 'border-[#7f1d1d] bg-[#450a0a] text-[#fca5a5]'}
              `}>
                {isUser ? <User size={24} /> : <Shield size={24} />}
              </div>

              {/* Message Bubble */}
              <div className={`
                flex-1 px-6 pb-6 pt-10 border-2 relative
                font-['Cinzel'] text-base md:text-xl font-bold tracking-wide leading-relaxed shadow-xl
                ${isUser 
                    ? 'bg-[#2a2118]/95 border-[#5c4a3d] text-[#e7e5e4]' 
                    : 'bg-[#1a0505]/95 border-[#7f1d1d] text-[#fca5a5]'}
              `}>
                {/* Decorative Corners */}
                <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${isUser ? 'border-[#a8a29e]' : 'border-[#ef4444]'}`}></div>
                <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${isUser ? 'border-[#a8a29e]' : 'border-[#ef4444]'}`}></div>
                <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${isUser ? 'border-[#a8a29e]' : 'border-[#ef4444]'}`}></div>
                <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${isUser ? 'border-[#a8a29e]' : 'border-[#ef4444]'}`}></div>

                {/* Label */}
                <div className={`
                    absolute -top-3 px-2 text-[10px] font-bold tracking-widest bg-[#0f0b08] border
                    ${isUser ? 'right-4 text-[#a8a29e] border-[#5c4a3d]' : 'left-4 text-[#ef4444] border-[#7f1d1d]'}
                `}>
                    {isUser ? 'YOUR VOICE' : 'BATZORIG SPEAKS'}
                </div>

                {/* Text Content */}
                <span className={msg.isMongolian ? 'text-2xl md:text-3xl font-["Oswald"] tracking-wide block text-[#fbbf24]' : ''}>
                    {msg.text}
                </span>

                {/* Phonetic Guide (Only for Opponent Mongolian Text) */}
                {msg.phonetic && (
                    <div className="mt-4 pt-3 border-t border-[#78350f]/50 flex items-center gap-2 text-[#d97706]">
                        <Volume2 size={16} />
                        <span className="text-sm font-['Oswald'] tracking-widest opacity-80">
                            SAY: <span className="text-[#fbbf24] font-bold uppercase">[{msg.phonetic}]</span>
                        </span>
                    </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};