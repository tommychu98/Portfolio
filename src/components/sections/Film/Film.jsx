import { useEffect, useRef, useState } from 'react';
import content from '../../../data/projects';
import SectionLabel from '../../ui/SectionLabel';
import Link from '../../ui/Link';
import './Film.css';
function FilmPlayer({film,index}){
  const [failed,setFailed]=useState(false);
  const [track,setTrack]=useState(0);
  const videoRef=useRef(null);
  const visible=useRef(false);
  const playlist=film.playlist;
  const src=playlist?.[track]??film.src;
  const duration=Math.round(film.duration??16);
  useEffect(()=>{
    if(!playlist?.length)return;
    const video=videoRef.current;
    const observer=new IntersectionObserver(([entry])=>{
      visible.current=entry.isIntersecting&&entry.intersectionRatio>=.2;
      if(visible.current&&!document.hidden)video.play().catch(()=>{});
      else video.pause();
    },{threshold:[0,.2]});
    observer.observe(video);
    return()=>observer.disconnect();
  },[playlist]);
  useEffect(()=>{
    if(!playlist?.length)return;
    const video=videoRef.current;
    video.load();
    if(visible.current&&!document.hidden)video.play().catch(()=>{});
  },[src,playlist]);
  const advance=()=>{
    if(!playlist?.length)return;
    setFailed(false);
    setTrack(current=>(current+1)%playlist.length);
  };
  return <div className={`film__media ${film.wide?'film__media--wide':''}`}>
    <video ref={videoRef} controls playsInline muted={Boolean(playlist)} loop={!playlist&&(film.loop??false)} preload={playlist||film.loop?'metadata':'none'} poster={film.poster} aria-label={`${film.title} — ${duration}초 영상${playlist?` · ${track+1}/${playlist.length} 순차 반복 재생`:film.loop?' · 반복 재생':''}`} onEnded={advance} onError={()=>setFailed(true)} width={film.wide?1280:720} height={film.wide?720:1280}>
      <source src={src} type={film.type??'video/webm'}/><a href={src}>영상 파일 열기</a>
    </video>
    <div className="film__media-caption"><span>{playlist?`CLIP 0${track+1} / 0${playlist.length}`:`0${index+1}`} · {film.wide?'16:9':'9:16'} · {duration} SEC</span><Link href={src} target="_blank" rel="noopener noreferrer">{failed?'영상 파일로 보기':'ORIGINAL FILM'}</Link></div>
    {failed&&<p role="status">이 브라우저에서 재생되지 않아 원본 영상 링크를 제공합니다.</p>}
  </div>;
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
  return <section id="film" ref={ref} className="film section-space paper-grain" aria-labelledby="film-title"><SectionLabel sectionId="film">PERSONAL WORK / FILM & MOTION</SectionLabel><div className="section-heading"><h2 id="film-title" className="display">A quiet<br/><em>presence.</em></h2><div className="film__introduction"><span>PERSONAL FILMS / AI & MOTION</span><p>AI와 After Effects 등 다양한 도구를 활용해 제작한 개인 영상 작업입니다. 이미지와 영상 생성, 편집, 모션 그래픽을 직접 시도하며 장면의 흐름과 움직임으로 이야기를 표현해왔습니다.</p></div></div><div className="film__index">{content.films.map((film,i)=><a key={film.title} href={`#film-${i+1}`}><span>0{i+1}</span><span>{film.title}</span><span aria-hidden="true">↘</span></a>)}</div>{content.films.map((film,i)=><article id={`film-${i+1}`} className={`film__article ${film.wide?'film__article--wide':''}`} key={film.title}><FilmPlayer film={film} index={i}/><div className="film__copy"><span className="fine-print">FILM 0{i+1} / 03 · {film.brand??'BYREDO'}</span><h3>{film.title}</h3><p className="film__subtitle">{film.subtitle}</p><dl>{film.meta.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.text}</dd></div>)}</dl></div></article>)}</section>;
}
