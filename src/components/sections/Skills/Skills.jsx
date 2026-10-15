import content from '../../../data/projects';
import SectionLabel from '../../ui/SectionLabel';
import useReveal from '../../../motion/useReveal';
import './Skills.css';
export default function Skills(){const ref=useReveal();return <section id="skills" className="skills section-space" ref={ref} aria-labelledby="skills-title"><SectionLabel number="13">TOOLS & SKILLS</SectionLabel><h2 id="skills-title" className="display" data-reveal>Tools into<br/><em>practice.</em></h2><div className="skills__list">{content.skills.map((skill,i)=><article key={skill.name} data-reveal><span className="skills__category">0{i+1} / {skill.name}</span><h3>{skill.tools.map((tool,j)=><span key={tool}>{j>0&&<span className="skills__divider" aria-hidden="true"> / </span>}{tool}</span>)}</h3><p>{skill.body}</p></article>)}</div></section>;}
