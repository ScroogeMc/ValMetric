import React from 'react';
import { Play, Trophy, Compass, Crosshair, Loader2 } from 'lucide-react';
import { MatchDto, PlayerStats } from '../types/valorant';
import { MAP_CATALOG, getAgentName, CURRENT_PLAYER_PUUID } from '../data/mockMatches';

interface MatchesViewProps {
  matches: MatchDto[];
  profile: PlayerStats;
  loading: boolean;
  error: string | null;
  onOpenMatch: (match: MatchDto) => void;
}

const formatGameDate = (ms: number): string => {
  const d = new Date(ms);
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
};

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  profile,
  loading,
  error,
  onOpenMatch,
}) => {
  const seasonWins = matches.filter((m) => m.teams.find((t) => t.teamId === 'Blue')?.won).length;
  const seasonLosses = matches.length - seasonWins;
  const seasonWinrate = matches.length > 0 ? Math.round((100 * seasonWins) / matches.length) : 0;

  const mapStats = new Map<string, { name: string; wins: number; losses: number }>();
  for (const m of matches) {
    const name = MAP_CATALOG[m.matchInfo.mapId]?.name ?? 'Unknown';
    const s = mapStats.get(name) ?? { name, wins: 0, losses: 0 };
    if (m.teams.find((t) => t.teamId === 'Blue')?.won) s.wins += 1;
    else s.losses += 1;
    mapStats.set(name, s);
  }
  const mapBreakdown = [...mapStats.values()].map((s) => ({
    map: s.name,
    record: `${s.wins}W - ${s.losses}L`,
    winrate: s.wins + s.losses > 0 ? Math.round((100 * s.wins) / (s.wins + s.losses)) : 0,
  }));

  const bestMatch = matches.reduce<MatchDto | null>((best, m) => {
    if (!best) return m;
    const p = m.players.find((pp) => pp.puuid === CURRENT_PLAYER_PUUID);
    const bp = best.players.find((pp) => pp.puuid === CURRENT_PLAYER_PUUID);
    return (p?.stats.score ?? 0) > (bp?.stats.score ?? 0) ? m : best;
  }, null);
  const bestPlayer = bestMatch?.players.find((p) => p.puuid === CURRENT_PLAYER_PUUID);
  const bestMapName = bestMatch ? MAP_CATALOG[bestMatch.matchInfo.mapId]?.name ?? 'Unknown' : null;

  return (
    <div className="flex-1 bg-[#111116] p-6 overflow-y-auto select-none space-y-5 font-sans-clean w-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] w-full">
        <div>
          <h2 className="font-semibold text-lg text-white">
            Match History & Replays
          </h2>
          <span className="text-xs text-[#9CA3AF]">
            {loading
              ? 'Loading match history…'
              : `${matches.length} Competitive Session${matches.length === 1 ? '' : 's'} Recorded`}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#191920] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <span className="text-[#9CA3AF]">Season Winrate:</span>
            <span className="font-mono-num font-semibold text-[#2DD4BF]">
              {seasonWinrate}% ({seasonWins}W - {seasonLosses}L)
            </span>
          </div>
        </div>
      </div>

      {/* Main Full-Width Grid: Matches List (8 cols) + Session Analytics Sidebar (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
        {/* Left / Main Section (xl:col-span-8): Match History Cards */}
        <div className="xl:col-span-8 space-y-2.5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-[#9CA3AF] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading match history…</span>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl text-[#F87171] text-sm">
              {error}
            </div>
          )}

          {!loading && !error && matches.length === 0 && (
            <div className="py-16 text-center text-[#9CA3AF] text-sm bg-[#191920] border border-white/[0.06] rounded-xl">
              No matches recorded yet.
            </div>
          )}

          {!loading &&
            !error &&
            matches.map((match) => {
              const blueTeam = match.teams.find((t) => t.teamId === 'Blue');
              const redTeam = match.teams.find((t) => t.teamId === 'Red');
              const player = match.players.find((p) => p.puuid === CURRENT_PLAYER_PUUID);

              const mapName = MAP_CATALOG[match.matchInfo.mapId]?.name ?? 'Unknown';
              const agentName = player ? getAgentName(player.characterId) : 'Unknown';
              const isWin = blueTeam?.won ?? false;
              const score = `${blueTeam?.roundsWon ?? 0} - ${redTeam?.roundsWon ?? 0}`;
              const result = isWin ? 'Victory' : 'Defeat';
              const kda = `${player?.stats.kills ?? 0} / ${player?.stats.deaths ?? 0} / ${player?.stats.assists ?? 0}`;
              const acs = player?.stats.score ?? 0;

              return (
                <div
                  key={match.matchInfo.matchId}
                  onClick={() => onOpenMatch(match)}
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
                        <span className="font-semibold text-sm text-white">{mapName}</span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                            isWin
                              ? 'bg-[#2DD4BF]/15 text-[#2DD4BF]'
                              : 'bg-[#F87171]/15 text-[#F87171]'
                          }`}
                        >
                          {result} ({score})
                        </span>
                      </div>
                      <div className="text-xs text-[#9CA3AF] mt-0.5 flex items-center gap-2">
                        <span>{agentName}</span>
                        <span className="text-zinc-600">·</span>
                        <span>Competitive</span>
                        <span className="text-zinc-600">·</span>
                        <span>{formatGameDate(match.matchInfo.gameStartMillis)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Balanced Center Data Metrics (Compact, High Density) */}
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">
                        K / D / A
                      </span>
                      <span className="font-mono-num font-medium text-white text-xs mt-0.5 block">
                        {kda}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">
                        Combat Score
                      </span>
                      <span className="font-mono-num font-medium text-[#2DD4BF] text-xs mt-0.5 block">
                        {acs} ACS
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">
                        Rounds
                      </span>
                      <span className="font-mono-num font-medium text-zinc-200 text-xs mt-0.5 block">
                        {player?.stats.roundsPlayed ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Right: Integrated Action CTA */}
                  <div className="flex items-center pl-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMatch(match);
                      }}
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
                <h3 className="font-semibold text-sm text-white">{matches.length}-Match Performance</h3>
              </div>
              <span className="text-xs text-[#2DD4BF] font-mono-num font-medium">{seasonWinrate}% WR</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-sans-clean">
              <div className="p-2.5 bg-[#141419] rounded-lg border border-white/[0.04]">
                <span className="text-[#9CA3AF] text-[11px] block">Average ACS</span>
                <span className="font-mono-num font-semibold text-white text-base mt-0.5 block">{profile.acs}</span>
              </div>
              <div className="p-2.5 bg-[#141419] rounded-lg border border-white/[0.04]">
                <span className="text-[#9CA3AF] text-[11px] block">Average K/D</span>
                <span className="font-mono-num font-semibold text-[#2DD4BF] text-base mt-0.5 block">{profile.kd}</span>
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
              {mapBreakdown.length === 0 && (
                <p className="text-xs text-[#9CA3AF]">No map data yet.</p>
              )}
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
              <span>Top Performance</span>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              {bestMatch && bestPlayer
                ? `${bestMapName} match (${bestPlayer.stats.kills}/${bestPlayer.stats.deaths}/${bestPlayer.stats.assists}) with ${bestPlayer.stats.score} combat score. Open it for a full Telemetry Replay.`
                : 'No performance data yet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
