import { useState, useEffect, useRef, useCallback } from 'react';
import { type Note } from '../stores/useNoteStore';


export interface SimNode {
    id: string;
    title: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    linkCount: number;
    note: Note;
}

export interface SimEdge {
    source: string;
    target: string;
}

interface UseForceSimulationOptions {
    width: number;
    height: number;
    notes: Note[];
    filterNoteId?: string | null;
}

export const useForceSimulation = ({
    width,
    height,
    notes,
    filterNoteId,
    }: UseForceSimulationOptions) => {
        const [nodes, setNodes ] = useState<SimNode[]>([]);
        const [edges, setEdges ] = useState<SimEdge[]>([]);
        const nodesRef = useRef<SimNode[]>([]);
        const edgesRef = useRef<SimEdge[]>([]);
        const frameRef = useRef<number>(0);
        const alphaRef = useRef(1);
        const draggingIdRef = useRef<string | null>(null);

        useEffect(() => {
            if (!notes.length || !width || !height) {
                setNodes([]);
                setEdges([]);
                return;
            }

            const allEdges: SimEdge[] = [];
            const linkCounts: Record<string, number> = {};
            const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

            notes.forEach((note) => {
                const regex = new RegExp(linkRegex.source, 'g');
                let match: RegExpExecArray | null;
                while ((match = regex.exec(note.content)) !== null) {
                    const targetTitle = match[1].trim();
                    const target = notes.find(
                        (n) => n.title.toLowerCase() === targetTitle.toLowerCase()
                    );
                    if (target && target.id !== note.id) {
                        const key = [note.id, target.id ].sort().join('||');
                        if (!allEdges.some((e) => [e.source,
                            e.target].sort().join('||') === key)) {
                                allEdges.push({ source: note.id, target: target.id });
                                linkCounts[note.id] = (linkCounts[note.id] || 0) +1;
                                linkCounts[target.id] = (linkCounts[target.id] || 0) +1;
                            }
                        }
                    }
                });

                let filteredNotes = notes;
                let filteredEdges = allEdges;

                if (filteredNoteId) {
                    const connected = new Set([filteredNoteId]);
                    allEdges.forEach((e) => {
                        if (e.source === filterNoteId) connected.add(e.target);
                        if (e.target === filterNoteId) connected.add(e.source);
                    });
                    filteredNotes = notes.filter((n) => connected.has(n.id));
                    filteredEdges = allEdges.filter(
                        (e) => connected.has(e.source) && connected.has(e.target)
                    );
                }

                const spread = Math.min(width, height) * 0.4;
                const newNodes: SimNode[] = filteredNotes.map((note) => ({
                    id: note.id,
                    title: note.title,
                    x: width / 2 + (Math.random() - 0.5) * spread,
                    y: height / 2 + (Math.random() - 0.5) * spread,
                    vx: 0,
                    vy: 0,
                    linkCount: linkCounts[note.id] || 0,
                    note,
                }));

                nodesRef.current = newNodes;
                edgesRef.current = filteredEdges;
                alphaRef.current = 1;
                setNodes([...newNodes]);
                setEdges([...filteredEdges]);
            }, [notes, width, height, filterNoteId ]);

            useEffect(() => {
                if (!nodesRef.current.length) return;
                let running = true;

                const tick = () => {
                    if(!running || alphaRef.current < 0.004) return;
                    alphaRef.current *=0.97;
                    const a = alphaRef.current;
                    const ns = nodesRef.current.map((n) => ({ ...n }));

                    for (let i = 0; i < ns.length; i++) {
                        if(draggingIdRef.current === ns[i].id) {
                            ns[i].vx = 0;
                            ns[i].vy = 0;
                            continue;
                        }
                        let fx = 0,
                            fy=0;

                        for (let j = 0; j < ns.length; j++ ) {
                            if(i === j) continue;
                            const dx = ns[i].x - ns[j].x;
                            const dy = ns[i].y -ns[j].y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                            const rep = (1800 * a) / (dist * dist);
                            fx += (dx / dist) * rep;
                            fy += (dy / dist ) * rep;
                        }

                        edgesRef.current.forEach((edge) => {
                            if (edge.source !== ns[i].id && edge.target !== ns[i].id) return;
                            const otherId = edge.source === ns[i].id ? edge.target :
                    edge.source;
                            const other = ns.find((n) => n.id === otherId);
                            if(!other) return;
                            const dx = other.x - ns[i].x;
                            const dy = other.y - ns[i].y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                            const idealDist = filterNoteId ? 80 : 120;
                            const spring = (dist - idealDist) * 0.035 * a;
                            fx += (dx /dist) * spring;
                            fy += (dy / dist) * spring;
});
                            fx += (width / 2 - ns[i].x) * 0.018 * a;
                            fy += (height / 2 - ns[i].y) * 0.018 * a;

                            ns[i].vx = (ns[i].vx + fx) * 0.82;
                            ns[i].vy = (ns[i].vy + fy) * 0.82;
                            ns[i].x = Math.max(30, Math.min(width - 30, ns[i].x + ns[i].vx));
                            ns[i].y = Math.max(30, Math.min(height - 30, ns[i].y + ns[i].vy));
}
                            nodesRef.current = ns;
                            setNodes([...ns]);
                            frameRef.current = requestAnimationFrame(tick);
                            return () => {
                                running = false;
                                cancelAnimationFrame(frameRef.current);
                            };
                        }, [edges, width, height, filterNoteId]);

                        const dragNode = useCallback (
                            (id: string | null, x?: number, y?: number ) => {
                                draggingIdRef.current = id;
                                if (id && x !== undefined && y !== undefined) {
                                    nodesRef.current = nodesRef.current.map((n) => 
                                        n.id === id ? { ...n, x, y, vx: 0, vy: 0 } : n
                                    );
                                    alphaRef.current = Math.max(alphaRef.current, 0.3);
                                    setNodes([...nodesRef.current]);
                                }
                            },
                            []
                        );

                        return { nodes, edges, dragNode };
                    };