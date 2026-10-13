// Team presentation: Figma DwbaDAovYNR7jMSBg62PQs, section 3208:5234.
// Planning decisions, not measured post-launch outcomes.
export const proposal = 'https://www.figma.com/design/DwbaDAovYNR7jMSBg62PQs/?node-id=3208-5234';
const material = (id, label, node, alt) => ({ id, label, src: `/media/images/diptyque/planning/${id}.png`, source: `${proposal.split('?')[0]}?node-id=${node}`, alt });
export const materials = {
  background: material('background', 'STEEP 분석', '4581-10479', '향수 소비와 온라인 경험의 변화를 살펴본 팀의 STEEP 분석'),
  problem: material('problem', '현재 경험 → 제안 경험', '2960-10518', '제품 중심 탐색에서 브랜드 이야기와 향의 분위기를 함께 탐색하는 경험으로의 전환'),
  journey: material('journey', '브랜드 몰입형 저니맵', '3414-14053', '브랜드 진입, 향과 제품 발견, 구매 판단 과정의 행동·감정·문제·개선안'),
  persona: material('persona', '주요 퍼소나 · 박지은', '3414-14053', '팀이 정의한 브랜드 몰입형 주요 퍼소나 박지은의 일러스트'),
  solution: material('solution', 'UX 개선 방향', '3571-17691', '공식 경험 통합, 브랜드 경험 확장, 직관적인 향 탐색과 브랜드 책임'),
  ia: material('ia', '정보 구조도', '3675-9424', 'HOME, SHOP, ABOUT, GALERIE, CONTACT US, MY PAGE로 구성한 최대 3단계 메뉴 구조'),
  wireframe: material('wireframe', '주요 화면 와이어프레임', '3823-5803', '영상 영역과 이미지·텍스트 배치, 낮과 밤의 화면 흐름을 정리한 와이어프레임'),
};
export const steps = [
  {
    id: 'background', category: 'BACKGROUND', title: '제품을 찾는 곳에서,\n브랜드를 경험하는 공간으로.',
    body: '팀은 시장·소비자 자료와 STEEP 분석을 통해, 향수 선택에서 취향과 브랜드 감성도 중요하다는 점에 주목했습니다.',
    points: [['발견', '온라인에서는 직접 향을 맡을 수 없어, 제품 정보만으로 분위기를 전달하기 어렵습니다.'], ['방향', '자연·여행·예술에서 출발한 딥디크의 이야기를 탐색의 단서로 삼았습니다.']],
    materials: [materials.background],
  },
  {
    id: 'problem', category: 'PROBLEM DEFINITION', title: '이야기는 있었지만,\n탐색으로 이어지지 않았습니다.',
    body: '기존 국내 유통 채널의 브랜드 콘텐츠를 부정하기보다, 제품을 고르는 과정과의 연결을 개선 대상으로 정했습니다.',
    points: [['정보 분산', '공식 소식·제품 정보가 여러 접점에 나뉘어 있었습니다.'], ['경험 단절', '브랜드 역사와 향의 배경을 본 뒤 제품으로 이어지는 흐름이 약했습니다.'], ['탐색의 한계', '향 노트와 원료 설명만으로는 취향에 맞는 향을 상상하기 어려웠습니다.']],
    materials: [materials.problem],
  },
  {
    id: 'target', category: 'PERSONA & JOURNEY', title: '다른 방문 목적,\n세 가지 탐색의 어려움.',
    body: '팀의 사용자 설문과 퍼소나·저니맵을 바탕으로, 브랜드 몰입형을 주요 퍼소나로 두고 기존 고객과 향 입문자의 여정도 함께 고려했습니다.',
    points: [['기존 고객형', '공식 정보 확인 → 관심 상품 저장 → 재구매를 한곳에서.'], ['브랜드 몰입형', 'History → Fragrances Story → 관심 제품으로 이야기의 흐름 연결.'], ['향 탐색형', '낯선 향 노트 대신 장면·이미지·분위기로 취향을 발견.']],
    materials: [materials.journey, materials.persona],
  },
  {
    id: 'direction', category: 'UX DIRECTION', title: '발견한 문제를\n화면의 역할로 바꾸었습니다.',
    body: '팀은 정보 통합, 브랜드 몰입, 향 탐색을 개선 축으로 정하고 각 화면의 역할에 연결했습니다.',
    points: [['정보 통합', 'SHOP · MY PAGE에서 제품 정보와 관심 상품, 주문 내역을 확인하도록 기획했습니다.'], ['브랜드 몰입', 'History · Fragrances Story에서 역사와 향의 배경을 제품 탐색에 연결했습니다.'], ['향 탐색', 'GALERIE에서는 장면과 이미지로 향의 느낌을 이해하고 관련 향수를 탐색하도록 구성했습니다.']],
    note: 'For the Planet에는 지속가능성과 책임 있는 원료에 대한 브랜드의 태도를 담았습니다.',
    materials: [materials.solution],
  },
  {
    id: 'structure', category: 'INFORMATION ARCHITECTURE', title: '구매와 이야기의 입구를\n명확히 나누었습니다.',
    body: '팀은 메뉴를 최대 3단계로 정리하고, 구매·브랜드 이해·취향 탐색의 진입점을 구분했습니다.',
    points: [['SHOP', '베스트셀러·시즌·선물·제품군으로 상품 탐색 기준을 구분했습니다.'], ['ABOUT · GALERIE', '역사·향 이야기·브랜드 가치는 ABOUT에, 감각적인 향 탐색은 GALERIE에 배치했습니다.'], ['지원·관리', 'CONTACT US와 MY PAGE로 문의·정책 확인과 주문 관리의 역할을 나누었습니다.']],
    materials: [materials.ia],
  },
  {
    id: 'wireframe', category: 'WIREFRAME', title: '정보의 순서를\n화면의 리듬으로 구체화했습니다.',
    body: '정보 구조를 바탕으로 팀은 주요 화면의 콘텐츠 순서와 이미지·텍스트 비중을 와이어프레임으로 정리했습니다.',
    points: [['진입', '메인 영상 영역으로 브랜드 분위기를 먼저 전달하도록 계획했습니다.'], ['탐색', '이미지와 짧은 설명을 교차 배치해 이야기와 제품을 함께 살펴보도록 구성했습니다.'], ['시각화', '낮·밤 장면과 콜라주형 구도로 보이지 않는 향의 분위기를 화면에 옮겼습니다.']],
    note: '팀의 설계안이며, 사용성 검증이나 성과 수치를 의미하지 않습니다.',
    materials: [materials.wireframe],
  },
];
