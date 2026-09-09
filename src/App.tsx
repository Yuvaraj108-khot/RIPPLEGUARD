import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { DemoNarrativeBar, DEMO_STEPS } from './components/DemoNarrativeBar';
import { DigitalTwinCanvas } from './components/DigitalTwinCanvas';
import { KillerSummaryCard } from './components/KillerSummaryCard';
import { RippleBreakerPanel } from './components/RippleBreakerPanel';
import { AiAnalystPanel } from './components/AiAnalystPanel';
import { UploadModal } from './components/UploadModal';
import { SbomHealthModal } from './components/SbomHealthModal';
import { TimeMachineBar } from './components/TimeMachineBar';
import {
  Scenario,
  GraphNode,
  GraphEdge,
  GraphHealth,
  SimulationResult,
  RiskResult,
  MitigationOption,
  GroundedAIExplanation,
} from './types/rippleguard';

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('ecommerce_microservices');
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [graphHealth, setGraphHealth] = useState<GraphHealth | null>(null);

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [mitigations, setMitigations] = useState<MitigationOption[]>([]);
  const [aiExplanation, setAiExplanation] = useState<GroundedAIExplanation | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedMitigationId, setSelectedMitigationId] = useState<string | null>('mit_1');
  const [isMitigationApplied, setIsMitigationApplied] = useState<boolean>(false);
  const [neutralizedEdges, setNeutralizedEdges] = useState<Array<{ from: string; to: string }>>([]);

  const [viewMode, setViewMode] = useState<'topology' | 'attack' | 'safe'>('attack');
  const [currentDemoStepIndex, setCurrentDemoStepIndex] = useState<number>(0);
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);

  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isHealthOpen, setIsHealthOpen] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Fetch initial scenarios list
  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => {
        setScenarios(data);
        setBackendConnected(true);
      })
      .catch((err) => {
        console.error('FastAPI backend connection error:', err);
        setBackendConnected(false);
      });
  }, []);

  // Fetch active graph topology
  const loadGraph = (scenarioId: string) => {
    fetch(`/api/graph/${scenarioId}`)
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
        setGraphHealth(data.graph_health);
      })
      .catch((err) => console.error(err));
  };

  // Run compromise simulation
  const runSimulation = (scenarioId: string, targetNode?: string) => {
    fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: scenarioId,
        target_node: targetNode || null,
        scenario_type: 'malicious_release',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSimulation(data.simulation);
        setRisk(data.risk);
        setMitigations(data.mitigations);
        setAiExplanation(data.ai_explanations);
        if (data.mitigations && data.mitigations.length > 0) {
          setSelectedMitigationId(data.mitigations[0].id);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadGraph(activeScenarioId);
    runSimulation(activeScenarioId);
  }, [activeScenarioId]);

  // Demo Step controller
  const handleSelectStep = (index: number) => {
    setCurrentDemoStepIndex(index);
    if (index === 1) setViewMode('topology');
    if (index === 2 || index === 3) setViewMode('attack');
    if (index === 4) setViewMode('safe');
  };

  // Auto-play demo timer
  useEffect(() => {
    let timer: any;
    if (isDemoPlaying) {
      timer = setInterval(() => {
        setCurrentDemoStepIndex((prev) => {
          const next = (prev + 1) % DEMO_STEPS.length;
          handleSelectStep(next);
          return next;
        });
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isDemoPlaying]);

  // Mitigation selection & Safe Path Replay
  const handleSelectMitigation = (mitigation: MitigationOption) => {
    setSelectedMitigationId(mitigation.id);
    setIsMitigationApplied(true);
    setViewMode('safe');

    fetch('/api/ripple-breaker/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: activeScenarioId,
        target_node: simulation?.target.id || 'pkg_event_stream',
        mitigation_id: mitigation.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setNeutralizedEdges(data.neutralized_edges);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={(id) => {
          setActiveScenarioId(id);
          setIsMitigationApplied(false);
        }}
        graphHealth={graphHealth}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenHealth={() => setIsHealthOpen(true)}
        backendConnected={backendConnected}
      />

      {/* 2-Minute Butterfly Effect Demo Narrative Bar */}
      <DemoNarrativeBar
        currentStepIndex={currentDemoStepIndex}
        onSelectStep={handleSelectStep}
        isPlaying={isDemoPlaying}
        onTogglePlay={() => setIsDemoPlaying(!isDemoPlaying)}
        onReset={() => {
          setCurrentDemoStepIndex(0);
          setIsDemoPlaying(false);
          setViewMode('attack');
          setIsMitigationApplied(false);
        }}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1920px] mx-auto w-full">
        {/* Left Column: Digital Twin Topology Graph Canvas & Timeline (7 cols) */}
        <section className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex-1 min-h-[520px]">
            <DigitalTwinCanvas
              nodes={nodes}
              edges={edges}
              simulation={simulation}
              selectedNodeId={selectedNode?.id || null}
              onSelectNode={(node) => {
                setSelectedNode(node);
                runSimulation(activeScenarioId, node.id);
              }}
              viewMode={viewMode}
              onSetViewMode={setViewMode}
              neutralizedEdges={neutralizedEdges}
            />
          </div>

          {/* Supply-Chain Time Machine Timeline Slider */}
          <TimeMachineBar onTimeChange={(snapId) => console.log('Time machine snapshot:', snapId)} />
        </section>

        {/* Right Column: Killer Summary Card, Ripple Breaker & AI Analyst (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          {/* Flagship Killer Summary Card */}
          <KillerSummaryCard
            simulation={simulation}
            risk={risk}
            mitigations={mitigations}
            onSelectMitigation={handleSelectMitigation}
            selectedMitigationId={selectedMitigationId}
          />

          {/* Ripple Breaker Mitigation Optimizer */}
          <RippleBreakerPanel
            mitigations={mitigations}
            selectedMitigationId={selectedMitigationId}
            onApplyMitigation={handleSelectMitigation}
            isApplied={isMitigationApplied}
          />

          {/* Evidence-Grounded AI Analyst Panel */}
          <AiAnalystPanel explanation={aiExplanation} loading={!aiExplanation} />
        </section>
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newScenarioId) => {
          setScenarios([
            ...scenarios,
            { id: newScenarioId, name: 'Custom Uploaded Manifest', description: 'Uploaded package.json', target_node: 'pkg_custom_1' },
          ]);
          setActiveScenarioId(newScenarioId);
        }}
      />

      <SbomHealthModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} health={graphHealth} />
    </div>
  );
}
