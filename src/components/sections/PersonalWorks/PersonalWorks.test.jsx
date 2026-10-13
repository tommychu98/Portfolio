import assert from 'node:assert/strict';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import PersonalWorks from './PersonalWorks';
import content from '../../../data/projects';
import { gsap, ScrollTrigger } from '../../../motion/scroll';

export async function run(mode) {
  const root = createRoot(document.getElementById('test-root'));
  const click = element => act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  const outside = ScrollTrigger.create({ trigger: document.body, start: 0, end: 100 });
  try {
    await act(() => root.render(<PersonalWorks/>));
    const section = document.getElementById('personal');
    const works = [...section.querySelectorAll('[data-personal-work]')];
    assert.equal(works.length, 2);
    assert.equal(section.classList.contains('personal-works--orbit'), mode === 'desktop');
    for (let index = 0; index < works.length; index++) {
      if (mode === 'desktop') {
        await click(section.querySelectorAll('.personal-works__project-nav button')[index]);
        assert.equal(works[index].inert, false);
        assert.equal(works[1 - index].inert, true);
      } else {
        assert.notEqual(works[index].getAttribute('aria-hidden'), 'true');
      }
      const opener = works[index].querySelector('[data-personal-art]');
      await click(opener);
      const dialog = section.querySelector('dialog');
      assert(dialog.open);
      assert.equal(document.body.style.overflow, 'hidden');
      assert.equal(dialog.querySelector('h3').textContent, content.personal[index].name);
      assert.equal(dialog.querySelector('a').href, content.personal[index].href);
      assert(dialog.querySelectorAll('svg').length >= 2);
      // Drive time explicitly: jsdom checks state, not visual animation quality.
      await act(() => { gsap.globalTimeline.getChildren().filter(t => t.vars?.scrollTrigger === undefined).forEach(t => t.totalProgress(1)); });
      if (index === 0) await click(dialog.querySelector('[aria-label="개인 작업 상세 닫기"]'));
      else await act(() => dialog.dispatchEvent(new Event('cancel', { cancelable: true })));
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 850)); });
      assert(!dialog.open);
      assert.equal(document.body.style.overflow, '');
      assert.equal(document.activeElement, opener);
    }
    await click(works[1].querySelector('[data-personal-art]'));
    await act(() => root.unmount());
    assert.equal(document.body.style.overflow, '');
    assert(ScrollTrigger.getAll().includes(outside), 'Other sections must retain their triggers');
    assert.equal(ScrollTrigger.getAll().length, 1, 'Section must remove its own trigger');
    return { passed: true, mode, works: 2, checks: 'detail content, links, close, Escape, focus return, scroll lock cleanup, trigger isolation', limitation: 'Simulated DOM; visual layout and native dialog focus trap require a browser.' };
  } finally { outside.kill(); ScrollTrigger.disable(); gsap.ticker.sleep(); }
}
