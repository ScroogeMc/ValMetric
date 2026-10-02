import React from 'react';
import { Flame, ShieldCheck, PieChart, Loader2 } from 'lucide-react';
import { EconomyAggregates } from '../data/metrics';
import { getMapDisplayName } from '../data/mapProjection';

interface EconomyViewProps {
  aggregates: EconomyAggregates | null;
  loading: boolean;
}

const tierLabel: Record<string, string> = {
  'Eco': 'Eco / Save Round',
  'Force Buy': 'Force Buy',
  'Full Buy': 'Full Buy (3,900¤+)',
};

export const EconomyView: React.FC<EconomyViewProps> = ({ aggregates, loading }) => {
  const hasData = !!aggregates && aggregates.totalRounds > 0;

  const totalDeaths = aggregates?.sectorLoss.reduce((s, x) => s + x.deaths, 0) ?? 0;
  const avgPerDeath = totalDeaths > 0
    ? Math.round((aggregates?.totalBurnedCredits ?? 0) / totalDeaths)
    : 0;
  const primarySector = aggregates?.sectorLoss[0] ?? null;
  const topWeapons = (aggregates?.weaponEfficiency ?? []).slice(0, 3);
  const sectorLoss = (aggregates?.sectorLoss ?? []).slice(0, 3);
  const totalBurned = aggregates?.totalBurnedCredits ?? 0;

  return (
    <div className="flex-1 bg-[#111116] p-6 overflow-y-auto select-none space-y-5 font-sans-clean w-full">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] w-full">
        <div>
          <h2 className="font-semibold text-lg text-white">
            Economy & Utility Flow
          </h2>
          <span className="text-xs text-[#9CA3AF]">Resource Efficiency & Credit Burn Diagnostics</span>
        </div>

        <div className="flex items-center gap-2 bg-[#191920] px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs">
          <span className="text-[#9CA3AF]">Average Loss / Untraded Death:</span>
          <span className="font-mono-num font-semibold text-[#F87171]">-{avgPerDeath.toLocaleString()} ¤</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-[#9CA3AF] text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading economy telemetry…</span>
        </div>
      )}

      {!loading && !hasData && (
        <div className="py-16 text-center text-[#9CA3AF] text-sm bg-[#191920] border border-white/[0.06] rounded-xl">
          No economy data available yet.
        </div>
      )}

      {!loading && hasData && (
        <>
          {/* Burned Utility Spotlight Card (Full Width) */}
          <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-5 space-y-4 shadow-sm w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F87171]/15 text-[#F87171] rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                  Resource Drain Diagnostic
                </span>
                <h3 className="font-semibold text-base text-white">
                  Burned Utility on Early Eliminations
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
              <div className="bg-[#141419] p-3.5 border border-white/[0.06] rounded-lg">
                <span className="text-xs text-[#9CA3AF] block font-medium">Avg Credits Lost / Early Death</span>
                <span className="text-2xl font-mono-num font-semibold text-[#F87171] mt-1 block">-{avgPerDeath.toLocaleString()} ¤</span>
                <span className="text-[11px] text-[#A1A1AA] mt-1 block font-normal">
                  Across {aggregates?.totalRounds ?? 0} recorded rounds
                </span>
              </div>

              <div className="bg-[#141419] p-3.5 border border-white/[0.06] rounded-lg">
                <span className="text-xs text-[#9CA3AF] block font-medium">Aggregate Match Deficit</span>
                <span className="text-2xl font-mono-num font-semibold text-[#F87171] mt-1 block">-{totalBurned.toLocaleString()} ¤</span>
                <span className="text-[11px] text-[#A1A1AA] mt-1 block font-normal">
                  Untraded credits burned
                </span>
              </div>

              <div className="bg-[#141419] p-3.5 border border-white/[0.06] rounded-lg">
                <span className="text-xs text-[#9CA3AF] block font-medium">Primary Drain Sector</span>
                <span className="text-2xl font-mono-num font-semibold text-white mt-1 block">
                  {primarySector ? getMapDisplayName(primarySector.mapId) : '—'}
                </span>
                <span className="text-[11px] text-[#F87171] mt-1 block font-medium">
                  {primarySector ? `${primarySector.callout} · ${primarySector.deaths} deaths` : 'No data'}
                </span>
              </div>
            </div>
          </div>

          {/* Buy Discipline & Weapon ROI (Full Width Grid) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
            {/* Left Section (xl:col-span-8): Buy Type Conversion & Weapon Economic Efficiency */}
            <div className="xl:col-span-8 space-y-5">
              {/* Buy Type Conversion Rate */}
              <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <h4 className="font-semibold text-sm text-white">
                    Buy Type Round Conversion Rate
                  </h4>
                  <span className="text-xs text-[#9CA3AF]">{aggregates?.totalRounds ?? 0} Rounds Recorded</span>
                </div>

                <div className="space-y-3 text-xs">
                  {(aggregates?.buyTypeConversion ?? []).map((tier) => (
                    <div key={tier.buyType}>
                      <div className="flex justify-between pb-1 text-xs">
                        <span className="text-zinc-200">{tierLabel[tier.buyType] ?? tier.buyType}</span>
                        <span className="font-mono-num text-[#2DD4BF] font-medium">
                          {tier.winRate}% Round Win ({tier.wins}/{tier.rounds})
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#111116] rounded-full overflow-hidden">
                        <div className="bg-[#2DD4BF] h-full" style={{ width: `${tier.winRate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weapon Economic Efficiency Grid */}
              <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <h4 className="font-semibold text-sm text-white">
                    Weapon Economic Efficiency (Kills per 1,000 Credits)
                  </h4>
                  <span className="text-xs text-[#9CA3AF]">ROI Index</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {topWeapons.length === 0 && (
                    <p className="text-xs text-[#9CA3AF] col-span-full">No weapon data yet.</p>
                  )}
                  {topWeapons.map((w) => {
                    const badge =
                      w.killsPer1000Credits >= 1
                        ? { label: 'High ROI', cls: 'text-[#2DD4BF] bg-[#2DD4BF]/10' }
                        : w.killsPer1000Credits >= 0.5
                          ? { label: 'Moderate', cls: 'text-zinc-200 bg-white/10' }
                          : { label: 'High Risk', cls: 'text-[#F87171] bg-[#F87171]/10' };
                    return (
                      <div key={w.weaponId} className="p-3 bg-[#141419] border border-white/[0.06] rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-xs">{w.weapon} ({w.cost.toLocaleString()} ¤)</span>
                          <span className={`${badge.cls} text-[10px] px-1.5 py-0.2 rounded font-medium`}>{badge.label}</span>
                        </div>
                        <div className="text-xl font-mono-num font-semibold text-white mt-1">{w.killsPer1000Credits}</div>
                        <span className="text-[#9CA3AF] text-[11px] block">{w.kills} kills · {w.buys} buys</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Section (xl:col-span-4): Sector Loss Breakdown & Directives */}
            <div className="xl:col-span-4 space-y-5">
              {/* Sector Loss Breakdown */}
              <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#9CA3AF]" />
                    <h4 className="font-semibold text-sm text-white">Loss by Map Sector</h4>
                  </div>
                  <span className="text-xs text-[#F87171] font-mono-num font-medium">-{totalBurned.toLocaleString()} ¤</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {sectorLoss.length === 0 && (
                    <p className="text-xs text-[#9CA3AF]">No sector loss data yet.</p>
                  )}
                  {sectorLoss.map((sector) => {
                    const pct = totalBurned > 0 ? Math.round((100 * sector.burnedCredits) / totalBurned) : 0;
                    return (
                      <div key={`${sector.mapId}-${sector.callout}`} className="p-2.5 bg-[#141419] rounded-lg border border-white/[0.04] space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-white">{getMapDisplayName(sector.mapId)} · {sector.callout}</span>
                          <span className="font-mono-num text-[#F87171] font-medium">{pct}% (-{sector.burnedCredits.toLocaleString()} ¤)</span>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] leading-snug">{sector.deaths} untraded deaths recorded</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bank Management Directive */}
              <div className="bg-[#191920] border border-white/[0.06] rounded-xl p-4 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Economic Threshold Rule</span>
                </div>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Maintain minimum next-round residual bank of 2,000 ¤ during bonus and eco rounds to guarantee full rifle + heavy shields capability on gun rounds.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
