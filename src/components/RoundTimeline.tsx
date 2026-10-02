import React, { useEffect, useState } from 'react';
import { TimelineEvent, MatchDto } from '../types/valorant';
import { ChevronRight, ChevronLeft, Skull } from 'lucide-react';
import { computeMatchEvents, computeRoundEconomy } from '../data/metrics';

interface RoundTimelineProps {
  match: MatchDto | null;
  currentRound: number;
  onRoundChange: (round: number) => void;
}

const TOTAL_DURATION_SEC = 100;

const renderEventMarker = (evt: TimelineEvent, isSelected: boolean): React.ReactNode => {
  const ring = isSelected ? 'ring-2 ring-white scale-125' : '';
  switch (evt.killCategory) {
    case 'teammateKill':
      return <div className={`w-3.5 h-3.5 rounded-full bg-[#22C55E] border border-[#22C55E] transition-all ${ring}`} />;
    case 'enemyKill':
      return <div className={`w-3.5 h-3.5 rounded-full bg-[#EF4444] border border-[#EF4444] transition-all ${ring}`} />;
    case 'userDeath':
      return <Skull className={`w-3.5 h-3.5 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.9)] transition-all ${ring}`} />;
    case 'userKill':
      return (
        <div className={`w-3.5 h-3.5 rounded-full bg-[#3B82F6] border border-[#3B82F6] flex items-center justify-center transition-all ${ring}`}>
          <span className="text-[#EF4444] text-[9px] leading-none font-bold">✕</span>
        </div>
      );
    default: {
      const isSpike = evt.type === 'spike_plant' || evt.type === 'spike_defuse';
      return (
        <div className={`w-3.5 h-3.5 rounded-full border transition-all ${ring} ${isSpike ? 'bg-[#F59E0B] border-[#F59E0B]' : 'bg-zinc-400 border-zinc-400'}`} />
      );
    }
  }
};

export const RoundTimeline: React.FC<RoundTimelineProps> = ({
  match,
  currentRound,
  onRoundChange,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const maxRound = match?.roundResults.length ?? 1;

  useEffect(() => {
    const evts = match ? computeMatchEvents(match, currentRound) : [];
    setSelectedEvent(evts.find((e) => e.type === 'death') ?? evts[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, match?.matchInfo.matchId]);

  if (!match) {
    return (
      <div className="bg-[#111116] border-t border-white/[0.06] p-3 text-xs text-center text-[#9CA3AF] select-none shrink-0 font-sans-clean">
        No match telemetry available.
      </div>
    );
  }

  const roundEconomy = computeRoundEconomy(match, currentRound);
  const events = computeMatchEvents(match, currentRound);

  return (
    <div className="bg-[#111116] border-t border-white/[0.06] p-2.5 text-xs select-none shrink-0 font-sans-clean">
      {/* Top Header Row: Transport Controls & Economy Pills */}
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
              <span className={roundEconomy.result === 'loss' ? 'text-[#F87171]' : 'text-[#2DD4BF]'}>
                [{roundEconomy.result.toUpperCase()}]
              </span>
            </span>
            <button
              onClick={() => onRoundChange(Math.min(maxRound, currentRound + 1))}
              className="px-1.5 py-0.5 text-[#9CA3AF] hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Next Round"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
            <span className="px-2 py-0.5 bg-[#191920] border border-white/[0.06] text-zinc-200 rounded">
              {roundEconomy.buyType}
            </span>
            <span>Score: {roundEconomy.score}</span>
          </div>
        </div>

        {/* Burned Utility & Bank */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#191920] border border-white/[0.06] px-2.5 py-1 rounded">
            <span className="text-[#9CA3AF] text-[11px]">Residual Loss:</span>
            <span className="font-mono-num font-semibold text-[#F87171]">
              -{roundEconomy.creditsLostOnDeath} ¤
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-[#191920] border border-white/[0.06] px-2.5 py-1 rounded">
            <span className="text-[#9CA3AF] text-[11px]">Next Bank:</span>
            <span className="font-mono-num font-semibold text-zinc-200">
              {roundEconomy.nextRoundMinBank} ¤
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
          {events.map((evt, idx) => {
            const leftPercent = Math.min(96, Math.max(3, (evt.timeSec / TOTAL_DURATION_SEC) * 100));
            const isSelected = selectedEvent?.formattedTime === evt.formattedTime;

            return (
              <div
                key={idx}
                onClick={() => setSelectedEvent(evt)}
                className="absolute z-10 cursor-pointer -translate-x-1/2 flex flex-col items-center group transition-transform hover:scale-120"
                style={{ left: `${leftPercent}%` }}
              >
                {renderEventMarker(evt, isSelected)}

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

          {selectedEvent.type === 'death' && roundEconomy.burnedAbilities.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#9CA3AF]">Burned Utility:</span>
              <div className="flex items-center gap-1">
                {roundEconomy.burnedAbilities.map((ab, i) => (
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
