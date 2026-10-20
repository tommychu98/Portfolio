import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { filmArchive } from '../../data/portfolio';
import SectionLabel from '../ui/SectionLabel';
import './FilmArchive.css';

gsap.registerPlugin(CustomEase);
// A broad acceleration/deceleration curve avoids the previous mid-motion snap.
CustomEase.create('filmArchiveReveal', '0.4,0,0.3,1');

function ArchiveStills({ film, expanded, motionEnabled }) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!expanded || !motionEnabled) return;
    const timer = window.setInterval(() => setSlide(value => (value + 1) % film.stills.length), 4000);
    return () => window.clearInterval(timer);
  }, [expanded, motionEnabled, film.stills]);
  return <>
    <img className="film-archive__cover" src={film.poster} alt="" style={{ opacity: expanded ? 0 : (film.posterOpacity ?? 0.45), objectPosition: film.posterPosition }} />
    {expanded && <div className="film-archive__stills">
      {film.stills.map((src, index) => <img key={src} src={src} alt={`${film.title} 스틸컷 ${index + 1}`} aria-hidden={index !== slide} style={{ opacity: index === slide ? 1 : 0, transitionDuration: motionEnabled ? '1200ms' : '0ms' }} />)}
    </div>}
  </>;
}

function ArchiveEmbed({ film, playing }) {
  const ref = useRef(null);
  const monitorRef = useRef(null);
  const [initialAutoplay] = useState(playing ? 1 : 0);
  useEffect(() => {
    const frame = monitorRef.current;
    return () => { gsap.killTweensOf(frame); };
  }, []);
  const highlightFrame = highlighted => {
    gsap.to(monitorRef.current, { borderColor: highlighted ? '#77756b' : '#343631', duration: 0.3, ease: 'power2.out', overwrite: true });
  };
  const command = () => {
    const send = func => ref.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube.com');
    if (playing) send('mute');
    send(playing ? 'playVideo' : 'pauseVideo');
  };
  useEffect(command, [playing]);
  return <figure className="film-archive__monitor" onPointerEnter={() => highlightFrame(true)} onPointerLeave={() => highlightFrame(false)} onFocus={() => highlightFrame(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) highlightFrame(false); }}>
    <div ref={monitorRef} className="film-archive__monitor-frame">
      <iframe ref={ref} className="film-archive__embed" title={`${film.title} 영상`} src={`https://www.youtube.com/embed/${film.youtubeId}?enablejsapi=1&autoplay=${initialAutoplay}&mute=1&playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen onLoad={command} />
    </div>
    <figcaption className="film-archive__monitor-caption"><span>{film.title}</span><span className="film-archive__monitor-label">WATCH FILM ↗</span></figcaption>
  </figure>;
}

function ArchiveVideo({ film, expanded, motionEnabled }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = false;
    let disposed = false;
    const update = () => {
      if (!expanded || !motionEnabled || !visible || document.hidden) { video.pause(); return; }
      video.play()?.then(() => {
        if (disposed || !visible || document.hidden) video.pause();
        else setFailed(false);
      }).catch(() => { if (!disposed) setFailed(true); });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(video);
    document.addEventListener('visibilitychange', update);
    return () => {
      disposed = true;
      observer.disconnect();
      video.pause();
      document.removeEventListener('visibilitychange', update);
    };
  }, [expanded, motionEnabled]);
  return <>
    {film.poster && <img className="film-archive__cover" src={film.poster} alt="" style={{ opacity: expanded ? 1 : (film.posterOpacity ?? 0.45), objectPosition: film.posterPosition }} />}
    <video ref={ref} className="film-archive__media" style={{ opacity: expanded && !failed ? 1 : 0 }} src={film.video} poster={film.poster || undefined} muted loop playsInline preload="metadata" aria-hidden="true" onError={() => setFailed(true)} />
  </>;
}

export default function FilmArchive() {
  const ref = useRef(null);
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);
  const motionEnabled = true;
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
    <SectionLabel sectionId="film-archive">FILM ARCHIVE / SELECTED WORKS</SectionLabel>
    <div className="section-heading">
      <h2 id="film-archive-title" className="display">FILM ARCHIVE.</h2>
      <div className="film-archive__intro"><p>Selected Films &amp; Visual Stories</p><p>영상 제작을 통해 쌓아온 시각적 경험과 이야기를 소개합니다.</p></div>
    </div>
    <div className="film-archive__caption"><span>SELECTED FILMS / 05</span></div>
    </header>
    <div className="film-archive__gallery" role="group" aria-label="영상 작품 선택">
      {filmArchive.map((film, index) => <div key={film.id} role="group" tabIndex={0} className={`film-archive__panel${index === active ? ' is-active' : ''}${film.stills ? ' film-archive__panel--stills' : ''}${film.youtubeId ? ' film-archive__panel--embed' : ''}`} aria-label={`${film.title}${film.video || film.youtubeId ? '' : ' — 영상 준비 중'}`} onPointerEnter={event => { if (event.pointerType === 'mouse') { setActive(index); setHovered(index); } }} onPointerLeave={() => setHovered(null)} onFocus={() => setActive(index)} onClick={() => setActive(index)} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setActive(index); } }}>
        {film.stills && <ArchiveStills key={String(index === active || !wide)} film={film} expanded={index === active || !wide} motionEnabled={motionEnabled} />}
        {film.video && <ArchiveVideo film={film} expanded={index === active || !wide} motionEnabled={motionEnabled} />}
        <span className="film-archive__overlay">
          <span className="film-archive__row film-archive__title"><span>{film.title}</span>{film.year && <span className="film-archive__year">{film.year}</span>}</span>
          <span className="film-archive__row film-archive__description">{film.description}</span>
          <span className="film-archive__row film-archive__meta">{film.genre} · {film.role.join(' / ')}</span>
          {film.detailUrl && !film.youtubeId && <a className="film-archive__row film-archive__watch" href={film.detailUrl} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()}>WATCH FILM ↗</a>}
        </span>
        {film.youtubeId && (index === active || !wide) && <ArchiveEmbed film={film} playing={index === hovered && motionEnabled} />}
      </div>)}
    </div>
  </section>;
}
