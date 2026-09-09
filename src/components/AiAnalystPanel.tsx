import React, { useState } from 'react';
import { Bot, Code2, ShieldAlert, Sparkles, Terminal, FileCode, CheckCircle, Database } from 'lucide-react';
import { GroundedAIExplanation } from '../types/rippleguard';

interface AiAnalystPanelProps {
  explanation: GroundedAIExplanation | null;
  loading: boolean;
}

export const AiAnalystPanel: React.FC<AiAnalystPanelProps> = ({ explanation, loading }) => {
  const [activePersona, setActivePersona] = useState<'developer' | 'executive'>('developer');
  const [showJsonEvidence, setShowJsonEvidence] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 text-slate-400 font-mono text-xs">
        <Bot className="w-8 h-8 text-cyber-violet animate-bounce" />
        <p>Grounding AI explanation on structured graph evidence...</p>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyber-violet/30 space-y-4 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyber-violet/20 border border-cyber-violet/40 flex items-center justify-center text-cyber-violet shadow-sm shadow-cyber-violet/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-mono flex items-center space-x-2">
              <span>EVIDENCE-GROUNDED AI RISK ANALYST</span>
              <span className="px-2 py-0.5 text-[10px] bg-cyber-violet/20 text-cyber-violet rounded-full border border-cyber-violet/30">
                AUDITABLE AI
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Zero invented statistics • Powered strictly by topology graph evidence
            </p>
          </div>
        </div>

        {/* JSON Evidence Inspector Button */}
        <button
          onClick={() => setShowJsonEvidence(!showJsonEvidence)}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyber-card hover:bg-cyber-hover border border-cyber-border text-xs font-mono text-slate-300 transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>{showJsonEvidence ? 'Hide Evidence' : 'Inspect Evidence Payload'}</span>
        </button>
      </div>

      {/* Persona Selector Tabs */}
      <div className="flex items-center space-x-2 bg-cyber-bg p-1 rounded-xl border border-cyber-border text-xs font-mono">
        <button
          onClick={() => setActivePersona('developer')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
            activePersona === 'developer'
              ? 'bg-cyber-violet text-white font-bold shadow-md shadow-cyber-violet/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Developer Technical View</span>
        </button>

        <button
          onClick={() => setActivePersona('executive')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
            activePersona === 'executive'
              ? 'bg-cyber-purple text-white font-bold shadow-md shadow-cyber-purple/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security / Executive View</span>
        </button>
      </div>

      {/* Grounded Markdown Explanation Content */}
      <div className="bg-cyber-card/70 rounded-xl border border-cyber-border p-4 text-xs leading-relaxed space-y-3 font-mono text-slate-200">
        <div
          className="prose prose-invert max-w-none text-xs"
          dangerouslySetInnerHTML={{
            __html: (activePersona === 'developer'
              ? explanation.developer_view
              : explanation.executive_view
            )
              .replace(/### (.*)/g, '<h4 class="font-bold text-sm text-cyber-violet mt-2 mb-1">$1</h4>')
              .replace(/#### (.*)/g, '<h5 class="font-semibold text-xs text-cyber-cyan mt-2 mb-1">$1</h5>')
              .replace(/`([^`]+)`/g, '<code class="bg-cyber-bg px-1.5 py-0.5 rounded text-cyber-violet border border-cyber-border">$1</code>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
              .replace(/\n/g, '<br/>'),
          }}
        />
      </div>

      {/* JSON Evidence Payload Inspector Drawer */}
      {showJsonEvidence && (
        <div className="bg-[#080B12] rounded-xl border border-cyber-cyan/30 p-3 space-y-2 text-[11px] font-mono">
          <div className="flex items-center justify-between text-cyber-cyan font-bold pb-2 border-b border-cyber-border">
            <span>Structured Evidence JSON Passed to AI Engine</span>
            <span className="text-[10px] text-slate-400">Strictly Grounded Input</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto p-2 bg-cyber-bg rounded border border-cyber-border max-h-48 scrollbar-thin">
            {JSON.stringify(explanation.evidence, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
