import { useEffect, useRef, useState } from 'react';
import { navigation } from '../../data/projects';
import { sectionNumber } from '../../data/sections';
import { pauseScroll } from '../../motion/scroll';
import Link from '../ui/Link';
import './Header.css';
export default function Header() {
  const [scrolled,setScrolled]=useState(false);
  const [active,setActive]=useState('');
  const [open,setOpen]=useState(false);
  const dialog=useRef(null);
  const trigger=useRef(null);
  useEffect(()=>{
    const update=()=>setScrolled(window.scrollY>70);
    update();window.addEventListener('scroll',update,{passive:true});
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)setActive(`#${entry.target.id}`);});},{rootMargin:'-10% 0px -70% 0px'});
    navigation.forEach(item=>{const el=document.querySelector(item.href);if(el)observer.observe(el);});
    return()=>{window.removeEventListener('scroll',update);observer.disconnect();};
  },[]);
  useEffect(()=>{
    if(!open)return;
    const el=dialog.current;el.showModal();
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';pauseScroll(true);
    return()=>{el.close();document.body.style.overflow=overflow;pauseScroll(false);trigger.current?.focus({preventScroll:true});};
  },[open]);
  return <>
    <a className="skip-link" href="#work">작업으로 건너뛰기</a>
    <header className={`site-header ${scrolled?'site-header--compact':''}`}>
      <a className="site-header__logo" href="#intro" aria-label="주경덕 포트폴리오 첫 화면">T / Tommy<span>PORTFOLIO</span></a>
      <nav className="site-header__nav" aria-label="주 메뉴">{navigation.filter(n=>n.label!=='SKILLS').map(n=><a key={n.href} href={n.href} aria-current={active===n.href?'location':undefined}>{n.label}</a>)}</nav>
      <button ref={trigger} type="button" className="site-header__menu" aria-label="전체 메뉴 열기" aria-controls="site-menu" aria-expanded={open} onClick={()=>setOpen(true)}><span/><span/></button>
    </header>
    <dialog ref={dialog} id="site-menu" className="site-menu paper-grain" aria-label="전체 메뉴" onCancel={()=>setOpen(false)} onClick={e=>{if(e.target===dialog.current)setOpen(false);}}>
      <div className="site-menu__inner"><div className="site-menu__top"><span>TOMMY CHU / INDEX</span><button type="button" autoFocus onClick={()=>setOpen(false)} aria-label="메뉴 닫기">닫기 ×</button></div>
      <nav aria-label="전체 탐색">{navigation.map(n=><a key={n.href} href={n.href} onClick={()=>setOpen(false)}><small>{sectionNumber(n.href)}</small><span>{n.label}</span><span aria-hidden="true">↗</span></a>)}</nav>
        <div className="site-menu__projects"><Link href="#zara" onClick={()=>setOpen(false)}>ZARA</Link><Link href="#personal" onClick={()=>setOpen(false)}>MEDIPEEL / T1 / ZIPPO</Link><Link href="#clone" onClick={()=>setOpen(false)}>CLONE CODING</Link></div>
      </div>
    </dialog>
  </>;
}
