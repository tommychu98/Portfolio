import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SectionLabel from '../../ui/SectionLabel';
import { gsap, ScrollTrigger, scrollToPosition } from '../../../motion/scroll';
import { historyChapters } from './BrandHistory.data';
import { chapterTimes, createHistoryTimeline } from './BrandHistory.motion';
import HistoryPreview from './HistoryPreview';
import HistoryObject from './HistoryObject';
import './BrandHistory.css';

function Chapter({ chapter, active, hidden }) {
  return <article className={`brand-history__chapter brand-history__chapter--${chapter.id}`} hidden={hidden} data-history-chapter aria-labelledby={`brand-history-${chapter.id}`}>
    <div className="brand-history__hero" data-history-tile style={{ '--history-color': chapter.background }}>
      <h3 id={`brand-history-${chapter.id}`} className="sr-only">{chapter.title}</h3>
      <HistoryPreview chapter={chapter} active={active}/>
    </div>
    <div className="brand-history__editorial">
      <div className="brand-history__thumbnails">
        {chapter.objects.slice(0, 4).map((item, index) => <HistoryObject key={item.src} item={item} index={index} chapterId={chapter.id}/>)}
      </div>
      <div className="brand-history__copy" data-history-copy>
        <span className="brand-history__theme">{chapter.theme}</span>
        <h4>{chapter.statement}</h4>
        <p>{chapter.description}</p>
        <p>{chapter.design}</p>
      </div>
      <div className="brand-history__thumbnails brand-history__thumbnails--bottom">
        {chapter.objects.slice(4, 8).map((item, index) => <HistoryObject key={item.src} item={item} index={index + 4} chapterId={chapter.id}/>)}
      </div>
    </div>
  </article>;
}

export default function BrandHistory() {
  const root = useRef(null);
  const trigger = useRef(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  useLayoutEffect(() => {
    const element = root.current;
    // Warm the original PNGs before entry without loading this archive at page start.
    const preload = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
      preload.disconnect();
    }, { rootMargin: '1600px 0px' });
    preload.observe(element);
    const match = gsap.matchMedia();
    match.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
      element.classList.add('is-animated');
      setPinned(true);
      const timeline = createHistoryTimeline(element, setActive);
      const scroll = ScrollTrigger.create({
        id: 'portfolio-brand-history', trigger: element,
        start: 'top top', end: 'bottom bottom', animation: timeline,
        scrub: .65, anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: self => self.animation.eventCallback('onUpdate')?.(),
      });
      trigger.current = scroll;
      return () => {
        trigger.current = null;
        setPinned(false);
        element.classList.remove('is-animated');
        element.querySelectorAll('[data-history-chapter]').forEach(chapter => { chapter.removeAttribute('aria-hidden'); chapter.inert = false; delete chapter.dataset.active; });
      };
    });
    match.add('(prefers-reduced-motion: reduce)', () => {
      element.querySelectorAll('[data-history-chapter]').forEach(chapter => { chapter.removeAttribute('aria-hidden'); chapter.inert = false; delete chapter.dataset.active; });
    });
    return () => { preload.disconnect(); match.revert(); };
  }, []);
  useEffect(() => {
    if (window.location.hash !== '#diptyque-history') return;
    const element = root.current;
    let frame;
    let cancelled = false;
    const enter = () => {
      if (document.querySelector('.preloader')) return;
      observer.disconnect();
      document.fonts.ready.then(() => {
        if (cancelled) return;
        frame = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          frame = requestAnimationFrame(() => scrollToPosition(element.getBoundingClientRect().top + window.scrollY, true));
        });
      });
    };
    const observer = new MutationObserver(enter);
    observer.observe(document.body, { childList: true, subtree: true });
    enter();
    return () => { cancelled = true; observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  const select = index => {
    const scroll = trigger.current;
    if (scroll) scrollToPosition(scroll.start + (scroll.end - scroll.start) * chapterTimes[index] / scroll.animation.duration());
    else {
      setActive(index);
      root.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  };
  return <section id="diptyque-history" ref={root} className="brand-history paper-grain" aria-labelledby="brand-history-title">
    <div className="brand-history__stage">
      <header className="brand-history__header">
        <SectionLabel sectionId="diptyque-history">DIPTYQUE BRAND HISTORY</SectionLabel>
        <a href="https://mbc-teamproject-alpha.vercel.app/about/history" target="_blank" rel="noopener noreferrer">VIEW HISTORY ↗</a>
        <div className="brand-history__intro">
          <h2 id="brand-history-title">DIPTYQUE<br/><em>BRAND HISTORY.</em></h2>
          <div className="brand-history__project">
            <span>PERSONAL WORK / STORYTELLING WEB PAGE</span>
            <p>딥티크의 브랜드 스토리를 중심으로 기획하고 제작한 개인 웹 페이지 작업입니다. 직물에서 오브제, 향, 메종으로 이어지는 이야기를 스크롤 경험으로 풀어냈습니다.</p>
          </div>
        </div>
      </header>
      <div className="brand-history__chapters">{historyChapters.map((chapter, index) => <Chapter key={chapter.id} chapter={chapter} active={active === index} hidden={!pinned && active !== index}/>)}</div>
      <footer className="brand-history__footer">
        <span>FROM PATTERN TO A WORLD</span>
        <nav aria-label="DIPTYQUE History 구간 선택">{historyChapters.map((chapter, index) => <button type="button" key={chapter.id} aria-current={active === index ? 'step' : undefined} onClick={() => select(index)}><span>0{index + 1}</span>{chapter.title}</button>)}</nav>
        <span className="brand-history__scroll">{pinned ? 'SCROLL TO EXPLORE ↕' : 'SELECT A CHAPTER ↗'}</span>
      </footer>
    </div>
  </section>;
}
