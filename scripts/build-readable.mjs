import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { load } from 'cheerio';
import { writeFile } from 'node:fs/promises';

// Generate the no-JavaScript reading view from the same React content.
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
const server = await createServer({
  server: { middlewareMode: true }, appType: 'custom',
  plugins: [{
    name: 'reading-view-omit-dialog-portals',
    enforce: 'pre',
    transform(code, id) {
      // These portals contain only hidden previews/dialogs, not section copy.
      if (/\/(WorkFolder|ProjectList)\.jsx$/.test(id.replaceAll('\\', '/'))) {
        return code.replace("import { createPortal } from 'react-dom';", 'const createPortal = () => null;');
      }
    },
  }],
});
try {
  const { render } = await server.ssrLoadModule('/scripts/render.jsx');
  const $ = load(render());
  const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const sections = $('main > section').map((_, section) => {
    const nodes = $(section).find('h1,h2,h3,h4,p,dt,dd,.section-label');
    const copy = nodes.toArray().filter(node => !$(node).closest('button,nav,[aria-hidden="true"],.sr-only').length)
      .map(node => {
        const tag = /^h[1-4]$/.test(node.tagName) ? node.tagName : 'p';
        const clone = $(node).clone();
        clone.find('br').replaceWith('\n');
        return `<${tag}>${escape(clone.text())}</${tag}>`;
      }).join('\n');
    return `<section>${copy}</section>`;
  }).get().join('\n');
  if (!sections.includes('A LITTLE MORE') || sections.length < 5000) throw new Error('Incomplete reading view');
  await writeFile('public/readable.html', `<!doctype html>
<html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TOMMY CHU — Portfolio Reading View</title>
<style>body{max-width:850px;margin:0 auto;padding:32px 24px;background:#f3ead8;color:#172622;font:16px/1.9 system-ui,sans-serif}section{padding:32px 0;border-bottom:1px solid #b5b6a9}h1,h2,h3,h4,p{white-space:pre-line;overflow-wrap:anywhere}h2{font-size:2rem}a{color:inherit}</style>
<header><a href="/">T / Tommy — 포트폴리오</a><p>텍스트 버전 · JavaScript 없이 본문을 읽을 수 있습니다.</p></header>
<main>${sections}</main></html>`);
  console.log('Generated public/readable.html from current portfolio content');
} finally {
  const { gsap, ScrollTrigger } = await server.ssrLoadModule('/src/motion/scroll.js');
  ScrollTrigger.disable();
  gsap.ticker.sleep();
  await server.close();
  dom.window.close();
}
