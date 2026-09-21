import React from 'react';
import { useNoteStore } from '../stores/useNoteStore';
import {Download, FileText, Code, X} from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose}) => {
    const { notes, activeNote } = useNoteStore();

    if(!isOpen) return null;

    // Helper to trigger browser file download
    const downloadFile = (content: string, filename: string, type:string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 1.Export Active Note as .md
    const handleExportCurrentMarkdown = () => {
        if (!activeNote) return;
        const filename = `${(activeNote.title || 'Untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        downloadFile(activeNote.content, filename, 'text/markdown');
    };

    // 2. Export All Notes as single JSON backup
    const handleExportAllJSON = () => {
        const jsonContent = JSON.stringify(notes, null, 2);
        downloadFile(jsonContent, 'inkforge-notes-backup.json', 'application/json');
      };

      return (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
                   <div className="flex items-center space-x-2 text-neutral-200">
                        <Download className="w-5 h-5 text-sky-400" />
                        <h2 className="font-merri font-bold text-lg"> Export Notes</h2>
                        </div>
                 <button 
                    onClick={onClose}
                    className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
                    type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    </div>
                {/* Export Options Body */}
                <div className="p-6 space-y-4">
                    {/* Active Note Markdown Export */}
                    <button 
                        onClick={handleExportCurrentMarkdown}
                        disabled={!activeNote}
                        className="w-full p-4 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800/80 hover:border-neutral-700 transition flex items-center space-x-4 text-left disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
                        type="button"
                        >
                            <div className="p-2.5 rounded-md bg-sky-950 border border-sky-800/60 text-sky-400 group-hover:scale-105 transition-transform">
                             <FileText className="w-5 h-5" />
                             </div>
                             <div>
                                <div className="text-sm font-semibold text-neutral-200">
                                    Export Current Note (.md)
                                </div>
                                <div className = "text-xs text-neutral-500 font-mono">
                                    {activeNote ? `"${activeNote.title || 'Untitled'}" as raw Markdown` : 'No active note selected'}
                                    </div>
                                </div>
                        </button>
                        {/* All Notes JSON Backup */}
                        <button
                            onClick={handleExportAllJSON}
                            disabled={notes.length === 0}
                            className = "w-full p-4 rounded-lg border border-neutral-800 bg-neutral-800/80 hover:border-neutral-700 transition flex items-center space-x-4 text-left disabled:opacity-40 disabled:cursor-not-allowed  group cursor-pointer"
                            >
                                <div className = "p-2.5 rounded-md bg-emerald-950 border border-emerald-800/60 text-emerald-400 group-hover:scale-105 transition-transform">
                                    <Code className= "w-5 h-5" />
                                    </div>

                                    <div>
                                        <div className="text-sm font-semibold text-neutral-200">
                                            Backup All Notes (.json)
                                        </div>
                                    <div className="text-xs text-neutral-500 font-mono">
                                        Export all {notes.length} notes as a structured JSON file
                                        </div>
                                        </div>
                                            </button>
                                            </div>
                                            </div>
                                            </div>
      );
    };