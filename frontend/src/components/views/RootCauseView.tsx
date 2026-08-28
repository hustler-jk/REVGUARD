import React from 'react';
import { RootCause } from '../../types';
import { GitMerge, ShieldCheck, AlertTriangle, CheckCheck } from 'lucide-react';

interface RootCauseViewProps {
  rootCauses: RootCause[];
  onApplyImmunization: (rc: RootCause) => void;
}

export const RootCauseView: React.FC<RootCauseViewProps> = ({
  rootCauses,
  onApplyImmunization,
}) => {
  const formatINR = (val: number) => '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      
      {/* Header Banner on Dark */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-extrabold text-xl text-white">Root-Cause Strategic Clusters</h2>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                P1 Differentiator
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              "1 Root Cause &rarr; N Cases &rarr; ₹X Total Exposure" — eliminates single-case whack-a-mole by deploying proactive prevention guardrails.
            </p>
          </div>
        </div>
      </div>

      {/* Cluster Cards Grid on Dark */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rootCauses.map((rc) => {
          const isHero2 = rc.id === 'RC-EMP-402';

          return (
            <div
              key={rc.id}
              className={`bg-[#111827] border ${isHero2 ? 'border-cyan-500/60 glow-cyan-subtle' : 'border-gray-800'} rounded-2xl p-6 flex flex-col justify-between space-y-4`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold text-xs">
                      {rc.id}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-sm text-white">{rc.description}</h3>
                      <span className="text-[11px] text-gray-400">
                        Entity Ref: <span className="font-mono text-cyan-300 font-bold">{rc.cause_key}</span>
                      </span>
                    </div>
                  </div>
                  {isHero2 && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40 font-mono">
                      Hero 2 Cluster
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-gray-800">
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">Total Exposure</span>
                    <span className="text-xl font-display font-extrabold text-rose-400 font-mono block mt-0.5">
                      {formatINR(rc.total_exposure)}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-gray-800">
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">Linked Cases</span>
                    <span className="text-xl font-display font-extrabold text-cyan-300 block mt-0.5">
                      {rc.case_count} Cases
                    </span>
                  </div>
                </div>

                {/* Early-Warning Slope Pill (for Hero 2) */}
                {isHero2 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-300 space-y-1">
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Early-Warning Slope Detected (§7.4):</span>
                      </span>
                      <span className="font-mono text-[10px] bg-amber-900/60 px-1.5 py-0.2 rounded font-bold">Week 2 Flag</span>
                    </div>
                    <p className="text-[11px] text-gray-300">
                      Discounts escalated rapidly across 4 weeks: +5% &rarr; +15% &rarr; +40% unauthorized overrides.
                    </p>
                  </div>
                )}
              </div>

              {/* Leak Immunization Box on Dark */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-[#0B0F19] border border-emerald-800/50 space-y-3">
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Leak Immunization Recommendation (§8.6):</span>
                </div>
                <p className="text-xs text-gray-300 font-medium leading-relaxed">
                  {rc.immunization_rule || 'Enforce automated ERP/CPQ dual sign-off rule for overrides > 15%.'}
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onApplyImmunization(rc)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Apply Immunization Rule</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
