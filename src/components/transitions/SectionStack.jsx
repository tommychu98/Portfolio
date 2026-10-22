import { Children, Fragment, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../motion/scroll';
import './SectionStack.css';

// Only plain vertical sections belong here: never wrap a pin or horizontal track.
export default function SectionStack({ children }) {
  const root = useRef(null);
  useLayoutEffect(() => {
    const host = root.current;
    const items = [...host.querySelectorAll(':scope > .section-stack__item')];
    const markers = [...host.querySelectorAll(':scope > .section-stack__marker')];
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const measure = () => {
        items.slice(0, -1).forEach(item => {
          // Bottom-align long sections only after every line has scrolled into view.
          item.style.setProperty('--stack-top', `${Math.min(0, window.innerHeight - item.offsetHeight)}px`);
        });
      };
      measure();
      host.classList.add('section-stack--active');
      ScrollTrigger.addEventListener('refreshInit', measure);
      items.slice(0, -1).forEach((item, index) => {
        const surface = item.querySelector('.section-stack__surface');
        gsap.timeline({ scrollTrigger: {
          id: `stack-${surface.firstElementChild.id}`,
          trigger: markers[index + 1],
          start: () => `top ${Math.min(window.innerHeight, item.offsetHeight)}px`, end: 'top top',
          scrub: true, invalidateOnRefresh: true,
        } })
          .to(surface, { y: () => -Math.min(window.innerHeight, item.offsetHeight) * (window.innerWidth < 768 ? .05 : .15), ease: 'none' }, 0)
          .to(item.querySelector('.section-stack__shade'), { opacity: () => window.innerWidth < 768 ? .08 : .24, ease: 'none' }, 0);
      });
      let timer;
      const observer = new ResizeObserver(() => {
        measure();
        clearTimeout(timer);
        timer = setTimeout(() => ScrollTrigger.refresh(), 120);
      });
      items.forEach(item => observer.observe(item));
      return () => {
        clearTimeout(timer);
        observer.disconnect();
        ScrollTrigger.removeEventListener('refreshInit', measure);
        host.classList.remove('section-stack--active');
        items.forEach(item => item.style.removeProperty('--stack-top'));
      };
    });
    return () => media.revert();
  }, []);
  return <div ref={root} className="section-stack">
    {Children.toArray(children).map((child, index) => <Fragment key={child.key ?? index}>
      <div className="section-stack__marker" aria-hidden="true" />
      <div className="section-stack__item" style={{ zIndex: index + 1 }}>
        <div className="section-stack__surface">
          {child}
          <div className="section-stack__shade" aria-hidden="true" />
        </div>
      </div>
    </Fragment>)}
  </div>;
}
