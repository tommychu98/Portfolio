import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../../../motion/scroll';

export function useWorkspaceCamera(viewport, plane, scene, selected, mode, index, focusRequested) {
  const [percent, setPercent] = useState(100);
  const camera = useRef({x:0,y:0,scale:1});
  const move = useRef(()=>{}), drag = useRef(null), commands = useRef({}), pose=useRef(null);
  useLayoutEffect(()=>{
    const el=viewport.current, world=plane.current;
    const context=gsap.context(()=>{},el);
    if(pose.current)context.add(()=>gsap.set(world,pose.current));
    let tween;
    const size=()=>({w:el.clientWidth,h:el.clientHeight});
    move.current=(next,animate=true)=>{
      tween?.kill();
      const {w,h}=size(), scale=Math.max(.18,Math.min(2,next.scale));
      const value={scale,x:Math.min(w-80,Math.max(80-scene.size[0]*scale,next.x)),y:Math.min(h-80,Math.max(80-scene.size[1]*scale,next.y))};
      camera.current=value;setPercent(Math.round(scale*100));
      context.add(()=>{tween=gsap.to(world,{...value,duration:animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?.65:0,ease:'power3.out',overwrite:true});});
    };
    const overview=(animate=true,closer=false)=>{
      const {w,h}=size(), scale=Math.min((w-40)/scene.size[0],(h-55)/scene.size[1]);
      const zoom=closer?(w-40)/scene.size[0]*1.2:scale;
      let x=(w-scene.size[0]*zoom)/2,y=(h-scene.size[1]*zoom)/2;
      if(closer){
        const frame=selected.position,fh=28+frame.w*selected.height*selected.crop[3]/(selected.width*selected.crop[2]);
        x=Math.max(16-frame.x*zoom,Math.min(w-16-(frame.x+frame.w)*zoom,x));
        y=Math.max(28-frame.y*zoom,Math.min(h-28-(frame.y+fh)*zoom,y));
      }
      move.current({scale:zoom,x,y},animate);
    };
    const focus=(animate=true)=>{
      const {w,h}=size(), {x,y,w:fw}=selected.position;
      const fh=fw*(selected.height*selected.crop[3])/(selected.width*selected.crop[2])+28;
      const scale=Math.min(w*.74/fw,h*.74/fh,1.5);
      move.current({scale,x:w/2-(x+fw/2)*scale,y:h/2-(y+fh/2)*scale},animate);
    };
    commands.current={overview,focus,zoom:factor=>{
      const {w,h}=size(), prev=camera.current, scale=Math.max(.18,Math.min(2,prev.scale*factor));
      move.current({scale,x:w/2-(w/2-prev.x)*scale/prev.scale,y:h/2-(h/2-prev.y)*scale/prev.scale});
    }};
    const frame=(animate=true)=>mode==='research'&&index===0&&!focusRequested&&el.clientWidth>500?overview(animate,true):focus(animate);
    let previousSize=`${el.clientWidth}:${el.clientHeight}`;
    const observer=new ResizeObserver(()=>{const next=`${el.clientWidth}:${el.clientHeight}`;if(next!==previousSize){previousSize=next;frame(false);}});observer.observe(el);frame();
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const settle=()=>{if(media.matches){tween?.kill();gsap.set(world,camera.current);}};
    media.addEventListener('change',settle);
    return ()=>{observer.disconnect();media.removeEventListener('change',settle);pose.current={x:gsap.getProperty(world,'x'),y:gsap.getProperty(world,'y'),scale:gsap.getProperty(world,'scaleX')};tween?.kill();context.revert();};
  },[viewport,plane,scene,selected,mode,index,focusRequested]);
  return {percent,
    overview:()=>commands.current.overview(),focus:()=>commands.current.focus(),zoom:factor=>commands.current.zoom(factor),
    onPointerDown:event=>{
      if(event.button!==0||event.target.closest('button,a'))return;
      drag.current={...camera.current,startX:event.clientX,startY:event.clientY};
      event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.classList.add('is-panning');
    },
    onPointerMove:event=>{const start=drag.current;if(!start)return;move.current({scale:start.scale,x:start.x+event.clientX-start.startX,y:start.y+event.clientY-start.startY},false);},
    onPointerUp:event=>{drag.current=null;event.currentTarget.classList.remove('is-panning');},
    onKeyDown:event=>{
      if(event.target!==event.currentTarget)return;
      if(event.key==='0'){event.preventDefault();commands.current.overview();}
      else if(['+','=','-'].includes(event.key)){event.preventDefault();commands.current.zoom(event.key==='-'?.8:1.25);}
      else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
        event.preventDefault();const c=camera.current;move.current({...c,x:c.x+(event.key==='ArrowLeft'?80:event.key==='ArrowRight'?-80:0),y:c.y+(event.key==='ArrowUp'?80:event.key==='ArrowDown'?-80:0)});
      }
    },
  };
}
