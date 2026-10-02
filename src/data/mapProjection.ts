/**
 * Map projection configuration for Tactix Analytics.
 *
 * These are the official in-game minimap calibration values (sourced from
 * Valorant-API.com) that map raw game-space engine coordinates (`LocationDto`)
 * onto a 0–100% minimap space. This is *projection config*, not mock data, so
 * it lives here rather than in the (now deleted) legacy `mockData.ts`.
 *
 * The minimap projection convention used across the app is:
 *   pctX = (y * xMultiplier + xScalarToAdd) * 100
 *   pctY = (x * yMultiplier + yScalarToAdd) * 100
 */

import { LocationDto, MapId } from '../types/valorant';

export interface MapProjectionConfig {
  name: string;
  displayIcon: string;
  localIcon: string;
  xMultiplier: number;
  yMultiplier: number;
  xScalarToAdd: number;
  yScalarToAdd: number;
}

// Official In-Game Minimap configurations from Valorant-API.com
export const MAP_CONFIGS: Record<MapId, MapProjectionConfig> = {
  ascent: {
    name: 'Ascent',
    displayIcon: 'https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/displayicon.png',
    localIcon: '/src/assets/maps/ascent.png',
    xMultiplier: 0.00007,
    yMultiplier: -0.00007,
    xScalarToAdd: 0.813895,
    yScalarToAdd: 0.573242,
  },
  abyss: {
    name: 'Abyss',
    displayIcon: 'https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/displayicon.png',
    localIcon: '/src/assets/maps/abyss.png',
    xMultiplier: 0.000081,
    yMultiplier: -0.000081,
    xScalarToAdd: 0.5,
    yScalarToAdd: 0.5,
  },
  bind: {
    name: 'Bind',
    displayIcon: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/displayicon.png',
    localIcon: '/src/assets/maps/bind.png',
    xMultiplier: 0.000059,
    yMultiplier: -0.000059,
    xScalarToAdd: 0.576941,
    yScalarToAdd: 0.967566,
  },
  haven: {
    name: 'Haven',
    displayIcon: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/displayicon.png',
    localIcon: '/src/assets/maps/haven.png',
    xMultiplier: 0.000075,
    yMultiplier: -0.000075,
    xScalarToAdd: 1.09345,
    yScalarToAdd: 0.642728,
  },
  split: {
    name: 'Split',
    displayIcon: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/displayicon.png',
    localIcon: '/src/assets/maps/split.png',
    xMultiplier: 0.000078,
    yMultiplier: -0.000078,
    xScalarToAdd: 0.842188,
    yScalarToAdd: 0.697578,
  },
  sunset: {
    name: 'Sunset',
    displayIcon: 'https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/displayicon.png',
    localIcon: '/src/assets/maps/sunset.png',
    xMultiplier: 0.000078,
    yMultiplier: -0.000078,
    xScalarToAdd: 0.5,
    yScalarToAdd: 0.515625,
  },
  lotus: {
    name: 'Lotus',
    displayIcon: 'https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/displayicon.png',
    localIcon: '/src/assets/maps/lotus.png',
    xMultiplier: 0.000072,
    yMultiplier: -0.000072,
    xScalarToAdd: 0.454789,
    yScalarToAdd: 0.917752,
  },
};

const clampPct = (value: number): number => Math.min(100, Math.max(0, value));

/** Project a raw game-space location onto 0–100% minimap coordinates. */
export function projectLocation(location: LocationDto, mapId: MapId): { x: number; y: number } {
  const cfg = MAP_CONFIGS[mapId] ?? MAP_CONFIGS.ascent;
  return {
    x: clampPct((location.y * cfg.xMultiplier + cfg.xScalarToAdd) * 100),
    y: clampPct((location.x * cfg.yMultiplier + cfg.yScalarToAdd) * 100),
  };
}

/** Human-readable map name for a `MapId`. */
export function getMapDisplayName(mapId: MapId): string {
  return MAP_CONFIGS[mapId]?.name ?? mapId;
}
