import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
const dom=new JSDOM('<!doctype html><html><body><div id="test-root"></div></body></html>',{url:'http://localhost:5173/',pretendToBeVisual:true});
for(const key of ['window','document','navigator','HTMLElement','HTMLDialogElement','Element','Node','Event','MouseEvent','CustomEvent','MutationObserver','getComputedStyle'])Object.defineProperty(globalThis,key,{value:typeof dom.window[key]==='function'&&key==='getComputedStyle'?dom.window[key].bind(dom.window):dom.window[key],configurable:true,writable:true});
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
window.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
globalThis.matchMedia=window.matchMedia;
globalThis.IntersectionObserver=class{observe(){}disconnect(){}unobserve(){}};
globalThis.ResizeObserver=class{observe(){}disconnect(){}unobserve(){}};
window.scrollTo=()=>{};
// These adapters test React state and cleanup only, not the browser's native focus trap.
HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{const {run}=await server.ssrLoadModule('/scripts/interactions.jsx');console.log(await run());}
finally{await server.close();dom.window.close();}
