import { useEffect } from 'react';
import { attachTextReveal } from './textReveal';

export default function useTextReveal(ref, options, content) {
  const { variant = 'body', highlight } = options || {};
  useEffect(() => {
    let disposed = false, cleanup;
    document.fonts.ready.then(() => {
      if (!disposed && ref.current) cleanup = attachTextReveal(ref.current, { variant, highlight });
    });
    return () => { disposed = true; cleanup?.(); };
  }, [ref, variant, highlight, content]);
}
