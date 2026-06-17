import React, { useMemo } from 'react';
import { Challenge } from '../types';
import { ProgressMap, getWord, MAX_BOX } from '../srs';
import { speak } from '../audio';
import { X, Volume2, Star, Lock } from 'lucide-react';

interface GlossaryProps {
  challenges: Challenge[];
  progress: ProgressMap;
  onClose: () => void;
}

// The "War Journal": a per-word progress ledger so the learner can see exactly
// which words are mastered, which need work, and how accurate they've been.
// Visibility into one's own progress is a pillar of self-directed learning.
export const Glossary: React.FC<GlossaryProps> = ({ challenges, progress, onClose }) => {
  const rows = useMemo(() => {
    return challenges
      .map(c => ({ challenge: c, prog: getWord(progress, c.phrase) }))
      // Weakest / least-known first so the learner sees what to focus on.
      .sort((a, b) => {
        if (a.prog.seen === 0 && b.prog.seen === 0) return 0;
        if (a.prog.seen === 0) return 1;
        if (b.prog.seen === 0) return -1;
        return a.prog.box - b.prog.box;
      });
  }, [challenges, progress]);

  const masteredCount = rows.filter(r => r.prog.box >= MAX_BOX).length;
  const startedCount = rows.filter(r => r.prog.seen > 0).length;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#1c1917] border-2 border-[#5c4a3d] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#2a2118] px-6 py-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-['Cinzel'] font-bold text-[#fcd34d] uppercase tracking-wider">War Journal</h2>
            <p className="text-xs font-['Cinzel'] text-[#8c7a6b] uppercase tracking-widest mt-1">
              {masteredCount} mastered · {startedCount} learned · {rows.length} total
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#a8a29e] hover:text-[#fcd34d] border border-[#3d2f25] hover:border-[#b45309] transition-colors"
            aria-label="Close journal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Word list */}
        <div className="overflow-y-auto p-4 space-y-2">
          {rows.map(({ challenge, prog }) => {
            const accuracy = prog.seen > 0 ? Math.round((prog.correct / prog.seen) * 100) : 0;
            const isMastered = prog.box >= MAX_BOX;
            const isNew = prog.seen === 0;

            return (
              <div
                key={challenge.phrase}
                className={`flex items-center gap-3 border p-3 transition-colors ${
                  isMastered
                    ? 'border-emerald-700/60 bg-emerald-950/20'
                    : isNew
                      ? 'border-[#2a2118] bg-[#0f0b08]/40 opacity-70'
                      : 'border-[#3d2f25] bg-[#0f0b08]/40'
                }`}
              >
                {/* Mongolian + phonetic */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-['Oswald'] text-xl text-[#fbbf24] truncate">{challenge.phrase}</span>
                    <button
                      type="button"
                      onClick={() => speak(challenge.phrase, challenge.phonetic)}
                      className="text-[#d97706] hover:text-[#fbbf24] shrink-0"
                      title="Hear pronunciation"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <div className="text-xs font-['Cinzel'] text-[#8c7a6b] uppercase tracking-wide truncate">
                    {challenge.translation} · [{challenge.phonetic}]
                  </div>
                </div>

                {/* Accuracy */}
                <div className="text-right shrink-0 w-16 hidden sm:block">
                  {isNew ? (
                    <span className="text-[10px] font-['Cinzel'] uppercase tracking-widest text-[#57534e] flex items-center justify-end gap-1">
                      <Lock size={10} /> New
                    </span>
                  ) : (
                    <span className={`text-sm font-mono font-bold ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {accuracy}%
                    </span>
                  )}
                </div>

                {/* Mastery stars (Leitner box) */}
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: MAX_BOX }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < prog.box && !isNew ? 'text-[#fcd34d] fill-[#fcd34d]' : 'text-[#3d2f25]'}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="border-t-2 border-[#2a2118] px-6 py-3 text-center">
          <p className="text-[10px] md:text-xs font-['Cinzel'] text-[#78716c] uppercase tracking-widest">
            Stars = mastery. Words you struggle with return often; mastered words demand recall from memory.
          </p>
        </div>
      </div>
    </div>
  );
};
