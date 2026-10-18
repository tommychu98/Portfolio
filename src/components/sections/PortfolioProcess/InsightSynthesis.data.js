import verified from './InsightSynthesis.background.json' with {type:'json'};
import {userResearchLayers,userResearchBackgroundLayers} from './UserResearch.data.js';
import {competitiveAnalysisLayers} from './CompetitiveAnalysis.data.js';

// MCP verified 2026-10-19. All coordinates are absolute within PAGE 433:2568.
// STEEP is nested at (84,169) in section 443:3810 at (-16069,-8165).
const base='/media/images/diptyque/insight-canvas/';
export const insightSynthesisLayers=[
  {id:'journey-map',title:'Journey Map',englishTitle:'Journey Map',figmaNodeId:'433:3672',
    frameName:'저니맵',width:2672,height:4714,position:{x:-13830,y:-8661},exportPadding:40,
    description:'팀이 정리한 세 사용자 유형의 여정지도입니다. 원본의 단계·행·열 구성을 유지했습니다.'},
  {id:'affinity-diagram',title:'Affinity Diagram',englishTitle:'Affinity Diagram',figmaNodeId:'479:659',
    focusFit:.94,
    frameName:'Affinity Diagram',width:2151,height:1154,position:{x:-16701,y:-4518},exportPadding:40,
    description:'인터뷰 의견을 다섯 범주로 묶은 원본 어피니티 다이어그램입니다.'},
  {id:'steep-analysis',title:'STEEP Analysis',englishTitle:'STEEP Analysis',figmaNodeId:'443:3765',
    focusFit:.94,
    frameName:'STEEP',width:1920,height:1080,position:{x:-15985,y:-7996},exportPadding:0,
    description:'사회·기술·경제·환경·정책 관점의 원본 STEEP 분석입니다.'},
].map((layer,index)=>{
  const asset=`${base}${layer.figmaNodeId.replace(':','-')}`;
  return {...layer,number:String(index+1).padStart(2,'0'),image:`${asset}-focus.png`,preview:`${asset}-overview.png`,
    document:{id:layer.id,label:layer.title,src:`${asset}-focus.png`,
      width:layer.width+2*layer.exportPadding,height:layer.height+2*layer.exportPadding,
      role:'INSIGHT SYNTHESIS',caption:layer.description,alt:`${layer.title} 실제 Figma 원본 전체`}};
});

// Every neighboring asset is an existing node export, reused at newly verified
// coordinates. Omit STEEP's ancestor; render its 3C sibling once, independently.
const originals=new Map(userResearchBackgroundLayers.map(frame=>[frame.id,frame]));
for(const layer of [...userResearchLayers,...competitiveAnalysisLayers]){
  originals.set(layer.figmaNodeId,{image:layer.preview,exportPadding:layer.exportPadding});
}
export const insightSynthesisBackgroundLayers=verified.frames.map(frame=>{
  const original=originals.get(frame.id);
  if(!original)throw new Error(`Missing verified Insight Synthesis source export: ${frame.id}`);
  return {...frame,image:original.image,exportPadding:original.exportPadding};
});
