import React, {
    useRef,
    useState,
    useImperativeHandle,
    forwardRef,
} from 'react';
import { type Note } from '../stores/useNoteStore';
import { useForceSimulation, type SimNode } from '../hooks/useForceSimulation';

interface ForceGraphProps {
    notes: Note[];
    activeNoteId: string | null;
    onNodeClick: (note: Note) => void;
    width: number;
    height: number;
    filterNoteId?: string | null;
}

export interface ForceGraphHandle {
    resetView: () => void;
}

export const ForceGraph = forwardRef<ForceGraphHandle, ForceGraphProps> (
    ({ notes, activeNoteId, onNodeClick, width, height, filterNoteId },
        ref) => {
            const { nodes, edges, dragNode } = useForceSimulation ({
                width,
                height,
                notes,
                filterNoteId,
            });

            const [vt, setVt] = useState({ x:0, y:0, scale:1 });
            const [draggingNodeId, setDraggingNodeId] = useState<string | null>
            (null);
                const [isPanning, setIsPanning ] = useState(false);
                const [panStart, setPanStart] = useState({ mx:0,  my:0, tx:0, ty:0 });
                
                const [hoveredId, setHoveredId] = useState<string | null>(null);
                const dragStartRef = useRef<{ x:number; y: number } | null>(null);
                const svgRef = useRef<SVGSVGElement>(null);

                useImperativeHandle(ref, () => ({
                    resetView: () => setVt({ x:0, y:0, scale: 1 }),
                }));

                const getSVGCoords = (e: React.MouseEvent) => {
                    const rect = svgRef.current!.getBoundingClientRect();
                    return {x: e.clientX - rect.left, y: e.clientY - rect.top };
                };
                
                const toWorld = (sx: number, sy: number) => ({
                    x: (sx-vt.x) / vt.scale,
                    y: (sy - vt.y) / vt.scale,
                });

                const handleWheel = (e: React.WheelEvent) => {
                    e.preventDefault();
                    const { x, y } = getSVGCoords(e);
                    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
                    const newScale = Math.max(0.1, Math.min(6, vt.scale * factor));
                    setVt ({
                        scale: newScale,
                        x: x - (x - vt.x) * (newScale / vt.scale ),
                        y: y - (y - vt.y) * (newScale / vt.scale),
                    });
                };

                const handleSVGMouseDown = (e: React.MouseEvent) => {
                    const target = e.target as Element;
                    if (target.closest('[data-node]')) return;
                    const { x, y } = getSVGCoords(e);
                    setIsPanning(true);
                    setPanStart( { mx: x, my: y, tx: vt.x, ty: vt.y });
                    dragStartRef.current = { x: e.clientX, y: e.clientY };
                }; 

                const handleMouseMove = (e: React.MouseEvent) => {
                    const { x, y } = getSVGCoords(e);
                    if (draggingNodeId) {
                        const w = toWorld(x, y);
                        dragNode(draggingNodeId, w.x, w.y);
                    } else if (isPanning) {
                        setVt((prev) => ({
                            ...prev,
                            x: panStart.tx + (x - panStart.mx),
                            y: panStart.ty + (y - panStart.my),
                        }));
                    }
                };

                const handleMouseUp = () => {
                    if (draggingNodeId) {
                        dragNode(null);
                        setDraggingNodeId(null);
                    }
                    setIsPanning(false);
                };

                const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) =>
                {
                    e.stopPropagation();
                    setDraggingNodeId(nodeId);
                    dragStartRef.current = { x: e.clientX, y: e.clientY };
                };

                const handleNodeClick = (e: React.MouseEvent, node: SimNode) => {
                    e.stopPropagation();
                    if (!dragStartRef.current) return;
                    const dx = e.clientX - dragStartRef.current.x;
                    const dy = e.clientY - dragStartRef.current.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 5) onNodeClick(node.note);
                };

                const nodeR = (n: SimNode) =>
                    Math.max(6, Math.min(18, 6 + Math.sqrt(n.linkCount) * 3));

                const nodeColor = (n: SimNode) => {
                    if (n.id === activeNoteId) return '#38bdf8';
                    if (n.linkCount > 0 ) return '#6366f1';
                    return '#475569';
                };

                const showLabel = (n: SimNode) => 
                    n.id === hoveredId || n.id === activeNoteId || nodes.length <=25;

                return (
                    <svg 
                        ref={svgRef}
                        width={width}
                        height={height}
                        className="select-none"
                        style={{ cursor: isPanning ? 'grabbing' : 'grab'}}
                        onWheel = {handleWheel}
                        onMouseDown={handleSVGMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        >
                            <defs>
                                <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
                                <stop offset="0%" stopColor ="#0d1525" />
                                <stop offset="100%" stopColor="#060c16" />
                                </radialGradient>
                            </defs>
                            <rect width={width} height={height} fill="url(#bgGrad)" />

                            <g transform={`translate(${vt.x},${vt.y}) scale(${vt.scale})`}>
                                {edges.map((edge, i) => {
                                    const s = nodes.find((n) => n.id === edge.source);
                                    const t = nodes.find((n) => n.id === edge.target);
                                    if (!s || !t) return null;
                                    const isActive =
                                        s.id === activeNoteId || t.id === activeNoteId;
                                        return (
                                            <line 
                                                key = {i}
                                                x1={s.x}
                                                y1={s.y}
                                                x2={t.x}
                                                y2={t.y}
                                                stroke={isActive ? '#38bdf8' : '#1e3a5f'}
                                                strokeWidth={isActive ? 1.5 : 1}
                                                strokeOpacity={isActive ? 0.8 : 0.45 }
                                                />
                                        );
                                    })}

                                    { nodes.map((node) => {
                                        const r = nodeR(node);
                                        const isActive = node.id === activeNoteId;
                                        const isHovered = node.id === hoveredId;
                                        const color = nodeColor(node);
                                        return (

                                            <g 
                                                key={node.id}
                                                data-node="true"
                                                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                                onClick={(e) => handleNodeClick(e, node)}
                                                onMouseEnter={() => setHoveredId(node.id)}
                                                onMouseLeave={() => setHoveredId(null)}
                                                style={{ cursor: 'pointer'}}
                                                >
                                                    {isActive && (
                                                        <circle 
                                                            cx={node.x}
                                                            cy={node.y}
                                                            r={r + 7}
                                                            fill="none"
                                                            stroke = "#38bdf8"
                                                            strokeWidth={1.5}
                                                            opacity={0.25}
                                                            />
                                                    )}
                                                    <circle
                                                        cx={node.x}
                                                        cy={node.y}
                                                        r={r}
                                                        fill={color}
                                                        stroke={
                                                            isActive ? '#e0f2fe' : isHovered ? '#94a3b8' : '#1e293b'
                                                        }
                                                        strokeWidth={isActive ? 2 : 1}
                                                        opacity={isHovered || isActive ? 1 : 0.82 }
                                                        />
                                                        {showLabel(node) && (
                                                            <text 
                                                                x = {node.x}
                                                                y={node.y + r + 14}
                                                                textAnchor="middle"
                                                                fill={isActive ? '#e0f2fe' : isHovered ? '#cbd5e1' : '#64748b'}
                                                                fontSize={11}
                                                                fontFamily="ui-monospace, monospace"
                                                                style={{ pointerEvents: 'none', userSelect: 'none' 

                                                                }}
                                                                    > 
                                                                        {node.title.length > 22
                                                                            ? node.title.slice(0, 20) + '…'
                                                                            : node.title }
                                                                            </text>
                                                        )}
                                                                    {isHovered && nodes.length > 25 && (
                                                                        <>
                                                                            <rect 
                                                                                x={node.x + 12}
                                                                                y={node.y - 14}
                                                                                width = {Math.min(node.title.length * 7 + 12, 220)}
                                                                                height={22}
                                                                                rx={3}
                                                                                fill="#1e293b"
                                                                                stroke="#334155"
                                                                                strokeWidth={1}
                                                                                />
                                                                                <text 
                                                                                    x={node.x + 18}
                                                                                    y={node.y + 2}
                                                                                    fill="#e2e8f0"
                                                                                    fontSize={11}
                                                                                    fontFamily="ui-monospace, monospace"
                                                                                    style={{ pointerEvents: 'none'}}
                                                                                    >
                                                                                        {node.title}
                                                                                        </text>
                                                                                        </>
                                                                    )}
                                                                    </g>
                                        );
                                    })}
                                    </g>

                                    {/* Legend */}
                                    <g transform= {`translate(12, ${height - 72})`}>
                                        <rect width={148} height={64} rx={6} fill="#0f172a"
                                        fillOpacity={0.8} stroke="#1e293b" strokeWidth={1} />

                                        {[
                                            { color: '#38bdf8', label: 'Active note' },
                                            { color: '#6366f1', label: 'Has connections'},
                                            { color: '#475569', label: 'Orphan note'},
                                        ].map(({ color, label }, i ) => (
                                            <g key={label} transform={`translate(10, ${14 + i * 18})`}>
                                                <circle r={5} fill={color} />
                                                <text x = {14} y ={4} fill="#94a3b8" fontSize={11}
                                                fontFamily="ui-monospace, monospace">
                                                    {label}
                                                    </text>
                                                    </g>
                                        ))}
                                        </g>
                                        </svg>
                );
            }
        );

        ForceGraph.displayName = 'ForceGraph';