import { archiveSteps, materials, sourceLink } from './DiptyqueProcess.data.js';

const original = (item, frameName, crop = [0, 0, 1, 1]) => ({ ...item, frameName, crop });
const capture = (id, frameName, node, width, height, caption, crop = [0, 0, 1, 1]) => ({
  id, frameName, label: frameName, node, width, height, caption, crop,
  src: `/media/images/diptyque/workspace/${id}.png`, source: sourceLink(node), alt: `DIPTYQUE 실제 Figma 자료: ${caption}`,
});
const site = capture('korea-site', 'screencapture-shinsegaev-store-diptyque-2026-08-28-11_44_48 1', '813:5331', 946, 2800, '콘텐츠 정리 페이지에 보관된 한국 스토어 원본 캡처', [0, 0, 1, .27]);
const market = original(materials.market, '시장조사', [0, .12, 1, .58]);
const brand = original(materials.brand, 'image 35', [0, 0, 1, .52]);
const company = original(materials.company, '자사분석', [.26, .26, .66, .69]);
const competition = original(materials.competitors, '경쟁사 3사 간단 분석표');
const threeC = original(materials.threeC, '3C Analysis', [.04, .52, .92, .43]);
const steep = original(materials.steep, 'STEEP');
const interview = capture('interview-board', '인터뷰 정리', '5149:9058', 1800, 1629, '자료분석 페이지의 실제 인터뷰 정리 프레임', [0, 0, 1, .48]);
const questions = original(materials.questions, '질문');
const persona = original(materials.persona, '린2 -Primary Persona', [.3, .23, .64, .63]);
const affinity = original(materials.affinity, 'affinity diagram');
const journey = original(materials.journey, '저니맵2', [.15, .23, .78, .67]);
const canvas = original(materials.canvas, 'diptyque_lean_product_canvas_problem2_integrated 2', [.32, .09, .29, .53]);
const ia = original(materials.ia, 'Group 2410');
const menu = original(materials.menu, '메뉴트리 딥디크', [0, 0, 1, .55]);
const flow = original(materials.flow, '변경 _2_added', [0, 0, 1, .44]);
const wireHistory = capture('wire-history', 'con 1 - history', '2804:14750', 1800, 1013, '브랜드 히스토리의 이미지와 텍스트 배치를 설계한 실제 와이어프레임');
const wirePerfume = capture('wire-perfume', 'con 3 - perfume history', '2804:14816', 1800, 432, '향수 스토리의 3열 이미지와 텍스트 구조', [0, 0, .65, 1]);
const wireMenu = capture('wire-menu', 'menu - wire frame', '2100:4965', 1800, 104, '실제 와이어프레임의 메뉴 구조');

const scenes = [
  { description: '브랜드와 시장을 조사해\n온라인 경험의 문제를 살폈습니다.', research: [site, market, brand], result: [company] },
  { description: '경쟁사의 탐색 경험을 비교해\n차별화 방향을 정리했습니다.', research: [competition, steep, threeC], result: [threeC, steep] },
  { description: '인터뷰의 불편을 모아\n주요 퍼소나로 정리했습니다.', research: [interview, questions], result: [persona] },
  { description: '인터뷰 의견을 묶고\n사용자 여정에 연결했습니다.', research: [affinity, interview], result: [journey] },
  { description: '인사이트를 바탕으로\n메뉴와 탐색 경로를 설계했습니다.', research: [canvas, menu, flow], result: [ia, menu, flow, canvas] },
  { title: 'Design', description: '디자인 레퍼런스를 탐색하고,\n와이어프레임에서 최종 시안까지 발전시켰습니다.', research: [wireHistory, wirePerfume, wireMenu], result: [wireHistory, wirePerfume], held: false,
    keyFinding: '수집한 영감을 실제 화면 경험으로 구체화했습니다.', findingHighlight: '실제 화면 경험' },
];

// Editorial arrangements of real source frames, not a recording of team activity.
// Coordinates stay fixed while the camera moves: selecting never reorders documents.
const arrangements = [
  { name: '조사 자료 · 자사 분석', size: [1360, 820], items: [[brand,30,55,310],[site,390,150,540],[market,45,390,300],[company,990,230,350]] },
  { name: '경쟁사 비교 · 환경 분석', size: [1720, 780], items: [[competition,40,120,570],[steep,675,75,430],[threeC,1170,180,510]] },
  { name: '질문 · 인터뷰 정리 · 퍼소나', size: [1490, 850], items: [[questions,25,60,330],[interview,410,190,570],[persona,1040,100,400]] },
  { name: '의견 묶기 · 사용자 여정', size: [1540, 920], items: [[interview,30,75,320],[affinity,405,65,600],[journey,620,540,820]] },
  { name: '린 캔버스 · 정보 구조 · 흐름', size: [1710, 1000], items: [[canvas,25,140,340],[menu,445,70,660],[flow,500,570,690],[ia,1225,230,440]] },
  { name: '메뉴 · 화면 설계 · 스토리 흐름', size: [1710, 880], items: [[wireMenu,230,40,1040],[wireHistory,100,220,820],[wirePerfume,1010,350,630]] },
];

export const workspaceSteps = archiveSteps.map((step, index) => {
  const scene = arrangements[index];
  const frames = scene.items.map(([item,x,y,w])=>({...item, position:{x,y,w}}));
  const prioritize = preferred => [...preferred.map(item=>frames.find(frame=>frame.id===item.id)), ...frames.filter(frame=>!preferred.some(item=>item.id===frame.id))];
  const size=[Math.max(scene.size[0],...frames.map(f=>f.position.x+f.position.w+30)),Math.max(scene.size[1],...frames.map(f=>f.position.y+28+f.position.w*f.height*f.crop[3]/(f.width*f.crop[2])+40))];
  return { ...step, ...scenes[index], scene: {...scene,size,frames}, research:prioritize(scenes[index].research), result:prioritize(scenes[index].result) };
});
