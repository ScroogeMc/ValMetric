import React, { useState } from 'react';
import { ArrowLeft, Coins, Target, Skull } from 'lucide-react';
import { MatchDto, MapId, EconomyDto, RoundResultDto } from '../types/valorant';
import { MAP_CONFIGS, projectLocation } from '../data/mapProjection';
import {
  MAP_CATALOG,
  getMapKey,
  getAgentName,
  getWeaponName,
  getArmorName,
  CURRENT_PLAYER_PUUID,
} from '../data/mockMatches';
import { RoundTimeline } from './RoundTimeline';

const TEAL = '#2DD4BF';
const CORAL = '#F87171';

interface ReplayViewProps {
  match: MatchDto;
  onBack: () => void;
}

export const ReplayView: React.FC<ReplayViewProps> = ({ match, onBack }) => {
  const [round, setRound] = useState<number>(1);

  const mapKey = getMapKey(match.matchInfo.mapId) as MapId;
  const mapConfig = MAP_CONFIGS[mapKey] || MAP_CONFIGS.ascent;
  const mapName = MAP_CATALOG[match.matchInfo.mapId]?.name ?? 'Unknown';

  const blueTeam = match.teams.find((t) => t.teamId === 'Blue');
  const redTeam = match.teams.find((t) => t.teamId === 'Red');
  const player = match.players.find((p) => p.puuid === CURRENT_PLAYER_PUUID) ?? null;

  const isWin = blueTeam?.won ?? false;
  const score = `${blueTeam?.roundsWon ?? 0} - ${redTeam?.roundsWon ?? 0}`;
  const result = isWin ? 'Victory' : 'Defeat';
  const playerAgent = player ? getAgentName(player.characterId) : 'Unknown';
  const kda = `${player?.stats.kills ?? 0} / ${player?.stats.deaths ?? 0} / ${player?.stats.assists ?? 0}`;
  const acs = player?.stats.score ?? 0;
  const playerName = player ? `${player.gameName}#${player.tagLine}` : 'You';

  const currentRound: RoundResultDto | null =
    match.roundResults.find((r) => r.roundNum === round) ?? match.roundResults[0] ?? null;

  // Economy for the current round + pistol vs full-buy reference rounds.
  const playerEconomy = currentRound
    ? currentRound.playerStats.find((ps) => ps.puuid === CURRENT_PLAYER_PUUID)?.economy ?? null
    : null;
  const pistolRound = match.roundResults.find((r) => r.roundNum === 1) ?? null;
  const pistolEconomy = pistolRound
    ? pistolRound.playerStats.find((ps) => ps.puuid === CURRENT_PLAYER_PUUID)?.economy ?? null
    : null;
  const fullBuyRound =
    match.roundResults.find((r) => {
      const eco = r.playerStats.find((ps) => ps.puuid === CURRENT_PLAYER_PUUID)?.economy;
      return !!eco && eco.loadoutValue >= 3900;
    }) ?? null;
  const fullBuyEconomy = fullBuyRound
    ? fullBuyRound.playerStats.find((ps) => ps.puuid === CURRENT_PLAYER_PUUID)?.economy ?? null
    : null;

  const playerById = new Map(match.players.map((p) => [p.puuid, p]));
  const killEvents = currentRound
    ? currentRound.playerStats.flatMap((ps) =>
        ps.kills.map((kill) => {
          const killer = playerById.get(kill.killer);
          const category: 'teammateKill' | 'enemyKill' | 'userDeath' | 'userKill' =
            kill.killer === CURRENT_PLAYER_PUUID
              ? 'userKill'
              : kill.victim === CURRENT_PLAYER_PUUID
                ? 'userDeath'
                : killer?.teamId === 'Blue'
                  ? 'teammateKill'
                  : 'enemyKill';
          return {
            key: `${kill.timeSinceGameStartMillis}-${kill.killer}-${kill.victim}`,
            pct: projectLocation(kill.victimLocation, mapKey),
            category,
          };
        })
      )
    : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#111116] text-[#F4F4F5] font-sans-clean">
      {/* Header Bar */}
      <div className="h-12 bg-[#16161C] border-b border-white/[0.06] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#191920] border border-white/[0.06] text-zinc-200 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Matches</span>
          </button>

          <div className="h-4 w-px bg-white/10 shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm text-white truncate">Telemetry Replay · {mapName}</span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded shrink-0 ${
                isWin ? 'bg-[#2DD4BF]/15 text-[#2DD4BF]' : 'bg-[#F87171]/15 text-[#F87171]'
              }`}
            >
              {result} ({score})
            </span>
          </div>
        </div>

        {/* Player identity + performance */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          <span className="text-zinc-200 font-medium">
            {playerAgent}
            {player ? ` · ${player.gameName}#${player.tagLine}` : ''}
          </span>
          <span className="text-[#9CA3AF]">
            <span className="text-[10px] uppercase">K/D/A</span>{' '}
            <span className="font-mono-num text-white">{kda}</span>
          </span>
          <span className="text-[#9CA3AF]">
            <span className="text-[10px] uppercase">ACS</span>{' '}
            <span className="font-mono-num text-[#2DD4BF]">{acs}</span>
          </span>
        </div>
      </div>

      {/* Body: minimap + economy panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Spatial Minimap */}
        <div className="flex-1 relative flex items-center justify-center p-6 bg-[#0D0D11] bg-blueprint-grid overflow-hidden">
          <div className="relative w-[560px] h-[560px] xl:w-[630px] xl:h-[630px] bg-[#141418] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
            <img
              src={mapConfig.localIcon}
              alt={`${mapConfig.name} Minimap`}
              className="w-full h-full object-contain filter contrast-110 opacity-90 select-none pointer-events-none"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== mapConfig.displayIcon) {
                  target.src = mapConfig.displayIcon;
                }
              }}
            />

            {/* Round label */}
            <div className="absolute top-3 left-3 z-30 bg-[#191920]/95 border border-white/10 px-2 py-0.5 rounded text-[11px] font-mono-num text-zinc-200 pointer-events-none">
              Round {currentRound?.roundNum ?? '—'} · {killEvents.length} kills
            </div>

            {/* Kill / death markers */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {killEvents.map((ev) => (
                <div
                  key={ev.key}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${ev.pct.x}%`, top: `${ev.pct.y}%` }}
                >
                  {ev.category === 'teammateKill' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#22C55E] border border-[#0D0D11]" />
                  )}
                  {ev.category === 'enemyKill' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444] border border-[#0D0D11]" />
                  )}
                  {ev.category === 'userDeath' && (
                    <Skull className="w-4 h-4 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.95)]" />
                  )}
                  {ev.category === 'userKill' && (
                    <div className="w-4 h-4 rounded-full bg-[#3B82F6] border border-[#0D0D11] flex items-center justify-center">
                      <span className="text-[#EF4444] text-[10px] leading-none font-bold">✕</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Compact Legend */}
            <div className="absolute bottom-3 left-3 z-30 bg-[#191920]/95 border border-white/[0.08] p-2.5 rounded-lg text-[11px] text-zinc-300 space-y-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#22C55E]" />
                <span>Teammate kill</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#EF4444]" />
                <span>Enemy kill</span>
              </div>
              <div className="flex items-center gap-2">
                <Skull className="w-3 h-3 text-white" />
                <span>{playerName} death</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-flex items-center justify-center bg-[#3B82F6]">
                  <span className="text-[#EF4444] text-[8px] leading-none font-bold">✕</span>
                </span>
                <span>{playerName} kill</span>
              </div>
            </div>
          </div>
        </div>

        {/* Economy Panel */}
        <div className="w-80 shrink-0 h-full border-l border-white/[0.06] overflow-y-auto p-4 space-y-4">
          {/* Current Round Economy */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#2DD4BF]" />
              <h3 className="font-semibold text-sm text-white">Round Economy</h3>
            </div>

            {playerEconomy ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">Weapon</span>
                    <span className="text-white font-medium">{getWeaponName(playerEconomy.weapon)}</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-[10px] block uppercase font-medium">Armor</span>
                    <span className="text-white font-medium">{getArmorName(playerEconomy.armor)}</span>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF] text-[11px]">Loadout Value</span>
                    <span className="font-mono-num font-semibold text-white">{playerEconomy.loadoutValue.toLocaleString()} ¤</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF] text-[11px]">Spent</span>
                    <span className="font-mono-num text-[#F87171] font-medium">-{playerEconomy.spent.toLocaleString()} ¤</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF] text-[11px]">Remaining</span>
                    <span className="font-mono-num text-[#2DD4BF] font-medium">{playerEconomy.remaining.toLocaleString()} ¤</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-[#9CA3AF]">No economy data for this round.</p>
            )}
          </div>

          {/* Pistol vs Full Buy */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#9CA3AF]" />
              <h3 className="font-semibold text-sm text-white">Pistol vs Full Buy</h3>
            </div>

            <EconomyCompareRow
              label="Pistol"
              roundNum={pistolRound?.roundNum}
              economy={pistolEconomy}
              accent={CORAL}
            />
            <EconomyCompareRow
              label="Full Buy"
              roundNum={fullBuyRound?.roundNum}
              economy={fullBuyEconomy}
              accent={TEAL}
            />
          </div>
        </div>
      </div>

      {/* Round selector (the one and only round control) */}
      <RoundTimeline
        match={match}
        currentRound={round}
        onRoundChange={setRound}
      />
    </div>
  );
};

interface EconomyCompareRowProps {
  label: string;
  roundNum: number | undefined;
  economy: EconomyDto | null;
  accent: string;
}

const EconomyCompareRow: React.FC<EconomyCompareRowProps> = ({ label, roundNum, economy, accent }) => {
  return (
    <div className="p-2.5 bg-[#141419] border border-white/[0.06] rounded-lg space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-white">{label}</span>
        <span className="text-[#9CA3AF] text-[11px] font-mono-num">
          {roundNum ? `Round ${roundNum}` : '—'}
        </span>
      </div>
      {economy ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-300">
            {getWeaponName(economy.weapon)} · {getArmorName(economy.armor)}
          </span>
          <span className="font-mono-num font-semibold" style={{ color: accent }}>
            {economy.loadoutValue.toLocaleString()} ¤
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-[#9CA3AF]">No data</p>
      )}
    </div>
  );
};
