import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const reduced = process.argv.includes('reduced');
const dom = new JSDOM('<!doctype html><body><div id="boundary"><svg><path/><path/></svg></div></body>', { pretendToBeVisual:true });
for (const key of ['window','document','navigator','HTMLElement','Element','Node','getComputedStyle']) {
  Object.defineProperty(globalThis, key, { configurable:true, value:key === 'getComputedStyle' ? dom.window[key].bind(dom.window) : dom.window[key] });
}
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.matchMedia = window.matchMedia = query => ({ matches:query.includes('no-preference') ? !reduced : false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
window.scrollTo = () => {};
const server = await createServer({ server:{ middlewareMode:true, hmr:false }, appType:'custom' });
let gsap, ScrollTrigger;
try {
  ({ gsap, ScrollTrigger } = await server.ssrLoadModule('/src/motion/scroll.js'));
  const { initBoundaryBounce, boundaryPath, bounceSettings } = await server.ssrLoadModule('/src/components/transitions/BoundaryBounce/BoundaryBounce.motion.js');
  assert(bounceSettings(200).bend < bounceSettings(4000).bend);
  assert.equal(bounceSettings(-4000).bend, -bounceSettings(4000).bend);
  assert.equal(bounceSettings(100000).bend, bounceSettings(6000).bend);
  const root = document.getElementById('boundary');
  const path = root.querySelector('path');
  const outside = ScrollTrigger.create({ trigger:document.body, start:0, end:100 });
  for (let mount = 0; mount < 2; mount++) {
    root.querySelectorAll('path').forEach(item => item.setAttribute('d', boundaryPath(0)));
    const cleanup = initBoundaryBounce(root, 'test');
    const trigger = ScrollTrigger.getById('boundary-test');
    if (reduced) assert.equal(trigger, undefined);
    else {
      assert.equal(ScrollTrigger.getAll().filter(t => t.vars.id === 'boundary-test').length, 1);
      for (const velocity of [200, 4000, -4000, -200, 100000]) {
        const self = { getVelocity:() => velocity, direction:Math.sign(velocity) };
        trigger.vars[velocity > 0 ? 'onEnter' : 'onEnterBack'](self);
        const timeline = gsap.globalTimeline.getChildren(false, false, true).find(t => t.getChildren().some(child => child.targets().includes(path)));
        assert(timeline, 'A velocity impulse must create a morph timeline');
        timeline.time(.12);
        assert.equal(path.getAttribute('d'), root.querySelectorAll('path')[1].getAttribute('d'), 'Both color halves must share exactly the same curve');
        assert(!/NaN|undefined/.test(path.getAttribute('d')));
        assert.notEqual(path.getAttribute('d'), boundaryPath(0));
        timeline.progress(1);
        const coordinates = path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
        assert(coordinates.every(Number.isFinite));
        // The visible upper boundary is flat again after the elastic release.
        assert.equal(coordinates[1], 50);
        assert.equal(coordinates[3], 50);
        assert.equal(coordinates[5], 50);
        trigger.vars.onRefresh();
      }
    }
    cleanup();
    assert.equal(ScrollTrigger.getById('boundary-test'), undefined);
    assert(ScrollTrigger.getAll().includes(outside), 'Unrelated scroll animation must survive cleanup');
    assert.equal(path.getAttribute('d'), boundaryPath(0));
  }
  outside.kill();
  console.log({ passed:true, reduced, checks:'slow/fast/reverse morphs, speed clamp, elastic flat endpoint, remount cleanup, unrelated trigger preserved', limitation:'simulated DOM; no browser visual verification' });
} finally {
  ScrollTrigger?.disable();
  gsap?.ticker.sleep();
  await server.close();
  dom.window.close();
}
