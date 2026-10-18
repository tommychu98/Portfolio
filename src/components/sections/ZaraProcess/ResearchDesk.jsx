import { memo } from 'react';
import { sourceExcerpts } from './DiptyqueProcess.data';

export function InterviewNotes({ document }) {
  return <div className="research-notes"><span className="archive-eyebrow">INTERVIEW / RESPONSE NOTES</span><h4>사용자의 말에서<br/>발견한 세 가지.</h4><dl>{document.findings.map((finding, index) => <div key={finding.topic}><dt><span>0{index + 1}</span>{finding.topic}<small>{finding.questions}</small></dt><dd>{finding.text}</dd></div>)}</dl><p>실제 응답의 의미를 유지한 요약 · 직접 인용 아님</p></div>;
}

function archiveDocuments(step, mode) {
  // The finished canvas belongs with results. No unverified strategy drafts.
  if (step.id === 'strategy') return mode === 'result'
    ? [...step.processImages, ...step.analysisImages] : [];
  return (mode === 'research' ? step.processImages : step.analysisImages)
    .filter(item => item.kind !== 'summary');
}

function ResearchDesk({ step, view, onChange, onExpand }) {
  const documents = archiveDocuments(step, view.mode);
  const document = documents[view.index] || documents[0];
  const excerpt = view.mode === 'result' && sourceExcerpts[document?.id];
  const tall = document && document.height > document.width;
  const summary = step.processImages.find(item => item.kind === 'summary');
  const open = (item, event) => onExpand({ ...item, role: view.mode.toUpperCase() }, event.currentTarget);
  const tabs = ['research', 'result'];
  return <div className="research-desk research-cut">
    {!step.held && <div className="research-cut__toolbar">
      <div role="tablist" aria-label="조사 과정과 분석 결과" className="research-cut__tabs">
        {tabs.map(mode => <button key={mode} id={`archive-tab-${mode}`} type="button" role="tab" aria-selected={view.mode === mode} aria-controls="archive-image-panel" tabIndex={view.mode === mode ? 0 : -1} onClick={() => onChange(mode)} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 'research' : event.key === 'End' ? 'result' : tabs.find(value => value !== mode);
          event.currentTarget.parentElement.querySelector(`#archive-tab-${next}`).focus();
          onChange(next);
        }}>{mode.toUpperCase()}</button>)}
      </div><span className="archive-eyebrow">{view.mode === 'research' ? 'PROCESS' : 'ANALYSIS'}</span>
    </div>}
    <div id="archive-image-panel" role={step.held ? undefined : 'tabpanel'} aria-labelledby={step.held ? undefined : `archive-tab-${view.mode}`} tabIndex={0}>
      {tall && <p className="research-cut__reading-hint">긴 문서 · 스크롤하여 읽거나 클릭해 확대하세요.</p>}
      <div className="research-cut__stage" data-sheet>
        {step.held ? <div className="research-cut__empty"><span className="archive-eyebrow">06 / ON HOLD</span><h4>화면 구조로 이어지는 다음 단계.</h4><p>최종 와이어프레임 원본 확인 전까지<br/>자료 공개를 보류합니다.</p></div>
          : document ? <div key={document.id} className="research-cut__viewport" data-lenis-prevent={tall ? true : undefined} tabIndex={tall ? 0 : undefined} aria-label={tall ? '긴 문서 미리보기, 아래로 스크롤하여 읽기' : undefined}><button type="button" className="research-cut__image" data-document={document.id} aria-label={`${document.label} 상세 보기`} onClick={event => open(document, event)}>
            <img key={document.id} src={document.src} alt={document.alt} width={document.width} height={document.height} loading="lazy" decoding="async"/>
            <span className="research-cut__expand">확대해서 읽기 ↗</span>
          </button></div> : <div className="research-cut__empty"><span className="archive-eyebrow">RESEARCH / NOT CONNECTED</span><h4>연결된 초기 조사 이미지가 없습니다.</h4><p>앞 단계의 인사이트를 정리한 린 캔버스와<br/>정보 구조는 RESULT에서 확인할 수 있습니다.</p><button type="button" onClick={() => onChange('result')}>RESULT 보기 →</button></div>}
      </div>
      {document && <div className="research-cut__caption"><div><h4>{document.label}</h4><p>{document.caption}</p></div><a href={document.source} target="_blank" rel="noopener noreferrer" aria-label={`${document.label} Figma 원본`}>Figma ↗</a></div>}
      {excerpt && <div className="research-cut__excerpt"><span className="archive-eyebrow">자료에서 읽은 핵심</span><blockquote>{excerpt.text}</blockquote><a href={document.source} target="_blank" rel="noopener noreferrer">{document.label} · {excerpt.location} ↗</a></div>}
      {!step.held && <div className="research-cut__bottom">
        {documents.length > 1 && <div className="research-cut__pages" role="group" aria-label="현재 탭 자료 선택">{documents.map((item, index) => <button key={item.id} type="button" aria-pressed={index === view.index} onClick={() => onChange(view.mode, index)}><span>{String(index + 1).padStart(2, '0')}</span> {item.label}</button>)}</div>}
        {summary && view.mode === 'research' && <button type="button" className="research-cut__summary" onClick={event => open(summary, event)}>인터뷰 응답 요약 읽기 ↗</button>}
      </div>}
    </div>
  </div>;
}

export default memo(ResearchDesk);
