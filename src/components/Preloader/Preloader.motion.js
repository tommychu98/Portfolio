import { gsap } from '../../motion/scroll';

export function initPreloader(root,sources,onReady,onComplete){
  let disposed=false,leaving=false,minimumTimer,deadline,exit;
  const paths=[...root.querySelectorAll('[data-draw]')];
  const context=gsap.context(()=>{},root);
  let drawing;
  context.add(()=>{
    paths.forEach(path=>{const length=path.getTotalLength();gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});});
    drawing=gsap.to(paths,{strokeDashoffset:0,duration:.45,stagger:.07,ease:'power1.inOut'});
  });
  const leave=()=>{
    if(disposed||leaving)return;
    leaving=true;clearTimeout(deadline);clearTimeout(minimumTimer);
    drawing?.progress(1).pause();
    // Start the heavier intro entrance only after the loader has faded, so it
    // cannot delay the one-second loader animation on slower devices.
    exit=gsap.to(root,{opacity:0,duration:.18,ease:'power2.inOut',onComplete:()=>{
      if(disposed)return;
      onComplete();
      onReady();
    }});
  };
  // Start font requests for the typography actually used above the fold.
  const fonts=document.fonts ? Promise.allSettled([
    document.fonts.load('900 80px "Noto Sans KR Variable"','주경덕'),
    document.fonts.load('400 40px Anton','PORTFOLIO 2026'),
    document.fonts.load('600 20px "Barlow Condensed"','WEB DESIGN & PUBLISHING'),
    document.fonts.ready,
  ]) : Promise.resolve();
  const images=sources.map(src=>Promise.resolve().then(()=>{const image=new Image();image.src=src;return image.decode();}));
  // Keep the complete draw-and-fade sequence within roughly one second.
  const minimum=new Promise(resolve=>{minimumTimer=setTimeout(resolve,820);});
  Promise.all([minimum,Promise.allSettled([...images,fonts])]).then(leave);
  deadline=setTimeout(leave,820);
  return()=>{disposed=true;clearTimeout(minimumTimer);clearTimeout(deadline);exit?.kill();context.revert();};
}
