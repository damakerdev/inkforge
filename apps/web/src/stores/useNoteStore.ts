import {create } from 'zustand';

export interface Note{
    id: string;
    title: string;
    content: string;
    updatedAt: string;
}
interface NoteState {
    notes: Note[];
    activeNoteId: string|null;
    setActiveNoteId: (id:string)=>void;
    createNote: ()=>void;
    updateNoteContent: (content: string) =>void;
    updateNoteTitle:(title:string)=>void;
    deleteNote:(id:string)=> void;
}

export const useNoteStore=create<NoteState>((set)=>({
    notes: [
        {
            id:'1',
            title:'Welcome to InkForge :)',
            content: '# Start writing your markdown notes here.',
            updatedAt: new Date().toLocaleTimeString(),
        },
    ],
    activeNoteId: '1',
    setActiveNoteId: (id)=>set({activeNoteId: id}),
    createNote:()=>{
        const newNote: Note={
            id:Date.now().toString(),
            title:'Untitled',
            content: '# Untitled Note\n\nNever gonna give you up...\nNever gonna let you down...',
            updatedAt: new Date().toLocaleTimeString(),
        };
        set((state)=>({
            notes:[newNote,...state.notes],
            activeNoteId:newNote.id,
        }))
    },
    updateNoteContent:(content)=>{
        set((state)=>({
            notes: state.notes.map((note)=>note.id===state.activeNoteId ? {...note, content, updatedAt: new Date().toLocaleTimeString()
            }: note),
        }));
    },
    updateNoteTitle:(title)=>{
        set((state)=>  ({
            notes: state.notes.map((note)=>
            note.id===state.activeNoteId? {...note,title,updatedAt: new Date().toLocaleTimeString()}: ),
        }))
    },
    deleteNote:(id)=>{
        set((state)=>{
            const remainNotes=state.notes.filter((n)=>n.id !== id);
            return{
                notes: remainNotes,
                activeNoteId: remainNotes.length>0? remainNotes[0].id: null,
            }
        })
    },
}));