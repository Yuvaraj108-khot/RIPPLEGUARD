import React from 'react';
import { ShieldAlert, Cpu, UploadCloud, Activity, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { Scenario, GraphHealth } from '../types/rippleguard';

interface NavbarProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  graphHealth: GraphHealth | null;
  onOpenUpload: () => void;
  onOpenHealth: () => void;
  backendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  graphHealth,
  onOpenUpload,
  onOpenHealth,
  backendConnected,
}) => {
  return (
    <header className="h-16 border-b border-cyber-border bg-[#0C101A]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-violet via-cyber-purple to-cyber-cyan p-0.5 shadow-lg shadow-cyber-violet/20 flex items-center justify-center">
          <div className="w-full h-full bg-cyber-bg rounded-[10px] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-cyber-violet animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyber-violet">
              RIPPLEGUARD
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/30">
              DIGITAL TWIN
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Explainable Supply-Chain Risk & Mitigation Engine
          </p>
        </div>
      </div>

      {/* Scenario Selector & Controls */}
      <div className="flex items-center space-x-4">
        {/* Active Ecosystem Dropdown */}
        <div className="flex items-center space-x-2 bg-cyber-card border border-cyber-border rounded-lg px-3 py-1.5 text-xs">
          <Layers className="w-4 h-4 text-cyber-cyan" />
          <span className="text-slate-400 font-mono hidden md:inline">Ecosystem:</span>
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-cyber-card text-slate-200">
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* SBOM Graph Health Meter Button */}
        {graphHealth && (
          <button
            onClick={onOpenHealth}
            className="flex items-center space-x-2 bg-cyber-card hover:bg-cyber-hover border border-cyber-border px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Activity className="w-4 h-4 text-cyber-purple" />
            <span className="font-mono text-slate-300">Confidence:</span>
            <span
              className={`font-mono font-bold ${
                graphHealth.sbom_confidence >= 80 ? 'text-cyber-emerald' : 'text-cyber-amber'
              }`}
            >
              {graphHealth.sbom_confidence}%
            </span>
          </button>
        )}

        {/* Upload Custom Manifest / SBOM */}
        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-1.5 bg-cyber-violet/20 hover:bg-cyber-violet/30 border border-cyber-violet/40 text-cyber-violet px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-cyber-violet/20"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Upload SBOM</span>
        </button>

        {/* Engine Status Indicator */}
        <div className="flex items-center space-x-2 border-l border-cyber-border pl-4">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono">
            {backendConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse"></span>
                <span className="text-cyber-emerald hidden md:inline">FastAPI Ready</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-cyber-amber"></span>
                <span className="text-cyber-amber hidden md:inline">Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
