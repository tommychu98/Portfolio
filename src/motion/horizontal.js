import { gsap, ScrollTrigger, scrollToPosition } from './scroll';

export function initHorizontal(root) {
  const viewport = root.querySelector('[data-viewport]');
  const track = root.querySelector('[data-track]');
  const panels = [...root.querySelectorAll('[data-panel]')];
  const count = root.querySelector('[data-count]');
  const progress = root.querySelector('[data-progress]');
  const mm = gsap.matchMedia();
  let trigger;
  let tween;
  let index = 0;
  function updateControls() {
    root.querySelector('[data-prev]').disabled = index === 0;
    root.querySelector('[data-next]').disabled = index === panels.length-1;
    if(count) count.textContent = `${String(index+1).padStart(2,'0')} / ${String(panels.length).padStart(2,'0')}`;
  }
  mm.add('(min-width: 1024px) and (min-height: 740px) and (prefers-reduced-motion: no-preference)', () => {
    root.classList.add('has-horizontal');
    const distance = () => Math.max(0,track.scrollWidth-viewport.clientWidth);
    tween = gsap.to(track,{x:() => -distance(),ease:'none',scrollTrigger:{trigger:root,pin:viewport,start:'top top',end:() => `+=${distance()}`,scrub:.45,invalidateOnRefresh:true,anticipatePin:1,onUpdate:self=>{
      index=Math.round(self.progress*(panels.length-1));
      if(progress) progress.style.transform=`scaleX(${self.progress})`;
      updateControls();
    }}});
    trigger=tween.scrollTrigger;
    return () => {root.classList.remove('has-horizontal');trigger=undefined;tween=undefined;track.style.transform='';if(progress)progress.style.transform='';};
  });
  const navigate = next => {
    index=Math.max(0,Math.min(panels.length-1,next));
    if(trigger) {
      const fraction=index/(panels.length-1);
      scrollToPosition(trigger.start+fraction*(trigger.end-trigger.start),true);
      ScrollTrigger.update();
      tween.progress(fraction);
    } else panels[index].scrollIntoView({block:'center',behavior:'instant'});
    updateControls();
  };
  const previous = () => navigate(index-1);
  const next = () => navigate(index+1);
  const focus = event => {
    const panel = event.target.closest('[data-panel]');
    if(trigger && panel) navigate(panels.indexOf(panel));
  };
  const key = event => {
    if(!event.target.matches('[data-horizontal-keys]')) return;
    if(event.key==='ArrowRight' || event.key==='ArrowLeft') {event.preventDefault();navigate(index+(event.key==='ArrowRight'?1:-1));}
  };
  root.querySelector('[data-prev]').addEventListener('click',previous);
  root.querySelector('[data-next]').addEventListener('click',next);
  root.addEventListener('focusin',focus);
  root.addEventListener('keydown',key);
  updateControls();
  return () => {mm.revert();root.querySelector('[data-prev]')?.removeEventListener('click',previous);root.querySelector('[data-next]')?.removeEventListener('click',next);root.removeEventListener('focusin',focus);root.removeEventListener('keydown',key);};
}
