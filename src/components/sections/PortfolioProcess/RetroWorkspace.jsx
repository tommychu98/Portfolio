import './RetroWorkspace.css';
import DeskResearchCanvas from './DeskResearchCanvas';

// Both supplied PNGs are preserved unchanged. Only their CSS geometry is fitted.
export default function RetroWorkspace({onExpand}) {
  return <figure className="diptyque-retro-window has-desk-canvas" aria-label="레트로 창 프레임 안의 실제 Figma 작업 화면">
    <div className="diptyque-retro-window__screen">
      <div className="diptyque-retro-window__ui-stage">
        <img className="figma-workspace-ui" src="/media/images/diptyque/window/figma-workspace.png" width="15356" height="8352" alt="DIPTYQUE Figma 작업 화면. 상단 탭, 왼쪽 Pages와 Layers, 중앙 캔버스, 오른쪽 속성 패널." loading="lazy" decoding="async"/>
        <DeskResearchCanvas onExpand={onExpand}/>
      </div>
    </div>
    <div className="diptyque-retro-window__frame" aria-hidden="true"/>
  </figure>;
}
