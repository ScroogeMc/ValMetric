import React, { useState } from 'react';
import { LoneWolfScenario } from '../types/valorant';
import { 
  Users, 
  Radio, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LoneWolfPanelProps {
  scenario: LoneWolfScenario;
  roundNumber: number;
  maxRound: number;
  onRoundChange: (round: number) => void;
}

export const LoneWolfPanel: React.FC<LoneWolfPanelProps> = ({
  scenario,
  roundNumber,
  maxRound,
  onRoundChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(14);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const recommended = scenario.recommendedProximityMeters || 15;
  const tradeGap = scenario.tradeGapMeters || 0;
  const delta = Math.max(0, tradeGap - recommended);
  const tradeFraction = tradeGap > 0
    ? Math.min(100, Math.round((100 * recommended) / tradeGap))
    : 0;
  const nearestAlly = scenario.allies?.[0];

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#111116] text-xs select-none font-sans-clean">
      {/* Top: Spacing Analysis Data Cards */}
      <div className="space-y-3">
        {/* Round Stepper (Trade Spacing) */}
        <div className="flex items-center justify-between bg-[#191920] border border-white/[0.06] rounded-lg p-1.5">
          <button
            onClick={() => onRoundChange(Math.max(1, roundNumber - 1))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Previous Round"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-white font-mono-num">
            Round {roundNumber}/{maxRound}
          </span>
          <button
            onClick={() => onRoundChange(Math.min(maxRound, roundNumber + 1))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Next Round"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Main Alert Card */}
        <div className="p-3 bg-[#191920] border border-white/[0.06] rounded-xl space-y-2">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 bg-[#F87171]/15 text-[#F87171] rounded-lg flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">
                Spacing Diagnostic
              </div>
              <h3 className="font-semibold text-sm text-white mt-0.5">
                Trade Isolation Analysis
              </h3>
            </div>
          </div>

          <p className="text-zinc-300 text-xs leading-relaxed">
            {scenario.warningDescription}
          </p>
        </div>

        {/* Primary Metrics Grid (Strict 8pt grid) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl">
            <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] font-medium">
              <span>Trade Gap</span>
              <Users className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </div>
            <div className="text-2xl font-semibold text-white mt-1 font-mono-num">
              {tradeGap}m
            </div>
            <span className="text-[10px] text-[#9CA3AF]">Recommended: &lt;{recommended}m</span>
          </div>

          <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl">
            <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] font-medium">
              <span>Untraded Rate</span>
              <Radio className="w-3.5 h-3.5 text-[#F87171]" />
            </div>
            <div className="text-2xl font-semibold text-[#F87171] mt-1 font-mono-num">
              {scenario.untradedRoundRate}%
            </div>
            <span className="text-[10px] text-[#9CA3AF]">Zero re-frag opportunity</span>
          </div>
        </div>

        {/* Minimalist Spacing Distance Bar */}
        <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-200">Effective Spacing Spectrum</span>
            <span className="text-[#F87171] font-mono-num text-[11px]">+{delta.toFixed(1)}m delta</span>
          </div>

          {/* Clean Segmented Line */}
          <div className="w-full h-1.5 bg-[#111116] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#2DD4BF] rounded-full"
              style={{ width: `${tradeFraction}%` }}
            />
            <div
              className="h-full bg-[#F87171] rounded-full ml-auto"
              style={{ width: `${100 - tradeFraction}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#9CA3AF] font-mono-num">
            <span>0m (Contact)</span>
            <span className="text-[#2DD4BF]">{recommended}m (Trade Sphere)</span>
            <span className="text-[#F87171]">{tradeGap}m (Actual)</span>
          </div>
        </div>

        {/* Episode Breakdown Table */}
        <div className="bg-[#191920] p-3 border border-white/[0.06] rounded-xl space-y-2 text-xs">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">
            Round {scenario.roundNumber > 0 ? scenario.roundNumber : '—'} Log
          </div>
          <div className="space-y-1.5 text-zinc-300 text-[11px]">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
              <span className="text-[#9CA3AF]">Player Sector:</span>
              <span className="text-white font-medium">{scenario.location}</span>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
              <span className="text-[#9CA3AF]">Nearest Ally:</span>
              <span className="text-zinc-200">
                {nearestAlly ? `${nearestAlly.name} (${nearestAlly.agent})` : 'No ally data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF]">Opponent Holding:</span>
              <span className="text-[#F87171]">
                {scenario.enemy.name} ({scenario.enemy.weapon})
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Recommendation */}
        <div className="p-3 bg-[#191920] border border-white/[0.06] rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-200 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Coaching Directive</span>
          </div>
          <p className="text-[#9CA3AF] text-xs leading-relaxed">
            {scenario.tacticalCorrection}
          </p>
        </div>
      </div>

      {/* Bottom Timeline Scrubber */}
      <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#9CA3AF]">Episode Playhead</span>
          <span className="font-mono-num text-zinc-200">0:{playbackTime < 10 ? `0${playbackTime}` : playbackTime} / 0:18</span>
        </div>

        <input
          type="range"
          min="0"
          max="18"
          value={playbackTime}
          onChange={(e) => setPlaybackTime(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded accent-white cursor-pointer"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={togglePlayback}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded-md flex items-center gap-1 text-xs cursor-pointer transition-colors"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => setPlaybackTime(0)}
              className="p-1 bg-white/10 hover:bg-white/15 text-[#9CA3AF] hover:text-white rounded-md text-xs cursor-pointer transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <span className="text-[11px] text-[#9CA3AF] font-mono-num">
            {playbackTime >= 14 ? 'Contact Window' : 'Default Approach'}
          </span>
        </div>
      </div>
    </div>
  );
};
