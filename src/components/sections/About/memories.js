// Focal points are normalized source coordinates (0–1).
// Dates remain blank until supplied. Descriptions only describe visible scenes.
const directory = '/media/images/about/memories';
export const memories = [
  {
    id: 'memory-01', category: 'Explore', title: 'Under the Open Sky', year: '',
    image: `${directory}/la3.jpg`, aspect: 1612 / 2311,
    frame: 'portrait-clean', focal: [0.51, 0.72], zoom: 1.18,
    alt: '넓은 하늘과 사막 풍경 앞에 서 있는 인물',
    description: '낯선 환경에서의 일은 쉽지 않았습니다. 하지만 새로운 환경에 빠르게 적응해 긍정적으로 생활해 나갔습니다.',
  },
  {
    id: 'memory-02', category: 'On Set', title: 'Behind the Monitor', year: '',
    image: `${directory}/fine_me2.jpg`, aspect: 4 / 3,
    frame: 'portrait-soft', focal: [0.73, 0.4], zoom: 1.45,
    alt: '촬영 현장에서 모니터를 바라보는 인물',
    description: '영화 촬영 중 여러 고비가 있었지만, 그 과정에서 문제를 해결하는 법 역시 배웠습니다.',
  },
  {
    id: 'memory-03', category: 'Together', title: 'The People on Set', year: '',
    image: `${directory}/fine3.jpg`, aspect: 3 / 4,
    frame: 'portrait-teal', focal: [0.49, 0.57], zoom: 1,
    alt: '카메라 장비 옆에서 포즈를 취하는 촬영 스태프들',
    description: '여러 국가의 다양한 사람들을 만나고 그들과 소통해왔습니다.',
  },
  {
    id: 'memory-04', category: 'Everyday', title: 'By the Ocean', year: '',
    image: `${directory}/fine_me4.jpg`, aspect: 4 / 3,
    frame: 'landscape-square', focal: [0.51, 0.64], zoom: 1.2,
    alt: '바다와 석양을 배경으로 남긴 셀프 사진',
    description: '새로운 환경에서도 긍정적으로 이겨내는 힘을 얻었습니다!',
  },
  {
    id: 'memory-05', category: 'Conference', title: 'Sarscollective Conference', year: '',
    image: `${directory}/starlights_2.jpg`, aspect: 16 / 9,
    frame: 'landscape-teal', focal: [0.47, 0.49], zoom: 1,
    alt: 'Sarscollective 아티스트 회의 현장',
    description: '전 직장 아티스트들의 회의를 주최하고, 원활한 소통을 위해 영어와 중국어 통역을 담당했습니다.',
  },
  {
    id: 'memory-06', category: 'Crew', title: 'All in One Frame', year: '',
    image: `${directory}/fine_crew1.jpg`, aspect: 16 / 9,
    frame: 'landscape-teal', focal: [0.5, 0.47], zoom: 1,
    alt: '촬영 장비와 함께 모여 찍은 단체 사진',
    description: '제가 가장 많이 배운 것 중 하나는 팀워크입니다. 그 어떤 것도 혼자서는 이룰 수 없다는 것을 깨달았고, 이는 웹 개발에서도 강점으로 발휘될 것이라 믿습니다.',
  },
  {
    id: 'memory-07', category: 'On Set', title: 'A Scene in Progress', year: '',
    image: `${directory}/fine2.jpg`, aspect: 4 / 3,
    frame: 'landscape-clean', focal: [0.61, 0.5], zoom: 1.08,
    alt: '촬영 중인 장면이 보이는 현장 모니터',
    description: '단편 영화 FINE을 디렉팅하던 중 촬영한 배우의 스틸 컷.',
  },
  {
    id: 'memory-08', category: 'Stage', title: 'Stage Directing', year: '',
    image: `${directory}/stage_2.jpg`, aspect: 4 / 3,
    frame: 'landscape-clean', focal: [0.51, 0.51], zoom: 1.45,
    alt: '조명 아래 테이블 세트에서 마주 앉은 두 사람',
    description: '영화뿐만 아니라 무대 연출로도 일해봤습니다.',
  },
  {
    id: 'memory-09', category: 'On Set', title: 'Working as Gaffer', year: '',
    image: `${directory}/shooting_me.jpg`, aspect: 16 / 9,
    frame: 'portrait-clean', focal: [0.36, 0.5], zoom: 1.12,
    alt: '따뜻한 조명이 비치는 촬영 현장에 서 있는 인물',
    description: '다른 영화 촬영 현장에서 조명 업무를 자주 맡았습니다.',
  },
  {
    id: 'memory-10', category: 'Night Shoot', title: 'Overnight Shooting', year: '',
    image: `${directory}/shooting_7.jpg`, aspect: 1599 / 758,
    frame: 'landscape-teal', focal: [0.43, 0.65], zoom: 1.17,
    alt: '도심 야경을 배경으로 조명과 카메라를 설치한 옥상 촬영 현장',
    description: '밤을 새워 일하더라도 끝까지 완성도 있는 작품을 만들기 위해 노력해왔습니다.',
  },
];
