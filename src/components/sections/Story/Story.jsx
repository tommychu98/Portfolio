import { useEffect, useRef } from 'react';
import content from '../../../data/projects';
import Photo from '../../ui/Photo';
import SectionLabel from '../../ui/SectionLabel';
import StoryTransition from './StoryTransition';
import { initStoryTransition } from './StoryTransition.motion';
import './Story.css';
import './StoryTransition.css';
export default function Story(){
  const ref=useRef(null);
  useEffect(()=>{
    const cleanupTransition=initStoryTransition(ref.current);
    return cleanupTransition;
  },[]);
  return <section id="story" ref={ref} className="story section-space" aria-labelledby="story-title">
    <StoryTransition/>
    <div className="story__body section-space">
    <div className="story__object story__object--office" aria-hidden="true"><Photo kind="office"/></div><div className="story__object story__object--fashion" aria-hidden="true"><Photo kind="fashion"/></div><div className="story__object story__object--tea" aria-hidden="true"><Photo kind="tea"/></div><div className="story__object story__object--plan" aria-hidden="true"><img src="/media/images/zara-methodology/lean.png" alt="" loading="lazy"/></div>
    <div className="story__copy"><SectionLabel number="02">A NEW CHAPTER</SectionLabel><p className="story__lead korean-display">낯선 경험을 받아들이며,<br/>표현할 수 있는 방법을 넓혀갑니다.</p>{content.story[1].split('\n\n').map(paragraph=><p key={paragraph}>{paragraph}</p>)}<span className="story__signature">Explore. Learn. Create.</span></div>
    </div>
  </section>;
}
