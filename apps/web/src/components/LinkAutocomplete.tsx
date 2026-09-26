import React, { useState, useEffect} from 'react';
import { useNoteStore } from '../stores/useNoteStore';

interface LinkAutocompleteProps {
    textareaRef: React.RefObject<HTMLTextAreaElement| null>;
    value: string;
    onChange:(newValue:string)=>void;
}

export const LinkAutocomplete: React.FC<LinkAutocompleteProps>= ({
    textareaRef,value,onChange
})=>{
    const {notes}= useNoteStore();
    const [isOpen, setIsOpen]=useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex]= useState(0);
    const [trigPosition, setTrigPosition]=useState<number|null>(null);

    const filteredNotes=notes.filter((note)=>note.title.toLowerCase().includes(query.toLowerCase()))

    useEffect(()=>{
        setSelectedIndex(0);
    },[query]);
    useEffect(()=>{
        const textarea=textareaRef.current;
        if(!textarea) return;
        const handleSelectOrInput=()=>{
            const cursor=textarea.selectionStart;
            const textbeforeCursor=value.slice(0,cursor);
            const lastTrigIdx=textbeforeCursor.lastIndexOf('[[');
            if(lastTrigIdx!==-1){
                const textAfterTrig=textbeforeCursor.slice(lastTrigIdx+2);
                if(!textAfterTrig.includes(']]') && !textAfterTrig.includes('\n')){
                    setTrigPosition(lastTrigIdx);
                    setQuery(textAfterTrig);
                    setIsOpen(true);
                    return;
                }
            }
            setIsOpen(false);
        }
        handleSelectOrInput();
    },[value,textareaRef]);

    useEffect(()=>{
        const textarea=textareaRef.current;
        if(!textarea||!isOpen) return;
        const handleKeyDown=(e: KeyboardEvent) =>{
            if(e.key==='ArrowDown'){
                e.preventDefault()
                setSelectedIndex((prev)=>(prev+1)%filteredNotes.length)
            } else if(e.key==='ArrowUp'){
                e.preventDefault();
                setSelectedIndex((prev)=>(prev-1+filteredNotes.length)%filteredNotes.length)
            } else if(e.key==='Enter'|| e.key==='Tab'){
                e.preventDefault();
                selectNote(filteredNotes[selectedIndex]?.title||query);
            } else if (e.key==='Escape'){
                setIsOpen(false);
            }
        }
        textarea.addEventListener('keydown',handleKeyDown);
        return ()=>textarea.removeEventListener('keydown',handleKeyDown);
    },[isOpen,filteredNotes,selectedIndex,query])

    const selectNote=(title:string)=>{
        const textarea=textareaRef.current;
        if(!textarea|| trigPosition==null) return;
        const cursor=textarea.selectionStart;
        const beforeTrig=value.slice(0,trigPosition);
        const afterCursor = value.slice(cursor);
        const updatedContent = `${beforeTrig}[[${title}]]${afterCursor}`;
        onChange(updatedContent);
        setIsOpen(false);
        setTimeout(() => {
            textarea.focus();
            const newCursorPosn=trigPosition+title.length+4;
            textarea.setSelectionRange(newCursorPosn,newCursorPosn);
        }, 10);
    }

    if(!isOpen) return null;
    return (
        <div className='absolute top-10 left-1/2 -translate-x-1/2 z-50 w-120 max-h-64 overflow-y-auto bg-neutral-900 border-1 border-neutral-800 rounded-md p-1 font-inter text-[15px]'>
            <div className='px-1.5 py-1 text-[13px] text-neutral-500 border-b border-neutral-800 mb-1 flex justify-between  items-center'>
                <span>Link Note</span>
                <span className='font-inter text-neutral-400 text-xs'>esc to close</span>
            </div>

            {filteredNotes.length===0?(
                <div className='p-2 text-neutral-500'>
                    no matching notes. Press <span className='text-neutral-300'>Enter</span> to use "{query}".
                </div>
            ):(
                filteredNotes.map((note,idx)=>(
                    <button key={note.id} onClick={()=>selectNote(note.title)} 
                        onMouseEnter={()=>setSelectedIndex(idx)} 
                        type='button'
                        className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center justify-between ${idx===selectedIndex?'bg-sky-600/30 text-sky-300 font-medium':'text-neutral-300 hover:bg-neutral-800'}`}
                    >
                        <span className='truncate'>{note.title}</span>
                    </button>
                ))
            )}
        </div>
    )
}