import React from 'react';
import { RECENT_MATCHES } from '../data/mockData';
import { Play, TrendingUp, Trophy, Compass, Target, Crosshair } from 'lucide-react';

interface MatchesViewProps {
  onSelectAscentMatch: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({ onSelectAscentMatch }) => {
  const mapBreakdown = [
    { map: 'Ascent', record: '6W - 1L', winrate: 86 },
    { map: 'Abyss', record: '3W - 1L', winrate: 75 },
    { map: 'Haven', record: '2W - 1L', winrate: 67 },
    { map: 'Bind', record: '2W - 1L', winrate: 67 },
    { map: 'Split', record: '1W - 2L', winrate: 33 },
  ];

  return (
    <div className="flex-1 bg-[#111116] p-6 overflow-y-auto select-none space-y-5 font-sans-clean w-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] w-full">
        <div>
          <h2 className="font-semibold text-lg text-white">
            Match History & Replays
          </h2>
          <span className="text-xs text-[#9CA3AF]">20 Competitive Sessions Recorded</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#191920] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <span className="text-[#9CA3AF]">Season Winrate:</span>
            <span className="font-mono-num font-semibold text-[#2DD4BF]">70.0% (14W - 6L)</span>
          </div>
        </div>
      </div>

      {/* Main Full-Width Grid: Matches List (8 cols) + Session Analytics Sidebar (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
        {/* Left / Main Section (xl:col-span-8): Match History Cards */}
        <div className="xl:col-span-8 space-y-2.5">
          {RECENT_MATCHES.map((match) => {
            const isWin = match.result === 'Victory';
            return (
              <div
                key={match.id}
                onClick={() => {
                  if (match.map === 'Ascent') onSelectAscentMatch();
                }}
                className={`p-3.5 bg-[#191920] border border-white/[0.06] hover:border-white/20 rounded-xl transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4 shadow-sm relative overflow-hidden ${
                  isWin 
                    ? 'bg-gradient-to-r from-[#2DD4BF]/[0.07] via-[#191920] to-[#191920]' 
                    : 'bg-gradient-to-r from-[#F87171]/[0.07] via-[#191920] to-[#191920]'
                }`}
              >
                {/* Left Segment: Map, Agent, Date & Result */}
                <div className="flex items-center gap-3.5 min-w-[240px]">
                  {/* Status Bar Indicator */}
                  <div 
                    className={`w-1.5 h-11 rounded-full shrink-0 ${
                      isWin ? 'bg-[#2DD4BF]' : 'bg-[#F87171]'
                    }`} 
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {match.map}
                      </span>
                      <span 
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          isWin ? 'bg-[#2DD4BF]/15 text-[#2DD4BF]' : 'bg-[#F87171]/15 text-[#F87171]'
                        }`}
                      >
                        {match.result} ({match.score})
                      </span>
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5 flex items-center gap-2">
                      <span>{match.agent}</span>
                      <span className="text-zinc-600">·</span>
                      <span>Competitive</span>
                      <span className="text-zinc-600">·</span>
                      <span>{match.date}</span>
                    </div>
                  </div>
                </div>

                {/* Balanced Center Data Metrics (Compact, High Density) */}
                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">K / D / A</span>
                    <span className="font-mono-num font-medium text-white text-xs mt-0.5 block">
                      {match.kda}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">Combat Score</span>
                    <span className="font-mono-num font-medium text-[#2DD4BF] text-xs mt-0.5 block">
                      {match.acs} ACS
                    </span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">Headshot</span>
                    <span className="font-mono-num font-medium text-zinc-200 text-xs mt-0.5 block">
                      {match.hs}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">Opening Kills</span>
                    <span className="font-mono-num font-medium text-zinc-200 text-xs mt-0.5 block">
                      {match.entryKills} FB
                    </span>
                  </div>
                </div>

                {/* Right: Integrated Action CTA */}
                <div className="flex items-center pl-2">
                  <button 
                    className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/15 text-zinc-200 hover:text-white font-medium text-xs rounded-lg border border-white/[0.06] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Telemetry Replay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Section (xl:col-span-4): Session Digest & Map Winrates */}
        <div className="xl:col-span-4 space-y-4">
          {/* Match Digest Card */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#2DD4BF]" />
                <h3 className="font-semibold text-sm text-white">20-Match Performance</h3>
              </div>
              <span className="text-xs text-[#2DD4BF] font-mono-num font-medium">+142 RR</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-sans-clean">
              <div className="p-2.5 bg-[#141419] rounded-lg border border-white/[0.04]">
                <span className="text-[#9CA3AF] text-[11px] block">Average ACS</span>
                <span className="font-mono-num font-semibold text-white text-base mt-0.5 block">268.4</span>
              </div>
              <div className="p-2.5 bg-[#141419] rounded-lg border border-white/[0.04]">
                <span className="text-[#9CA3AF] text-[11px] block">Average K/D</span>
                <span className="font-mono-num font-semibold text-[#2DD4BF] text-base mt-0.5 block">1.48</span>
              </div>
            </div>
          </div>

          {/* Map Winrate Breakdown */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#9CA3AF]" />
                <h3 className="font-semibold text-sm text-white">Map Winrate Distribution</h3>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {mapBreakdown.map((m) => (
                <div key={m.map} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{m.map}</span>
                    <span className="font-mono-num text-xs text-[#9CA3AF]">
                      {m.record} · <span className="text-zinc-200 font-medium">{m.winrate}%</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#111116] rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full ${m.winrate >= 60 ? 'bg-[#2DD4BF]' : 'bg-zinc-400'}`} 
                      style={{ width: `${m.winrate}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Combat Highlights Card */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Crosshair className="w-4 h-4 text-[#2DD4BF]" />
              <span>Session Highlight</span>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Ascent match (13-7 Victory) recorded an ACE in Round 9 with 384 ACS. Replay available in Spatial Analytics tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
