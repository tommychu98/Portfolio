import { gsap } from '../../../motion/scroll';

export function initPortfolioProcess(root) {
  let sequence;
  let cursorSequence;
  let cursorPlayed = false;
  const context = gsap.context(() => {}, root);
  const media = gsap.matchMedia();
  const targets = () => root.querySelectorAll('[data-copy], [data-sheet], [data-finding], [data-highlight], [data-selection], [data-work-frame="selected"]');
  const showCursor = () => {
    if (cursorPlayed || window.matchMedia('(max-width: 700px), (prefers-reduced-motion: reduce)').matches) return;
    cursorPlayed = true;
    const cursor = root.querySelector('[data-work-cursor]');
    if (!cursor) return;
    context.add(() => {
      const selected=root.querySelector('[data-work-frame="selected"]')?.getBoundingClientRect();
      const canvas=root.querySelector('.workspace-canvas')?.getBoundingClientRect();
      if(selected&&canvas)gsap.set(cursor,{left:selected.left-canvas.left+selected.width*.25,top:selected.top-canvas.top+selected.height*.3});
      cursorSequence = gsap.timeline().fromTo(cursor, {autoAlpha:0,x:75,y:65}, {autoAlpha:1,x:0,y:0,duration:.7,ease:'power2.out'})
        .fromTo(root.querySelector('[data-selection]'),{opacity:0},{opacity:1,duration:.3},.45)
        .to(cursor,{autoAlpha:0,duration:.2},1.1);
    });
  };
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(root.querySelectorAll('[data-entry]'), {
      scrollTrigger: { trigger: root, start: 'top 85%', once: true },
      y: 20, opacity: 0, duration: .6, stagger: .08,
      ease: 'power3.out', clearProps: 'transform,opacity',
      onComplete: showCursor,
    });
    return () => { sequence?.kill(); cursorSequence?.kill(); gsap.set(targets(), { clearProps: 'transform,opacity,--finding-reveal' }); gsap.set(root.querySelectorAll('[data-work-cursor]'),{autoAlpha:0}); };
  });
  return {
    change(commit, type = 'step') {
      sequence?.kill();
      cursorSequence?.kill();
      gsap.set(root.querySelectorAll('[data-work-cursor]'),{autoAlpha:0});
      gsap.set(targets(), { clearProps: 'transform,opacity,--finding-reveal' });
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { commit(); return; }
      context.add(() => {
        const pageTurn = type === 'document';
        sequence = gsap.timeline({ defaults: { ease: 'power3.out' } });
        sequence.to(root.querySelectorAll('[data-sheet]'), {
          opacity: pageTurn ? 1 : .45, x: pageTurn ? 0 : -32,
          y: pageTurn ? 0 : -18, duration: .16,
        }, 0).to(root.querySelectorAll(pageTurn ? '[data-finding]' : '[data-copy], [data-finding]'),
          { opacity: 0, y: -5, duration: .13 }, 0)
          .call(() => {
            commit();
            sequence.fromTo(root.querySelectorAll('[data-sheet]'),
              { opacity: pageTurn ? 1 : .45, x: pageTurn ? 0 : 48, y: pageTurn ? 0 : 28 },
              { opacity: 1, x: 0, y: 0, duration: .65, clearProps: 'transform,opacity' }, .16);
            if (!pageTurn) sequence.fromTo(root.querySelectorAll('[data-copy]'),
              { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .36, clearProps: 'transform,opacity' }, .22);
            const findings = root.querySelectorAll('[data-finding]:not([hidden])');
            sequence.fromTo(root.querySelectorAll('[data-selection]'),{opacity:0},{opacity:1,duration:.35,clearProps:'opacity'},.35);
            const highlights = root.querySelectorAll('[data-finding]:not([hidden]) [data-highlight]');
            if (findings.length) sequence.fromTo(findings,
              { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .45, ease: 'power2.out', clearProps: 'transform,opacity' }, .3);
            if (highlights.length) sequence.fromTo(highlights,
              { '--finding-reveal': '0%' }, { '--finding-reveal': '100%', duration: .5, ease: 'power2.out' }, .36);
          }, [], .16);
      });
    },
    destroy() { sequence?.kill(); cursorSequence?.kill(); media.revert(); context.revert(); },
  };
}
