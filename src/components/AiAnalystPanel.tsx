import React, { useState } from 'react';
import { 
  Bot, 
  Code2, 
  ShieldAlert, 
  Database, 
  Copy, 
  Check
} from 'lucide-react';
import { GroundedAIExplanation } from '../types/rippleguard';

interface AiAnalystPanelProps {
  explanation: GroundedAIExplanation | null;
  loading: boolean;
}

export const AiAnalystPanel: React.FC<AiAnalystPanelProps> = ({ explanation, loading }) => {
  const [activePersona, setActivePersona] = useState<'developer' | 'executive'>('developer');
  const [showJsonEvidence, setShowJsonEvidence] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (!explanation) return;
    const text = activePersona === 'developer' ? explanation.developer_view : explanation.executive_view;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="enterprise-card rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
        <Bot className="w-6 h-6 text-blue-500 animate-bounce" />
        <p>Grounding AI explanation on deterministic graph evidence...</p>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="enterprise-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 space-y-4 shadow-sm dark:shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                EVIDENCE-GROUNDED AI ANALYST
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-500/20">
                AUDITED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly derived from NetworkX topology metrics & propagation paths
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs flex items-center space-x-1 transition-colors border border-slate-200 dark:border-white/5"
            title="Copy Analysis"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowJsonEvidence(!showJsonEvidence)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition-colors border border-slate-200 dark:border-white/5"
          >
            <Database className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">{showJsonEvidence ? 'Hide Evidence' : 'Audit Evidence'}</span>
          </button>
        </div>
      </div>

      {/* Segmented Persona Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-[#0A0D14] p-1 rounded-xl border border-slate-200 dark:border-white/5 text-xs">
        <button
          onClick={() => setActivePersona('developer')}
          className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-lg font-medium transition-all ${
            activePersona === 'developer'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Developer Technical Audit</span>
        </button>

        <button
          onClick={() => setActivePersona('executive')}
          className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-lg font-medium transition-all ${
            activePersona === 'executive'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Executive & CISO Impact</span>
        </button>
      </div>

      {/* Structured Grounded Explanation View */}
      <div className="bg-slate-50 dark:bg-[#0A0D14] rounded-xl border border-slate-200 dark:border-white/5 p-4 text-xs leading-relaxed space-y-3 text-slate-800 dark:text-slate-200">
        <div
          className="prose dark:prose-invert max-w-none text-xs"
          dangerouslySetInnerHTML={{
            __html: (activePersona === 'developer'
              ? explanation.developer_view
              : explanation.executive_view
            )
              .replace(/### (.*)/g, '<h4 class="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1 tracking-tight">$1</h4>')
              .replace(/#### (.*)/g, '<h5 class="font-semibold text-xs text-blue-700 dark:text-blue-400 mt-2 mb-0.5">$1</h5>')
              .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-900 dark:text-slate-200 font-mono text-[11px] border border-slate-300 dark:border-white/5">$1</code>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-900 dark:text-white font-semibold">$1</strong>')
              .replace(/\n/g, '<br/>'),
          }}
        />
      </div>

      {/* JSON Audit Evidence Drawer */}
      {showJsonEvidence && (
        <div className="bg-slate-100 dark:bg-[#070A0F] rounded-xl border border-slate-200 dark:border-white/10 p-3.5 space-y-2 text-[11px] font-mono shadow-md">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-white/10">
            <span className="font-semibold flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Deterministic Graph Evidence</span>
            </span>
            <span className="text-[10px] text-slate-500">Strict Grounding Contract</span>
          </div>
          <pre className="text-slate-800 dark:text-slate-300 overflow-x-auto p-2.5 bg-white dark:bg-[#0D121B] rounded-lg border border-slate-200 dark:border-white/5 max-h-52 scrollbar-thin">
            {JSON.stringify(explanation.evidence, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
