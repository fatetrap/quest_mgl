
import React from 'react';

interface InputConsoleProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
  options: string[];
}

export const InputConsole: React.FC<InputConsoleProps> = ({ onSendMessage, disabled, options }) => {
  
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0c0a09]/95 backdrop-blur border-t-4 border-[#2a2118] p-4 md:p-6 z-30 shadow-[0_-10px_50px_rgba(0,0,0,0.9)]">
      <div className="max-w-5xl mx-auto relative">
        
        {/* Decorative label */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2a2118] text-[#d6d3d1] px-6 py-1 text-xs font-['Cinzel'] tracking-[0.2em] uppercase border-t-2 border-l-2 border-r-2 border-[#5c4a3d] shadow-lg">
            Choose Your Words
        </div>

        {options.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onSendMessage(option)}
                        disabled={disabled}
                        className={`
                            relative p-6 border-2 bg-[#1c1917] text-left group transition-all duration-200
                            hover:bg-[#292524] hover:border-[#a8a29e] hover:shadow-[0_0_15px_rgba(168,162,158,0.1)]
                            active:scale-[0.99]
                            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#44403c]
                            border-[#44403c] text-[#a8a29e]
                        `}
                    >
                        {/* Button Label */}
                        <span className="absolute top-2 right-2 text-[10px] text-[#57534e] font-mono group-hover:text-[#78716c]">
                           {index + 1}
                        </span>
                        
                        <span className="font-['Cinzel'] text-xl md:text-2xl font-bold tracking-wide uppercase group-hover:text-[#e7e5e4]">
                            {option}
                        </span>
                        
                        {/* Corner Accents */}
                        <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[8px] border-r-[8px] border-b-[#44403c] border-r-transparent group-hover:border-b-[#a8a29e] transition-colors"></div>
                    </button>
                ))}
            </div>
        ) : (
            <div className="w-full h-24 flex items-center justify-center border-2 border-dashed border-[#44403c] text-[#57534e] font-['Cinzel'] tracking-widest animate-pulse">
                THE WINDS ARE SILENT...
            </div>
        )}
      </div>
    </div>
  );
};