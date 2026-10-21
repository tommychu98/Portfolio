export const medipeel = {
  label: 'WEBSITE RENEWAL',
  title: 'MEDIPEEL',
  introduction: '자연의 부드러움, 과학의 정교함을 담다.',
  tools: 'Figma · React · Vite · CSS · AI 이미지·영상 제작',
  paragraphs: [
    [
      { text: '메디필의 기능성과 전문성을 더 매력적인 시각 언어로 표현하고 싶어 리뉴얼 브랜드로 선택했습니다. ' },
      { text: '상품과 프로모션 중심의 화면에서 충분히 드러나지 않았던 더마 브랜드의 가치를, 자연과 과학이 어우러지는 경험으로 재해석했습니다.', emphasis: true },
    ],
    [
      { text: '넓은 여백과 섬세한 세리프 타이포그래피로 고급스러운 인상을 만들고, 식물과 피부, 화장품의 질감을 담은 이미지로 온기를 더했습니다. ' },
      { text: '제품별 컬러와 비대칭 레이아웃으로 시선에 변화를 주고, 핵심 기술과 피부 고민별 케어를 구분해 정보의 흐름을 정리했습니다.' },
    ],
    [
      { text: '가장 고민한 부분은 풍부한 시각 효과와 편안한 탐색의 균형이었습니다.', emphasis: true },
      { text: ' 데스크톱에서는 스크롤에 따라 이미지가 펼쳐지도록 구현하고, 모바일에서는 탭과 스와이프로 전환해 작은 화면에 맞췄습니다. 손과 잎의 레이어를 분리한 미세한 움직임까지 조정하며, 브랜드의 분위기가 콘텐츠를 읽는 흐름 속에 자연스럽게 이어지도록 했습니다.' },
    ],
  ],
  images: [
    { kind: 'planning', src: '/media/images/medipeel/planning.png', alt: '메디필 브랜드 분석과 정보 구조를 정리한 Figma 기획 보드', caption: '브랜드 분석에서 시작한 정보 구조와 화면 설계', width: 1315, height: 1600 },
    { kind: 'implementation', src: '/media/images/medipeel/main.jpg', alt: '메디필 구현 사이트의 메인 비주얼과 제품 소개 화면', caption: '화면 크기에 맞춰 달라지는 레이아웃과 인터랙션' },
  ],
};

