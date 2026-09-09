import React, { useState } from 'react';
import { History, Calendar, TrendingUp } from 'lucide-react';

interface TimeMachineBarProps {
  onTimeChange: (snapshot: string) => void;
}

export const TimeMachineBar: React.FC<TimeMachineBarProps> = ({ onTimeChange }) => {
  const snapshots = [
    { id: 't1', label: 'Nov 2025 (Clean)', risk: 12 },
    { id: 't2', label: 'Jan 2026 (Dep Added)', risk: 38 },
    { id: 't3', label: 'Mar 2026 (CVE Released)', risk: 72 },
    { id: 't4', label: 'Current (Present)', risk: 87 },
  ];

  const [activeIndex, setActiveIndex] = useState(3);

  const handleSelect = (idx: number) => {
    setActiveIndex(idx);
    onTimeChange(snapshots[idx].id);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-cyber-border space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-cyber-cyan font-bold">
          <History className="w-4 h-4" />
          <span>SUPPLY-CHAIN TIME MACHINE</span>
        </div>
        <span className="text-slate-400 text-[11px]">Historical Risk Snapshot Evolution</span>
      </div>

      <div className="flex items-center justify-between pt-2 space-x-2">
        {snapshots.map((snap, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <button
              key={snap.id}
              onClick={() => handleSelect(idx)}
              className={`flex-1 p-2 rounded-xl text-center font-mono border transition-all text-xs ${
                isSelected
                  ? 'bg-cyber-violet/20 border-cyber-violet text-white font-bold shadow-md shadow-cyber-violet/20'
                  : 'bg-cyber-card/60 border-cyber-border text-slate-400 hover:text-white hover:bg-cyber-hover'
              }`}
            >
              <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{snap.label.split(' ')[0]}</span>
              </div>
              <div className="text-sm font-extrabold mt-0.5">
                <span className={snap.risk >= 80 ? 'text-cyber-rose' : snap.risk >= 50 ? 'text-cyber-amber' : 'text-cyber-emerald'}>
                  {snap.risk}
                </span>
                <span className="text-[10px] text-slate-400">/100</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
