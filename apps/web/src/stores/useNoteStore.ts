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
    isLoading: boolean;
    fetchNotes:()=>Promise<void>;
    setActiveNoteId: (id:string)=>void;
    createNote: ()=>Promise<void>;
    updateNoteContent: (content: string) =>Promise<void>;
    updateNoteTitle:(title:string)=>Promise<void>;
    deleteNote:(id:string)=> Promise<void>;
}

const API="http://localhost:8000/api/v1/notes";
export const useNoteStore=create<NoteState>((set,get)=>({
    notes: [],
    activeNoteId: '1',
    isLoading: false,
    fetchNotes:async()=>{
        set({isLoading:true})
        try{
            const resp=await fetch(`${API}/`);
            if(resp.ok){
                const data=await resp.json();
                const formattedNotes=data.map((n:any)=>({
                    id:n.id,
                    title:n.title,
                    content:n.content,
                    updatedAt:new Date(n.updated_at).toLocaleTimeString(),
                }));
                set({
                    notes:formattedNotes,
                    activeNoteId:formattedNotes.length>0?formattedNotes[0].id:null,
                    isLoading:false,
                });
            }
        }
        catch(erorr){
            console.error("failed to fetch notes from backend:",erorr)
            set({isLoading:false})
        }
    },
    setActiveNoteId: (id)=>set({activeNoteId: id}),
    createNote: async()=>{
        try{
            const resp=await fetch(`${API}/`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    tile: "Untitled",
                    content:"# Untitled Note\n\nNever gonna give you up...\nNever gonna let you down...",
                }),
            });
            if(resp.ok){
                const currnote=await resp.json()
                const newNote: Note = {
                    id: currnote.id,
                    title: currnote.title,
                    content: currnote.content,
                    updatedAt: new Date(currnote.updated_at).toLocaleTimeString(),
                };
                set((state)=>({
                    notes:[newNote,...state.notes],
                    activeNoteId:newNote.id,
                }))
            }
        } catch(erorr){
            console.error("failed to create note: ", erorr);
        }
    },
    updateNoteContent: async(content)=>{
        const{activeNoteId,notes}=get();
        if(!activeNoteId)return
        set({
            notes: notes.map((note)=>note.id===activeNoteId? {...note,content,updatedAt:new Date().toLocaleTimeString()}:note),
        })
        try{
            await fetch(`${API}/${activeNoteId}`,{
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({content}),
            })
        } catch(errorr){
            console.error("failed to update content on server",errorr);
        }
    },
    updateNoteTitle:async(title)=>{
        const {activeNoteId,  notes}=get();
        if(!activeNoteId)return;
        set({
            notes:notes.map((note)=>note.id=== activeNoteId?{...note,title,updatedAt:new Date().toLocaleTimeString()} :note),
        })
        try {
            await fetch(`${API}/${activeNoteId}`,{
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({title}),
            })
        } catch(errorr){
            console.error("failed to update title on srver",errorr);
        }
    },
    deleteNote:async(id)=>{
        try {
            const res=await fetch(`${API}/${id}`,{method:"DELETE"})
            if(res.ok){
                set((state)=>{
                    const remaininNote=state.notes.filter((n)=>n.id!==id);
                    return {
                        notes:remaininNote,
                        activeNoteId:remaininNote.length>0? remaininNote[0].id:null,
                    }
                })
            }
        } catch(errorr){
            console.error("failed to delete note on server",errorr);
        }
    },
}));