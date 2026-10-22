import Link from '../../ui/Link';
import SectionLabel from '../../ui/SectionLabel';
import useReveal from '../../../motion/useReveal';
import './PortfolioOverview.css';
const presentationUrl = 'https://www.figma.com/proto/CkalEh8YyM5C94tEJrbXyt/%EB%94%A5%EB%94%94%ED%81%AC%EC%9E%A5%ED%91%9C?node-id=1-37&viewport=514%2C353%2C0.13&t=TyArleuobLq7eVqf-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1';

export default function PortfolioOverview() {
  const ref = useReveal();
  return <section id="zara" ref={ref} className="zara-overview" aria-labelledby="zara-title">
    <div className="zara-overview__panel paper-grain">
      <SectionLabel sectionId="zara">TEAM PROJECT / WEBSITE RENEWAL</SectionLabel>
      <div className="zara-overview__heading" data-reveal><h2 id="zara-title">DIPTYQUE</h2><span>SCENT · SCENE · STORY</span></div>
      <div className="zara-overview__layout">
        <figure className="zara-overview__visual" data-reveal>
          <div className="zara-overview__browser paper-grain">
            <div className="zara-overview__browser-bar" aria-hidden="true"><i/><i/><i/><span/></div>
            <div className="zara-overview__image"><img className="zara-overview__main-capture" src="/media/images/diptyque/story-figma.png" alt="딥디크 매장과 THE STORY of Diptyque 문구가 담긴 메인 화면 디자인" loading="lazy" width="1920" height="1080"/></div>
          </div>
          <figcaption>DIPTYQUE / WEBSITE RENEWAL</figcaption>
        </figure>
        <div className="zara-overview__copy" data-reveal>
          <span className="fine-print">01 / FEATURED PROJECT</span>
          <h3 className="korean-display">제품을 찾는 곳에서,<br/>딥디크를 경험하는<br/>온라인 공간으로.</h3>
          <p>자연·여행·예술에서 시작된 딥디크의 이야기를 향의 탐색과 제품 선택으로 연결한 웹사이트 리뉴얼 프로젝트입니다. 펜 드로잉과 종이 콜라주, 장면 중심의 콘텐츠로 브랜드의 분위기를 표현했습니다.</p>
          <dl>
            <div className="project-meta"><dt>TYPE</dt><dd>4인 팀 프로젝트 / 웹사이트 리뉴얼</dd></div>
            <div className="project-meta"><dt>FOCUS</dt><dd>브랜드 스토리텔링 · 향 탐색 · 제품 선택의 흐름</dd></div>
            <div className="project-meta"><dt>MY ROLE</dt><dd>HTML/CSS 마크업 총괄 · Git 관리 · 영상 제작 · History of Diptyque 페이지 제작</dd></div>
          </dl>
          <div className="link-row">
            <Link href="https://mbc-teamproject-alpha.vercel.app/">WEBSITE</Link>
            <Link href={presentationUrl} target="_blank" rel="noopener noreferrer">장표 보기</Link>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
