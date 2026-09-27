import React, {useState, useEffect, useRef } from 'react';
import { useNoteStore } from '../stores/useNoteStore';
import {
    Search,
    FileText,
    Plus,
    Network,
    Download,
    Trash2,
    Hash,
} from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenGraph: () => void;
    onOpenExport: () => void;
}

interface Command {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    group: 'action' | 'note';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    onOpenGraph,
    onOpenExport,
}) => {
    const { notes, setActiveNote, createNote, deleteNote, activeNote } = 
    useNoteStore();
    const [query, setQuery] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect (() => {
        if (isOpen) {
            setQuery('');
            setSelectedIdx(0);
            setTimeout(() => inputRef.current?.focus() , 10);
        }
    }, [isOpen]);

    const actionCommands: Command[] = [
        {
            id: 'new-note',
            label: 'New Note',
            description: 'Create a blank note',
            icon: <Plus className="w-4 h-4 text-sky-400 " />,
            action: () => {
                createNote();
                onClose();
            },
            group: 'action',
        },
        {
            id: 'open-graph',
            label: 'Open Graph View',
            description: 'Visualise your knowledge graph',
            icon: <Network className="w-4 h-4 text-indigo-400" />,
            action: () => {
                onOpenGraph();
                onClose();
            },
            group: 'action',
        },
        {
            id: 'export',
            label: 'Export Notes',
            description: 'Download as Markdown or JSON',
            icon: <Download className = "w-4 h-4 text-emerald-400" />,
            action: () => {
                onOpenExport();
                onClose();
            },
            group: 'action',
        },
        ...(activeNote
            ? [
                {
                    id: 'delete-active',
                    label: `Delete "${activeNote.title}"`,
                    description: 'Permanently delete the active note',
                    icon: <Trash2 className="w-4 h-4 text-red-400" />,
                    action: () => {
                        deleteNote(activeNote.id);
                        onClose();
                    },
                    group: 'action' as const,
                },
            ]
            : [] ),
        ];


        const noteCommands: Command[] = notes.map((note) => ({
            id: `note-${note.id}`,
            label: note.title || 'Untitled',
            description: `Open note · ${note.updatedAt}`,
            icon: <FileText className="w-4 h-4 text-neutral-400" />,
            action: () => {
                setActiveNote(note);
                onClose();
            },
            group: 'note' as const,
        }));

        const allCommands = [...actionCommands, ...noteCommands];

        const filtered = query.trim()
            ? allCommands.filter(
                (c) =>
                    c.label.toLowerCase().includes(query.toLowerCase()) ||
                    c.description.toLowerCase().includes(query.toLowerCase())
)
: allCommands;

const canCreateNew = 
    query.trim() &&
    !notes.some((n) => n.title.toLowerCase() === 
query.trim().toLowerCase());

useEffect(() => setSelectedIdx(0), [query]);

useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.children[selectedIdx] as HTMLElement;
    selected?.scrollIntoView({ block: 'nearest'});
}, [selectedIdx]);

const handleKeyDown = (e: React.KeyboardEvent) => {
    const total = filtered.length + (canCreateNew ? 1 : 0);
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i+1, total-1));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i-1,0));
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIdx < filtered.length) {
            filtered[selectedIdx]?.action();
        } else if (canCreateNew) {
            createNote({ title: query.trim() });
            onClose();
        }
    } else if (e.key === 'Escape') {
        onClose();
    }
};

if (!isOpen) return null;

return (
    <div 
        className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex items-start justify-center pt-28"
        onClick={onClose}
        >
            <div 
                className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                >

                    <div className="flex items-center px-4 py-3 border-b border-neutral-800 gap-2.5">
                        <Search className = "w-4 h-4 text-neutral-400 shrink-0" />
                        <input 
                            ref={inputRef}
                            type="text"
                            placeholder="Search notes or type a command..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent text-neutral-100 text-sm placeholder-neutral-500 focus:outline-none"
                            />
                            <kbd className= "text-xs text-neutral-600 font-mono bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                                esc 
                                </kbd>
                                </div>

                                <div ref={listRef} className="max-h-96 overflow-y-auto py-1">
                                    {filtered.length === 0 && !canCreateNew && (
                                        <p className="p-4 text-sm text-neutral-500 text-center font-mono">
                                            No results.
                                            </p>
                                    )}

                                    {filtered.map((cmd, idx ) => (
                                        <button
                                            key={cmd.id}
                                            onClick={cmd.action}
                                            onMouseEnter={() => setSelectedIdx(idx)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                                                idx === selectedIdx
                                                    ? 'bg-sky-600/20 text-sky-200'
                                                    : 'text-neutral-300 hover:bg-neutral-800'
                                            }`}
                                            >
                                                <span className= "shrink-0">{cmd.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">
                                                        {cmd.label}</div>
                                                        <div className="text-xs text-neutral-500 truncate">
                                                            {cmd.description}
                                                            </div>
                                                            </div>
                                                            {cmd.group === 'note' && (
                                                                <span className="shrink-0 text-xs text-neutral-600 font-mono bg-neutral-800 px-1.5 py-0.5 rounded">
                                                                    note
                                                                    </span>
                                                            )}
                                                            </button>
                                    ))}

                                    {canCreateNew && (
                                        <button
                                            onMouseEnter={() => setSelectedIdx(filtered.length)}
                                            onClick={() => {
                                                createNote({ title: query.trim() });
                                                onClose();
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                                                selectedIdx === filtered.length
                                                ? 'bg-sky-600/20 text-sky-200'
                                                : 'text-neutral-300 hover:bg-neutral-800'
                                            }`}
                                            >
                                                <Hash className = "w-4 h-4 text-sky-400 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        Create note "{query.trim()}"
                                                        </div>
                                                        <div className = "text-xs text-neutral-500">
                                                            New note with this title 
                                                            </div>
                                                            </div>
                                                            </button>
                                    )}
                                    </div>

                                    <div className="px-4 py-2 border-t border-neutral-800 flex gap-4 text-xs text-neutral-600 font-mono">
                                        <span>↑↓ navigate</span>
                                        <span>↵ select</span>
                                        <span>esc close</span>
                                        </div>
                                        </div>
                                        </div>
);
};