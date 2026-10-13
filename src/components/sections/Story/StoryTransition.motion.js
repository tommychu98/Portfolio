import { gsap, ScrollTrigger } from '../../../motion/scroll';
import { circleMask } from './StoryTransition.geometry';

export function initStoryTransition(root) {
  const media = gsap.matchMedia();
  media.add('all', () => {
    const wrapper = root.querySelector('[data-story-transition]');
    const circle = root.querySelector('[data-story-circle]');
    const lines = [...root.querySelectorAll('[data-story-line]')];
    const copies = lines.map(line => line.querySelector('[data-story-inverse]'));
    const body = root.querySelector('.story__body');
    let disposed = false, frame = 0;
    // Read the rendered (scrub-smoothed) circle AND moving lines. No independent
    // color tween: both layers always share the exact same circle boundary.
    const paint = () => {
      const boundary = circle.getBoundingClientRect();
      const boxes = lines.map(line => line.getBoundingClientRect());
      copies.forEach((copy, index) => { copy.style.clipPath = circleMask(boundary, boxes[index]); });
    };
    gsap.set(circle, { xPercent: -50, x: 0, y: 0, width: 40, height: 40, transformOrigin: 'top center' });
    const expansion = gsap.timeline({
      onUpdate: paint,
      scrollTrigger: {
        id: 'intro-story-circle', trigger: wrapper,
        start: 'top 80%', end: 'top 20%', scrub: 1.2,
        invalidateOnRefresh: true, onRefresh: paint,
      },
    });
    expansion.fromTo(circle, {width:40,height:40}, {
      width: () => Math.max(window.innerWidth, window.innerHeight) * 2,
      height: () => Math.max(window.innerWidth, window.innerHeight) * 2,
      ease:'power1.inOut',duration:1,
    },0);
    expansion.fromTo(lines[0], {x:()=>-window.innerWidth}, {x:()=>-window.innerWidth*.1,duration:1,ease:'power2.out'},0);
    expansion.fromTo(lines[1], {x:()=>window.innerWidth}, {x:()=>window.innerWidth*.1,duration:1,ease:'power2.out'},0);
    // The full STORY is the follow-up range. Using a one-screen wrapper for
    // both endpoints would reverse/degenerate top 5% -> bottom bottom.
    gsap.fromTo(circle, {y:0}, {
      y:()=>-window.innerHeight*.3,ease:'power1.inOut',immediateRender:false,
      onUpdate:paint,
      scrollTrigger:{id:'story-circle-lift',trigger:root,start:'top 5%',end:'bottom bottom',scrub:1,invalidateOnRefresh:true,onRefresh:paint},
    });
    gsap.fromTo(root.querySelectorAll('.story__object'), {y:()=>window.innerHeight*.5}, {
      y:0,ease:'circ.out',
      scrollTrigger:{id:'story-images-entry',trigger:body,start:'top 78%',end:'top 42%',scrub:1.2,invalidateOnRefresh:true},
    });
    gsap.fromTo(root.querySelectorAll('.story__copy > *'), {y:50,opacity:0}, {
      y:0,opacity:1,duration:.8,stagger:.2,ease:'power2.out',
      scrollTrigger:{id:'story-copy-entry',trigger:body,start:'top 74%',toggleActions:'play none none reverse'},
    });
    const refreshMask = () => {
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(paint);
    };
    const observer=new ResizeObserver(refreshMask);
    observer.observe(wrapper);
    lines.forEach(line=>observer.observe(line));
    ScrollTrigger.addEventListener('refresh',paint);
    document.fonts?.ready.then(()=>{if(!disposed)paint();});
    paint();
    return () => {
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();
      ScrollTrigger.removeEventListener('refresh',paint);
      copies.forEach(copy=>copy.style.removeProperty('clip-path'));
    };
  });
  return () => media.revert();
}
