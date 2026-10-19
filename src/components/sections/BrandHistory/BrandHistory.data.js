const asset = (chapter, name) => `/media/diptyque-history/${chapter}/${name}.png`;

const object = (chapter, name, label, description, kind = 'OBJECT', motion) => ({
  src: `/media/diptyque-history/${chapter}/${name}`, label, description, kind, motion,
});

const chapterObjects = {
  fabric: [
    object('fabric', 'fabric-pick-up.gif', '직물을 집는 손', '천을 들어 올리는 실제 GIF. 패턴과 직물이 브랜드의 출발점이라는 이야기를 손의 동작으로 전합니다.', 'GIF'),
    object('fabric', 'history-fabric-background.png', '작업대의 질감', '직물과 종이 콜라주를 받치는 전체 배경. 부드러운 명암으로 재료가 놓인 작업대의 깊이를 만듭니다.', 'BACKGROUND'),
    object('fabric', 'story-pattern-layer-top.png', '반복되는 패턴', '직물 위의 반복적인 무늬를 통해 향 이전부터 이어져 온 딥디크의 시각적 리듬을 보여줍니다.', 'TEXTURE'),
    object('fabric', 'story-founders-visual.png', '세 창립자의 시선', '서로 다른 예술적 배경을 가진 창립자들의 이야기를 연결하는 원본 비주얼입니다.'),
    object('fabric', 'story-decorative-collage-01.png', '꽃과 리본 콜라주', '꽃과 리본을 겹친 드로잉. 작업대 위의 재료들과 함께 창작의 분위기를 표현합니다.'),
    object('fabric', 'floating-fabric-collage-01.png', '패브릭 조각', '큰 화면 주변에 놓인 작은 직물 조각. 중심 장면과 주변 디테일 사이에 시선의 리듬을 만듭니다.'),
    object('fabric', 'floating-decorative-object-03.png', '작업대 위 커피', '직물과 붓 사이에 놓인 커피 잔. 창작자의 작업 공간에 일상적인 온기를 더합니다.'),
    object('fabric', 'floating-botanical-pot.png', '식물과 화분', '화분 위에 잎사귀를 겹치고 부드러운 흔들림을 더했습니다. 자연에서 영감을 얻는 브랜드의 태도를 전합니다.', 'MOTION', 'plant'),
  ],
  objects: [
    object('objects', 'objects-walking-figure.gif', '부티크를 걷는 인물', '원본 걷기 GIF. 오브제로 가득한 공간을 사람의 시선과 움직임을 따라 탐색하도록 연결합니다.', 'GIF'),
    object('objects', 'objects-detail-visual-01.png', '시간을 품은 장식 시계', '시계판과 시침, 분침을 별도의 PNG로 겹쳤습니다. 움직이는 시곗바늘이 수집품 사이에 흐르는 시간을 표현합니다.', 'MOTION', 'clock'),
    object('objects', 'objects-background-main.png', '부티크의 벽면', '선반과 수집품을 담는 전체 배경. 물건들의 위치와 크기 차이가 하나의 공간으로 읽히도록 받쳐줍니다.', 'BACKGROUND'),
    object('objects', 'story-01-collected-object-01.png', '첫 번째 수집품', '서로 다른 재료와 형태가 함께 놓이는 수집의 장면. 제품 분류보다 취향의 발견을 강조합니다.'),
    object('objects', 'floating-framed-image-01.png', '여행을 담은 액자', '여행에서 만난 풍경을 액자 속에 담았습니다. 창립자들이 다녔던 장소와 그곳에서 얻은 영감을 구체적인 이미지로 보여줍니다.'),
    { ...object('objects', 'objects-shelf-object-05.png', '여행을 향한 호기심', '선반 위의 작은 지구본으로 여행과 탐험을 좋아하는 취향을 암시했습니다. 먼 곳에서 발견한 사물들이 부티크에 모이는 이야기와 연결됩니다.'), layout: 'globe' },
    object('objects', 'story-02-decorative-visual.png', '공간에 녹아든 이야기', '설명 문구를 장식 액자 안에 배치했습니다. 부티크를 둘러보는 흐름 속에서 브랜드 이야기를 자연스럽게 읽도록, 문구도 공간의 오브제로 구성했습니다.', 'COPY', 'quote-frame'),
    object('objects', 'objects-shelf-object-07.png', '다음 감각을 여는 촛불', '선반 위 촛대의 불꽃에 일렁임을 더했습니다. 수집한 사물에서 공간을 채우는 향으로, 다음 SCENT 장면을 자연스럽게 이어줍니다.', 'MOTION', 'candlestick'),
  ],
  scent: [
    object('scent', 'story-01-candle-object-02.png', '향을 품은 캔들', '캔들 PNG의 심지 위에서 작은 불꽃이 흔들립니다. 따뜻한 빛으로 향이 채우는 공간을 표현합니다.', 'MOTION', 'flame'),
    object('scent', 'background-hero-scene.png', '향이 시작되는 공간', '따뜻한 빛이 새어 나오는 부티크. 보이지 않는 향을 공간의 분위기로 느끼게 하는 첫 장면입니다.', 'BACKGROUND'),
    object('scent', 'background-candle-scene.png', '테이블의 맞은편', '향과 빛이 머무는 테이블의 인물 레이어. 공간 속 사람의 시선과 몸짓으로 장면을 연결합니다.'),
    object('scent', 'background-long-composite.png', '연속된 풍경', 'SCENT 전체를 잇는 긴 배경. 스크롤 방향을 바꾸어도 장면의 공간적인 관계가 이어집니다.', 'BACKGROUND'),
    object('scent', 'story-01-atmosphere-visual.png', '흰 테이블보', '캔들과 유리잔이 놓이는 흰 테이블보. 주름과 명암으로 사물들이 머무는 공간을 만듭니다.'),
    object('scent', 'story-01-feature-collage.png', '테이블 위의 꽃', '화병에 담긴 꽃과 잎의 드로잉. 자연에서 얻는 향의 영감을 저녁의 장면에 연결합니다.'),
    object('scent', 'story-02-feature-visual.png', '사람과 향의 기억', '향을 제품 하나로 끝내지 않고 사람과 순간의 기억으로 확장하는 인물 비주얼입니다.'),
    object('scent', 'story-01-decorative-object-01.png', '빛을 담는 유리잔', '섬세한 유리잔의 드로잉. 투명한 질감과 반사된 빛으로 테이블의 디테일을 더합니다.'),
  ],
  maison: [
    object('maison', 'story-03-feature-visual.png', '태양', '천천히 회전하는 태양의 드로잉. 자연과 예술의 영감을 담고 마지막 풍경의 중심을 만듭니다.', 'MOTION', 'sun'),
    object('maison', 'story-03-background.png', '열리는 풍경', 'MAISON의 마지막을 받치는 전체 배경. 브랜드의 세계가 넓어지는 여운을 남깁니다.', 'BACKGROUND'),
    object('maison', 'story-03-visual-01.png', '구름', '층을 이루는 구름의 드로잉. 넓은 풍경의 깊이와 부드러운 장면 연결을 담당합니다.'),
    object('maison', 'story-02-visual-03.png', '겹쳐지는 구름', '여러 크기와 방향으로 반복되는 구름 레이어. 글자와 천사 사이에 깊이와 여백을 만듭니다.'),
    object('maison', 'story-02-visual-06.png', '활을 든 천사', '구름 위에 놓인 또 다른 천사. 서로 다른 몸짓이 넓은 여백에 시각적인 리듬을 만듭니다.'),
    object('maison', 'story-02-visual-08.png', '날개를 펼친 천사', '마지막 풍경으로 넘어가기 전 등장하는 천사 드로잉. 예술에서 얻은 영감을 브랜드의 세계에 연결합니다.'),
    object('maison', 'finale-agave.png', '자연의 실루엣', '마지막 장면의 식물 레이어. 자연에서 얻는 영감이 브랜드의 현재까지 이어짐을 보여줍니다.'),
    object('maison', 'finale-rock.png', '풍경의 중심', '마지막 풍경을 받치는 바위 레이어. 앞뒤 요소의 깊이 차이로 장면을 안정적으로 마무리합니다.'),
  ],
};

