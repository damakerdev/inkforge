import React, { useRef, useEffect, useState } from 'react';
import { useNoteStore } from '../stores/useNoteStore';
import { useForceSimulation } from '../hooks/useForceSimulation';

interface LocalGraphPanelProps {
    noteId: string;
}

export const LocalGraphPanel: React.FC<LocalGraphPanelProps> = ({ noteId 
    }) => {
        const { notes, setActiveNote } = useNoteStore();
        const containerRef = useRef<HTMLDivElement>(null);
        const [width, setWidth] = useState(500);
        const HEIGHT = 190;

        useEffect(() => {
            if (!containerRef.current) return;
            const ro  = new ResizeObserver((entries) => {
                setWidth(entries[0].contentRect.width);
            });
            ro.observe(containerRef.current);
            return () => ro.disconnect();
        }, []);

        const { nodes, edges } = useForceSimulation({

            width,
            height: HEIGHT,
            notes,
            filterNoteId: noteId,
        }); 

        return (
            <div ref ={containerRef} className="overflow-hidden bg-neutral-950/30">
                {nodes.length === 0 ? (
                    <div className = "h-[190px] flex items-center justify-center text-xs text-neutral-600 font-mono">
                        No connections yet. Link notes with [[brackets]].
                        </div>
                ) : ( 
                    <svg width={width} height={HEIGHT}>
                        <defs>
                            <radialGradient id="localBg" cx="50%" cy="50%" r="70%">
                                <stop offset="0%" stopColor="#0d1525" />
                                <stop offset="100%" stopColor="#06090f" />
                            </radialGradient>
                            </defs>
                            <rect width = {width} height={HEIGHT} fill="url(#localBg)" />

                            {edges.map((edge, i) => {
                                const s = nodes.find((n) => n.id === edge.source);
                                const t = nodes.find((n) => n.id === edge.target);
                                if (!s || !t) return null;
                                return (
                                    <line 
                                        key={i}
                                        x1={s.x}
                                        y1={s.y}
                                        x2={t.x}
                                        y2={t.y}
                                        stroke="#1e3a5f"
                                        strokeWidth={1}
                                        strokeOpacity={0.7}
                                        />
                                );
                            })}
                            { nodes.map((node) => { 
                                const isActive = node.id === noteId;
                                const r = isActive ? 9 : Math.max(5, 5 + node.linkCount);
                                return (
                                    <g 
                                        key={node.id}
                                        onClick={() => setActiveNote(node.note)}
                                            style={{ cursor : 'pointer'}}
                                            >
                                            {isActive && (
                                                <circle 
                                                    cx = {node.x}
                                                    cy= {node.y}
                                                    r={r + 5}
                                                    fill="none"
                                                    stroke="#38bdf8"
                                                    strokeWidth={1.5}
                                                    opacity={0.25}
                                                    />

                                            )}
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={r}
                                                fill={isActive ? '#38bdf8' : '#6366f1'}
                                                stroke={isActive ? '#e0f2fe': '#1e293b'}
                                                strokeWidth={isActive ? 2 : 1}
                                                />

                                                <text
                                                    x={node.x}
                                                    y={node.y + r + 12 }
                                                    textAnchor="middle"
                                                    fill={isActive ? '#e0f2fe' : '#64748b'}
                                                    fontSize={10}
                                                    fontFamily="ui-monospace, monospace"
                                                    style={{ pointerEvents: 'none', userSelect: 'none'}}
                                                    >
                                                        {node.title.length > 16
                                                            ? node.title.slice(0,14) + '…'
                                                            :  node.title}
                                                            </text>
                                                            </g>
                                                        );
                                                    })}
                                                    </svg>
                                                )}
                                                </div>
                                            );
                                        };