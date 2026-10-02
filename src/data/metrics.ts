/**
 * Pure, typed metric-computation layer for Tactix Analytics.
 *
 * Every UI metric is derived from the official `val-match-v1` `MatchDto`
 * objects (see `src/data/mockMatches.ts`) — nothing here fabricates a stat.
 * Fields that simply do not exist in the Riot API are handled explicitly:
 *
 *   - `region`            → a static identity constant (not present in the API).
 *   - `rankTier` / `rr` /
 *     `peakRank`          → neutral values (`String(tier)`, `0`, `rankTitle`);
 *                            RR is not exposed by `val-match-v1`.
 *   - `avgReactionDeltaMs`→ NOT true reaction latency; proxied per spec as the
 *                            mean `timeSinceRoundStartMillis` of a zone's
 *                            opening duels (a first-contact timing proxy).
 *   - player `health`     → neutral `100` (HP is not in the API).
 *
 * The "current player" is identified by `CURRENT_PLAYER_PUUID` from
 * `mockMatches.ts` and every function degrades gracefully on empty input.
 */

import {
  DuelZone,
  KillDto,
  LocationDto,
  LoneWolfScenario,
  MapId,
  MatchDto,
  PlayerDto,
  PlayerPosition,
  PlayerStats,
  RoundEconomy,
  RoundResultDto,
  TeamId,
  TimelineEvent,
} from '../types/valorant';
import {
  CURRENT_PLAYER_PUUID,
  getAgentName,
  getMapKey,
  getWeaponName,
  WEAPON_CATALOG,
} from './mockMatches';
import { projectLocation } from './mapProjection';

// ===========================================================================
// Static identity + catalogues (not derivable from the API)
// ===========================================================================

/** Region is not exposed by val-match-v1; small static identity constant. */
export const PLAYER_REGION = 'EU';

/** Recommended trade proximity in meters (used by the lone-wolf diagnostic). */
export const RECOMMENDED_PROXIMITY_METERS = 15;

/** Approximate game-space units per meter (Valorant engine units ≈ cm). */
const UNITS_PER_METER = 100;

/** Agent name -> role. Static role classification of the roster's agents. */
const AGENT_ROLES: Record<string, string> = {
  Jett: 'Duelist',
  Raze: 'Duelist',
  Reyna: 'Duelist',
  Sova: 'Initiator',
  Fade: 'Initiator',
  'KAY/O': 'Initiator',
  Omen: 'Controller',
  Killjoy: 'Sentinel',
  Cypher: 'Sentinel',
  Chamber: 'Sentinel',
};

const RANK_NAMES = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal'] as const;

/** Map competitive tier (0–27) to a rank name; 24+ is Radiant. */
function rankTitleFor(tier: number): string {
  if (tier >= 24) return 'Radiant';
  if (tier < 0) return 'Unranked';
  const rankIdx = Math.floor(tier / 3);
  const sub = (tier % 3) + 1;
  if (rankIdx >= RANK_NAMES.length) return 'Radiant';
  return `${RANK_NAMES[rankIdx]} ${sub}`;
}

// ===========================================================================
// Spatial anchors — real callout game-space coordinates (sampled from
// `valorantMapsData.json`). These are the buckets used to localize duels.
// ===========================================================================

export interface MapAnchor {
  /** Friendly display name (e.g. "B Main Chokepoint"). */
  name: string;
  /** Short callout label (e.g. "B Main"). */
  callout: string;
  side: 'attack' | 'defense' | 'contested';
  x: number;
  y: number;
  pctX: number;
  pctY: number;
}

interface RawAnchor {
  name: string;
  callout: string;
  side: 'attack' | 'defense' | 'contested';
  x: number;
  y: number;
}

const ASCENT_RAW: RawAnchor[] = [
  { name: 'A Lobby', callout: 'A Lobby', side: 'attack', x: 4489.03, y: -3014.05 },
  { name: 'A Main Long', callout: 'A Main', side: 'attack', x: 5321.62, y: -4710.13 },
  { name: 'B Lobby', callout: 'B Lobby', side: 'attack', x: -1490.59, y: -1389.97 },
  { name: 'B Main Chokepoint', callout: 'B Main', side: 'attack', x: -1983.67, y: -5840.81 },
  { name: 'Mid Top', callout: 'Mid Top', side: 'attack', x: 2753.93, y: -2129.62 },
  { name: 'A Site Core', callout: 'A Site', side: 'defense', x: 6153.59, y: -6626.21 },
  { name: 'A Window', callout: 'A Window', side: 'defense', x: 4023.02, y: -8180.69 },
  { name: 'A Rafters', callout: 'A Rafters', side: 'defense', x: 6129.89, y: -8210.0 },
  { name: 'A Garden', callout: 'A Garden', side: 'defense', x: 3773.67, y: -7551.35 },
  { name: 'A Wine & Garden', callout: 'A Wine', side: 'defense', x: 7358.74, y: -4689.27 },
  { name: 'B Site Pillar', callout: 'B Site', side: 'defense', x: -2344.07, y: -7548.51 },
  { name: 'B Boat House', callout: 'B Boat House', side: 'defense', x: -4484.77, y: -7763.36 },
  { name: 'Defender Spawn', callout: 'Defender Spawn', side: 'defense', x: 1995.24, y: -9744.92 },
  { name: 'Mid Market Window', callout: 'Mid Market', side: 'contested', x: 1089.1, y: -7363.19 },
  { name: 'Mid Bottom', callout: 'Mid Bottom', side: 'contested', x: 1122.23, y: -5951.7 },
  { name: 'Mid Courtyard', callout: 'Mid Courtyard', side: 'contested', x: 1222.7, y: -4586.6 },
  { name: 'Mid Catwalk to Tree', callout: 'Mid Catwalk', side: 'contested', x: 2315.79, y: -4127.26 },
  { name: 'Mid Cubby', callout: 'Mid Cubby', side: 'contested', x: 3387.32, y: -5129.76 },
  { name: 'Mid Link', callout: 'Mid Link', side: 'contested', x: -632.09, y: -4280.26 },
];

