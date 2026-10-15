import content from '../../../data/projects';
import Photo from '../../ui/Photo';
import SectionLabel from '../../ui/SectionLabel';
import useReveal from '../../../motion/useReveal';
import './About.css';
export default function About(){const ref=useReveal();return <section id="about" className="about section-space paper-grain" ref={ref} aria-labelledby="about-title"><SectionLabel number="13">MORE ABOUT ME</SectionLabel><div className="about__layout"><h2 id="about-title" className="display" data-reveal>WHAT<br/><em>SHAPES</em><br/>ME.</h2><div className="about__copy" data-reveal><div className="about__photo"><Photo kind="office" alt="정리된 노트와 노트북이 놓인 업무 공간"/></div><h3>{content.about.title}</h3>{content.about.body.split('\n\n').map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div></div><div className="about__qa"><h3><em>Quick</em> Q&A</h3><div>{content.questions.map((item,i)=><details key={item.q}><summary><span className="about__question"><span className="about__number">0{i+1} / {item.category}</span><span>Q. {item.q}</span></span><span className="about__plus" aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div></div></section>;}