export const previewHeights = { fabric: 4464, objects: 6831, scent: 6830, maison: 8637 };

export const historyChapters = [
  {
    id: 'fabric', title: 'FABRIC', theme: 'PATTERN / TEXTURE / ORIGIN',
    quote: 'It began with a pattern. Before scent, there was texture.',
    statement: '향 이전의 딥디크를, 직물의 결에서 시작하다.',
    description: '딥디크의 첫 번째 언어였던 패턴과 직물을 출발점으로 삼았습니다. 직물의 반복에서 창립자들의 시선으로 이어지는 흐름을 통해, 향을 만나기 전부터 존재했던 브랜드의 예술적 감각을 소개합니다.',
    design: '겹쳐진 천과 식물 드로잉, 종이의 질감을 함께 배치했습니다. 재료의 촉감과 패턴의 리듬을 먼저 느낀 뒤 이야기를 읽도록 시각적인 밀도와 여백의 균형을 잡았습니다.',
    background: '#c5b59a', hero: asset('fabric', 'story-decorative-collage-01'),
    details: ['story-founders-visual', 'story-pattern-layer-top', 'floating-fabric-collage-01', 'fabric-pick-up'].map(name => asset('fabric', name)),
  },
  {
    id: 'objects', title: 'OBJECTS', theme: 'COLLECTION / CURIOSITY / DISCOVERY',
    quote: 'The shop became a world. A collection became a language.',
    statement: '물건의 나열을 넘어, 취향을 발견하는 공간으로.',
    description: '직물에서 시작한 감각이 다양한 오브제를 만나는 부티크로 확장됩니다. 하나의 물건에 시선이 머물고, 주변의 또 다른 물건을 발견하는 흐름을 통해 딥디크만의 자유로운 수집과 호기심을 표현합니다.',
    design: '선반과 프레임, 인물과 수집품을 서로 다른 깊이에 놓았습니다. 콜라주의 겹침과 크기 차이를 활용해 공간을 탐색하는 느낌을 만들고, 작은 디테일이 다음 장면을 궁금하게 하도록 구성했습니다.',
    background: '#b2ac9b', hero: asset('objects', 'objects-background-main'), cover: true,
    details: ['objects-walking-figure', 'story-01-collected-object-01', 'story-01-collected-object-02', 'objects-outro-feature-collage'].map(name => asset('objects', name)),
  },
  {
    id: 'scent', title: 'SCENT', theme: 'LIGHT / ATMOSPHERE / MEMORY',
    quote: 'Then, scent changed everything. The invisible became a new material.',
    statement: '보이지 않는 향을, 공간의 분위기로 전하다.',
    description: '눈에 보이는 오브제에서 공간을 채우는 향으로 이야기를 전환합니다. 부티크의 풍경과 캔들, 사람의 기억을 연결해 향을 하나의 제품보다 장소와 순간을 떠올리게 하는 감각으로 소개합니다.',
    design: '어두운 공간 속 따뜻한 빛과 세밀한 드로잉의 대비를 중심에 두었습니다. 장면 사이의 시각적 연속성을 유지하면서 시선이 빛과 오브제로 모이도록 여백과 명암을 조절했습니다.',
    background: '#55584a', hero: asset('scent', 'background-hero-scene'), cover: true,
    details: ['story-01-candle-object-02', 'story-01-feature-collage', 'story-02-feature-visual', 'story-01-atmosphere-visual'].map(name => asset('scent', name)),
  },
  {
    id: 'maison', title: 'MAISON', theme: 'WORD / IMAGE / ONE WORLD',
    quote: 'One language, many forms. What began as a pattern became a language.',
    statement: '패턴과 사물, 향이 하나의 세계로 모이다.',
    description: '앞선 세 구간에서 발견한 감각을 오늘날 딥디크의 세계로 연결합니다. 글자와 일러스트, 자연과 여행의 이미지를 함께 보여주며 표현의 형태는 달라져도 브랜드의 창작 태도는 이어진다는 이야기를 담았습니다.',
    design: '타원형 라벨의 글자와 구름, 태양 같은 상징을 넓은 여백에 배치했습니다. 개별 요소가 하나의 분위기를 이루도록 구성하고, 마지막 장면에서 시야가 열리는 듯한 여운을 남기고자 했습니다.',
    background: '#b2c3c0', hero: asset('maison', 'story-03-feature-visual'),
    details: ['story-03-visual-01', 'floating-collage-image-05', 'floating-collage-image-06', 'story-02-visual-01'].map(name => asset('maison', name)),
  },
].map(chapter => ({ ...chapter, objects: chapterObjects[chapter.id], preview: `/media/diptyque-history/previews/${chapter.id}.html`, previewHeight: previewHeights[chapter.id] }));
