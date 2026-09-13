import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  Network, 
  Flame, 
  GitMerge, 
  ShieldCheck, 
  Bot, 
  CheckCircle
} from 'lucide-react';

export interface DemoStep {
  time: string;
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    time: '00:00',
    id: 'step_vuln',
    title: 'Vulnerability Alert',
    badge: 'ALERT',
    description: 'Isolated CVE flagged in micro-dependency event-stream v3.3.6',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
  },
  {
    time: '00:15',
    id: 'step_map',
    title: 'MAP Topology',
    badge: 'MAP',
    description: 'Reveal transitive dependency graph; identify 1,892 downstream packages',
    icon: <Network className="w-3.5 h-3.5 text-sky-500" />
  },
  {
    time: '00:35',
    id: 'step_simulate',
    title: 'SIMULATE Cascade',
    badge: 'SIMULATE',
    description: 'Run compromise simulation & watch animated ripple propagation cascade',
    icon: <Flame className="w-3.5 h-3.5 text-amber-500" />
  },
  {
    time: '00:55',
    id: 'step_trace',
    title: 'TRACE Call Graph',
    badge: 'TRACE',
    description: 'Filter theoretical noise: isolate 18 actual reachable production endpoints',
    icon: <GitMerge className="w-3.5 h-3.5 text-blue-500" />
  },
  {
    time: '01:15',
    id: 'step_break',
    title: 'BREAK (Ripple Breaker)',
    badge: 'BREAK',
    description: 'Rank minimal interventions (#1 Upgrade dependency -> -64% risk reduction)',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
  },
  {
    time: '01:35',
    id: 'step_ai',
    title: 'AI Risk Analyst',
    badge: 'EXPLAIN',
    description: 'Strict evidence grounding: Developer call-path audit vs CISO ROI briefing',
    icon: <Bot className="w-3.5 h-3.5 text-sky-500" />
  },
  {
    time: '02:00',
    id: 'step_closing',
    title: 'MAP • TRACE • SIMULATE • BREAK',
    badge: 'COMPLETE',
    description: 'Transform passive SBOMs into an explainable, deterministic defense twin',
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
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
    <div className="bg-white dark:bg-[#0E131C] border-b border-slate-200 dark:border-white/10 px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs z-20 transition-colors">
      {/* Playback Controls & Narrative Callout */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={onTogglePlay}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause Demo' : 'Play 2-Min Demo'}</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141A26] border border-slate-200 dark:border-white/10 rounded-lg transition-colors"
          title="Reset Demo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-white/10 pl-3">
          <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
            {activeStep.time}
          </span>
          <span className="font-semibold text-slate-900 dark:text-white tracking-tight">{activeStep.title}:</span>
          <span className="text-slate-600 dark:text-slate-400 truncate max-w-[280px] lg:max-w-md hidden sm:inline">
            {activeStep.description}
          </span>
        </div>
      </div>

      {/* Step Scrubber */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 scrollbar-none">
        {DEMO_STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(idx)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all shrink-0 border ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold border-blue-500 shadow-sm'
                  : isPassed
                  ? 'bg-slate-100 dark:bg-[#141A26] text-slate-800 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-[#1A2232]'
                  : 'bg-slate-50 dark:bg-[#101520] text-slate-500 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#161D2B]'
              }`}
            >
              <span>{step.time}</span>
              <span className="hidden xl:inline">{step.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
