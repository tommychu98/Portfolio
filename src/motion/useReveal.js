import { useEffect, useRef } from 'react';
import { gsap } from './scroll';
export default function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('all', () => {
      ref.current?.querySelectorAll('[data-reveal]').forEach(el => {
        gsap.from(el,{y:30,opacity:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
      });
    });
    return () => mm.revert();
  },[]);
  return ref;
}
