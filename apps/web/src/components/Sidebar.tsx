import React, { useState } from 'react'
import { useNoteStore, type Note} from '../stores/useNoteStore';
import { Trash2, Edit2 } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const {notes, activeNote, setActiveNote, createNote:addNote, deleteNote, renameNote} = useNoteStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const safeNotes: Note[] = Array.isArray(notes) ? notes : [];

    const filteredNotes = safeNotes.filter(
        (note) =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectNote = (note: Note) => {
        if(editingNoteId) return;

        if (activeNote?.id !== note.id) {
            setActiveNote(note);
        }
    };
    
    const handleDeleteNote = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        await deleteNote(id);
    };

    const handleRenameStart = (e: React.MouseEvent, note: Note) => {
        e.stopPropagation();
        setActiveNote(note);
        setEditingNoteId(note.id);
        setEditTitle(note.title);
    };

    const handleRenameSave = () => {
        // If we're not editing anything, exit immediately
        if (!editingNoteId) return;

        const edittitleTrim = editTitle.trim();
        const currNote = safeNotes.find((n) => n.id === editingNoteId);

        if (edittitleTrim && currNote && edittitleTrim !== currNote.title) {
            renameNote(editingNoteId, edittitleTrim);
        }

        setEditingNoteId(null);
        setEditTitle('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Blurring the input automatically triggers onBlur, which calls handleRenameSave cleanly
            e.currentTarget.blur();
        } else if (e.key === 'Escape') {
            setEditingNoteId(null);
            setEditTitle('');
        }
    };

    return (
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full text-neutral-200">
            <div className="py-3 px-2 border-b border-neutral-800">
                <div className="flex flex-1 items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search Notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                    />
                    <button 
                        onClick={() => addNote({ title: 'Untitled Note', content: '' })} 
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold transition cursor-pointer"
                    >
                        +New
                    </button>
                </div>
            </div>

            {/* Itemized Notes Navigation Tree */}
            <div className="flex-1 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                    <p className="p-4 text-xs font-mono text-neutral-500">
                        {searchTerm ? 'No matching notes found.' : 'No notes available.'}
                    </p>
                ) : (
                    filteredNotes.map((note) => {
                        const isactive = activeNote?.id === note.id;
                        const isEditing = editingNoteId === note.id;

                        return (
                            <div 
                                key={note.id}
                                onClick={() => handleSelectNote(note)}
                                className={`p-3 border-b border-neutral-800/50 cursor-pointer flex justify-between items-center group transition ${
                                    isactive
                                        ? 'bg-neutral-800 text-neutral-100 font-medium'
                                        : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                                }`}
                            >
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={handleRenameSave}
                                        onKeyDown={handleKeyDown}
                                        onFocus={(e) => e.target.select()}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-transparent text-neutral-100 text-sm focus:outline-none border-b border-sky-500 pb-0.5"
                                    />
                                ) : (
                                    <>
                                        <div className="truncate flex-1 pr-2">
                                            <p className="text-sm truncate">{note.title || 'Untitled Note'}</p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-3 transition">
                                            <button 
                                                onClick={(e) => handleRenameStart(e, note)}
                                                title="Edit note"
                                                className="cursor-pointer text-neutral-500 hover:text-neutral-100 transition"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteNote(e, note.id)}
                                                title="Delete note"
                                                className="cursor-pointer text-neutral-500 hover:text-red-400/80 transition"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
};