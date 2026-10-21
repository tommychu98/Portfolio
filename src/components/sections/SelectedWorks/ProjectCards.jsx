import { useEffect, useRef } from 'react';
import Photo from '../../ui/Photo';

export function ProjectMedia({ media, active = false }) {
  const video = useRef(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;

    const sync = () => active ? element.play().catch(() => {}) : element.pause();
    sync();
    return () => { element.pause(); };
  }, [active]);
  if (media.kind) return <Photo kind={media.kind} alt={media.alt}/>;
  if (media.video) return <video ref={video} src={media.video} poster={media.src} muted loop playsInline preload="none" aria-label={media.alt}/>;
  return <img src={media.src} alt={media.alt} style={{objectPosition: media.position || 'center'}} loading="lazy"/>;
}

export default function ProjectCards({ project, active, detail = false }) {
  return <div className={`sw-cards${detail ? ' sw-cards--detail' : ''}`}>
    {project.cards.map((media, index) => <div className="sw-card" data-card key={index}>
      <ProjectMedia media={media} active={active}/><span className="sw-card__shade"/>
    </div>)}
  </div>;
}
