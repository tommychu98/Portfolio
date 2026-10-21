import {useCallback,useLayoutEffect,useRef,useState} from 'react';
import {gsap} from '../../../motion/scroll';
import {deskResearchBackground,deskResearchLayers} from './DeskResearch.data.js';
import DeskResearchFrame from './DeskResearchFrame';
import './DeskResearchCanvas.css';

export default function DeskResearchCanvas({onExpand,layers=deskResearchLayers,backgroundLayers=deskResearchBackground,chapter='desk-research',overviewPadding=0}) {
  const root=useRef(null),viewport=useRef(null),world=useRef(null),api=useRef(null);
  const selectedRef=useRef(null),opener=useRef(null);
  const drag=useRef(null),suppressClick=useRef(false);
  const [selected,setSelected]=useState(null),[hovered,setHovered]=useState(null);
  const [highResolution,setHighResolution]=useState(()=>new Set());
  const select=useCallback((id,trigger)=>{if(trigger)opener.current=trigger;selectedRef.current=id;setSelected(id);setHovered(null);api.current?.preparePrimary(id);api.current?.focus(id,true,true);},[]);
  useLayoutEffect(()=>{
    const el=root.current,stage=world.current,view=viewport.current;
    const stableRaster=chapter==='design'||chapter==='competitive-analysis'||chapter==='user-research'||chapter==='insight-synthesis'||chapter==='ux-strategy-ia';
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const uiImage=el.closest('.diptyque-retro-window')?.querySelector('.figma-workspace-ui');
    const uiReady=uiImage?uiImage.decode().catch(()=>{}):Promise.resolve();
    const context=gsap.context(()=>{},el);
    let camera,moving=false,currentId=null,request=0,alive=true,lastWheelAt=0;
    const frames=[...stage.querySelectorAll('[data-desk-frame]')];
    const surfaces=frames.map(f=>f.querySelector('.desk-frame__surface'));
    const backgroundImages=new Map([...stage.querySelectorAll('[data-background-frame]')].map(frame=>[frame.dataset.backgroundFrame,frame.querySelector('img')]));
    const decoded=new Map(),primaryDecoded=new Map();
    const prepareBackground=id=>{
      if(decoded.has(id))return decoded.get(id);
      const img=backgroundImages.get(id);
      img.src=img.dataset.src;
      const promise=img.decode().then(()=>{img.dataset.ready='true';}).catch(()=>{img.dataset.ready='error';});
      decoded.set(id,promise);return promise;
    };
    const preparePrimary=id=>{
      const layer=layers.find(l=>l.id===id);
      if(!layer?.image||primaryDecoded.has(id))return;
      const image=new Image();image.src=layer.image;
      primaryDecoded.set(id,image.decode().then(()=>{if(alive)setHighResolution(previous=>new Set([...previous,id]));}).catch(()=>{}));
    };
    // Predecode the complete swept viewport before flying. Loaded backgrounds
    // stay mounted, so turning or interrupting a flight cannot pop them out.
    const preparePath=(start,target,minScale)=>{
      const halfW=size.w/(2*minScale)*1.15,halfH=size.h/(2*minScale)*1.15;
      const left=Math.min(start.cx,target.cx)-halfW,right=Math.max(start.cx,target.cx)+halfW;
      const top=Math.min(start.cy,target.cy)-halfH,bottom=Math.max(start.cy,target.cy)+halfH;
      return Promise.all(backgroundLayers.filter(f=>f.x-40<right&&f.x+f.width+40>left&&f.y-40<bottom&&f.y+f.height+40>top).map(f=>prepareBackground(f.id)));
    };
    let size={w:view.clientWidth,h:view.clientHeight};
    const pose={cx:0,cy:0,scale:1};
    const render=()=>{
      // Keep subpixel precision: rounding scale to four decimals moves a
      // 20,000-unit source canvas by visible pixels at overview magnification.
      // Keep this large, mostly negative-coordinate world in the 2D paint path.
      // A promoted texture retains its focus raster while zooming out, then
      // abruptly rerasterizes when the compositor layer is removed.
      const x=size.w/2-pose.cx*pose.scale,y=size.h/2-pose.cy*pose.scale;
      stage.style.transform=`${stableRaster?`translate(${x}px,${y}px)`:`translate3d(${x}px,${y}px,0)`} scale(${pose.scale})`;
      stage.style.setProperty('--label-scale',1/pose.scale);
    };
    // Source geometry never depends on camera or hover transforms.
    const bounds=id=>{
      const nodes=id?frames.filter(f=>f.dataset.deskFrame===id):frames;
      const targets=layers.filter(layer=>nodes.some(f=>f.dataset.deskFrame===layer.id));
      const left=Math.min(...targets.map(l=>l.position.x)),top=Math.min(...targets.map(l=>l.position.y));
      const w=Math.max(...targets.map(l=>l.position.x+l.width))-left,h=Math.max(...targets.map(l=>l.position.y+l.height))-top;
      const padding=id?0:overviewPadding;
      return {x:left-w*padding,y:top-h*padding,w:w*(1+2*padding),h:h*(1+2*padding)};
    };
    const focus=async(id,animate=true,interactive=false)=>{
      const ticket=++request;
      camera?.kill();
      const box=bounds(id),w=view.clientWidth,h=view.clientHeight;
      const fit=Math.min(w/box.w,Math.max(1,h-36)/box.h);
      const focusFit=layers.find(layer=>layer.id===id)?.focusFit;
      // Fit each document's width independently; long documents start at the
      // top and are read vertically instead of centering their hidden middle.
      const scale=id?Math.min(w*.94/box.w,focusFit?fit*focusFit:Math.max(fit*1.44,w*.9/box.w)):fit*.94;
      const target={scale,cx:box.x+box.w/2,cy:id&&box.h*scale>h-48?box.y+(h/2-24)/scale:box.y+box.h/2};
      lastWheelAt=0;
      const start={...pose},distance=Math.hypot(target.cx-start.cx,target.cy-start.cy);
      const travel=id&&currentId&&id!==currentId;
      const duration=travel?Math.min(2.15,1.65+distance/25000):id?1.35:1.5;
      currentId=id;
      // Explicit Layers/Overview clicks request this spatial transition. Keep
      // those animated; reduced motion still applies to automatic layout changes.
      const shouldAnimate=animate&&(interactive||!media.matches);
      el.dataset.cameraMoving=String(shouldAnimate);
      if(!shouldAnimate){Object.assign(pose,target);render();}
      await Promise.all([preparePath(start,target,Math.min(start.scale,scale)),shouldAnimate?uiReady:Promise.resolve()]);
      if(!alive||ticket!==request)return;
      el.dataset.backgroundReady='true';
      context.add(()=>{
        // Retarget the existing DOM transform; never reset to an overview pose.
        moving=shouldAnimate;
        if(!stableRaster)stage.style.willChange=moving?'transform':'auto';
        gsap.to(surfaces,{scale:1,y:0,opacity:1,force3D:stableRaster?false:'auto',duration:moving?.3:0,ease:'power2.out',overwrite:'auto'});
        el.dataset.cameraMoving=String(moving);
        if(!moving){Object.assign(pose,target);render();return;}
        const clock={progress:0};
        camera=gsap.timeline({onComplete:()=>{moving=false;el.dataset.cameraMoving='false';if(!stableRaster)stage.style.willChange='auto';}});
        camera.to(clock,{progress:1,duration,ease:'power3.inOut',onUpdate:()=>{
          const t=clock.progress;
          pose.cx=start.cx+(target.cx-start.cx)*t;
          pose.cy=start.cy+(target.cy-start.cy)*t;
          pose.scale=Math.exp(Math.log(start.scale)*(1-t)+Math.log(scale)*t);
          render();
        }});
      });
    };
    const hover=(id,active)=>{
      const surface=frames.find(f=>f.dataset.deskFrame===id)?.querySelector('.desk-frame__surface');
      if(!surface)return;
      context.add(()=>gsap.to(surface,{scale:active&&!moving&&!selectedRef.current&&!media.matches?1.035:1,force3D:stableRaster?false:'auto',duration:media.matches?0:.35,ease:'power2.out',overwrite:'auto'}));
    };
    const readingRange=()=>{
      const box=bounds(selectedRef.current),half=(size.h/2-24)/pose.scale;
      const fits=box.h*pose.scale<=size.h-48;
      return {box,top:fits?box.y+box.h/2:box.y+half,bottom:fits?box.y+box.h/2:box.y+box.h-half};
    };
    const pan=(_dx,dy)=>{
      if(!selectedRef.current)return;
      request++;camera?.kill();moving=false;el.dataset.cameraMoving='false';
      const {box,top,bottom}=readingRange();
      stage.style.willChange='auto';pose.cx=box.x+box.w/2;pose.cy=Math.max(top,Math.min(bottom,pose.cy-dy/pose.scale));render();
    };
    const wheel=event=>{
      if(!selectedRef.current||event.ctrlKey||!event.deltaY)return;
      event.preventDefault();event.stopPropagation();
      if(moving)return;
      const now=performance.now(),newGesture=now-lastWheelAt>180;lastWheelAt=now;
      const {bottom}=readingRange();
      // Reaching the end consumes this gesture. A fresh downward gesture
      // returns to overview, so trackpad momentum cannot dismiss the page.
      if(event.deltaY>0&&pose.cy>=bottom-.5/pose.scale&&newGesture){select(null);return;}
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?size.h:1);
      pan(0,-delta);
    };
    view.addEventListener('wheel',wheel,{passive:false});
    api.current={focus,hover,preparePrimary,pan};
    focus(null,false);
    const backgroundObserver=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)prepareBackground(entry.target.dataset.backgroundFrame);
    },{root:view,rootMargin:'20% 10%'});
    for(const frame of stage.querySelectorAll('[data-background-frame]'))backgroundObserver.observe(frame);
    const observer=new ResizeObserver(()=>{
      const next={w:view.clientWidth,h:view.clientHeight};
      if(next.w===size.w&&next.h===size.h)return;
      // Preserve the current pixel transform when the viewport changes.
      pose.cx+=(next.w-size.w)/(2*pose.scale);pose.cy+=(next.h-size.h)/(2*pose.scale);
      size=next;focus(selectedRef.current,true);
    });observer.observe(view);
    const reduced=()=>focus(selectedRef.current,false);
    media.addEventListener('change',reduced);
    return ()=>{alive=false;request++;camera?.kill();view.removeEventListener('wheel',wheel);observer.disconnect();backgroundObserver.disconnect();media.removeEventListener('change',reduced);context.revert();api.current=null;};
  },[layers,backgroundLayers,chapter,overviewPadding,select]);
  const active=layers.find(layer=>layer.id===(selected||hovered));
  const hover=(id,value)=>{
    setHovered(value?id:null);api.current?.hover(id,value);if(value)api.current?.preparePrimary(id);
  };
  const chapterTitle=chapter==='design'?'Design':chapter==='ux-strategy-ia'?'UX Strategy & IA':chapter==='insight-synthesis'?'Insight Synthesis':chapter==='user-research'?'User Research':chapter==='competitive-analysis'?'Competitive Analysis':'Desk Research';
  return <div ref={root} className="desk-canvas-interface" data-research-chapter={chapter} onKeyDown={event=>{
    if(event.key==='Escape'){event.preventDefault();select(null);opener.current?.focus?.({preventScroll:true});}
  }}>
    <div className="desk-layer-controls" role="group" aria-label={`${chapterTitle} Layers`}>
      <span className="desk-layer-controls__label">Layers</span>
      {layers.map((layer,index)=><div className="desk-layer-entry" key={layer.id}>
        {layer.group==='references'&&layers[index-1]?.group!=='references'&&<span className="desk-layer-group-label">Design References</span>}
        <button type="button" data-desk-layer={layer.id} data-layer-group={layer.group} aria-pressed={selected===layer.id} onClick={event=>select(layer.id,event.currentTarget)}><span aria-hidden="true">⌗</span>{layer.title}</button>
      </div>)}
    </div>
    <div ref={viewport} className={`figma-canvas-viewport${selected?' is-reading':''}`} data-lenis-prevent-wheel={selected?'':undefined} aria-label={`${chapterTitle} 조사 자료 캔버스 · 확대 후 스크롤 또는 방향키로 읽기 · 맨 아래에서 다시 내리면 전체 보기`} tabIndex={0}
      onPointerDown={event=>{
        if(!selectedRef.current||event.button!==0)return;
        suppressClick.current=false;drag.current={x:event.clientX,y:event.clientY,moved:false};
      }} onPointerMove={event=>{
        const start=drag.current;if(!start)return;
        const dx=event.clientX-start.x,dy=event.clientY-start.y;
        if(!start.moved&&Math.hypot(dx,dy)<5)return;
        start.moved=true;suppressClick.current=true;
        event.currentTarget.setPointerCapture(event.pointerId);
        api.current?.pan(dx,dy);start.x=event.clientX;start.y=event.clientY;
      }} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}
      onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}
      onKeyDown={event=>{
        if(!selectedRef.current||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
        event.preventDefault();api.current?.pan(event.key==='ArrowLeft'?80:event.key==='ArrowRight'?-80:0,event.key==='ArrowUp'?80:event.key==='ArrowDown'?-80:0);
      }}>
      <div ref={world} className="figma-canvas-world">
        {backgroundLayers.map(frame=><DeskResearchFrame key={frame.id} frame={frame} variant="background"/>)}
        {layers.map(frame=><DeskResearchFrame key={frame.id} frame={frame} selected={selected?selected===frame.id:undefined} hovered={hovered===frame.id} highResolution={highResolution.has(frame.id)} onHover={hover} onSelect={select} onExpand={onExpand}/>)}
      </div>
    </div>
    <div className="desk-canvas-footer">
      <div className={`desk-canvas-caption${active?' is-visible':''}`} aria-live="polite">
        {active&&<><strong>{active.title}</strong><p>{active.description.replace('\n',' ')}</p></>}
      </div>
      <div className="desk-canvas-tools">
        <button type="button" onClick={()=>select(null)} aria-label="조사 자료 전체 보기">전체 보기</button>
      </div>
    </div>
  </div>;
}
