import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
const dom=new JSDOM('<!doctype html><body></body>',{pretendToBeVisual:true});
for(const name of ['window','document','HTMLElement','Element','SVGElement','getComputedStyle']){
  Object.defineProperty(globalThis,name,{value:name==='getComputedStyle'?dom.window[name].bind(dom.window):dom.window[name],configurable:true});
}
globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
let reduced=false;
globalThis.matchMedia=window.matchMedia=()=>({matches:reduced,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
window.scrollTo=()=>{};
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
  const {initPreloader}=await server.ssrLoadModule('/src/components/Preloader/Preloader.motion.js');
  for(const mode of ['loaded','failed','hung','reduced','unmount']){
    reduced=mode==='reduced';
    globalThis.Image=class{decode(){return mode==='hung'?new Promise(()=>{}):mode==='failed'?Promise.reject(new Error('image unavailable')):Promise.resolve();}};
    const root=document.createElement('div');
    root.innerHTML='<svg><path data-draw d="M0 0L10 10"/></svg>';
    root.querySelector('path').getTotalLength=()=>14;
    document.body.append(root);
    let ready=0,complete=0;
    const cleanup=initPreloader(root,['/test.png'],()=>ready++,()=>complete++);
    if(mode==='unmount')cleanup();
    await new Promise(resolve=>setTimeout(resolve,mode==='hung'?5700:reduced?350:2200));
    assert.equal(ready,mode==='unmount'?0:1,`${mode}: ready exactly once`);
    assert.equal(complete,mode==='unmount'?0:1,`${mode}: overlay removed exactly once`);
    cleanup();root.remove();
    console.log(`PASS preloader ${mode}`);
  }
}finally{
  const {gsap,ScrollTrigger}=await server.ssrLoadModule('/src/motion/scroll.js');
  ScrollTrigger.disable();gsap.ticker.sleep();
  await server.close();dom.window.close();
}
