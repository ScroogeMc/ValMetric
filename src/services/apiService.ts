/**
 * Data access layer for Tactix Analytics.
 *
 * This service currently resolves against the mock-first dataset in
 * `src/data/mockMatches.ts` and simulates a ~500ms network round-trip so the
 * UI exercises real async/loading/error paths today.
 *
 * To go live, set `USE_LIVE_API` to `true` and provide a Riot Production key
 * via `VITE_RIOT_API_KEY` and a platform routing region. The public surface
 * (`getMatchDetails`, `listMatches`) stays identical, so components never need
 * to change.
 */

import { MatchDto } from '../types/valorant';
import { MOCK_MATCHES, getRecentMatchIds } from '../data/mockMatches';

const MOCK_LATENCY_MS = 500;
const USE_LIVE_API = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RIOT_PLATFORM_HOST = (region: string): string => {
  // Platform routing values (e.g. `eu`, `na`, `ap`, `kr`). Resolve via your
  // own routing layer when the production key lands.
  return `https://${region}.api.riotgames.com`;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch full match details for a single match id, matching the shape of
 * `GET /val/match/v1/matches/{matchId}`.
 */
export async function getMatchDetails(matchId: string): Promise<MatchDto> {
  if (USE_LIVE_API) {
    const apiKey = import.meta.env.VITE_RIOT_API_KEY as string | undefined;
    if (!apiKey) throw new Error('Missing VITE_RIOT_API_KEY');

    // Region should be derived from the platform routing value at runtime.
    const host = RIOT_PLATFORM_HOST('eu');
    const res = await fetch(`${host}/val/match/v1/matches/${matchId}`, {
      headers: { 'X-Riot-Token': apiKey },
    });
    if (!res.ok) {
      throw new Error(`Riot match request failed: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as MatchDto;
  }

  await delay(MOCK_LATENCY_MS);
  const match = MOCK_MATCHES[matchId];
  if (!match) {
    throw new Error(`Match not found: ${matchId}`);
  }
  // Return a structured clone so callers can mutate freely without touching
  // the shared mock cache.
  return structuredClone(match);
}

/**
 * List available matches (most recent first). The mock returns the full
 * `MatchDto` objects; a production implementation would resolve match ids via
 * `val-match-v1` match-history endpoints then batch-fetch details.
 */
export async function listMatches(): Promise<MatchDto[]> {
  if (USE_LIVE_API) {
    // Placeholder for the real match-history flow.
    throw new Error('Live match-history flow not wired yet.');
  }

  await delay(MOCK_LATENCY_MS);
  return getRecentMatchIds().map((id) => structuredClone(MOCK_MATCHES[id]));
}
