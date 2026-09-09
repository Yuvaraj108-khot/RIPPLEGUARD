import React, { useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge, SimulationResult } from '../types/rippleguard';
import { ShieldAlert, ShieldCheck, Flame, Eye, Maximize2 } from 'lucide-react';

interface DigitalTwinCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  simulation: SimulationResult | null;
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
  viewMode: 'topology' | 'attack' | 'safe';
  onSetViewMode: (mode: 'topology' | 'attack' | 'safe') => void;
  neutralizedEdges?: Array<{ from: string; to: string }>;
}

interface CanvasNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  nodes,
  edges,
  simulation,
  selectedNodeId,
  onSelectNode,
  viewMode,
  onSetViewMode,
  neutralizedEdges = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CanvasNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle HiDPI screens
    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 600;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Initialize node positions in a nice layout
    const canvasNodes: CanvasNode[] = nodes.map((n, idx) => {
      const angle = (idx / nodes.length) * 2 * Math.PI;
      const radius = n.type === 'application' ? 140 : n.type === 'micro_dependency' ? 220 : 180;
      const centerX = width / 2;
      const centerY = height / 2;

      let baseRadius = 16;
      if (n.type === 'application') baseRadius = 24;
      if (n.type === 'service') baseRadius = 20;
      if (n.type === 'micro_dependency') baseRadius = 14;

      return {
        ...n,
        x: centerX + Math.cos(angle) * radius + (Math.random() * 20 - 10),
        y: centerY + Math.sin(angle) * radius + (Math.random() * 20 - 10),
        vx: 0,
        vy: 0,
        radius: baseRadius,
      };
    });

    let animationFrameId: number;
    let particleOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Force layout calculation
      for (let i = 0; i < canvasNodes.length; i++) {
        for (let j = i + 1; j < canvasNodes.length; j++) {
          const n1 = canvasNodes[i];
          const n2 = canvasNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = n1.radius + n2.radius + 60;
          if (dist < minDist) {
            const force = (minDist - dist) / dist * 0.05;
            n1.vx -= dx * force;
            n1.vy -= dy * force;
            n2.vx += dx * force;
            n2.vy += dy * force;
          }
        }
      }

      // Update positions with dampening
      canvasNodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.85;
        n.vy *= 0.85;

        // Keep inside bounds
        n.x = Math.max(n.radius + 20, Math.min(width - n.radius - 20, n.x));
        n.y = Math.max(n.radius + 20, Math.min(height - n.radius - 20, n.y));
      });

      // Draw Edges
      edges.forEach((e) => {
        const source = canvasNodes.find((n) => n.id === e.from);
        const target = canvasNodes.find((n) => n.id === e.to);
        if (!source || !target) return;

        const isNeutralized = neutralizedEdges.some((ne) => ne.from === e.from && ne.to === e.to);
        const isAffected = simulation?.affected_node_ids.includes(e.from) && simulation?.affected_node_ids.includes(e.to);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (viewMode === 'safe' && isNeutralized) {
          // Neutralized Safe Edge
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 6]);
        } else if (viewMode === 'attack' && isAffected) {
          // Attack Path Edge
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
        } else {
          // Normal Edge
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Particle Ripple Effect
        if (isAffected && viewMode !== 'safe') {
          particleOffset = (particleOffset + 0.3) % 100;
          const t = (particleOffset / 100);
          const px = source.x + (target.x - source.x) * t;
          const py = source.y + (target.y - source.y) * t;

          ctx.beginPath();
          ctx.arc(px, py, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#EF4444';
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Nodes
      canvasNodes.forEach((n) => {
        const isSelected = selectedNodeId === n.id;
        const isTarget = simulation?.target.id === n.id;
        const isAffected = simulation?.affected_node_ids.includes(n.id);

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);

        // Node fill color
        if (n.vulnerable || isTarget) {
          ctx.fillStyle = '#EF4444'; // Red for vulnerable
        } else if (isAffected) {
          ctx.fillStyle = viewMode === 'safe' ? '#10B981' : '#A855F7'; // Purple or Safe Green
        } else if (n.type === 'application') {
          ctx.fillStyle = '#06B6D4'; // Cyan for app
        } else {
          ctx.fillStyle = '#1E293B'; // Dark slate
        }

        ctx.shadowColor = n.vulnerable ? '#EF4444' : isSelected ? '#8B5CF6' : 'transparent';
        ctx.shadowBlur = n.vulnerable || isSelected ? 15 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Border Stroke
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = isSelected ? '#FFFFFF' : n.vulnerable ? '#F87171' : 'rgba(255,255,255,0.3)';
        ctx.stroke();

        // Node Icon/Label inside
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${n.type === 'application' ? '600 11px' : '500 10px'} Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Truncate label for node
        const labelText = n.label.length > 14 ? n.label.substring(0, 12) + '..' : n.label;
        ctx.fillText(labelText, n.x, n.y + n.radius + 14);

        // Draw Version Badge
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '400 9px "JetBrains Mono", monospace';
        ctx.fillText(n.version, n.x, n.y + n.radius + 26);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Canvas Click Handler
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left);
      const clickY = (e.clientY - rect.top);

      const clickedNode = canvasNodes.find((n) => {
        const dx = n.x - clickX;
        const dy = n.y - clickY;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
      });

      if (clickedNode) {
        onSelectNode(clickedNode);
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [nodes, edges, simulation, selectedNodeId, viewMode, neutralizedEdges]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#0A0E17] rounded-2xl border border-cyber-border overflow-hidden flex flex-col">
      {/* Canvas Header / Mode Toggles */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-cyber-card/90 backdrop-blur-md p-1.5 rounded-xl border border-cyber-border text-xs font-mono">
        <button
          onClick={() => onSetViewMode('topology')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
            viewMode === 'topology'
              ? 'bg-cyber-violet text-white font-bold shadow-md shadow-cyber-violet/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Topology Map</span>
        </button>

        <button
          onClick={() => onSetViewMode('attack')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
            viewMode === 'attack'
              ? 'bg-cyber-rose text-white font-bold shadow-md shadow-cyber-rose/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Attack Path View</span>
        </button>

        <button
          onClick={() => onSetViewMode('safe')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
            viewMode === 'safe'
              ? 'bg-cyber-emerald text-white font-bold shadow-md shadow-cyber-emerald/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safe Path Replay</span>
        </button>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 left-4 z-20 bg-cyber-card/80 backdrop-blur-md px-3 py-2 rounded-xl border border-cyber-border text-[11px] font-mono flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-cyber-rose animate-pulse"></span>
          <span className="text-slate-300">Vulnerable Target</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-cyber-cyan"></span>
          <span className="text-slate-300">Application Entry</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-cyber-purple"></span>
          <span className="text-slate-300">Reachable Transitive</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-cyber-emerald"></span>
          <span className="text-slate-300">Patched / Neutralized</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full cursor-pointer flex-1" />
    </div>
  );
};
