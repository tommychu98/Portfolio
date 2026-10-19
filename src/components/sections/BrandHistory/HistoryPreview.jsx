import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../../../motion/scroll';
import usePreviewGif from './usePreviewGif';

// Two full documents overlap only at the loop boundary: the last frame never
// jumps or scrolls backwards to reach the first frame.
export default function HistoryPreview({ chapter, active }) {
  const viewport = useRef(null);
  const loop = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting && active) setMounted(true);
    }, { rootMargin: '300px' });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [active]);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);
  const scale = size.width / 1920;
  usePreviewGif(viewport, { active, visible, paused: false, reduced, ready, scale });
  const distance = Math.max(0, chapter.previewHeight * scale - size.height);
  const duration = Math.max(14, distance / 44);
  useLayoutEffect(() => {
    if (ready < 2 || !size.width) return;
    const [page, reset] = viewport.current.querySelectorAll('[data-preview-page]');
    const timeline = gsap.timeline({ paused: true, repeat: -1 });
    gsap.set(page, { y: 0, opacity: 1 }); gsap.set(reset, { opacity: 0 });
    timeline.to(page, { y: -distance, duration, ease: 'none' }, 2)
      .to(reset, { opacity: 1, duration: 1.6, ease: 'sine.inOut' }, duration + 4)
      .set(page, { y: 0 }, duration + 5.6)
      .set(reset, { opacity: 0 }, duration + 5.6);
    loop.current = timeline;
    return () => { timeline.kill(); loop.current = null; };
  }, [ready, size.width, distance, duration]);
  useEffect(() => {
    const update = () => {
      // The requested full-page presentation pans automatically, including
      // when reduced motion is enabled. Only inactive/offscreen views pause.
      const running = active && visible && !document.hidden;
      loop.current?.paused(!running);
    };
    update(); document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, [active, visible, ready, size.width, distance]);
  return <div className="history-preview">
    <div ref={viewport} className="history-preview__viewport" aria-label={`${chapter.title} 전체 페이지 미리보기`} data-preview-duration={duration} data-preview-distance={distance}>
      {mounted && [0, 1].map(index => <div className="history-preview__page" data-preview-page key={index} aria-hidden="true">
        <iframe src={chapter.preview} title={`${chapter.title} 전체 페이지 ${index + 1}`} sandbox="allow-same-origin" tabIndex={-1} onLoad={() => setReady(count => count + 1)} style={{ width: 1920, height: chapter.previewHeight, transform: `scale(${scale})` }} />
      </div>)}
    </div>
  </div>;
}
