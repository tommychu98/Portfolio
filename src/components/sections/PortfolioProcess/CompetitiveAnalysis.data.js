import {sourceLink} from './DiptyqueProcess.data.js';
import background from './CompetitiveAnalysis.background.json' with {type:'json'};

// MCP verified 2026-10-19. 433:2568 is a PAGE, so its common origin is (0,0).
// 3C's nested local (79,114) becomes page-space (-16007,-6416).
const base='/media/images/diptyque/competitive-canvas/';
export const competitiveBackgroundLayers=background.frames;
export const competitiveAnalysisLayers=[
  {id:'competitor-research',number:'01',title:'경쟁사 분석',englishTitle:'Competitor Research',
    description:'조 말론·르 라보·바이레도의 브랜드 경험을 비교한 원본 조사 자료입니다.',
    figmaNodeId:'5207:5064',frameName:'경쟁사 분석',width:3792,height:5320,exportPadding:40,
    position:{x:-8709,y:-3356}},
  {id:'brand-analysis-table',number:'02',title:'자사 분석표',englishTitle:'Brand Analysis Table',
    description:'자사 사이트의 콘텐츠와 UI·비주얼을 정리한 원본 분석표입니다.',
    figmaNodeId:'433:2689',frameName:'자사 분석',width:2252,height:1385,exportPadding:40,
    position:{x:-13620,y:-3364}},
  {id:'competitor-analysis-table',number:'03',title:'경쟁사 분석표',englishTitle:'Competitor Analysis Table',
    description:'세 경쟁사의 제품 탐색과 브랜드 표현을 비교한 원본 분석표입니다.',
    figmaNodeId:'433:3050',frameName:'경쟁사',width:2252,height:1912,exportPadding:40,
    position:{x:-13620,y:-1288}},
  {id:'three-c-analysis',number:'04',title:'3C Analysis',englishTitle:'3C Analysis',
    description:'고객·경쟁사·자사 관점을 함께 정리한 원본 3C 분석입니다.',
    figmaNodeId:'479:299',frameName:'3C Analysis',width:1920,height:1400,exportPadding:0,
    position:{x:-16007,y:-6416}},
].map(layer=>{
  const asset=layer.figmaNodeId.replace(':','-');
  return {...layer,image:`${base}${asset}-focus.png`,preview:`${base}${asset}-overview.png`,
    document:{id:`competitive-${layer.id}`,label:layer.title,src:`${base}${asset}-focus.png`,
      width:layer.width,height:layer.height,source:sourceLink(layer.figmaNodeId),role:'COMPETITIVE ANALYSIS',
      caption:`실제 Figma 원본 전체 · ${layer.figmaNodeId}`,alt:`${layer.title} 실제 Figma 원본`}};
});
