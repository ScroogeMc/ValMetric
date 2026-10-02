/**
 * Mock-first spatial telemetry dataset for Tactix Analytics.
 *
 * This module produces deterministic, type-safe `MatchDto` objects that mirror
 * the official Riot Games `val-match-v1` response shape 1:1. When the Riot
 * Production API key arrives, `src/services/apiService.ts` can be flipped to a
 * live `fetch` without touching any consumer of this data.
 *
 * Spatial coordinates (`LocationDto.x` / `LocationDto.y`) are raw game-space
 * engine units, sampled from the real callout locations stored in
 * `src/data/valorantMapsData.json`, so they loosely map onto valid playable
 * areas of Ascent and Bind. Minimap projection is handled separately by
 * `MAP_CONFIGS` in `src/data/mockData.ts`.
 */

import {
  AbilityCastsDto,
  DamageDto,
  EconomyDto,
  KillDto,
  LocationDto,
  MatchDto,
  PlayerDto,
  PlayerLocationDto,
  PlayerRoundStatsDto,
  RoundResult,
  RoundResultDto,
  TeamDto,
  TeamId,
} from '../types/valorant';

// ===========================================================================
// Catalogues (Riot UUID -> human-friendly metadata)
// ===========================================================================

export const MAP_CATALOG: Record<string, { id: string; name: string }> = {
  '7eaecc1b-4337-bbf6-6ab9-04b8f06b3319': { id: 'ascent', name: 'Ascent' },
  '2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba': { id: 'bind', name: 'Bind' },
};

export const AGENT_CATALOG: Record<string, string> = {
  'add6443a-41bd-e414-f6ad-e58d267f4e95': 'Jett',
  '320b2a48-4d9b-a075-30f1-1f93a9b638fa': 'Sova',
  '8e253930-4c05-31dd-1b6c-968525494517': 'Omen',
  '1e58de9c-4950-5125-93e9-a0aee9f98746': 'Killjoy',
  '601dbbe7-43ce-be57-2a40-4abd24953621': 'KAY/O',
  '22697a3d-45bf-8dd7-4fec-84a9e28c69d7': 'Chamber',
  'dade69b4-4f5a-8528-247b-219e5a1facd6': 'Fade',
  'f94c3b30-42be-e959-889c-5aa313dba261': 'Raze',
  '117ed9e3-49f3-6512-3ccf-0cada7e3823b': 'Cypher',
  'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc': 'Reyna',
};

export const WEAPON_CATALOG: Record<string, { name: string; cost: number }> = {
  '29a0cfab-485b-f5d5-779a-b59f85e204a8': { name: 'Classic', cost: 0 },
  '1baa85b4-4c70-1284-64bb-6481dfc3ff4e': { name: 'Ghost', cost: 500 },
  'e336c6b8-418d-9340-d77f-7a9e4cfe0702': { name: 'Sheriff', cost: 800 },
  'f7e1b454-4ad4-1063-ec0a-159e56b58941': { name: 'Stinger', cost: 1100 },
  '462080d1-4035-2937-7c09-27aa2a5c27a7': { name: 'Spectre', cost: 1600 },
  'c4883e50-4494-202c-3ef3-6b43e1c67d80': { name: 'Marshal', cost: 950 },
  'ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a': { name: 'Phantom', cost: 2900 },
  '9c82e19d-4575-0200-1a81-3eacf00cf872': { name: 'Vandal', cost: 2900 },
  'a03b24d3-4d59-24ea-3e01-ba42dd25c59e': { name: 'Operator', cost: 4700 },
};

export const ARMOR_CATALOG: Record<string, { name: string; cost: number }> = {
  none: { name: 'No Armor', cost: 0 },
  '4dec83d5-4f02-1123-ee8f-75b7d9c7c925': { name: 'Light Shields', cost: 400 },
  '822bcab2-40e0-cb95-8c22-88a4e486c5c7': { name: 'Heavy Shields', cost: 1000 },
};

export function getAgentName(characterId: string): string {
  return AGENT_CATALOG[characterId] ?? 'Unknown';
}

export function getWeaponName(weaponId: string): string {
  return WEAPON_CATALOG[weaponId]?.name ?? 'Unknown';
}

export function getArmorName(armorId: string): string {
  return ARMOR_CATALOG[armorId]?.name ?? 'No Armor';
}

