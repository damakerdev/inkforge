// not using this system now, made remarkLinks which is our own remark extension for links

import React from 'react';
import { useNoteStore } from '../stores/useNoteStore';

export interface Note {
    id: string;
    title: string;
    content: string;
    created_at?: string;
    updated_at?: string;
}

interface WikilinkSuggestProps {
    query: string;
    onSelect: (title: string) => void;
}

export const WikilinkSuggest: React.FC<WikilinkSuggestProps> = ({ query, onSelect}) => {
    const {notes} =useNoteStore();

    const filteredNotes = notes.filter((note: Note) =>
        note.title.toLowerCase().includes(query.toLowerCase())
);

if (filteredNotes.length === 0 ) return null;

return (
    <div className="absolute top-12 left-4 z-50 bg-neutral-900 border border-neutral-700 rounded-md shadow-xl max-h-48 overflow-y-auto w-64 text-xs font-mono">
        <div className="px-3 py-1.5 border-b border-neutral-800 text-neutral-500 uppercase tracking-wider text-[10px]">
            Link Note
        </div>
        {filteredNotes.map((note) => (
            <button 
                key={note.id}
                onMouseDown={(e) => { e.preventDefault(); onSelect(note.title)}}
                className="w-full text-left px-3 py-2 hover:bg-neutral-800 text-neutral-200 border-b border-neutral-800/50 last:border-none transition cursor-pointer flex justify-between items-center"
                type="button"
                >
                    <span className="truncate font-medium"> [[{note.title || 'Untitled Note' }]] </span>
                </button>
        ))}
    </div>
);
};