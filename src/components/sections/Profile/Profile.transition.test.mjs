import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
const reduced=process.argv[2]==='reduced';
const dom=new JSDOM('<!doctype html><body><div id="test-root"></div></body>',{url:'http://localhost:5173/',pretendToBeVisual:true});
for(const key of ['window','document','navigator','HTMLElement','Element','Node','Event','getComputedStyle'])Object.defineProperty(globalThis,key,{value:key==='getComputedStyle'?dom.window[key].bind(dom.window):dom.window[key],configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
window.innerWidth=process.argv[2]==='mobile'?390:1440;window.innerHeight=800;
globalThis.matchMedia=window.matchMedia=query=>({matches:query.includes('no-preference')?!reduced:query.includes('reduce')?reduced:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
window.scrollTo=()=>{};
Object.defineProperty(HTMLElement.prototype,'offsetHeight',{configurable:true,get(){return 900;}});
HTMLElement.prototype.getBoundingClientRect=function(){return {left:0,top:1000,right:1440,bottom:1900,width:1440,height:900};};
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try{const {run}=await server.ssrLoadModule('/src/components/sections/Profile/Profile.transition.test.jsx');console.log(await run(reduced));}
finally{await server.close();dom.window.close();}
