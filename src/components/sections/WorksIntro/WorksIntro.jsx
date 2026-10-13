import SectionLabel from '../../ui/SectionLabel';
import useReveal from '../../../motion/useReveal';
import './WorksIntro.css';
export default function WorksIntro(){const ref=useReveal();return <section id="work" ref={ref} className="works-intro paper-grain" aria-labelledby="work-title"><SectionLabel number="05">SELECTED WORKS</SectionLabel><div className="works-intro__row"><h2 id="work-title" className="display" data-reveal>Selected<br/><em>works.</em></h2><div data-reveal><p>하나의 팀 프로젝트, 두 개의 개인 작업.<br/>그리고 화면을 만들며 쌓아온 세 개의 연습.</p><p>브랜드의 감각과 정보의 흐름을<br/>서로 다른 화면으로 연결합니다.</p><div className="works-intro__index"><a href="#zara">01—03 WEB</a><a href="#film">03 FILMS</a><a href="#clone">03 STUDIES</a></div></div></div></section>;}
