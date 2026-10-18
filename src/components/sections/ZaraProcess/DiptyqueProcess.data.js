// Section 08 only. Research artifacts are team work; hypotheses are not outcomes.
const file = 'https://www.figma.com/design/DwbaDAovYNR7jMSBg62PQs/';
export const sourceLink = node => `${file}?node-id=${node.replace(':', '-')}`;
export const sources = { research: sourceLink('204:23'), analysis: sourceLink('433:2568') };
const material = (id, label, node, parent, page, width, height, caption, options = {}) => ({
  id, label, node, parent, page, width, height, caption,
  src: `/media/images/diptyque/research/${id}.${options.ext || 'png'}`,
  source: sourceLink(node), alt: `DIPTYQUE 팀 프로젝트 · ${caption}`, ...options,
});
export const materials = {
  brand: material('desk-brand', '브랜드·운영 환경', '252:842', '251:316', 'research', 1878, 2032, '국내 브랜드관의 운영 환경과 브랜드 경험을 정리한 초기 조사 메모', { crop: true }),
  market: material('desk-market', '시장 조사', '251:612', '251:316', 'research', 1547, 1693, '니치 향수 시장·온라인 구매 환경을 수집한 2차 자료 요약'),
  company: material('desk-analysis', '자사 분석', '433:3679', '433:2689', 'analysis', 1920, 1080, '콘텐츠·UI·비주얼·마케팅·메시지·지원의 여섯 기준으로 평가한 자사 분석', { ext: 'jpg' }),
  competitors: material('competitive-research', '경쟁사 조사표', '251:306', '252:845', 'research', 2747, 1659, '조 말론·르 라보·바이레도의 쇼핑 경험, 개인화, 브랜드 표현을 비교한 조사 초안'),
  steep: material('competitive-steep', 'STEEP', '443:3765', '443:3810', 'analysis', 1920, 1080, '사회·기술·경제·환경·정책 관점에서 정리한 온라인 향수 경험의 설계 시사점'),
  threeC: material('competitive-3c', '3C', '479:299', '443:3810', 'analysis', 1920, 1400, '고객·경쟁사·자사 관점에서 탐색 효율과 브랜드 몰입의 접점을 정리한 3C 분석'),
  questions: material('interview-questions', '인터뷰 질문', '714:5032', '714:5031', 'analysis', 1039, 485, '구매 방식, 제품 비교, 브랜드 이해, 온라인·오프라인 경험을 묻는 실제 질문지'),
  answers: {
    id: 'interview-summary', kind: 'summary', label: '응답 요약', node: '714:5033', parent: '714:5031', page: 'analysis',
    source: sourceLink('714:5033'), caption: '실제 인터뷰 답변의 의미를 유지해 정리한 요약 · 직접 인용 아님',
    findings: [
      { topic: '향의 이해', text: '설명만으로 향의 분위기를 상상하기 어렵고, 실제 시향 경험과 차이가 있었습니다.', questions: 'Q3 · Q7 · Q8' },
      { topic: '제품 비교', text: '관련 제품은 확인할 수 있지만, 제품별 특징과 차이를 비교하기 어려웠습니다.', questions: 'Q4' },
      { topic: '브랜드 경험', text: '상품을 구매하기 전에 브랜드의 감성과 향이 탄생한 이야기를 경험하고 싶어 했습니다.', questions: 'Q5 · Q6 · Q9 · Q10' },
    ],
  },
  persona: material('user-persona', '주요 퍼소나', '433:2610', '433:2569', 'analysis', 1600, 1000, '사용자 유형을 설계 관점으로 정리한 브랜드 몰입형 주요 퍼소나', { ext: 'jpg' }),
  affinity: material('insight-affinity', 'Affinity Diagram', '479:353', '479:353', 'analysis', 1900, 860, '인터뷰 의견을 브랜드 전달·향 이해·제품 비교·메인 구조·온오프라인 간극으로 묶은 어피니티'),
  journey: material('insight-journey', 'Customer Journey Map', '433:3301', '433:3672', 'analysis', 2880, 1620, '브랜드 진입부터 구매 판단까지 행동·감정·문제·개선안을 연결한 브랜드 몰입형 여정지도'),
  canvas: material('strategy-canvas', 'Lean Product Canvas', '3131:19646', '3131:19446', 'analysis', 2200, 1650, '브랜드 이해와 제품 탐색의 연결을 가설·검증 목표·최소 테스트 계획으로 구체화한 린 캔버스', { ext: 'jpg' }),
  ia: material('strategy-ia', 'IA', '3521:16010', '762:5358', 'analysis', 1920, 878, 'HOME·SHOP·ABOUT·GALERIE·CONTACT US·MY PAGE의 역할과 최대 3단계 정보 구조'),
  menu: material('strategy-menu', '메뉴트리', '3109:8057', '3109:8056', 'analysis', 9090, 7698, '구매·브랜드 이야기·향 탐색·고객 지원·계정 관리를 구분한 상세 메뉴트리', { ext: 'jpg' }),
  flow: material('strategy-flow', '사용자 흐름', '3109:8869', '762:5358', 'analysis', 2180, 3426, 'HOME → ABOUT → 향 이야기 → SHOP → 제품 상세를 연결하고 바로 쇼핑하는 분기도 둔 사용자 흐름', { crop: true }),
};

