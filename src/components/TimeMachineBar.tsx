import React, { useState } from 'react';
import { History, Calendar } from 'lucide-react';

interface TimeMachineBarProps {
  onTimeChange: (snapshot: string) => void;
}

export const TimeMachineBar: React.FC<TimeMachineBarProps> = ({ onTimeChange }) => {
  const snapshots = [
    { id: 't1', month: 'Nov 2025', desc: 'Clean Baseline', risk: 12 },
    { id: 't2', month: 'Jan 2026', desc: 'Dependency Added', risk: 38 },
    { id: 't3', month: 'Mar 2026', desc: 'CVE Disclosed', risk: 72 },
    { id: 't4', month: 'Present', desc: 'Cascade Exposure', risk: 87 },
  ];

  const [activeIndex, setActiveIndex] = useState(3);

  const handleSelect = (idx: number) => {
    setActiveIndex(idx);
    onTimeChange(snapshots[idx].id);
  };

  return (
    <div className="enterprise-card rounded-2xl p-4 border border-slate-200 dark:border-white/10 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-sky-400 font-semibold">
          <History className="w-4 h-4" />
          <span className="tracking-tight">SUPPLY-CHAIN TIME MACHINE</span>
        </div>
        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">Historical Risk Drift</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {snapshots.map((snap, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <button
              key={snap.id}
              onClick={() => handleSelect(idx)}
              className={`p-2.5 rounded-xl text-left border transition-all text-xs relative ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-blue-500/30'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/70'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{snap.month}</span>
              </div>
              <div className="text-sm font-bold font-mono mt-1 flex items-baseline space-x-1">
                <span
                  className={
                    snap.risk >= 80 ? 'text-rose-600 dark:text-rose-400' : snap.risk >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }
                >
                  {snap.risk}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">/100</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{snap.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
