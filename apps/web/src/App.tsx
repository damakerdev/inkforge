import React, { useEffect, useState } from 'react';
import { PenTool, Network, Download } from 'lucide-react';
import { useNoteStore } from './stores/useNoteStore';
import {Sidebar } from './components/Sidebar';
import {TiptapEditor} from './components/TiptapEditor';
import { Backlinks } from './components/Backlinks';
import { GraphView } from './components/GraphView';
import {ExportModal} from './components/ExportModal';

export default function App(){
  const [backendStatus, setBackendStatus] = useState<string>("Connecting to backend server...");
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { fetchNotes } =useNoteStore();

  useEffect(()=>{
    fetch('http://127.0.0.1:8000/')
      .then((res)=>res.json())
      .then((data)=>{
        setBackendStatus(`${data.status}`);
      })
      .catch((err)=>{
        setBackendStatus("offline");
        console.error("connection error: ",err);
      });
    fetchNotes()
  },[fetchNotes]);

  return (
    <div className='h-screen w-screen bg-neutral-900 text-neutral-300 flex flex-col justify-between font-inter selection:bg-sky-900 selection:text-white overflow-hidden'>
      <header className='w-full flex justify-between items-center px-6 py-4 border-b border-neutral-800 text-neutral-400'>
        <div className='flex items-center space-x-2'>
          <div className='flex items-center space-x-1.5 px-2 py-1 rounded hover:bg-neutral-800/50 cursor-pointer transition-colors text-neutral-200'>
            <PenTool className='w-6 h-6 text-neutral-100 stroke-[2.25]'/>
            <h1 className='text-2xl font-bold text-neutral-100 font-merri '>InkForge</h1>
          </div>
        </div>
        <div className='flex items-center space-x-2 text-xs'>
          <button 
            onClick={() => setIsGraphOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-200 transition cursor-pointer font-mono"
            type="button"
            >
              <Network className="w-3.5 h-3.5 text-sky-400" />
              <span>Graph View</span>
              </button>
              <button 
                onClick={() => setIsExportOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-200 transition cursor-pointer font-mono"
                type="button"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400"/>
                  <span>Export</span>
                </button>

              <div className='flex items-center space-x-2 text-xs'>
                <span className=' text-neutral-500 font-mono'>API STATUS:</span>
                <span className={`flex items-center space-x-1.5 px-2 py-0.5 text-xs rounded-md font-mono border ${backendStatus==='healthy'?'bg-green-900/50 border-green-800 text-green-400':'bg-red-900/50 border-red-800 text-red-400'}`}>{backendStatus.toUpperCase()}</span>
        </div>
        </div>
      </header>

{/* Main Workspace: Sidebar + Editor + Backlinks */}
      <main className='flex-1 overflow-hidden flex w-full'>
        <Sidebar />
        <div className='flex-1 h-full overflow-hidden flex flex-col'>
          <TiptapEditor />
          <Backlinks/>
        </div>
      </main>

      <footer className='w-full border-t border-neutral-800 px-6 py-2 text-xs justify-between items-center font-mono text-neutral-600'>
        <span>InkForge v0.1</span>
      </footer>

      {/* Modals*/}
      <GraphView isOpen={isGraphOpen} onClose={() => setIsGraphOpen(false)} />
        <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}