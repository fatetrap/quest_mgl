
import React from 'react';
import { GameState, OPPONENT_NAME, OPPONENT_CLASS } from '../types';
import { Skull, Flame, Sword } from 'lucide-react';

interface HUDProps {
  gameState: GameState;
}

export const HUD: React.FC<HUDProps> = ({ gameState }) => {
  const { integrity, opponentImage, streak } = gameState;

  // Determine health bar color
  const healthColor = integrity < 30 ? 'bg-red-800' : 'bg-amber-600';
  
  // Determine streak bar fill (10 steps)
  const streakPercentage = (streak / 10) * 100;

  return (
    <header className="w-full border-b-4 border-[#2a2118] bg-[#1a1410]/95 backdrop-blur-md p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-20 relative shadow-2xl">
      {/* User Stats */}
      <div className="flex items-center gap-4 w-full md:w-1/4 border-r-0 md:border-r-2 border-[#2a2118] pr-4">
        <div className="p-2 border-2 border-[#4a3b32] bg-[#2a2118]">
           <Flame className={`w-8 h-8 ${integrity < 30 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex justify-between">
            <span className="text-xs text-[#8c7a6b] tracking-widest font-bold uppercase font-['Cinzel']">Spirit</span>
            <span className={`text-xs font-mono font-bold ${integrity < 30 ? 'text-red-500' : 'text-amber-500'}`}>{integrity}%</span>
          </div>
          <div className="w-full h-2 bg-[#2a2118] mt-1 border border-[#4a3b32]">
            <div className={`h-full transition-all duration-300 ${healthColor}`} style={{ width: `${integrity}%` }}></div>
          </div>
        </div>
      </div>

      {/* Streak / Honor Bar */}
      <div className="flex-1 w-full px-4 flex flex-col justify-center relative">
        <div className="flex justify-between text-xs text-[#8c7a6b] font-['Cinzel'] mb-1 uppercase font-bold tracking-widest">
           <span>Honor: {streak}</span>
           <span>Victory: 10</span>
        </div>
        
        {/* Ancient Ruler Background */}
        <div className="w-full h-10 bg-[#1a1410] border-2 border-[#5c4a3d] relative overflow-hidden flex items-center shadow-inner">
            {/* Grid lines */}
            <div className="absolute inset-0 flex justify-between px-2">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-[1px] h-full bg-[#3d2f25]"></div>
                ))}
            </div>
            
            {/* The Streak Fill */}
            <div 
                className="h-full transition-all duration-500 ease-out z-10 bg-[#b45309] relative"
                style={{ width: `${streakPercentage}%` }}
            >
                 {/* Texture */}
                 <div className="absolute inset-0 w-full h-full" style={{
                     backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 20px)',
                 }}></div>
                 <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#fcd34d]"></div>
            </div>
        </div>
        
        <div className="flex justify-center mt-1">
            <div className="flex items-center gap-2 text-[#b45309] text-xs font-['Cinzel'] uppercase tracking-widest">
                <Sword size={12} />
                <span>Prove Your Worth</span>
                <Sword size={12} />
            </div>
        </div>
      </div>

      {/* Opponent Profile */}
      <div className="flex items-center justify-end gap-4 w-full md:w-1/4 border-l-0 md:border-l-2 border-[#2a2118] pl-4">
        <div className="flex flex-col text-right">
          <span className="text-xs text-red-700 tracking-widest font-bold uppercase font-['Cinzel']">{OPPONENT_CLASS}</span>
          <span className="text-xl font-['Oswald'] uppercase tracking-tighter text-[#d97706]">{OPPONENT_NAME}</span>
        </div>
        <div className="relative w-16 h-16 border-2 border-[#78350f] bg-[#2a2118] overflow-hidden group shadow-lg">
           {opponentImage ? (
             <img src={opponentImage} alt="Batzorig" className="w-full h-full object-cover sepia contrast-125 group-hover:sepia-0 transition-all" />
           ) : (
             <div className="w-full h-full flex items-center justify-center">
                <Skull className="w-8 h-8 text-red-600 animate-pulse" />
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </header>
  );
};