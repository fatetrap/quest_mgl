
import React, { useEffect, useRef, useState } from 'react';
import type { AnswerFeedback, ReviewMode } from '../types';

interface InputConsoleProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
  options: string[];
  mode: ReviewMode;
  feedback: AnswerFeedback;
}

export const InputConsole: React.FC<InputConsoleProps> = ({ onSendMessage, disabled, options, mode, feedback }) => {
  const [typed, setTyped] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset and focus the recall field at the start of each typed round.
  useEffect(() => {
    if (mode === 'TYPE' && feedback === null) {
      setTyped('');
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [mode, feedback]);

  const label = mode === 'TYPE' ? 'Speak From Memory' : 'Choose Your Words';

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || typed.trim().length === 0) return;
    onSendMessage(typed);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0c0a09]/95 backdrop-blur border-t-4 border-[#2a2118] p-4 md:p-6 z-30 shadow-[0_-10px_50px_rgba(0,0,0,0.9)]">
      <div className="max-w-5xl mx-auto relative">

        {/* Decorative label */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2a2118] text-[#d6d3d1] px-6 py-1 text-xs font-['Cinzel'] tracking-[0.2em] uppercase border-t-2 border-l-2 border-r-2 border-[#5c4a3d] shadow-lg whitespace-nowrap">
            {label}
            {mode !== 'TYPE' && options.length > 0 && (
                <span className="hidden md:inline text-[#78716c]"> — PRESS 1-{options.length}</span>
            )}
        </div>

        {mode === 'TYPE' ? (
            <TypeConsole
                typed={typed}
                setTyped={setTyped}
                onSubmit={submitTyped}
                disabled={disabled}
                feedback={feedback}
                inputRef={inputRef}
            />
        ) : options.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, index) => {
                    const isSelected = feedback?.selected === option;
                    const isCorrect = feedback?.correct === option;
                    const showFeedback = feedback !== null;

                    let stateClasses = 'border-[#44403c] text-[#a8a29e] hover:bg-[#292524] hover:border-[#a8a29e] hover:shadow-[0_0_15px_rgba(168,162,158,0.1)]';
                    if (showFeedback) {
                        if (isCorrect) {
                            stateClasses = 'border-emerald-500 text-emerald-200 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
                        } else if (isSelected && !feedback.isCorrect) {
                            stateClasses = 'border-red-600 text-red-300 bg-red-950/40 shadow-[0_0_20px_rgba(220,38,38,0.3)]';
                        } else {
                            stateClasses = 'border-[#44403c] text-[#57534e] opacity-60';
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => onSendMessage(option)}
                            disabled={disabled}
                            className={`
                                relative p-6 border-2 bg-[#1c1917] text-left group transition-all duration-200
                                active:scale-[0.99]
                                disabled:cursor-not-allowed disabled:hover:border-current
                                ${stateClasses}
                            `}
                        >
                            {/* Button Label */}
                            <span className="absolute top-2 right-2 text-[10px] text-[#57534e] font-mono group-hover:text-[#78716c]">
                               {index + 1}
                            </span>

                            <span className="font-['Cinzel'] text-xl md:text-2xl font-bold tracking-wide uppercase">
                                {option}
                            </span>

                            {/* Corner Accents */}
                            <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[8px] border-r-[8px] border-b-current border-r-transparent opacity-40"></div>
                        </button>
                    );
                })}
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

interface TypeConsoleProps {
  typed: string;
  setTyped: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  feedback: AnswerFeedback;
  inputRef: React.RefObject<HTMLInputElement>;
}

// Free-recall input: the learner must produce the translation from memory — the
// hardest, most durable form of retrieval practice. Reserved for mastered words.
const TypeConsole: React.FC<TypeConsoleProps> = ({ typed, setTyped, onSubmit, disabled, feedback, inputRef }) => {
  const showFeedback = feedback !== null;

  let fieldClasses = 'border-[#7f1d1d] text-[#fbbf24] focus:border-[#fcd34d]';
  if (showFeedback) {
    fieldClasses = feedback.isCorrect
        ? 'border-emerald-500 text-emerald-200'
        : 'border-red-600 text-red-300';
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            disabled={disabled}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Type the meaning in English..."
            className={`flex-1 bg-[#1c1917] border-2 px-6 py-5 font-['Cinzel'] text-xl md:text-2xl font-bold tracking-wide uppercase outline-none transition-colors placeholder:text-[#57534e] placeholder:normal-case placeholder:font-normal placeholder:tracking-normal disabled:opacity-60 ${fieldClasses}`}
        />
        <button
            type="submit"
            disabled={disabled || typed.trim().length === 0}
            className="px-8 bg-[#451a03] border-2 border-[#b45309] text-[#feb2b2] font-['Cinzel'] font-bold uppercase tracking-widest transition-all hover:bg-[#78350f] hover:text-white hover:border-[#fcd34d] disabled:opacity-40 disabled:cursor-not-allowed"
        >
            Strike
        </button>
      </div>
      <p className="text-center text-[10px] md:text-xs text-[#78716c] font-['Cinzel'] uppercase tracking-widest">
        ⚔ Mastery Trial — no choices, recall from memory
      </p>
    </form>
  );
};
