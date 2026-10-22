import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
let lenis;
// Pinned sections may register in different React effect phases. Measure them
// in document order so an earlier pin's spacing reaches every later section.
function refreshLayout() {
  ScrollTrigger.sort((a, b) => {
    if (!a.trigger || !b.trigger || a.trigger === b.trigger) return 0;
    return a.trigger.compareDocumentPosition(b.trigger) & 2 ? 1 : -1;
  });
  ScrollTrigger.refresh();
}
export function scrollToPosition(target, immediate = false) {
  if (lenis) lenis.scrollTo(target, { immediate });
  else if (typeof target === 'number') window.scrollTo({top:target,behavior:'instant'});
  else target?.scrollIntoView({behavior:'instant'});
  if (immediate) ScrollTrigger.update();
}
export function pauseScroll(paused) { if (paused) lenis?.stop(); else lenis?.start(); }
export function sectionLayoutTop(target) {
  const item = target.closest('.section-stack__item');
  if (!item) return target.getBoundingClientRect().top + window.scrollY;
  const surface = item.querySelector('.section-stack__surface');
  return item.previousElementSibling.getBoundingClientRect().top + window.scrollY
    + target.getBoundingClientRect().top - surface.getBoundingClientRect().top;
}
export function initScroll() {
  let tick;
  const destroy = () => { if(tick) gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; };
  const setup = () => {
    destroy();
    lenis = new Lenis({ lerp: .09, smoothWheel: true, autoRaf:false, anchors:false });
    lenis.on('scroll', ScrollTrigger.update);
    tick = time => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    refreshLayout();
  };
  const click = event => {
    const a = event.target.closest('a[href^="#"]');
    if(!a || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(a.hash.slice(1));
    if(!target) return;
    event.preventDefault();
    history.pushState(null,'',a.hash);
    // Wait for a menu dialog to close before moving destination focus.
    requestAnimationFrame(() => {
      target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
      const top = sectionLayoutTop(target) - 105;
      scrollToPosition(Math.max(0,top));
    });
  };
  let timer;
  const refresh = event => {
    // These frames and object slots have fixed geometry. Refreshing pins on
    // iframe load reparents the frame, reloads it, and causes a refresh loop.
    if (event?.target?.tagName === 'IFRAME' || event?.target?.closest?.('#diptyque-history')) return;
    clearTimeout(timer); timer = setTimeout(refreshLayout,100);
  };
  setup();
  document.addEventListener('click',click);
  document.addEventListener('load',refresh,true);
  let active = true;
  document.fonts.ready.then(() => { if(active) refresh(); });
  return () => { active=false;clearTimeout(timer);destroy();document.removeEventListener('click',click);document.removeEventListener('load',refresh,true); };
}
export { gsap, ScrollTrigger };
