import React from 'react';
import { PlayerStats, MatchDto } from '../types/valorant';
import { 
  TrendingUp, 
  Target, 
  Crosshair, 
  Activity, 
  Flame,
  Zap,
  Compass
} from 'lucide-react';
import { computeFirstBloodStats } from '../data/metrics';
import { MAP_CATALOG, getAgentName, getWeaponName, CURRENT_PLAYER_PUUID } from '../data/mockMatches';

interface OverviewViewProps {
  player: PlayerStats;
  matches: MatchDto[];
  onNavigateToSpatial: () => void;
}

const formatGameDate = (ms: number): string => {
  const d = new Date(ms);
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
};

const mode = (values: string[]): string => {
  if (values.length === 0) return 'Unknown';
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
};

export const OverviewView: React.FC<OverviewViewProps> = ({ player, matches, onNavigateToSpatial }) => {
  const fbStats = computeFirstBloodStats(matches);

  // --- Map performance ---
  const mapStats = new Map<string, { name: string; wins: number; losses: number; acsSum: number; acsCount: number }>();
  for (const m of matches) {
    const name = MAP_CATALOG[m.matchInfo.mapId]?.name ?? 'Unknown';
    const p = m.players.find((pp) => pp.puuid === CURRENT_PLAYER_PUUID);
    const blueWon = m.teams.find((t) => t.teamId === 'Blue')?.won ?? false;
    const acs = p && p.stats.roundsPlayed > 0 ? p.stats.score / p.stats.roundsPlayed : 0;
    const s = mapStats.get(name) ?? { name, wins: 0, losses: 0, acsSum: 0, acsCount: 0 };
    if (blueWon) s.wins += 1;
    else s.losses += 1;
    s.acsSum += acs;
    s.acsCount += 1;
    mapStats.set(name, s);
  }
  const mapPerformance = [...mapStats.values()].map((s) => ({
    name: s.name,
    matches: s.wins + s.losses,
    wins: s.wins,
    losses: s.losses,
    winrate: s.wins + s.losses > 0 ? Math.round((100 * s.wins) / (s.wins + s.losses)) : 0,
    acs: s.acsCount > 0 ? Math.round(s.acsSum / s.acsCount) : 0,
  }));

  // --- Agent pool ---
  const agentStats = new Map<string, { agent: string; matches: number; wins: number; kills: number; deaths: number; score: number; roundsPlayed: number; weapons: string[] }>();
  for (const m of matches) {
    const p = m.players.find((pp) => pp.puuid === CURRENT_PLAYER_PUUID);
    if (!p) continue;
    const agent = getAgentName(p.characterId);
    const blueWon = m.teams.find((t) => t.teamId === 'Blue')?.won ?? false;
    const s = agentStats.get(agent) ?? { agent, matches: 0, wins: 0, kills: 0, deaths: 0, score: 0, roundsPlayed: 0, weapons: [] as string[] };
    s.matches += 1;
    if (blueWon) s.wins += 1;
    s.kills += p.stats.kills;
    s.deaths += p.stats.deaths;
    s.score += p.stats.score;
    s.roundsPlayed += p.stats.roundsPlayed;
    for (const r of m.roundResults) {
      for (const ps of r.playerStats) {
        if (ps.puuid !== CURRENT_PLAYER_PUUID) continue;
        for (const k of ps.kills) s.weapons.push(getWeaponName(k.finishingDamage.damageItem));
      }
    }
    agentStats.set(agent, s);
  }
  const agentPool = [...agentStats.values()].map((s) => ({
    agent: s.agent,
    pickRate: matches.length > 0 ? Math.round((100 * s.matches) / matches.length) : 0,
    winrate: s.matches > 0 ? Math.round((100 * s.wins) / s.matches) : 0,
    acs: s.roundsPlayed > 0 ? Math.round(s.score / s.roundsPlayed) : 0,
    kd: s.deaths > 0 ? Math.round((100 * s.kills) / s.deaths) / 100 : s.kills,
    primaryWeapon: mode(s.weapons),
  }));

  // --- Weapon performance ---
  const weaponKills = new Map<string, number>();
  let totalKills = 0;
  for (const m of matches) {
    for (const r of m.roundResults) {
      for (const ps of r.playerStats) {
        if (ps.puuid !== CURRENT_PLAYER_PUUID) continue;
        for (const k of ps.kills) {
          const w = getWeaponName(k.finishingDamage.damageItem);
          weaponKills.set(w, (weaponKills.get(w) ?? 0) + 1);
          totalKills += 1;
        }
      }
    }
  }
  const weaponStats = [...weaponKills.entries()]
    .map(([weapon, kills]) => ({ weapon, kills, pct: totalKills > 0 ? Math.round((100 * kills) / totalKills) : 0 }))
    .sort((a, b) => b.kills - a.kills)
    .slice(0, 4);

  const totalK = matches.reduce((s, m) => s + (m.players.find((p) => p.puuid === CURRENT_PLAYER_PUUID)?.stats.kills ?? 0), 0);
  const totalD = matches.reduce((s, m) => s + (m.players.find((p) => p.puuid === CURRENT_PLAYER_PUUID)?.stats.deaths ?? 0), 0);

  return (
    <div className="flex-1 bg-[#111116] p-6 overflow-y-auto select-none space-y-5 font-sans-clean w-full">
      {/* 1. Top Banner: Full-Width Executive Overview Card */}
      <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-5 shadow-sm w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium text-[#9CA3AF] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
              <span>Performance Dossier</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-300 font-mono-num">Season Winrate: {player.winrate}%</span>
            </div>
            <h1 className="font-semibold text-xl text-white mt-1">
              Performance Overview · {player.tag}
            </h1>
            <p className="text-xs text-[#9CA3AF] max-w-2xl mt-1 leading-relaxed">
              Aggregated across {matches.length} competitive session{matches.length === 1 ? '' : 's'} — {player.mainAgent} ({player.mainRole}), {player.region}.
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
            <span>Across {player.matchesPlayed} matches</span>
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
            <span>{totalK} Kills / {totalD} Deaths</span>
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
            <span>First-blood ratio: {player.firstBloodRatio}x</span>
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
            <span>{fbStats.firstBloods} FB / {fbStats.firstDeaths} FD</span>
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
                <span className="text-xs text-[#9CA3AF]">{player.matchesPlayed} Competitive Matches</span>
              </div>
              <span className="text-[11px] text-[#9CA3AF] font-mono-num">
                {player.rankTitle} {player.rankTier}
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
                    <th className="py-2.5 px-3 font-medium">Primary Weapon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {agentPool.map((a) => (
                    <tr key={a.agent} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-medium text-white">{a.agent}</td>
                      <td className="py-3 px-3 font-mono-num text-zinc-300">{a.pickRate}%</td>
                      <td className="py-3 px-3 font-mono-num font-semibold text-[#2DD4BF]">{a.winrate}%</td>
                      <td className="py-3 px-3 font-mono-num text-zinc-200">{a.acs}</td>
                      <td className="py-3 px-3 font-mono-num font-medium text-white">{a.kd}</td>
                      <td className="py-3 px-3 text-[#9CA3AF]">{a.primaryWeapon}</td>
                    </tr>
                  ))}
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

        {/* Right Column (xl:col-span-5): Match Trajectory, Weapon Performance & Insights */}
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
              <span className="text-xs text-[#2DD4BF] font-mono-num font-medium">{matches.length} matches</span>
            </div>

            <div className="mt-3 space-y-2">
              {matches.slice(0, 4).map((m) => {
                const blue = m.teams.find((t) => t.teamId === 'Blue');
                const red = m.teams.find((t) => t.teamId === 'Red');
                const p = m.players.find((pp) => pp.puuid === CURRENT_PLAYER_PUUID);
                const isWin = blue?.won ?? false;
                const mapName = MAP_CATALOG[m.matchInfo.mapId]?.name ?? 'Unknown';
                const score = `${blue?.roundsWon ?? 0} - ${red?.roundsWon ?? 0}`;
                const agent = p ? getAgentName(p.characterId) : 'Unknown';
                const kda = `${p?.stats.kills ?? 0} / ${p?.stats.deaths ?? 0} / ${p?.stats.assists ?? 0}`;
                return (
                  <div
                    key={m.matchInfo.matchId}
                    className={`p-2.5 bg-[#141419] border border-white/[0.04] rounded-lg flex items-center justify-between gap-3 relative overflow-hidden ${
                      isWin ? 'bg-gradient-to-r from-[#2DD4BF]/[0.05] to-transparent' : 'bg-gradient-to-r from-[#F87171]/[0.05] to-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-7 rounded-full shrink-0 ${isWin ? 'bg-[#2DD4BF]' : 'bg-[#F87171]'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-white">{mapName}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            isWin ? 'text-[#2DD4BF] bg-[#2DD4BF]/10' : 'text-[#F87171] bg-[#F87171]/10'
                          }`}>
                            {score}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                          {agent} · {formatGameDate(m.matchInfo.gameStartMillis)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono-num text-xs">
                      <span className="font-medium text-white">{kda}</span>
                      <span className="text-[10px] text-[#9CA3AF] block">{p?.stats.score ?? 0} ACS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weapon Performance */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#9CA3AF]" />
                <h3 className="font-semibold text-sm text-white">
                  Weapon Performance
                </h3>
              </div>
              <span className="text-xs text-[#9CA3AF]">Kills</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {weaponStats.map((w) => (
                <div key={w.weapon} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{w.weapon}</span>
                    <span className="font-mono-num text-[#2DD4BF] font-medium">{w.kills} kills ({w.pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#111116] rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-[#2DD4BF] rounded-full"
                      style={{ width: `${w.pct}%` }}
                    />
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
              {player.mainAgent} {player.mainRole.toLowerCase()} · {player.winrate}% winrate · {player.firstBloodRatio}x first-blood ratio across {player.matchesPlayed} matches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
