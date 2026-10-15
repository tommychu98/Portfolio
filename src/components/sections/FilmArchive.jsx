import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { filmArchive } from '../../data/portfolio';
import SectionLabel from '../ui/SectionLabel';
import './FilmArchive.css';

gsap.registerPlugin(CustomEase);
// A broad acceleration/deceleration curve avoids the previous mid-motion snap.
CustomEase.create('filmArchiveReveal', '0.4,0,0.3,1');

function ArchiveVideo({ film }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = false;
    let disposed = false;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (!visible || document.hidden || motion.matches) { video.pause(); return; }
      video.play()?.then(() => {
        if (disposed || !visible || document.hidden || motion.matches) video.pause();
        else setFailed(false);
      }).catch(() => { if (!disposed) setFailed(true); });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(video);
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', update);
    return () => {
      disposed = true;
      observer.disconnect();
      video.pause();
      document.removeEventListener('visibilitychange', update);
      motion.removeEventListener('change', update);
    };
  }, []);
  return <>
    {film.poster && <img className="film-archive__media" src={film.poster} alt="" />}
    <video ref={ref} className="film-archive__media" style={{ opacity: failed ? 0 : 1 }} src={film.video} poster={film.poster || undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" onError={() => setFailed(true)} />
  </>;
}

export default function FilmArchive() {
  const ref = useRef(null);
  const [active, setActive] = useState(null);
  // This gallery's explicitly requested hover motion can be disabled locally.
  // Do not silently suppress it based on the browser's reduced-motion setting.
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [wide, setWide] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)');
    const update = () => setWide(wide.matches);
    update();
    wide.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
    };
  }, []);
  useLayoutEffect(() => {
    const context = gsap.context(() => {
        const reduced = !motionEnabled;
        const panels = [...ref.current.querySelectorAll('.film-archive__panel')];
        if (!wide) {
          gsap.set(panels, { clearProps: 'flexGrow' });
          gsap.set(ref.current.querySelectorAll('.film-archive__row'), { clearProps: 'opacity,transform' });
          gsap.set(ref.current.querySelectorAll('.film-archive__overlay'), { clearProps: 'opacity' });
          return;
        }
        panels.forEach((panel, index) => {
          // Keep the total weight at five, so opening and closing edges travel together.
          gsap.to(panel, { flexGrow: active === null ? 1 : index === active ? 2.88 : 0.53, duration: reduced ? 0 : 0.8, ease: 'filmArchiveReveal', overwrite: true });
          const rows = panel.querySelectorAll('.film-archive__row');
          const selected = index === active;
          gsap.to(panel.querySelector('.film-archive__overlay'), { opacity: selected ? 1 : 0, delay: selected && !reduced ? 0.3 : 0, duration: reduced ? 0 : selected ? 0.45 : 0.18, ease: 'sine.inOut', overwrite: true });
          gsap.to(rows, { opacity: selected ? 1 : 0, y: selected || reduced ? 0 : 8, delay: selected && !reduced ? 0.34 : 0, duration: reduced ? 0 : selected ? 0.45 : 0.18, stagger: selected && !reduced ? 0.04 : 0, ease: 'sine.inOut', overwrite: true });
        });
    }, ref);
    // Stop in-flight tweens without resetting panel widths during rapid selection.
    return () => context.kill(false);
  }, [active, wide, motionEnabled]);

  return <section ref={ref} id="film-archive" className="film-archive" aria-labelledby="film-archive-title">
    <header className="film-archive__header">
    <SectionLabel number="11">FILM ARCHIVE / SELECTED WORKS</SectionLabel>
    <div className="section-heading">
      <h2 id="film-archive-title" className="display">FILM ARCHIVE.</h2>
      <div className="film-archive__intro"><p>Selected Films &amp; Visual Stories</p><p>영상 제작을 통해 쌓아온 시각적 경험과 이야기를 소개합니다.</p></div>
    </div>
    <div className="film-archive__caption"><span>SELECTED FILMS / 05</span><span>영상 업로드 예정 · 임시 작품 정보 <button type="button" className="film-archive__motion-toggle" aria-pressed={motionEnabled} onClick={() => setMotionEnabled(enabled => !enabled)}>모션 {motionEnabled ? '켜짐' : '꺼짐'}</button></span></div>
    </header>
    <div className="film-archive__gallery" role="group" aria-label="영상 작품 선택">
      {filmArchive.map((film, index) => <button key={film.id} type="button" className={`film-archive__panel${index === active ? ' is-active' : ''}`} aria-pressed={index === active} aria-label={`${film.title} 선택${film.video ? '' : ' — 영상 준비 중'}`} onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(index); }} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
        {film.video && <ArchiveVideo film={film} />}
        <span className="film-archive__overlay">
          <span className="film-archive__row film-archive__title"><span>{film.title}</span><span className="film-archive__year">{film.year}</span></span>
          <span className="film-archive__row film-archive__description">{film.description}</span>
          <span className="film-archive__row film-archive__meta">{film.genre} · {film.role.join(' / ')}</span>
        </span>
      </button>)}
    </div>
  </section>;
}
