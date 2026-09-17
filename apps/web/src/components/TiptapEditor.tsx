// discontinued using tiptap, using react-markdown for now. may use it later in v0.2

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

interface TiptapEditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const [rawMd, setRawMd] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const mdOutput = (editor.storage as any).markdown.getMarkdown();
      setRawMd(mdOutput);
      onChange(mdOutput);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[50vh] text-neutral-200 font-sans prose prose-invert max-w-none p-4',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const currMd = (editor.storage as any).markdown.getMarkdown();
      if (content !== currMd) {
        editor.commands.setContent(content);
        setRawMd(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
      <div className="border border-neutral-800 rounded-lg bg-neutral-900/30 flex flex-col overflow-hidden">
        <div className="bg-neutral-900/80 px-4 py-2 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase tracking-wider shrink-0 flex justify-between">
          <span>rich text editor</span>
          <span className="text-sky-400 lowercase">editable / WYSIWYG</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>

      <div className="border border-neutral-800 rounded-lg bg-neutral-950 flex flex-col overflow-hidden">
        <div className="bg-neutral-900/80 px-4 py-2 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase tracking-wider shrink-0 flex justify-between">
          <span>raw markdown</span>
          <span className="text-emerald-500 lowercase">live sync</span>
        </div>
        <pre className="p-4 text-xs font-mono text-neutral-400 whitespace-pre-wrap break-words overflow-y-auto flex-1 select-text">
          {rawMd}
        </pre>
      </div>
    </div>
  );
};