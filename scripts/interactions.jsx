import assert from 'node:assert/strict';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Header from '../src/components/layout/Header';
import ZaraProcess from '../src/components/sections/ZaraProcess/ZaraProcess';
import content from '../src/data/projects';
import { gsap, ScrollTrigger } from '../src/motion/scroll';

export async function run(){
  const root=createRoot(document.getElementById('test-root'));
  const click=async el=>act(()=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));
  try{
    await act(()=>root.render(<><Header/><ZaraProcess/></>));
    const menuButton=document.querySelector('[aria-controls="site-menu"]');
    await click(menuButton);
    assert.equal(menuButton.getAttribute('aria-expanded'),'true');
    assert(document.getElementById('site-menu').open);
    assert.equal(document.body.style.overflow,'hidden');
    await click(document.querySelector('[aria-label="메뉴 닫기"]'));
    assert.equal(menuButton.getAttribute('aria-expanded'),'false');
    assert.equal(document.body.style.overflow,'');
    assert.equal(document.activeElement,menuButton);
    await click(menuButton);
    await act(()=>document.getElementById('site-menu').dispatchEvent(new Event('cancel',{bubbles:false})));
    assert(!document.getElementById('site-menu').open);
    const steps=[...document.querySelectorAll('.zara-process__step')];
    let selections=0;
    for(let i=0;i<steps.length;i++){
      const tabs=[...steps[i].querySelectorAll('.zara-process__tabs button')];
      for(let j=0;j<tabs.length;j++){
        await click(tabs[j]);
        assert.equal(steps[i].querySelector('.zara-process__preview img').getAttribute('src'),content.process[i].materials[j].src);
        assert.equal(steps[i].querySelectorAll('[aria-pressed="true"]').length,1);
        selections++;
      }
      const preview=steps[i].querySelector('.zara-process__preview');
      preview.focus();await click(preview);
      const dialog=document.querySelector('.zara-process__dialog');
      assert(dialog.open);
      assert.equal(dialog.querySelector('img').getAttribute('src'),content.process[i].materials.at(-1).src);
      await click(document.querySelector('[aria-label="기획 자료 닫기"]'));
      assert(!dialog.open);
      assert.equal(document.activeElement,preview);
    }
    await click(menuButton);
    await act(()=>root.unmount());
    assert.equal(document.body.style.overflow,'');
    return {passed:true,menu:'open / close / cancel / unmount cleanup',materialSelections:selections,materialDialogs:6,focusReturn:'React cleanup verified',limit:'Simulated DOM only; native dialog focus trap, rendered layout, media playback and scroll pinning require a real browser.'};
  }finally{ScrollTrigger.disable();gsap.ticker.sleep();}
}
