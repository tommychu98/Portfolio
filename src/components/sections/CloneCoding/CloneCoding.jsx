import HighlightTitle, { TitleHighlight } from '../../ui/HighlightTitle';
import content from '../../../data/projects';
import Photo from '../../ui/Photo';
import Link from '../../ui/Link';
import SectionLabel from '../../ui/SectionLabel';
import useReveal from '../../../motion/useReveal';
import './CloneCoding.css';

export default function CloneCoding() {
  const ref = useReveal();
  return (
    <section id="clone" className="clone-coding section-space" ref={ref} aria-labelledby="clone-title">
      <SectionLabel sectionId="clone">CLONE CODING / LEARNING STUDIES</SectionLabel>
      <div className="section-heading">
        <HighlightTitle id="clone-title" data-reveal><em>Learning by</em><br/><TitleHighlight>building.</TitleHighlight></HighlightTitle>
        <p data-reveal>레이아웃과 타이포그래피, 화면 동작을 구현하며 기본기를 익힙니다. 각 작업은 메인 페이지 범위로 소개합니다.</p>
      </div>
      <div className="clone-coding__grid">
        {content.clones.map(clone => (
          <article key={clone.name} data-reveal>
            <a href={clone.href} target="_blank" rel="noopener noreferrer" className="clone-coding__visual" aria-label={`${clone.title} 학습 데모 새 창`}>
              {clone.thumbnail
                ? <img className="photo" src={clone.thumbnail} alt="LIVE EVIL 메인 프로모션 — 세럼 제품을 들고 있는 모델" loading="lazy" width="1200" height="613"/>
                : <Photo kind={clone.image} alt={`${clone.name} ${clone.title} 학습 데모 비주얼`}/>}
              <span>{clone.name}<em>{clone.tagline || (clone.name === 'FORM' ? 'Ideas into possibilities.' : 'A new perspective.')}</em></span>
              <b aria-hidden="true">↗</b>
            </a>
            <span className="clone-coding__category">{clone.category}</span>
            <h3>{clone.title}</h3>
            <p>{clone.body}</p>
            <Link href={clone.href}>VIEW DEMO</Link>
          </article>
        ))}
      </div>
      <p className="clone-coding__note">메인 페이지 범위의 클론 코딩 학습 작업입니다. VIEW DEMO에서 각 구현 결과를 확인할 수 있습니다.</p>
    </section>
  );
}
