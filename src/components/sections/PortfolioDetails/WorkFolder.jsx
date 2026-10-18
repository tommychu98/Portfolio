import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, pauseScroll } from '../../../motion/scroll';
import './WorkFolder.css';

const cards = [
  { title:'MAIN PAGE', subtitle:'메인 페이지', video:'/media/videos/diptyque/main-page.mp4', color:'#d5dfd7', description:'메인 영상 제작을 담당하며 딥디크의 브랜드 분위기를 첫 화면에 담았습니다. 자연·여행·예술에서 출발한 브랜드의 이야기가 시각적으로 전달되도록 구성했습니다.' },
  { title:'HTML / CSS', subtitle:'마크업 작업', video:'/media/videos/diptyque/html-css.mp4', color:'#e2d1b8', description:'4인 팀 프로젝트의 HTML/CSS 마크업을 총괄했습니다. 팀원이 작업한 화면을 하나의 웹사이트로 연결하고, 피드백을 구체적인 화면 수정으로 반영했습니다.' },
  { title:'GIT', subtitle:'버전 관리', video:'/media/videos/diptyque/git.mp4', color:'#b5cbc5', description:'팀 프로젝트의 Git 관리를 맡아 팀원의 작업을 통합했습니다. 각자의 작업이 하나의 결과물로 이어지도록 변경 사항을 관리하며 협업했습니다.' },
  { title:'HISTORY OF DIPTYQUE', subtitle:'히스토리 페이지 작업', video:'/media/videos/diptyque/history-of-diptyque.mp4', color:'#d5d2c4', description:'History of Diptyque 페이지 구현을 담당했습니다. 브랜드의 역사를 펜 드로잉과 종이 콜라주 분위기로 풀어내고, 이야기를 따라 탐색할 수 있도록 화면을 구성했습니다.' },
];

function CardVideo({ card }) {
  return <video src={card.video} autoPlay muted loop playsInline preload="metadata" aria-label={`${card.title} 작업 영상`} />;
}

export default function WorkFolder() {
  const root=useRef(null), dialog=useRef(null), animation=useRef(null), expanded=useRef(false), opener=useRef(null);
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState(null);
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
            {x:w*(i%2)*.53,y:h*(Math.floor(i/2)*.5),scale:1,rotation:0,duration:.85,ease:'back.out(1.12)'},i*.045);
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
  useEffect(()=>{
    if(selected===null)return;
    const element=dialog.current;
    const overflow=document.body.style.overflow;
    const previousFocus=opener.current;
    element.showModal();
    element.querySelector('button')?.focus({preventScroll:true});
    pauseScroll(true);
    document.body.style.overflow='hidden';
    return()=>{
      element.close();
      document.body.style.overflow=overflow;
      pauseScroll(false);
      if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    };
  },[selected]);
  const closeDetail=()=>{setOpen(true);setSelected(null);};
  return <><div ref={root} className={`diptyque-work-folder${open?' is-open':''}`}
    onPointerEnter={event=>{if(event.pointerType==='mouse')setOpen(true);}}
    onPointerLeave={event=>{if(event.pointerType==='mouse'&&selected===null)setOpen(false);}}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)&&!dialog.current.open)setOpen(false)}}>
    <button type="button" className="diptyque-work-folder__trigger" aria-label="메인 페이지, HTML/CSS, Git, History of Diptyque 작업 카드 펼치기" aria-expanded={open} tabIndex={open?-1:0}
      onFocus={()=>setOpen(true)} onClick={()=>setOpen(true)}
      onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);event.currentTarget.blur();}}}/>
    <span className="diptyque-work-folder__back" data-folder aria-hidden="true"><span>DIPTYQUE / PROJECT FILES</span></span>
    {cards.map((card,i)=><button type="button" key={card.title} className="diptyque-work-folder__card" data-work-card style={{zIndex:4-i}} aria-label={`${card.title} 크게 보기`} aria-haspopup="dialog" tabIndex={open?0:-1} onFocus={()=>setOpen(true)} onClick={event=>{opener.current=event.currentTarget;setSelected(i);}}>
      <span className="diptyque-work-folder__content" style={{background:card.color}}><CardVideo card={card}/></span>
      <img className="diptyque-work-folder__frame" src="/media/images/diptyque/work-paper-frame.png" alt="" draggable="false"/>
    </button>)}
    <span className="diptyque-work-folder__front" data-folder aria-hidden="true"><span>CREATED TOGETHER<span>DESIGN · CODE · COLLABORATION</span></span><b>04</b></span>
    <span className="diptyque-work-folder__hint" data-folder-hint>HOVER / TAP TO EXPLORE ↗</span>
  </div>
  {createPortal(<dialog ref={dialog} className="diptyque-work-folder__dialog" aria-label={selected===null?'작업 영상 크게 보기':`${cards[selected].title} 크게 보기`} onCancel={event=>{event.preventDefault();closeDetail()}} onClose={()=>setSelected(null)} onClick={event=>{if(event.target===dialog.current||event.target.classList.contains('diptyque-work-folder__enlarged'))closeDetail()}} data-lenis-prevent>
    {selected!==null&&<div className="diptyque-work-folder__enlarged">
      <button type="button" className="diptyque-work-folder__close" onClick={closeDetail} autoFocus aria-label="큰 화면 닫기"><span>닫기</span><span aria-hidden="true">×</span></button>
      <div className="diptyque-work-folder__enlarged-card">
        <span className="diptyque-work-folder__content" style={{background:cards[selected].color}}><CardVideo card={cards[selected]}/></span>
        <img className="diptyque-work-folder__frame" src="/media/images/diptyque/work-paper-frame.png" alt="" draggable="false"/>
      </div>
      <p className="diptyque-work-folder__description">{cards[selected].description}</p>
    </div>}
  </dialog>,document.body)}</>;
}
