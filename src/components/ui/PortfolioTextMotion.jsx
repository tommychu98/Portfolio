import { useEffect } from 'react';
import { attachTextReveal } from '../../motion/textReveal';
import { textRevealManifest } from '../../motion/textRevealManifest';

export default function PortfolioTextMotion() {
  useEffect(() => {
    let disposed = false;
    const cleanups = [];
    document.fonts.ready.then(() => {
      if (disposed) return;
      const seen = new Set();
      for (const { selector, ...options } of textRevealManifest) {
        document.querySelectorAll(selector).forEach(node => {
          if (seen.has(node)) return;
          seen.add(node);
          cleanups.push(attachTextReveal(node, options));
        });
      }
    });
    return () => { disposed = true; cleanups.reverse().forEach(cleanup => cleanup()); };
  }, []);
  return null;
}
