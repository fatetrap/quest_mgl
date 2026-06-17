import React from 'react';
import { GameState } from '../types';

interface GameOverOverlayProps {
  status: GameState['status'];
  onRestart: () => void;
  answered: number;
  correct: number;
  advanced: number;
  mastered: number;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  status,
  onRestart,
  answered,
  correct,
  advanced,
  mastered,
}) => {
  if (status === 'ACTIVE' || status === 'ONBOARDING') return null;

  const isVictory = status === 'VICTORY';
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  const summary = [
    { label: 'Words Drilled', value: String(answered) },
    { label: 'Accuracy', value: `${accuracy}%` },
    { label: 'Advanced', value: String(advanced) },
    { label: 'Newly Mastered', value: String(mastered) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-500 p-4">
      <div className="text-center space-y-6 md:space-y-8 p-8 border-y-8 border-double w-full max-w-4xl relative overflow-hidden">

        {/* Dynamic Borders */}
        <div className={`absolute top-0 left-0 w-full h-1 ${isVictory ? 'bg-white' : 'bg-red-600'}`}></div>
        <div className={`absolute bottom-0 left-0 w-full h-1 ${isVictory ? 'bg-white' : 'bg-red-600'}`}></div>

        <h1
            className={`text-6xl md:text-9xl font-black font-['Oswald'] uppercase tracking-tighter glitch ${isVictory ? 'text-white' : 'text-red-600'}`}
            data-text={isVictory ? "HONOR EARNED" : "CAST OUT"}
        >
          {isVictory ? "HONOR EARNED" : "CAST OUT"}
        </h1>

        <p className="text-xl md:text-2xl font-mono text-zinc-400 tracking-widest uppercase">
          {isVictory
            ? "The Khan's Guard bows. You belong on the steppe."
            : "Your spirit is broken — but the words you learned remain."}
        </p>

        {/* Session learning summary */}
        {answered > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {summary.map(stat => (
              <div key={stat.label} className="border-2 border-[#5c4a3d] bg-[#1c1917]/80 px-3 py-4">
                <div className={`text-3xl md:text-4xl font-black font-['Oswald'] ${isVictory ? 'text-[#fcd34d]' : 'text-[#d97706]'}`}>
                  {stat.value}
                </div>
                <div className="text-[10px] md:text-xs font-['Cinzel'] uppercase tracking-widest text-[#8c7a6b] mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onRestart}
          className={`mt-4 md:mt-8 px-12 py-4 text-2xl font-bold uppercase tracking-widest border-4 transition-all hover:scale-110
            ${isVictory
                ? 'border-white text-white hover:bg-white hover:text-black'
                : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-black'}
          `}
        >
          {isVictory ? 'Ride Again' : 'Rise Again'}
        </button>
      </div>
    </div>
  );
};
