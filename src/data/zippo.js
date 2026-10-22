export const zippoDetail = {
  background: '#fff4d7', accent: '#a33428', foreground: '#33271f', challengeAccent: '#a33428',
  subtitle: 'Colorful Lifestyle & Custom Culture Website',
  type: 'Personal Project · 기획 / UI 디자인 / 프론트엔드 구현',
  playback: 'visible',
  description: '자신만의 취향과 이야기를 담는 제품으로서 Zippo의 매력을 표현한 브랜드 리뉴얼 웹사이트입니다. 기존 웹사이트에서 느꼈던 무겁고 남성 고객 중심의 분위기를 새롭게 풀어, 젊은 세대의 커스텀 문화와 컬러풀한 감각을 담고자 했습니다. 밝은 컬러와 자유로운 타이포그래피, 일상의 순간을 담은 사진을 조합해 오래 사용하는 물건에도 나만의 개성이 쌓인다는 메시지를 전합니다. 브랜드를 만나는 첫 화면부터 컬렉션 탐색과 장바구니까지, 자신만의 특색을 지닌 제품을 발견하는 하나의 흐름으로 구성했습니다.',
  roles: [
    '젊은 세대의 취향과 커스텀 문화를 중심으로 브랜드 방향을 정하고, 홈·Shop·제품 상세·Cart로 이어지는 정보 구조 기획',
    '옐로·레드·크림 컬러와 대형 타이포그래피, 라이프스타일 사진을 연결하는 화면 디자인',
    'React 기반으로 컬렉션 탭, 카테고리 탐색, 가격 정렬과 제품 이미지 전환 구현',
    '장바구니 담기·수량 변경·추천 제품 추가 기능을 연결하고 브라우저 저장으로 선택 상태 유지',
    'GSAP 스크롤 모션과 페이지 전환을 구성하고, 반응형 화면 및 키보드 탐색을 조정해 Vercel로 배포',
  ],
  technologies: [
    { name: 'React', color: '#61dafb', ink: '#16252a' },
    { name: 'JavaScript', color: '#f7df1e', ink: '#111' },
    { name: 'CSS3', color: '#1572b6' },
    { name: 'GSAP', color: '#88ce02', ink: '#182000' },
    { name: 'Vite', color: '#646cff' },
    { name: 'Vercel', color: '#242424' },
  ],
  creativeTools: ['Figma'],
  features: [
    {
      id: 'zippo-main', src: '/videos/zippo-main.webm', poster: '/videos/zippo-main-poster.jpg', width: 1920, height: 1080,
      title: 'Main — A Colorful First Spark',
      description: '친구들과 함께하는 밝은 사진 위에 옐로 컬러의 대형 로고를 배치해 자유롭고 경쾌한 첫인상을 만들었습니다. 스크롤을 따라 컬렉션으로 이동하고 CLASSIC·EMBLEM·LIMITED 탭을 바꾸며, 서로 다른 취향의 제품을 자연스럽게 발견할 수 있습니다.',
    },
    {
      id: 'zippo-shop', src: '/videos/zippo-shop.webm', poster: '/videos/zippo-shop-poster.jpg', width: 1920, height: 1080,
      title: 'Shop — Find Your Own Flame',
      description: '제품 사진과 컬러 배경, 스티커처럼 배치한 가격을 조합해 Shop을 하나의 에디토리얼처럼 구성했습니다. 카테고리와 가격 정렬로 취향에 맞는 제품을 좁혀 가고, 카드에 마우스를 올리면 다른 이미지로 전환되어 제품의 또 다른 모습을 볼 수 있습니다.',
    },
    {
      id: 'zippo-cart', src: '/videos/zippo-cart.webm', poster: '/videos/zippo-cart-poster.jpg', width: 1920, height: 1080,
      title: 'Cart — Keep Your Favorites Close',
      description: '제품을 담으면 현재 화면 위로 장바구니 패널이 열려 탐색의 맥락을 이어 줍니다. 수량에 따라 합계가 바로 바뀌고 추천 제품을 추가하거나 선택한 제품을 삭제할 수 있습니다. 담은 목록은 브라우저에 저장되어 다시 방문해도 이어서 살펴볼 수 있습니다.',
    },
    {
      id: 'zippo-design', src: '/videos/zippo-design.webm', poster: '/videos/zippo-design-poster.jpg', width: 1920, height: 1080,
      title: 'Brand Story — An Object With Character',
      description: '서로 교차하는 타이포그래피 띠와 인물 사진, 강한 컬러 면을 겹쳐 Zippo의 역사를 생동감 있게 풀었습니다. 스크롤에 반응하는 이미지와 문장의 등장으로 시선을 이끌며, 손에 남은 흔적과 함께한 시간이 하나의 제품을 나만의 이야기로 만든다는 메시지를 전합니다.',
    },
  ],
  challenges: [
    {
      title: 'Brand Expression & Product Discovery',
      problem: '강한 컬러와 자유로운 이미지 구성을 유지하면서도, 제품을 비교하고 원하는 컬렉션을 찾는 과정은 명확해야 했습니다.',
      solution: '카테고리 탐색과 정렬을 제품 영역에서 구분하고, 제품명·가격·담기 버튼은 공통 카드 구조로 통일했습니다. 사진과 배경에는 변화를 주면서 구매에 필요한 정보는 같은 위계로 읽히도록 구성했습니다.',
    },
    {
      title: 'A Cart That Remembers',
      problem: '목록과 상세 화면 어디에서 제품을 담아도 수량과 합계가 일치하고, 다시 방문했을 때 이전 선택이 이어져야 했습니다.',
      solution: 'React Context에서 장바구니 상태를 함께 관리하고 localStorage에 저장했습니다. 저장된 제품 ID와 수량을 검증하고 중복 제품을 합쳐, 수량 변경과 삭제가 목록·합계·헤더의 개수에 함께 반영되도록 했습니다.',
    },
    {
      title: 'Page Transitions & Scroll Timing',
      problem: '스크롤로 콘텐츠가 나타나는 홈과 Shop을 전환할 때, 이전 스크롤 위치나 열린 장바구니가 새 화면의 등장 연출을 방해할 수 있었습니다.',
      solution: '페이지 전환 시 열린 대화상자를 닫고 스크롤 위치를 초기화한 뒤 새 화면을 구성했습니다. GSAP 커튼 전환 안에서 화면을 교체하고, 모션 감소 설정에서는 즉시 이동하도록 분기해 탐색 흐름을 유지했습니다.',
    },
  ],
  links: [{ label: 'Launch Project', href: 'https://project-zippo-wine.vercel.app/' }],
};

export const zippoProject = {
  id: 'zippo', name: 'ZIPPO', titleLines: ['ZIPPO', 'Renewal'], category: 'WEBSITE RENEWAL',
  introduction: '나만의 컬러, 나만의 이야기를 지닌 하나의 Zippo.',
  tools: 'Figma · React · CSS · JavaScript · GSAP',
  background: '#a33226', accent: '#ffdc78', foreground: '#fff6db',
  cards: [
    { src: '/media/images/zippo/shop-first.jpg', alt: 'Zippo Shop 첫 화면의 타이포그래피와 컬러풀한 제품 목록', position: 'top' },
    { src: '/media/images/zippo/main-first.jpg', alt: '밝은 라이프스타일 사진과 옐로 로고로 구성한 Zippo 메인 첫 화면', position: 'top' },
  ],
  paragraphs: [[{ text: zippoDetail.description }]], images: [],
  detail: zippoDetail, links: zippoDetail.links,
};
