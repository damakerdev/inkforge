import {visit } from 'unist-util-visit';
import type {Root, Text, Link} from 'mdast';

export function remarkLinks() {
    return (tree: Root)=>{
        visit(tree,'text', (node: Text, index,parent)=>{
            if(!parent||index===undefined) return;
            const linkRegex=/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
            const value=node.value;
            const nodes:(Text| Link)[]=[];
            let lastIndex=0;
            let match:RegExpExecArray|null;
            while((match = linkRegex.exec(value)) !=null){
                const title=match[1].trim();
                const displaytxt=match[2]?match[2].trim():title;
                const matchStart=match.index;
                if(matchStart>lastIndex){
                    nodes.push({
                        type:'text',
                        value: value.slice(lastIndex,matchStart)
                    })
                }

                nodes.push({
                    type:'link',
                    url:`link:${encodeURIComponent(title)}`,
                    children:[
                       {
                            type:'text',
                            value: displaytxt,
                        },
                    ],
                    data:{
                        hProperties:{
                            className:['wikilink-item'],
                            'data-note-title':title,
                        },
                    },
                })
                lastIndex=linkRegex.lastIndex;
            }

            if(nodes.length===0) return;

            if(lastIndex<value.length){
                nodes.push({
                    type: 'text',
                    value: value.slice(lastIndex),
                })
            }

            parent.children.splice(index,1,...nodes);

        })
    }
}