import verified from './Design.background.json' with {type:'json'};
const base='/media/images/diptyque/design-canvas/';
// MCP-verified absolute coordinates on page 531:4818. Preserve every source gap.
export const designLayers=[
  {id:'image-references',title:'이미지 레퍼런스',englishTitle:'Image References',figmaNodeId:'4498:17178',frameName:'이미지 느낌',
    width:1414,height:2072,position:{x:-6545,y:-1369},exportPadding:40,pixelWidth:2988,pixelHeight:4304,
    description:'제품 패키지, 식물 드로잉, 건축과 콜라주 등 실제 수집 이미지의 배열을 보존한 레퍼런스 보드입니다.'},
  {id:'moodboard',title:'무드보드',englishTitle:'Moodboard',figmaNodeId:'578:3797',frameName:'무드보드',
    width:2319,height:1387,position:{x:-5056,y:-1369},exportPadding:40,pixelWidth:4798,pixelHeight:2934,focusFit:.94,
    description:'브랜드의 라벨과 향수병, 창립자와 식물 드로잉을 결합한 실제 메인 무드보드입니다.'},
  {id:'mind-map',title:'마인드 맵',englishTitle:'Mind Map',figmaNodeId:'3622:10711',frameName:'image 90',
    width:1254,height:1254,position:{x:-2662,y:-356},exportPadding:0,pixelWidth:2508,pixelHeight:2508,focusFit:.94,
    description:'향수·파리·기억·여행·예술·자연·창립자로 이어지는 브랜드 키워드를 정리한 원본 마인드 맵입니다.'},
  {id:'wireframe',title:'와이어프레임',englishTitle:'Wireframe',figmaNodeId:'5227:7857',frameName:'와이어프레임',
    width:2570.42333984375,height:4059,position:{x:-1195,y:-2180},exportPadding:40,pixelWidth:5301,pixelHeight:8278,
    description:'로고와 영상, 브랜드·향수 스토리, 제품 탐색과 푸터까지 실제 화면 구조와 작업 배치를 보존한 와이어프레임입니다.'},
].map((layer,index)=>{
  const asset=`${base}${layer.figmaNodeId.replace(':','-')}`;
  return {...layer,number:String(index+1).padStart(2,'0'),image:`${asset}-focus.png`,preview:`${asset}-overview.png`,
    document:{id:layer.id,label:layer.title,src:`${asset}-focus.png`,width:layer.pixelWidth,height:layer.pixelHeight,
      role:'DESIGN',caption:layer.description,alt:`${layer.title} 실제 Figma 원본 전체`}};
});
// Render the three other page-level nodes, never the primary sections' children twice.
export const designBackgroundLayers=verified.frames.map(frame=>({...frame,image:`${base}${frame.id.replace(':','-')}-background.png`}));
