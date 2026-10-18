import {useCallback,useLayoutEffect,useRef,useState} from 'react';
import {gsap} from '../../../motion/scroll';
import {deskResearchBackground,deskResearchLayers} from './DeskResearch.data.js';
import DeskResearchFrame from './DeskResearchFrame';
import './DeskResearchCanvas.css';

export default function DeskResearchCanvas({onExpand}) {
  const root=useRef(null),viewport=useRef(null),world=useRef(null),api=useRef(null);
  const selectedRef=useRef(null),opener=useRef(null);
  const [selected,setSelected]=useState(null),[hovered,setHovered]=useState(null);
  const [highResolution,setHighResolution]=useState(()=>new Set());
  const select=useCallback((id,trigger)=>{if(trigger)opener.current=trigger;selectedRef.current=id;setSelected(id);setHovered(null);api.current?.preparePrimary(id);api.current?.focus(id,true,true);},[]);
  useLayoutEffect(()=>{
    const el=root.current,stage=world.current,view=viewport.current;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const uiImage=el.closest('.diptyque-retro-window')?.querySelector('.figma-workspace-ui');
    const uiReady=uiImage?uiImage.decode().catch(()=>{}):Promise.resolve();
    const context=gsap.context(()=>{},el);
    let camera,moving=false,currentId=null,request=0,alive=true;
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
      const layer=deskResearchLayers.find(l=>l.id===id);
      if(!layer||primaryDecoded.has(id))return;
      const image=new Image();image.src=layer.image;
      primaryDecoded.set(id,image.decode().then(()=>{if(alive)setHighResolution(previous=>new Set([...previous,id]));}).catch(()=>{}));
    };
    // Predecode the complete swept viewport before flying. Loaded backgrounds
    // stay mounted, so turning or interrupting a flight cannot pop them out.
    const preparePath=(start,target,minScale)=>{
      const halfW=size.w/(2*minScale)*1.15,halfH=size.h/(2*minScale)*1.15;
      const left=Math.min(start.cx,target.cx)-halfW,right=Math.max(start.cx,target.cx)+halfW;
      const top=Math.min(start.cy,target.cy)-halfH,bottom=Math.max(start.cy,target.cy)+halfH;
      return Promise.all(deskResearchBackground.filter(f=>f.x-40<right&&f.x+f.width+40>left&&f.y-40<bottom&&f.y+f.height+40>top).map(f=>prepareBackground(f.id)));
    };
    let size={w:view.clientWidth,h:view.clientHeight};
    const pose={cx:0,cy:0,scale:1};
    const render=()=>{
      // Keep subpixel precision: rounding scale to four decimals moves a
      // 20,000-unit source canvas by visible pixels at overview magnification.
      stage.style.transform=`translate3d(${size.w/2-pose.cx*pose.scale}px,${size.h/2-pose.cy*pose.scale}px,0) scale(${pose.scale})`;
      stage.style.setProperty('--label-scale',1/pose.scale);
    };
    // Source geometry never depends on camera or hover transforms.
    const bounds=id=>{
      const nodes=id?frames.filter(f=>f.dataset.deskFrame===id):frames;
      const layers=deskResearchLayers.filter(layer=>nodes.some(f=>f.dataset.deskFrame===layer.id));
      const left=Math.min(...layers.map(l=>l.position.x)),top=Math.min(...layers.map(l=>l.position.y));
      return {x:left,y:top,w:Math.max(...layers.map(l=>l.position.x+l.width))-left,h:Math.max(...layers.map(l=>l.position.y+l.height))-top};
    };
    const focus=async(id,animate=true,interactive=false)=>{
      const ticket=++request;
      camera?.kill();
      const box=bounds(id),w=view.clientWidth,h=view.clientHeight;
      const scale=Math.min(w/box.w,Math.max(1,h-36)/box.h)*(id ? .9 : .94);
      const target={scale,cx:box.x+box.w/2,cy:box.y+box.h/2};
      const start={...pose},distance=Math.hypot(target.cx-start.cx,target.cy-start.cy);
      const travel=id&&currentId&&id!==currentId;
      const duration=travel?Math.min(2.15,1.65+distance/25000):id?1.35:1.5;
      // A single eased clock drives pan and zoom together. The logarithmic zoom
      // valley widens the view mid-flight without stopping the pan at a waypoint.
      const midScale=travel?Math.min(start.scale,scale)*.68:Math.sqrt(start.scale*scale);
      const dip=travel?Math.log(Math.sqrt(start.scale*scale)/midScale):0;
      currentId=id;
      // Explicit Layers/Overview clicks request this spatial transition. Keep
      // those animated; reduced motion still applies to automatic layout changes.
      const shouldAnimate=animate&&(interactive||!media.matches);
      el.dataset.cameraMoving=String(shouldAnimate);
      if(!shouldAnimate){Object.assign(pose,target);render();}
      await Promise.all([preparePath(start,target,Math.min(start.scale,scale,midScale)),shouldAnimate?uiReady:Promise.resolve()]);
      if(!alive||ticket!==request)return;
      el.dataset.backgroundReady='true';
      context.add(()=>{
        // Retarget the existing DOM transform; never reset to an overview pose.
        moving=shouldAnimate;
        stage.style.willChange=moving?'transform':'auto';
        gsap.to(surfaces,{scale:1,y:0,opacity:1,duration:moving?.3:0,ease:'power2.out',overwrite:'auto'});
        el.dataset.cameraMoving=String(moving);
        if(!moving){Object.assign(pose,target);render();return;}
        const clock={progress:0};
        camera=gsap.timeline({onComplete:()=>{moving=false;el.dataset.cameraMoving='false';stage.style.willChange='auto';}});
        camera.to(clock,{progress:1,duration,ease:'power3.inOut',onUpdate:()=>{
          const t=clock.progress;
          pose.cx=start.cx+(target.cx-start.cx)*t;
          pose.cy=start.cy+(target.cy-start.cy)*t;
          pose.scale=Math.exp(Math.log(start.scale)*(1-t)+Math.log(scale)*t-dip*Math.sin(Math.PI*t)**2);
          render();
        }});
      });
    };
    const hover=(id,active)=>{
      const surface=frames.find(f=>f.dataset.deskFrame===id)?.querySelector('.desk-frame__surface');
      if(!surface)return;
      context.add(()=>gsap.to(surface,{scale:active&&!moving&&!selectedRef.current&&!media.matches?1.035:1,duration:media.matches?0:.35,ease:'power2.out',overwrite:'auto'}));
    };
    api.current={focus,hover,preparePrimary};
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
    return ()=>{alive=false;request++;camera?.kill();observer.disconnect();backgroundObserver.disconnect();media.removeEventListener('change',reduced);context.revert();api.current=null;};
  },[]);
  const active=deskResearchLayers.find(layer=>layer.id===(selected||hovered));
  const hover=(id,value)=>{
    setHovered(value?id:null);api.current?.hover(id,value);if(value)api.current?.preparePrimary(id);
  };
  return <div ref={root} className="desk-canvas-interface" onKeyDown={event=>{
    if(event.key==='Escape'){event.preventDefault();select(null);opener.current?.focus?.({preventScroll:true});}
  }}>
    <div className="desk-layer-controls" role="group" aria-label="Desk Research Layers">
      <span className="desk-layer-controls__label">Layers</span>
      {deskResearchLayers.map(layer=><button type="button" key={layer.id} data-desk-layer={layer.id} aria-pressed={selected===layer.id} onClick={event=>select(layer.id,event.currentTarget)}><span aria-hidden="true">⌗</span>{layer.title}</button>)}
    </div>
    <div ref={viewport} className="figma-canvas-viewport" aria-label="Desk Research 조사 자료 캔버스" tabIndex={0}>
      <div ref={world} className="figma-canvas-world">
        {deskResearchBackground.map(frame=><DeskResearchFrame key={frame.id} frame={frame} variant="background"/>)}
        {deskResearchLayers.map(frame=><DeskResearchFrame key={frame.id} frame={frame} selected={selected?selected===frame.id:undefined} hovered={hovered===frame.id} highResolution={highResolution.has(frame.id)} onHover={hover} onSelect={select} onExpand={onExpand}/>)}
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
