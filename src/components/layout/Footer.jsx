import { useEffect, useRef, useState } from 'react';
import content from '../../data/projects';
import Link from '../ui/Link';
import './Footer.css';
export default function Footer() {
  const [message, setMessage] = useState('');
  const dismiss = useRef(null);
  useEffect(() => () => clearTimeout(dismiss.current), []);
  const copyEmail = async () => {
    clearTimeout(dismiss.current);
    try {
      await navigator.clipboard.writeText(content.contact.email);
      setMessage('성공적으로 복사했습니다');
    } catch {
      setMessage('복사하지 못했습니다. 다시 눌러주세요');
    }
    dismiss.current = setTimeout(() => setMessage(''), 2200);
  };
  return <footer className="site-footer paper-grain">
    <div className="site-footer__top"><a className="site-footer__signature" href="#intro" aria-label="주경덕 첫 화면">T / Tommy<span>WEB DESIGN & PUBLISHING</span></a>
      <div><h3>CONTACT</h3>{content.contact.email?<button className="text-link site-footer__email" type="button" onClick={copyEmail} aria-label="이메일 주소 복사"><span className="text-link__window"><span>이메일</span><span aria-hidden="true">이메일</span></span><span className="text-link__arrow" aria-hidden="true">⧉</span></button>:<p>이메일 등록 예정</p>}<p className="fine-print">주경덕 / TOMMY CHU</p></div>
      <div><h3>EXPLORE</h3><Link href="#work">WORK</Link><Link href="#story">ABOUT</Link><Link href="#film">FILM</Link></div>
      <div><h3>MORE</h3>{content.contact.resume?<Link href={content.contact.resume}>RESUME</Link>:<p>이력서 등록 예정</p>}{content.contact.github?<Link href={content.contact.github}>GITHUB</Link>:<p>GitHub 등록 예정</p>}</div>
    </div>
    <div className="site-footer__bottom"><span>© 2026 TOMMY CHU</span><span>Thoughtfully arranged. Carefully made.</span><Link href="#intro">BACK TO TOP ↑</Link></div>
    <div className={`site-footer__toast${message ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{message}</div>
  </footer>;
}
