import { gsap } from '../../../motion/scroll';

export function initProfile(root) {
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const heading=root.querySelector('[data-profile-heading]');
    heading.setAttribute('data-heading-animating','');
    gsap.fromTo(heading.querySelectorAll('[data-profile-letter]'), {y:-150,opacity:0,rotation:-10}, {
      y:0,opacity:1,rotation:0,stagger:.05,duration:.8,ease:'power2.inOut',
      // Restore the original unsplit text on settling, including native kerning.
      onUpdate:function(){heading.toggleAttribute('data-heading-animating',this.progress()<1);},
      scrollTrigger:{id:'profile-title-entry',trigger:root,start:'top 50%',toggleActions:'play reverse play reverse',invalidateOnRefresh:true},
    });
    gsap.fromTo(root.querySelector('.profile__layout'), {y:50,opacity:0}, {
      y:0,opacity:1,ease:'power2.out',
      scrollTrigger:{id:'profile-content-entry',trigger:root,start:'top 40%',end:'top 10%',scrub:1,invalidateOnRefresh:true},
    });
    return()=>heading.removeAttribute('data-heading-animating');
  });
  return()=>media.revert();
}
