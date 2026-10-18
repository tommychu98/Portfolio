import { memo, useLayoutEffect, useRef, useState } from 'react';
import { arrangeDocuments } from './ZaraProcess.motion';

export function InterviewNotes({ document }) {
  return <div className="research-notes"><span className="archive-eyebrow">INTERVIEW / RESPONSE NOTES</span><h4>사용자의 말에서<br/>발견한 세 가지.</h4><dl>{document.findings.map((finding, index) => <div key={finding.topic}><dt><span>0{index + 1}</span>{finding.topic}<small>{finding.questions}</small></dt><dd>{finding.text}</dd></div>)}</dl><p>실제 응답의 의미를 유지한 요약 · 직접 인용 아님</p></div>;
}

function ResearchDesk({ step, onExpand }) {
  const [selected, setSelected] = useState(step.documents[0]?.id);
  const root = useRef(null);
  const motion = useRef(null);
  const document = step.documents.find(item => item.id === selected);
  // Keep every source reachable; show at most three physical sheets at once.
  const documents = step.documents.slice(0, 3);
  if (document && !documents.some(item => item.id === selected)) documents[2] = document;
  const ids = documents.map(item => item.id).join('|');
  useLayoutEffect(() => { motion.current = arrangeDocuments(root.current); return () => motion.current.destroy(); }, []);
  useLayoutEffect(() => { motion.current.select(selected); }, [selected, ids]);
  const annotation = step.annotations.find(item => item.document === selected);
  const index = step.documents.findIndex(item => item.id === selected);
  const choose = next => setSelected(step.documents[(next + step.documents.length) % step.documents.length].id);
  return <div className="research-desk" ref={root}>
    <div className="research-desk__topline"><span className="archive-eyebrow">THE RESEARCH ARCHIVE</span><span>{step.held ? 'AWAITING ORIGINAL' : `${String(step.documents.length).padStart(2, '0')} DOCUMENTS / TEAM PROJECT`}</span></div>
    {step.held ? <div className="research-desk__held" data-sheet><span className="archive-eyebrow">06 / NEXT CHAPTER</span><span className="research-desk__held-number" aria-hidden="true">06</span><h4>화면 구조로 이어지는<br/>다음 단계.</h4><p>최종 와이어프레임 원본 확인 전까지<br/>자료 공개를 보류합니다.</p><span className="archive-eyebrow">INFORMATION ARCHITECTURE → WIREFRAME</span></div> : <>
      <div className="research-desk__stack" aria-label="조사 및 분석 문서">
        {documents.map(item => {
          const active = item.id === selected;
          return <div key={item.id} className={`research-sheet${item.height > item.width ? ' research-sheet--portrait' : ''}${item.kind === 'summary' ? ' research-sheet--notes' : ''}${active ? ' is-active' : ''}`} data-sheet style={{ zIndex: active ? 3 : 1 }}>
            <button className="research-sheet__document" data-document={item.id} type="button" tabIndex={active ? 0 : -1} aria-hidden={!active} aria-label={`${item.label} 상세 보기`} onPointerMove={event => { if (event.pointerType === 'mouse' && !active) setSelected(item.id); }} onClick={event => { if (!active) setSelected(item.id); else onExpand(item, event.currentTarget); }}>
              <span className="research-sheet__bar"><span>{String(step.documents.indexOf(item) + 1).padStart(2, '0')} / {item.role}</span><span>{item.label}</span><span aria-hidden="true">↗</span></span>
              <div className={`research-sheet__page${item.kind === 'summary' ? ' research-sheet__page--notes' : ''}`}>
                {item.kind === 'summary' ? <InterviewNotes document={item}/> : <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async"/>}
              </div>
              <span className="research-sheet__foot"><span>{item.roleLabel} / {item.label}</span><span>펼쳐 보기 ↗</span></span>
            </button>
          </div>;
        })}
      </div>
      <div className="research-desk__selection" data-copy>
        <div className="research-desk__caption"><span className="archive-eyebrow">{document.role} / {String(index + 1).padStart(2, '0')}</span><h4>{document.label}</h4><p>{document.caption}</p></div>
        <div className={`research-desk__annotation${annotation ? ' is-visible' : ''}`} key={selected} aria-hidden={!annotation}>
          {annotation && <><span className="archive-eyebrow">READING NOTE</span><p>{annotation.text}</p><svg viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true"><path d="M0 1 H100" pathLength="1"/></svg></>}
        </div>
      </div>
      <div className="research-desk__controls"><div className="research-desk__index" role="group" aria-label="자료 선택">
        {step.documents.map((item, i) => <button type="button" key={item.id} aria-pressed={item.id === selected} onClick={() => setSelected(item.id)}><span>{String(i + 1).padStart(2, '0')}</span>{item.label}</button>)}
      </div><div className="research-desk__arrows"><button type="button" aria-label="이전 자료" onClick={() => choose(index - 1)}>←</button><button type="button" aria-label="다음 자료" onClick={() => choose(index + 1)}>→</button></div></div>
      <p className="research-desk__hint">문서를 선택해 비교하고, 펼쳐서 자세히 읽어보세요.</p>
    </>}
  </div>;
}

export default memo(ResearchDesk);
