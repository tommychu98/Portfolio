import { gsap } from '../../../motion/scroll';

export function exitProgress(progress, sectionHeight, viewportHeight) {
  const hold = Math.max(0, 1 - viewportHeight / Math.max(1, sectionHeight));
  const active = Math.max(0, Math.min(1, (progress - hold) / (1 - hold)));
  return 1 - (1 - active) ** 2; // power1.out, after long content has been visible.
}

export function initWorkValuesExit(root) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(root.querySelector('[data-values-exit]'), { y: 0 }, {
      y: () => window.innerWidth < 640 ? 300 : 500,
      ease: progress => exitProgress(progress, root.offsetHeight, window.innerHeight),
      scrollTrigger: {
        id: 'values-profile-exit', trigger: root,
        start: 'top top', end: 'bottom top', scrub: 1, invalidateOnRefresh: true,
      },
    });
  });
  return () => media.revert();
}
