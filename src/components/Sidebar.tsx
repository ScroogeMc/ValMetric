import React from 'react';
import { 
  BarChart2, 
  Map as MapIcon, 
  Coins, 
  BrainCircuit, 
  History, 
  TrendingUp
} from 'lucide-react';
import { PlayerStats } from '../types/valorant';
import { TactixLogo } from './TactixLogo';
import { GamerAvatar } from './GamerAvatar';

interface SidebarProps {
  player: PlayerStats;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ player, currentTab, onTabChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'matches', label: 'Matches', icon: History },
    { id: 'spatial', label: 'Spatial Analytics', icon: MapIcon, isPrimary: true },
    { id: 'economy', label: 'Economy & Utility', icon: Coins },
    { id: 'coaching', label: 'Tactical Coach', icon: BrainCircuit },
  ];

  return (
    <aside className="w-64 bg-[#111116] border-r border-white/[0.06] flex flex-col justify-between shrink-0 select-none z-30 font-sans-clean">
      {/* Top Section: App Branding & Player Profile Card */}
      <div>
        {/* Workspace Brand Header - Compliant with Riot Games (No 'Pro' references) */}
        <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TactixLogo size={22} />
            <div>
              <div className="font-semibold text-xs tracking-tight text-white leading-none">
                Tactix Analytics
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                Build v4.12
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono-num text-[#9CA3AF] px-1.5 py-0.5 bg-white/[0.05] rounded border border-white/[0.06]">
            Community
          </span>
        </div>

        {/* Player Profile Card - Elevated Secondary Surface (#191920) */}
        <div className="p-3 border-b border-white/[0.06] space-y-3">
          {/* Identity Row */}
          <div className="flex items-center gap-3">
            <GamerAvatar size={40} name={player.name} />

            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs text-white truncate leading-tight">
                {player.tag}
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-0.5 flex items-center gap-1.5">
                <span>{player.region}</span>
                <span className="text-zinc-600">·</span>
                <span className="font-mono-num text-[10px] text-zinc-300">128 tick</span>
              </div>
              <div className="text-[11px] text-zinc-300 mt-0.5 truncate">
                {player.mainAgent} · Duelist
              </div>
            </div>
          </div>

          {/* Rank & Rating Plate - Neutral 8px Rounded Surface with 1px subtle border */}
          <div className="p-2.5 bg-[#191920] border border-white/[0.06] rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium">
                  Rating
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-semibold text-sm text-white">
                    {player.rankTitle}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">
                    {player.rankTier}
                  </span>
                </div>
                <div className="text-[11px] font-mono-num text-zinc-200 mt-0.5">
                  <span className="font-medium text-white">{player.rr} RR</span>
                  <span className="text-zinc-500 mx-1">·</span>
                  <span className="text-[#9CA3AF] font-sans">Peak: {player.peakRank}</span>
                </div>
              </div>

              {/* Data-Only Accent: Soft Pastel Teal for Winrate */}
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium block">
                  Winrate
                </span>
                <span className="text-sm font-semibold text-[#2DD4BF] block mt-0.5 font-mono-num">
                  {player.winrate}%
                </span>
              </div>
            </div>

            {/* Minimalist Progress Bar */}
            <div className="space-y-1 pt-0.5">
              <div className="w-full h-1.5 bg-[#111116] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-zinc-300 rounded-full"
                  style={{ width: `${Math.min(100, (player.rr / 1000) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] font-mono-num">
                <span>{player.rr} / 1000 RR</span>
                <span className="text-[#2DD4BF] flex items-center gap-0.5 font-sans font-medium">
                  <TrendingUp className="w-3 h-3" />
                  +24 RR today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Apple HIG Deferential Style (Soft background fill, NO white stroke) */}
        <nav className="p-2 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium px-2.5 py-1">
            Analytics
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-[#9CA3AF] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-[#9CA3AF]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                
                {item.isPrimary && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Utilitarian Metrics Grid & Legal Notice */}
      <div className="p-3 border-t border-white/[0.06] space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-[#191920] border border-white/[0.06] rounded-lg">
            <span className="text-[#9CA3AF] text-[10px] block font-medium">K/D Ratio</span>
            <span className="font-semibold text-white font-mono-num text-xs mt-0.5 block">{player.kd}</span>
          </div>
          <div className="p-2 bg-[#191920] border border-white/[0.06] rounded-lg">
            <span className="text-[#9CA3AF] text-[10px] block font-medium">Headshot %</span>
            <span className="font-semibold text-white font-mono-num text-xs mt-0.5 block">{player.headshotPct}%</span>
          </div>
        </div>

        {/* Muted Legal Disclaimer compliant with Riot Games Developer Terms */}
        <div className="pt-1 text-[9px] text-[#9CA3AF] leading-relaxed font-sans">
          <p>
            Tactix is an independent analytics tool and is not affiliated with Riot Games, Inc.
          </p>
        </div>
      </div>
    </aside>
  );
};
