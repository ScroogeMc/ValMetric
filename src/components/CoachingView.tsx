import React from 'react';
import { BrainCircuit, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Target, Calendar } from 'lucide-react';

interface CoachingViewProps {
  onFixBMain: () => void;
}

export const CoachingView: React.FC<CoachingViewProps> = ({ onFixBMain }) => {
  const practiceRoutines = [
    { title: 'Ascent Angle Clears (100 Targets)', duration: '12 min', focus: 'Crosshair placement & pre-aim for Mid Yard / Catwalk', status: 'Recommended' },
    { title: 'Duo Spacing Timing Drill', duration: '15 min', focus: 'Trade distance alignment (<15m) on site pushes', status: 'Priority' },
    { title: 'Op Bait & Shoulder Peek Drill', duration: '8 min', focus: 'Jiggle-peek information gathering vs holding snipers', status: 'Daily' },
  ];

  return (
    <div className="flex-1 bg-[#111116] p-6 overflow-y-auto select-none space-y-5 font-sans-clean w-full">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] w-full">
        <div>
          <h2 className="font-semibold text-lg text-white">
            Tactical Coach Directives
          </h2>
          <span className="text-xs text-[#9CA3AF]">AI Telemetry-Backed Spacing & Execution Audits</span>
        </div>

        <div className="flex items-center gap-2 bg-[#191920] px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs">
          <span className="text-[#9CA3AF]">Active Focus:</span>
          <span className="font-medium text-[#2DD4BF]">Spacing Optimization</span>
        </div>
      </div>

      {/* Priority Drill Card (Full Width) */}
      <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-5 space-y-4 shadow-sm w-full">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#F87171]/15 text-[#F87171] rounded-lg flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                Priority Directive #01
              </span>
              <h3 className="font-semibold text-base text-white mt-0.5">
                B Main Spacing & Trade Synchronization (Ascent)
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed max-w-3xl">
                In multiple attack rounds, player spacing exceeded 25 meters from supporting teammates during B-split pushes. Synchronizing entries with your initiator significantly improves re-frag conversion.
              </p>
            </div>
          </div>

          <button
            onClick={onFixBMain}
            className="px-4 py-2 bg-white text-zinc-950 font-medium text-xs rounded-lg flex items-center gap-2 shrink-0 hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
          >
            <span>Review on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Step Protocol Fix (Full Width 3-col Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs w-full">
          <div className="bg-[#141419] p-3.5 border border-white/[0.06] rounded-lg space-y-1">
            <span className="text-[#2DD4BF] font-medium text-xs block">Step 1: Proximity Gate</span>
            <p className="text-[#9CA3AF] text-xs leading-relaxed">
              Hold crossing into B Main until supporting initiator approaches within 15 meters.
            </p>
          </div>

          <div className="bg-[#141419] p-3.5 border border-white/[0.06] rounded-lg space-y-1">
            <span className="text-zinc-200 font-medium text-xs block">Step 2: Recon Pre-Clear</span>
            <p className="text-[#9CA3AF] text-xs leading-relaxed">
              83% of casualties occur against holding snipers. Request recon dart or smoke before committing.
            </p>
          </div>

          <div className="bg-[#141419] p-3.5 border border-white/[0.06] rounded-lg space-y-1">
            <span className="text-zinc-200 font-medium text-xs block">Step 3: Disengage Ready</span>
            <p className="text-[#9CA3AF] text-xs leading-relaxed">
              Prime your escape mobility 1.5 seconds before crossing to safely disengage unfavored angles.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Custom Drills (Full Width Dual-Column Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
        {/* Left Section (xl:col-span-7): Targeted Practice Routine List */}
        <div className="xl:col-span-7 bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#9CA3AF]" />
              <h4 className="font-semibold text-sm text-white">
                Targeted Practice Routines
              </h4>
            </div>
            <span className="text-xs text-[#9CA3AF]">Customized to Match Telemetry</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {practiceRoutines.map((routine) => (
              <div 
                key={routine.title} 
                className="p-3 bg-[#141419] rounded-lg border border-white/[0.04] flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-white">{routine.title}</span>
                    <span className="text-[10px] text-[#2DD4BF] bg-[#2DD4BF]/10 px-1.5 py-0.2 rounded font-medium">
                      {routine.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{routine.focus}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono-num font-medium text-xs text-zinc-300">{routine.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section (xl:col-span-5): Discipline Checklist & Directives */}
        <div className="xl:col-span-5 space-y-5">
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
                <h4 className="font-semibold text-sm text-white">Pre-Match Checklist</h4>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-start gap-2.5 p-2 bg-[#141419] rounded-lg border border-white/[0.04]">
                <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                <span className="text-zinc-300">Call spacing intent to duo partner before round buy phase closes</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 bg-[#141419] rounded-lg border border-white/[0.04]">
                <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                <span className="text-zinc-300">Wait for initiator sound cues before peeking high-risk sniper angles</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 bg-[#141419] rounded-lg border border-white/[0.04]">
                <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                <span className="text-zinc-300">Track opponent economy to identify Operator rounds on defense</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
