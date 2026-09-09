import React, { useState } from 'react';
import { X, UploadCloud, FileJson, CheckCircle2, AlertTriangle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (scenarioId: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!jsonText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const formData = new FormData();
      formData.append('file', blob, 'package.json');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse manifest');
      }

      const data = await response.json();
      setLoading(false);
      onUploadSuccess(data.scenario.id);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error processing manifest file');
    }
  };

  const loadSamplePackageJson = () => {
    const sample = {
      name: 'enterprise-payment-gateway',
      version: '2.1.0',
      dependencies: {
        express: '^4.18.2',
        axios: '^1.6.0',
        nodemailer: '^6.9.1',
        'queue-adapter': '^2.1.0',
        'event-stream': '3.3.6',
      },
    };
    setJsonText(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0C101A] border border-cyber-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-cyber-violet" />
            <h3 className="font-bold text-sm text-white font-mono">Upload Manifest or SBOM</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Paste your <code className="text-cyber-cyan">package.json</code>, lockfile, or CycloneDX/SPDX JSON content below to construct a live digital twin graph.
        </p>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='{ "name": "my-app", "dependencies": { ... } }'
          className="w-full h-48 bg-cyber-bg border border-cyber-border rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyber-violet"
        />

        {error && (
          <div className="flex items-center space-x-2 text-cyber-rose text-xs font-mono bg-cyber-rose/10 p-2.5 rounded-lg border border-cyber-rose/30">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={loadSamplePackageJson}
            className="text-xs text-cyber-cyan font-mono hover:underline flex items-center space-x-1"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Load Sample package.json</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-cyber-card border border-cyber-border"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || !jsonText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-cyber-violet hover:bg-cyber-purple transition-all shadow-md shadow-cyber-violet/30 disabled:opacity-50"
            >
              {loading ? 'Building Graph...' : 'Construct Graph'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
