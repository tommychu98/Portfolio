import { useEffect, useRef } from 'react';
import content, { links } from '../../../data/projects';
import Photo from '../../ui/Photo';
import Link from '../../ui/Link';
import SectionLabel from '../../ui/SectionLabel';
import HorizontalControls from '../../ui/HorizontalControls';
import { initZaraDetails } from './ZaraDetails.motion';
import './ZaraDetails.css';
const titles=[<>Crafting<br/><em>the brand</em><br/>experience.</>,<>Product<br/><em>information.</em></>,<>Content<br/><em>that connects.</em></>,<>Better<br/><em>together.</em></>];
function DetailVisual({index}){
  if(index===0)return <div className="zara-details__photo"><Photo kind="fashion" alt="브랜드 표현을 위한 린넨 컬렉션 콘셉트 이미지"/></div>;
  if(index===1)return <div className="zara-details__products">{['린넨 블레이저','유연한 실루엣'].map((name,i)=><figure key={name}><div><Photo kind="fashion" alt={`${name} 상품 카드 구성 예시`}/></div><figcaption><small>{i?'THE EVERYDAY EDIT':'NEW / LINEN COLLECTION'}</small><h4>{name}</h4><p>{i?'컬렉션 탐색 →':'크림 · 129,900원'}</p></figcaption></figure>)}</div>;
  if(index===2)return <div className="zara-details__flow">{[['COLLECTION','브랜드의 첫인상'],['CURATED FOR YOU','상품 탐색'],['THE EVERYDAY EDIT','스타일 이야기'],['OUR STORIES','커뮤니티 연결']].map(([title,body],i)=><div key={title}><small>0{i+1}</small><h4>{title}</h4><p>{body}</p><span aria-hidden="true">↓</span></div>)}</div>;
  return <div className="zara-details__photo"><Photo kind="office" alt="문서와 노트북이 놓인 작업 공간"/></div>;
}
export default function ZaraDetails(){const ref=useRef(null);useEffect(()=>initZaraDetails(ref.current),[]);return <section id="zara-details" className="zara-details" ref={ref} aria-labelledby="zara-details-title"><div className="horizontal-viewport" data-viewport><div className="horizontal-heading"><SectionLabel number="07">ZARA / DESIGN & MY ROLE</SectionLabel><h2 id="zara-details-title">Behind the <em>screen.</em></h2></div><div data-track>{content.details.map((detail,i)=><article className="horizontal-panel zara-details__panel" data-panel key={i}><div className="zara-details__copy"><span className="fine-print">ZARA — 0{i+1} / 04</span><h3>{titles[i]}</h3>{detail.paragraphs.map((p,j)=><p key={j}>{p}</p>)}{i===3&&<Link href={links.zara}>VIEW WEBSITE</Link>}</div><DetailVisual index={i}/></article>)}</div><HorizontalControls label="ZARA 상세"/></div></section>;}
