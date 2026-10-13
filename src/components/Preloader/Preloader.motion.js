import { gsap } from '../../motion/scroll';

export function initPreloader(root,sources,onReady,onComplete){
  let disposed=false,leaving=false,minimumTimer,deadline,exit;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const paths=[...root.querySelectorAll('[data-draw]')];
  const context=gsap.context(()=>{},root);
  let drawing;
  context.add(()=>{
    if(!media.matches){
      paths.forEach(path=>{const length=path.getTotalLength();gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});});
      drawing=gsap.to(paths,{strokeDashoffset:0,duration:.65,stagger:.18,ease:'power1.inOut'});
    }
  });
  const leave=()=>{
    if(disposed||leaving)return;
    leaving=true;clearTimeout(deadline);clearTimeout(minimumTimer);
    drawing?.progress(1).pause();
    onReady();
    exit=gsap.to(root,{opacity:0,duration:media.matches ? .12 : .45,ease:'power2.inOut',onComplete:()=>{if(!disposed)onComplete();}});
  };
  // Start font requests for the typography actually used above the fold.
  const fonts=document.fonts ? Promise.allSettled([
    document.fonts.load('900 80px "Noto Sans KR Variable"','주경덕'),
    document.fonts.load('400 40px Anton','PORTFOLIO 2026'),
    document.fonts.load('600 20px "Barlow Condensed"','WEB DESIGN & PUBLISHING'),
    document.fonts.ready,
  ]) : Promise.resolve();
  const images=sources.map(src=>Promise.resolve().then(()=>{const image=new Image();image.src=src;return image.decode();}));
  const minimum=new Promise(resolve=>{minimumTimer=setTimeout(resolve,media.matches?0:1600);});
  Promise.all([minimum,Promise.allSettled([...images,fonts])]).then(leave);
  deadline=setTimeout(leave,5000);
  const reduce=()=>{if(media.matches)leave();};
  media.addEventListener('change',reduce);
  return()=>{disposed=true;clearTimeout(minimumTimer);clearTimeout(deadline);exit?.kill();context.revert();media.removeEventListener('change',reduce);};
}
