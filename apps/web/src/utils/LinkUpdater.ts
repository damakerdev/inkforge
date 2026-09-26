import { type Note } from "../stores/useNoteStore";

// helper dat changes the linked note title when the file title is changed
export function updateLinks(
    notes: Note[],
    oldTitle: string,
    newTitle: string
): Note[] {
    if(!oldTitle ||!newTitle|| oldTitle.trim()===newTitle.trim()){
        return notes;
    }
    const trimmedOld=oldTitle.trim();
    const trimmedNew=newTitle.trim();
    const escOld= trimmedOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const linkRegex=new RegExp(`\\[\\[${escOld}(?:\\|([^\\]]+))?\\]\\]`, 'gi');

    return notes.map((note)=>{
        if(!note.content) return note;
        let hasChanges=false;
        const updatedContent=note.content.replace(linkRegex,(_match,alias)=>{
            hasChanges=true;
            if(alias){
                return `[[${trimmedNew}|${alias}]]`;
            }
            return `[[${trimmedNew}]]`;
        })

        if(!hasChanges) return note;
        return {
            ...note, content: updatedContent, updatedAt: new Date().toISOString(),
        }
    })
}
