import React from 'react';
import { DuelZone } from '../types/valorant';
import { Crosshair, Skull, Info } from 'lucide-react';

interface ZoneTooltipProps {
  zone: DuelZone;
  position: { x: number; y: number };
}

export const ZoneTooltip: React.FC<ZoneTooltipProps> = ({ zone, position }) => {
  const isPositive = zone.status === 'positive';
  const mainColor = isPositive ? '#2DD4BF' : '#F87171';

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-75 font-sans-clean"
      style={{
        left: `${position.x + 16}px`,
        top: `${position.y - 30}px`,
        maxWidth: '300px',
      }}
    >
      <div className="bg-[#191920] border border-white/[0.08] p-3 rounded-xl text-xs text-[#FAFAFA] select-none shadow-xl space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: mainColor }}
            />
            <span className="font-semibold text-xs text-white">
              {zone.callout} // {zone.name}
            </span>
          </div>
          <span
            className="font-mono-num font-semibold text-[11px] px-1.5 py-0.2 rounded"
            style={{ 
              color: mainColor, 
              backgroundColor: `${mainColor}18`
            }}
          >
            {zone.winrate}% Winrate
          </span>
        </div>

        {/* Primary Statement */}
        <div className="text-[11px] leading-relaxed text-zinc-300">
          <span className="text-white font-medium">{zone.callout}:</span> Opening duel conversion rate is{' '}
          <span style={{ color: mainColor }} className="font-semibold">{zone.winrate}%</span>{' '}
          <span className="text-[#9CA3AF]">
            ({zone.firstDeaths > zone.firstBloods 
              ? `conceded first contact ${zone.firstDeaths} times over ${zone.matchesSampled} matches`
              : `secured ${zone.firstBloods} opening kills over ${zone.matchesSampled} matches`})
          </span>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="space-y-1 py-0.5">
          <div className="flex justify-between text-[10px] text-[#9CA3AF] font-medium">
            <span className="text-[#2DD4BF] flex items-center gap-1">
              <Crosshair className="w-3 h-3" />
              {zone.firstBloods} First Bloods
            </span>
            <span className="text-[#F87171] flex items-center gap-1">
              <Skull className="w-3 h-3" />
              {zone.firstDeaths} First Deaths
            </span>
          </div>
          <div className="h-1.5 bg-[#111116] w-full flex overflow-hidden rounded-full">
            <div
              className="bg-[#2DD4BF] h-full transition-all duration-300"
              style={{ width: `${(zone.firstBloods / zone.totalDuels) * 100}%` }}
            />
            <div
              className="bg-[#F87171] h-full transition-all duration-300"
              style={{ width: `${(zone.firstDeaths / zone.totalDuels) * 100}%` }}
            />
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/[0.06] text-[10px]">
          <div className="bg-[#141419] p-1.5 rounded border border-white/[0.04]">
            <span className="text-[#9CA3AF] block font-medium">Reaction Delta</span>
            <span className="font-mono-num font-semibold text-xs mt-0.5 block" style={{ color: mainColor }}>
              {zone.avgReactionDeltaMs > 0 ? `+${zone.avgReactionDeltaMs}ms` : `${zone.avgReactionDeltaMs}ms`}
            </span>
          </div>

          <div className="bg-[#141419] p-1.5 rounded border border-white/[0.04]">
            <span className="text-[#9CA3AF] block font-medium">Enemy Weapon</span>
            <span className="font-semibold text-xs text-zinc-200 truncate mt-0.5 block">
              {zone.topEnemyWeapon}
            </span>
          </div>
        </div>

        {/* Coach Advice */}
        <div className="p-2 bg-[#141419] rounded border border-white/[0.04] text-[10px] text-zinc-300 leading-relaxed">
          <div className="text-[#9CA3AF] font-medium text-[9px] uppercase tracking-wider mb-0.5">
            Tactical Recommendation
          </div>
          <span>{zone.advice}</span>
        </div>
      </div>
    </div>
  );
};
