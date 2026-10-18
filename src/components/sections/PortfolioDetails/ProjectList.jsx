import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '../../../motion/scroll';
import './ProjectList.css';

const projects = [
  ['BRAND HISTORY', '브랜드의 역사와 시작', 'about/history', 'history'],
  ['SCENT STORY', '향에 담긴 이야기', 'about/fragrances-story', 'scent-story'],
  ['PRODUCT DETAIL', '제품 정보와 특징', 'shop/product-line', 'product-detail'],
  ['EXPLORE SCENT', '나에게 맞는 향 탐색', 'galerie', 'explore-scent'],
];

export default function ProjectList() {
  const root = useRef(null);
  const preview = useRef(null);
  useLayoutEffect(() => {
    const list = root.current;
    const floating = preview.current;
    const rows = [...list.querySelectorAll('a')];
    const images = [...floating.querySelectorAll('img')];
    const hover = matchMedia('(any-hover: hover) and (any-pointer: fine)');
    let active = -1, visible = false, disposed = false, serial = 0;
    let pointer = null;
    const remove = [];
    const context = gsap.context(() => {}, list);
    const on = (el, event, handler) => {
      el.addEventListener(event, handler);
      remove.push(() => el.removeEventListener(event, handler));
    };
    const animate = (target, vars) => context.add(() => gsap.to(target, {duration:.48,ease:'power3.out',overwrite:true,...vars}));
    let moveX, moveY;
    context.add(() => {
      gsap.set(list.querySelectorAll('[data-title-color]'), {y:0,yPercent:100});
      gsap.set(floating, {autoAlpha:0,scale:.94,rotation:-5});
      gsap.set(images, {opacity:0});
      moveX = gsap.quickTo(floating,'x',{duration:.48,ease:'power3.out'});
      moveY = gsap.quickTo(floating,'y',{duration:.48,ease:'power3.out'});
    });
    const position = (x,y,immediate=false) => {
      const w=floating.offsetWidth,h=floating.offsetHeight,pad=26,gap=38;
      const tx=gsap.utils.clamp(pad,Math.max(pad,innerWidth-w-pad),x+w+gap+pad<innerWidth?x+gap:x-w-gap);
      const ty=gsap.utils.clamp(pad,Math.max(pad,innerHeight-h-pad),y-h*.5);
      if(immediate){moveX.tween.pause();moveY.tween.pause();gsap.set(floating,{x:tx,y:ty});}
      else {moveX(tx);moveY(ty);}
    };
    const select = index => {
      if(active===index)return;
      active=index;
      rows.forEach((row,i)=>{
        const selected=i===index;
        animate(row.querySelector('[data-title-base]'),{yPercent:selected?-100:0});
        animate(row.querySelector('[data-title-color]'),{yPercent:selected?0:100});
        animate(row.querySelector('[data-project-arrow]'),{rotation:selected?-135:0,x:selected?3:0,y:selected?-3:0,color:selected?'#62694b':'#11130f'});
      });
    };
    const show = async index => {
      const request=++serial;
      try { await images[index].decode(); } catch { return; }
      if(disposed||request!==serial||active!==index||!pointer)return;
      position(pointer.x,pointer.y,!visible);
      visible=true;
      images.forEach((image,i)=>animate(image,{opacity:i===index?1:0,duration:.32}));
      animate(floating,{autoAlpha:1,scale:1,rotation:index%2?4:-4,duration:.5,overwrite:'auto'});
    };
    const hide = () => {
      ++serial;visible=false;pointer=null;select(-1);
      animate(floating,{autoAlpha:0,scale:.96,duration:.28,overwrite:'auto'});
    };
    rows.forEach((row,index)=>{
      on(row,'pointerenter',event=>{
        if(!hover.matches||event.pointerType==='touch')return;
        pointer={x:event.clientX,y:event.clientY};select(index);show(index);
      });
      on(row,'focus',()=>{if(row.matches(':focus-visible'))select(index);});
    });
    on(list,'pointermove',event=>{
      if(!hover.matches||event.pointerType==='touch')return;
      pointer={x:event.clientX,y:event.clientY};
      if(visible)position(pointer.x,pointer.y);
    });
    on(list,'pointerleave',hide);
    on(list,'focusout',event=>{if(!list.contains(event.relatedTarget))hide();});
    on(window,'blur',hide);
    on(window,'resize',hide);
    on(window,'scroll',()=>{
      if(pointer&&!list.contains(document.elementFromPoint(pointer.x,pointer.y)))hide();
    });
    return()=>{disposed=true;++serial;remove.forEach(fn=>fn());moveX.tween.kill();moveY.tween.kill();context.revert();};
  },[]);

  return <>
    <div className="zara-details__flow diptyque-project-list" ref={root}>
      {projects.map(([title,description,path],index)=><a className="diptyque-project-list__row" key={path} href={`https://mbc-teamproject-alpha.vercel.app/${path}`} target="_blank" rel="noopener noreferrer" aria-label={`${String(index+1).padStart(2,'0')} ${title} — ${description} (새 탭)`}>
        <small>{String(index+1).padStart(2,'0')}</small>
        <h4 className="diptyque-project-list__title"><b data-title-base>{title}</b><b data-title-color aria-hidden="true">{title}</b></h4>
        <p>{description}</p><span data-project-arrow aria-hidden="true">↓</span>
      </a>)}
    </div>
    {createPortal(<div className="diptyque-project-preview" ref={preview} aria-hidden="true">{projects.map(([,,,image])=><img key={image} src={`/media/images/diptyque/previews/${image}.jpg`} alt="" width="1440" height="810" decoding="async"/>)}</div>,document.body)}
  </>;
}
