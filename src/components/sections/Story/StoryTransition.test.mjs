import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { circleMask } from './StoryTransition.geometry.js';

let samples=0;
for(const width of [320,390,768,1440,1920])for(const height of [700,900,1080])for(const p of [0,.1,.25,.5,.75,.9,1]){
  const diameter=40+(Math.max(width,height)*2-40)*p;
  const circle={left:width/2-diameter/2,top:height*.05,width:diameter,height:diameter};
  const mask=circleMask(circle,{left:75,top:200}).match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert.equal(mask[0],diameter/2);
  assert(Math.abs(mask[1]+75-width/2)<.001);
  assert(Math.abs(mask[2]+200-(circle.top+diameter/2))<.001);
  samples++;
}
const baseline=JSON.parse(await readFile('src/components/sections/Intro/protected-files.json','utf8'));
let preserved=0;
for(const [file,hash] of Object.entries(baseline)){
  if(['src/App.jsx','src/components/sections/Story/Story.jsx'].includes(file))continue;
  assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),hash,`Unexpected change: ${file}`);preserved++;
}
const reduced=process.argv[2]==='reduced';
const dom=new JSDOM('<!doctype html><body><div id="test-root"></div></body>',{url:'http://localhost:5173/',pretendToBeVisual:true});
for(const key of ['window','document','navigator','HTMLElement','Element','Node','Event','getComputedStyle'])Object.defineProperty(globalThis,key,{value:key==='getComputedStyle'?dom.window[key].bind(dom.window):dom.window[key],configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
globalThis.matchMedia=window.matchMedia=query=>({matches:query.includes('no-preference')?!reduced:query.includes('reduce')?reduced:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
globalThis.ResizeObserver=class{observe(){}disconnect(){}};
window.scrollTo=()=>{};
HTMLElement.prototype.getBoundingClientRect=function(){
  if(this.id==='story-title')return {left:395,top:1385,right:1045,bottom:1585,width:650,height:200};
  return {left:0,top:1100,right:1440,bottom:2180,width:1440,height:1080};
};
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
  const {run}=await server.ssrLoadModule('/src/components/sections/Story/StoryTransition.test.jsx');
  console.log({geometrySamples:samples,preservedFiles:preserved,...await run(reduced),limitation:'Simulated DOM and geometry only; real browser unavailable.'});
}finally{await server.close();dom.window.close();}
