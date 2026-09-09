import React from 'react';
import { ShieldAlert, ArrowDown, ShieldCheck, Zap, Layers, AlertCircle } from 'lucide-react';
import { SimulationResult, RiskResult, MitigationOption } from '../types/rippleguard';

interface KillerSummaryCardProps {
  simulation: SimulationResult | null;
  risk: RiskResult | null;
  mitigations: MitigationOption[];
  onSelectMitigation: (mitigation: MitigationOption) => void;
  selectedMitigationId: string | null;
}

export const KillerSummaryCard: React.FC<KillerSummaryCardProps> = ({
  simulation,
  risk,
  mitigations,
  onSelectMitigation,
  selectedMitigationId,
}) => {
  if (!simulation || !risk) {
    return (
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-mono">
        <AlertCircle className="w-5 h-5 mr-2 text-cyber-violet animate-spin" />
        Running Digital Twin Analysis Engine...
      </div>
    );
  }

  const targetName = simulation.target.label;

  return (
    <div className="glass-panel-glow rounded-2xl p-5 border border-cyber-violet/40 shadow-2xl relative overflow-hidden">
      {/* Background Neon Accent Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyber-rose/20 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Card Header: Score & Classification */}
      <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold block">
            RIPPLE RISK SCORE
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
              {risk.score}
            </span>
            <span className="text-sm font-mono text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="text-right">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-mono font-extrabold tracking-wider border"
            style={{
              backgroundColor: `${risk.color}20`,
              color: risk.color,
              borderColor: `${risk.color}50`
            }}
          >
            {risk.classification}
          </span>
          <p className="text-[10px] font-mono text-slate-400 mt-1">
            CVSS {simulation.target.cvss} • {simulation.target.cve}
          </p>
        </div>
      </div>

      {/* Mini Topology Visualizer ASCII/Graphic */}
      <div className="py-4 my-2 bg-cyber-bg/80 rounded-xl border border-cyber-border px-4 flex flex-col items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-2 bg-cyber-rose/20 text-cyber-rose px-3 py-1 rounded-md border border-cyber-rose/40 font-bold mb-2">
          <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping"></span>
          <span>🔴 {targetName} ({simulation.target.version})</span>
        </div>
        
        <div className="text-slate-500 font-bold my-0.5">/ &nbsp; | &nbsp; \</div>
        
        <div className="flex items-center space-x-4 text-[11px] text-slate-300">
          <span className="bg-cyber-card px-2 py-0.5 rounded border border-cyber-border">express</span>
          <span className="bg-cyber-card px-2 py-0.5 rounded border border-cyber-border">nodemailer</span>
          <span className="bg-cyber-card px-2 py-0.5 rounded border border-cyber-border">queue-adapter</span>
        </div>

        <div className="text-slate-500 font-bold my-0.5">| &nbsp; | &nbsp; |</div>

        <div className="flex items-center space-x-3 text-[11px] font-bold">
          <span className="text-cyber-cyan">Storefront API</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyber-rose bg-cyber-rose/10 px-2 py-0.5 rounded border border-cyber-rose/30">
            ⚡ PAYMENT PROD
          </span>
        </div>
      </div>

      {/* Downstream Metrics List */}
      <div className="space-y-2 py-3 border-y border-cyber-border text-xs font-mono">
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Downstream packages</span>
          <span className="font-bold text-white font-mono bg-cyber-card px-2 py-0.5 rounded border border-cyber-border">
            1,892
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Reachable applications</span>
          <span className="font-bold text-cyber-cyan font-mono bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
            {simulation.reachable_applications_count}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Critical applications</span>
          <span className="font-bold text-cyber-rose font-mono bg-cyber-rose/10 px-2 py-0.5 rounded border border-cyber-rose/30">
            {simulation.critical_applications_count}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Propagation paths</span>
          <span className="font-bold text-white font-mono bg-cyber-card px-2 py-0.5 rounded border border-cyber-border">
            {simulation.propagation_paths_count}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Maximum depth</span>
          <span className="font-bold text-cyber-purple font-mono bg-cyber-purple/10 px-2 py-0.5 rounded border border-cyber-purple/30">
            {simulation.maximum_depth_hops} hops
          </span>
        </div>
      </div>

      {/* RIPPLE BREAKER Section */}
      <div className="pt-4">
        <div className="flex items-center justify-center space-x-1.5 text-[11px] font-mono font-bold text-cyber-cyan uppercase tracking-wider mb-3">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          <span>FIND RIPPLE BREAKER</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </div>

        <div className="space-y-2">
          {mitigations.map((m) => {
            const isSelected = selectedMitigationId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMitigation(m)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-mono ${
                  isSelected
                    ? 'bg-cyber-emerald/20 border-cyber-emerald text-white shadow-lg shadow-cyber-emerald/20 ring-1 ring-cyber-emerald'
                    : 'bg-cyber-card/80 border-cyber-border text-slate-300 hover:bg-cyber-hover hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyber-emerald/20 text-cyber-emerald font-bold text-[10px] flex items-center justify-center border border-cyber-emerald/40">
                    #{m.priority}
                  </span>
                  <div>
                    <span className="font-bold text-slate-100">{m.short_title}</span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {m.target_app}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-cyber-emerald">
                    -{m.risk_reduction_pct}% risk
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {m.effort} effort
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
