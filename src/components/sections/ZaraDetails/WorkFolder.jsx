import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../../../motion/scroll';
import './WorkFolder.css';

// Add image paths here when the final artwork is ready.
const cards = [
  { title:'MAIN PAGE', subtitle:'메인 페이지', image:'', color:'#d5dfd7' },
  { title:'HTML / CSS', subtitle:'마크업 작업', image:'', color:'#e2d1b8' },
  { title:'GIT', subtitle:'버전 관리', image:'', color:'#b5cbc5' },
  { title:'HISTORY OF DIPTYQUE', subtitle:'히스토리 페이지 작업', image:'', color:'#d5d2c4' },
];

export default function WorkFolder() {
  const root=useRef(null), animation=useRef(null), expanded=useRef(false), pointer=useRef('mouse');
  const [open,setOpen]=useState(false);
  useLayoutEffect(()=>{
    const stage=root.current;
    const items=[...stage.querySelectorAll('[data-work-card]')];
    const folder=stage.querySelectorAll('[data-folder]');
    let context;
    const measure=()=>{
      const progress=animation.current?.progress()??(expanded.current?1:0);
      context?.revert();
      context=gsap.context(()=>{
        const w=stage.clientWidth,h=stage.clientHeight;
        const offsets=[0,-.16,.16,.06];
        const angles=[-2,-12,10,5];
        const timeline=gsap.timeline({paused:true});
        items.forEach((card,i)=>{
          timeline.fromTo(card,{x:w*(.265+offsets[i]),y:h*(.28-(i===0?0:.06)),scale:1.28,rotation:angles[i]},
            {x:w*(i%2)*.53,y:h*(Math.floor(i/2)*.5+.045),scale:1,rotation:0,duration:.85,ease:'back.out(1.12)'},i*.045);
        });
        timeline.fromTo(folder,{y:0,autoAlpha:1},{y:h*.15,autoAlpha:0,duration:.45,ease:'power2.in'},0);
        timeline.fromTo(stage.querySelector('[data-folder-hint]'),{opacity:1},{opacity:0,duration:.2},0);
        animation.current=timeline;
        timeline.progress(progress);
        if(expanded.current)timeline.play();else timeline.reverse();
      },stage);
    };
    measure();
    const observer=new ResizeObserver(measure);observer.observe(stage);
    return()=>{observer.disconnect();context?.revert();animation.current=null;};
  },[]);
  useLayoutEffect(()=>{
    expanded.current=open;
    if(open)animation.current?.timeScale(1).play();
    else animation.current?.timeScale(1.2).reverse();
  },[open]);
  return <button ref={root} type="button" className="diptyque-work-folder" aria-label="메인 페이지, HTML/CSS, Git, History of Diptyque 작업 카드 펼치기" aria-expanded={open}
    onPointerEnter={event=>{if(event.pointerType==='mouse')setOpen(true);}}
    onPointerLeave={event=>{if(event.pointerType==='mouse')setOpen(false);}}
    onPointerDown={event=>{pointer.current=event.pointerType;}}
    onFocus={event=>{if(event.currentTarget.matches(':focus-visible'))setOpen(true);}}
    onBlur={()=>setOpen(false)}
    onClick={event=>{if(pointer.current!=='mouse'||event.detail===0)setOpen(value=>!value);}}
    onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);event.currentTarget.blur();}}}>
    <span className="diptyque-work-folder__back" data-folder aria-hidden="true"><span>DIPTYQUE / PROJECT FILES</span></span>
    {cards.map((card,i)=><span key={card.title} className="diptyque-work-folder__card" data-work-card style={{zIndex:4-i}}>
      <span className="diptyque-work-folder__content" style={{background:card.color}}>
        {card.image?<img src={card.image} alt={card.subtitle}/>:<><span className="diptyque-work-folder__number">0{i+1}</span><strong>{card.title}</strong><span className="diptyque-work-folder__subtitle">{card.subtitle}</span></>}
      </span>
      <img className="diptyque-work-folder__frame" src="/media/images/diptyque/work-paper-frame.png" alt="" draggable="false"/>
    </span>)}
    <span className="diptyque-work-folder__front" data-folder aria-hidden="true"><span>CREATED TOGETHER<span>DESIGN · CODE · COLLABORATION</span></span><b>04</b></span>
    <span className="diptyque-work-folder__hint" data-folder-hint>HOVER / TAP TO EXPLORE ↗</span>
  </button>;
}
