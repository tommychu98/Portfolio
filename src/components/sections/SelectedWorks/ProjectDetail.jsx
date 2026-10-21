import { useEffect, useRef, useState } from 'react';
import ProjectCards from './ProjectCards';
import { ProjectName } from './ProjectTitle';
import { animateDetail } from './SelectedWorks.motion';
import { pauseScroll } from '../../../motion/scroll';
import MedipeelDetail from './MedipeelDetail';

export default function ProjectDetail({ project, origin, onClosed }) {
  const dialog=useRef(null), motion=useRef(null), closing=useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  useEffect(()=>{
    const element=dialog.current;
    const previous=document.body.style.overflow;
    element.showModal(); pauseScroll(true); document.body.style.overflow='hidden';
    motion.current=animateDetail(element,origin);
    return ()=>{motion.current?.destroy();element.close();document.body.style.overflow=previous;pauseScroll(false);};
  },[origin]);
  const close=()=>{if(closing.current)return;closing.current=true;setIsClosing(true);motion.current.close(onClosed);};
  return <dialog ref={dialog} id="selected-work-detail" className={`sw-detail${project.detail ? ' sw-detail--medipeel' : ''}`} aria-labelledby="selected-detail-title" data-lenis-prevent onCancel={event=>{event.preventDefault();close();}} style={{'--sw-background':project.detail?.background || project.background,'--sw-accent':project.detail?.accent || project.accent,'--sw-foreground':project.detail?.foreground || project.foreground}}>
    <div className="sw-detail__visual" data-detail-visual aria-hidden="true"><ProjectCards project={project} active detail/><div className="sw-detail__display sw-name" data-detail-title><ProjectName project={project}/></div></div>
    <button className="sw-detail__close" autoFocus onClick={close} aria-label="프로젝트 상세 닫기">{project.detail ? 'Back to Works' : 'Back Home'} <span aria-hidden="true">↙</span></button>
    <div className="sw-detail__content" data-detail-content>
      {project.detail ? <MedipeelDetail project={project} onClose={close} isClosing={isClosing}/> : <>
      <header><p className="sw-category">{project.category}</p><h2 id="selected-detail-title">{project.name}</h2><p className="sw-detail__introduction">{project.introduction}</p></header>
      {project.tools && <p className="sw-detail__tools"><span>Tools</span>{project.tools}</p>}
      <div className="sw-detail__paragraphs">{project.paragraphs.map((paragraph,index)=><p key={index}>{paragraph.map((part,i)=>part.emphasis?<strong key={i}>{part.text}</strong>:part.text)}</p>)}</div>
      <div className="sw-detail__images">{project.images.map(image=><figure key={image.kind} className={`sw-detail__image--${image.kind}`}><img src={image.src} alt={image.alt} loading="lazy"/><figcaption>{image.caption}</figcaption></figure>)}</div>
      <div className="sw-detail__links">{project.links.map(link=><a className="sw-button sw-button--primary" href={link.href} key={link.label} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}<button className="sw-button sw-button--back" onClick={close}>Back Home ↙</button></div>
      </>}
    </div>
  </dialog>;
}
