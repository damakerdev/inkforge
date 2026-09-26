import React, { useMemo } from 'react';
import { useNoteStore} from '../stores/useNoteStore';
import { extractWikiLinks } from '../utils/markdownParser';
import {Network, X} from 'lucide-react';

interface GraphViewProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ isOpen, onClose }) => {
    const { notes, setActiveNote } = useNoteStore();
    const {nodes, links } = useMemo(() => {
        if (!notes.length) return { nodes: [], links: []};

        const radius = 180;
        const width = 600;
        const height = 400;
        const centerX = width/2;
        const centerY = height/2;

        const nodeList = notes.map((note,idx) => {
            const angle = (idx / notes.length) * 2 * Math.PI;
            return {
                id:note.id,
                title: note.title || 'Untitled',
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                note,
            };
    });

    const edgeList: { x1: number; y1: number; x2: number;y2:number; id:string } [] = [];

    nodeList.forEach((sourceNode) => {
        const extractedTitles = extractWikiLinks(sourceNode.note.content);
        extractedTitles.forEach((linkTitle) => {
            const targetNode = nodeList.find(
                (n) => n.title.toLowerCase() === linkTitle.toLowerCase()
            );

            if (targetNode) {
                edgeList.push ({
                    id: `${sourceNode.id}-${targetNode.id}`,
                    x1: sourceNode.x,
                    y1: sourceNode.y,
                    x2: targetNode.x,
                    y2: targetNode.y,

                });
            }
        });
    });

    return { nodes: nodeList, links: edgeList };
}, [notes]);

if (!isOpen) return null;

return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
            {/* Model Header */}
            <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
            <div className = "flex items-center space-x-3 text-neutral-200">
                <Network className = "w-5 h-5 text-sky-400"/>
                <h2 className="font-merri font-bold text-xl">Knowledge Graph</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition"
                    type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
        </div>
        {/* Graph Canvas Visual */}
        <div className="p-6 flex items-center justify-center bg-neutral-900">
            {nodes.length === 0 ? (
                <div className="text-neutral-500 font-mono text-sm py-12">
                    No notes available to map.
                </div>
            ) : ( 
                <svg width="600" height="400" className="overflow-visible">
                    {/* Edges */}
                    {links.map((link) => (
                        <line
                            key={link.id}
                            x1={link.x1}
                            y1={link.y1}
                            x2={link.x2}
                            y2={link.y2}
                            stroke="#0284c7"
                            strokeWidth="2"
                            strokeOpacity="0.5"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/*nodes */}
                    {nodes.map((node) => (
                        <g
                        key={node.id}
                        onClick={() => {
                            setActiveNote(node.note);
                            onClose();
                        }}
                        className="cursor-pointer group"
                        >
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r="10"
                                className="fill-sky-500 stroke-neutral-900 group-hover:fill-sky-400 transition-colors"
                                strokeWidth="2"
                                />

                                <text 
                                    x={node.x}
                                    y={node.y+25}
                                    textAnchor="middle"
                                    className="fill-neutral-300 group-hover:fill-white text-[13px] font-mono transition-colors pointer-events-none"
                                    >
                                        {node.title}
                                    </text>
                        </g>
                    ))}
                    </svg>
            )}
            </div>
            </div>
            </div>
);
};
