import React from 'react';
import {useNoteStore } from '../stores/useNoteStore';

export const Backlinks: React.FC = () => {
    const {notes, activeNote, setActiveNote } = useNoteStore();

    if(!activeNote) return null;

    //Filter notes that contain a [[WikiLink]] matching activeNote.title
    const referencingNotes = notes.filter((note) => {
        if (note.id === activeNote.id) return false;

        const linkRegex=/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
        let match:RegExpExecArray|null;

        while((match=linkRegex.exec(note.content))!==null){
            const title=match[1].trim();
            if(title.toLowerCase()===activeNote.title.toLowerCase()){
                return true;
            }
        }
        return false;
    
    });

    return (
        <div className="border-t border-neutral-800 bg-neutral-900/50 p-4 text-neutral-300 shrink-0">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Linked References ({referencingNotes.length})
            </h3>
            {referencingNotes.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No notes link to this page yet.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {referencingNotes.map((note) => (
                        <button
                        key={note.id}
                        onClick={() => setActiveNote(note)}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 rounded text-xs text-sky-400 transition cursor-pointer"       
                         type="button"
                         >
                            [[{note.title}]]
                         </button>
                    ))}
        </div>
    )}
    </div>
    );
};