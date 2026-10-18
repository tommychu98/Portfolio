import { materials, sourceLink } from './DiptyqueProcess.data.js';

// Representative source nodes, not synthesized charts. Full documents remain readable.
const base='/media/images/diptyque/desk-canvas/';
export const deskResearchLayers=[
  {id:'brand-analysis',number:'01',title:'자사 분석',englishTitle:'Brand Analysis',
    description:'기존 브랜드 경험과\n온라인 채널의 구조를 분석했습니다.',
    frameName:'자사분석',figmaNodeId:'433:3679',previewNode:'433:3679',
    image:materials.company.src,width:1920,height:1080,
    position:{x:40,y:30,width:620},
    document:{...materials.company,role:'DESK RESEARCH'}},
  {id:'market-research',number:'02',title:'시장 조사',englishTitle:'Market Research',
    description:'향수 시장의 환경과\n소비 트렌드를 조사했습니다.',
    frameName:'Section · 한국 향수 시장',figmaNodeId:'251:327',previewNode:'251:699',
    image:`${base}market-preview.png`,width:768,height:393,
    position:{x:720,y:180,width:560},
    document:{id:'desk-market-full',label:'시장 조사 · 니치향수 시장 리서치 요약',src:`${base}market-full.png`,width:768,height:1613,source:sourceLink('251:616'),role:'DESK RESEARCH',caption:'시장조사 섹션(251:327)의 실제 리서치 요약 프레임 전체입니다.',alt:'실제 Figma 니치향수 시장 리서치 요약'}},
  {id:'user-research',number:'03',title:'사용자 조사',englishTitle:'User Research',
    description:'기존 온라인 채널의\n사용자 행동과 불편을 조사했습니다.',
    frameName:'Section · 구체적 페인포인트',figmaNodeId:'251:328',previewNode:'251:1285',
    image:`${base}user-preview.png`,width:768,height:390,
    position:{x:590,y:580,width:660},
    document:{id:'desk-user-full',label:'사용자 조사 · 신세계V / SI빌리지',src:`${base}user-full.png`,width:768,height:1361,source:sourceLink('251:1188'),role:'DESK RESEARCH',caption:'사용자 조사 섹션(251:328)의 채널 특화 조사 프레임 전체입니다. 원본의 조사 내용이며 별도 인터뷰 결과를 생성하지 않았습니다.',alt:'실제 Figma 신세계V SI빌리지 이용자 조사'}},
];