export function getMapKey(mapId: string): string {
  return MAP_CATALOG[mapId]?.id ?? 'ascent';
}

// ===========================================================================
// Deterministic PRNG (mulberry32) so the mock dataset is reproducible
// ===========================================================================

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(arr: T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)];

// ===========================================================================
// Player roster (the "current player" is Phantom#ACE on Blue)
// ===========================================================================

export const CURRENT_PLAYER_PUUID = '11111111-1111-4111-8111-111111111111';

interface RosterEntry {
  puuid: string;
  gameName: string;
  tagLine: string;
  teamId: TeamId;
  characterId: string;
  competitiveTier: number;
}

const ROSTER: RosterEntry[] = [
  { puuid: '11111111-1111-4111-8111-111111111111', gameName: 'Phantom', tagLine: 'ACE', teamId: 'Blue', characterId: 'add6443a-41bd-e414-f6ad-e58d267f4e95', competitiveTier: 27 },
  { puuid: '22222222-2222-4222-8222-222222222222', gameName: 'Chronos', tagLine: 'EUW', teamId: 'Blue', characterId: '320b2a48-4d9b-a075-30f1-1f93a9b638fa', competitiveTier: 26 },
  { puuid: '33333333-3333-4333-8333-333333333333', gameName: 'Vortex', tagLine: 'SMK', teamId: 'Blue', characterId: '8e253930-4c05-31dd-1b6c-968525494517', competitiveTier: 25 },
  { puuid: '44444444-4444-4444-8444-444444444444', gameName: 'NanoTech', tagLine: 'KJ', teamId: 'Blue', characterId: '1e58de9c-4950-5125-93e9-a0aee9f98746', competitiveTier: 25 },
  { puuid: '55555555-5555-4555-8555-555555555555', gameName: 'Spectre', tagLine: 'INIT', teamId: 'Blue', characterId: '601dbbe7-43ce-be57-2a40-4abd24953621', competitiveTier: 24 },
  { puuid: '66666666-6666-4666-8666-666666666666', gameName: 'ApexSniper', tagLine: 'OP', teamId: 'Red', characterId: '22697a3d-45bf-8dd7-4fec-84a9e28c69d7', competitiveTier: 27 },
  { puuid: '77777777-7777-4777-8777-777777777777', gameName: 'Wraith', tagLine: 'FADE', teamId: 'Red', characterId: 'dade69b4-4f5a-8528-247b-219e5a1facd6', competitiveTier: 25 },
  { puuid: '88888888-8888-4888-8888-888888888888', gameName: 'Blitz', tagLine: 'RAZE', teamId: 'Red', characterId: 'f94c3b30-42be-e959-889c-5aa313dba261', competitiveTier: 25 },
  { puuid: '99999999-9999-4999-8999-999999999999', gameName: 'Ghost', tagLine: 'CYP', teamId: 'Red', characterId: '117ed9e3-49f3-6512-3ccf-0cada7e3823b', competitiveTier: 24 },
  { puuid: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', gameName: 'Nova', tagLine: 'REY', teamId: 'Red', characterId: 'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc', competitiveTier: 24 },
];

// ===========================================================================
// Spatial anchors — game-space coordinates sampled from real callout data
// ===========================================================================

interface SpatialAnchor {
  name: string;
  x: number;
  y: number;
}

const loc = (a: SpatialAnchor): LocationDto => ({ x: a.x, y: a.y });

const ASCENT_ANCHORS: SpatialAnchor[] = [
  // Attacker side
  { name: 'A Lobby', x: 4489.03, y: -3014.05 },
  { name: 'A Main', x: 5321.62, y: -4710.13 },
  { name: 'B Lobby', x: -1490.59, y: -1389.97 },
  { name: 'B Main', x: -1983.67, y: -5840.81 },
  { name: 'Mid Top', x: 2753.93, y: -2129.62 },
  // Defender side
  { name: 'A Site', x: 6153.59, y: -6626.21 },
  { name: 'A Window', x: 4023.02, y: -8180.69 },
  { name: 'A Rafters', x: 6129.89, y: -8210.0 },
  { name: 'A Garden', x: 3773.67, y: -7551.35 },
  { name: 'A Wine', x: 7358.74, y: -4689.27 },
  { name: 'B Site', x: -2344.07, y: -7548.51 },
  { name: 'B Boat House', x: -4484.77, y: -7763.36 },
  { name: 'Defender Spawn', x: 1995.24, y: -9744.92 },
  { name: 'Mid Market', x: 1089.1, y: -7363.19 },
  { name: 'Mid Bottom', x: 1122.23, y: -5951.7 },
  // Mid contact / contested
  { name: 'Mid Courtyard', x: 1222.7, y: -4586.6 },
  { name: 'Mid Catwalk', x: 2315.79, y: -4127.26 },
  { name: 'Mid Cubby', x: 3387.32, y: -5129.76 },
  { name: 'Mid Link', x: -632.09, y: -4280.26 },
];

const BIND_ANCHORS: SpatialAnchor[] = [
  // Attacker side
  { name: 'A Lobby', x: 6113.24, y: 3158.82 },
  { name: 'A Short', x: 7983.35, y: 803.96 },
  { name: 'A Teleporter', x: 9432.3, y: 489.88 },
  { name: 'B Long', x: 7666.67, y: -6512.8 },
  { name: 'B Short', x: 7424.13, y: -3056.45 },
  // Defender side
  { name: 'A Site', x: 10747.9, y: 2664.44 },
  { name: 'A Exit', x: 7550.41, y: 5874.5 },
  { name: 'B Site', x: 11108.11, y: -4831.46 },
  { name: 'B Window', x: 8826.79, y: -4309.41 },
  { name: 'B Fountain', x: 5737.15, y: -5390.45 },
  { name: 'B Hall', x: 12981.88, y: -4941.75 },
  { name: 'B Exit', x: 8921.41, y: -1763.23 },
];

interface MatchConfig {
  matchId: string;
  mapId: string;
  queueId: string;
  startMillis: number;
  roundWinners: TeamId[]; // index 0 = round 1
  anchors: SpatialAnchor[];
  attackHome: string[]; // anchor names for the 5 attackers
  defenseHome: string[]; // anchor names for the 5 defenders
  contact: string[]; // anchor names used as duel / kill locations
  plantSites: { site: string; anchor: string }[];
}

const ASCENT_CONFIG: MatchConfig = {
  matchId: 'match-ascent-001',
  mapId: '7eaecc1b-4337-bbf6-6ab9-04b8f06b3319',
  queueId: 'competitive',
  startMillis: 1736946000000, // 2025-01-15T14:00:00Z
  roundWinners: [
    'Blue', 'Red', 'Blue', 'Blue', 'Red', 'Blue', 'Red', 'Blue', 'Blue', 'Red',
    'Blue', 'Blue', 'Red', 'Blue', 'Red', 'Blue', 'Red', 'Blue', 'Red', 'Blue',
    'Red', 'Blue',
  ], // 13 - 9 Blue victory
  anchors: ASCENT_ANCHORS,
  attackHome: ['A Lobby', 'A Main', 'Mid Top', 'B Lobby', 'B Main'],
  defenseHome: ['A Site', 'Mid Market', 'B Site', 'B Boat House', 'Defender Spawn'],
  contact: ['A Main', 'A Site', 'B Main', 'B Site', 'Mid Courtyard', 'Mid Catwalk', 'Mid Market', 'Mid Bottom'],
  plantSites: [
    { site: 'A', anchor: 'A Site' },
    { site: 'B', anchor: 'B Site' },
  ],
};

const BIND_CONFIG: MatchConfig = {
  matchId: 'match-bind-001',
  mapId: '2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba',
  queueId: 'competitive',
  startMillis: 1736953200000, // 2025-01-15T16:00:00Z
  roundWinners: [
    'Red', 'Blue', 'Red', 'Red', 'Blue', 'Red', 'Blue', 'Red', 'Blue', 'Red',
    'Blue', 'Red', 'Blue', 'Red', 'Blue', 'Red', 'Blue', 'Red', 'Blue', 'Red',
    'Blue', 'Red', 'Blue', 'Red',
  ], // 11 - 13 Blue defeat
  anchors: BIND_ANCHORS,
  attackHome: ['A Lobby', 'A Short', 'B Long', 'B Short', 'A Teleporter'],
  defenseHome: ['A Site', 'B Site', 'B Window', 'B Fountain', 'A Exit'],
  contact: ['A Site', 'A Short', 'B Site', 'B Long', 'B Short', 'B Window'],
  plantSites: [
    { site: 'A', anchor: 'A Site' },
    { site: 'B', anchor: 'B Site' },
  ],
};

// ===========================================================================
// Builder helpers
// ===========================================================================

const findAnchor = (name: string, anchors: SpatialAnchor[]): SpatialAnchor =>
  anchors.find((a) => a.name === name) ?? anchors[0];

const jitter = (l: LocationDto, rng: () => number, amount = 240): LocationDto => ({
  x: l.x + (rng() - 0.5) * amount * 2,
  y: l.y + (rng() - 0.5) * amount * 2,
});

const emptyAbility = (): AbilityCastsDto => ({
  grenadeCasts: 0,
  ability1Casts: 0,
  ability2Casts: 0,
  ultimateCasts: 0,
});

const randomAbility = (rng: () => number): AbilityCastsDto => ({
  grenadeCasts: Math.floor(rng() * 2),
  ability1Casts: Math.floor(rng() * 3),
  ability2Casts: Math.floor(rng() * 3),
  ultimateCasts: Math.floor(rng() * 2),
});

const WEAPON_IDS = {
  classic: '29a0cfab-485b-f5d5-779a-b59f85e204a8',
  ghost: '1baa85b4-4c70-1284-64bb-6481dfc3ff4e',
  sheriff: 'e336c6b8-418d-9340-d77f-7a9e4cfe0702',
  spectre: '462080d1-4035-2937-7c09-27aa2a5c27a7',
  marshal: 'c4883e50-4494-202c-3ef3-6b43e1c67d80',
  phantom: 'ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a',
  vandal: '9c82e19d-4575-0200-1a81-3eacf00cf872',
  operator: 'a03b24d3-4d59-24ea-3e01-ba42dd25c59e',
};

const ARMOR_IDS = {
  none: 'none',
  light: '4dec83d5-4f02-1123-ee8f-75b7d9c7c925',
  heavy: '822bcab2-40e0-cb95-8c22-88a4e486c5c7',
};

interface BuyResult {
  weapon: string;
  armor: string;
  loadoutValue: number;
  spent: number;
  remaining: number;
}

/** Simulate a buy decision for a team based on its current bank. */
function simulateBuy(roundNum: number, credits: number, rng: () => number): BuyResult {
  const isPistol = roundNum === 1 || roundNum === 13;
  let weapon: string;
  let armor: string;
  let abilitySpent = 0;

  if (isPistol) {
    // Pistol round: default Classic, some players stretch for a Ghost.
    weapon = credits >= 850 && rng() > 0.4 ? WEAPON_IDS.ghost : WEAPON_IDS.classic;
    armor = rng() > 0.6 ? ARMOR_IDS.light : ARMOR_IDS.none;
    abilitySpent = Math.floor(rng() * 3) * 50;
  } else if (credits >= 4700) {
    // Full buy: rifle, or Operator on a minority of rounds.
    weapon = rng() > 0.85 ? WEAPON_IDS.operator : rng() > 0.5 ? WEAPON_IDS.vandal : WEAPON_IDS.phantom;
    armor = ARMOR_IDS.heavy;
    abilitySpent = 400 + Math.floor(rng() * 3) * 100;
  } else if (credits >= 2300) {
    // Half buy / force buy.
    weapon = rng() > 0.5 ? WEAPON_IDS.spectre : WEAPON_IDS.marshal;
    armor = ARMOR_IDS.light;
    abilitySpent = 150 + Math.floor(rng() * 3) * 100;
  } else {
    // Eco.
    weapon = rng() > 0.5 ? WEAPON_IDS.classic : WEAPON_IDS.sheriff;
    armor = ARMOR_IDS.none;
    abilitySpent = 0;
  }

  const weaponCost = WEAPON_CATALOG[weapon].cost;
  const armorCost = ARMOR_CATALOG[armor].cost;
  const spent = weaponCost + armorCost + abilitySpent;
  const loadoutValue = weaponCost + armorCost;
  const remaining = Math.max(0, credits - spent);

  return { weapon, armor, loadoutValue, spent, remaining };
}

const makeEconomy = (buy: BuyResult): EconomyDto => ({
  loadoutValue: buy.loadoutValue,
  weapon: buy.weapon,
  armor: buy.armor,
  remaining: buy.remaining,
  spent: buy.spent,
});

interface AggregatedStats {
  kills: number;
  deaths: number;
  assists: number;
  score: number;
}

function buildPlayer(entry: RosterEntry, agg: AggregatedStats, roundsPlayed: number, playtimeMillis: number): PlayerDto {
  return {
    puuid: entry.puuid,
    gameName: entry.gameName,
    tagLine: entry.tagLine,
    teamId: entry.teamId,
    partyId: `party-${entry.teamId.toLowerCase()}`,
    characterId: entry.characterId,
    stats: {
      score: agg.score,
      roundsPlayed,
      kills: agg.kills,
      deaths: agg.deaths,
      assists: agg.assists,
      playtimeMillis,
      abilityCasts: emptyAbility(),
    },
    abilityCasts: emptyAbility(),
    competitiveTier: entry.competitiveTier,
    playerCard: '9fb348bc-41a0-91ad-8a3e-818035c4e561',
    playerTitle: 'f7c1b7b4-4d5e-8f3a-9c2b-123456789abc',
  };
}

function buildPlayerLocations(args: {
  config: MatchConfig;
  attacker: TeamId;
  killer: string;
  victim: string;
  killerLocation: LocationDto;
  victimLocation: LocationDto;
  rng: () => number;
}): PlayerLocationDto[] {
  const { config, attacker, killer, victim, killerLocation, victimLocation, rng } = args;

  const teamOrder = new Map<string, number>();
  for (const entry of ROSTER) {
    const teammates = ROSTER.filter((r) => r.teamId === entry.teamId);
    teamOrder.set(entry.puuid, teammates.findIndex((r) => r.puuid === entry.puuid));
  }

  return ROSTER.map((entry) => {
    let location: LocationDto;
    if (entry.puuid === victim) {
      location = victimLocation;
    } else if (entry.puuid === killer) {
      location = killerLocation;
    } else {
      const homeNames = entry.teamId === attacker ? config.attackHome : config.defenseHome;
      const idx = teamOrder.get(entry.puuid) ?? 0;
      const home = findAnchor(homeNames[idx % homeNames.length], config.anchors);
      location = jitter(loc(home), rng, 320);
    }
    return {
      puuid: entry.puuid,
      viewRadians: Math.round(rng() * 628) / 100, // 0..2π
      location,
    };
  });
}

// ===========================================================================
// Match builder
// ===========================================================================

function buildMatch(config: MatchConfig): MatchDto {
  const rng = mulberry32(config.matchId.split('').reduce((s, c) => s + c.charCodeAt(0), 0));

  const roundsWon: Record<TeamId, number> = { Blue: 0, Red: 0 };
  const totalRounds = config.roundWinners.length;
  const roundDurationMs = 100_000; // ~100s per round
  const gameLengthMillis = totalRounds * roundDurationMs;

  // Economy state machines (credits carried across rounds).
  const credits: Record<TeamId, number> = { Blue: 800, Red: 800 };
  const lossStreak: Record<TeamId, number> = { Blue: 0, Red: 0 };

  // Match-level aggregation.
  const agg = new Map<string, AggregatedStats>();
  for (const e of ROSTER) agg.set(e.puuid, { kills: 0, deaths: 0, assists: 0, score: 0 });

  const roundResults: RoundResultDto[] = [];

  for (let i = 0; i < totalRounds; i += 1) {
    const roundNum = i + 1;
    const roundStartMs = i * roundDurationMs;
    const attacker: TeamId = roundNum <= 12 ? 'Blue' : 'Red';
    const winningTeam = config.roundWinners[i];
    roundsWon[winningTeam] += 1;

    // --- Economy (per team this round) ---
    const buys: Record<TeamId, BuyResult> = {
      Blue: simulateBuy(roundNum, credits.Blue, rng),
      Red: simulateBuy(roundNum, credits.Red, rng),
    };

    // --- Round resolution ---
    const isPlantRound = roundNum % 4 === 0;
    let roundResult: RoundResult;
    let roundResultCode: string;
    let bombPlanter: string | undefined;
    let bombDefuser: string | undefined;
    let plantLocation: LocationDto | undefined;
    let plantSite: string | undefined;
    let plantRoundTime: number | undefined;
    let defuseLocation: LocationDto | undefined;
    let defuseRoundTime: number | undefined;

    if (isPlantRound) {
      const site = pick(config.plantSites, rng);
      plantSite = site.site;
      plantLocation = jitter(loc(findAnchor(site.anchor, config.anchors)), rng, 120);
      plantRoundTime = Math.floor(roundDurationMs * (0.55 + rng() * 0.25));
      bombPlanter = pick(ROSTER.filter((p) => p.teamId === attacker), rng).puuid;

      if (winningTeam === attacker) {
        roundResult = 'Detonated';
        roundResultCode = 'Detonation';
      } else {
        roundResult = 'Defused';
        roundResultCode = 'Defuse';
        bombDefuser = pick(ROSTER.filter((p) => p.teamId !== attacker), rng).puuid;
        defuseLocation = jitter(plantLocation, rng, 160);
        defuseRoundTime = Math.min(roundDurationMs - 5000, plantRoundTime + Math.floor(20000 + rng() * 20000));
      }
    } else {
      roundResult = 'Eliminated';
      roundResultCode = 'Elimination';
    }

    // --- Generate kills for the round (with alive/dead tracking) ---
    // The winning team eliminates every losing player, while the losing team
    // lands a few counter-kills before going down. Alive/dead state is tracked
    // so an already-dead player can never register a kill or a death (no
    // "zombie" frags: the trade loop must pick only ALIVE players).
    const losers = ROSTER.filter((p) => p.teamId !== winningTeam);
    const losingTeam: TeamId = winningTeam === 'Blue' ? 'Red' : 'Blue';

    const kills: KillDto[] = [];
    const damageByPuuid = new Map<string, DamageDto[]>();
    let timeInRound = 18_000 + Math.floor(rng() * 12_000); // first contact ~0:18-0:30

    const alive = new Set<string>(ROSTER.map((r) => r.puuid));
    const aliveOf = (team: TeamId): RosterEntry[] =>
      ROSTER.filter((r) => r.teamId === team && alive.has(r.puuid));

    const pushKill = (killer: RosterEntry, victim: RosterEntry, assistants: string[], stepMs: number): void => {
      const duelAnchor = findAnchor(pick(config.contact, rng), config.anchors);
      const victimLocation = jitter(loc(duelAnchor), rng, 180);
      const killerLocation = jitter(victimLocation, rng, 260);
      const isHeadshot = rng() > 0.55;
      const damageItem = killer.characterId === '22697a3d-45bf-8dd7-4fec-84a9e28c69d7'
        ? WEAPON_IDS.operator
        : buys[killer.teamId].weapon;

      kills.push({
        timeSinceGameStartMillis: roundStartMs + timeInRound,
        timeSinceRoundStartMillis: timeInRound,
        killer: killer.puuid,
        victim: victim.puuid,
        victimLocation,
        assistants,
        playerLocations: buildPlayerLocations({
          config,
          attacker,
          killer: killer.puuid,
          victim: victim.puuid,
          killerLocation,
          victimLocation,
          rng,
        }),
        finishingDamage: {
          damageType: 'Weapon',
          damageItem,
          isSecondaryFireMode: false,
        },
      });

      const dmg = damageByPuuid.get(killer.puuid) ?? [];
      dmg.push({
        receiver: victim.puuid,
        damage: isHeadshot ? 156 : 40 + Math.floor(rng() * 4) * 40,
        legshots: isHeadshot ? 0 : Math.floor(rng() * 3),
        bodyshots: isHeadshot ? 0 : Math.floor(rng() * 4),
        headshots: isHeadshot ? 1 : 0,
      });
      damageByPuuid.set(killer.puuid, dmg);

      alive.delete(victim.puuid);
      timeInRound += stepMs;
    };

    // Counter-kills land first (the losing team trades before going down):
    // the killer must be an ALIVE loser and the victim an ALIVE winner.
    const tradeCount = Math.min(losers.length, Math.floor(rng() * 4));
    for (let t = 0; t < tradeCount; t += 1) {
      const killer = pick(aliveOf(losingTeam), rng);
      const victim = pick(aliveOf(winningTeam), rng);
      pushKill(killer, victim, [], 5_000 + Math.floor(rng() * 9_000));
    }

    // The winning team then eliminates every surviving losing player.
    losers.forEach((loser) => {
      if (!alive.has(loser.puuid)) return;
      const killer = pick(aliveOf(winningTeam), rng);
      const assistants =
        rng() > 0.6
          ? [pick(aliveOf(winningTeam).filter((w) => w.puuid !== killer.puuid), rng).puuid]
          : [];
      pushKill(killer, loser, assistants, 6_000 + Math.floor(rng() * 14_000));
    });

    // --- Assemble per-player round stats ---
    const playerStats: PlayerRoundStatsDto[] = ROSTER.map((entry) => {
      const playerKills = kills.filter((k) => k.killer === entry.puuid);
      const playerAssists = kills.filter((k) => k.assistants.includes(entry.puuid)).length;
      const damage = damageByPuuid.get(entry.puuid) ?? [];
      const roundScore =
        playerKills.length * 150 +
        playerAssists * 50 +
        Math.floor(damage.reduce((s, d) => s + d.damage, 0) / 10);

      const a = agg.get(entry.puuid)!;
      a.kills += playerKills.length;
      a.assists += playerAssists;
      a.deaths += kills.filter((k) => k.victim === entry.puuid).length;
      a.score += roundScore;

      return {
        puuid: entry.puuid,
        kills: playerKills,
        damage,
        score: roundScore,
        economy: makeEconomy(buys[entry.teamId]),
        ability: randomAbility(rng),
      };
    });

    roundResults.push({
      roundNum,
      roundResult,
      roundCeremony: 'CeremonyDefault',
      winningTeam,
      bombPlanter,
      bombDefuser,
      plantRoundTime,
      plantLocation,
      plantSite,
      defuseRoundTime,
      defuseLocation,
      playerStats,
      roundResultCode,
    });

    // --- Advance economy for next round ---
    for (const team of ['Blue', 'Red'] as TeamId[]) {
      const won = team === winningTeam;
      if (won) {
        credits[team] = buys[team].remaining + 3000;
        lossStreak[team] = 0;
      } else {
        lossStreak[team] += 1;
        credits[team] = buys[team].remaining + 1900 + Math.min(4, lossStreak[team] - 1) * 500;
      }
    }
  }

  // --- Build players with aggregated stats ---
  const players: PlayerDto[] = ROSTER.map((entry) =>
    buildPlayer(entry, agg.get(entry.puuid)!, totalRounds, gameLengthMillis),
  );

  const maxRounds = Math.max(roundsWon.Blue, roundsWon.Red);
  const teams: TeamDto[] = (['Blue', 'Red'] as TeamId[]).map((teamId) => ({
    teamId,
    won: roundsWon[teamId] === maxRounds && roundsWon.Blue !== roundsWon.Red,
    roundsPlayed: totalRounds,
    roundsWon: roundsWon[teamId],
    numPoints: roundsWon[teamId],
  }));

  return {
    matchInfo: {
      matchId: config.matchId,
      mapId: config.mapId,
      gameLengthMillis,
      gameStartMillis: config.startMillis,
      provisioningFlowId: 'Matchmaking',
      isCompleted: true,
      customGameName: '',
      queueId: config.queueId,
      gameMode: '/Game/GameModes/Standard/StandardGameMode.StandardGameMode_C',
      isRanked: true,
      seasonId: '0df5adb9-4dcb-6895-1306-3e9860661dd3',
    },
    players,
    coaches: [],
    teams,
    roundResults,
  };
}

// ===========================================================================
// Exported dataset
// ===========================================================================

export const MOCK_MATCHES: Record<string, MatchDto> = {
  [ASCENT_CONFIG.matchId]: buildMatch(ASCENT_CONFIG),
  [BIND_CONFIG.matchId]: buildMatch(BIND_CONFIG),
};

export const MOCK_MATCH_IDS: string[] = Object.keys(MOCK_MATCHES);

/** Most-recent-first match id ordering. */
export function getRecentMatchIds(): string[] {
  return [...MOCK_MATCH_IDS].sort((a, b) => {
    const ma = MOCK_MATCHES[a].matchInfo.gameStartMillis;
    const mb = MOCK_MATCHES[b].matchInfo.gameStartMillis;
    return mb - ma;
  });
}
