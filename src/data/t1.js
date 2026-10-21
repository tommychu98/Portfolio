export const t1Detail = {
  background: '#0b0b0d', accent: '#ff5364', foreground: '#f5f5f7',
  subtitle: 'Esports Brand Experience Website',
  type: 'Personal Project · 기획 / UI 디자인 / 프론트엔드 구현',
  playback: 'visible',
  description: 'T1이 쌓아 온 역사와 팬덤의 열정을 첫 화면부터 느낄 수 있도록 리뉴얼한 e스포츠 브랜드 웹사이트입니다. 구단 소개와 상품, 파트너십이 분리되어 보이는 기존 구조를 하나의 브랜드 경험으로 연결하고자 T1을 선택했습니다. 블랙과 화이트의 강한 대비에 시그니처 레드를 더하고, 대형 영문 타이포그래피와 선수·팬들의 사진을 중심으로 화면을 구성했습니다. 역사에서 팬 문화, 글로벌 파트너, 어패럴로 이어지는 스크롤 흐름을 통해 T1의 정체성이 경기장 밖의 라이프스타일까지 확장되는 모습을 표현했습니다.',
  roles: [
    '공식 사이트의 브랜드 표현과 콘텐츠 동선을 분석하고, 역사·팬덤·파트너십·어패럴을 연결하는 정보 구조 기획',
    'Figma에서 와이어프레임과 화면 디자인, 레드·블랙·화이트 팔레트 및 타이포그래피 위계 설계',
    'HTML·CSS·JavaScript로 오프닝 전환, History 카드, 브랜드 이미지 등장과 파트너 로고 탐색 구현',
    'Apparel의 고정 화면과 가로 이동을 세로 스크롤에 연결하고, 섹션 전환과 내부 탐색 입력 조정',
    '모바일용 카드 탐색과 이미지 배치, 메뉴 및 키보드 조작을 구성하고 GitHub Pages로 배포',
  ],
  technologies: [
    { name: 'HTML5', color: '#e34f26' }, { name: 'CSS3', color: '#1572b6' },
    { name: 'JavaScript', color: '#f7df1e', ink: '#111' },
    { name: 'Web Animations API', color: '#33333b' },
    { name: 'Intersection Observer', color: '#33333b' },
    { name: 'GitHub Pages', color: '#24292f' },
  ],
  creativeTools: ['Figma'],
  features: [
    {
      id: 't1-history', src: '/videos/t1-history.mp4', poster: '/videos/t1-history-poster.jpg', width: 1920, height: 1080,
      title: 'History — A Legacy in Motion',
      description: '구단의 시작과 상징적인 선수, 팬덤을 네 장의 세로 사진 카드로 구성했습니다. 섹션에 진입하면 제목과 카드가 순차적으로 펼쳐지고, 카드에 마우스를 올리면 사진 위에 제목과 설명이 나타나 T1의 서사를 읽을 수 있습니다.',
    },
    {
      id: 't1-beyond', src: '/videos/t1-beyond.mp4', poster: '/videos/t1-beyond-poster.jpg', width: 1920, height: 1080,
      title: 'Beyond Eras. Beyond Esports.',
      description: '팬들과의 만남, 브랜드 협업, 경기장 풍경을 높이가 다른 이미지 그리드로 엮어 T1의 활동을 보여줍니다. 스크롤에 맞춰 사진과 소개 문구가 차례로 드러나며, 구단의 정체성이 e스포츠를 넘어 문화와 라이프스타일로 이어지는 흐름을 만듭니다.',
    },
    {
      id: 't1-alliance', src: '/videos/t1-alliance.mp4', poster: '/videos/t1-alliance-poster.jpg', width: 1920, height: 1080,
      title: 'Global Alliance — Partner Spotlight',
      description: '파트너 로고를 페이지 하단의 작은 목록 대신 독립된 전체 화면 콘텐츠로 구성했습니다. 가로 휠이나 방향키로 로고를 탐색하면 세로 트랙이 이동하고 중앙 로고가 강조되며, 좌우의 대형 타이포그래피가 T1과 파트너의 관계를 하나의 장면으로 묶어 줍니다.',
    },
    {
      id: 't1-apparel', src: '/videos/t1-apparel.mp4', poster: '/videos/t1-apparel-poster.jpg', width: 1920, height: 1080,
      title: 'Apparel — A Horizontal Lookbook',
      description: '밝은 배경 위에 크기와 높이가 다른 착장 이미지를 배치해, 어두운 브랜드 섹션에서 패션 룩북으로 분위기를 전환했습니다. 데스크톱에서는 화면이 고정된 상태로 세로 스크롤이 갤러리의 가로 이동으로 이어지고, 모바일에서는 화면 폭에 맞춘 이미지 목록으로 탐색할 수 있습니다.',
    },
  ],
  challenges: [
    {
      title: 'Page Scroll & Local Navigation',
      problem: '섹션 단위 화면 전환과 파트너 로고 탐색을 함께 제공하면서, 한 번의 입력이 두 동작을 동시에 실행하지 않도록 구분해야 했습니다.',
      solution: '세로 휠은 페이지 이동에, 가로 휠은 파트너 트랙 탐색에 사용하도록 입력 축을 분리했습니다. 전환 중에는 중복 입력을 제한하고, History 진입 모션이 끝나면 잠금을 해제해 다음 섹션으로 이어지도록 구성했습니다.',
    },
    {
      title: 'Responsive Horizontal Storytelling',
      problem: 'Apparel의 넓은 이미지 캔버스를 서로 다른 화면 폭에서도 끝까지 보여주고, 가로 연출이 작은 화면의 탐색을 방해하지 않도록 해야 했습니다.',
      solution: '캔버스와 뷰포트의 너비 차이로 이동 거리를 계산하고, 스크롤 진행률을 0부터 1 사이로 제한해 가로 위치에 반영했습니다. 크기 변경 시 다시 측정하고, 모바일에서는 고정·가로 이동을 해제해 이미지 그리드로 전환했습니다.',
    },
    {
      title: 'Sequencing Images & Brand Narrative',
      problem: '사진과 문구가 많은 화면에서 모든 요소가 동시에 움직이면 시선이 분산되고, 화면 밖의 콘텐츠까지 불필요하게 애니메이션될 수 있습니다.',
      solution: 'Intersection Observer와 섹션 진입 상태를 이용해 제목·사진·본문의 등장 순서를 나눴습니다. 한 번 나타난 요소는 관찰을 종료하고, 카드 진입 모션과 호버 연출의 상태를 구분해 내용을 읽는 흐름을 유지했습니다.',
    },
  ],
  links: [
    { label: 'Launch Project', href: 'https://tommychu98.github.io/Project_T1/' },
    { label: 'View Code', href: 'https://github.com/tommychu98/Project_T1' },
  ],
};

export const t1Project = {
  id: 't1', name: 'T1', titleLines: ['T1', 'Renewal'], category: 'WEBSITE RENEWAL',
  introduction: '팬덤의 열정을 하나의 브랜드 경험으로.',
  tools: 'Figma · HTML · CSS · JavaScript',
  background: '#3b1118', accent: '#f1d6d8', foreground: '#fffaf1',
  cards: [
    { src: '/media/images/t1/apparel.jpg', alt: 'T1 어패럴 룩북 화면', position: 'center' },
    { src: '/media/images/t1/hero.jpg', alt: 'T1 로고와 선수 사진을 배치한 메인 화면', position: 'center' },
  ],
  paragraphs: [[{ text: t1Detail.description }]], images: [],
  detail: t1Detail, links: t1Detail.links,
};
