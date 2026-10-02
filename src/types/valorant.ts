export type GameSide = 'all' | 'attack' | 'defense';
export type WeaponType = 'all' | 'vandal' | 'phantom' | 'operator' | 'sheriff';
export type AnalyticsMode = 'entry_zones' | 'lone_wolf' | 'spike_retake';
export type MapId = 'ascent' | 'abyss' | 'bind' | 'haven' | 'split' | 'sunset' | 'lotus';

export interface DuelZone {
  id: string;
  mapId: MapId;
  name: string;
  callout: string;
  side: 'attack' | 'defense' | 'contested';
  firstBloods: number;
  firstDeaths: number;
  totalDuels: number;
  winrate: number; // percentage
  status: 'positive' | 'negative' | 'neutral'; // positive: teal glow, negative: red glow
  avgReactionDeltaMs: number; // e.g. -45ms or +142ms
  topEnemyWeapon: string;
  playerFavWeapon: string;
  matchesSampled: number;
  advice: string;
  burnedUtilityAvg: number;
  // Normalized percentage coordinates on minimap (0 - 100%)
  pctX: number;
  pctY: number;
  radiusPct?: number;
  /** Enemy weapons that killed the player here, tallied (non-zero counts only). */
  enemyWeapons?: { weaponId: string; count: number }[];
}

export interface PlayerPosition {
  id: string;
  agent: string;
  name: string;
  role: 'player' | 'ally' | 'enemy';
  pctX: number;
  pctY: number;
  health: number;
  weapon: string;
  hasSpike?: boolean;
}

export interface LoneWolfScenario {
  id: string;
  roundNumber: number;
  timestamp: string;
  mapId: MapId;
  location: string;
  isolationScore: number; // e.g. 82%
  untradedRoundRate: number; // e.g. 40%
  tradeGapMeters: number; // e.g. 42.4m
  recommendedProximityMeters: number; // 15m
  player: PlayerPosition;
  allies: PlayerPosition[];
  enemy: PlayerPosition;
  warningTitle: string;
  warningDescription: string;
  tacticalCorrection: string;
}

export interface TimelineEvent {
  timeSec: number;
  formattedTime: string;
  type: 'kill' | 'death' | 'spike_plant' | 'spike_defuse' | 'ability_used' | 'buy_end';
  actorAgent: string;
  targetAgent?: string;
  weapon?: string;
  isHeadshot?: boolean;
  location: string;
  creditImpact?: number; // e.g. -800
  description: string;
  /** Kill classification (undefined for spike/buy/ability events). */
  killCategory?: 'teammateKill' | 'enemyKill' | 'userDeath' | 'userKill';
}

export interface RoundEconomy {
  roundNumber: number;
  result: 'win' | 'loss';
  score: string;
  side: 'attack' | 'defense';
  startCredits: number;
  loadoutValue: number;
  spentThisRound: number;
  creditsLostOnDeath: number;
  burnedAbilities: {
    name: string;
    cost: number;
    icon: string;
  }[];
  endCredits: number;
  nextRoundMinBank: number;
  buyType: 'Full Buy' | 'Semi Eco' | 'Eco' | 'Force Buy' | 'Bonus';
  timeline: TimelineEvent[];
}

export interface PlayerStats {
  tag: string;
  name: string;
  tagline: string;
  region: string;
  rankTitle: string;
  rankTier: string;
  rr: number;
  peakRank: string;
  winrate: number;
  acs: number;
  kd: number;
  headshotPct: number;
  firstBloodRatio: number;
  matchesPlayed: number;
  mainAgent: string;
  mainRole: string;
}

// ---------------------------------------------------------------------------
// Official Riot Games `val-match-v1` DTO contracts
// ---------------------------------------------------------------------------
// These interfaces mirror the production `GET /val/match/v1/matches/{matchId}`
// response 1:1 so the mock layer can later be swapped for a live fetch with no
// component-level changes. `mapId`, `characterId`, `weapon`, `armor`,
// `playerCard`, `playerTitle` and `damageItem` are Riot UUID strings.
// ---------------------------------------------------------------------------

/** Team identifier used by the Riot API. */
export type TeamId = 'Blue' | 'Red';

/** How a round concluded. */
export type RoundResult = 'Eliminated' | 'Defused' | 'Detonated' | 'Surrendered';

