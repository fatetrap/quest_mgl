import React from 'react';
import { GameState } from '../types';

interface GameOverOverlayProps {
  status: GameState['status'];
  onRestart: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ status, onRestart }) => {
  if (status === 'ACTIVE') return null;

  const isVictory = status === 'VICTORY';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="text-center space-y-8 p-8 border-y-8 border-double w-full max-w-4xl relative overflow-hidden">
        
        {/* Dynamic Borders */}
        <div className={`absolute top-0 left-0 w-full h-1 ${isVictory ? 'bg-white' : 'bg-red-600'}`}></div>
        <div className={`absolute bottom-0 left-0 w-full h-1 ${isVictory ? 'bg-white' : 'bg-red-600'}`}></div>

        <h1 
            className={`text-7xl md:text-9xl font-black font-['Oswald'] uppercase tracking-tighter glitch ${isVictory ? 'text-white' : 'text-red-600'}`} 
            data-text={isVictory ? "OPPONENT CRUSHED" : "TORSO SMASHED"}
        >
          {isVictory ? "OPPONENT CRUSHED" : "TORSO SMASHED"}
        </h1>
        
        <p className="text-2xl font-mono text-zinc-400 tracking-widest uppercase">
          {isVictory 
            ? "Dominance Established. The Driver is silent." 
            : "Critical Structural Failure. Argument Lost."}
        </p>

        <button
          onClick={onRestart}
          className={`mt-12 px-12 py-4 text-2xl font-bold uppercase tracking-widest border-4 transition-all hover:scale-110
            ${isVictory 
                ? 'border-white text-white hover:bg-white hover:text-black' 
                : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-black'}
          `}
        >
          Re-Initialize
        </button>
      </div>
    </div>
  );
};