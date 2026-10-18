import {sourceLink} from './DiptyqueProcess.data.js';
import background from './CompetitiveAnalysis.background.json' with {type:'json'};
import verified from './UserResearch.background.json' with {type:'json'};
import {competitiveAnalysisLayers} from './CompetitiveAnalysis.data.js';

// Figma page 433:2568, absolute source coordinates verified 2026-10-19.
// Persona names and profiles describe the team's design models, not respondents.
const base='/media/images/diptyque/user-canvas/';
// Keep the original empty space; widen Overview enough to see real neighbors.
export const userResearchOverviewPadding=.25;
export const userResearchLayers=[
  {id:'interview-collection',title:'인터뷰 모음',englishTitle:'Interview Collection',figmaNodeId:'5210:5077',
    width:2710,height:2882,position:{x:-23880,y:-2778},exportPadding:40,
    description:'질문·응답과 사용자 유형별 응답 요약을 담은 실제 인터뷰 모음입니다.'},
  {id:'interview-synthesis',title:'인터뷰 정리',englishTitle:'Interview Synthesis',figmaNodeId:'5149:9058',
    width:1890,height:1710,position:{x:-23880,y:467},ext:'png',exportPadding:0,
    description:'팀이 원본 응답을 정리한 인터뷰 문서입니다. 응답자 한 명의 경험을 다룹니다.'},
  {id:'user-personas',title:'퍼소나 1–3',englishTitle:'User Personas',figmaNodeId:'714:5039',
    width:2176,height:3984,position:{x:-19572,y:-2224},exportPadding:40,
    description:'기존 고객형·브랜드 몰입형·향 탐색형을 정리한 팀의 설계 모델입니다.'},
].map((layer,index)=>{
  const asset=`${base}${layer.figmaNodeId.replace(':','-')}`;
  return {...layer,number:String(index+1).padStart(2,'0'),frameName:layer.title,image:`${asset}-focus.png`,preview:`${asset}-overview.png`,
    document:{id:layer.id,label:layer.title,src:`${asset}-focus.png`,width:layer.width+2*layer.exportPadding,height:layer.height+2*layer.exportPadding,
      source:sourceLink(layer.figmaNodeId),role:'USER RESEARCH',caption:layer.description,alt:`${layer.title} 실제 Figma 원본`}};
});

// Reuse original exports with freshly verified page coordinates. Foreground
// ancestors/descendants are excluded so each source appears exactly once.
const existing=new Map(background.frames.map(frame=>[frame.id,frame]));
for(const layer of competitiveAnalysisLayers){
  existing.set(layer.figmaNodeId,{image:layer.preview,exportPadding:layer.exportPadding});
}
export const userResearchBackgroundLayers=verified.frames.map(frame=>{
  const original=existing.get(frame.id);
  return {...frame,image:original?.image||`${base}${frame.id.replace(':','-')}-background.png`,exportPadding:original?.exportPadding??40};
});
