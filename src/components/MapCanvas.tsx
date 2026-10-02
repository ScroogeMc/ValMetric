import React, { useState, useRef } from 'react';
import { 
  DuelZone, 
  LoneWolfScenario, 
  GameSide, 
  WeaponType, 
  AnalyticsMode,
  MapId 
} from '../types/valorant';
import { MAP_CONFIGS } from '../data/mockData';
import { ZoneTooltip } from './ZoneTooltip';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Crosshair, 
  Radio, 
  Filter, 
  Compass
} from 'lucide-react';

import mapsDataRaw from '../data/valorantMapsData.json';

interface MapCanvasProps {
  currentMap: MapId;
  zones: DuelZone[];
  loneWolf: LoneWolfScenario;
  selectedZone: DuelZone | null;
  onSelectZone: (zone: DuelZone | null) => void;
  activeMode: AnalyticsMode;
  onModeChange: (mode: AnalyticsMode) => void;
  activeSide: GameSide;
  onSideChange: (side: GameSide) => void;
  activeWeapon: WeaponType;
  onWeaponChange: (weapon: WeaponType) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  currentMap,
  zones,
  loneWolf,
  selectedZone,
  onSelectZone,
  activeMode,
  onModeChange,
  activeSide,
  onSideChange,
  activeWeapon,
  onWeaponChange,
}) => {
  const [hoveredZone, setHoveredZone] = useState<DuelZone | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showCallouts, setShowCallouts] = useState(true);
  const [showPlantBoxes, setShowPlantBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const mapConfig = MAP_CONFIGS[currentMap] || MAP_CONFIGS.ascent;
  const currentMapData = (mapsDataRaw as any)[currentMap] || (mapsDataRaw as any).ascent;
  const officialCallouts = currentMapData?.callouts || [];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Filter zones by side
  const filteredZones = zones.filter((zone) => {
    if (activeSide !== 'all') {
      if (activeSide === 'attack' && zone.side === 'defense') return false;
      if (activeSide === 'defense' && zone.side === 'attack') return false;
    }
    return true;
  });

  // Calculate plant sites coordinates
  const aSiteCallout = officialCallouts.find((c: any) => 
    c.fullName.toLowerCase().includes('a site') || 
    (c.regionName.toLowerCase() === 'site' && c.superRegionName === 'A')
  ) || { pctX: currentMap === 'abyss' ? 48 : 35, pctY: currentMap === 'abyss' ? 15 : 14 };

  const bSiteCallout = officialCallouts.find((c: any) => 
    c.fullName.toLowerCase().includes('b site') || 
    (c.regionName.toLowerCase() === 'site' && c.superRegionName === 'B')
  ) || { pctX: currentMap === 'abyss' ? 40 : 28.5, pctY: currentMap === 'abyss' ? 86 : 73.7 };

  // Filter callouts so they don't clash under active duel zone circles
  const visibleCallouts = officialCallouts.filter((callout: any) => {
    const isKey = ['main', 'site', 'courtyard', 'market', 'wine', 'catwalk', 'tree', 'danger', 'library', 'bridge', 'lobby'].some(k => callout.fullName.toLowerCase().includes(k));
    if (!isKey && officialCallouts.length > 15) return false;

    if (activeMode === 'entry_zones') {
      const isClashingWithZone = filteredZones.some((z) => {
        const dist = Math.hypot(z.pctX - callout.pctX, z.pctY - callout.pctY);
        return dist < 7;
      });
      if (isClashingWithZone) return false;
    }
    return true;
  });

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111116] overflow-hidden select-none font-sans-clean">
      {/* Top Filter & Telemetry Control Bar - Deferential Apple HIG Surface (#16161C) */}
      <div className="p-2.5 bg-[#16161C] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 z-20 shrink-0">
        {/* Mode Switcher Tabs - Clean Segmented Control */}
        <div className="flex items-center gap-1 bg-[#191920] p-1 rounded-lg border border-white/[0.06]">
          <button
            onClick={() => onModeChange('entry_zones')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'entry_zones'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Entry Duels</span>
          </button>

          <button
            onClick={() => onModeChange('lone_wolf')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'lone_wolf'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Trade Spacing</span>
          </button>
        </div>

        {/* Filters - Deferential Neutral Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {/* Side Selector */}
          <div className="flex items-center bg-[#191920] p-0.5 border border-white/[0.06] rounded-lg">
            <button
              onClick={() => onSideChange('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeSide === 'all'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onSideChange('attack')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeSide === 'attack'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Attack
            </button>
            <button
              onClick={() => onSideChange('defense')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeSide === 'defense'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Defense
            </button>
          </div>

          {/* Weapon Selector */}
          <div className="flex items-center gap-2 bg-[#191920] px-2.5 py-1 border border-white/[0.06] rounded-lg">
            <Filter className="w-3 h-3 text-[#9CA3AF] shrink-0" />
            <span className="text-[#9CA3AF] text-[11px] font-medium shrink-0">Weapon:</span>
            <select
              value={activeWeapon}
              onChange={(e) => onWeaponChange(e.target.value as WeaponType)}
              className="bg-transparent text-zinc-200 text-xs outline-none cursor-pointer pr-1 min-w-[110px]"
            >
              <option value="all" className="bg-[#191920] text-zinc-200">All Weapons</option>
              <option value="vandal" className="bg-[#191920] text-zinc-200">Vandal (Rifle)</option>
              <option value="operator" className="bg-[#191920] text-zinc-200">Operator (Sniper)</option>
              <option value="phantom" className="bg-[#191920] text-zinc-200">Phantom (Silenced)</option>
              <option value="sheriff" className="bg-[#191920] text-zinc-200">Sheriff (Sidearm)</option>
            </select>
          </div>

          {/* Toggle Callouts */}
          <button
            onClick={() => setShowCallouts(!showCallouts)}
            className={`px-2.5 py-1 border rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showCallouts 
                ? 'bg-white/10 border-white/20 text-white font-medium' 
                : 'bg-[#191920] border-white/[0.06] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Callouts</span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport - Clean Architectural Top-Down Schematic */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredZone(null)}
        className="relative flex-1 w-full bg-[#0D0D11] bg-blueprint-grid overflow-hidden flex items-center justify-center p-6"
      >
        {/* Floating Zoom & Controls - Apple HIG 8px Rounded Surface */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 bg-[#191920]/95 border border-white/[0.08] p-1 rounded-lg shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Legend Banner - Minimalist Deferential Card */}
        <div className="absolute bottom-4 left-4 z-20 bg-[#191920]/95 border border-white/[0.08] p-3 rounded-xl w-72 text-xs space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span className="font-medium text-white text-xs">
                {mapConfig.name} Schematic
              </span>
            </div>
            <span className="text-[#9CA3AF] text-[10px] font-mono-num">
              Spatial Matrix
            </span>
          </div>

          {activeMode === 'entry_zones' ? (
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]" />
                <span className="text-zinc-200">Favored (&gt;50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]" />
                <span className="text-zinc-200">Contested (&lt;50%)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-[11px] text-zinc-300">
              <div className="flex items-center gap-2 text-[#2DD4BF]">
                <span className="w-2 h-2 rounded-full border border-dashed border-[#2DD4BF] inline-block" />
                <span>15m Trade Radius</span>
              </div>
              <div className="flex items-center gap-2 text-[#F87171]">
                <span className="w-3 h-0.5 bg-[#F87171] inline-block" />
                <span>Opponent Sightline (Sniper)</span>
              </div>
            </div>
          )}
        </div>

        {/* Map Container with Zoom Transformation */}
        <div 
          className="relative transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Main Map Box - High-Quality Architectural Blueprint on Dark Canvas */}
          <div className="relative w-[560px] h-[560px] xl:w-[630px] xl:h-[630px] bg-[#141418] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
            {/* Minimap Texture with Balanced Architectural Contrast */}
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

            {/* Plant Sites Badges (Clean, Deferential Slate Tags) */}
            {showPlantBoxes && (
              <>
                {aSiteCallout && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                    style={{ left: `${aSiteCallout.pctX}%`, top: `${aSiteCallout.pctY}%` }}
                  >
                    <div className="px-2 py-0.5 bg-[#191920]/95 border border-white/20 text-zinc-200 font-semibold text-[10px] rounded shadow-md">
                      Site A
                    </div>
                  </div>
                )}
                {bSiteCallout && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                    style={{ 
                      left: `${bSiteCallout.pctX}%`, 
                      top: `${Math.max(5, bSiteCallout.pctY - 6.5)}%` 
                    }}
                  >
                    <div className="px-2 py-0.5 bg-[#191920]/95 border border-white/20 text-zinc-200 font-semibold text-[10px] rounded shadow-md">
                      Site B
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Architectural Callout Labels */}
            {showCallouts && (
              <div className="absolute inset-0 pointer-events-none">
                {visibleCallouts.map((callout: any, idx: number) => (
                  <div
                    key={idx}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] text-[#A1A1AA] font-medium tracking-normal bg-[#141418]/90 px-1.5 py-0.5 rounded border border-white/[0.05] pointer-events-none whitespace-nowrap shadow-sm"
                    style={{ left: `${callout.pctX}%`, top: `${callout.pctY}%` }}
                  >
                    {callout.fullName}
                  </div>
                ))}
              </div>
            )}

            {/* WIDGET A: SOFT PASTEL OVERLAYS (Soft Teal #2DD4BF & Muted Coral #F87171) */}
            {activeMode === 'entry_zones' && (
              <div className="absolute inset-0 z-15">
                {filteredZones.map((zone) => {
                  const isHovered = hoveredZone?.id === zone.id;
                  const isSelected = selectedZone?.id === zone.id;
                  const isPositive = zone.status === 'positive';

                  // Soft Pastel Teal for Positive, Muted Coral for Contested
                  const mainColor = isPositive ? '#2DD4BF' : '#F87171';
                  const radius = (zone.radiusPct || 6.5) * 6;

                  return (
                    <div
                      key={zone.id}
                      onClick={() => onSelectZone(isSelected ? null : zone)}
                      onMouseEnter={() => setHoveredZone(zone)}
                      onMouseLeave={() => setHoveredZone(null)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-110 z-20 group"
                      style={{
                        left: `${zone.pctX}%`,
                        top: `${zone.pctY}%`,
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                      }}
                    >
                      {/* Soft Pastel Semi-Transparent Overlay */}
                      <div
                        className="w-full h-full rounded-full border transition-all duration-200 flex items-center justify-center relative"
                        style={{
                          backgroundColor: isPositive ? 'rgba(45, 212, 191, 0.22)' : 'rgba(248, 113, 113, 0.22)',
                          borderColor: mainColor,
                          boxShadow: isHovered || isSelected ? `0 0 16px ${mainColor}60` : `0 0 6px ${mainColor}30`,
                        }}
                      >
                        {/* Center Data Badge */}
                        <div className="bg-[#191920] border border-white/10 px-2 py-0.5 rounded flex flex-col items-center shadow-md">
                          <span 
                            className="font-mono-num font-semibold text-[11px] leading-tight"
                            style={{ color: mainColor }}
                          >
                            {zone.winrate}%
                          </span>
                          <span className="text-[8px] font-mono-num text-[#9CA3AF] leading-none">
                            {zone.firstBloods}W/{zone.firstDeaths}L
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* WIDGET B: TRADE SPACING VECTORS */}
            {activeMode === 'lone_wolf' && loneWolf && (
              <div className="absolute inset-0 z-15">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <radialGradient id="schematicRadarGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.2" />
                      <stop offset="70%" stopColor="#2DD4BF" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.25" />
                    </radialGradient>
                  </defs>

                  {/* 15m Recommended Trade Radius Sphere */}
                  <g>
                    <circle
                      cx={`${loneWolf.player.pctX}%`}
                      cy={`${loneWolf.player.pctY}%`}
                      r="65"
                      fill="url(#schematicRadarGrad)"
                    />
                    <circle
                      cx={`${loneWolf.player.pctX}%`}
                      cy={`${loneWolf.player.pctY}%`}
                      r="65"
                      fill="none"
                      stroke="#2DD4BF"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  </g>

                  {/* Neutral Distance Lines to Allies */}
                  {loneWolf.allies.map((ally) => (
                    <line
                      key={ally.id}
                      x1={`${loneWolf.player.pctX}%`}
                      y1={`${loneWolf.player.pctY}%`}
                      x2={`${ally.pctX}%`}
                      y2={`${ally.pctY}%`}
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  ))}

                  {/* Muted Coral Sightline Line */}
                  <line
                    x1={`${loneWolf.enemy.pctX}%`}
                    y1={`${loneWolf.enemy.pctY}%`}
                    x2={`${loneWolf.player.pctX}%`}
                    y2={`${loneWolf.player.pctY}%`}
                    stroke="#F87171"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                </svg>

                {/* Trade Distance Badge */}
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-25 bg-[#191920] border border-white/10 px-2 py-0.5 rounded shadow-md pointer-events-none"
                  style={{
                    left: `${(loneWolf.player.pctX + loneWolf.allies[0].pctX) / 2}%`,
                    top: `${(loneWolf.player.pctY + loneWolf.allies[0].pctY) / 2}%`,
                  }}
                >
                  <span className="font-mono-num text-[10px] text-zinc-200">
                    Trade Distance: {loneWolf.tradeGapMeters}m
                  </span>
                </div>

                {/* Player Target Marker */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-25 flex flex-col items-center pointer-events-none"
                  style={{ left: `${loneWolf.player.pctX}%`, top: `${loneWolf.player.pctY}%` }}
                >
                  <div className="w-7 h-7 rounded-full bg-white text-zinc-900 font-semibold text-xs flex items-center justify-center shadow-md">
                    You
                  </div>
                  <span className="mt-1 text-[9px] bg-[#191920] text-zinc-200 px-1.5 py-0.2 rounded border border-white/10">
                    Phantom (Jett)
                  </span>
                </div>

                {/* Allies Markers */}
                {loneWolf.allies.map((ally) => (
                  <div
                    key={ally.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
                    style={{ left: `${ally.pctX}%`, top: `${ally.pctY}%` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#191920] border border-[#2DD4BF] text-[#2DD4BF] text-[10px] font-semibold flex items-center justify-center">
                      {ally.agent.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="mt-0.5 text-[8px] bg-[#191920] text-[#9CA3AF] px-1 rounded border border-white/10">
                      {ally.name} {ally.hasSpike ? '⭐' : ''}
                    </span>
                  </div>
                ))}

                {/* Opponent Sniper Marker */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-25 flex flex-col items-center pointer-events-none"
                  style={{ left: `${loneWolf.enemy.pctX}%`, top: `${loneWolf.enemy.pctY}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#F87171] text-zinc-950 font-semibold text-[10px] flex items-center justify-center">
                    OP
                  </div>
                  <span className="mt-0.5 text-[8px] bg-[#191920] text-[#F87171] px-1 rounded border border-white/10">
                    Opponent Sniper
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Tooltip */}
        {activeMode === 'entry_zones' && hoveredZone && (
          <ZoneTooltip zone={hoveredZone} position={mousePos} />
        )}
      </div>
    </div>
  );
};
