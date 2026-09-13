import React, { useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge, SimulationResult } from '../types/rippleguard';
import { 
  Eye, 
  Flame, 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw
} from 'lucide-react';

interface DigitalTwinCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  simulation: SimulationResult | null;
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
  viewMode: 'topology' | 'attack' | 'safe';
  onSetViewMode: (mode: 'topology' | 'attack' | 'safe') => void;
  neutralizedEdges?: Array<{ from: string; to: string }>;
  theme?: 'light' | 'dark';
}

interface CanvasNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  width: number;
  height: number;
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
  theme = 'light',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CanvasNode | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [zoom, setZoom] = useState<number>(0.92);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasNodesRef = useRef<CanvasNode[]>([]);
  const isLight = theme === 'light';

  // Calculate clean, well-spaced hierarchical layout anchored DEAD-CENTER
  const computeLayout = (width: number, height: number) => {
    if (nodes.length === 0) return [];

    const isMobile = width < 640;
    const isTablet = width < 1024;
    const cardW = isMobile ? 104 : isTablet ? 120 : 135;
    const cardH = isMobile ? 30 : 34;

    const apps = nodes.filter((n) => n.type === 'application');
    const services = nodes.filter((n) => n.type === 'service');
    const libraries = nodes.filter((n) => n.type === 'library');
    const microDeps = nodes.filter((n) => n.type === 'micro_dependency');

    const result: CanvasNode[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    // Helper to distribute items centered around centerX
    const distributeCentered = (
      items: GraphNode[],
      y: number,
      cW: number,
      cH: number,
      maxSpread: number
    ) => {
      const count = items.length;
      if (count === 0) return;

      if (count === 1) {
        result.push({
          ...items[0],
          x: centerX,
          y,
          targetX: centerX,
          targetY: y,
          vx: 0,
          vy: 0,
          width: cW,
          height: cH,
        });
        return;
      }

      // On mobile or narrow widths, if items exceed 3, split into alternating rows to prevent overlap
      if (isMobile && count > 3) {
        const row1 = items.filter((_, i) => i % 2 === 0);
        const row2 = items.filter((_, i) => i % 2 !== 0);
        distributeCentered(row1, y - 20, cW, cH, maxSpread);
        distributeCentered(row2, y + 20, cW, cH, maxSpread);
        return;
      }

      // Calculate step so items are centered around centerX
      const step = Math.min(maxSpread / (count - 1), 160);
      const totalWidth = step * (count - 1);
      const startX = centerX - totalWidth / 2;

      items.forEach((item, idx) => {
        const x = startX + idx * step;
        result.push({
          ...item,
          x,
          y,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          width: cW,
          height: cH,
        });
      });
    };

    // Calculate vertical tier spacing centered around centerY
    const tierSpacing = Math.min(height * 0.22, isMobile ? 80 : 95);

    // Tier 0: Applications (Top)
    distributeCentered(apps, centerY - tierSpacing * 1.5, cardW + 6, cardH + 2, width * (isMobile ? 0.85 : 0.7));

    // Tier 1: Services (Upper-Mid)
    distributeCentered(services, centerY - tierSpacing * 0.5, cardW, cardH, width * (isMobile ? 0.9 : 0.75));

    // Tier 2: Libraries (Lower-Mid)
    distributeCentered(libraries, centerY + tierSpacing * 0.5, cardW, cardH, width * (isMobile ? 0.95 : 0.85));

    // Tier 3: Micro-dependencies (Bottom)
    distributeCentered(microDeps, centerY + tierSpacing * 1.5, cardW, cardH, width * (isMobile ? 0.85 : 0.6));

    return result;
  };

  // Adjust zoom for mobile screens automatically on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 900;
    if (width < 640) {
      setZoom(0.65);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;
    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 560;
    canvasNodesRef.current = computeLayout(width, height);
  }, [nodes]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.025;
      const width = canvas.parentElement?.clientWidth || 900;
      const height = canvas.parentElement?.clientHeight || 560;

      if (canvas.width !== width * window.devicePixelRatio || canvas.height !== height * window.devicePixelRatio) {
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvasNodesRef.current = computeLayout(width, height);
      }

      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, width, height);

      // Pan & Zoom
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      const canvasNodes = canvasNodesRef.current;

      // Soft physics relaxation
      for (let i = 0; i < canvasNodes.length; i++) {
        const n = canvasNodes[i];
        n.vx += (n.targetX - n.x) * 0.12;
        n.vy += (n.targetY - n.y) * 0.12;
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.65;
        n.vy *= 0.65;
      }

      // 1. Draw Edges
      edges.forEach((edge) => {
        const source = canvasNodes.find((n) => n.id === edge.from);
        const target = canvasNodes.find((n) => n.id === edge.to);
        if (!source || !target) return;

        const isNeutralized = neutralizedEdges.some(
          (ne) => (ne.from === edge.from && ne.to === edge.to) || (ne.from === edge.to && ne.to === edge.from)
        );
        const isAffected =
          simulation?.affected_node_ids.includes(edge.from) && simulation?.affected_node_ids.includes(edge.to);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (viewMode === 'safe' && isNeutralized) {
          ctx.strokeStyle = isLight ? '#059669' : '#10B981';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
        } else if (viewMode === 'attack' && isAffected) {
          ctx.strokeStyle = isLight ? '#DC2626' : '#EF4444';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([]);
        } else if (isAffected) {
          ctx.strokeStyle = isLight ? 'rgba(220, 38, 38, 0.4)' : 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = isLight ? 'rgba(100, 116, 139, 0.2)' : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Energy Particle along affected edge
        if (isAffected && viewMode !== 'safe') {
          const t = (pulseTime * 1.2 + (source.x % 10)) % 1;
          const px = source.x + (target.x - source.x) * t;
          const py = source.y + (target.y - source.y) * t;

          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#DC2626' : '#EF4444';
          ctx.shadowColor = isLight ? '#DC2626' : '#EF4444';
          ctx.shadowBlur = isLight ? 6 : 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 2. Draw Nodes (Sleek Micro-Cards)
      canvasNodes.forEach((node) => {
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isTarget = simulation?.target.id === node.id || node.vulnerable;
        const isAffected = simulation?.affected_node_ids.includes(node.id);
        const isApp = node.type === 'application';

        const cardW = node.width;
        const cardH = node.height;
        const cardX = node.x - cardW / 2;
        const cardY = node.y - cardH / 2;

        // Card Glow
        if (isTarget) {
          ctx.shadowColor = isLight ? 'rgba(220, 38, 38, 0.25)' : 'rgba(239, 68, 68, 0.45)';
          ctx.shadowBlur = isLight ? 10 : 14;
        } else if (isSelected) {
          ctx.shadowColor = isLight ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.5)';
          ctx.shadowBlur = isLight ? 8 : 12;
        }

        // Card Background Fill
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 7);

        if (isLight) {
          if (isTarget) {
            ctx.fillStyle = '#FEF2F2'; // Light red
          } else if (viewMode === 'safe' && isAffected) {
            ctx.fillStyle = '#F0FDF4'; // Light emerald
          } else if (isApp) {
            ctx.fillStyle = '#F0F9FF'; // Light sky
          } else {
            ctx.fillStyle = '#FFFFFF'; // Clean white
          }
        } else {
          if (isTarget) {
            ctx.fillStyle = '#1C1014';
          } else if (viewMode === 'safe' && isAffected) {
            ctx.fillStyle = '#0D1E19';
          } else if (isApp) {
            ctx.fillStyle = '#131A29';
          } else {
            ctx.fillStyle = '#111622';
          }
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Card Border
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 7);
        if (isTarget) {
          ctx.strokeStyle = isLight ? '#EF4444' : '#EF4444';
          ctx.lineWidth = 1.5;
        } else if (isSelected || isHovered) {
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 1.5;
        } else if (viewMode === 'safe' && isAffected) {
          ctx.strokeStyle = isLight ? '#10B981' : '#10B981';
          ctx.lineWidth = 1.2;
        } else if (isApp) {
          ctx.strokeStyle = isLight ? '#BAE6FD' : 'rgba(59, 130, 246, 0.4)';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();

        // Left Status Pip / Dot
        ctx.beginPath();
        ctx.arc(cardX + 11, node.y, 3.5, 0, Math.PI * 2);
        if (isTarget) {
          ctx.fillStyle = '#EF4444';
        } else if (viewMode === 'safe' && isAffected) {
          ctx.fillStyle = '#10B981';
        } else if (isApp) {
          ctx.fillStyle = '#2563EB';
        } else {
          ctx.fillStyle = isLight ? '#94A3B8' : '#64748B';
        }
        ctx.fill();

        // Main Node Label Text
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        if (isLight) {
          ctx.fillStyle = isTarget ? '#991B1B' : '#0F172A';
        } else {
          ctx.fillStyle = isTarget ? '#FCA5A5' : '#F1F5F9';
        }

        let displayLabel = node.label;
        if (displayLabel.includes(':')) {
          const parts = displayLabel.split(':');
          displayLabel = parts[parts.length - 1];
        } else if (displayLabel.startsWith('@') && displayLabel.includes('/')) {
          displayLabel = displayLabel.split('/')[1];
        }
        if (displayLabel.length > 16) {
          displayLabel = displayLabel.substring(0, 15) + '..';
        }
        ctx.fillText(displayLabel, cardX + 20, node.y - 3);

        // Subtext / Version or CVSS
        ctx.font = '500 9px "JetBrains Mono", monospace';
        if (isTarget && node.cvss) {
          ctx.fillStyle = '#EF4444';
          ctx.fillText(`CVSS ${node.cvss}`, cardX + 20, node.y + 8);
        } else {
          ctx.fillStyle = isLight ? '#64748B' : '#94A3B8';
          ctx.fillText(`v${node.version}`, cardX + 20, node.y + 8);
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    // Mouse Events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setMousePos({ x: e.clientX, y: e.clientY });

      const graphX = (mouseX - pan.x) / zoom;
      const graphY = (mouseY - pan.y) / zoom;

      const hovered = canvasNodesRef.current.find((n) => {
        return (
          graphX >= n.x - n.width / 2 &&
          graphX <= n.x + n.width / 2 &&
          graphY >= n.y - n.height / 2 &&
          graphY <= n.y + n.height / 2
        );
      });

      setHoveredNode(hovered || null);

      if (isDraggingRef.current) {
        setPan((prev) => ({
          x: prev.x + (e.clientX - dragStartRef.current.x),
          y: prev.y + (e.clientY - dragStartRef.current.y),
        }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const graphX = (e.clientX - rect.left - pan.x) / zoom;
      const graphY = (e.clientY - rect.top - pan.y) / zoom;

      const clickedNode = canvasNodesRef.current.find((n) => {
        return (
          graphX >= n.x - n.width / 2 &&
          graphX <= n.x + n.width / 2 &&
          graphY >= n.y - n.height / 2 &&
          graphY <= n.y + n.height / 2
        );
      });

      if (clickedNode) {
        onSelectNode(clickedNode);
      } else {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      // Only zoom if Ctrl or Meta is held, otherwise let the user scroll the page naturally!
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        const newZoom = Math.min(Math.max(zoom * factor, 0.45), 2.2);

        // Zoom centered on mouse cursor
        setPan((prev) => ({
          x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
          y: mouseY - (mouseY - prev.y) * (newZoom / zoom),
        }));
        setZoom(newZoom);
      }
    };

    // Touch Event Handlers for Mobile, Tablet, and Touchscreens
    let lastTouchDist = 0;
    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartTime = Date.now();
        touchStartPos = { x: touch.clientX, y: touch.clientY };
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        isDraggingRef.current = true;
      } else if (e.touches.length === 2) {
        isDraggingRef.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        setPan((prev) => ({
          x: prev.x + (touch.clientX - dragStartRef.current.x),
          y: prev.y + (touch.clientY - dragStartRef.current.y),
        }));
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      } else if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastTouchDist > 0) {
          const factor = dist / lastTouchDist;
          const rect = canvas.getBoundingClientRect();
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
          const newZoom = Math.min(Math.max(zoom * factor, 0.4), 2.5);
          setPan((prev) => ({
            x: midX - (midX - prev.x) * (newZoom / zoom),
            y: midY - (midY - prev.y) * (newZoom / zoom),
          }));
          setZoom(newZoom);
        }
        lastTouchDist = dist;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      isDraggingRef.current = false;
      lastTouchDist = 0;
      // Detect tap selection
      if (Date.now() - touchStartTime < 350) {
        const dx = Math.abs(dragStartRef.current.x - touchStartPos.x);
        const dy = Math.abs(dragStartRef.current.y - touchStartPos.y);
        if (dx < 12 && dy < 12) {
          const rect = canvas.getBoundingClientRect();
          const graphX = (touchStartPos.x - rect.left - pan.x) / zoom;
          const graphY = (touchStartPos.y - rect.top - pan.y) / zoom;
          const tapped = canvasNodesRef.current.find((n) => {
            return (
              graphX >= n.x - n.width / 2 &&
              graphX <= n.x + n.width / 2 &&
              graphY >= n.y - n.height / 2 &&
              graphY <= n.y + n.height / 2
            );
          });
          if (tapped) {
            onSelectNode(tapped);
            setHoveredNode(tapped);
          } else {
            setHoveredNode(null);
          }
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [edges, simulation, selectedNodeId, viewMode, neutralizedEdges, pan, zoom, isLight]);

  const handleZoomBtn = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const centerX = (canvas.parentElement?.clientWidth || 800) / 2;
    const centerY = (canvas.parentElement?.clientHeight || 550) / 2;
    const newZoom = Math.min(Math.max(zoom * factor, 0.45), 2.2);
    setPan((prev) => ({
      x: centerX - (centerX - prev.x) * (newZoom / zoom),
      y: centerY - (centerY - prev.y) * (newZoom / zoom),
    }));
    setZoom(newZoom);
  };

  const resetView = () => {
    const w = containerRef.current?.clientWidth || 900;
    setZoom(w < 640 ? 0.65 : 0.92);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[55vh] sm:h-full min-h-[380px] sm:min-h-[520px] enterprise-card rounded-2xl overflow-hidden flex flex-col select-none touch-none"
    >
      {/* Top View Mode & Zoom Controls Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        {/* View Mode Toggle Controls */}
        <div className="flex items-center space-x-1 bg-white/95 dark:bg-[#101520]/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-md dark:shadow-lg pointer-events-auto max-w-[calc(100%-105px)] overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSetViewMode('topology')}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              viewMode === 'topology'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Topology Map"
          >
            <Eye className="w-3.5 h-3.5" />
            <span><span className="hidden xs:inline">Topology </span>Map</span>
          </button>

          <button
            onClick={() => onSetViewMode('attack')}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              viewMode === 'attack'
                ? 'bg-rose-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Attack Cascade Simulation"
          >
            <Flame className="w-3.5 h-3.5" />
            <span><span className="hidden xs:inline">Attack </span>Cascade</span>
          </button>

          <button
            onClick={() => onSetViewMode('safe')}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              viewMode === 'safe'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Neutralized Safe Path"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe Path</span>
          </button>
        </div>

        {/* Zoom / Pan Controls */}
        <div className="flex items-center space-x-0.5 sm:space-x-1 bg-white/95 dark:bg-[#101520]/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-md pointer-events-auto shrink-0">
          <button
            onClick={() => handleZoomBtn(1.15)}
            className="p-1 sm:p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
          <button
            onClick={() => handleZoomBtn(0.85)}
            className="p-1 sm:p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1 sm:p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Reset Camera"
          >
            <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Minimalist Legend */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 bg-white/90 dark:bg-[#101520]/90 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] sm:text-[11px] font-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-300 shadow-sm max-w-[calc(100%-1.5rem)] sm:max-w-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Target</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>App/Service</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Library</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Safe Path</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex-1"
      />

      {/* Floating Hover Card Tooltip */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none p-4 rounded-xl bg-white/95 dark:bg-[#0D121D]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-2xl w-80 max-w-sm text-xs space-y-3"
          style={{
            left: `${Math.min(mousePos.x + 16, typeof window !== 'undefined' ? window.innerWidth - 340 : 800)}px`,
            top: `${Math.max(16, Math.min(mousePos.y - 40, typeof window !== 'undefined' ? window.innerHeight - 240 : 600))}px`,
          }}
        >
          <div className="border-b border-slate-200 dark:border-white/10 pb-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  v{hoveredNode.version}
                </span>
                {hoveredNode.cve && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium truncate">
                    {hoveredNode.cve}
                  </span>
                )}
              </div>
              <span
                className={`shrink-0 px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                  hoveredNode.vulnerable
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}
              >
                {hoveredNode.vulnerable ? 'VULNERABLE' : 'SECURE'}
              </span>
            </div>

            <div className="font-bold text-sm text-slate-900 dark:text-white break-words leading-snug">
              {hoveredNode.label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Type</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {hoveredNode.type.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Transitive Fan-In</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{hoveredNode.transitive_fan_in || 0}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Reachable Apps</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">{hoveredNode.reachable_apps_count || 0}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Criticality</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{hoveredNode.business_criticality || 50}/100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
