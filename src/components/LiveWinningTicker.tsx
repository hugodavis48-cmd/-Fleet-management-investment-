import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Sparkles, ShieldCheck } from 'lucide-react';

export const LiveWinningTicker: React.FC = () => {
  const { recentWinners } = useApp();

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-zinc-900 to-black border-b border-red-500/20 text-xs py-2 px-4 overflow-hidden relative z-30 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0 font-semibold tracking-wider text-red-400 uppercase text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <Trophy className="w-3.5 h-3.5 text-yellow-400 inline" />
          <span>LIVE PROOF-OF-FAIR WINNERS:</span>
        </div>

        <div className="overflow-hidden flex-1 relative mx-2">
          <div className="flex gap-8 whitespace-nowrap animate-marquee">
            {recentWinners.slice(0, 8).map((winner, idx) => (
              <div key={`${winner.id}-${idx}`} className="inline-flex items-center gap-2 text-zinc-300">
                <span className="font-medium text-white">{winner.username}</span>
                <span className="text-zinc-500">won</span>
                <span className="font-semibold text-yellow-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  {winner.prize}
                </span>
                <span className="text-zinc-400 text-[10px] bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50">
                  {winner.timestamp}
                </span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  {winner.verifiedHash}
                </span>
                <span className="text-zinc-600 mx-2">•</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 shrink-0">
          <span className="text-yellow-400 font-bold">$8,000</span>
          <span>Max Scratch Card Jackpot Active</span>
        </div>
      </div>
    </div>
  );
};
