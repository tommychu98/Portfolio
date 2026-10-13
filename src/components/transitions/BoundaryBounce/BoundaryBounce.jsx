import { useId, useLayoutEffect, useRef } from 'react';
import { initBoundaryBounce, boundaryPath } from './BoundaryBounce.motion';
import './BoundaryBounce.css';

export default function BoundaryBounce({ id, from, to }) {
  const ref = useRef(null);
  const clip = useId().replace(/:/g, '');
  useLayoutEffect(() => initBoundaryBounce(ref.current, id), [id]);
  return <div ref={ref} className="boundary-bounce" data-boundary={id} aria-hidden="true"
    style={{ '--boundary-from': from, '--boundary-to': to }}>
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" focusable="false">
      <defs>
        <clipPath id={`${clip}-above`}><rect width="1000" height="50" /></clipPath>
        <clipPath id={`${clip}-below`}><rect y="50" width="1000" height="50" /></clipPath>
      </defs>
      <path d={boundaryPath(0)} fill="var(--boundary-to)" clipPath={`url(#${clip}-above)`} />
      <path d={boundaryPath(0)} fill="var(--boundary-from)" clipPath={`url(#${clip}-below)`} />
    </svg>
  </div>;
}