const BIND_RAW: RawAnchor[] = [
  { name: 'A Lobby', callout: 'A Lobby', side: 'attack', x: 6113.24, y: 3158.82 },
  { name: 'A Short', callout: 'A Short', side: 'contested', x: 7983.35, y: 803.96 },
  { name: 'A Teleporter', callout: 'A Teleporter', side: 'attack', x: 9432.3, y: 489.88 },
  { name: 'B Long', callout: 'B Long', side: 'attack', x: 7666.67, y: -6512.8 },
  { name: 'B Short', callout: 'B Short', side: 'contested', x: 7424.13, y: -3056.45 },
  { name: 'A Site Core', callout: 'A Site', side: 'defense', x: 10747.9, y: 2664.44 },
  { name: 'A Exit', callout: 'A Exit', side: 'defense', x: 7550.41, y: 5874.5 },
  { name: 'B Site Core', callout: 'B Site', side: 'defense', x: 11108.11, y: -4831.46 },
  { name: 'B Window', callout: 'B Window', side: 'contested', x: 8826.79, y: -4309.41 },
  { name: 'B Fountain', callout: 'B Fountain', side: 'contested', x: 5737.15, y: -5390.45 },
  { name: 'B Hall', callout: 'B Hall', side: 'defense', x: 12981.88, y: -4941.75 },
  { name: 'B Exit', callout: 'B Exit', side: 'defense', x: 8921.41, y: -1763.23 },
];

function anchorsWithPct(mapId: MapId, raw: RawAnchor[]): MapAnchor[] {
  return raw.map((a) => {
    const pct = projectLocation({ x: a.x, y: a.y }, mapId);
    return { ...a, pctX: pct.x, pctY: pct.y };
  });
}

/** Full anchor list per map (raw coords + projected pct). */
export const MAP_ANCHORS: Record<MapId, MapAnchor[]> = {
  ascent: anchorsWithPct('ascent', ASCENT_RAW),
  bind: anchorsWithPct('bind', BIND_RAW),
  abyss: [],
  haven: [],
  split: [],
  sunset: [],
  lotus: [],
};

/** Anchor list for a map (empty for maps without telemetry anchors). */
export function getMapAnchors(mapId: MapId): MapAnchor[] {
  return MAP_ANCHORS[mapId] ?? [];
}

