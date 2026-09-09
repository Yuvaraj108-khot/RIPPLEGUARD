import React from 'react';
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Sliders, Sparkles } from 'lucide-react';
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
  const activeMitigation = mitigations.find((m) => m.id === selectedMitigationId) || mitigations[0];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyber-border space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-mono flex items-center space-x-2">
              <span>RIPPLE BREAKER OPTIMIZER</span>
              <span className="px-2 py-0.5 text-[10px] bg-cyber-emerald/20 text-cyber-emerald rounded-full border border-cyber-emerald/30">
                BREAK ENGINE
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Smallest practical intervention capable of stopping the cascade
            </p>
          </div>
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {mitigations.map((m) => {
          const isSelected = selectedMitigationId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onApplyMitigation(m)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyber-emerald/10 border-cyber-emerald shadow-lg shadow-cyber-emerald/10'
                  : 'bg-cyber-card/60 border-cyber-border hover:bg-cyber-hover hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-cyber-emerald/20 text-cyber-emerald font-extrabold text-xs flex items-center justify-center border border-cyber-emerald/40 mt-0.5">
                    #{m.priority}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-white font-mono">{m.action}</h4>
                    <p className="text-[11px] text-slate-300 mt-1">{m.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className="text-sm font-extrabold text-cyber-emerald block">
                    -{m.risk_reduction_pct}% RISK
                  </span>
                  <span className="text-[10px] text-slate-400 bg-cyber-card px-2 py-0.5 rounded border border-cyber-border inline-block mt-1">
                    {m.effort} effort
                  </span>
                </div>
              </div>

              {/* Action Button inside card */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-cyber-border/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">
                    Neutralizes {m.safe_edges_neutralized} propagation edges
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyMitigation(m);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isApplied
                        ? 'bg-cyber-emerald text-white'
                        : 'bg-gradient-to-r from-cyber-emerald to-cyber-cyan text-slate-950 hover:opacity-90 shadow-md shadow-cyber-emerald/20'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isApplied ? 'Mitigation Applied (Safe Replay)' : 'Apply Patch & Replay Safe Path'}</span>
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
