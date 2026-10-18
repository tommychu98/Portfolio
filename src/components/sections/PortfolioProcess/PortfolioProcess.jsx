import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { workspaceSteps as archiveSteps } from './Workspace.data';
import SectionLabel from '../../ui/SectionLabel';
import { pauseScroll } from '../../../motion/scroll';
import { initPortfolioProcess } from './PortfolioProcess.motion';
import ResearchDesk, { InterviewNotes } from './ResearchDesk';
import RetroWorkspace from './RetroWorkspace';
import './PortfolioProcess.css';
import './Workspace.css';

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
    <header className="research-reader__bar"><div><span className="archive-eyebrow">DIPTYQUE / {document.role}</span><h3 id="research-reader-title">{document.label}</h3></div><div className="research-reader__actions">{document.kind !== 'summary' && <button type="button" aria-pressed={zoom} onClick={() => setZoom(value => !value)}>{zoom ? '화면에 맞춤' : '크게 보기'}</button>}<button ref={close} type="button" onClick={onClose} aria-label="자료 상세 보기 닫기">닫기 <span aria-hidden="true">×</span></button></div></header>
    <div className={`research-reader__scroll${zoom ? ' is-zoomed' : ''}`} tabIndex={0} aria-label="자료 상세 내용"><p className="research-reader__caption">{document.caption}</p>{document.kind === 'summary' ? <InterviewNotes document={document}/> : <img src={document.src} alt={document.alt} width={document.width} height={document.height} style={zoom ? { width: `${Math.max(document.width, 1500)}px` } : undefined}/>}</div>
    <footer className="research-reader__footer"><span>TEAM RESEARCH ARCHIVE</span><span>ESC TO CLOSE</span></footer>
  </dialog>;
}

export default function PortfolioProcess() {
  const root = useRef(null), motion = useRef(null), opener = useRef(null), restoreFrame = useRef(0);
  const [current, setCurrent] = useState(0);
  const [requested, setRequested] = useState(0);
  const [view, setView] = useState({ mode: 'research', index: 0 });
  const [document, setDocument] = useState(null);
  const step = archiveSteps[current];
  useLayoutEffect(() => { motion.current = initPortfolioProcess(root.current); return () => motion.current.destroy(); }, []);
  useEffect(() => () => cancelAnimationFrame(restoreFrame.current), []);
  const select = index => {
    setRequested(index);
    motion.current.change(() => flushSync(() => { setCurrent(index); setView({ mode: 'research', index: 0 }); }));
  };
  const changeView = (mode, index = 0, focus = false) => {
    setRequested(current);
    motion.current.change(() => flushSync(() => setView({ mode, index, focus })), 'document');
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
  return <section id="zara-process" className="zara-process research-archive workspace-archive" ref={root} aria-labelledby="process-title">
    <header className="research-archive__header" data-entry><SectionLabel number="08">DIPTYQUE / UX PLANNING PROCESS</SectionLabel><div className="research-archive__intro"><h2 id="process-title">From Research<br/><em>to Structure.</em></h2><div><span className="archive-eyebrow">RESEARCH CUT / INTERACTIVE UX ARCHIVE</span><p>팀원들과 함께 자료를 수집하고 분석하며,<br className="archive-desktop-break"/> 발견한 문제를 하나의 사용자 경험 구조로<br className="archive-desktop-break"/> 발전시킨 과정입니다.</p></div></div></header>
    <nav className="research-archive__nav" aria-label="UX 기획 단계" onKeyDown={navigate} data-entry>{archiveSteps.map((item, index) => <button key={item.id} type="button" data-step={index} aria-current={requested === index ? 'step' : undefined} aria-controls="research-archive-content" onClick={() => select(index)}><span>{item.number}</span><span>{item.title}</span><span className="research-archive__nav-dot" aria-hidden="true"/></button>)}</nav>
    <div id="research-archive-content" className={`research-archive__body${current === 0 ? ' is-retro-preview' : ''}`} data-entry aria-busy={requested !== current}>
      <div className="research-archive__information">
        <div className="research-archive__step-copy" data-copy><div className="research-archive__chapter"><span className="archive-eyebrow">CHAPTER {step.number} / 06</span></div><h3>{step.title}</h3><p className="research-archive__description">{step.description}</p></div>
        <div className="research-archive__finding" data-finding><span className="archive-eyebrow">{step.held ? 'CURRENT STATUS' : `KEY FINDING ${step.number}`}</span><p>{step.findingHighlight ? <><span>{step.keyFinding.split(step.findingHighlight)[0]}</span><span className="research-finding__em" data-highlight>{step.findingHighlight}</span><span>{step.keyFinding.split(step.findingHighlight)[1]}</span></> : step.keyFinding}</p></div>
      </div>
      {current === 0 ? <RetroWorkspace onExpand={openDocument}/> : <ResearchDesk step={step} view={view} onChange={changeView} onExpand={openDocument}/>}
    </div>
    <p className="sr-only" role="status" aria-live="polite">{step.number}. {step.title}{step.held ? ' · 보류' : ` · ${view.mode.toUpperCase()} · ${view.index + 1}`}</p>
    <footer className="research-archive__footer"><span className="archive-eyebrow">COLLECT → COMPARE → CONNECT</span></footer>
    {document && <DocumentReader document={document} onClose={closeDocument}/>}
  </section>;
}
