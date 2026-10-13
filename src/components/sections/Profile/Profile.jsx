import content from '../../../data/projects';
import Photo from '../../ui/Photo';
import SectionLabel from '../../ui/SectionLabel';
import Link from '../../ui/Link';
import { useEffect, useRef } from 'react';
import { initProfile } from './Profile.motion';
import ProfileHeading from './ProfileHeading';
import './Profile.transition.css';
import './Profile.css';
export default function Profile(){const ref=useRef(null);useEffect(()=>initProfile(ref.current),[]);return <section id="profile" className="profile section-space paper-grain" ref={ref} aria-labelledby="profile-title"><SectionLabel number="04">HELLO, I'M TOMMY</SectionLabel><ProfileHeading/><div className="profile__layout"><figure><div className="profile__photo"><Photo kind="portrait" alt="주경덕 프로필 이미지"/></div><figcaption>TOMMY CHU <span>WEB DESIGN & PUBLISHING</span></figcaption></figure><div className="profile__copy"><span className="fine-print">함께 고민하고, 끝까지 다듬습니다.</span><h2 id="profile-title" className="korean-display">팀의 아이디어를<br/>완성된 화면으로 옮기는<br/><em>주경덕입니다.</em></h2><p>{content.profile.body}</p><Link href="#about">MORE ABOUT ME</Link></div></div></section>;}
