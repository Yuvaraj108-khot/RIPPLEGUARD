import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Network, Flame, GitMerge, ShieldCheck, Bot, CheckCircle } from 'lucide-react';

export interface DemoStep {
  time: string;
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    time: '00:00',
    id: 'step_vuln',
    title: 'Vulnerability Alert',
    description: 'CVE alert detected in low-level micro-dependency event-stream v3.3.6',
    icon: <AlertTriangle className="w-4 h-4 text-cyber-rose" />
  },
  {
    time: '00:15',
    id: 'step_map',
    title: 'MAP Ecosystem',
    description: 'Map dependency topology; highlight micro-dependency with high transitive fan-in',
    icon: <Network className="w-4 h-4 text-cyber-cyan" />
  },
  {
    time: '00:35',
    id: 'step_simulate',
    title: 'SIMULATE Breach',
    description: 'Run compromise simulation & watch animated ripple cascade downstream',
    icon: <Flame className="w-4 h-4 text-cyber-amber" />
  },
  {
    time: '00:55',
    id: 'step_trace',
    title: 'TRACE Reachability',
    description: 'Distinguish theoretical exposure from 18 actual reachable production endpoints',
    icon: <GitMerge className="w-4 h-4 text-cyber-purple" />
  },
  {
    time: '01:15',
    id: 'step_break',
    title: 'BREAK (Ripple Breaker)',
    description: 'Rank minimal-effort interventions (#1 Upgrade dependency -64% risk reduction)',
    icon: <ShieldCheck className="w-4 h-4 text-cyber-emerald" />
  },
  {
    time: '01:35',
    id: 'step_ai',
    title: 'AI Risk Analyst',
    description: 'Ground AI explanations in evidence (Developer technical path vs Executive ROI)',
    icon: <Bot className="w-4 h-4 text-cyber-violet" />
  },
  {
    time: '02:00',
    id: 'step_closing',
    title: 'MAP. TRACE. SIMULATE. BREAK.',
    description: 'Turn vulnerability lists into an actionable plan for breaking the cascade',
    icon: <CheckCircle className="w-4 h-4 text-cyber-emerald" />
  }
];

interface DemoNarrativeBarProps {
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const DemoNarrativeBar: React.FC<DemoNarrativeBarProps> = ({
  currentStepIndex,
  onSelectStep,
  isPlaying,
  onTogglePlay,
  onReset,
}) => {
  const activeStep = DEMO_STEPS[currentStepIndex];

  return (
    <div className="bg-[#0E1320] border-b border-cyber-border px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      {/* Controls & Active Title */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={onTogglePlay}
          className="flex items-center space-x-1.5 bg-cyber-violet text-white px-3 py-1.5 rounded-md font-medium hover:bg-cyber-purple transition-all shadow-md shadow-cyber-violet/30"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause Demo' : '2-Min Demo Flow'}</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-white bg-cyber-card border border-cyber-border rounded-md transition-colors"
          title="Reset Demo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center space-x-2 border-l border-cyber-border pl-3">
          <span className="font-mono text-cyber-cyan font-bold bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
            {activeStep.time}
          </span>
          <span className="font-semibold text-white">{activeStep.title}:</span>
          <span className="text-slate-400 font-mono truncate max-w-[280px] lg:max-w-md hidden sm:inline">
            {activeStep.description}
          </span>
        </div>
      </div>

      {/* Step Buttons Tracker */}
      <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
        {DEMO_STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(idx)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all shrink-0 ${
                isActive
                  ? 'bg-cyber-violet text-white font-bold shadow-sm shadow-cyber-violet/50 border border-cyber-violet'
                  : isPassed
                  ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-hover'
                  : 'bg-cyber-card/50 text-slate-400 border border-cyber-border hover:bg-cyber-hover'
              }`}
            >
              <span>{step.time}</span>
              <span className="hidden lg:inline">{step.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
