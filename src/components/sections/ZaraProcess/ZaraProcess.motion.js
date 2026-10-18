import { gsap } from '../../../motion/scroll';

export function initZaraProcess(root) {
  let sequence;
  const context = gsap.context(() => {}, root);
  const media = gsap.matchMedia();
  const targets = () => root.querySelectorAll('[data-copy], [data-sheet], [data-finding], [data-highlight]');
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(root.querySelectorAll('[data-entry]'), {
      scrollTrigger: { trigger: root, start: 'top 85%', once: true },
      y: 20, opacity: 0, duration: .6, stagger: .08,
      ease: 'power3.out', clearProps: 'transform,opacity',
    });
    return () => { sequence?.kill(); gsap.set(targets(), { clearProps: 'transform,opacity,--finding-reveal' }); };
  });
  return {
    change(commit, type = 'step') {
      sequence?.kill();
      gsap.set(targets(), { clearProps: 'transform,opacity,--finding-reveal' });
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { commit(); return; }
      context.add(() => {
        const pageTurn = type === 'document';
        sequence = gsap.timeline({ defaults: { ease: 'power3.out' } });
        sequence.to(root.querySelectorAll('[data-sheet]'), {
          opacity: 0, scale: .975, x: pageTurn ? -24 : 0,
          rotationY: pageTurn ? -5 : 0, duration: .16,
        }, 0).to(root.querySelectorAll(pageTurn ? '[data-finding]' : '[data-copy], [data-finding]'),
          { opacity: 0, y: -5, duration: .13 }, 0)
          .call(() => {
            commit();
            sequence.fromTo(root.querySelectorAll('[data-sheet]'),
              { opacity: 0, scale: .975, x: pageTurn ? 28 : 0, y: pageTurn ? 0 : 12, rotationY: pageTurn ? 5 : 0 },
              { opacity: 1, scale: 1, x: 0, y: 0, rotationY: 0, duration: .45, clearProps: 'transform,opacity' }, .16);
            if (!pageTurn) sequence.fromTo(root.querySelectorAll('[data-copy]'),
              { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .36, clearProps: 'transform,opacity' }, .22);
            const findings = root.querySelectorAll('[data-finding]:not([hidden])');
            const highlights = root.querySelectorAll('[data-finding]:not([hidden]) [data-highlight]');
            if (findings.length) sequence.fromTo(findings,
              { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .45, ease: 'power2.out', clearProps: 'transform,opacity' }, .3);
            if (highlights.length) sequence.fromTo(highlights,
              { '--finding-reveal': '0%' }, { '--finding-reveal': '100%', duration: .5, ease: 'power2.out' }, .36);
          }, [], .16);
      });
    },
    destroy() { sequence?.kill(); media.revert(); context.revert(); },
  };
}
