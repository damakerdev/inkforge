import {create } from 'zustand';
import { updateLinks } from '../utils/LinkUpdater';

export interface Note{
    id: string;
    title: string;
    content: string;
    updatedAt: string;
}
interface NoteState {
    notes: Note[];
    activeNoteId: string | null;
    isLoading: boolean;
    activeNote: Note | null;
    fetchNotes:()=>Promise<void>;
    setActiveNoteId: (id:string)=>void;
    setActiveNote: (note: Note | null) => void;
    createNote: (noteData? : {title?: string; content?: string}) => Promise<void>;
    renameNote: (noteId: string, newTitle: string)=>void;
    saveActiveNote: (title: string, content: string) => Promise<void>;
    updateNoteContent: (content: string) =>Promise<void>;
    updateNoteTitle:(title:string)=>Promise<void>;
    deleteNote:(id:string)=> Promise<void>;
    importNotes: (importedNotes: any[]) => Promise<void>;
}

const API_BASE=(import.meta.env.VITE_API_URL||"http://127.0.0.1:8000").replace(/\/+$/,"");
const API=`${API_BASE}/api/v1/notes`;

export const useNoteStore=create<NoteState>((set,get)=> ({
    notes: [],
    activeNoteId: null,
    activeNote: null,
    isLoading: false,

    fetchNotes:async()=>{
        set({isLoading:true});

        try {
            const resp=await fetch(`${API}/`);
            if(resp.ok){
                const data=await resp.json();
                const formattedNotes=data.map((n:any)=>({
                    id:n.id,
                    title:n.title,
                    content:n.content,
                    updatedAt: n.updated_at ? new Date(n.updated_at).toLocaleTimeString() : new Date().toLocaleTimeString(),
                }));

                const currentActiveId = get().activeNoteId;
                const selectedNote = formattedNotes.find((n:Note) => n.id === currentActiveId) || (formattedNotes.length > 0 ? formattedNotes[0]: null );
                set({
                    notes:formattedNotes,
                    activeNoteId:selectedNote ? selectedNote.id : null,
                    activeNote: selectedNote,
                    isLoading:false,
                });
            }
         } catch(error){
            console.error("Failed to fetch notes from backend:",error);
            set({isLoading:false});
        }
    },
    
    setActiveNoteId: (id: string) => {
        const foundNote = get().notes.find((n) => n.id === id) || null;
        set ({ activeNoteId: id, activeNote: foundNote });
    },

    setActiveNote: (note: Note | null) => {
        set({ activeNoteId: note ? note.id: null, activeNote: note });
    },
    
    createNote: async(noteData)=>{
        try{
            const resp=await fetch(`${API}/`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    title: noteData?.title || "Untitled Note",
                    content: noteData?.content || "",
                is_archived: false,
                            }),
            });

            
            if(resp.ok){
                const currnote=await resp.json()
                const newNote: Note = {
                    id: currnote.id,
                    title: currnote.title,
                    content: currnote.content,
                    updatedAt: new Date().toLocaleTimeString(),
                };

                set((state)=>({
                    notes:[newNote,...state.notes],
                    activeNoteId:newNote.id,
                    activeNote: newNote,
                }));
            
            }
        } catch(error){
            console.error("failed to create note: ", error);
        }
    },

    renameNote: async (noteId, newTitle)=>{
        const {notes} = get();
        const currNote= notes.find((n)=>n.id===noteId);
        if(!currNote) return;
        const oldTitle = currNote.title;
        const newTitleTrim= newTitle.trim();
        if(oldTitle.toLowerCase()===newTitleTrim.toLowerCase()) return;

        const updatedNotes= notes.map((note)=>note.id===noteId? {
            ...note,title:newTitleTrim, updatedAt: new Date().toISOString()
        }: note);
        const finalNotes= updateLinks(updatedNotes,oldTitle,newTitleTrim)

        set({notes:finalNotes, activeNote:finalNotes.find((n)=>n.id===get().activeNoteId)|| null})

        try{
            await fetch(`${API}/${noteId}`,{
                method:"PUT",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({title: newTitleTrim}),
            })
            for(const n of finalNotes){
                if(n.id!==noteId){
                    const orig=notes.find((nn)=>nn.id===n.id)
                    if(orig && orig.content !==n.content){
                        await fetch(`${API}/${n.id}`,{
                            method: "PUT",
                            headers: { "Content-Type": "application/json"},
                            body: JSON.stringify({content: n.content})
                        })
                    }
                }
            }
        } catch(err){
            console.error("failed to sync rename and new links to server: ",err);
        }
    },

    saveActiveNote: async (title: string, content: string) => {
        const { activeNoteId, notes } = get();
        if (!activeNoteId) return;

        const updatedNotes = notes.map((note) =>
            note.id === activeNoteId
            ? { ...note,title,content,updatedAt: new Date().toLocaleTimeString() }
            : note
);

const updatedActiveNote = updatedNotes.find((n) => n.id === activeNoteId) || null;

set ({ notes: updatedNotes, activeNote: updatedActiveNote });

try {
    await fetch(`${API}/${activeNoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({title, content }),
    });

} catch (error) {
    console.error("Failed to sync active note to server:", error);
}
    },


    updateNoteContent: async(content: string)=> {
        const{activeNoteId,notes}=get();
        if(!activeNoteId)return

        const updatedNotes = notes.map((note) =>
            note.id === activeNoteId
             ? { ...note, content, updatedAt: new Date().toLocaleTimeString() }
             : note
);

            set({
                notes: updatedNotes,
                activeNote: updatedNotes.find((n) => n.id === activeNoteId) || null,
            });


        try{
            await fetch(`${API}/${activeNoteId}`,{
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({ content }),
            });

        } catch(error){
            console.error("Failed to update content on server",error);
        }
    },

    updateNoteTitle:async(title: string )=>{
        const {activeNoteId,  notes}=get();
        if(!activeNoteId)return;


        const updatedNotes = notes.map((note) => 
            note.id === activeNoteId
            ? { ...note, title, updatedAt: new Date().toLocaleTimeString() }
            : note
);

        set({
            notes: updatedNotes,
            activeNote: updatedNotes.find((n) => n.id === activeNoteId) || null,
                });

        try {
            await fetch(`${API}/${activeNoteId}`,{
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({title}),
            });

        } catch(error){
            console.error("Failed to update title on server",error);
        }
    },

    deleteNote:async(id: string )=>{
        try {
            const res=await fetch(`${API}/${id}`,{method:"DELETE"});
            if(res.ok){
                set((state)=>{
                    const remainingNotes=state.notes.filter((n)=>n.id!==id);
                    const nextActive = remainingNotes.length >0 ? remainingNotes[0] : null;
                    return {
                        notes:remainingNotes,
                        activeNoteId: nextActive ? nextActive.id : null,
                        activeNote: nextActive,
                                   };               
                });
            }
        } catch(error){
            console.error("Failed to delete note on server",error);
        }
    },

    importNotes: async (importedNotes: any[]) => {
        try {
            for(const note of importedNotes) {
                await fetch(`${API}/`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify ({
                        title: note.title || "Imported Note",
                        content: note.content || "",
                        is_archived: false,
                    }),
                });
            }
        await get().fetchNotes();
        } catch (error) {
            console.error("Failed to import notes:", error);
        }
    },
}));