import './WorkValues.transition.css';
import content from '../../../data/projects';
import SectionLabel from '../../ui/SectionLabel';
import useReveal from '../../../motion/useReveal';
import './WorkValues.css';
const valueImages=['explore.png','connect.png','listen.png'];
export default function WorkValues(){const ref=useReveal();return <section id="values" className="work-values section-space" ref={ref} aria-labelledby="values-title"><div className="work-values__exit" data-values-exit><SectionLabel sectionId="values">THE WAY I WORK</SectionLabel><h2 id="values-title" className="work-values__title" data-reveal>경험을 작업으로 이어가는 세 가지 태도.</h2><div className="work-values__grid">{content.values.map((value,i)=><article key={value.title} data-reveal><div className={`work-values__art work-values__art--${i}`} aria-hidden="true"><img src={`/media/images/work-values/${valueImages[i]}`} alt=""/></div><div className="work-values__heading"><span>0{i+1}</span><h3>{value.title}</h3></div><p>{value.body}</p></article>)}</div></div></section>;}
