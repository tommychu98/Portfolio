import assert from 'node:assert/strict';
import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Profile from './Profile';
import WorkValues from '../WorkValues/WorkValues';
import { exitProgress } from '../WorkValues/WorkValues.motion';
import { gsap, ScrollTrigger } from '../../../motion/scroll';

export async function run(reduced){
  const root=createRoot(document.getElementById('test-root'));
  const outside=ScrollTrigger.create({trigger:document.body,start:0,end:100});
  try{
    await act(()=>root.render(<StrictMode><WorkValues/><Profile/></StrictMode>));
    const heading=document.querySelector('[data-profile-heading]');
    assert.equal(document.querySelectorAll('#profile-title').length,1);
    assert.equal(heading.querySelector('.profile__heading-motion').getAttribute('aria-hidden'),'true');
    assert.equal(heading.querySelector('.profile__heading-source').textContent,heading.querySelector('.profile__heading-motion').textContent);
    assert.equal(document.querySelectorAll('#profile [data-reveal]').length,0);
    assert.equal(exitProgress(.5,1800,800),0,'Tall content must remain readable before exit');
    assert.equal(exitProgress(1,1800,800),1);
    assert.equal(exitProgress(.5,700,800),.75,'Short sections use power1.out');
    assert(!ScrollTrigger.getById('values-profile-exit'),'Boundary morph replaces the clipped content exit');
    const ids=['profile-title-entry','profile-content-entry'];
    if(reduced){ids.forEach(id=>assert(!ScrollTrigger.getById(id)));}
    else{
      ids.forEach(id=>assert.equal(ScrollTrigger.getAll().filter(t=>t.vars.id===id).length,1));
      const title=ScrollTrigger.getById(ids[0]);
      const body=ScrollTrigger.getById(ids[1]);
      assert.equal(title.vars.toggleActions,'play reverse play reverse');
      for(const p of [0,.5,1,.5,0]){
        await act(()=>{title.animation.progress(p);body.animation.progress(p);});
        assert.equal(document.querySelector('[data-values-exit]').style.transform,'');
        assert.equal(heading.hasAttribute('data-heading-animating'),p<1);
      }
      await act(()=>{body.animation.progress(1);});
      assert.equal(Number(gsap.getProperty(document.querySelector('.profile__layout'),'y')),0);
      assert.equal(Number(gsap.getProperty(document.querySelector('.profile__layout'),'opacity')),1);
    }
    await act(()=>root.unmount());
    ids.forEach(id=>assert(!ScrollTrigger.getById(id)));
    assert(ScrollTrigger.getAll().includes(outside));
    return {reduced,width:window.innerWidth,passed:true,checks:'reverse endpoints, long-content hold, accessibility, no duplicate triggers, StrictMode cleanup',limitation:'Simulated DOM only, not browser screenshots'};
  }finally{outside.kill();ScrollTrigger.disable();gsap.ticker.sleep();}
}
