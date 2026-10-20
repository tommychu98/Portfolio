import { useRef } from 'react';
import useTextReveal from '../../motion/useTextReveal';

export default function AnimatedText({ as: Tag = 'p', variant = 'body', highlight, children, ...props }) {
  const ref = useRef(null);
  useTextReveal(ref, { variant, highlight }, children);
  return <Tag ref={ref} {...props}>{children}</Tag>;
}
