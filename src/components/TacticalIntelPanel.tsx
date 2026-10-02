import React from 'react';
import { DuelZone } from '../types/valorant';
import { 
  Crosshair, 
  Skull, 
  Lightbulb,
  TrendingUp
} from 'lucide-react';

interface TacticalIntelPanelProps {
  selectedZone: DuelZone | null;
  onClearSelection: () => void;
}

export const TacticalIntelPanel: React.FC<TacticalIntelPanelProps> = ({
  selectedZone,
  onClearSelection,
}) => {
  return (
    <div className="w-80 bg-[#111116] border-l border-white/[0.06] flex flex-col justify-between p-4 text-xs select-none shrink-0 overflow-y-auto font-sans-clean">
      {selectedZone ? (
        // Detailed Sector Telemetry in Apple HIG Clean Cards
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium">
                Sector Telemetry
              </div>
              <h3 className="font-semibold text-sm text-white mt-0.5">
                {selectedZone.callout} // {selectedZone.name}
              </h3>
            </div>
            <button
              onClick={onClearSelection}
              className="text-xs text-[#9CA3AF] hover:text-white px-2 py-0.5 bg-[#191920] hover:bg-white/10 rounded border border-white/[0.06] cursor-pointer transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Winrate Hero Plate - Neutral 8px Surface with Data-Only Accent */}
          <div className="p-3.5 bg-[#191920] border border-white/[0.06] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium">
                Opening Winrate
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded"
                style={{ 
                  color: selectedZone.status === 'positive' ? '#2DD4BF' : '#F87171',
                  backgroundColor: selectedZone.status === 'positive' ? 'rgba(45, 212, 191, 0.12)' : 'rgba(248, 113, 113, 0.12)'
                }}
              >
                {selectedZone.status === 'positive' ? 'Favored' : 'Contested'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span 
                className="font-mono-num font-semibold text-3xl"
                style={{ color: selectedZone.status === 'positive' ? '#2DD4BF' : '#F87171' }}
              >
                {selectedZone.winrate}%
              </span>
              <span className="text-xs text-[#9CA3AF]">
                ({selectedZone.totalDuels} duels recorded)
              </span>
            </div>

            {/* Duel Breakdown Minimalist Bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-[#2DD4BF]">{selectedZone.firstBloods} First Bloods</span>
                <span className="text-[#F87171]">{selectedZone.firstDeaths} First Deaths</span>
              </div>
              <div className="w-full h-1.5 bg-[#111116] overflow-hidden flex rounded-full">
                <div
                  className="bg-[#2DD4BF] h-full"
                  style={{ width: `${(selectedZone.firstBloods / selectedZone.totalDuels) * 100}%` }}
                />
                <div
                  className="bg-[#F87171] h-full"
                  style={{ width: `${(selectedZone.firstDeaths / selectedZone.totalDuels) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl">
              <span className="text-[10px] text-[#9CA3AF] block uppercase font-medium">Reaction Delta</span>
              <span className={`text-lg font-mono-num font-semibold mt-0.5 block ${
                selectedZone.avgReactionDeltaMs < 0 ? 'text-[#2DD4BF]' : 'text-[#F87171]'
              }`}>
                {selectedZone.avgReactionDeltaMs > 0 ? `+${selectedZone.avgReactionDeltaMs}ms` : `${selectedZone.avgReactionDeltaMs}ms`}
              </span>
              <span className="text-[10px] text-[#9CA3AF] block">vs Tier median</span>
            </div>

            <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl">
              <span className="text-[10px] text-[#9CA3AF] block uppercase font-medium">Burned Credits</span>
              <span className="text-lg font-mono-num font-semibold text-[#F87171] mt-0.5 block">
                -{selectedZone.burnedUtilityAvg} ¤
              </span>
              <span className="text-[10px] text-[#9CA3AF] block">Per untraded death</span>
            </div>
          </div>

          {/* Opponent Weapon Distribution */}
          <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl space-y-2">
            <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-medium">
              Enemy Weapon Casualties
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex items-center justify-between pb-1 text-[11px]">
                  <span className="text-zinc-200">Operator (Sniper)</span>
                  <span className="text-[#F87171] font-mono-num">67% (8 deaths)</span>
                </div>
                <div className="w-full h-1 bg-[#111116] rounded-full overflow-hidden">
                  <div className="bg-[#F87171] h-full rounded-full" style={{ width: '67%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between pb-1 pt-1 text-[11px]">
                  <span className="text-zinc-200">Vandal (Rifle)</span>
                  <span className="text-[#9CA3AF] font-mono-num">33% (4 deaths)</span>
                </div>
                <div className="w-full h-1 bg-[#111116] rounded-full overflow-hidden">
                  <div className="bg-zinc-400 h-full rounded-full" style={{ width: '33%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Directive Advice */}
          <div className="bg-[#191920] border border-white/[0.06] p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-200 text-xs font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Coach Directive</span>
            </div>
            <p className="text-[#9CA3AF] text-xs leading-relaxed">
              {selectedZone.advice}
            </p>
          </div>
        </div>
      ) : (
        // Overall Aggregate Summary
        <div className="space-y-3.5">
          <div className="pb-2.5 border-b border-white/[0.06]">
            <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium">
              Aggregate Intel // 5 Sessions
            </div>
            <h3 className="font-semibold text-sm text-white mt-0.5">
              Opening Duel Overview
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl">
              <span className="text-[10px] text-[#9CA3AF] uppercase block font-medium">Entry Efficiency</span>
              <span className="text-xl font-mono-num font-semibold text-[#2DD4BF] mt-1 block">62.8%</span>
              <span className="text-[10px] text-[#9CA3AF]">Opening winrate</span>
            </div>

            <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl">
              <span className="text-[10px] text-[#9CA3AF] uppercase block font-medium">First Blood Ratio</span>
              <span className="text-xl font-mono-num font-semibold text-white mt-1 block">2.14x</span>
              <span className="text-[10px] text-[#9CA3AF]">65 FB / 30 FD</span>
            </div>
          </div>

          {/* Sector Conversion Ranking Data Table */}
          <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium">
              Sector Conversion Ranking
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-[#141419] rounded border border-white/[0.04]">
                <div>
                  <span className="text-zinc-200 font-medium block">1. Mid Courtyard</span>
                  <span className="text-[10px] text-[#9CA3AF]">17 FB · 7 FD</span>
                </div>
                <span className="font-mono-num font-semibold text-[#2DD4BF]">71% WR</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#141419] rounded border border-white/[0.04]">
                <div>
                  <span className="text-zinc-200 font-medium block">2. A Wine & Garden</span>
                  <span className="text-[10px] text-[#9CA3AF]">7 FB · 2 FD</span>
                </div>
                <span className="font-mono-num font-semibold text-[#2DD4BF]">78% WR</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#141419] rounded border border-white/[0.04]">
                <div>
                  <span className="text-zinc-200 font-medium block">3. B Main Choke</span>
                  <span className="text-[10px] text-[#9CA3AF]">6 FB · 12 FD</span>
                </div>
                <span className="font-mono-num font-semibold text-[#F87171]">34% WR</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#141419] rounded border border-white/[0.04]">
                <div>
                  <span className="text-zinc-200 font-medium block">4. B Market Window</span>
                  <span className="text-[10px] text-[#9CA3AF]">4 FB · 10 FD</span>
                </div>
                <span className="font-mono-num font-semibold text-[#F87171]">29% WR</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Hint */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-[11px] text-[#9CA3AF] flex items-center justify-between">
        <span>Spatial Telemetry</span>
        <span className="text-zinc-300">Select map sector to inspect</span>
      </div>
    </div>
  );
};
