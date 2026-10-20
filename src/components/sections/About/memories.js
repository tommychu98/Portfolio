// Focal points are normalized source coordinates (0–1).
// Dates remain blank until supplied. Descriptions only describe visible scenes.
const directory = '/media/images/about/memories';
export const memories = [
  {
    id: 'memory-01', category: 'Explore', title: 'Under the Open Sky', year: '',
    image: `${directory}/la3.jpg`, aspect: 1612 / 2311,
    frame: 'portrait-clean', focal: [0.51, 0.72], zoom: 1.18,
    alt: '넓은 하늘과 사막 풍경 앞에 서 있는 인물',
    description: '넓은 하늘과 사막 풍경 앞에서 남긴 한 장면.',
  },
  {
    id: 'memory-02', category: 'On Set', title: 'Behind the Monitor', year: '',
    image: `${directory}/fine_me2.jpg`, aspect: 4 / 3,
    frame: 'portrait-soft', focal: [0.73, 0.4], zoom: 1.45,
    alt: '촬영 현장에서 모니터를 바라보는 인물',
    description: '촬영 현장, 모니터 앞에서 장면을 살펴보는 순간.',
  },
  {
    id: 'memory-03', category: 'Together', title: 'The People on Set', year: '',
    image: `${directory}/fine3.jpg`, aspect: 3 / 4,
    frame: 'portrait-teal', focal: [0.49, 0.57], zoom: 1,
    alt: '카메라 장비 옆에서 포즈를 취하는 촬영 스태프들',
    description: '카메라 옆에서 함께 포즈를 남긴 촬영 스태프들.',
  },
  {
    id: 'memory-04', category: 'Everyday', title: 'By the Ocean', year: '',
    image: `${directory}/fine_me4.jpg`, aspect: 4 / 3,
    frame: 'landscape-square', focal: [0.51, 0.64], zoom: 1.2,
    alt: '바다와 석양을 배경으로 남긴 셀프 사진',
    description: '바다와 석양을 배경으로 남긴 한 장의 사진.',
  },
  {
    id: 'memory-05', category: 'Together', title: 'Golden Hour Company', year: '',
    image: `${directory}/starlights_2.jpg`, aspect: 16 / 9,
    frame: 'landscape-teal', focal: [0.47, 0.49], zoom: 1,
    alt: '석양이 비치는 야외 테이블에 둘러앉아 이야기하는 사람들',
    description: '석양이 비치는 테이블에 둘러앉아 이야기를 나누는 시간.',
  },
  {
    id: 'memory-06', category: 'Crew', title: 'All in One Frame', year: '',
    image: `${directory}/fine_crew1.jpg`, aspect: 16 / 9,
    frame: 'landscape-teal', focal: [0.5, 0.47], zoom: 1,
    alt: '촬영 장비와 함께 모여 찍은 단체 사진',
    description: '촬영 장비 앞에 모두 모여 남긴 단체 사진.',
  },
  {
    id: 'memory-07', category: 'On Set', title: 'A Scene in Progress', year: '',
    image: `${directory}/fine2.jpg`, aspect: 4 / 3,
    frame: 'landscape-clean', focal: [0.61, 0.5], zoom: 1.08,
    alt: '촬영 중인 장면이 보이는 현장 모니터',
    description: '현장 모니터에 담긴 촬영 중인 장면.',
  },
  {
    id: 'memory-08', category: 'Stage', title: 'Before the Scene', year: '',
    image: `${directory}/stage_2.jpg`, aspect: 4 / 3,
    frame: 'landscape-clean', focal: [0.51, 0.51], zoom: 1.45,
    alt: '조명 아래 테이블 세트에서 마주 앉은 두 사람',
    description: '조명과 소품이 놓인 무대, 테이블 앞의 두 사람.',
  },
  {
    id: 'memory-09', category: 'On Set', title: 'Between Takes', year: '',
    image: `${directory}/shooting_me.jpg`, aspect: 16 / 9,
    frame: 'portrait-clean', focal: [0.36, 0.5], zoom: 1.12,
    alt: '따뜻한 조명이 비치는 촬영 현장에 서 있는 인물',
    description: '따뜻한 조명이 비치는 촬영 현장의 한 장면.',
  },
  {
    id: 'memory-10', category: 'Night Shoot', title: 'Above the City', year: '',
    image: `${directory}/shooting_7.jpg`, aspect: 1599 / 758,
    frame: 'landscape-teal', focal: [0.43, 0.65], zoom: 1.17,
    alt: '도심 야경을 배경으로 조명과 카메라를 설치한 옥상 촬영 현장',
    description: '도시의 불빛 위로 펼쳐진 옥상 촬영 현장.',
  },
];
