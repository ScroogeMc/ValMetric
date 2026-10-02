/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import { LoneWolfPanel } from './components/LoneWolfPanel';
import { TacticalIntelPanel } from './components/TacticalIntelPanel';
import { OverviewView } from './components/OverviewView';
import { MatchesView } from './components/MatchesView';
import { EconomyView } from './components/EconomyView';
import { CoachingView } from './components/CoachingView';
import { ReplayView } from './components/ReplayView';

import { listMatches } from './services/apiService';
import {
  computePlayerProfile,
  computeDuelZones,
  computeLoneWolfScenario,
  computeTradeSpacing,
  computeFirstBloodStats,
  computeEconomyAggregates,
} from './data/metrics';
import { getMapKey } from './data/mockMatches';
import {
  DuelZone,
  AnalyticsMode,
  GameSide,
  WeaponType,
  MapId,
  MatchDto,
  LoneWolfScenario,
} from './types/valorant';

const MAP_IDS: MapId[] = ['ascent', 'abyss', 'bind', 'haven', 'split', 'sunset', 'lotus'];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [currentMap, setCurrentMap] = useState<MapId>('ascent');
  const [activeMode, setActiveMode] = useState<AnalyticsMode>('entry_zones');
  const [activeSide, setActiveSide] = useState<GameSide>('all');
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>('all');
  const [selectedZone, setSelectedZone] = useState<DuelZone | null>(null);
  const [tradeRound, setTradeRound] = useState<number>(1);

  // --- val-match-v1 match data (consumed via src/services/apiService.ts) ---
  const [matches, setMatches] = useState<MatchDto[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchDto | null>(null);
  const [matchesLoading, setMatchesLoading] = useState<boolean>(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listMatches();
        if (cancelled) return;
        setMatches(data);
      } catch (err) {
        if (!cancelled) {
          setMatchesError(err instanceof Error ? err.message : 'Failed to load matches');
        }
      } finally {
        if (!cancelled) setMatchesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Derived aggregate analytics (across ALL loaded matches) ---
  const profile = useMemo(() => computePlayerProfile(matches), [matches]);
  const firstBloodStats = useMemo(() => computeFirstBloodStats(matches), [matches]);
  const economyAggregates = useMemo(() => computeEconomyAggregates(matches), [matches]);

  // Entry Duels: recompute zones per side so firstBloods/firstDeaths/winrate
  // genuinely recalculate (not just hide zones) when Attack/Defense/All changes.
  const activeZones = useMemo(
    () => computeDuelZones(matches, currentMap, activeSide),
    [matches, currentMap, activeSide],
  );

  // Trade Spacing: per-round scenario for the current map's most recent match.
  const tradeMatch = useMemo(
    () => matches.find((m) => getMapKey(m.matchInfo.mapId) === currentMap) ?? null,
    [matches, currentMap],
  );
  const loneWolfByMap = useMemo(() => {
    const out = {} as Record<MapId, LoneWolfScenario>;
    for (const id of MAP_IDS) out[id] = computeLoneWolfScenario(matches, id);
    return out;
  }, [matches]);
  const activeLoneWolf = useMemo(
    () => (tradeMatch ? computeTradeSpacing(tradeMatch, tradeRound) : loneWolfByMap[currentMap]),
    [tradeMatch, tradeRound, currentMap, loneWolfByMap],
  );
  const tradeMaxRound = tradeMatch?.roundResults.length ?? 1;

  // Opening a match (card click or "Telemetry Replay") enters the dedicated
  // replay flow; the aggregate spatial tab is never polluted with match data.
  const handleOpenMatch = (match: MatchDto) => {
    setSelectedMatch(match);
    setCurrentTab('replay');
  };

  const availableMaps: { id: MapId; name: string }[] = [
    { id: 'ascent', name: 'Ascent' },
    { id: 'abyss', name: 'Abyss' },
    { id: 'haven', name: 'Haven' },
    { id: 'bind', name: 'Bind' },
    { id: 'split', name: 'Split' },
    { id: 'sunset', name: 'Sunset' },
    { id: 'lotus', name: 'Lotus' },
  ];

  const handleMapChange = (mapId: MapId) => {
    setCurrentMap(mapId);
    setSelectedZone(null);
    setTradeRound(1);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#111116] text-[#F4F4F5] font-sans-clean">
      {/* 1. Desktop Title Bar */}
      <TitleBar currentMap={currentMap.toUpperCase()} />

      {/* 2. Main Window Body: Sidebar + Active Viewport */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Apple HIG Deferential Console) */}
        <Sidebar
          player={profile}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
        />

        {/* Viewport Content */}
        {currentTab === 'spatial' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#111116]">
            {/* Map Switcher Header Bar - Deferential Segmented Tabs */}
            <div className="h-10 bg-[#16161C] border-b border-white/[0.06] px-3.5 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
                <span className="text-[11px] text-[#9CA3AF] font-medium mr-2 shrink-0">
                  Sector:
                </span>
                {availableMaps.map((m) => {
                  const isActive = currentMap === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleMapChange(m.id)}
                      className={`px-3 py-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {m.name}
                      {m.id === 'abyss' && (
                        <span className="ml-1 text-[9px] bg-white/20 text-zinc-200 px-1 py-0.2 rounded">
                          New
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center gap-2 text-[11px] text-[#9CA3AF] font-mono-num">
                <span>Spatial Matrix v4.12</span>
              </div>
            </div>

            {/* Spatial Center: 2D Interactive Map + Right Telemetry Panel */}
            <div className="flex-1 flex overflow-hidden">
              {/* Center Map Canvas */}
              <div className="flex-1 relative flex flex-col overflow-hidden">
                <MapCanvas
                  currentMap={currentMap}
                  zones={activeZones}
                  loneWolf={activeLoneWolf}
                  selectedZone={selectedZone}
                  onSelectZone={setSelectedZone}
                  activeMode={activeMode}
                  onModeChange={setActiveMode}
                  activeSide={activeSide}
                  onSideChange={setActiveSide}
                  activeWeapon={activeWeapon}
                  onWeaponChange={setActiveWeapon}
                />
              </div>

              {/* Right Panel: Spacing Radar Analysis or Tactical Intel */}
              <div className="w-80 shrink-0 h-full border-l border-white/[0.06]">
                {activeMode === 'lone_wolf' ? (
                  <LoneWolfPanel
                    scenario={activeLoneWolf}
                    roundNumber={tradeRound}
                    maxRound={tradeMaxRound}
                    onRoundChange={setTradeRound}
                  />
                ) : (
                  <TacticalIntelPanel
                    selectedZone={selectedZone}
                    zones={activeZones}
                    firstBloodStats={firstBloodStats}
                    onClearSelection={() => setSelectedZone(null)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Secondary Modules */}
        {currentTab === 'overview' && (
          <OverviewView
            player={profile}
            matches={matches}
            onNavigateToSpatial={() => setCurrentTab('spatial')}
          />
        )}

        {currentTab === 'matches' && (
          <MatchesView
            matches={matches}
            profile={profile}
            loading={matchesLoading}
            error={matchesError}
            onOpenMatch={handleOpenMatch}
          />
        )}

        {currentTab === 'economy' && (
          <EconomyView aggregates={economyAggregates} loading={matchesLoading} />
        )}

        {currentTab === 'coaching' && (
          <CoachingView
            onFixBMain={() => {
              setCurrentTab('spatial');
              setActiveMode('lone_wolf');
            }}
          />
        )}

        {/* Dedicated Telemetry Replay flow (entered from MatchesView) */}
        {currentTab === 'replay' && selectedMatch && (
          <ReplayView
            match={selectedMatch}
            onBack={() => setCurrentTab('matches')}
          />
        )}
      </div>
    </div>
  );
}
