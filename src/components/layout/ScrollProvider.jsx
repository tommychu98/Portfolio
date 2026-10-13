import { useEffect } from 'react';
import { initScroll } from '../../motion/scroll';
export default function ScrollProvider({children}) {
  useEffect(initScroll,[]);
  return children;
}
