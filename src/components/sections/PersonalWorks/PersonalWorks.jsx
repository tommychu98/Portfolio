import { useCallback, useEffect, useRef, useState } from 'react';
import content from '../../../data/projects';
import Photo from '../../ui/Photo';
import Link from '../../ui/Link';
import Button from '../../ui/Button';
import SectionLabel from '../../ui/SectionLabel';
import { pauseScroll, scrollToPosition } from '../../../motion/scroll';
import { initPersonalWorks, animatePersonalDetail } from './PersonalWorks.motion';
import './PersonalWorks.css';

const directions = [
  { category: 'FRAGRANCE / BRAND EXPERIENCE', phrase: <>The art of<br/><em>staying.</em></>, focus: '이미지 · 여백 · 브랜드 감성' },
  { category: 'TEA / EVERYDAY EXPERIENCE', phrase: <>A quiet<br/><em>moment.</em></>, focus: '정보의 순서 · 카드 구성' },
];

function Artwork({ work, index }) {
  return <>
    <span className="personal-works__card personal-works__card--back" aria-hidden="true">
      <Photo kind={work.image}/><span className="personal-works__card-label">{work.name}<small>PERSONAL VISUAL STUDY</small></span>
    </span>
    <span className="personal-works__card personal-works__card--front">
      <Photo kind={work.image} alt={work.title}/>
      <span className="personal-works__card-copy"><small>{work.name} / {index === 0 ? 'FRAGRANCE' : 'TEA'}</small><span>{directions[index].phrase}</span></span>
    </span>
  </>;
}

