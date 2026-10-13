import { useEffect, useRef, useState } from 'react';
import { materials, proposal, steps } from './DiptyqueProcess.data';
import SectionLabel from '../../ui/SectionLabel';
import Button from '../../ui/Button';
import Link from '../../ui/Link';
import HorizontalControls from '../../ui/HorizontalControls';
import { pauseScroll } from '../../../motion/scroll';
import { initZaraProcess } from './ZaraProcess.motion';
import './ZaraProcess.css';

function ProcessStep({ step, index, onExpand }) {
  const [selected, setSelected] = useState(0);
  const material = step.materials[selected];
  return <article className="horizontal-panel zara-process__step" data-panel>
    <div className="zara-process__material">
      <button type="button" className="zara-process__preview" onClick={() => onExpand(material)} aria-label={material.label + ' 확대'}>
        <img src={material.src} alt={material.alt} loading="lazy"/><span>자료 확대 ↗</span>
      </button>
      <div className="zara-process__material-footer"><span>팀 기획 자료 · {material.label}</span><Link href={material.source} target="_blank" rel="noopener noreferrer">Figma 원본</Link></div>
    </div>
    <div className="zara-process__copy">
      <span className="fine-print">{String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')} — {step.category}</span>
      <h3>{step.title}</h3><p>{step.body}</p>
      <dl className="zara-process__reasoning">{step.points.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
      {step.materials.length > 1 && <div className="zara-process__tabs" role="group" aria-label={step.category + ' 자료 선택'}>
        {step.materials.map((m, i) => <Button key={m.id} aria-pressed={selected === i} onClick={() => setSelected(i)}>{m.label}</Button>)}
      </div>}
      {step.note && <p className="zara-process__note">{step.note}</p>}
    </div>
  </article>;
}

export default function ZaraProcess() {
  const ref = useRef(null), dialog = useRef(null), opener = useRef(null);
  const [material, setMaterial] = useState(null);
  useEffect(() => initZaraProcess(ref.current), []);
  useEffect(() => {
    if (!material) return;
    const el = dialog.current;
    el.showModal(); pauseScroll(true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { el.close(); pauseScroll(false); document.body.style.overflow = overflow; opener.current?.focus({ preventScroll: true }); };
  }, [material]);
  const expand = value => { opener.current = document.activeElement; setMaterial(value); };
  return <section id="zara-process" ref={ref} className="zara-process" aria-labelledby="process-title">
    <div className="horizontal-viewport" data-viewport>
      <div className="horizontal-heading"><SectionLabel number="08">DIPTYQUE / UX PLANNING PROCESS</SectionLabel><h2 id="process-title">From questions <em>to clarity.</em></h2></div>
      <div data-track>
        <article className="horizontal-panel zara-process__cover" data-panel>
          <div className="zara-process__collage">{[materials.problem, materials.journey, materials.ia].map(m => <button key={m.id} type="button" onClick={() => expand(m)} aria-label={m.label + ' 확대'}><span>{m.label}</span><img src={m.src} alt={m.alt} loading="lazy"/></button>)}</div>
          <div className="zara-process__intro"><span className="fine-print">DIPTYQUE / TEAM UX PLANNING</span><h3>Discover.<br/>Connect.<br/><em>Experience.</em></h3><p>제품을 고르는 과정에서도 딥디크의 이야기를 경험할 수 있도록. 팀이 발견한 문제를 탐색 구조와 화면으로 연결한 UX 기획 과정입니다.</p><span className="zara-process__note">팀 공동 기획 · 리서치 / 퍼소나 / UX 방향 / IA / 와이어프레임</span><Link href={proposal} target="_blank" rel="noopener noreferrer">FIGMA · 팀 기획 장표</Link></div>
        </article>
        {steps.map((step, i) => <ProcessStep key={step.id} step={step} index={i} onExpand={expand}/>)}
      </div>
      <HorizontalControls label="DIPTYQUE UX 기획 과정"/>
    </div>
    <dialog ref={dialog} className="zara-process__dialog" aria-label={material ? material.label + ' 확대' : '팀 기획 자료 확대'} onCancel={() => setMaterial(null)} onClick={e => { if (e.target === dialog.current) setMaterial(null); }} data-lenis-prevent>
      <div className="zara-process__dialog-bar"><span>{material?.label}</span><a href={material?.source} target="_blank" rel="noopener noreferrer">Figma 원본 ↗</a><Button autoFocus onClick={() => setMaterial(null)} aria-label="기획 자료 닫기">닫기 ×</Button></div>
      {material && <div className="zara-process__dialog-scroll"><img src={material.src} alt={material.alt}/></div>}
    </dialog>
  </section>;
}