export const steps = [
  {
    id: 'desk', title: 'Desk Research', eyebrow: '브랜드와 운영 환경에서 출발하다',
    body: '팀은 브랜드의 자연·여행·예술이라는 배경, 니치 향수 시장, 국내 브랜드관의 운영 환경을 조사했습니다. 초기 메모를 여섯 가지 평가 기준의 자사 분석으로 정리했습니다.',
    process: [materials.brand, materials.market], output: [materials.company], outputLabel: 'ANALYSIS',
    evidence: '팀의 자사 분석', finding: '구매 기능은 갖춰져 있지만, 브랜드의 이야기와 향을 이해하며 탐색하는 경험은 부족했습니다.',
    bridge: '다음 질문 → 경쟁사는 구매 편의와 브랜드 경험을 어떻게 연결하고 있을까?',
    note: '시장 조사 이미지는 팀이 수집·정리한 2차 자료입니다. 초안의 시장 수치를 검증된 사실이나 프로젝트 성과로 재인용하지 않았습니다.',
  },
  {
    id: 'competitive', title: 'Competitive Analysis', eyebrow: '비교의 기준을 넓히다',
    body: '조 말론의 현지화된 쇼핑, 르 라보의 개인화·향 이야기, 바이레도의 시각적 정체성을 비교했습니다. STEEP과 3C로 외부 환경과 고객·경쟁사·자사의 관계를 정리했습니다.',
    process: [materials.competitors], output: [materials.threeC, materials.steep], outputLabel: 'ANALYSIS',
    evidence: '팀의 비교 분석', finding: '딥디크의 차별화 방향은 빠른 제품 탐색과 감성적인 브랜드 경험을 하나의 흐름으로 연결하는 것이었습니다.',
    bridge: '다음 질문 → 실제 사용자도 이야기와 제품 탐색 사이에서 불편을 느낄까?',
    note: '경쟁사 비교와 STEEP·3C의 시사점은 팀의 조사·해석이며, 개선 효과를 검증한 결과는 아닙니다.',
  },
  {
    id: 'user', title: 'User Research', eyebrow: '사용자의 말에서 불편을 찾다',
    body: '인터뷰에서 향의 분위기를 이해하고 제품 간 차이를 비교하기 어렵다는 응답을 확인했습니다. 팀은 기존 고객형·브랜드 몰입형·향 탐색형을 정리하고 브랜드 몰입형을 주요 퍼소나로 설정했습니다.',
    process: [materials.answers, materials.questions], output: [materials.persona], outputLabel: 'ANALYSIS',
    evidence: '인터뷰에서 확인', finding: '이 응답자는 제품 목록보다 향의 분위기와 브랜드 이야기를 이해한 뒤 제품을 선택하고 싶어 했습니다.',
    bridge: '다음 질문 → 개별 답변을 어떤 공통 문제와 탐색 단계로 묶을 수 있을까?',
    note: '응답 요약은 실제 인터뷰 기록을 바탕으로 문장을 정리했습니다. 퍼소나는 팀이 구성한 설계용 모델이며 실제 응답자의 신원이 아닙니다.',
  },
  {
    id: 'insight', title: 'Insight Synthesis', eyebrow: '의견을 묶고, 여정 위에 놓다',
    body: 'Affinity Diagram으로 의견을 브랜드 전달·향 이해·제품 비교·메인 구조·온오프라인 간극의 다섯 범주로 묶었습니다. 여정지도에서는 진입 → 브랜드·향 이야기 → 제품 탐색 → 구매 판단에 문제와 기회를 배치했습니다.',
    process: [materials.affinity], output: [materials.journey], outputLabel: 'ANALYSIS',
    evidence: '분석에서 도출', finding: '이야기를 찾고 이해하는 구간의 단절을 줄이고, 각 이야기에서 관련 제품으로 이어지는 경로가 필요했습니다.',
    bridge: '다음 질문 → 이 연결을 어떤 메뉴와 사용자 흐름으로 설계할까?',
    note: '여정지도의 감정과 개선안은 인터뷰를 해석한 팀의 모델입니다. 개선 후 행동이나 만족도를 관측한 결과가 아닙니다.',
  },
  {
    id: 'strategy', title: 'UX Strategy & IA', eyebrow: '인사이트를 메뉴와 경로로 바꾸다',
    body: '린 캔버스에서 “시각적 이야기와 관련 제품 연결이 브랜드 이해를 높이는가”를 검증 가설로 정리했습니다. ABOUT에 역사·향 이야기를, GALERIE에 향 탐색을 두고, 이야기에서 SHOP·제품 상세로 이어지는 경로를 설계했습니다.',
    process: [materials.canvas], output: [materials.ia, materials.menu, materials.flow], outputLabel: 'OUTPUT',
    evidence: '설계 가설', finding: 'HOME → ABOUT → 향 이야기 → 관련 제품의 경로와, SHOP으로 바로 가는 경로를 함께 마련했습니다.',
    bridge: '다음 단계 → 이 정보의 순서와 연결을 와이어프레임으로 구체화',
    note: '검증 목표: 정체성 이해도 4.0/5 이상 · 관련 제품 상세 이동률 20% 이상 · 연결 이유 설명 75% 이상. 테스트 계획이며 달성 성과가 아닙니다.',
  },
  {
    id: 'wireframe', title: 'Wireframe', eyebrow: '정보 구조에서 화면 구조로', held: true,
    body: '앞 단계에서 정리한 메뉴와 사용자 흐름을 메인·주요 페이지의 화면 구조로 연결하는 단계입니다.',
    evidence: '보류', finding: '정보 구조와 사용자 흐름까지 확인했으며, 최종 와이어프레임과의 연결은 원본 확인 후 이어집니다.',
    note: '최종 원본 확인 대기 중입니다. 메인 및 주요 페이지의 화면 구조는 원본 확인 후 추가합니다.',
  },
];

