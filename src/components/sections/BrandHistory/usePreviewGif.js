import { useEffect, useRef } from 'react';
import { gsap } from '../../../motion/scroll';
import { singlePlayGif } from './singlePlayGif';

// Playback is owned by the viewer, not the iframe or its repeating pan.
// A chapter's GIF is consumed once, including after resize, re-entry and loops.
export default function usePreviewGif(viewport, { active, visible, paused, reduced, ready, scale }) {
  const consumed = useRef(new Set());
  const pauseState = useRef(paused);
  useEffect(() => { pauseState.current = paused; }, [paused]);
  useEffect(() => {
    if (ready < 2) return;
    const frames = [...viewport.current.querySelectorAll('iframe')];
    const primary = frames[0];
    const images = [...(primary?.contentDocument?.querySelectorAll('[data-once-gif]') || [])];
    frames.slice(1).forEach(frame => frame.contentDocument?.querySelectorAll('[data-once-gif]').forEach(img => { img.style.visibility = 'hidden'; }));
    images.forEach(img => { if (consumed.current.has(img.dataset.onceGif) || reduced) img.style.visibility = 'hidden'; });
    if (!active || !visible || reduced) return;
    let disposed = false;
    const abort = new AbortController();
    const timers = new Set();
    const urls = new Set();
    const check = () => {
      if (pauseState.current || document.hidden) return;
      const bounds = viewport.current.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      for (const img of images) {
        const src = img.dataset.onceGif;
        if (consumed.current.has(src)) continue;
        const rect = img.getBoundingClientRect();
        // The PNG includes a wide transparent canvas. Measure the man's
        // actual silhouette, so the viewport contains him before he leaves.
        const [subjectX, subjectY, subjectWidth, subjectHeight] = (img.dataset.gifSubject || '0,0,1,1').split(',').map(Number);
        const frame = primary.getBoundingClientRect();
        const top = frame.top + (rect.top + rect.height * subjectY) * scale;
        const bottom = top + rect.height * subjectHeight * scale;
        const left = frame.left + (rect.left + rect.width * subjectX) * scale;
        const right = left + rect.width * subjectWidth * scale;
        const seen = Math.min(bottom, bounds.bottom, window.innerHeight) - Math.max(top, bounds.top, 0);
        const seenWidth = Math.min(right, bounds.right, window.innerWidth) - Math.max(left, bounds.left, 0);
        const requiredRatio = Number(img.dataset.gifVisibleRatio || .5);
        if (seenWidth <= 0 || seen < Math.min(rect.height * subjectHeight * scale, bounds.height) * requiredRatio) continue;
        consumed.current.add(src);
        img.dataset.playback = 'loading';
        fetch(src, { signal: abort.signal }).then(response => {
          if (!response.ok) throw new Error('GIF unavailable');
          return response.arrayBuffer();
        }).then(buffer => {
          if (disposed) return;
          const { blob, duration } = singlePlayGif(buffer);
          const url = URL.createObjectURL(blob); urls.add(url);
          const finish = () => { img.style.visibility = 'hidden'; img.dataset.playback = 'finished'; URL.revokeObjectURL(url); urls.delete(url); };
          img.onload = () => {
            img.dataset.playback = 'playing';
            timers.add(setTimeout(finish, duration));
          };
          img.onerror = finish;
          img.src = url;
        }).catch(() => { if (!disposed) { img.style.visibility = 'hidden'; img.dataset.playback = 'finished'; } });
      }
    };
    gsap.ticker.add(check);
    return () => {
      disposed = true; abort.abort(); gsap.ticker.remove(check);
      timers.forEach(clearTimeout); urls.forEach(url => URL.revokeObjectURL(url));
      images.forEach(img => { img.onload = null; img.onerror = null; });
    };
  }, [viewport, active, visible, reduced, ready, scale]);
}
