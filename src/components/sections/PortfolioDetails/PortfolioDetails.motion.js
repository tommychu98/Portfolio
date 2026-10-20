import { initHorizontal } from '../../../motion/horizontal';
import { gsap, ScrollTrigger } from '../../../motion/scroll';
import { attachTextReveal } from '../../../motion/textReveal';

export function initPortfolioDetails(root) {
  const destroyHorizontal = initHorizontal(root);
  const completed = new WeakSet();
  let disposed = false, media;
  document.fonts.ready.then(() => {
    if (disposed) return;
    media = gsap.matchMedia();
    media.add({
      horizontal: '(min-width: 1024px) and (min-height: 740px)',
      vertical: '(max-width: 1023px), (max-height: 739px)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, match => {
      if (match.conditions.reduce) return;
      const cleanups = [];
      const parent = ScrollTrigger.getAll().find(trigger => trigger.trigger === root && trigger.pin);
      root.querySelectorAll('[data-panel]').forEach((panel, index) => {
        // First part enters vertically. Subsequent parts follow the existing
        // horizontal tween; none of these children creates a pin or changes it.
        const scroll = match.conditions.horizontal && parent && index > 0
          ? { trigger: panel, containerAnimation: parent.animation, start: 'left 85%' }
          : { trigger: panel, start: 'top 88%' };
        const title = panel.querySelector('h3');
        if (!completed.has(title)) cleanups.push(attachTextReveal(title, {
          variant: 'title', scrollTrigger: scroll, onComplete: () => completed.add(title),
        }));
        const number = panel.querySelector('[data-part-number]');
        if (!completed.has(number)) {
          let timeline;
          timeline = gsap.timeline({
            scrollTrigger: { ...scroll, once: true, onLeave: () => timeline?.progress(1) },
            onComplete: () => completed.add(number),
          });
          timeline.from(number, { opacity: 0, duration: .5, clearProps: 'opacity' }, 0)
            .from(panel.querySelector('[data-part-rule]'), { scaleX: 0, duration: .7, ease: 'power3.out', clearProps: 'transform' }, .06)
            .from(panel.querySelectorAll('.zara-details__copy > p'), { y: 16, opacity: 0, duration: .65, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' }, .16);
          // Only static visual groups: interactive list/folder retain ownership.
          if (index < 2) timeline.from(panel.querySelector(index === 0 ? '.diptyque-laptop-preview' : '.zara-details__products'),
            { y: 10, opacity: 0, duration: .7, ease: 'power3.out', clearProps: 'transform,opacity' }, .2);
        }
      });
      return () => cleanups.reverse().forEach(cleanup => cleanup());
    });
    ScrollTrigger.refresh();
  });
  return () => { disposed = true; media?.revert(); destroyHorizontal(); };
}
