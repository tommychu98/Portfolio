import './RetroWorkspace.css';
import DeskResearchCanvas from './DeskResearchCanvas';

// The UI preview is a quarter-size export of the supplied bitmap, at the same
// aspect ratio. Avoid decoding the 128-megapixel reference during camera motion.
export default function RetroWorkspace({onExpand,chapter,layers,backgroundLayers,overviewPadding}) {
  return <figure className="diptyque-retro-window has-desk-canvas" aria-label="레트로 창 프레임 안의 실제 Figma 작업 화면">
    <div className="diptyque-retro-window__screen">
      <div className="diptyque-retro-window__ui-stage">
        <img className="figma-workspace-ui" src="/media/images/diptyque/window/figma-workspace-preview.png" width="15356" height="8352" alt="DIPTYQUE Figma 작업 화면. 상단 탭, 왼쪽 Pages와 Layers, 중앙 캔버스, 오른쪽 속성 패널." loading="eager" fetchPriority="low" decoding="async"/>
        <DeskResearchCanvas onExpand={onExpand} chapter={chapter} layers={layers} backgroundLayers={backgroundLayers} overviewPadding={overviewPadding}/>
      </div>
    </div>
    <div className="diptyque-retro-window__frame" aria-hidden="true"/>
  </figure>;
}
