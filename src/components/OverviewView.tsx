import React from 'react';
import { PlayerStats } from '../types/valorant';
import { 
  TrendingUp, 
  Target, 
  Crosshair, 
  Activity, 
  Flame,
  ArrowRight,
  Shield,
  Zap,
  Map as MapIcon,
  Compass,
  Award
} from 'lucide-react';
import { RECENT_MATCHES } from '../data/mockData';

interface OverviewViewProps {
  player: PlayerStats;
  onNavigateToSpatial: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ player, onNavigateToSpatial }) => {
  const mapPerformance = [
    { name: 'Ascent', winrate: 74, matches: 27, wins: 20, losses: 7, acs: 276.4, favoredSite: 'Mid Courtyard' },
    { name: 'Abyss', winrate: 67, matches: 15, wins: 10, losses: 5, acs: 262.1, favoredSite: 'A Hazard' },
    { name: 'Haven', winrate: 62, matches: 16, wins: 10, losses: 6, acs: 248.5, favoredSite: 'A Long' },
    { name: 'Bind', winrate: 58, matches: 12, wins: 7, losses: 5, acs: 251.0, favoredSite: 'B Hookah' },
    { name: 'Split', winrate: 50, matches: 8, wins: 4, losses: 4, acs: 239.8, favoredSite: 'A Ramps' },
    { name: 'Sunset', winrate: 55, matches: 6, wins: 3, losses: 3, acs: 245.2, favoredSite: 'B Main' },
  ];

  const openingWeaponStats = [
    { weapon: 'Vandal', entryWr: 64, duels: 58, fb: 37, fd: 21, avgRange: '18.4m' },
    { weapon: 'Operator', entryWr: 72, duels: 25, fb: 18, fd: 7, avgRange: '32.1m' },
    { weapon: 'Phantom', entryWr: 58, duels: 19, fb: 11, fd: 8, avgRange: '14.2m' },
    { weapon: 'Sheriff', entryWr: 50, duels: 12, fb: 6, fd: 6, avgRange: '16.5m' },
  ];

  return (
    <div className="flex-1 bg-[#111116] p-6 overflow-y-auto select-none space-y-5 font-sans-clean w-full">
      {/* 1. Top Banner: Full-Width Executive Overview Card */}
      <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-5 shadow-sm w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium text-[#9CA3AF] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
              <span>Competitive Episode 9 Act II · Performance Dossier</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-300 font-mono-num">Season Winrate: {player.winrate}%</span>
            </div>
            <h1 className="font-semibold text-xl text-white mt-1">
              Performance Overview · {player.tag}
            </h1>
            <p className="text-xs text-[#9CA3AF] max-w-2xl mt-1 leading-relaxed">
              Top 0.05% Regional Standing. Exceptional first-contact conversion across entry duels with identified spacing improvements on split attacks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToSpatial}
              className="px-4 py-2 bg-white text-zinc-950 font-medium text-xs rounded-lg flex items-center gap-2 hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Crosshair className="w-4 h-4" />
              <span>Open Spatial Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Core Pillars Grid (Full-Width Responsive 4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 w-full">
        <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium">
            <span>Combat Score (ACS)</span>
            <Activity className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </div>
          <div className="text-3xl font-semibold text-white mt-2 font-mono-num">
            {player.acs}
          </div>
          <div className="text-[11px] text-[#2DD4BF] flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2 ACS vs Radiant median</span>
          </div>
        </div>

        <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium">
            <span>K/D Ratio</span>
            <Crosshair className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </div>
          <div className="text-3xl font-semibold text-white mt-2 font-mono-num">
            {player.kd}
          </div>
          <div className="text-[11px] text-[#2DD4BF] flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>1,420 Kills / 959 Deaths</span>
          </div>
        </div>

        <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium">
            <span>Headshot %</span>
            <Target className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </div>
          <div className="text-3xl font-semibold text-white mt-2 font-mono-num">
            {player.headshotPct}%
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-1 font-mono-num">
            <span>Vandal First Bullet: 42.1%</span>
          </div>
        </div>

        <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium">
            <span>Opening Duel Conversion</span>
            <Flame className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </div>
          <div className="text-3xl font-semibold text-[#2DD4BF] mt-2 font-mono-num">
            {player.firstBloodRatio}x
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">
            <span>68% Attack Opening Winrate</span>
          </div>
        </div>
      </div>

      {/* 3. Balanced Dual Column Section - Fills the Full Width Seamlessly */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
        {/* Left Column (xl:col-span-7): Agent Pool & Map Performance */}
        <div className="xl:col-span-7 space-y-5">
          {/* Agent Pool Telemetry Table */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="font-semibold text-sm text-white">
                  Agent Pool Telemetry
                </h3>
                <span className="text-xs text-[#9CA3AF]">Current Act Sample: 84 Competitive Matches</span>
              </div>
              <span className="text-[11px] text-[#9CA3AF] font-mono-num">
                Rank #384 Radiant
              </span>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs font-sans-clean">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[#9CA3AF] text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-medium">Agent</th>
                    <th className="py-2.5 px-3 font-medium">Pick Rate</th>
                    <th className="py-2.5 px-3 font-medium">Winrate</th>
                    <th className="py-2.5 px-3 font-medium">ACS</th>
                    <th className="py-2.5 px-3 font-medium">K/D</th>
                    <th className="py-2.5 px-3 font-medium">First Bloods</th>
                    <th className="py-2.5 px-3 font-medium">Primary Weapon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                      <span>Jett</span>
                      <span className="text-[10px] text-[#9CA3AF] bg-white/[0.05] px-1.5 py-0.2 rounded border border-white/[0.05]">Duelist</span>
                    </td>
                    <td className="py-3 px-3 font-mono-num text-zinc-300">52 matches (62%)</td>
                    <td className="py-3 px-3 font-mono-num font-semibold text-[#2DD4BF]">71.2%</td>
                    <td className="py-3 px-3 font-mono-num text-zinc-200">284.2</td>
                    <td className="py-3 px-3 font-mono-num font-medium text-white">1.54</td>
                    <td className="py-3 px-3 font-mono-num text-[#2DD4BF]">124 (2.4/m)</td>
                    <td className="py-3 px-3 text-[#9CA3AF]">Vandal / Operator</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-400" />
                      <span>Reyna</span>
                      <span className="text-[10px] text-[#9CA3AF] bg-white/[0.05] px-1.5 py-0.2 rounded border border-white/[0.05]">Duelist</span>
                    </td>
                    <td className="py-3 px-3 font-mono-num text-zinc-300">18 matches (21%)</td>
                    <td className="py-3 px-3 font-mono-num font-semibold text-[#2DD4BF]">66.7%</td>
                    <td className="py-3 px-3 font-mono-num text-zinc-200">262.8</td>
                    <td className="py-3 px-3 font-mono-num font-medium text-white">1.42</td>
                    <td className="py-3 px-3 font-mono-num text-[#2DD4BF]">48 (2.6/m)</td>
                    <td className="py-3 px-3 text-[#9CA3AF]">Phantom / Vandal</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-500" />
                      <span>Sova</span>
                      <span className="text-[10px] text-[#9CA3AF] bg-white/[0.05] px-1.5 py-0.2 rounded border border-white/[0.05]">Initiator</span>
                    </td>
                    <td className="py-3 px-3 font-mono-num text-zinc-300">14 matches (17%)</td>
                    <td className="py-3 px-3 font-mono-num font-semibold text-zinc-200">64.3%</td>
                    <td className="py-3 px-3 font-mono-num text-zinc-200">215.4</td>
                    <td className="py-3 px-3 font-mono-num font-medium text-white">1.18</td>
                    <td className="py-3 px-3 font-mono-num text-zinc-300">18 (1.2/m)</td>
                    <td className="py-3 px-3 text-[#9CA3AF]">Vandal / Odin</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Map Performance Breakdown */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#9CA3AF]" />
                <h3 className="font-semibold text-sm text-white">
                  Map Performance Matrix
                </h3>
              </div>
              <span className="text-xs text-[#9CA3AF]">Competitive Pool</span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mapPerformance.map((map) => (
                <div 
                  key={map.name}
                  className="p-3 bg-[#141419] border border-white/[0.04] rounded-lg space-y-2 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{map.name}</span>
                    <span className="font-mono-num font-medium text-xs text-[#2DD4BF]">{map.winrate}% WR</span>
                  </div>

                  <div className="w-full h-1.5 bg-[#111116] rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-[#2DD4BF] rounded-full" 
                      style={{ width: `${map.winrate}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] font-mono-num pt-0.5">
                    <span>{map.wins}W - {map.losses}L</span>
                    <span>{map.acs} ACS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (xl:col-span-5): Match Trajectory, Weapon Entry Matrix & Insights */}
        <div className="xl:col-span-5 space-y-5">
          {/* Recent Match Trajectory Digest */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#9CA3AF]" />
                <h3 className="font-semibold text-sm text-white">
                  Recent Match Trajectory
                </h3>
              </div>
              <span className="text-xs text-[#2DD4BF] font-mono-num font-medium">+142 RR / 5 Days</span>
            </div>

            <div className="mt-3 space-y-2">
              {RECENT_MATCHES.slice(0, 4).map((m) => {
                const isWin = m.result === 'Victory';
                return (
                  <div
                    key={m.id}
                    className={`p-2.5 bg-[#141419] border border-white/[0.04] rounded-lg flex items-center justify-between gap-3 relative overflow-hidden ${
                      isWin ? 'bg-gradient-to-r from-[#2DD4BF]/[0.05] to-transparent' : 'bg-gradient-to-r from-[#F87171]/[0.05] to-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-7 rounded-full shrink-0 ${isWin ? 'bg-[#2DD4BF]' : 'bg-[#F87171]'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-white">{m.map}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            isWin ? 'text-[#2DD4BF] bg-[#2DD4BF]/10' : 'text-[#F87171] bg-[#F87171]/10'
                          }`}>
                            {m.score}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                          {m.agent} · {m.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono-num text-xs">
                      <span className="font-medium text-white">{m.kda}</span>
                      <span className="text-[10px] text-[#9CA3AF] block">{m.acs} ACS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Opening Duel Weapon Efficiency */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#9CA3AF]" />
                <h3 className="font-semibold text-sm text-white">
                  Opening Duel Efficiency by Weapon
                </h3>
              </div>
              <span className="text-xs text-[#9CA3AF]">Conversion</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {openingWeaponStats.map((w) => (
                <div key={w.weapon} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{w.weapon}</span>
                    <span className="font-mono-num text-[#2DD4BF] font-medium">{w.entryWr}% Win ({w.fb}W/{w.fd}L)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#111116] rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-[#2DD4BF] rounded-full" 
                      style={{ width: `${w.entryWr}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9CA3AF] font-mono-num">
                    <span>{w.duels} Opening Engagements</span>
                    <span>Avg Distance: {w.avgRange}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Tactical Insights Card */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm w-full space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Zap className="w-4 h-4 text-[#2DD4BF]" />
              <span>Current Form Highlights</span>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Ascent Mid Courtyard entries remain your highest conversion zone (74% WR). Recommendation: maintain current default pace while syncing initiator recon on B-Main splits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
