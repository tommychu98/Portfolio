import { memo, useRef } from 'react';
import { useWorkspaceCamera } from './useWorkspaceCamera';

export function InterviewNotes({ document }) {
  return <div className="research-notes"><span className="archive-eyebrow">INTERVIEW / RESPONSE NOTES</span><h4>사용자의 말에서<br/>발견한 세 가지.</h4><dl>{document.findings.map((finding, index) => <div key={finding.topic}><dt><span>0{index + 1}</span>{finding.topic}<small>{finding.questions}</small></dt><dd>{finding.text}</dd></div>)}</dl><p>실제 응답의 의미를 유지한 요약 · 직접 인용 아님</p></div>;
}


function FramePreview({ item, selected, onSelect, onExpand }) {
  const [x, y, width, height] = item.crop;
  return <div className={`workspace-frame ${selected ? 'is-selected' : ''}`} style={{left:item.position.x,top:item.position.y,width:item.position.w,'--frame-ratio':(item.width * width) / (item.height * height)}} data-work-frame={selected ? 'selected' : 'secondary'}>
    <div className="workspace-frame__name" title={item.frameName}><span aria-hidden="true">⌗</span> {item.frameName}</div>
    <button type="button" tabIndex={selected?0:-1} className="workspace-frame__image" data-document={item.id} aria-label={`${item.label} ${selected ? '상세 보기' : '프레임 선택'}`} onClick={event=>selected ? onExpand(item,event.currentTarget) : onSelect()}>
      <div className="workspace-frame__crop" style={{aspectRatio: (item.width * width) / (item.height * height)}}>
        <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" style={{width:`${100 / width}%`,left:`${-100*x/width}%`,top:`${-100*y/height}%`}}/>
      </div>
      {selected && <span className="workspace-frame__selection" data-selection aria-hidden="true"><i/><i/><i/><i/></span>}
    </button>
  </div>;
}

function ResearchDesk({ step, view, onChange, onExpand }) {
  const documents = step[view.mode];
  const selected = documents[view.index] || documents[0];
  const viewport=useRef(null),plane=useRef(null);
  const camera=useWorkspaceCamera(viewport,plane,step.scene,selected,view.mode,view.index,view.focus);
  const expand = (item,trigger)=>onExpand({...item,role:view.mode.toUpperCase()},trigger);
  const tabs = ['research','result'];
  return <div className="research-desk research-cut figma-workspace" data-workspace>
    <div className="workspace-titlebar"><span className="workspace-mark" aria-hidden="true">↖</span><span>DIPTYQUE / {step.scene.name}</span></div>
    <div className="workspace-layout">
      <aside className="workspace-layers" aria-label="Figma 자료 목록">
        <span className="workspace-panel-label">Pages</span>
        <div className="workspace-page-name">{step.id==='wireframe' ? '와이어프레임' : view.mode==='research' ? '자료조사' : '자료분석 완성'}</div>
        <span className="workspace-panel-label">Layers</span>
        <div className="workspace-layer-list">{documents.map((item,index)=><button key={item.id} type="button" title={item.frameName} aria-pressed={selected.id===item.id} onClick={()=>selected.id===item.id?camera.focus():onChange(view.mode,index,true)}><span aria-hidden="true">⌗</span><span>{item.frameName}</span></button>)}</div>
      </aside>
      <div className="workspace-main">
        <div className="research-cut__toolbar"><div role="tablist" aria-label="조사 과정과 분석 결과" className="research-cut__tabs">
          {tabs.map(mode=><button key={mode} id={`archive-tab-${mode}`} type="button" role="tab" aria-selected={view.mode===mode} aria-controls="archive-image-panel" tabIndex={view.mode===mode?0:-1} onClick={()=>onChange(mode)} onKeyDown={event=>{
            if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
            event.preventDefault();
            const next=event.key==='Home'?'research':event.key==='End'?'result':tabs.find(value=>value!==mode);
            event.currentTarget.parentElement.querySelector(`#archive-tab-${next}`).focus();onChange(next);
          }}>{mode.toUpperCase()}</button>)}
        </div><span className="workspace-mode">{view.mode==='research'?'PROCESS':'RESULT'}</span></div>
        <div ref={viewport} className={`workspace-canvas is-${view.mode}`} id="archive-image-panel" role="tabpanel" aria-labelledby={`archive-tab-${view.mode}`} aria-describedby="canvas-help" tabIndex={0} onPointerDown={camera.onPointerDown} onPointerMove={camera.onPointerMove} onPointerUp={camera.onPointerUp} onPointerCancel={camera.onPointerUp} onKeyDown={camera.onKeyDown}>
          <div className="workspace-scene" data-sheet>
            <div ref={plane} className="workspace-plane" style={{width:step.scene.size[0],height:step.scene.size[1],'--camera-scale':camera.percent/100}}>
              {step.scene.frames.map(item=><FramePreview key={item.id} item={item} selected={item.id===selected.id} onExpand={expand} onSelect={()=>onChange(view.mode,documents.findIndex(document=>document.id===item.id),true)}/>)}
            </div>
          </div>
          <div className="workspace-cursor" data-work-cursor aria-hidden="true"><svg width="22" height="28" viewBox="0 0 22 28"><path d="M2 2L19 17L11 18L7 25Z" fill="currentColor" stroke="white" strokeWidth="1.5"/></svg><span>탐색</span></div>
        </div>
        <div className="workspace-status"><span id="canvas-help">빈 공간 드래그 · 프레임 선택</span><div className="workspace-zoom"><button type="button" onClick={camera.overview}>전체</button><button type="button" onClick={camera.focus}>선택</button><button type="button" aria-label="캔버스 축소" onClick={()=>camera.zoom(.8)}>−</button><output aria-label="캔버스 배율">{camera.percent}%</output><button type="button" aria-label="캔버스 확대" onClick={()=>camera.zoom(1.25)}>+</button></div></div>
        <span className="sr-only">방향키로 캔버스를 이동하고 +, -로 확대·축소, 0으로 전체를 봅니다. 선택한 이미지를 클릭하면 원본 전체가 열립니다.</span>
      </div>
    </div>
    <p className="workspace-provenance">실제 Figma 자료 · 탐색을 위해 재구성한 캔버스 · 선택 이미지 클릭 시 원본 확대</p>
  </div>;
}
export default memo(ResearchDesk);
