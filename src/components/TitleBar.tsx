import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { TactixLogo } from './TactixLogo';

interface TitleBarProps {
  currentMap: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ currentMap }) => {
  return (
    <div className="h-9 bg-[#111116] border-b border-white/[0.06] flex items-center justify-between px-3 text-xs select-none z-50 shrink-0 font-sans-clean">
      {/* Left: Deferential Brand & Session Indicator */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <TactixLogo size={18} />
          <span className="font-semibold text-xs tracking-tight text-white">
            TACTIX
          </span>
        </div>

        <span className="text-white/10">/</span>

        <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
          <span className="text-zinc-200 font-medium">{currentMap}</span>
          <span className="text-white/10">·</span>
          <span className="text-zinc-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
            Synced
          </span>
          <span className="text-white/10">·</span>
          <span className="font-mono-num text-[10px] text-[#9CA3AF]">128 Hz (8ms)</span>
        </div>
      </div>

      {/* Center: Calm Descriptive Subtitle */}
      <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
        <span>Spatial Telemetry & Engagement Analytics</span>
      </div>

      {/* Right: Deferential Window Controls */}
      <div className="flex items-center">
        <button 
          title="Minimize"
          className="w-8 h-6 flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors rounded"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button 
          title="Maximize"
          className="w-8 h-6 flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors rounded"
        >
          <Square className="w-3 h-3" />
        </button>
        <button 
          title="Close"
          className="w-8 h-6 flex items-center justify-center text-zinc-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
