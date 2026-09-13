import React from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  Layers, 
  Activity, 
  Radio, 
  GitFork
} from 'lucide-react';
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
      <div className="enterprise-card p-6 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-mono">
        <Activity className="w-5 h-5 mr-2 text-blue-500 animate-spin" />
        Computing Topology Risk Matrix...
      </div>
    );
  }

  const targetName = simulation.target.label;

  // SVG Gauge calculations
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (risk.score / 100) * circumference;

  return (
    <div className="enterprise-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4">
      {/* Top Header Row with Dial */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              RIPPLE RISK COCKPIT
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Target:</span>
            <span className="font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20 text-sm font-bold">
              {targetName}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {simulation.target.cve} • CVSS {simulation.target.cvss} • v{simulation.target.version}
          </p>
        </div>

        {/* Circular Radial Risk Score Gauge */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-20 h-20 transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-slate-200 dark:stroke-white/10"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={risk.score > 75 ? '#EF4444' : risk.score > 50 ? '#F59E0B' : '#10B981'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
              {risk.score}
            </span>
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase mt-0.5">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Risk Tier Badge */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0E131C] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-xs">
        <div className="flex items-center space-x-2">
          <span
            className="px-2.5 py-0.5 rounded font-mono font-bold tracking-wide uppercase border text-[11px]"
            style={{
              backgroundColor: `${risk.color}15`,
              color: risk.color,
              borderColor: `${risk.color}35`,
            }}
          >
            {risk.classification}
          </span>
          <span className="text-slate-600 dark:text-slate-400">Transitive cascade threat detected</span>
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          Confidence: <strong className="text-emerald-600 dark:text-emerald-400">96.4%</strong>
        </span>
      </div>

      {/* Blast Radius 4-Grid Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50 dark:bg-[#0E131C] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Downstream Pkgs</span>
          <span className="text-base font-bold font-mono text-slate-900 dark:text-white">1,892</span>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <GitFork className="w-3 h-3 text-slate-400" />
            <span>Deep fan-in</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0E131C] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Reachable Apps</span>
          <span className="text-base font-bold font-mono text-sky-600 dark:text-sky-400">
            {simulation.reachable_applications_count}
          </span>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <Radio className="w-3 h-3 text-sky-500 dark:text-sky-400" />
            <span>In call-graph</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0E131C] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Critical Services</span>
          <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
            {simulation.critical_applications_count}
          </span>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <ShieldAlert className="w-3 h-3 text-rose-500 dark:text-rose-400" />
            <span>Payments/Auth</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0E131C] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Max Depth</span>
          <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
            {simulation.maximum_depth_hops} hops
          </span>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>Transitive chain</span>
          </div>
        </div>
      </div>

      {/* Primary Call-Chain Vector Trace */}
      <div className="bg-slate-50 dark:bg-[#0A0D14] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-1 font-mono text-xs">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Primary Call-Chain Vector
        </span>
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none text-[11px]">
          {simulation.top_path.map((step, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`px-2 py-0.5 rounded border whitespace-nowrap ${
                  idx === 0
                    ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 font-semibold'
                    : idx === simulation.top_path.length - 1
                    ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-bold'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                }`}
              >
                {step}
              </span>
              {idx < simulation.top_path.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
