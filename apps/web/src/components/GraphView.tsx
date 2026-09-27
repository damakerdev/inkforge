import React, { useRef, useState } from 'react';
import { useNoteStore } from '../stores/useNoteStore';
import {Network, X, ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';
import { ForceGraph, type ForceGraphHandle } from './ForceGraph';

interface GraphViewProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ isOpen, onClose }) => {
    const { notes, setActiveNote, activeNote } = useNoteStore();
    const graphRef = useRef<ForceGraphHandle>(null);
    const [localOnly, setLocalOnly] = useState(false);
    const [showLabels, setShowLabels] = useState(true);


    React.useEffect(()=>{
        if(!isOpen) return;
        const handler =(e: KeyboardEvent)=>{
            if(e.key==='Escape') onClose();
        }; 

        window.addEventListener('keydown',handler);
        return()=> window.removeEventListener('keydown',handler)
    }, [isOpen,onClose]);

    if (!isOpen) return null;
    
    const connectedCount = activeNote
    ? notes.filter((n) => {
        if (n.id === activeNote.id) return false;
        return (   
            n.content.includes(`[[${activeNote.title}]]`) ||
            activeNote.content.includes (`[[${n.title}]]`)
        );
    }).length
    : 0;

    const displayedNotes = 
        localOnly && activeNote 
        ? notes.filter((n) => {
            if (n.id === activeNote.id) return true;
            return (
                n.content.includes(`[[${activeNote.title}]]`) ||
                (activeNote.content.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)
                || []).some(
                    (m) => m.slice(2, -2).toLowerCase() ===
                    n.title.toLowerCase()
                )
            );
        })
        : notes;


return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-3">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/60 shrink-0">
            <div className = "flex items-center gap-3 text-neutral-200">
                <Network className="w-4 h-4 text-sky-400" />
                <h2 className="font-merri font-bold text-lg">Knowledge Graph</h2>
                <span className="text-xs text-neutral-500 font-mono">
                    {displayedNotes.length} notes · {' '}
                    {/* link count shown from sim */}
                    </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick= {() => setLocalOnly((v) => !v)}
                            disabled={!activeNote}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border transition cursor-pointer ${
                localOnly
                  ? 'bg-sky-900/40 border-sky-700 text-sky-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                            } disabled:opacity-40`}
                            >
                                <Filter className="w-3 h-3" />
                                Local ({connectedCount + 1 })
                                </button>

                                <button
                                    onClick={() => graphRef.current?.resetView()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
                                    >
                                        <Maximize2 className="w-3 h-3" />
                                        Reset View 
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
                                            >
                                                <X className = "w-4 h-4" />
                                                </button>
                                            </div>
                                            </div>
        {/* Graph Canvas */}
        <div className="flex-1 overflow-hidden relative">
            {notes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-500 font-mono text-sm">
                    No notes yet. Create some notes and link them with [[brackets]]. </div>
            ) : ( 
                <ForceGraph 
                    ref={graphRef}
                    notes={displayedNotes}
                    activeNoteId={activeNote?.id ?? null}
                    onNodeClick={(note) => {
                        setActiveNote(note);
                        onClose();
                    }}
                    width={window.innerWidth - 80}
                    height={window.innerHeight * 0.9 - 120}
                    filterNoteId={null}
                    />
                )}
                </div>

                {/* Footer controls */}
                <div className="px-5 py-2.5 border-t border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900/40">
                <span className = "text-xs font-mono text-neutral-600">
                    Scroll to zoom · Drag background to pan · Drag nodes to reposition · Click node to open 
                    </span>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                        <span>{displayedNotes.length} nodes </span>
                        </div>
                        </div>
                        </div>
            </div>
            );
        };