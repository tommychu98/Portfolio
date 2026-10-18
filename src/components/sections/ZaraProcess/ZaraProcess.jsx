import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { archiveSteps, sources } from './DiptyqueProcess.data';
import SectionLabel from '../../ui/SectionLabel';
import { pauseScroll } from '../../../motion/scroll';
import { initZaraProcess } from './ZaraProcess.motion';
import ResearchDesk, { InterviewNotes } from './ResearchDesk';
import './ZaraProcess.css';

function DocumentReader({ document, onClose }) {
  const ref = useRef(null), close = useRef(null);
  const [zoom, setZoom] = useState(false);
  useLayoutEffect(() => {
    const dialog = ref.current;
    const overflow = window.document.body.style.overflow;
    dialog.showModal(); close.current.focus(); pauseScroll(true);
    window.document.body.style.overflow = 'hidden';
    return () => { dialog.close(); pauseScroll(false); window.document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={ref} className="research-reader" aria-labelledby="research-reader-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) onClose(); }} data-lenis-prevent>
    <header className="research-reader__bar"><div><span className="archive-eyebrow">DIPTYQUE / {document.role}</span><h3 id="research-reader-title">{document.label}</h3></div><div className="research-reader__actions"><a href={document.source} target="_blank" rel="noopener noreferrer">Figma 원본 ↗</a>{document.kind !== 'summary' && <button type="button" aria-pressed={zoom} onClick={() => setZoom(value => !value)}>{zoom ? '화면에 맞춤' : '크게 보기'}</button>}<button ref={close} type="button" onClick={onClose} aria-label="자료 상세 보기 닫기">닫기 <span aria-hidden="true">×</span></button></div></header>
    <div className={`research-reader__scroll${zoom ? ' is-zoomed' : ''}`} tabIndex={0} aria-label="자료 상세 내용"><p className="research-reader__caption">{document.caption}</p>{document.kind === 'summary' ? <InterviewNotes document={document}/> : <img src={document.src} alt={document.alt} width={document.width} height={document.height} style={zoom ? { width: `${Math.max(document.width, 1500)}px` } : undefined}/>}</div>
    <footer className="research-reader__footer"><span>TEAM RESEARCH ARCHIVE</span><span>ESC TO CLOSE</span></footer>
  </dialog>;
}

export default function ZaraProcess() {
  const root = useRef(null), motion = useRef(null), opener = useRef(null), restoreFrame = useRef(0);
  const [current, setCurrent] = useState(0);
  const [requested, setRequested] = useState(0);
  const [document, setDocument] = useState(null);
  const step = archiveSteps[current];
  useLayoutEffect(() => { motion.current = initZaraProcess(root.current); return () => motion.current.destroy(); }, []);
  useEffect(() => () => cancelAnimationFrame(restoreFrame.current), []);
  const select = index => {
    setRequested(index);
    motion.current.change(() => flushSync(() => setCurrent(index)));
  };
  const openDocument = useCallback((value, trigger) => { opener.current = trigger; setDocument(value); }, []);
  const closeDocument = () => { setDocument(null); restoreFrame.current = requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })); };
  const navigate = event => {
    const index = Number(event.target.dataset.step);
    if (!Number.isInteger(index)) return;
    const next = event.key === 'ArrowRight' ? (index + 1) % 6 : event.key === 'ArrowLeft' ? (index + 5) % 6 : event.key === 'Home' ? 0 : event.key === 'End' ? 5 : null;
    if (next === null) return;
    event.preventDefault(); root.current.querySelector(`[data-step="${next}"]`).focus({ preventScroll: true }); select(next);
  };
  return <section id="zara-process" className="zara-process research-archive" ref={root} aria-labelledby="process-title">
    <header className="research-archive__header" data-entry><SectionLabel number="08">DIPTYQUE / UX PLANNING PROCESS</SectionLabel><div className="research-archive__intro"><h2 id="process-title">From Research<br/><em>to Structure.</em></h2><div><span className="archive-eyebrow">A COLLECTIVE PROCESS / AN OPEN ARCHIVE</span><p>팀원들과 함께 자료를 수집하고 분석하며,<br className="archive-desktop-break"/> 발견한 문제를 하나의 사용자 경험 구조로<br className="archive-desktop-break"/> 발전시킨 과정입니다.</p></div></div></header>
    <nav className="research-archive__nav" aria-label="UX 기획 단계" onKeyDown={navigate} data-entry>{archiveSteps.map((item, index) => <button key={item.id} type="button" data-step={index} aria-current={requested === index ? 'step' : undefined} aria-controls="research-archive-content" onClick={() => select(index)}><span>{item.number}</span><span>{item.title}</span><span className="research-archive__nav-dot" aria-hidden="true"/></button>)}</nav>
    <div id="research-archive-content" className="research-archive__body" data-entry aria-busy={requested !== current}>
      <div className="research-archive__information">
        <div className="research-archive__step-copy" data-copy><div className="research-archive__chapter"><span className="archive-eyebrow">CHAPTER {step.number} / 06</span><span>{step.held ? 'ON HOLD' : 'TEAM RESEARCH'}</span></div><h3>{step.title}</h3><p className="research-archive__eyebrow">{step.eyebrow}</p><p className="research-archive__description">{step.description}</p><ul className="research-archive__tasks">{step.tasks.map(task => <li key={task}>{task}</li>)}</ul></div>
        <div className="research-archive__finding" data-finding><span className="archive-eyebrow">{step.held ? 'CURRENT STATUS' : 'KEY FINDING'}<small>{step.evidence}</small></span><p>{step.keyFinding}</p><span className="research-archive__finding-rule"/></div>
        <div className="research-archive__context" data-copy><p>{step.note}</p>{step.bridge && <p className="research-archive__bridge">{step.bridge}</p>}</div>
      </div>
      <ResearchDesk key={step.id} step={step} onExpand={openDocument}/>
    </div>
    <p className="sr-only" role="status" aria-live="polite">{step.number}. {step.title}{step.held ? ' · 보류' : ''}</p>
    <footer className="research-archive__footer"><span className="archive-eyebrow">COLLECT → COMPARE → CONNECT</span><div><a href={sources.research} target="_blank" rel="noopener noreferrer">자료조사 원본 ↗</a><a href={sources.analysis} target="_blank" rel="noopener noreferrer">자료분석 원본 ↗</a></div></footer>
    {document && <DocumentReader document={document} onClose={closeDocument}/>}
  </section>;
}
