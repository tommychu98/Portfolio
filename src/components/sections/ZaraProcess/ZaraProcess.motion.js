import { gsap } from '../../../motion/scroll';

export function initZaraProcess(root) {
  let sequence;
  const context = gsap.context(() => {}, root);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 85%', once: true } })
      .from(root.querySelectorAll('[data-entry]'), { y: 20, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity' })
      .from(root.querySelectorAll('[data-sheet]'), { y: 20, opacity: 0, duration: .5, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity' }, .25);
  });
  return {
    change(commit) {
      sequence?.kill();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        commit();
        gsap.set(root.querySelectorAll('[data-copy], [data-sheet], [data-finding]'), { clearProps: 'transform,opacity' });
        return;
      }
      context.add(() => {
        sequence = gsap.timeline({ defaults: { ease: 'power3.out' } });
        sequence.to(root.querySelectorAll('[data-copy], [data-finding]'), { opacity: 0, y: -6, duration: .15 }, 0)
          .to(root.querySelectorAll('[data-sheet]'), { opacity: 0, scale: .97, y: 10, duration: .15 }, 0)
          .call(() => {
            commit();
            sequence.fromTo(root.querySelectorAll('[data-copy]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .4, clearProps: 'transform,opacity' }, .15)
              .fromTo(root.querySelectorAll('[data-sheet]'), { opacity: 0, y: 30, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .45, stagger: .08, clearProps: 'transform,opacity' }, .2)
              .fromTo(root.querySelectorAll('[data-finding]'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .3, clearProps: 'transform,opacity' }, .48);
          }, [], .15);
      });
    },
    destroy() { sequence?.kill(); context.revert(); media.revert(); },
  };
}

export function arrangeDocuments(root) {
  const context = gsap.context(() => {}, root);
  const media = gsap.matchMedia();
  let selected;
  let conditions = { mobile: window.matchMedia('(max-width: 700px)').matches, reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
  const layout = () => {
    if (!selected) return;
    context.add(() => {
      const elements = [...root.querySelectorAll('[data-document]')];
      const others = elements.map(element => element.dataset.document).filter(id => id !== selected);
      elements.forEach(element => {
        const front = element.dataset.document === selected;
        const side = others.indexOf(element.dataset.document) === 0 ? -1 : 1;
        gsap.to(element, {
          xPercent: conditions.mobile || front ? 0 : side * 11,
          y: conditions.mobile || front ? 0 : side < 0 ? 24 : 44,
          rotation: conditions.mobile || front ? 0 : side * 3,
          scale: front ? (conditions.mobile ? 1 : 1.04) : .93,
          opacity: conditions.mobile && !front ? 0 : 1,
          duration: conditions.reduced ? 0 : .5, ease: 'power3.out', overwrite: true,
        });
      });
    });
  };
  media.add({ desktop: '(min-width: 701px)', mobile: '(max-width: 700px)', reduced: '(prefers-reduced-motion: reduce)' }, current => {
    conditions = current.conditions;
    layout();
  });
  return { select(value) { selected = value; layout(); }, destroy() { media.revert(); context.revert(); } };
}
