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
import { api } from './services/api';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('ecommerce_microservices');
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [graphHealth, setGraphHealth] = useState<GraphHealth | null>(null);

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [mitigations, setMitigations] = useState<MitigationOption[]>([]);
  const [aiExplanation, setAiExplanation] = useState<GroundedAIExplanation | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedMitigationId, setSelectedMitigationId] = useState<string | null>('mit_1');
  const [isMitigationApplied, setIsMitigationApplied] = useState<boolean>(false);
  const [neutralizedEdges, setNeutralizedEdges] = useState<Array<{ from: string; to: string }>>([]);

  const [viewMode, setViewMode] = useState<'topology' | 'attack' | 'safe'>('attack');
  const [currentDemoStepIndex, setCurrentDemoStepIndex] = useState<number>(0);
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);

  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isHealthOpen, setIsHealthOpen] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Synchronize theme with root document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch initial scenarios list via resilient API service
  useEffect(() => {
    let isMounted = true;
    api.getScenarios().then(({ scenarios: data, isBackendLive }) => {
      if (!isMounted) return;
      setScenarios(data);
      setBackendConnected(isBackendLive);
    });

    // Periodic check to detect when cold-starting backend comes online
    const interval = setInterval(() => {
      api.checkHealth().then((isLive) => {
        if (isMounted) setBackendConnected(isLive);
      });
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch active graph topology
  const loadGraph = (scenarioId: string) => {
    api.getGraph(scenarioId)
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
        setGraphHealth(data.graph_health);
      })
      .catch((err) => console.error('Error loading graph:', err));
  };

  // Run compromise simulation
  const runSimulation = (scenarioId: string, targetNode?: string) => {
    api.simulate(scenarioId, targetNode)
      .then((data) => {
        setSimulation(data.simulation);
        setRisk(data.risk);
        setMitigations(data.mitigations);
        setAiExplanation(data.ai_explanations);
        if (data.mitigations && data.mitigations.length > 0) {
          setSelectedMitigationId(data.mitigations[0].id);
        }
      })
      .catch((err) => console.error('Error running simulation:', err));
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

    api.replayMitigation(
      activeScenarioId,
      simulation?.target.id || 'pkg_event_stream',
      mitigation.id
    )
      .then((data) => {
        setNeutralizedEdges(data.neutralized_edges);
      })
      .catch((err) => console.error('Error replaying mitigation:', err));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors">

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
        theme={theme}
        onToggleTheme={toggleTheme}
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
              selectedNodeId={selectedNodeId}
              onSelectNode={(node) => {
                setSelectedNodeId(node.id);
                runSimulation(activeScenarioId, node.id);
              }}
              viewMode={viewMode}
              onSetViewMode={setViewMode}
              neutralizedEdges={neutralizedEdges}
              theme={theme}
            />
          </div>

          {/* Supply-Chain Time Machine Timeline */}
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
