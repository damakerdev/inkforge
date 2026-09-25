import React from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { remarkLinks } from './remarkLinks';
import { useNoteStore } from '../stores/useNoteStore';

interface EditorProps {
  content: string;
  onChange:(markdown:string)=>void
}

export const MdEditor:React.FC<EditorProps>=({content, onChange})=>{

  const {notes, setActiveNote}=useNoteStore();
  const handleLinkClick=(e: React.MouseEvent,title:string)=>{
    e.preventDefault();
    const targetnote=notes.find(
      (n)=>n.title.toLowerCase()===title.toLowerCase()
    )
    if(targetnote){
      setActiveNote(targetnote)
    } else {
      alert(`note "${title} doesnot exist! :(`);
    }
  }

  return (
    <div className='grid grid-cols-2 h-full w-full overflow-hidden'>
      <div className='bg-neutral-950/30 flex flex-col overflow-hidden h-full pr-1 pt-1'>
        <span className='bg-neutral-950/30 text-[12px] font-inter justify-center rounded border border-neutral-700 mx-3 font-semibold uppercase my-3 px-1.5 py-1.5 flex text-neutral-400'>raw text</span>
      <textarea value={content} 
        onChange={(e)=>onChange(e.target.value)}
        placeholder='type raw markdown text here. (e.g. # header, **bold**,etc)'
        className='flex-1 bg-transparent p-4 pt-4 text-neutral-200 w-full focus:outline-none text-base h-full overflow-y-auto leading-relaxed font-inter resize-none'
      />
      </div>


      <div className='bg-neutral-950/30 flex flex-col overflow-hidden h-full border-l border-neutral-800 pt-1'>
        <span className='bg-neutral-950/30 text-[12px] font-semibold font-inter justify-center rounded border border-neutral-700 mx-3 uppercase my-3 px-1.5 py-1.5 flex text-neutral-400'>markdown preview</span>

        <div className='flex-1 p-4 overflow-y-auto prose prose-invert max-w-none font-inter overflow-hidden pr-1'>
          {/* old code very simple */}
          {/* <ReactMarkdown>{content || "*preview txtt...*"}</ReactMarkdown> */} 

          <div className='flex-1 overflow-y-auto prose prose-invert prose-neutral max-w-none h-full 
            prose-headings:pb-2 
            prose-headings:font-semibold
            prose-headings:hover:underline
            prose-h1:text-3xl
            prose-h1:border-b
            prose-h1:border-neutral-600
            prose-h2:text-2xl
            prose-h2:border-b
            prose-h2:border-neutral-600
            prose-h3:text-xl
            prose-h4:text-lg
            prose-h5:text-base
            prose-h6:text-sm
            prose-p:text-neutral-300
            prose-p:leading-relaxed
            prose-a:text-sky-400
            prose-a:no-underline
            prose-a:hover:underline
            prose-code:px-1.5
            prose-code:py-0.5
            prose-code:text-neutral-200
            prose-code:before:content-none
            prose-code:after:content-none
            prose-pre:border-neutral-800
            prose-pre:border
            prose-pre:border-neutral-800
            prose-blockquote:border-l
            prose-blockquote:border-l-neutral-700
            prose-hr:border-2
            prose-hr:border-neutral-600
            prose-table:text-sm
            prose-th:border-neutral-800
            prose-td:border-neutral-800
          '>
          <Markdown remarkPlugins={[remarkGfm,remarkLinks]} rehypePlugins={[rehypeRaw]} components={{
            img:({node,...props})=>(
              <img
                {...props} style={{display:'inline-block',marginRight:'4px',marginTop:'0px',marginBottom:'0px'}} alt={props.alt||'img'}
              />
            ),
            a: ({ node, ...props})=>{
              const notetitle=props['data-note-title' as keyof typeof props]as string;
              if(props.href?.startsWith('link:')|| notetitle){
                return(
                  <a {...props} className='text-sky-400 hover:underline bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-800/60 font-medium cursor-pointer' onClick={(e)=>handleLinkClick(e,notetitle)}>{props.children}</a>
                )
              }
              return (
              <a {...props} target="_blank" rel="noopener noreferrer" className='text-sky-400 hover:underline'/>
              )
            }
          }}>
            {content||"*nothing to preview yet ;-;*"}
          </Markdown>

          </div>
        </div>

      </div>
    </div>
  )
}