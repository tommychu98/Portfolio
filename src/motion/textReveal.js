import { gsap, ScrollTrigger } from './scroll';
import { SplitText } from 'gsap/SplitText';
import './text-motion.css';

gsap.registerPlugin(SplitText);

export const textExclusions = '[data-no-text-animation],[data-reveal],[data-entry],[data-copy],[data-finding],[data-personal-copy],[data-history-copy],[data-values-exit],button,a,summary,input,textarea,select,[aria-live],.sr-only';

// Explicit opt-in only. This guard is a second line of defense, not motion detection.
export function attachTextReveal(element, { variant = 'body', highlight } = {}) {
  if (element.closest(textExclusions) || element.querySelector(textExclusions) || element.dataset.textMotion) return () => {};
  let split, tween, trigger, disposed = false, finished = false;
  const context = gsap.context(() => {}, element);
  element.dataset.textMotion = variant;
  const highlights = highlight ? [...element.querySelectorAll(highlight)] : [];
  highlights.forEach(node => node.classList.add('text-motion-highlight'));
  const finish = () => {
    finished = true;
    element.dataset.textRevealed = 'true';
    // Restore native kerning, inline semantics and the exact original DOM.
    queueMicrotask(() => { if (!disposed) split?.revert(); });
  };
  const media = gsap.matchMedia();
  media.add({ reduce: '(prefers-reduced-motion: reduce)', animate: '(prefers-reduced-motion: no-preference)' }, match => {
    if (match.conditions.reduce || finished) {
      split?.revert();
      element.dataset.textRevealed = 'true';
      return;
    }
    context.add(() => {
      const animate = (parts, title = false) => {
        tween = gsap.timeline({ paused: true, onComplete: finish });
        tween.fromTo(parts, { opacity: 0, y: title ? 0 : variant === 'label' ? 8 : variant === 'subtitle' ? 24 : 16, yPercent: title ? 105 : 0 }, {
          opacity: 1, y: 0, yPercent: 0,
          duration: title ? .92 : variant === 'label' ? .48 : .75,
          stagger: title ? { each: .016, amount: Math.min(.42, parts.length * .016) } : .08,
          ease: title || variant === 'subtitle' ? 'power3.out' : 'power2.out',
          clearProps: 'transform,opacity',
        }, variant === 'label' ? 0 : variant === 'title' ? .06 : .12);
        if (highlights.length) tween.fromTo(element, { '--text-highlight': '0%' }, { '--text-highlight': '100%', duration: .65, ease: 'power2.inOut' }, .55);
        trigger?.kill();
        trigger = ScrollTrigger.create({ trigger: element, start: 'clamp(top 88%)', once: true,
          onEnter: () => tween.play(), onLeave: () => tween.progress(1),
          onRefresh: self => { if (self.progress === 1 && !finished) tween.progress(1); },
        });
        if (element.getBoundingClientRect().top < innerHeight * .88) tween.play();
        return tween;
      };
      if (variant === 'label') animate([element]);
      else {
        try {
          split = SplitText.create(element, {
            type: variant === 'title' ? 'lines,words,chars' : 'lines',
            mask: 'lines', linesClass: 'text-motion-line', wordsClass: 'text-motion-word', autoSplit: true,
            aria: 'auto', deepSlice: true,
            onSplit: self => {
              // A mixed-script word can cross a native line boundary. If a measured
              // line wraps again, preserve typography instead of adding an extra row.
              const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
              if (variant !== 'title' && self.lines.some(line => line.offsetHeight > lineHeight * 1.5)) {
                queueMicrotask(() => {
                  if (disposed) return;
                  self.revert();
                  element.dataset.textMotionFallback = 'native-wrap';
                  context.add(() => animate([element]));
                });
                return;
              }
              return animate(variant === 'title' ? self.chars : self.lines, variant === 'title');
            },
          });
        } catch {
          split?.revert();
          element.dataset.textRevealed = 'true';
        }
      }
    });
    return () => { trigger?.kill(); tween?.revert(); split?.revert(); };
  });
  return () => {
    disposed = true;
    media.revert(); trigger?.kill(); tween?.kill(); split?.revert(); context.revert();
    highlights.forEach(node => node.classList.remove('text-motion-highlight'));
    delete element.dataset.textMotion; delete element.dataset.textRevealed;
    delete element.dataset.textMotionFallback;
  };
}
