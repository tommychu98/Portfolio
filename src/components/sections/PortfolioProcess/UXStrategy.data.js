import verified from './UXStrategy.background.json' with {type:'json'};
import {userResearchLayers,userResearchBackgroundLayers} from './UserResearch.data.js';
import {insightSynthesisLayers} from './InsightSynthesis.data.js';
import {competitiveAnalysisLayers} from './CompetitiveAnalysis.data.js';

// MCP verified 2026-10-19. Shared parent 762:5358 is at (-47721,-15556).
// Use absolute page coordinates, never the children's parent-local positions.
const base='/media/images/diptyque/strategy-canvas/';
export const uxStrategyLayers=[
  {id:'information-architecture',title:'정보구조도',englishTitle:'Information Architecture',figmaNodeId:'740:5457',
    frameName:'IA',width:2323,height:1246,position:{x:-39291,y:-12626},exportPadding:40,focusFit:.94,
    pixelWidth:4238,pixelHeight:2339,
    description:'원본의 메뉴 계층과 연결 구조를 보존한 정보구조도입니다.'},
  {id:'user-flow',title:'유저플로우',englishTitle:'User Flow',figmaNodeId:'3132:11096',
    frameName:'요구사항 정의서 수정본_9/22 (디자인하며 지속적 수정 요망)',
    width:2420,height:3957,position:{x:-39254,y:-9966},exportPadding:0,pixelWidth:5011,pixelHeight:8192,
    // User explicitly confirmed this exact node after the content mismatch was disclosed.
    description:'지정한 원본 노드의 웹사이트 요구사항 정의서입니다. IA와 사용자 흐름을 반영한 기능·요구사항을 정리했습니다.'},
  {id:'final-flowchart',title:'최종 플로우 차트',englishTitle:'Final Flowchart',figmaNodeId:'764:741',
    frameName:'딥디크 웹사이트 플로우차트 by figma make',
    width:1549,height:1657,position:{x:-39243,y:-14757},exportPadding:0,focusFit:.94,
    pixelWidth:3830,pixelHeight:4096,
    description:'화면 흐름의 주요 분기와 연결선을 그대로 보존한 최종 플로우차트입니다.'},
].map((layer,index)=>{
  const asset=`${base}${layer.figmaNodeId.replace(':','-')}`;
  return {...layer,number:String(index+1).padStart(2,'0'),image:`${asset}-focus.png`,preview:`${asset}-overview.png`,
    document:{id:layer.id,label:layer.title,src:`${asset}-focus.png`,width:layer.pixelWidth,height:layer.pixelHeight,
      role:'UX STRATEGY & IA',caption:layer.description,alt:`${layer.title} 실제 Figma 원본 전체`}};
});

// Omit the shared ancestor; render its four other children independently so
// no foreground document or connector is duplicated underneath itself.
const originals=new Map(userResearchBackgroundLayers.map(frame=>[frame.id,frame]));
for(const layer of [...userResearchLayers,...insightSynthesisLayers,...competitiveAnalysisLayers]){
  originals.set(layer.figmaNodeId,{image:layer.preview,exportPadding:layer.exportPadding});
}
export const uxStrategyBackgroundLayers=verified.frames.map(frame=>{
  const original=originals.get(frame.id);
  return {...frame,image:original?.image||`${base}${frame.id.replace(':','-')}-background.png`,exportPadding:original?.exportPadding??0};
});