// Archive presentation references the existing evidence without changing its provenance.
const archiveDetails = [
  { tasks: ['브랜드 철학·국내 운영 환경 조사', '니치 향수 시장 자료 수집', '여섯 기준의 자사 분석'], annotations: [{ document: 'desk-analysis', text: '구매 기능과 브랜드 경험을 구분해 평가했습니다.' }, { document: 'desk-brand', text: '초기 운영 환경 조사에서 브랜드 경험의 문제를 찾았습니다.' }] },
  { tasks: ['세 경쟁 브랜드의 경험 비교', 'STEEP으로 외부 환경 정리', '3C로 차별화 방향 도출'], annotations: [{ document: 'competitive-3c', text: '탐색 효율과 브랜드 몰입의 접점을 정리했습니다.' }] },
  { tasks: ['실제 인터뷰 질문·응답 검토', '탐색 방식과 불편 분류', '사용자 유형·주요 퍼소나 정리'], annotations: [{ document: 'interview-summary', text: '응답의 의미를 유지해 재구성한 요약입니다. 직접 인용이 아닙니다.' }, { document: 'user-persona', text: '퍼소나는 인터뷰를 해석한 설계용 모델입니다.' }] },
  { tasks: ['의견을 다섯 범주로 분류', '여정별 행동·감정·문제 연결', '이야기와 제품 사이의 기회 도출'], annotations: [{ document: 'insight-affinity', text: '브랜드 전달·향 이해·제품 비교·메인 구조·온오프라인 간극의 다섯 범주.' }, { document: 'insight-journey', text: '이야기 이해에서 제품 탐색으로 넘어가는 구간에 기회를 정리했습니다.' }] },
  { tasks: ['린 캔버스로 검증 가설 정리', '메뉴와 정보의 위계 설계', '브랜드 탐색·바로 구매 경로 연결'], annotations: [{ document: 'strategy-canvas', text: '캔버스의 수치는 달성 성과가 아닌 검증 목표입니다.' }, { document: 'strategy-ia', text: 'ABOUT·GALERIE·SHOP의 역할을 나누고 탐색 경로를 연결했습니다.' }] },
  { tasks: ['확인된 IA·사용자 흐름 보존', '최종 와이어프레임 원본 확인 대기'], annotations: [] },
];

export const archiveSteps = steps.map((step, index) => {
  const processImages = step.process || [];
  const analysisImages = step.output || [];
  return {
    ...step, ...archiveDetails[index], number: String(index + 1).padStart(2, '0'),
    description: step.body, processImages, analysisImages, keyFinding: step.finding,
    figmaNodeIds: [...processImages, ...analysisImages].map(item => item.node),
    documents: [...processImages.map(item => ({ ...item, role: 'RESEARCH', roleLabel: '조사 과정' })),
      ...analysisImages.map(item => ({ ...item, role: step.outputLabel, roleLabel: step.outputLabel === 'OUTPUT' ? '설계 결과' : '분석 결과' }))],
  };
});