function nearestAnchor(loc: LocationDto, mapId: MapId): MapAnchor | null {
  const anchors = getMapAnchors(mapId);
  if (anchors.length === 0) return null;
  let best = anchors[0];
  let bestDist = Infinity;
  for (const a of anchors) {
    const d = Math.hypot(a.x - loc.x, a.y - loc.y);
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return best;
}

// ===========================================================================
// Small internal helpers
// ===========================================================================

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));
const round1 = (n: number): number => Math.round(n * 10) / 10;
const round2 = (n: number): number => Math.round(n * 100) / 100;

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mode(values: string[]): string {
  if (values.length === 0) return 'Unknown';
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function weaponDistribution(weaponIds: string[]): string {
  if (weaponIds.length === 0) return 'No data';
  const counts = new Map<string, number>();
  for (const id of weaponIds) {
    const name = getWeaponName(id);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const [top, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return `${top} (${Math.round((100 * n) / weaponIds.length)}%)`;
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function getPlayer(match: MatchDto): PlayerDto | null {
  return match.players.find((p) => p.puuid === CURRENT_PLAYER_PUUID) ?? null;
}

function getPlayerTeam(match: MatchDto): TeamId {
  return getPlayer(match)?.teamId ?? 'Blue';
}

/** The earliest kill of a round (the "opening duel"). */
function openingKillOfRound(round: RoundResultDto): KillDto | null {
  let opening: KillDto | null = null;
  for (const ps of round.playerStats) {
    for (const k of ps.kills) {
      if (!opening || k.timeSinceRoundStartMillis < opening.timeSinceRoundStartMillis) {
        opening = k;
      }
    }
  }
  return opening;
}

function playerDeathOfRound(round: RoundResultDto): KillDto | null {
  for (const ps of round.playerStats) {
    for (const k of ps.kills) {
      if (k.victim === CURRENT_PLAYER_PUUID) return k;
    }
  }
  return null;
}

// ===========================================================================
// Player profile
// ===========================================================================

export function computeHeadshotPct(matches: MatchDto[]): number {
  let headshots = 0;
  let shots = 0;
  for (const match of matches) {
    for (const round of match.roundResults) {
      for (const ps of round.playerStats) {
        if (ps.puuid !== CURRENT_PLAYER_PUUID) continue;
        for (const d of ps.damage) {
          headshots += d.headshots;
          shots += d.headshots + d.bodyshots + d.legshots;
        }
      }
    }
  }
  return shots > 0 ? round1((100 * headshots) / shots) : 0;
}

export interface FirstBloodStats {
  firstBloods: number;
  firstDeaths: number;
  ratio: number;
}

export function computeFirstBloodStats(matches: MatchDto[]): FirstBloodStats {
  let firstBloods = 0;
  let firstDeaths = 0;
  for (const match of matches) {
    for (const round of match.roundResults) {
      const opening = openingKillOfRound(round);
      if (!opening) continue;
      if (opening.killer === CURRENT_PLAYER_PUUID) firstBloods += 1;
      if (opening.victim === CURRENT_PLAYER_PUUID) firstDeaths += 1;
    }
  }
  const ratio = firstDeaths > 0 ? round2(firstBloods / firstDeaths) : firstBloods;
  return { firstBloods, firstDeaths, ratio };
}

export function computePlayerProfile(matches: MatchDto[]): PlayerStats {
  const played = matches.length;

  let totalKills = 0;
  let totalDeaths = 0;
  let totalScore = 0;
  let totalRoundsPlayed = 0;
  let wins = 0;
  let tierSum = 0;
  let tierCount = 0;
  const agentCounts = new Map<string, number>();

  let identityName = 'Unknown';
  let identityTagline = '';
  let identityFound = false;

  for (const match of matches) {
    const blue = match.teams.find((t) => t.teamId === 'Blue');
    if (blue?.won) wins += 1;

    const player = getPlayer(match);
    if (!player) continue;

    if (!identityFound) {
      identityName = player.gameName;
      identityTagline = player.tagLine;
      identityFound = true;
    }

    totalKills += player.stats.kills;
    totalDeaths += player.stats.deaths;
    totalScore += player.stats.score;
    totalRoundsPlayed += player.stats.roundsPlayed;
    tierSum += player.competitiveTier;
    tierCount += 1;
    agentCounts.set(player.characterId, (agentCounts.get(player.characterId) ?? 0) + 1);
  }

  const mainAgentId = [...agentCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const mainAgent = mainAgentId ? getAgentName(mainAgentId) : 'Unknown';
  const tier = tierCount > 0 ? Math.round(tierSum / tierCount) : 0;
  const rankTitle = tierCount > 0 ? rankTitleFor(tier) : 'Unranked';
  const fb = computeFirstBloodStats(matches);

  return {
    tag: identityFound ? `${identityName}#${identityTagline}` : 'Unknown',
    name: identityName,
    tagline: identityTagline,
    region: PLAYER_REGION,
    rankTitle,
    rankTier: tierCount > 0 ? String(tier) : '0',
    rr: 0,
    peakRank: rankTitle,
    winrate: played > 0 ? round1((100 * wins) / played) : 0,
    // `PlayerStatsDto.score` is a match TOTAL, so the true ACS divides by
    // rounds played, not by match count.
    acs: totalRoundsPlayed > 0 ? round1(totalScore / totalRoundsPlayed) : 0,
    kd: totalDeaths > 0 ? round2(totalKills / totalDeaths) : totalKills,
    headshotPct: computeHeadshotPct(matches),
    firstBloodRatio: fb.ratio,
    matchesPlayed: played,
    mainAgent,
    mainRole: AGENT_ROLES[mainAgent] ?? 'Unknown',
  };
}

// ===========================================================================
// Duel zones (opening-duel spatial buckets)
// ===========================================================================

function buildZoneAdvice(
  callout: string,
  status: DuelZone['status'],
  winrate: number,
  playerFavWeapon: string,
  topEnemyWeapon: string,
): string {
  if (status === 'positive') {
    return `Strong opening zone — you win ${winrate}% of opening duels at ${callout}. Keep contesting with your ${playerFavWeapon}.`;
  }
  if (status === 'negative') {
    return `High-risk zone — you lose ${100 - winrate}% of opening duels at ${callout}. Avoid dry peeking; enemies favor ${topEnemyWeapon}.`;
  }
  return `Neutral zone — opening duels at ${callout} are roughly even. Commit only with utility support.`;
}

export function computeDuelZones(
  matches: MatchDto[],
  mapId: MapId,
  side: 'attack' | 'defense' | 'all' = 'all',
): DuelZone[] {
  const anchors = getMapAnchors(mapId);
  if (anchors.length === 0) return [];

  interface ZoneAgg {
    anchor: MapAnchor;
    firstBloods: number;
    firstDeaths: number;
    matchIds: Set<string>;
    killWeaponIds: string[];
    deathWeaponIds: string[];
    deathSpends: number[];
    openingTimes: number[];
  }

  const zones = new Map<string, ZoneAgg>();
  for (const a of anchors) {
    zones.set(a.callout, {
      anchor: a,
      firstBloods: 0,
      firstDeaths: 0,
      matchIds: new Set(),
      killWeaponIds: [],
      deathWeaponIds: [],
      deathSpends: [],
      openingTimes: [],
    });
  }

  for (const match of matches) {
    if (getMapKey(match.matchInfo.mapId) !== mapId) continue;

    for (const round of match.roundResults) {
      if (side !== 'all' && roundSide(match, round.roundNum) !== side) continue;
      // Opening duel (first blood / first death) bucketing.
      const opening = openingKillOfRound(round);
      if (opening && (opening.killer === CURRENT_PLAYER_PUUID || opening.victim === CURRENT_PLAYER_PUUID)) {
        const anchor = nearestAnchor(opening.victimLocation, mapId);
        if (anchor) {
          const agg = zones.get(anchor.callout)!;
          if (opening.killer === CURRENT_PLAYER_PUUID) agg.firstBloods += 1;
          if (opening.victim === CURRENT_PLAYER_PUUID) agg.firstDeaths += 1;
          agg.matchIds.add(match.matchInfo.matchId);
          agg.openingTimes.push(opening.timeSinceRoundStartMillis);
        }
      }

      // All player kills/deaths — weapon preference + burned utility.
      const playerPs = round.playerStats.find((ps) => ps.puuid === CURRENT_PLAYER_PUUID);
      const playerSpent = playerPs?.economy.spent ?? 0;

      for (const ps of round.playerStats) {
        for (const kill of ps.kills) {
          if (kill.killer === CURRENT_PLAYER_PUUID) {
            const anchor = nearestAnchor(kill.victimLocation, mapId);
            if (anchor) zones.get(anchor.callout)!.killWeaponIds.push(kill.finishingDamage.damageItem);
          } else if (kill.victim === CURRENT_PLAYER_PUUID) {
            const anchor = nearestAnchor(kill.victimLocation, mapId);
            if (anchor) {
              const agg = zones.get(anchor.callout)!;
              agg.deathWeaponIds.push(kill.finishingDamage.damageItem);
              agg.deathSpends.push(playerSpent);
              agg.matchIds.add(match.matchInfo.matchId);
            }
          }
        }
      }
    }
  }

  const result: DuelZone[] = [];
  for (const agg of zones.values()) {
    const totalDuels = agg.firstBloods + agg.firstDeaths;
    if (totalDuels === 0) continue;

    const winrate = Math.round((100 * agg.firstBloods) / totalDuels);
    const status: DuelZone['status'] = winrate > 55 ? 'positive' : winrate < 45 ? 'negative' : 'neutral';
    const playerFavWeapon = mode(agg.killWeaponIds.map(getWeaponName));
    const topEnemyWeapon = weaponDistribution(agg.deathWeaponIds);
    const burnedUtilityAvg = Math.round(mean(agg.deathSpends));
    // Reaction delta is NOT in the API. Per spec, proxy with the mean
    // first-contact time (ms) of the zone's opening duels.
    const avgReactionDeltaMs = Math.round(mean(agg.openingTimes));

    const enemyWeaponCounts = new Map<string, number>();
    for (const id of agg.deathWeaponIds) enemyWeaponCounts.set(id, (enemyWeaponCounts.get(id) ?? 0) + 1);
    const enemyWeapons: { weaponId: string; count: number }[] = [...enemyWeaponCounts.entries()]
      .filter(([, count]) => count > 0)
      .map(([weaponId, count]) => ({ weaponId, count }));

    result.push({
      id: `${mapId}-${slug(agg.anchor.callout)}`,
      mapId,
      name: agg.anchor.name,
      callout: agg.anchor.callout,
      side: agg.anchor.side,
      firstBloods: agg.firstBloods,
      firstDeaths: agg.firstDeaths,
      totalDuels,
      winrate,
      status,
      avgReactionDeltaMs,
      topEnemyWeapon,
      playerFavWeapon,
      matchesSampled: agg.matchIds.size,
      advice: buildZoneAdvice(agg.anchor.callout, status, winrate, playerFavWeapon, topEnemyWeapon),
      burnedUtilityAvg,
      enemyWeapons,
      pctX: agg.anchor.pctX,
      pctY: agg.anchor.pctY,
      radiusPct: 6.5,
    });
  }

  result.sort((a, b) => b.totalDuels - a.totalDuels);
  return result;
}

// ===========================================================================
// Lone-wolf (trade spacing) scenario
// ===========================================================================

/** % of player-involved rounds where the nearest ally was outside trade range. */
function computeUntradedRate(matches: MatchDto[], mapId: MapId): number {
  let involvedRounds = 0;
  let untradedRounds = 0;

  for (const match of matches) {
    if (getMapKey(match.matchInfo.mapId) !== mapId) continue;
    const playerTeam = getPlayerTeam(match);

    for (const round of match.roundResults) {
      let involved = false;
      let minAllyDist = Infinity;

      for (const ps of round.playerStats) {
        for (const kill of ps.kills) {
          if (kill.killer !== CURRENT_PLAYER_PUUID && kill.victim !== CURRENT_PLAYER_PUUID) continue;
          involved = true;
          const playerLoc = kill.playerLocations.find((pl) => pl.puuid === CURRENT_PLAYER_PUUID);
          if (!playerLoc) continue;

          let nearest = Infinity;
          for (const pl of kill.playerLocations) {
            if (pl.puuid === CURRENT_PLAYER_PUUID) continue;
            const p = match.players.find((pp) => pp.puuid === pl.puuid);
            if (!p || p.teamId !== playerTeam) continue;
            nearest = Math.min(nearest, Math.hypot(playerLoc.location.x - pl.location.x, playerLoc.location.y - pl.location.y));
          }
          minAllyDist = Math.min(minAllyDist, nearest);
        }
      }

      if (!involved) continue;
      involvedRounds += 1;
      if (minAllyDist / UNITS_PER_METER > RECOMMENDED_PROXIMITY_METERS) untradedRounds += 1;
    }
  }

  return involvedRounds > 0 ? Math.round((100 * untradedRounds) / involvedRounds) : 0;
}

function makePosition(
  puuid: string,
  match: MatchDto,
  location: LocationDto,
  mapId: MapId,
  role: PlayerPosition['role'],
  weapon: string,
): PlayerPosition {
  const p = match.players.find((pp) => pp.puuid === puuid);
  const pct = projectLocation(location, mapId);
  return {
    id: puuid,
    agent: p ? getAgentName(p.characterId) : 'Unknown',
    name: p ? p.gameName : 'Unknown',
    role,
    pctX: pct.x,
    pctY: pct.y,
    health: 100,
    weapon,
  };
}

function neutralScenario(mapId: MapId): LoneWolfScenario {
  const player: PlayerPosition = {
    id: 'player',
    agent: 'Unknown',
    name: 'You',
    role: 'player',
    pctX: 50,
    pctY: 50,
    health: 100,
    weapon: 'Unknown',
  };
  const ally: PlayerPosition = {
    id: 'ally',
    agent: 'Unknown',
    name: 'Nearest Ally',
    role: 'ally',
    pctX: 56,
    pctY: 50,
    health: 100,
    weapon: 'Unknown',
  };
  const enemy: PlayerPosition = {
    id: 'enemy',
    agent: 'Unknown',
    name: 'Opponent',
    role: 'enemy',
    pctX: 42,
    pctY: 50,
    health: 100,
    weapon: 'Unknown',
  };
  return {
    id: `${mapId}-lone-wolf`,
    roundNumber: 0,
    timestamp: '0:00',
    mapId,
    location: 'No telemetry',
    isolationScore: 0,
    untradedRoundRate: 0,
    tradeGapMeters: 0,
    recommendedProximityMeters: RECOMMENDED_PROXIMITY_METERS,
    player,
    allies: [ally],
    enemy,
    warningTitle: 'No telemetry available',
    warningDescription: 'No player-involved kills were found for this map yet.',
    tacticalCorrection: 'Play more matches to generate spatial trade-spacing telemetry.',
  };
}

function nearestAllyDistance(match: MatchDto, kill: KillDto): number {
  const playerTeam = getPlayerTeam(match);
  const playerLoc = kill.playerLocations.find((pl) => pl.puuid === CURRENT_PLAYER_PUUID);
  if (!playerLoc) return Infinity;

  let nearest = Infinity;
  for (const pl of kill.playerLocations) {
    if (pl.puuid === CURRENT_PLAYER_PUUID) continue;
    const p = match.players.find((pp) => pp.puuid === pl.puuid);
    if (!p || p.teamId !== playerTeam) continue;
    nearest = Math.min(nearest, Math.hypot(playerLoc.location.x - pl.location.x, playerLoc.location.y - pl.location.y));
  }
  return nearest;
}

interface IsolatedKill {
  kill: KillDto;
  round: RoundResultDto;
  nearestAllyDist: number;
}

/** Most-isolated player-involved kill among the given rounds (max ally gap). */
function findMostIsolatedPlayerKill(match: MatchDto, rounds: RoundResultDto[]): IsolatedKill | null {
  let best: IsolatedKill | null = null;
  for (const round of rounds) {
    for (const ps of round.playerStats) {
      for (const kill of ps.kills) {
        if (kill.killer !== CURRENT_PLAYER_PUUID && kill.victim !== CURRENT_PLAYER_PUUID) continue;
        const d = nearestAllyDistance(match, kill);
        if (Number.isFinite(d) && (!best || d > best.nearestAllyDist)) {
          best = { kill, round, nearestAllyDist: d };
        }
      }
    }
  }
  return best;
}

/** Build a LoneWolfScenario from a specific kill. */
function buildScenarioFromKill(
  match: MatchDto,
  round: RoundResultDto,
  kill: KillDto,
  nearestAllyDist: number,
  untradedRoundRate: number,
): LoneWolfScenario {
  const mapId = getMapKey(match.matchInfo.mapId) as MapId;
  const playerTeam = getPlayerTeam(match);
  const isPlayerVictim = kill.victim === CURRENT_PLAYER_PUUID;
  const enemyPuuid = isPlayerVictim ? kill.killer : kill.victim;

  const locationOf = (puuid: string): LocationDto | null =>
    kill.playerLocations.find((pl) => pl.puuid === puuid)?.location ?? null;

  const playerLoc = locationOf(CURRENT_PLAYER_PUUID) ?? kill.victimLocation;
  const enemyLoc = locationOf(enemyPuuid) ?? kill.victimLocation;

  const roundEconomyOf = (puuid: string): string => {
    const econ = round.playerStats.find((ps) => ps.puuid === puuid)?.economy;
    return econ ? getWeaponName(econ.weapon) : 'Unknown';
  };

  const killerWeapon = getWeaponName(kill.finishingDamage.damageItem);
  const playerWeapon = isPlayerVictim ? roundEconomyOf(CURRENT_PLAYER_PUUID) : killerWeapon;
  const enemyWeapon = isPlayerVictim ? killerWeapon : roundEconomyOf(enemyPuuid);

  const player = makePosition(CURRENT_PLAYER_PUUID, match, playerLoc, mapId, 'player', playerWeapon);
  const enemy = makePosition(enemyPuuid, match, enemyLoc, mapId, 'enemy', enemyWeapon);

  const allies: PlayerPosition[] = [];
  for (const pl of kill.playerLocations) {
    if (pl.puuid === CURRENT_PLAYER_PUUID) continue;
    const p = match.players.find((pp) => pp.puuid === pl.puuid);
    if (!p || p.teamId !== playerTeam) continue;
    allies.push(makePosition(pl.puuid, match, pl.location, mapId, 'ally', roundEconomyOf(pl.puuid)));
  }

  const tradeGapMeters = round1(nearestAllyDist / UNITS_PER_METER);
  const isolationScore =
    tradeGapMeters > 0
      ? Math.round(clamp(100 * (1 - RECOMMENDED_PROXIMITY_METERS / tradeGapMeters), 0, 100))
      : 0;
  const locationAnchor = nearestAnchor(kill.victimLocation, mapId);
  const location = locationAnchor?.callout ?? 'Unknown';

  return {
    id: `${match.matchInfo.matchId}-r${round.roundNum}-${slug(enemyPuuid)}`,
    roundNumber: round.roundNum,
    timestamp: formatSec(Math.floor(kill.timeSinceRoundStartMillis / 1000)),
    mapId,
    location,
    isolationScore,
    untradedRoundRate,
    tradeGapMeters,
    recommendedProximityMeters: RECOMMENDED_PROXIMITY_METERS,
    player,
    allies,
    enemy,
    warningTitle: 'ТАКТИЧЕСКИЙ СПЕЙСИНГ // ДИСТАНЦИЯ РАЗМЕНА',
    warningDescription: `In ${untradedRoundRate}% of rounds on this map, opening contact happens beyond ${RECOMMENDED_PROXIMITY_METERS}m from the nearest ally (your worst gap was ${tradeGapMeters}m), reducing re-frag conversion.`,
    tacticalCorrection: `Coordinate your ${location} entry with an initiator so the nearest ally stays within ${RECOMMENDED_PROXIMITY_METERS}m for an immediate trade.`,
  };
}

export function computeLoneWolfScenario(matches: MatchDto[], mapId: MapId): LoneWolfScenario {
  let best: IsolatedKill | null = null;
  let bestMatch: MatchDto | null = null;

  for (const match of matches) {
    if (getMapKey(match.matchInfo.mapId) !== mapId) continue;
    const candidate = findMostIsolatedPlayerKill(match, match.roundResults);
    if (candidate && (!best || candidate.nearestAllyDist > best.nearestAllyDist)) {
      best = candidate;
      bestMatch = match;
    }
  }

  if (!best || !bestMatch) return neutralScenario(mapId);
  return buildScenarioFromKill(bestMatch, best.round, best.kill, best.nearestAllyDist, computeUntradedRate(matches, mapId));
}

/** Lone-wolf scenario for a single round of a single match. */
export function computeTradeSpacing(match: MatchDto, roundNum: number): LoneWolfScenario {
  const mapId = getMapKey(match.matchInfo.mapId) as MapId;
  const round = match.roundResults.find((r) => r.roundNum === roundNum) ?? match.roundResults[0];
  if (!round) return neutralScenario(mapId);

  const best = findMostIsolatedPlayerKill(match, [round]);
  if (!best) return neutralScenario(mapId);

  // untradedRoundRate is scoped to this single match (vs. all matches in the aggregate).
  return buildScenarioFromKill(match, best.round, best.kill, best.nearestAllyDist, computeUntradedRate([match], mapId));
}

// ===========================================================================
// Match round timeline events + economy
// ===========================================================================

export function computeMatchEvents(match: MatchDto, roundNum: number): TimelineEvent[] {
  const round = match.roundResults.find((r) => r.roundNum === roundNum) ?? match.roundResults[0];
  if (!round) return [];

  const playerTeam = getPlayerTeam(match);
  const playerById = new Map(match.players.map((p) => [p.puuid, p]));
  const agentOf = (puuid: string): string => {
    const p = playerById.get(puuid);
    return p ? getAgentName(p.characterId) : 'Unknown';
  };

  const events: TimelineEvent[] = [
    {
      timeSec: 0,
      formattedTime: formatSec(0),
      type: 'buy_end',
      actorAgent: agentOf(CURRENT_PLAYER_PUUID),
      location: 'Buy Phase',
      description: 'Buy phase concludes.',
    },
  ];

  for (const ps of round.playerStats) {
    for (const kill of ps.kills) {
      const killer = playerById.get(kill.killer);
      const isPlayerDeath = kill.victim === CURRENT_PLAYER_PUUID;
      const isPlayerKill = kill.killer === CURRENT_PLAYER_PUUID;
      const isAllyKill = killer?.teamId === playerTeam;
      const timeSec = Math.floor(kill.timeSinceRoundStartMillis / 1000);
      const killCategory: TimelineEvent['killCategory'] = isPlayerKill
        ? 'userKill'
        : isPlayerDeath
          ? 'userDeath'
          : isAllyKill
            ? 'teammateKill'
            : 'enemyKill';

      events.push({
        timeSec,
        formattedTime: formatSec(timeSec),
        type: isPlayerDeath ? 'death' : isAllyKill ? 'kill' : 'death',
        killCategory,
        actorAgent: agentOf(kill.killer),
        targetAgent: agentOf(kill.victim),
        weapon: getWeaponName(kill.finishingDamage.damageItem),
        location: 'Contact',
        description: isPlayerKill
          ? `You eliminated ${agentOf(kill.victim)}`
          : isPlayerDeath
            ? `${agentOf(kill.killer)} eliminated you`
            : `${agentOf(kill.killer)} eliminated ${agentOf(kill.victim)}`,
      });
    }
  }

  if (round.plantRoundTime != null && round.bombPlanter) {
    const timeSec = Math.floor(round.plantRoundTime / 1000);
    events.push({
      timeSec,
      formattedTime: formatSec(timeSec),
      type: 'spike_plant',
      actorAgent: agentOf(round.bombPlanter),
      location: round.plantSite ?? 'Site',
      description: `Spike planted by ${agentOf(round.bombPlanter)}${round.plantSite ? ` @ ${round.plantSite}` : ''}`,
    });
  }

  if (round.defuseRoundTime != null && round.bombDefuser) {
    const timeSec = Math.floor(round.defuseRoundTime / 1000);
    events.push({
      timeSec,
      formattedTime: formatSec(timeSec),
      type: 'spike_defuse',
      actorAgent: agentOf(round.bombDefuser),
      location: round.plantSite ?? 'Site',
      description: `Spike defused by ${agentOf(round.bombDefuser)}`,
    });
  }

  events.sort((a, b) => a.timeSec - b.timeSec);
  return events;
}

function roundSide(match: MatchDto, roundNum: number): 'attack' | 'defense' {
  const round = match.roundResults.find((r) => r.roundNum === roundNum);
  const playerTeam = getPlayerTeam(match);
  const teamOf = (puuid?: string): TeamId | null =>
    puuid ? match.players.find((p) => p.puuid === puuid)?.teamId ?? null : null;

  if (round?.bombPlanter) return teamOf(round.bombPlanter) === playerTeam ? 'attack' : 'defense';
  if (round?.bombDefuser) return teamOf(round.bombDefuser) === playerTeam ? 'defense' : 'attack';

  // No spike data this round: infer the side swap at halftime (round 13).
  const plantRound = match.roundResults.find((r) => r.bombPlanter);
  const firstHalfAttacker: TeamId = plantRound ? teamOf(plantRound.bombPlanter) ?? 'Blue' : 'Blue';
  const playerAttacks = roundNum <= 12 ? playerTeam === firstHalfAttacker : playerTeam !== firstHalfAttacker;
  return playerAttacks ? 'attack' : 'defense';
}

export function computeRoundEconomy(match: MatchDto, roundNum: number): RoundEconomy {
  const round = match.roundResults.find((r) => r.roundNum === roundNum) ?? match.roundResults[0];
  const playerTeam = getPlayerTeam(match);

  const blue = match.teams.find((t) => t.teamId === 'Blue');
  const red = match.teams.find((t) => t.teamId === 'Red');
  const score = `${blue?.roundsWon ?? 0} - ${red?.roundsWon ?? 0}`;

  const economy = round?.playerStats.find((ps) => ps.puuid === CURRENT_PLAYER_PUUID)?.economy;
  const loadoutValue = economy?.loadoutValue ?? 0;
  const spent = economy?.spent ?? 0;
  const remaining = economy?.remaining ?? 0;
  const startCredits = spent + remaining;

  const buyType: RoundEconomy['buyType'] =
    loadoutValue >= 3900 ? 'Full Buy' : loadoutValue >= 2000 ? 'Force Buy' : 'Eco';

  const diedThisRound = round ? playerDeathOfRound(round) != null : false;

  const nextRound = match.roundResults.find((r) => r.roundNum === roundNum + 1);
  const nextEconomy = nextRound?.playerStats.find((ps) => ps.puuid === CURRENT_PLAYER_PUUID)?.economy;
  const nextRoundMinBank = nextEconomy ? nextEconomy.spent + nextEconomy.remaining : remaining;

  return {
    roundNumber: roundNum,
    result: round?.winningTeam === playerTeam ? 'win' : 'loss',
    score,
    side: roundSide(match, roundNum),
    startCredits,
    loadoutValue,
    spentThisRound: spent,
    creditsLostOnDeath: diedThisRound ? spent : 0,
    burnedAbilities: [],
    endCredits: remaining,
    nextRoundMinBank,
    buyType,
    timeline: computeMatchEvents(match, roundNum),
  };
}

// ===========================================================================
// Economy aggregates
// ===========================================================================

export interface BuyTypeConversion {
  buyType: 'Eco' | 'Force Buy' | 'Full Buy';
  rounds: number;
  wins: number;
  winRate: number; // 0–100
}

export interface WeaponEfficiency {
  weaponId: string;
  weapon: string;
  cost: number;
  buys: number;
  kills: number;
  creditsSpent: number;
  killsPer1000Credits: number;
}

export interface SectorLoss {
  mapId: MapId;
  callout: string;
  deaths: number;
  burnedCredits: number;
}

export interface EconomyAggregates {
  totalRounds: number;
  totalBurnedCredits: number;
  buyTypeConversion: BuyTypeConversion[];
  weaponEfficiency: WeaponEfficiency[];
  sectorLoss: SectorLoss[];
}

export function computeEconomyAggregates(matches: MatchDto[]): EconomyAggregates {
  const buyTiers: Record<'Eco' | 'Force Buy' | 'Full Buy', { rounds: number; wins: number }> = {
    Eco: { rounds: 0, wins: 0 },
    'Force Buy': { rounds: 0, wins: 0 },
    'Full Buy': { rounds: 0, wins: 0 },
  };
  const weaponAgg = new Map<string, { buys: number; kills: number }>();
  const sectorAgg = new Map<string, SectorLoss>();

  let totalRounds = 0;
  let totalBurnedCredits = 0;

  for (const match of matches) {
    const mapKey = getMapKey(match.matchInfo.mapId) as MapId;
    const playerTeam = getPlayerTeam(match);

    for (const round of match.roundResults) {
      const ps = round.playerStats.find((p) => p.puuid === CURRENT_PLAYER_PUUID);
      if (!ps) continue;

      totalRounds += 1;
      const economy = ps.economy;
      const tier: 'Eco' | 'Force Buy' | 'Full Buy' =
        economy.loadoutValue >= 3900 ? 'Full Buy' : economy.loadoutValue >= 2000 ? 'Force Buy' : 'Eco';
      buyTiers[tier].rounds += 1;
      if (round.winningTeam === playerTeam) buyTiers[tier].wins += 1;

      const w = weaponAgg.get(economy.weapon) ?? { buys: 0, kills: 0 };
      w.buys += 1;
      weaponAgg.set(economy.weapon, w);

      const deathKill = playerDeathOfRound(round);
      if (deathKill) {
        const anchor = nearestAnchor(deathKill.victimLocation, mapKey);
        if (anchor) {
          const key = `${mapKey}:${anchor.callout}`;
          const existing = sectorAgg.get(key) ?? { mapId: mapKey, callout: anchor.callout, deaths: 0, burnedCredits: 0 };
          existing.deaths += 1;
          existing.burnedCredits += economy.spent;
          sectorAgg.set(key, existing);
        }
        totalBurnedCredits += economy.spent;
      }

      // Kills attributed to their finishing weapon (may differ from the round's buy).
      for (const kill of ps.kills) {
        const kw = weaponAgg.get(kill.finishingDamage.damageItem) ?? { buys: 0, kills: 0 };
        kw.kills += 1;
        weaponAgg.set(kill.finishingDamage.damageItem, kw);
      }
    }
  }

  const buyTypeConversion: BuyTypeConversion[] = (['Eco', 'Force Buy', 'Full Buy'] as const).map((t) => {
    const b = buyTiers[t];
    return {
      buyType: t,
      rounds: b.rounds,
      wins: b.wins,
      winRate: b.rounds > 0 ? Math.round((100 * b.wins) / b.rounds) : 0,
    };
  });

  const weaponEfficiency: WeaponEfficiency[] = [...weaponAgg.entries()]
    .map(([weaponId, a]) => {
      const cost = WEAPON_CATALOG[weaponId]?.cost ?? 0;
      const creditsSpent = cost * a.buys;
      return {
        weaponId,
        weapon: getWeaponName(weaponId),
        cost,
        buys: a.buys,
        kills: a.kills,
        creditsSpent,
        killsPer1000Credits: creditsSpent > 0 ? round2((1000 * a.kills) / creditsSpent) : 0,
      };
    })
    .sort((a, b) => b.killsPer1000Credits - a.killsPer1000Credits);

  const sectorLoss: SectorLoss[] = [...sectorAgg.values()].sort((a, b) => b.burnedCredits - a.burnedCredits);

  return {
    totalRounds,
    totalBurnedCredits,
    buyTypeConversion,
    weaponEfficiency,
    sectorLoss,
  };
}
