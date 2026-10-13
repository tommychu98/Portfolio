import content from '../../data/projects';
import Link from '../ui/Link';
import './Footer.css';
export default function Footer() {
  return <footer className="site-footer paper-grain">
    <div className="site-footer__top"><a className="site-footer__signature" href="#intro" aria-label="주경덕 첫 화면">T / Tommy<span>WEB DESIGN & PUBLISHING</span></a>
      <div><h3>CONTACT</h3>{content.contact.email?<Link href={`mailto:${content.contact.email}`}>{content.contact.email}</Link>:<p>이메일 등록 예정</p>}<p className="fine-print">주경덕 / TOMMY CHU</p></div>
      <div><h3>EXPLORE</h3><Link href="#work">WORK</Link><Link href="#story">ABOUT</Link><Link href="#film">FILM</Link></div>
      <div><h3>MORE</h3>{content.contact.resume?<Link href={content.contact.resume}>RESUME</Link>:<p>이력서 등록 예정</p>}{content.contact.github?<Link href={content.contact.github}>GITHUB</Link>:<p>GitHub 등록 예정</p>}</div>
    </div>
    <div className="site-footer__bottom"><span>© 2026 TOMMY CHU</span><span>Thoughtfully arranged. Carefully made.</span><Link href="#intro">BACK TO TOP ↑</Link></div>
  </footer>;
}
