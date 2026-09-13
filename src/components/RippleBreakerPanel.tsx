import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Check, 
  TrendingDown
} from 'lucide-react';
import { MitigationOption } from '../types/rippleguard';

interface RippleBreakerPanelProps {
  mitigations: MitigationOption[];
  selectedMitigationId: string | null;
  onApplyMitigation: (mitigation: MitigationOption) => void;
  isApplied: boolean;
}

export const RippleBreakerPanel: React.FC<RippleBreakerPanelProps> = ({
  mitigations,
  selectedMitigationId,
  onApplyMitigation,
  isApplied,
}) => {
  return (
    <div className="enterprise-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 space-y-4 shadow-sm dark:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                RIPPLE BREAKER OPTIMIZER
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-500/30">
                INTERVENTION
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifies minimal-effort interventions to neutralize downstream blast radius
            </p>
          </div>
        </div>
      </div>

      {/* Ranked Candidate Mitigations */}
      <div className="space-y-2.5">
        {mitigations.map((m) => {
          const isSelected = selectedMitigationId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onApplyMitigation(m)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/20 shadow-sm'
                  : 'bg-slate-50 dark:bg-[#0E131C] border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#141A26] hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-6 h-6 rounded-md text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 border ${
                      m.priority === 1
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 font-black'
                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    #{m.priority}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white tracking-tight">
                        {m.action}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent">
                        {m.target_app}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>

                {/* Risk Reduction & Effort */}
                <div className="text-right shrink-0 font-mono">
                  <div className="flex items-center space-x-1 justify-end text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>-{m.risk_reduction_pct}% Risk</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {m.effort} effort
                  </span>
                </div>
              </div>

              {/* Action Footer for Active Selection */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400/90 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Neutralizes {m.safe_edges_neutralized} propagation edges</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyMitigation(m);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isApplied
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isApplied ? 'Safe Path Replay Active' : 'Apply & Replay Safe Path'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