export default function PersonalWorks() {
  const section = useRef(null);
  const controller = useRef(null);
  const dialog = useRef(null);
  const detailMotion = useRef(null);
  const origin = useRef(null);
  const closing = useRef(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const work = selected === null ? null : content.personal[selected];

  useEffect(() => {
    const motion = initPersonalWorks(section.current, setActive);
    controller.current = motion;
    return () => { motion.destroy(); controller.current = null; };
  }, []);

  const closeDetail = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const complete = () => setSelected(null);
    if (detailMotion.current) detailMotion.current.close(complete);
    else complete();
  }, []);

  useEffect(() => {
    if (selected === null) return;
    const element = dialog.current;
    const saved = origin.current;
    const overflow = document.body.style.overflow;
    closing.current = false;
    element.showModal();
    element.scrollTop = 0;
    pauseScroll(true);
    document.body.style.overflow = 'hidden';
    detailMotion.current = animatePersonalDetail(element, saved.rect);
    return () => {
      detailMotion.current?.destroy();
      detailMotion.current = null;
      element.close();
      document.body.style.overflow = overflow;
      pauseScroll(false);
      if (saved.width === window.innerWidth && saved.height === window.innerHeight) scrollToPosition(saved.y, true);
      else if (saved.button.isConnected) scrollToPosition(saved.button.closest('[data-personal-work]'), true);
      saved.button?.focus({ preventScroll: true });
      closing.current = false;
    };
  }, [selected]);

  function openDetail(index, event) {
    if (selected !== null) return;
    const artwork = section.current.querySelectorAll('[data-personal-art]')[index];
    origin.current = { button: event.currentTarget, rect: artwork.getBoundingClientRect(), y: window.scrollY, width: window.innerWidth, height: window.innerHeight };
    setSelected(index);
  }

  function navigate(index) { controller.current?.select(index); }

  return <section id="personal" ref={section} className="personal-works paper-grain" aria-labelledby="personal-title">
    <div className="personal-works__intro">
      <SectionLabel number="09">PERSONAL WORKS</SectionLabel>
      <div><h2 id="personal-title" className="display">Two brands,<br/><em>two directions.</em></h2><p>서로 다른 분위기를 메인 화면으로 표현합니다.<br/>개인 작업 2개 · 메인 페이지만 제작</p></div>
    </div>

    <div className="personal-works__stage" data-personal-stage>
      <div className="personal-works__stage-label" aria-hidden="true"><span>PERSONAL COLLECTION</span><span>DESIGN & PUBLISHING</span></div>
      <div className="personal-works__collection">
        {content.personal.map((item, index) => <article key={item.name} className={`personal-works__work personal-works__work--${item.image}`} data-personal-work>
          <div className="personal-works__copy" data-personal-copy>
            <span className="personal-works__category">0{index + 1} / {directions[index].category}</span>
            <h3><button type="button" onClick={event => openDetail(index, event)} aria-haspopup="dialog" aria-controls="personal-work-detail" aria-label={`${item.name} 상세 열기`}>{item.name}<span aria-hidden="true">↗</span></button></h3>
            <p className="personal-works__subtitle">{item.title.split(' — ')[1]}</p>
            <p className="personal-works__description">{item.body}</p>
            <span className="personal-works__scope">개인 작업 / 메인 페이지</span>
            <div className="link-row"><Button className="personal-works__details" onClick={event => openDetail(index, event)} aria-haspopup="dialog" aria-controls="personal-work-detail" aria-label={`${item.name} 상세 보기`}>DETAILS <span aria-hidden="true">↗</span></Button><Link href={item.href}>VIEW PROJECT</Link></div>
          </div>
          <div className="personal-works__holder" data-personal-holder>
            <button type="button" className="personal-works__art" data-personal-art aria-label={`${item.name} 이미지와 상세 열기`} aria-haspopup="dialog" aria-controls="personal-work-detail" onClick={event => openDetail(index, event)}><Artwork work={item} index={index}/></button>
          </div>
        </article>)}
      </div>
      <nav className="personal-works__navigation" aria-label="개인 작업 탐색" onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); navigate(active + (event.key === 'ArrowRight' ? 1 : -1)); }
      }}>
        <span className="personal-works__scroll-hint">SCROLL TO EXPLORE ↓</span>
        <div className="personal-works__project-nav">{content.personal.map((item, index) => <button key={item.name} type="button" aria-current={index === active ? 'true' : undefined} aria-label={`${item.name} 작품으로 이동`} onClick={() => navigate(index)}><span>0{index + 1}</span>{item.name}</button>)}</div>
        <div className="personal-works__arrows"><Button disabled={active === 0} onClick={() => navigate(active - 1)} aria-label="이전 개인 작업">←</Button><span aria-live="polite">0{active + 1} / 02</span><Button disabled={active === content.personal.length - 1} onClick={() => navigate(active + 1)} aria-label="다음 개인 작업">→</Button></div>
      </nav>
    </div>

    <dialog ref={dialog} id="personal-work-detail" className="personal-works__dialog" aria-labelledby="personal-detail-title" data-lenis-prevent onCancel={event => { event.preventDefault(); closeDetail(); }}>
      {work && <>
        <div className="personal-works__detail-bar"><span>PERSONAL WORK / 0{selected + 1}</span><Button autoFocus onClick={closeDetail} aria-label="개인 작업 상세 닫기">CLOSE ×</Button></div>
        <div className="personal-works__detail-layout">
          <div className={`personal-works__detail-art personal-works__work--${work.image}`} data-detail-art aria-hidden="true"><Artwork work={work} index={selected}/></div>
          <div className="personal-works__detail-copy" data-detail-copy>
            <span className="personal-works__category">{directions[selected].category}</span>
            <h3 id="personal-detail-title">{work.name}</h3>
            <p className="personal-works__detail-subtitle">{work.title}</p>
            <p>{work.body}</p>
            <dl><div className="project-meta"><dt>TYPE</dt><dd>개인 작업</dd></div><div className="project-meta"><dt>SCOPE</dt><dd>메인 페이지 디자인 & 퍼블리싱</dd></div><div className="project-meta"><dt>FOCUS</dt><dd>{directions[selected].focus}</dd></div></dl>
            <div className="personal-works__tags">{work.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            <div className="link-row"><Link href={work.href}>VIEW PROJECT</Link><Button className="personal-works__details" onClick={closeDetail}>BACK TO WORKS <span aria-hidden="true">↙</span></Button></div>
          </div>
        </div>
      </>}
    </dialog>
  </section>;
}
