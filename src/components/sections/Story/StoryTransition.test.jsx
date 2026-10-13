import assert from 'node:assert/strict';
import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Story from './Story';
import { ScrollTrigger, gsap } from '../../../motion/scroll';

export async function run(reduced) {
  const root=createRoot(document.getElementById('test-root'));
  const outside=ScrollTrigger.create({trigger:document.body,start:0,end:100});
  try {
    await act(()=>root.render(<StrictMode><Story/></StrictMode>));
    const section=document.querySelector('#story');
    assert(!section.classList.contains('paper-grain'),'STORY must not add a second textured blue surface');
    assert.equal(section.querySelectorAll('h2').length,1);
    const lines=[...section.querySelectorAll('[data-story-line]')];
    assert.equal(lines.length,2);
    for(const line of lines){
      assert.equal(line.children[0].innerHTML,line.children[1].innerHTML);
      assert.equal(line.children[1].getAttribute('aria-hidden'),'true');
    }
    const trigger=ScrollTrigger.getById('intro-story-circle');
    if(reduced){assert(!trigger);}
    else{
      assert(trigger);
      assert(!ScrollTrigger.getById('intro-story-curve'));
      assert.equal(ScrollTrigger.getAll().filter(t=>t.vars.id==='intro-story-circle').length,1);
      assert.equal(trigger.vars.start,'top 80%');
      assert.equal(trigger.vars.end,'top 20%');
      assert.equal(trigger.vars.scrub,1.2);
      const circle=section.querySelector('[data-story-circle]');
      const snapshots=new Map();
      for(const p of [0,.25,.5,.75,1,.75,.5,.25,0]){
        await act(()=>{trigger.animation.progress(p);});
        const snapshot=[circle.style.width,circle.style.height,gsap.getProperty(lines[0],'x'),gsap.getProperty(lines[1],'x')];
        if(snapshots.has(p))assert.deepEqual(snapshot,snapshots.get(p));
        snapshots.set(p,snapshot);
      }
      assert.equal(parseFloat(snapshots.get(0)[0]),40);
      assert.equal(parseFloat(snapshots.get(1)[0]),Math.max(window.innerWidth,window.innerHeight)*2);
      assert.equal(snapshots.get(0)[2],-window.innerWidth);
      assert.equal(snapshots.get(1)[2],-window.innerWidth*.1);
      assert.equal(snapshots.get(1)[3],window.innerWidth*.1);
      assert.equal(ScrollTrigger.getById('story-circle-lift').vars.scrub,1);
      assert.equal(ScrollTrigger.getById('story-images-entry').vars.scrub,1.2);
      assert.equal(ScrollTrigger.getById('story-images-entry').vars.start,'top 78%');
      assert.equal(ScrollTrigger.getById('story-images-entry').vars.end,'top 42%');
      assert.equal(ScrollTrigger.getById('story-copy-entry').vars.start,'top 74%');
    }
    await act(()=>root.unmount());
    assert(!ScrollTrigger.getById('intro-story-circle'));
    assert(!ScrollTrigger.getById('story-circle-lift'));
    assert(!ScrollTrigger.getById('story-images-entry'));
    assert(ScrollTrigger.getAll().includes(outside));
    return {reduced,singleAccessibleTitle:true,circleAndTextTimeline:true,strictModeCleanup:true};
  }finally{outside.kill();ScrollTrigger.disable();gsap.ticker.sleep();}
}
