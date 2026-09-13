import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  UploadCloud, 
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { Scenario, GraphHealth } from '../types/rippleguard';

interface NavbarProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  graphHealth: GraphHealth | null;
  onOpenUpload: () => void;
  onOpenHealth: () => void;
  backendConnected: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  graphHealth,
  onOpenUpload,
  onOpenHealth,
  backendConnected,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  return (
    <header className="min-h-[3.75rem] h-auto border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0C1017]/95 backdrop-blur-md px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 z-30 sticky top-0 transition-colors">
      {/* Brand */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="font-extrabold text-xs sm:text-sm tracking-wider text-slate-900 dark:text-white">
              RIPPLEGUARD
            </span>
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-semibold rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hidden xs:inline-block">
              TWIN
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block">
            Explainable Dependency Risk & Ripple Breaker Engine
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0 flex-wrap gap-y-1.5">
        {/* Scenario Dropdown */}
        <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-[#141A26] border border-slate-200 dark:border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs max-w-[140px] xs:max-w-[180px] sm:max-w-none">
          <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 hidden md:inline">Ecosystem:</span>
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer text-xs truncate w-full"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-white dark:bg-[#141A26] text-slate-900 dark:text-slate-200">
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* SBOM Confidence */}
        {graphHealth && (
          <button
            onClick={onOpenHealth}
            className="flex items-center space-x-1.5 bg-slate-50 dark:bg-[#141A26] hover:bg-slate-100 dark:hover:bg-[#1A2232] border border-slate-200 dark:border-white/10 px-2 sm:px-3 py-1.5 rounded-lg text-xs transition-colors"
            title="Software Bill of Materials Confidence"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 hidden md:inline">SBOM:</span>
            <span
              className={`font-mono font-bold text-xs ${
                graphHealth.sbom_confidence >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {graphHealth.sbom_confidence}%
            </span>
          </button>
        )}

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-1.5 bg-slate-100 dark:bg-[#1B2333] hover:bg-slate-200 dark:hover:bg-[#232E42] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          title="Upload SBOM or Manifest"
        >
          <UploadCloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="hidden sm:inline">Upload Manifest</span>
        </button>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          onClick={onToggleTheme}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141A26] hover:bg-slate-100 dark:hover:bg-[#1A2232] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
        >
          {isLight ? (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden lg:inline text-[11px]">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px]">Light</span>
            </>
          )}
        </button>

        {/* Live Status Pill */}
        <div className="flex items-center space-x-1.5 border-l border-slate-200 dark:border-white/10 pl-2 sm:pl-3">
          <div
            className="flex items-center space-x-1.5 text-[11px] font-mono cursor-help"
            title={backendConnected ? "Connected to live FastAPI Digital Twin Engine" : "Running in autonomous demo mode with verified benchmark datasets (FastAPI backend offline or starting up)"}
          >
            {backendConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">Engine Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">Demo Mode</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
