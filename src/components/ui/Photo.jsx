import { useId } from 'react';
import { imageTiles } from '../../data/projects';

// Crop the original six-image sheet without changing its pixels or proportions.
export default function Photo({ kind, alt = '', className = '' }) {
  const id = useId();
  if(kind==='byredo') return <svg className={`photo ${className}`} viewBox="730 80 500 580" preserveAspectRatio="xMidYMid slice" role={alt?'img':undefined} aria-labelledby={alt?id:undefined} aria-hidden={alt?undefined:true}>{alt&&<title id={id}>{alt}</title>}<image href="/media/images/shortform/hero-poster.png" width="1280" height="720"/></svg>;
  const [x,y] = imageTiles[kind];
  return <svg className={`photo ${className}`} viewBox={`${x*512} ${y*512} 512 512`} preserveAspectRatio="xMidYMid slice" role={alt ? 'img' : undefined} aria-labelledby={alt ? id : undefined} aria-hidden={alt ? undefined : true}>
    {alt && <title id={id}>{alt}</title>}
    <image href="/media/assets/editorial-sheet.png" width="1536" height="1024" />
  </svg>;
}
