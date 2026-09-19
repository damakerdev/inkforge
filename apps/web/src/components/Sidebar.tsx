import React, { useState } from 'react'
import { useNoteStore } from '../stores/useNoteStore';
import {Note } from '../services/noteService';

export const Sidebar: React.FC = () => {
    const {notes, activeNote, setActiveNote, addNote, deleteNote } = useNoteStore();
    const [searchTerm, setSearchTerm] = useState('');

    //Safeguard against undefined notes array during initial API fetch
    const safeNotes: Note[] = Array.isArray(notes) ? notes: [];

    // Filter notes in real-time by title or body matching search input
    const filteredNotes = safeNotes.filter(
        (note) =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleSelectNote = (note: Note) => {
        if (activeNote?.id !== note.id) {
            setActiveNote(note);
        }
    };
    
    const handleDeleteNote = async (e: React.MouseEvent<HTMLButtonElement>, id:string) => {
        e.stopPropagation();
        e.preventDefault();
        await deleteNote(id);
        };

    return (
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full text-neutral-200">
            {/* Sidebar Header & Add Note Trigger */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <h1 className="font-bold text-lg text-neutral-100 tracking-tight">InkForge</h1>
                <button 
                    onClick={ () => addNote('Untitled Note', '')}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold transition cursor-pointer">
                        +New
                    </button>
            </div>

            {/*Real-time Search Input */}
            <div className="p-3 border-b border-neutral-800">
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                    />
                    </div>

                    {/* Itemized Notes Navigation Tree */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredNotes.length === 0 ? (
                            <p className="p-4 text-xs font-mono text-neutral-500">
                            {searchTerm ? 'No matching notes found.' : 'No notes available.'}
                            </p>
                        ) : (
                         filteredNotes.map((note) => {
                         const isActive = activeNote?.id === note.id;
                         return (
                         <div 
                         key={note.id}
                         onClick = {() => handleSelectNote(note)}
                         className={`p-3 border-b border-neutral-800/50 cursor-pointer flex justify-between items-center group transition  ${
                            activeNote?.id ===  note.id
                            ? 'bg-neutral-800 text-neutral-100 font-medium'
                            : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                            }`}
                            >
                    <div className="truncate flex-1 pr-2">
                            <p className="text-sm truncate"> {note.title || 'Untitled Note' }</p>
                    </div>
                    <button 
                            onClick={(e) => handleDeleteNote(e, note.id)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 text-xs font-bold transition px-1 cursor-pointer"
                            title="Delete note"
                            >
                                X
                            </button>
                        </div>
                        );
})
)}
</div>
</aside>
);
};