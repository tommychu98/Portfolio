import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:5173/', pretendToBeVisual: true });
for (const key of ['window','document','navigator','HTMLElement','Element','Node','getComputedStyle']) {
  Object.defineProperty(globalThis, key, { value: key === 'getComputedStyle' ? dom.window[key].bind(dom.window) : dom.window[key], configurable: true });
}
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
window.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
window.scrollTo = () => {};
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
let cleanup = () => {};
try {
  const { default: BrandHistory } = await server.ssrLoadModule('/src/components/sections/BrandHistory/BrandHistory.jsx');
  const { default: SectionLabel } = await server.ssrLoadModule('/src/components/ui/SectionLabel.jsx');
  const { sectionOrder, sectionNumber } = await server.ssrLoadModule('/src/data/sections.js');
  const { historyChapters } = await server.ssrLoadModule('/src/components/sections/BrandHistory/BrandHistory.data.js');
  const { createHistoryTimeline } = await server.ssrLoadModule('/src/components/sections/BrandHistory/BrandHistory.motion.js');
  const { gsap, ScrollTrigger } = await server.ssrLoadModule('/src/motion/scroll.js');
  cleanup = () => { ScrollTrigger.disable(); gsap.ticker.sleep(); };
  document.body.innerHTML = renderToStaticMarkup(createElement(BrandHistory));
  const app = await readFile('src/App.jsx', 'utf8');
  assert.match(app, /<PortfolioProcess\s*\/>\s*<BrandHistory\s*\/>\s*<PersonalWorks\s*\/>/);
  for (const id of sectionOrder.slice(1)) {
    const html = renderToStaticMarkup(createElement(SectionLabel, { sectionId: id }, id));
    assert(html.includes(`${sectionNumber(id)} /`), id);
  }
  const { navigation } = await server.ssrLoadModule('/src/data/projects.js');
  for (const item of navigation) assert(sectionOrder.includes(item.href.slice(1)), `Missing navigation target ${item.href}`);
  const root = document.getElementById('diptyque-history');
  assert.deepEqual([...root.querySelectorAll('[data-history-chapter] h3')].map(node => node.textContent), ['FABRIC','OBJECTS','SCENT','MAISON']);
  assert.equal(root.querySelectorAll('.history-preview').length, 4);
  assert.equal(root.querySelectorAll('.history-object').length, 32);
  assert.equal(root.querySelectorAll('a[href*="figma.com"]').length, 0);
  let active = 0;
  const timeline = createHistoryTimeline(root, index => { active = index; });
  const samples = [0, .5, 1.2, 1.6, 2.5, 3.2, 3.7, 4.5, 5.2, 5.7, 6.5, 7];
  const state = () => [...root.querySelectorAll('[data-history-tile], [data-history-heading], [data-history-copy], [data-history-thumb]')].map(node => [node.style.clipPath,node.style.opacity,node.style.visibility,node.style.transform]);
  // Warm all lazy GSAP tweens before comparing bidirectional seeking.
  timeline.time(7, false);
  const forward = samples.map(time => { timeline.time(time, false); return state(); });
  for (let i = samples.length - 1; i >= 0; i--) {
    timeline.time(samples[i], false);
    assert.deepEqual(state(), forward[i], `Reverse state differs at ${samples[i]}`);
    const baseTiles = root.querySelectorAll('[data-history-chapter]:first-child [data-history-tile]');
    assert([...baseTiles].every(tile => tile.style.clipPath === 'inset(0% 0% 0% 0%)'), 'Base image must cover the stage through every transition');
  }
  for (const index of [3,0,2,1,3,0]) {
    timeline.time(index * 2 + .5, false);
    assert.equal(active, index);
    const accessible = [...root.querySelectorAll('[data-history-chapter]')].filter(node => node.getAttribute('aria-hidden') === 'false');
    assert.equal(accessible.length, 1);
    assert.equal(accessible[0].querySelector('h3').textContent, historyChapters[index].title);
  }
  timeline.kill();
  const sources = [...new Set(historyChapters.flatMap(chapter => [chapter.hero, ...chapter.details, ...chapter.objects.map(item => item.src)]))];
  for (const chapter of historyChapters) {
    const preview = await readFile(`public${chapter.preview}`, 'utf8');
    const previewDom = new JSDOM(preview);
    for (const img of previewDom.window.document.querySelectorAll('img')) {
      const src = img.getAttribute('src');
      assert(src.startsWith('/media/diptyque-history/'), `Unexpected preview image: ${src}`);
      await readFile(`public${src}`);
    }
    assert(!preview.includes('figma.com'), 'Preview must not expose Figma links');
    previewDom.window.close();
  }
  for (const src of sources) {
    const local = await readFile(`public${src}`);
    const original = await readFile(`C:/Users/mbc/Desktop/mbc_teamproject-main/mbc_teamproject-main/public/images/history/${src.split('/diptyque-history/')[1]}`);
    const hash = bytes => createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash(local), hash(original), `Source asset changed: ${src}`);
  }
  console.log({ passed: true, sectionCount: sectionOrder.length, insertion: sectionOrder.slice(7,10), numbering: '08 → 09 → 10; final 17', originalAssetsVerified: sources.length, timeline: 'forward, reverse, rapid seeking and persistent background passed', limit: 'DOM simulation; browser layout and physical scroll not verified' });
} finally {
  cleanup();
  await server.close();
  dom.window.close();
}
