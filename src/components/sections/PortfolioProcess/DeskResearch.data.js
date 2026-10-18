import { sourceLink } from './DiptyqueProcess.data.js';

import backgroundSource from './DeskResearch.background.json' with {type:'json'};

// Verified with Figma MCP on 2026-10-19. Coordinates are local to 251:316.
// Parent page origin: (8981, 3306); identity linear transform; no rotation.
export const deskResearchSource={file:'DwbaDAovYNR7jMSBg62PQs',page:'204:23',parent:'251:316',x:8981,y:3306,width:6614,height:20000};
const base='/media/images/diptyque/desk-canvas/';
export const deskResearchBackground=backgroundSource.frames;
export const deskResearchLayers=[
  {id:'brand-analysis',number:'01',title:'자사 분석',englishTitle:'Brand Analysis',
    description:'기존 브랜드 경험과 온라인 채널의 구조를 분석했습니다.',
    frameName:'자사분석',figmaNodeId:'252:844',
    image:`${base}brand-section.png`,preview:`${base}brand-overview.png`,width:3042,height:5090,
    position:{x:0,y:4524,width:3042,height:5090}},
  {id:'market-research',number:'02',title:'시장 조사',englishTitle:'Market Research',
    description:'향수 시장의 환경과 소비 트렌드를 조사했습니다.',
    frameName:'시장조사',figmaNodeId:'251:327',
    image:`${base}market-section.png`,preview:`${base}market-overview.png`,width:5932,height:3202,
    position:{x:213,y:222,width:5932,height:3202}},
  {id:'user-research',number:'03',title:'사용자 조사',englishTitle:'User Research',
    description:'기존 온라인 채널의 사용자 행동과 불편을 조사했습니다.',
    frameName:'사용자 조사 => 인터뷰로 하기',figmaNodeId:'251:328',
    image:`${base}user-section.png`,preview:`${base}user-overview.png`,width:5624,height:4180,
    position:{x:495,y:10538,width:5624,height:4180}},
].map(layer=>({...layer,document:{id:`desk-${layer.id}-full`,label:layer.title,
  src:layer.image,width:layer.width,height:layer.height,source:sourceLink(layer.figmaNodeId),
  role:'DESK RESEARCH',caption:`실제 Figma 원본 섹션 전체 · ${layer.figmaNodeId}`,alt:`${layer.title} Figma 원본 섹션 전체`}}));
