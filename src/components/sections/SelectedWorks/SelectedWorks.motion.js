import { gsap, ScrollTrigger, scrollToPosition } from '../../../motion/scroll';

const clamp = gsap.utils.clamp(0, 1);
export function initSelectedWorks(root, projects, onActive) {
  const stage = root.querySelector('[data-stage]');
  const scenes = [...root.querySelectorAll('[data-project]')];
  const media = gsap.matchMedia();
  let trigger, current = -1, locked = false, staticSelect;
  const state = { position: 0 };
  const activate = index => {
    if (index === current) return;
    current = index;
    stage.dataset.active = projects[index].id;
    onActive(index);
  };
  media.add({ all: 'all', portrait: '(orientation: portrait)' }, context => {
    const { portrait } = context.conditions;
    const render = () => {
      const position = state.position;
      const nearest = Math.max(0, Math.min(projects.length - 1, Math.round(position)));
      activate(nearest);
      const lower = Math.min(Math.floor(position), projects.length - 1);
      stage.style.backgroundColor = gsap.utils.interpolate(projects[lower].background, projects[Math.min(lower + 1, projects.length - 1)].background, position - lower);
      scenes.forEach((scene, index) => {
        const distance = index - position;
        const amount = clamp(1 - Math.abs(distance) / .38);
        const spread = amount * amount * (3 - 2 * amount);
        const orbit = scene.querySelector('[data-orbit]');
        const title = scene.querySelector('[data-project-title]');
        const cards = scene.querySelectorAll('[data-card]');
        scene.inert = amount < .65;
        scene.setAttribute('aria-hidden', String(amount < .65));
        scene.style.zIndex = index === nearest ? 3 : 1;
        gsap.set(orbit, portrait ? {rotation:0, y:Math.max(-1,Math.min(1,distance))*20, opacity:1} : {rotation:distance*20,y:0,opacity:1});
        gsap.set(title, {opacity:amount, y:(1-amount)*110, visibility:amount === 0 ? 'hidden' : 'visible'});
        cards.forEach((card, cardIndex) => {
          const sign = cardIndex ? 1 : -1;
          gsap.set(card, {xPercent:sign*(portrait?7:30)*spread, yPercent:sign*(portrait?14:8)*spread, rotation:sign*(portrait?5:14)*spread});
          gsap.set(card.querySelector('.sw-card__shade'), {opacity:.46*spread});
        });
      });
    };
    staticSelect = index => { state.position = index; render(); };
    state.position = Math.max(0,current);
    render();
    {
      trigger = ScrollTrigger.create({
        trigger:root, start:'top top', end:()=>`+=${window.innerHeight * projects.length}`,
        pin:stage, invalidateOnRefresh:true,
        snap:{snapTo:value=>gsap.utils.snap(1/(projects.length-1),value),duration:{min:.15,max:.35},delay:.7,inertia:false},
        onUpdate:self=>{ if(locked) return; staticSelect(self.progress*(projects.length-1)); },
        onRefresh:self=>{ if(!locked) staticSelect(self.progress*(projects.length-1)); },
      });
    }    return () => { trigger=null; };
  });
  return {
    select(index) {
      if(locked) return;
      index=Math.max(0,Math.min(projects.length-1,index));
      if(trigger) { scrollToPosition(trigger.start+(trigger.end-trigger.start)*index/(projects.length-1),true); ScrollTrigger.update(); staticSelect(index); }
      else staticSelect(index);
    },
    lock(value) { locked=value; if(value) { trigger?.getTween(true)?.kill?.(); } },
    restore(index, y, sameSize) {
      locked=false;
      if(sameSize) scrollToPosition(y,true);
      else this.select(index);
      ScrollTrigger.update();
      staticSelect(index);
    },
    destroy() { media.revert(); },
  };
}

export function animateDetail(dialog, origin) {
  const visual=dialog.querySelector('[data-detail-visual]');
  const copy=dialog.querySelector('[data-detail-content]');
  const cards=[...dialog.querySelectorAll('[data-card]')];
  const title=dialog.querySelector('[data-detail-title]');

  let timeline;
  const context=gsap.context(()=>{
    cards.forEach((card,i)=>gsap.set(card,{transform:origin.transforms[i]}));

    const portrait=()=>window.matchMedia('(orientation: portrait)').matches;
    timeline=gsap.timeline();
    timeline.fromTo(visual,{x:0,scale:1},{x:()=>portrait()?0:-innerWidth*.25,scale:()=>portrait()?1:.8,duration:1.2,ease:'expo.out'},0);
    cards.forEach((card,i)=>timeline.to(card,{x:()=>portrait()?(i?1:-1)*innerWidth*.4:new DOMMatrix(origin.transforms[i]).e,y:()=>portrait()?(i?1:-1)*innerHeight*.35:new DOMMatrix(origin.transforms[i]).f,scale:()=>portrait()?.7:1,opacity:()=>portrait()?.16:1,duration:1.2,ease:'expo.out'},0));
    timeline.to(title,{opacity:()=>portrait()?0:1,duration:.6},0);
    timeline.fromTo(copy,{opacity:0,y:35},{opacity:1,y:0,duration:.8,ease:'expo.out'},.18);
  },dialog);
  const resize=()=>{if(!timeline)return; const progress=timeline.progress();timeline.invalidate().progress(progress);};

  window.addEventListener('resize',resize);
  return {
    close(done) {
      dialog.scrollTop=0;
      if(!timeline) return done();
      timeline.eventCallback('onReverseComplete',done);
      if(timeline.progress()===0) done(); else timeline.timeScale(1.6).reverse();
    },
    destroy() {window.removeEventListener('resize',resize);context.revert();},
  };
}
