import {useCallback,useLayoutEffect,useRef,useState} from 'react';
import {gsap} from '../../../motion/scroll';
import {deskResearchLayers} from './DeskResearch.data.js';
import './DeskResearchCanvas.css';

export default function DeskResearchCanvas({onExpand}) {
  const root=useRef(null),viewport=useRef(null),world=useRef(null),api=useRef(null);
  const selectedRef=useRef(null),opener=useRef(null);
  const [selected,setSelected]=useState(null),[hovered,setHovered]=useState(null);
  const select=useCallback((id,trigger)=>{if(trigger)opener.current=trigger;selectedRef.current=id;setSelected(id);setHovered(null);api.current?.focus(id);},[]);
  useLayoutEffect(()=>{
    const el=root.current,stage=world.current,view=viewport.current;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const context=gsap.context(()=>{},el);
    let camera,moving=false;
    const frames=[...stage.querySelectorAll('[data-desk-frame]')];
    const surfaces=frames.map(f=>f.querySelector('.desk-frame__surface'));
    let size={w:view.clientWidth,h:view.clientHeight};
    const syncLabels=()=>stage.style.setProperty('--label-scale',1 / Number(gsap.getProperty(stage,'scaleX')));
    // offset geometry is measured in world coordinates, unaffected by camera/hover transforms.
    const bounds=id=>{
      const nodes=id?frames.filter(f=>f.dataset.deskFrame===id):frames;
      const left=Math.min(...nodes.map(f=>f.offsetLeft)),top=Math.min(...nodes.map(f=>f.offsetTop));
      return {x:left,y:top,w:Math.max(...nodes.map(f=>f.offsetLeft+f.offsetWidth))-left,h:Math.max(...nodes.map(f=>f.offsetTop+f.offsetHeight))-top};
    };
    const focus=(id,animate=true)=>{
      camera?.kill();
      const box=bounds(id),w=view.clientWidth,h=view.clientHeight;
      const scale=Math.min(w/box.w,h/box.h)*(id ? .9 : .86);
      const target={scale,x:(w-box.w*scale)/2-box.x*scale,y:(h-box.h*scale)/2-box.y*scale};
      context.add(()=>{
        // Retarget the existing DOM transform; never reset to an overview pose.
        moving=animate&&!media.matches;
        stage.style.willChange=moving?'transform':'auto';
        gsap.to(surfaces,{scale:1,y:0,opacity:1,duration:moving?.3:0,ease:'power2.out',overwrite:'auto'});
        camera=gsap.to(stage,{...target,duration:moving?(id?1.2:1.3):0,ease:'power3.inOut',overwrite:'auto',force3D:true,onUpdate:syncLabels,onComplete:()=>{moving=false;stage.style.willChange='auto';syncLabels();}});
      });
    };
    const hover=(id,active)=>{
      const surface=frames.find(f=>f.dataset.deskFrame===id)?.querySelector('.desk-frame__surface');
      if(!surface)return;
      context.add(()=>gsap.to(surface,{scale:active&&!moving&&!selectedRef.current&&!media.matches?1.035:1,duration:media.matches?0:.35,ease:'power2.out',overwrite:'auto'}));
    };
    api.current={focus,hover};
    focus(null,false);
    const observer=new ResizeObserver(()=>{
      const next={w:view.clientWidth,h:view.clientHeight};
      if(next.w===size.w&&next.h===size.h)return;
      size=next;focus(selectedRef.current,true);
    });observer.observe(view);
    const reduced=()=>focus(selectedRef.current,false);
    media.addEventListener('change',reduced);
    return ()=>{camera?.kill();observer.disconnect();media.removeEventListener('change',reduced);context.revert();api.current=null;};
  },[]);
  const active=deskResearchLayers.find(layer=>layer.id===(selected||hovered));
  const hover=(id,value)=>{
    setHovered(value?id:null);api.current?.hover(id,value);
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
        {deskResearchLayers.map(layer=><div key={layer.id} data-desk-frame={layer.id} className={`desk-frame${selected===layer.id?' is-selected':''}${hovered===layer.id?' is-hovered':''}`} style={{left:layer.position.x,top:layer.position.y,width:layer.position.width}}>
          <div className="desk-frame__surface">
            <span className="desk-frame__name"><span>{layer.number} / {layer.englishTitle.toUpperCase()}</span></span>
            <button type="button" tabIndex={selected&&selected!==layer.id?-1:0} className="desk-frame__select" aria-label={`${layer.title} ${selected===layer.id?'원본 전체 읽기':'확대 선택'}`} aria-pressed={selected===layer.id} onPointerEnter={event=>{if(event.pointerType==='mouse')hover(layer.id,true);}} onPointerLeave={()=>hover(layer.id,false)} onFocus={()=>hover(layer.id,true)} onBlur={()=>hover(layer.id,false)} onClick={event=>selected===layer.id?onExpand(layer.document,event.currentTarget):select(layer.id,event.currentTarget)}>
              <img src={layer.image} width={layer.width} height={layer.height} alt={`${layer.title} 실제 Figma 대표 프레임`} loading="lazy" decoding="async" draggable="false"/>
            </button>
          </div>
        </div>)}
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
