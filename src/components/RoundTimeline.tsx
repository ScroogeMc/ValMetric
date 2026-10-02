import React, { useState } from 'react';
import { RoundEconomy, TimelineEvent } from '../types/valorant';
import { 
  Crosshair, 
  Skull, 
  ChevronRight,
  ChevronLeft,
  CircleDot
} from 'lucide-react';

interface RoundTimelineProps {
  roundData: RoundEconomy;
  currentRound: number;
  onRoundChange: (round: number) => void;
}

export const RoundTimeline: React.FC<RoundTimelineProps> = ({
  roundData,
  currentRound,
  onRoundChange,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    roundData.timeline.find((e) => e.type === 'death') || null
  );

  const totalDurationSec = 100;

  return (
    <div className="bg-[#111116] border-t border-white/[0.06] p-2.5 text-xs select-none shrink-0 font-sans-clean">
      {/* Top Header Row: Transport Controls & Burned Utility Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
        {/* Round Switcher Transport Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#191920] p-0.5 border border-white/[0.06] rounded-md">
            <button
              onClick={() => onRoundChange(Math.max(1, currentRound - 1))}
              className="px-1.5 py-0.5 text-[#9CA3AF] hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Previous Round"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-0.5 font-medium text-xs text-white">
              Round {currentRound}{' '}
              <span className={roundData.result === 'loss' ? 'text-[#F87171]' : 'text-[#2DD4BF]'}>
                [{roundData.result.toUpperCase()}]
              </span>
            </span>
            <button
              onClick={() => onRoundChange(Math.min(24, currentRound + 1))}
              className="px-1.5 py-0.5 text-[#9CA3AF] hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Next Round"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
            <span className="px-2 py-0.5 bg-[#191920] border border-white/[0.06] text-zinc-200 rounded">
              {roundData.buyType}
            </span>
            <span>Score: {roundData.score}</span>
          </div>
        </div>

        {/* Burned Utility & Bank */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#191920] border border-white/[0.06] px-2.5 py-1 rounded">
            <span className="text-[#9CA3AF] text-[11px]">Residual Loss:</span>
            <span className="font-mono-num font-semibold text-[#F87171]">
              -{roundData.creditsLostOnDeath} ¤
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-[#191920] border border-white/[0.06] px-2.5 py-1 rounded">
            <span className="text-[#9CA3AF] text-[11px]">Next Bank:</span>
            <span className="font-mono-num font-semibold text-zinc-200">
              {roundData.nextRoundMinBank} ¤
            </span>
          </div>
        </div>
      </div>

      {/* Video-Editing Multi-Track Timeline (Premiere / Final Cut Pro style) */}
      <div className="pt-2 pb-0.5">
        <div className="relative w-full h-11 bg-[#141418] border border-white/[0.06] rounded-md flex items-center px-4 overflow-hidden">
          {/* Precise Gray/White Tick Marks (100 discrete seconds) */}
          <div className="absolute inset-0 flex items-end justify-between px-3 pointer-events-none opacity-40">
            {Array.from({ length: 100 }).map((_, sec) => {
              const isMajor = sec % 10 === 0;
              const isHalf = sec % 5 === 0;
              return (
                <div
                  key={sec}
                  className={`w-[1px] ${
                    isMajor ? 'h-5 bg-zinc-300' : isHalf ? 'h-3 bg-zinc-400' : 'h-1.5 bg-zinc-600'
                  }`}
                />
              );
            })}
          </div>

          {/* Center Playhead Guide */}
          <div className="absolute left-0 right-0 h-[1px] bg-white/[0.08] z-0" />

          {/* Small, Tasteful Colored Event Dots */}
          {roundData.timeline.map((evt, idx) => {
            const leftPercent = Math.min(96, Math.max(3, (evt.timeSec / totalDurationSec) * 100));
            const isKill = evt.type === 'kill';
            const isDeath = evt.type === 'death';
            const isSpike = evt.type === 'spike_plant' || evt.type === 'spike_defuse';
            const isSelected = selectedEvent?.formattedTime === evt.formattedTime;

            return (
              <div
                key={idx}
                onClick={() => setSelectedEvent(evt)}
                className="absolute z-10 cursor-pointer -translate-x-1/2 flex flex-col items-center group transition-transform hover:scale-120"
                style={{ left: `${leftPercent}%` }}
              >
                {/* Small Tasteful Colored Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    isSelected
                      ? 'ring-2 ring-white scale-125'
                      : ''
                  } ${
                    isKill
                      ? 'bg-[#2DD4BF] border-[#2DD4BF]'
                      : isDeath
                      ? 'bg-[#F87171] border-[#F87171]'
                      : isSpike
                      ? 'bg-[#F59E0B] border-[#F59E0B]'
                      : 'bg-zinc-400 border-zinc-400'
                  }`}
                />

                <span className="mt-0.5 text-[8px] font-mono-num text-[#9CA3AF] bg-[#111116] px-1 rounded border border-white/[0.06]">
                  {evt.formattedTime}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time Scale Subtitle */}
        <div className="flex justify-between px-3 mt-0.5 text-[9px] font-mono-num text-[#9CA3AF]">
          <span>0:00 (Buy)</span>
          <span>0:15 (Contact)</span>
          <span>0:30 (Default)</span>
          <span>0:45 (Spike)</span>
          <span>1:00 (Post-Plant)</span>
          <span>1:15 (Climax)</span>
          <span>1:30 (Round End)</span>
        </div>
      </div>

      {/* Selected Frame Ledger & Burned Utility Breakdown */}
      {selectedEvent && (
        <div className="mt-1.5 p-2 bg-[#191920] border border-white/[0.06] rounded-md flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono-num font-medium text-zinc-200 bg-[#111116] px-1.5 py-0.2 rounded border border-white/[0.06]">
              {selectedEvent.formattedTime}
            </span>
            <span className="text-zinc-200">
              {selectedEvent.description}
            </span>
            {selectedEvent.location && (
              <span className="text-[#9CA3AF] text-[11px]">
                @ {selectedEvent.location}
              </span>
            )}
          </div>

          {selectedEvent.type === 'death' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#9CA3AF]">Burned Utility:</span>
              <div className="flex items-center gap-1">
                {roundData.burnedAbilities.map((ab, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-[#111116] border border-white/[0.06] text-zinc-300 text-[10px] font-mono-num rounded"
                  >
                    <span>{ab.name}</span>
                    <span className="text-[#F87171]">(-{ab.cost}¤)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
