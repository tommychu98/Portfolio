import { useEffect, useRef } from 'react';
import { links } from '../../../data/projects';
import Link from '../../ui/Link';
import SectionLabel from '../../ui/SectionLabel';
import HorizontalControls from '../../ui/HorizontalControls';
import ProjectList from './ProjectList';
import WorkFolder from './WorkFolder';
import LaptopPreview from './LaptopPreview';
import { initZaraDetails } from './ZaraDetails.motion';
import './ZaraDetails.css';

const details = [
  { title: <>Crafting<br/><em>the brand</em><br/>experience.</>, paragraphs: ['자연·여행·예술에서 출발한 딥디크의 이야기를 펜 드로잉과 종이 콜라주로 풀어냈습니다. 제품을 나열하기보다 브랜드의 장면과 분위기를 먼저 경험하도록 구성했습니다.'] },
  { title: <>Exploring<br/><em>the scent.</em></>, paragraphs: ['향의 계열과 무드를 자연스럽게 탐색하고 원하는 제품까지 이어지도록 정보의 순서와 제품 선택 흐름을 정리했습니다. 감성적인 표현과 사용성을 함께 고려했습니다.'] },
  { title: <>Content<br/><em>that connects.</em></>, paragraphs: ['브랜드 스토리에서 향의 탐색, 제품 선택으로 이어지는 흐름을 설계했습니다. 각 장면의 이미지와 움직임이 끊기지 않도록 콘텐츠 사이의 연결을 세심하게 다듬었습니다.'] },
  { title: <>Better<br/><em>together.</em></>, paragraphs: ['4인 팀 프로젝트에서 HTML/CSS 마크업을 총괄하고 Git 관리를 맡아 팀원의 작업을 하나의 결과물로 연결했습니다.', '메인 영상 제작과 History of Diptyque 페이지 구현을 담당했으며, 피드백을 구체적인 수정으로 이어가며 완성도를 높였습니다.'] },
];

function DetailVisual({ index }) {
  if (index === 0) return <LaptopPreview/>;
  if (index === 1) return <div className="zara-details__products">
    <figure><div><img src="/media/images/diptyque/galerie-portrait.gif" alt="딥디크 Galerie 향 탐색 화면 애니메이션" loading="lazy"/></div><figcaption><small>SCENT · SCENE</small><h4>향을 만나는 장면</h4><p>브랜드 경험 →</p></figcaption></figure>
    <figure><div><img src="/media/images/diptyque/history-portrait.gif" alt="딥디크 History 브랜드 스토리 화면 애니메이션" loading="lazy"/></div><figcaption><small>HISTORY OF DIPTYQUE</small><h4>이야기로 향을 탐색하기</h4><p>스토리 탐색 →</p></figcaption></figure>
  </div>;
  if (index === 2) return <ProjectList/>;
  return <WorkFolder/>;
}

export default function ZaraDetails() {
  const ref = useRef(null);
  useEffect(() => initZaraDetails(ref.current), []);
  return <section id="zara-details" className="zara-details" ref={ref} aria-labelledby="zara-details-title"><div className="horizontal-viewport" data-viewport>
    <div className="horizontal-heading"><SectionLabel number="07">DIPTYQUE / DESIGN &amp; MY ROLE</SectionLabel><h2 id="zara-details-title">Behind the <em>screen.</em></h2></div>
    <div data-track>{details.map((detail, i) => <article className={`horizontal-panel zara-details__panel${i === 0 ? ' zara-details__panel--laptop' : ''}`} data-panel key={i}><div className="zara-details__copy"><span className="fine-print">DIPTYQUE — 0{i + 1} / 04</span><h3>{detail.title}</h3>{detail.paragraphs.map((paragraph, j) => <p key={j}>{paragraph}</p>)}{i === 3 && <Link href={links.diptyque}>VIEW WEBSITE</Link>}</div><DetailVisual index={i}/></article>)}</div>
    <HorizontalControls label="DIPTYQUE 상세"/>
  </div></section>;
}
