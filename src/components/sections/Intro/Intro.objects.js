const images = import.meta.glob('./assets/icons/*.png', { eager: true, query: '?url', import: 'default' });
const selection = [
  ['studio-01','브라우저 창'], ['ui-12','펜촉'], ['studio-03','커서'],
  ['ui-10','레이어'], ['studio-07','키보드'], ['ui-13','타이포그래피'],
  ['studio-06','컬러칩'], ['ui-25','곡선'], ['studio-08','스케치북'],
  ['ui-04','반응형 화면'], ['studio-02','모바일 화면'], ['studio-04','코드'],
  ['ui-18','색상 대비'], ['studio-05','와이어프레임'], ['ui-20','퍼즐'],
  ['studio-09','시안'], ['ui-28','영상'], ['ui-34','대화'],
];
export const introObjects = selection.map(([id,label],index) => ({
  id, label, src: images[`./assets/icons/${id}.png`], size: 76 + (index * 17 % 49),
}));
