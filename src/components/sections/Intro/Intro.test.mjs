import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { advanceObject, constrainPoint } from './Intro.physics.js';

const folder='src/components/sections/Intro/';
const protectedFiles=JSON.parse(await readFile(folder+'protected-files.json','utf8'));
for(const [file,hash] of Object.entries(protectedFiles)){
  if(file==='src/App.jsx')continue; // Authorized Preloader/Intro wiring only.
  assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),hash,`Outside INTRO changed: ${file}`);
}
let cases=0;
for(const width of [320,375,390,768,1024,1440,1920]){
  const bounds={left:70,right:width-70,top:110,bottom:710};
  const safe={left:width/2-220,right:width/2+220,top:270,bottom:590};
  for(let i=0;i<120;i++){
    const p=constrainPoint({x:((i*137)%2200)-100,y:((i*97)%1100)-50},bounds,safe);
    const state={...p,bounds,safe,vx:(i%2?-1:1)*1500,vy:(i%3?-1:1)*1300};
    for(let j=0;j<240;j++){
      advanceObject(state,1/60);
      assert(state.x>=bounds.left&&state.x<=bounds.right&&state.y>=bounds.top&&state.y<=bounds.bottom);
    }
    assert(Math.abs(state.vx)<1&&Math.abs(state.vy)<1,'Inertia should settle');cases++;
  }
}
assert.deepEqual(constrainPoint({x:720,y:440},{left:40,right:1400,top:80,bottom:800},{left:500,right:900,top:200,bottom:600}),{x:720,y:440},'Central text must not displace an object');
const dom=new JSDOM('<!doctype html><html><body><div id="test-root"></div></body></html>',{url:'http://localhost:5174/',pretendToBeVisual:true});
for(const key of ['window','document','navigator','HTMLElement','Element','Node','Event','MouseEvent','KeyboardEvent','MutationObserver','getComputedStyle'])Object.defineProperty(globalThis,key,{value:key==='getComputedStyle'?dom.window[key].bind(dom.window):dom.window[key],configurable:true,writable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
const mode=process.argv[2]||'desktop';
window.matchMedia=query=>({matches:query.includes('reduce')&&mode==='reduced',addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
globalThis.matchMedia=window.matchMedia;
globalThis.IntersectionObserver=class {observe(){}disconnect(){}};
globalThis.ResizeObserver=class {observe(){}disconnect(){}};
window.scrollTo=()=>{};
HTMLElement.prototype.setPointerCapture=function(id){this.capture=id;};
HTMLElement.prototype.hasPointerCapture=function(id){return this.capture===id;};
HTMLElement.prototype.releasePointerCapture=function(){this.capture=null;};
const width=mode==='mobile'?390:1440;
Object.defineProperty(HTMLElement.prototype,'offsetWidth',{configurable:true,get(){return this.matches('[data-intro-object]')?(width===390?66:100):width;}});
HTMLElement.prototype.getBoundingClientRect=function(){
  if(this.matches('[data-intro-safe]'))return {left:width/2-150,right:width/2+150,top:300,bottom:540,width:300,height:240};
  return {left:0,right:width,top:0,bottom:880,width,height:880};
};
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
  const {run}=await server.ssrLoadModule('/'+folder+'Intro.test.jsx');
  const result={passed:true,mode,protectedFiles:Object.keys(protectedFiles).length-1,physicsCases:cases,...await run()};
  await writeFile(folder+`verification-${mode}.json`,JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{await server.close();dom.window.close();}
