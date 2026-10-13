import SectionLabel from '../../ui/SectionLabel';
import Link from '../../ui/Link';
import useReveal from '../../../motion/useReveal';
import './Closing.css';
export default function Closing(){const ref=useReveal();return <section id="closing" className="closing section-space" ref={ref} aria-labelledby="closing-title"><SectionLabel number="14">THE NEXT CHAPTER</SectionLabel><h2 id="closing-title" data-reveal>READY TO DESIGN<br/><em>what</em> MATTERS.</h2><p data-reveal>정리하는 힘과 소통하는 태도로,<br/>함께 완성도 있는 화면을 만들겠습니다.</p><div data-reveal><Link href="#contact">LET'S CONNECT</Link></div><span className="closing__star" aria-hidden="true">✳</span></section>;}
