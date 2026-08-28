import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HeroBarProps {
  onSelectHero: (heroNum: number) => void;
}

export const HeroCaseQuickBar: React.FC<HeroBarProps> = ({ onSelectHero }) => {
  return (
    <section className="bg-[#0D1322] border-b border-gray-800/80 py-2.5 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-display font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Judge Demo Pitch Scenarios:</span>
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs flex-wrap gap-1.5">
          <button
            onClick={() => onSelectHero(1)}
            className="px-3 py-1 rounded-lg bg-[#111827] hover:bg-cyan-950/70 text-cyan-300 border border-gray-800 hover:border-cyan-700/60 transition flex items-center space-x-1 shadow-sm group"
          >
            <span className="font-bold text-white font-mono">Hero 1:</span>
            <span>Missing Invoice (₹75k)</span>
            <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition ml-0.5" />
          </button>
          <button
            onClick={() => onSelectHero(2)}
            className="px-3 py-1 rounded-lg bg-[#111827] hover:bg-cyan-950/70 text-cyan-300 border border-gray-800 hover:border-cyan-700/60 transition flex items-center space-x-1 shadow-sm group"
          >
            <span className="font-bold text-white font-mono">Hero 2:</span>
            <span>EMP-402 Cluster (16 Cases / ₹42k)</span>
            <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition ml-0.5" />
          </button>
          <button
            onClick={() => onSelectHero(3)}
            className="px-3 py-1 rounded-lg bg-[#111827] hover:bg-emerald-950/70 text-emerald-300 border border-gray-800 hover:border-emerald-700/60 transition flex items-center space-x-1 shadow-sm group"
          >
            <span className="font-bold text-white font-mono">Hero 3:</span>
            <span>Legitimate SLA Refund (NORMAL ₹50k)</span>
            <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 transition ml-0.5" />
          </button>
          <button
            onClick={() => onSelectHero(4)}
            className="px-3 py-1 rounded-lg bg-[#111827] hover:bg-amber-950/70 text-amber-300 border border-gray-800 hover:border-amber-700/60 transition flex items-center space-x-1 shadow-sm group"
          >
            <span className="font-bold text-white font-mono">Hero 4:</span>
            <span>GlobalTech Contract Drift (₹1.2L)</span>
            <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-amber-400 transition ml-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