export const medipeelDetail = {
  background: '#2a6d82', accent: '#f9c846', foreground: '#f2f7f5',
  subtitle: 'Derma Cosmetics Website',
  type: 'Personal Project · 기획 / 디자인 / 프론트엔드 구현',
  description: '메디필의 더마 전문성을 자연의 감각과 연결해 재해석한 웹사이트 리뉴얼 프로젝트입니다. 브랜드가 가진 기술력과 고급스러움을 전달하기 위해 넓은 여백과 섬세한 타이포그래피에 식물과 화장품의 질감을 더했습니다. AI 영상과 스크롤 인터랙션으로 브랜드의 분위기를 표현하고, 피부 고민별 케어와 핵심 기술을 중심으로 정보를 구성해 감각적인 비주얼과 직관적인 탐색이 어우러지도록 설계했습니다.',
  roles: [
    '브랜드와 기존 사이트 분석을 바탕으로 피부 고민별 케어와 핵심 기술 중심의 콘텐츠 구조 설계',
    'Figma를 활용한 UI 디자인 및 데스크톱·모바일 반응형 레이아웃 구성',
    '제품과 자연의 질감을 표현하는 AI 이미지·영상 제작 및 히어로 영상 편집',
    'React 기반 섹션별 컴포넌트 구성과 제품 슬라이더, 스크롤 전환, 식물 모션 구현',
    '모바일 터치 조작, 키보드 탐색, 모션 감소 설정을 고려한 사용성 개선',
  ],
  technologies: [
    { name: 'Figma', color: '#a259ff' }, { name: 'React', color: '#61dafb', ink: '#111' },
    { name: 'Vite', color: '#646cff' }, { name: 'JavaScript', color: '#f7df1e', ink: '#111' },
    { name: 'CSS', color: '#1572b6' }, { name: 'Git', color: '#f05032' },
    { name: 'GitHub', color: '#181717' }, { name: 'Vercel', color: '#000' },
  ],
  creativeTools: ['AI 이미지·영상 생성', 'FFmpeg'],
  features: [
    {
      id: 'medipeel-hero', src: '/videos/medipeel-hero.mp4', poster: '/videos/medipeel-hero-poster.jpg', width: 1920, height: 1080,
      title: '제품의 질감을 담은 히어로 영상',
      description: '제품과 자연 소재를 조합한 AI 영상으로 더마 브랜드의 고급스러운 분위기를 표현했습니다. 중앙의 대형 타이포그래피는 유지하고 배경 장면이 전환되도록 구성해, 첫 화면에서 브랜드 메시지와 제품을 함께 전달합니다.',
    },
    {
      id: 'medipeel-products', src: '/videos/medipeel-products.mp4', poster: '/videos/medipeel-products-poster.jpg', width: 1920, height: 1080,
      title: '이미지와 정보가 함께 전환되는 제품 슬라이더',
      description: '제품별 컬러와 질감이 돋보이는 이미지에 간결한 설명을 연결했습니다. 슬라이드 전환 시 제품명·설명·이미지를 함께 변경하고, 진행 표시와 탐색 버튼으로 다양한 신제품을 살펴볼 수 있도록 구현했습니다.',
    },
    {
      id: 'medipeel-reviews', src: '/videos/medipeel-reviews.mp4', poster: '/videos/medipeel-reviews-poster.jpg', width: 1920, height: 1080,
      title: '사용 후기와 제품을 연결한 리뷰 슬라이더',
      description: '피부 변화 이미지와 후기 옆에 해당 제품의 제형을 보여주는 대형 비주얼을 배치했습니다. 리뷰와 제품 이미지가 함께 전환되도록 구성해 사용 경험과 제품의 특징을 연결하고, 정보와 시각적 매력을 균형 있게 전달합니다.',
    },
    {
      id: 'medipeel-nature', src: '/videos/medipeel-nature.mp4', poster: '/videos/medipeel-nature-poster.jpg', width: 1920, height: 1080,
      title: '자연의 장면이 펼쳐지는 스크롤 연출',
      description: '검은 배경 속 좁은 이미지가 스크롤에 따라 화면 전체로 확장되고, 브랜드 메시지가 순차적으로 나타납니다. 이끼와 바위의 생생한 질감을 점차 드러내며 자연에서 영감을 받은 브랜드의 방향성을 몰입감 있게 표현했습니다.',
    },
  ],
  challenges: [
    {
      title: '시각적 몰입과 정보 전달의 균형',
      problem: '자연의 감성적인 이미지와 더마 제품의 전문성을 하나의 화면에서 조화롭게 표현하는 것이 과제였습니다. 영상과 모션이 강해질수록 제품 정보에 대한 집중이 흐려질 수 있었습니다.',
      solution: '브랜드 분위기를 전달하는 영역과 제품·기술을 설명하는 영역의 역할을 구분했습니다. 넓은 여백과 타이포그래피로 정보의 우선순위를 만들고, 식물의 움직임은 작은 범위로 조정해 콘텐츠와 자연스럽게 어우러지도록 했습니다.',
    },
    {
      title: '화면 크기에 맞춘 스크롤 인터랙션',
      problem: '데스크톱의 화면 고정과 이미지 전환을 모바일에 그대로 적용하면 콘텐츠를 읽거나 다음 영역으로 이동하는 데 불편함이 생길 수 있었습니다.',
      solution: '데스크톱에서는 스크롤 진행에 맞춰 케어 이미지가 펼쳐지도록 구현하고, 모바일에서는 탭과 스와이프로 탐색하도록 전환했습니다. 화면 높이가 부족한 환경에서는 고정을 해제해 콘텐츠가 자연스럽게 이어지도록 했습니다.',
    },
    {
      title: '끊김 없이 이어지는 히어로 영상',
      problem: '두 영상을 11초 안에 자연스럽게 연결하면서 반복 재생의 마지막과 처음이 튀지 않도록 만드는 데 어려움이 있었습니다.',
      solution: '컷의 연결과 움직임을 조정하고 시작·종료 프레임을 일치시켜 반복 경계의 차이를 줄였습니다. 브라우저 호환성을 고려한 영상 형식으로 변환하고, 화면 밖에서는 재생을 멈추도록 구현했습니다.',
    },
  ],
  links: [
    { label: 'Launch Project', href: 'https://medipeel.vercel.app/' },
    { label: 'View Code', href: 'https://github.com/tommychu98/Project_medipeel' },
  ],
};
