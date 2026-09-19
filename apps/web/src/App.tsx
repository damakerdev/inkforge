import React, { useEffect, useState } from 'react';
import { PenTool } from 'lucide-react';
import { useNoteStore } from './stores/useNoteStore';
import {Sidebar } from './components/Sidebar';
import {TiptapEditor} from './components/TiptapEditor';

export default function App(){
  const [backendStatus, setBackendStatus] = useState<string>("Connecting to backend server...");
  const {
    fetchNotes
  }=useNoteStore();

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
          <span className=' text-neutral-500 font-mono'>API STATUS:</span>
          <span className={`flex items-center space-x-1.5 px-2 py-0.5 text-xs rounded-md font-mono border ${backendStatus==='healthy'?'bg-green-900/50 border-green-800 text-green-400':'bg-red-900/50 border-red-800 text-red-400'}`}>{backendStatus.toUpperCase()}</span>
        </div>
      </header>

      <main className='flex-1 overflow-hidden flex w-full'>
        <Sidebar />
        <div className='flex-1 h-full overflow-hidden'>
          <TiptapEditor />
        </div>
      </main>

      <footer className='w-full border-t border-neutral-800 px-6 py-2 text-xs justify-between items-center font-mono text-neutral-600'>
        <span>InkForge v0.1</span>
      </footer>
    </div>
  );
}