/** 2D game-space coordinates (raw engine units, NOT minimap pixels). */
export interface LocationDto {
  x: number;
  y: number;
}

/** A single player's position at an instant in time (used inside KillDto). */
export interface PlayerLocationDto {
  puuid: string;
  viewRadians: number;
  location: LocationDto;
}

/** The final blow of an elimination. */
export interface FinishingDamageDto {
  damageType: 'Weapon' | 'Ability' | 'Fall' | 'Melee' | 'Bomb';
  damageItem: string;
  isSecondaryFireMode: boolean;
}

/**
 * A single elimination with full spatial context — the heart of the Tactix
 * spatial telemetry pipeline (killer, victim, victim location and the live
 * positions of every player at the moment of the kill).
 */
export interface KillDto {
  timeSinceGameStartMillis: number;
  timeSinceRoundStartMillis: number;
  killer: string; // puuid
  victim: string; // puuid
  victimLocation: LocationDto;
  assistants: string[]; // puuids
  playerLocations: PlayerLocationDto[];
  finishingDamage: FinishingDamageDto;
}

/** Damage dealt by one player to another within a round. */
export interface DamageDto {
  receiver: string; // puuid
  damage: number;
  legshots: number;
  bodyshots: number;
  headshots: number;
}

/** Round-level economy snapshot for a single player. */
export interface EconomyDto {
  loadoutValue: number;
  weapon: string; // weapon UUID
  armor: string; // armor UUID
  remaining: number; // credits remaining after buy phase
  spent: number; // credits spent during buy phase
}

/** Ability usage counters. */
export interface AbilityCastsDto {
  grenadeCasts: number;
  ability1Casts: number;
  ability2Casts: number;
  ultimateCasts: number;
}

/** Per-player, per-round statistics. */
export interface PlayerRoundStatsDto {
  puuid: string;
  kills: KillDto[];
  damage: DamageDto[];
  score: number;
  economy: EconomyDto;
  ability: AbilityCastsDto;
}

/** One resolved round of a match. */
export interface RoundResultDto {
  roundNum: number;
  roundResult: RoundResult;
  roundCeremony: string;
  winningTeam: TeamId;
  bombPlanter?: string; // puuid
  bombDefuser?: string; // puuid
  plantRoundTime?: number;
  plantPlayerLocations?: PlayerLocationDto[];
  plantLocation?: LocationDto;
  plantSite?: string;
  defuseRoundTime?: number;
  defusePlayerLocations?: PlayerLocationDto[];
  defuseLocation?: LocationDto;
  playerStats: PlayerRoundStatsDto[];
  roundResultCode: string;
}

/** Metadata block describing a match. */
export interface MatchInfoDto {
  matchId: string;
  mapId: string; // map UUID (e.g. Ascent = 7eaecc1b-...)
  gameLengthMillis: number;
  gameStartMillis: number;
  provisioningFlowId: string;
  isCompleted: boolean;
  customGameName: string;
  queueId: string; // 'competitive' | 'unrated' | 'spikerush' | ...
  gameMode: string;
  isRanked: boolean;
  seasonId: string;
}

/** Match-level aggregate statistics for a player. */
export interface PlayerStatsDto {
  score: number;
  roundsPlayed: number;
  kills: number;
  deaths: number;
  assists: number;
  playtimeMillis: number;
  abilityCasts: AbilityCastsDto;
}

/** A player participating in a match. */
export interface PlayerDto {
  puuid: string;
  gameName: string;
  tagLine: string;
  teamId: TeamId;
  partyId: string;
  characterId: string; // agent UUID
  stats: PlayerStatsDto;
  abilityCasts: AbilityCastsDto;
  competitiveTier: number;
  playerCard: string;
  playerTitle: string;
}

/** Team-level result. */
export interface TeamDto {
  teamId: TeamId;
  won: boolean;
  roundsPlayed: number;
  roundsWon: number;
  numPoints: number;
}

/** A coach slot in a custom game. */
export interface CoachDto {
  puuid: string;
  teamId: TeamId;
}

/** Root response for `GET /val/match/v1/matches/{matchId}`. */
export interface MatchDto {
  matchInfo: MatchInfoDto;
  players: PlayerDto[];
  coaches: CoachDto[];
  teams: TeamDto[];
  roundResults: RoundResultDto[];
}
