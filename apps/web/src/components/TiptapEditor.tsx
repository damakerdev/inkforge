// discontinued using tiptap, using react-markdown for now. may use it later in v0.2



import React, { useEffect, useState} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { useNoteStore } from '../stores/useNoteStore';
import { WikilinkSuggest } from './WikilinkSuggest';


export const TiptapEditor: React.FC = () => {
  const { activeNote, saveActiveNote } = useNoteStore();
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestQuery, setSuggestQuery] = useState('');


  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
    ],
    content: activeNote?.content || '',
    onUpdate: ({ editor }) => {
      const currentActive = useNoteStore.getState().activeNote;
      if (currentActive) {
        const mdOutput = (editor.storage as any).markdown.getMarkdown();
        saveActiveNote(currentActive.title, mdOutput);


        // Detect [[ typing trigger for wikilink autocomplete
        const match = mdOutput.match (/\[\[([^\]]*)$/);
        if (match) {
          setShowSuggest(true);
          setSuggestQuery(match[1]);
      } else {
        setShowSuggest(false);
      }
    }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[50vh] text-neutral-200 font-sans prose prose-invert max-w-none p-4',
      },
    },
  });

  // Sync editor content when switching active notes in the sidebar
  useEffect(() => {
    if (editor && activeNote) {
      const currentMd = (editor.storage as any).markdown.getMarkdown();
      if (activeNote.content !== currentMd) {
        editor.commands.setContent(activeNote.content || '');
      }
    }
  }, [activeNote?.id,editor]);


  // Handle selecting a note title from the WikilinkSuggest dropdown
  const handleSelectWikilink =(selectedTitle: string) => {
    if (!editor || !activeNote ) return;
    const currentMd = (editor.storage as any).markdown.getMarkdown();
    const updatedMd = currentMd.replace(/\[\[([^\]]*)$/, `[[{$selectedTitle}]] `);

    editor.commands.setContent(updatedMd);
    saveActiveNote(activeNote.title,updatedMd);
    setShowSuggest(false);
  };

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950 text-neutral-500 font-mono text-sm">
        Select a note or create a new one to start writing.
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col h-full bg-neutral-950 p-6 overflow-hidden">
      {/* Floating Wikilink Autocomplete Dropdown */}
      {showSuggest && (
        <WikilinkSuggest query={suggestQuery} onSelect={handleSelectWikilink} />
      )}
      
      {/* Note Title Input */}
      <input 
      type="text"
      value={activeNote.title}
      onChange={(e) => saveActiveNote(e.target.value, activeNote.content)}
      placeholder="Untitled Note"
      className="text-3xl font-bold bg-transparent border-none outline-none mb-4 text-neutral-100 placeholder-neutral-600 w-full"
      />

    {/* Split Pane: WYSIWYG Editor vs Raw Mardown View */}
    <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
      {/* Rich Text Editor */}
      <div className="border border-neutral-800 rounded-lg bg-neutral-900/30 flex flex-col overflow-hidden">
        <div className="bg-neutral-900/80 px-4 py-2 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase tracking-wider shrink-0 flex justify-between">
          <span>rich text editor</span>
          <span className="text-sky-400 lowercase">editable / WYSIWYG</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>

      {/* Live Raw Markdown Sync */}
      <div className="border border-neutral-800 rounded-lg bg-neutral-950 flex flex-col overflow-hidden">
        <div className="bg-neutral-900/80 px-4 py-2 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase tracking-wider shrink-0 flex justify-between">
          <span>raw markdown</span>
          <span className="text-emerald-500 lowercase">live sync</span>
        </div>
        <pre className="p-4 text-xs font-mono text-neutral-400 whitespace-pre-wrap break-words overflow-y-auto flex-1 select-text">
          {activeNote.content}
        </pre>
      </div>
    </div>
    </div>
  );
};