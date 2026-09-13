import React, { useState } from 'react';
import { X, UploadCloud, FileJson, AlertTriangle, Sparkles, Layers, ShieldAlert } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (scenarioId: string) => void;
}

const CYCLONEDX_ENTERPRISE_SAMPLE = {
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  serialNumber: "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
  version: 1,
  metadata: {
    timestamp: "2026-09-09T12:00:00Z",
    component: {
      "bom-ref": "app-apex-banking",
      type: "application",
      name: "ApexBank Global Treasury System",
      version: "4.8.2-PROD"
    }
  },
  components: [
    {
      "bom-ref": "svc-payment-router",
      type: "service",
      name: "PaymentRouter & Settlement Gateway",
      version: "3.2.0",
      business_criticality: 95,
      maintainer_hygiene: 92
    },
    {
      "bom-ref": "svc-auth-broker",
      type: "service",
      name: "OAuth2 & JWT Broker Service",
      version: "2.14.1",
      business_criticality: 90,
      maintainer_hygiene: 88
    },
    {
      "bom-ref": "svc-audit-vault",
      type: "service",
      name: "Immutable Ledger Audit Engine",
      version: "1.9.0",
      business_criticality: 85,
      maintainer_hygiene: 94
    },
    {
      "bom-ref": "lib-log4j-core",
      type: "library",
      name: "org.apache.logging.log4j:log4j-core",
      version: "2.14.1",
      business_criticality: 90,
      maintainer_hygiene: 18,
      vulnerable: true,
      vulnerabilities: [
        {
          id: "CVE-2021-44228",
          cvss: 10.0,
          description: "Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints (Log4Shell RCE)."
        }
      ]
    },
    {
      "bom-ref": "lib-jackson-databind",
      type: "library",
      name: "com.fasterxml.jackson.core:jackson-databind",
      version: "2.13.0",
      business_criticality: 70,
      maintainer_hygiene: 85
    },
    {
      "bom-ref": "lib-spring-crypto",
      type: "library",
      name: "org.springframework.security:spring-security-crypto",
      version: "5.7.3",
      business_criticality: 75,
      maintainer_hygiene: 95
    },
    {
      "bom-ref": "dep-jndi-ldap",
      type: "micro_dependency",
      name: "com.sun.jndi.ldap:jndi-ldap-context",
      version: "1.2.0",
      business_criticality: 85,
      maintainer_hygiene: 25,
      vulnerable: true,
      vulnerabilities: [
        {
          id: "CVE-2021-44228:LEAF",
          cvss: 9.8,
          description: "Unauthenticated remote arbitrary bytecode execution via untrusted JNDI lookup response parsing."
        }
      ]
    },
    {
      "bom-ref": "dep-asm-reflect",
      type: "micro_dependency",
      name: "org.ow2.asm:asm-tree-bytecode",
      version: "9.2.0",
      business_criticality: 40,
      maintainer_hygiene: 90
    }
  ],
  dependencies: [
    {
      ref: "app-apex-banking",
      dependsOn: [
        "PaymentRouter & Settlement Gateway",
        "OAuth2 & JWT Broker Service",
        "Immutable Ledger Audit Engine"
      ]
    },
    {
      ref: "PaymentRouter & Settlement Gateway",
      dependsOn: [
        "org.apache.logging.log4j:log4j-core",
        "com.fasterxml.jackson.core:jackson-databind"
      ]
    },
    {
      ref: "OAuth2 & JWT Broker Service",
      dependsOn: [
        "org.springframework.security:spring-security-crypto",
        "org.apache.logging.log4j:log4j-core"
      ]
    },
    {
      ref: "Immutable Ledger Audit Engine",
      dependsOn: [
        "com.fasterxml.jackson.core:jackson-databind"
      ]
    },
    {
      ref: "org.apache.logging.log4j:log4j-core",
      dependsOn: [
        "com.sun.jndi.ldap:jndi-ldap-context",
        "org.ow2.asm:asm-tree-bytecode"
      ]
    }
  ]
};

const DEEP_ECOMMERCE_SAMPLE = {
  name: "global-omnichannel-storefront",
  version: "3.4.1",
  description: "Enterprise high-throughput e-commerce checkout and microservice pipeline",
  dependencies: {
    "@enterprise/checkout-orchestrator": "2.4.0",
    "@enterprise/fraud-detection-service": "1.8.2",
    "@enterprise/tax-engine-client": "3.1.0",
    "event-stream": "3.3.6",
    "flatmap-stream": "0.1.1",
    "express": "4.18.2",
    "axios": "1.6.2",
    "redis": "4.6.10",
    "jsonwebtoken": "9.0.2",
    "lodash": "4.17.21"
  }
};

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
      formData.append('file', blob, 'manifest.json');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to parse manifest');
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">Upload Manifest or SBOM</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">CycloneDX 1.4/1.5 JSON or deep multi-tier package manifests</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Complex Test Presets:</span>
            </span>
            <span className="text-[11px] text-slate-500">Click to autofill</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setJsonText(JSON.stringify(CYCLONEDX_ENTERPRISE_SAMPLE, null, 2))}
              className="flex items-start space-x-2.5 p-2.5 rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/70 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-left transition-all group"
            >
              <ShieldAlert className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-violet-950 dark:text-violet-200 group-hover:text-violet-700 dark:group-hover:text-violet-100">
                  ApexBank CycloneDX 1.5 SBOM
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Log4Shell CVSS 10.0 • 4-tier DAG • 8 components
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setJsonText(JSON.stringify(DEEP_ECOMMERCE_SAMPLE, null, 2))}
              className="flex items-start space-x-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all group"
            >
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                  E-Commerce Microservice Tree
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  event-stream Malicious Inject • 10 packages
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 min-h-[220px] flex flex-col space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Payload (JSON)</span>
            <span>{jsonText.length > 0 ? `${jsonText.length} characters` : 'Empty'}</span>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Paste your CycloneDX SBOM JSON or package.json here...'
            className="w-full flex-1 min-h-[200px] bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-y"
            spellCheck={false}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-mono bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/20">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setJsonText('')}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Clear Editor
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || !jsonText.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-md shadow-violet-600/20 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Twin...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Construct Graph</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

