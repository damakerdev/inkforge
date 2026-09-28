import React, { useState } from 'react';
import { useNoteStore } from '../stores/useNoteStore';
import { LocalGraphPanel } from './LocalGraphPanel';
import { Link2, GitFork } from 'lucide-react';

export const Backlinks: React.FC = () => {
  const { notes, activeNote, setActiveNote } = useNoteStore();
  const [tab, setTab] = useState<'links' | 'graph'>('links');

  if (!activeNote) return null;

  const referencingNotes = notes.filter((note) => {
    if (note.id === activeNote.id) return false;
    const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(note.content)) !== null) {
      if (match[1].trim().toLowerCase() === activeNote.title.toLowerCase())
        return true;
    }
    return false;
  });

  return (
    <div className="border-t border-neutral-800 bg-neutral-900/40 shrink-0">
      <div className="flex items-center border-b border-neutral-800/60 px-1">
        <button
          onClick={() => setTab('links')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition ${
            tab === 'links'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Link2 className="w-3 h-3" />
          Linked References ({referencingNotes.length})
        </button>
        <button
          onClick={() => setTab('graph')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition ${
            tab === 'graph'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <GitFork className="w-3 h-3" />
          Local Graph
        </button>
      </div>

      {tab === 'links' ? (
        <div className="p-4 min-h-[52px]">
          {referencingNotes.length === 0 ? (
            <p className="text-xs text-neutral-600 italic">
              No notes link here yet. Type{' '}
              <code className="text-neutral-400 bg-neutral-800 px-1 rounded">
                [[
              </code>{' '}
              to link notes.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {referencingNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 rounded text-xs text-sky-400 transition cursor-pointer"
                >
                  {note.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <LocalGraphPanel noteId={activeNote.id} />
      )}
    </div>
  );
};