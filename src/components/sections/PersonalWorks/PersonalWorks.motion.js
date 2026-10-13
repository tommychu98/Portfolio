import { gsap, ScrollTrigger, scrollToPosition } from '../../../motion/scroll';

// Reference: project-portfolio-gules.vercel.app — paired cards on a 20° orbit.
// The pin, queries and cleanup belong only to this section. Reuse the app's Lenis.
export function initPersonalWorks(root, onSelect) {
  const stage = root.querySelector('[data-personal-stage]');
  const works = [...root.querySelectorAll('[data-personal-work]')];
  const holders = works.map(work => work.querySelector('[data-personal-holder]'));
  const copies = works.map(work => work.querySelector('[data-personal-copy]'));
  const mm = gsap.matchMedia();
  let trigger;
  let timeline;
  let current = -1;
  let transitions = [];

  function activate(index, immediate = false) {
    if (current === index) return;
    current = index;
    transitions.forEach(tween => tween.kill());
    transitions = [];
    works.forEach((work, i) => {
      const selected = i === index;
      work.inert = !selected;
      work.setAttribute('aria-hidden', String(!selected));
      work.classList.toggle('personal-works__work--active', selected);
      transitions.push(gsap.to(copies[i], { autoAlpha: selected ? 1 : 0, y: selected ? 0 : 28, duration: immediate ? 0 : .4, ease: 'power3.out', overwrite: true }));
      transitions.push(gsap.to(work.querySelector('.personal-works__card--back'), { xPercent: selected ? -26 : 0, yPercent: selected ? -7 : 0, rotation: selected ? -11 : 0, duration: immediate ? 0 : .6, ease: 'power3.out', overwrite: true }));
      transitions.push(gsap.to(work.querySelector('.personal-works__card--front'), { xPercent: selected ? 26 : 0, yPercent: selected ? 7 : 0, rotation: selected ? 9 : 0, duration: immediate ? 0 : .6, ease: 'power3.out', overwrite: true }));
    });
    onSelect(index);
  }

  mm.add('(min-width: 1024px) and (min-height: 740px)', () => {
    root.classList.add('personal-works--orbit');
    current = -1;
    holders.forEach((holder, index) => gsap.set(holder, { rotation: index * 20 }));
    activate(0, true);
    timeline = gsap.timeline({ scrollTrigger: {
      trigger: stage, start: 'top top', end: () => `+=${window.innerHeight * (works.length - 1)}`,
      pin: stage, scrub: .35, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: self => activate(Math.round(self.progress * (works.length - 1))),
    }});
    holders.forEach((holder, index) => timeline.to(holder, { rotation: (index - works.length + 1) * 20, duration: 1, ease: 'none' }, 0));
    trigger = timeline.scrollTrigger;
    return () => {
      transitions.forEach(tween => tween.kill());
      transitions = [];
      trigger = null;
      timeline = null;
      current = -1;
      root.classList.remove('personal-works--orbit');
      works.forEach(work => { work.inert = false; work.removeAttribute('aria-hidden'); work.classList.remove('personal-works__work--active'); });
      // onUpdate tweens are created after matchMedia's synchronous context.
      gsap.set([...copies, ...holders, ...root.querySelectorAll('.personal-works__card')], { clearProps: 'transform,opacity,visibility' });
    };
  });

  return {
    select(index) {
      index = Math.max(0, Math.min(works.length - 1, index));
      if (trigger) {
        const progress = index / (works.length - 1);
        scrollToPosition(trigger.start + progress * (trigger.end - trigger.start), true);
        ScrollTrigger.update();
        timeline.progress(progress);
        activate(index);
      } else {
        scrollToPosition(works[index], true);
        onSelect(index);
      }
    },
    destroy() { mm.revert(); },
  };
}

export function animatePersonalDetail(dialog, source) {
  const art = dialog.querySelector('[data-detail-art]');
  const copy = dialog.querySelector('[data-detail-copy]');
  let timeline;
  const context = gsap.context(() => {
    const target = art.getBoundingClientRect();
    timeline = gsap.timeline();
    timeline.fromTo(art, {
      x: source.left - target.left, y: source.top - target.top,
      scale: target.width ? source.width / target.width : 1, transformOrigin: 'top left',
    }, { x: 0, y: 0, scale: 1, duration: 1.2, ease: 'expo.out' }, 0)
      .fromTo(copy, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'expo.out' }, .15);
  }, dialog);
  return {
    close(done) {
      if (!timeline) { done(); return; }
      timeline.eventCallback('onReverseComplete', done);
      // A very early close still has a nonzero reverse interval.
      if (timeline.progress() === 0) done();
      else timeline.timeScale(1.6).reverse();
    },
    destroy() { context.revert(); },
  };
}
