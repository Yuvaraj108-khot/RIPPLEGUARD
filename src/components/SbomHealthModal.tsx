import React from 'react';
import { X, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
import { GraphHealth } from '../types/rippleguard';

interface SbomHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: GraphHealth | null;
}

export const SbomHealthModal: React.FC<SbomHealthModalProps> = ({ isOpen, onClose, health }) => {
  if (!isOpen || !health) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0C101A] border border-cyber-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyber-purple" />
            <h3 className="font-bold text-sm text-white font-mono">SBOM Graph Confidence Audit</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-cyber-card p-4 rounded-xl border border-cyber-border">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Overall Graph Confidence</span>
            <span className="text-3xl font-extrabold font-mono text-cyber-emerald">
              {health.sbom_confidence}%
            </span>
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/30">
            {health.status}
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-cyber-border/60 text-slate-300">
            <span className="text-slate-400">Total Graph Nodes</span>
            <span>{health.node_count} nodes</span>
          </div>
          <div className="flex justify-between py-1 border-b border-cyber-border/60 text-slate-300">
            <span className="text-slate-400">Total Dependency Edges</span>
            <span>{health.edge_count} edges</span>
          </div>
          <div className="flex justify-between py-1 border-b border-cyber-border/60 text-slate-300">
            <span className="text-slate-400">Orphan Dependency Nodes</span>
            <span className={health.orphan_nodes.length > 0 ? 'text-cyber-amber' : 'text-cyber-emerald'}>
              {health.orphan_nodes.length} orphans
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-mono bg-cyber-bg p-3 rounded-lg border border-cyber-border">
          💡 RippleGuard audits SBOM completeness to prevent false precision. Incomplete graphs with missing relationships reduce reachability confidence.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-mono font-bold text-white bg-cyber-violet hover:bg-cyber-purple transition-all"
        >
          Close Health Audit
        </button>
      </div>
    </div>
  );
};
