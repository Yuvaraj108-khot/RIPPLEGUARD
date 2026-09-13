import React from 'react';
import { X, Activity, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { GraphHealth } from '../types/rippleguard';

interface SbomHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: GraphHealth | null;
}

export const SbomHealthModal: React.FC<SbomHealthModalProps> = ({ isOpen, onClose, health }) => {
  if (!isOpen || !health) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="security-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white tracking-tight">SBOM Graph Confidence Audit</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-white/5">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Topology Confidence Score</span>
            <span className="text-3xl font-black font-mono text-emerald-400">
              {health.sbom_confidence}%
            </span>
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {health.status}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
            <span className="text-slate-400">Discovered Graph Nodes</span>
            <span className="font-mono font-semibold">{health.node_count} nodes</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
            <span className="text-slate-400">Transitive Dependency Edges</span>
            <span className="font-mono font-semibold">{health.edge_count} edges</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
            <span className="text-slate-400">Disconnected / Orphan Nodes</span>
            <span
              className={`font-mono font-semibold ${
                health.orphan_nodes.length > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {health.orphan_nodes.length} orphans
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-white/5 leading-relaxed">
          🔒 RippleGuard audits SBOM graph integrity before calculating blast radius to protect against false negatives caused by unmapped transitive relationships.
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-md shadow-violet-600/20"
        >
          Dismiss Audit
        </button>
      </div>
    </div>
  );
};
