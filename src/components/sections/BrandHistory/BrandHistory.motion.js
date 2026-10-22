import { gsap } from 'gsap';

export const chapterTimes = [0, 2, 4, 6];

// The recording shows staggered rectangular replacements, not a dissolve.
// Every visual state lives on one seekable timeline so reverse scroll is exact.
export function createHistoryTimeline(root, onChapterChange = () => {}) {
  const chapters = [...root.querySelectorAll('[data-history-chapter]')];
  const timeline = gsap.timeline({ paused: true });
  chapters.forEach((chapter, index) => {
    chapter.setAttribute('aria-hidden', String(index !== 0));
    chapter.inert = index !== 0;
    chapter.dataset.active = String(index === 0);
    // Apply the opening frame even before a paused scroll timeline advances.
    gsap.set(chapter.querySelectorAll('[data-history-tile]'), { clipPath: index ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)' });
    gsap.set(chapter.querySelectorAll('[data-history-copy]'), { autoAlpha: index ? 0 : 1, y: 0 });
    timeline.set(chapter.querySelectorAll('[data-history-tile]'), { clipPath: index ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)' }, 0);
    timeline.set(chapter.querySelectorAll('[data-history-copy]'), { autoAlpha: index ? 0 : 1, y: 0 }, 0);
  });
  const hold = { value: 0 };
  timeline.to(hold, { value: 1, duration: 1, ease: 'none' });
  for (let index = 1; index < chapters.length; index++) {
    const current = chapters[index];
    const previous = chapters[index - 1];
    const at = index * 2 - 1;
    timeline.to(previous.querySelectorAll('[data-history-copy], [data-history-heading]'), { autoAlpha: 0, y: -12, duration: .22, ease: 'power2.in' }, at);
    timeline.fromTo(current.querySelectorAll('[data-history-tile]'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'power2.inOut', immediateRender: false }, at);
    timeline.fromTo(current.querySelectorAll('[data-history-heading], [data-history-copy]'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .46, stagger: .06, ease: 'power2.out', immediateRender: false }, at + .35);
    timeline.to(hold, { value: index + 1, duration: 1, ease: 'none' }, at + 1);
  }
  let last = -1;
  timeline.eventCallback('onUpdate', () => {
    const index = Math.min(3, Math.max(0, Math.floor((timeline.time() + .45) / 2)));
    if (last === index) return;
    last = index;
    chapters.forEach((chapter, i) => {
      chapter.setAttribute('aria-hidden', String(i !== index));
      chapter.inert = i !== index;
      chapter.dataset.active = String(i === index);
    });
    onChapterChange(index);
  });
  return timeline;
}
