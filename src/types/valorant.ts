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
