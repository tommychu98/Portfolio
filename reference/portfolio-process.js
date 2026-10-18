(()=>{
 const section=document.querySelector('.zara-process');if(!section)return;
 const track=section.querySelector('.process-track'),panels=[...track.children],progress=section.querySelector('.process-progress'),count=section.querySelector('.process-count');
 const media=matchMedia('(min-width:901px) and (prefers-reduced-motion:no-preference)');
 let queued=false;
 const engine=window.gsap&&window.ScrollTrigger;
 function update(){queued=false;if(engine||!media.matches)return;const distance=(panels.length-1)*innerWidth;const offset=Math.max(0,Math.min(distance,-section.getBoundingClientRect().top));track.style.transform=`translate3d(${-offset}px,0,0)`;progress.style.transform=`scaleX(${distance?offset/distance:0})`;count.textContent=`${String(Math.round(offset/innerWidth)+1).padStart(2,'0')} / ${String(panels.length).padStart(2,'0')}`;}
 function resize(){section.classList.toggle('is-scrolling',!engine&&media.matches);section.style.height=!engine&&media.matches?`${innerHeight+(panels.length-1)*innerWidth}px`:'';if(!engine&&!media.matches)track.style.transform='';update();window.ScrollTrigger?.refresh();}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',resize);media.addEventListener('change',resize);resize();
 if(engine){
  const {gsap,ScrollTrigger}=window;gsap.registerPlugin(ScrollTrigger);
  const mm=gsap.matchMedia();
  mm.add('(min-width:901px) and (prefers-reduced-motion:no-preference)',()=>{
   const distance=()=>track.scrollWidth-innerWidth;
   const tween=gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{id:'zara-process-scroll',trigger:section,pin:section.querySelector('.process-sticky'),start:'top top',end:()=>'+='+distance(),scrub:1,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{progress.style.transform=`scaleX(${self.progress})`;count.textContent=`${String(Math.round(self.progress*(panels.length-1))+1).padStart(2,'0')} / ${String(panels.length).padStart(2,'0')}`;}}});
   panels.forEach((panel,index)=>{
    const copy=panel.querySelector('.process-copy'),visual=panel.querySelector('.process-collage,.process-material');
    if(index===0){
     gsap.from(copy.children,{y:90,autoAlpha:0,duration:1.6,stagger:.16,ease:'power2.out',scrollTrigger:{trigger:copy,start:'top 75%',toggleActions:'play none none reverse'}});
     gsap.from(visual,{scale:.92,autoAlpha:.4,scrollTrigger:{trigger:section,start:'top 90%',end:'top 30%',scrub:1}});
    }else{
     gsap.from(copy.children,{y:90,autoAlpha:0,duration:1.6,stagger:.16,ease:'power2.out',scrollTrigger:{trigger:copy,containerAnimation:tween,start:'left 95%',toggleActions:'play none none reverse'}});
     gsap.from(visual,{scale:.92,autoAlpha:.4,scrollTrigger:{trigger:panel,containerAnimation:tween,start:'left 95%',end:'left 40%',scrub:1}});
    }
   });
  });
  mm.add('(max-width:900px) and (prefers-reduced-motion:no-preference)',()=>{
   panels.forEach(panel=>gsap.from(panel.querySelector('.process-copy').children,{y:70,autoAlpha:0,stagger:.14,ease:'power2.out',duration:1.5,scrollTrigger:{trigger:panel.querySelector('.process-copy'),start:'top 80%',toggleActions:'play none none reverse'}}));
  });
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
 }
 section.querySelectorAll('.process-step').forEach(panel=>panel.querySelectorAll('[data-process-material]').forEach(button=>button.addEventListener('click',()=>{panel.querySelectorAll('[data-process-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const url=`images/portfolio-methodology/${button.dataset.processMaterial}.png`;const image=panel.querySelector('img');image.src=url;image.alt=button.textContent;panel.querySelector('.process-preview').href=url;panel.querySelector('.process-caption').textContent=button.textContent+' ↗';})));
})();
