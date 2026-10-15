import { useEffect, useRef, useState } from 'react';
import content from '../../../data/projects';
import SectionLabel from '../../ui/SectionLabel';
import Link from '../../ui/Link';
import './Film.css';
function FilmPlayer({film,index}){
  const [failed,setFailed]=useState(false);
  const duration=film.duration??16;
  return <div className={`film__media ${film.wide?'film__media--wide':''}`}><video controls playsInline preload="none" poster={film.poster} aria-label={`${film.title} — 원본 오디오 포함 ${duration}초 영상`} onError={()=>setFailed(true)} width={film.wide?1280:720} height={film.wide?720:1280}><source src={film.src} type={film.type??'video/webm'}/><a href={film.src}>영상 파일 열기</a></video><div className="film__media-caption"><span>0{index+1} / {film.wide?'16:9':'9:16'} · {duration} SEC</span><Link href={film.src} target="_blank" rel="noopener noreferrer">{failed?'영상 파일로 보기':'ORIGINAL FILM'}</Link></div>{failed&&<p role="status">이 브라우저에서 재생되지 않아 원본 영상 링크를 제공합니다.</p>}</div>;
}
export default function Film(){
  const ref=useRef(null);
  useEffect(()=>{
    const videos=[...ref.current.querySelectorAll('video')];
    const play=event=>videos.forEach(video=>{if(video!==event.target)video.pause();});
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)entry.target.pause();}),{threshold:0});
    videos.forEach(v=>{observer.observe(v);v.addEventListener('play',play);});
    const hidden=()=>{if(document.hidden)videos.forEach(v=>v.pause());};document.addEventListener('visibilitychange',hidden);
    return()=>{observer.disconnect();videos.forEach(v=>{v.pause();v.removeEventListener('play',play);});document.removeEventListener('visibilitychange',hidden);};
  },[]);
  return <section id="film" ref={ref} className="film section-space paper-grain" aria-labelledby="film-title"><SectionLabel number="10">BYREDO & DOWNY / FILM & MOTION</SectionLabel><div className="section-heading"><h2 id="film-title" className="display">A quiet<br/><em>presence.</em></h2><div className="film__introduction"><span>BRAND VISUAL STORIES / 03 FILMS</span><p>바이레도의 감각적인 제품 비주얼과 다우니의 일상 속 이야기를 담은 세 편의 영상. 세로형 숏폼부터 가로형 홈페이지 히어로까지, 브랜드에 맞는 장면과 메시지를 구성했습니다.</p><p className="fine-print">바이레도 영상은 AI 이미지를 활용한 개인 콘셉트 작업입니다.<br/>BYREDO의 공식 광고·의뢰 작업이 아닙니다.</p></div></div><div className="film__index">{content.films.map((film,i)=><a key={film.title} href={`#film-${i+1}`}><span>0{i+1}</span><span>{film.title}</span><span aria-hidden="true">↘</span></a>)}</div>{content.films.map((film,i)=><article id={`film-${i+1}`} className={`film__article ${film.wide?'film__article--wide':''}`} key={film.title}><FilmPlayer film={film} index={i}/><div className="film__copy"><span className="fine-print">FILM 0{i+1} / 03 · {film.brand??'BYREDO'}</span><h3>{film.title}</h3><p className="film__subtitle">{film.subtitle}</p><dl>{film.meta.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.text}</dd></div>)}</dl></div></article>)}</section>;
}
