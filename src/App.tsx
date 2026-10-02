/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import { LoneWolfPanel } from './components/LoneWolfPanel';
import { TacticalIntelPanel } from './components/TacticalIntelPanel';
import { RoundTimeline } from './components/RoundTimeline';
import { OverviewView } from './components/OverviewView';
import { MatchesView } from './components/MatchesView';
import { EconomyView } from './components/EconomyView';
import { CoachingView } from './components/CoachingView';

import { 
  CURRENT_PLAYER, 
  ALL_DUEL_ZONES, 
  LONE_WOLF_SCENARIOS, 
  MOCK_ROUND_ECONOMY 
} from './data/mockData';
import { 
  DuelZone, 
  AnalyticsMode, 
  GameSide, 
  WeaponType, 
  MapId 
} from './types/valorant';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('spatial');
  const [currentMap, setCurrentMap] = useState<MapId>('ascent');
  const [activeMode, setActiveMode] = useState<AnalyticsMode>('entry_zones');
  const [activeSide, setActiveSide] = useState<GameSide>('all');
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>('all');
  const [selectedZone, setSelectedZone] = useState<DuelZone | null>(ALL_DUEL_ZONES.ascent[0]);
  const [currentRound, setCurrentRound] = useState<number>(9);

  const availableMaps: { id: MapId; name: string }[] = [
    { id: 'ascent', name: 'Ascent' },
    { id: 'abyss', name: 'Abyss' },
    { id: 'haven', name: 'Haven' },
    { id: 'bind', name: 'Bind' },
    { id: 'split', name: 'Split' },
    { id: 'sunset', name: 'Sunset' },
    { id: 'lotus', name: 'Lotus' },
  ];

  const activeZones = ALL_DUEL_ZONES[currentMap] || ALL_DUEL_ZONES.ascent;
  const activeLoneWolf = LONE_WOLF_SCENARIOS[currentMap] || LONE_WOLF_SCENARIOS.ascent;

  const handleMapChange = (mapId: MapId) => {
    setCurrentMap(mapId);
    const newZones = ALL_DUEL_ZONES[mapId] || ALL_DUEL_ZONES.ascent;
    setSelectedZone(newZones.length > 0 ? newZones[0] : null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#111116] text-[#F4F4F5] font-sans-clean">
      {/* 1. Desktop Title Bar */}
      <TitleBar currentMap={currentMap.toUpperCase()} />

      {/* 2. Main Window Body: Sidebar + Active Viewport */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Apple HIG Deferential Console) */}
        <Sidebar
          player={CURRENT_PLAYER}
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
                  <LoneWolfPanel scenario={activeLoneWolf} />
                ) : (
                  <TacticalIntelPanel
                    selectedZone={selectedZone}
                    onClearSelection={() => setSelectedZone(null)}
                  />
                )}
              </div>
            </div>

            {/* Bottom: Final Cut Pro style Timeline Track */}
            <RoundTimeline
              roundData={MOCK_ROUND_ECONOMY}
              currentRound={currentRound}
              onRoundChange={setCurrentRound}
            />
          </div>
        )}

        {/* Secondary Modules */}
        {currentTab === 'overview' && (
          <OverviewView
            player={CURRENT_PLAYER}
            onNavigateToSpatial={() => setCurrentTab('spatial')}
          />
        )}

        {currentTab === 'matches' && (
          <MatchesView
            onSelectAscentMatch={() => {
              setCurrentMap('ascent');
              setCurrentTab('spatial');
            }}
          />
        )}

        {currentTab === 'economy' && <EconomyView />}

        {currentTab === 'coaching' && (
          <CoachingView
            onFixBMain={() => {
              setCurrentTab('spatial');
              setActiveMode('lone_wolf');
            }}
          />
        )}
      </div>
    </div>
  );
}
