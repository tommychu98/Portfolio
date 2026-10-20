import { TitleHighlight } from '../../ui/HighlightTitle';
import content from '../../../data/projects';
import SectionLabel from '../../ui/SectionLabel';
import Link from '../../ui/Link';
import { useEffect, useRef } from 'react';
import { initProfile } from './Profile.motion';
import ProfileHeading from './ProfileHeading';
import './Profile.transition.css';
import './Profile.css';
export default function Profile(){const ref=useRef(null);useEffect(()=>initProfile(ref.current),[]);return <section id="profile" className="profile section-space paper-grain" ref={ref} aria-labelledby="profile-title"><SectionLabel sectionId="profile">HELLO, I'M TOMMY</SectionLabel><ProfileHeading/><div className="profile__layout"><figure><div className="profile__photo"><img src="/media/images/profile/tommy-portrait.png" alt="크림색 손그림 프레임 속 주경덕 프로필 사진" width="1086" height="1448" loading="lazy" decoding="async"/></div><figcaption>TOMMY CHU <span>WEB DESIGN & PUBLISHING</span></figcaption></figure><div className="profile__copy"><span className="fine-print">함께 고민하고, 끝까지 다듬습니다.</span><h2 id="profile-title" className="korean-display">팀의 아이디어를<br/>완성된 화면으로 옮기는<br/><TitleHighlight as="em">주경덕입니다.</TitleHighlight></h2><p>{content.profile.body}</p><Link href="#about">MORE ABOUT ME</Link></div></div></section>;}
