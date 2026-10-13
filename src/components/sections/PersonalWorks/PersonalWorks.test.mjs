import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
const mode = process.argv[2] || 'reduced';
const dom = new JSDOM('<!doctype html><html><body><div id="test-root"></div></body></html>', { url: 'http://localhost:5174/', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLDialogElement', 'Element', 'Node', 'Event', 'MouseEvent', 'CustomEvent', 'MutationObserver', 'getComputedStyle']) {
  Object.defineProperty(globalThis, key, { value: key === 'getComputedStyle' ? dom.window[key].bind(dom.window) : dom.window[key], configurable: true, writable: true });
}
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.matchMedia = query => ({ matches: query.includes('min-width') ? mode === 'desktop' : query.includes(': reduce)') && mode === 'reduced', addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
globalThis.matchMedia = window.matchMedia;
window.scrollTo = () => {};
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { run } = await server.ssrLoadModule('/src/components/sections/PersonalWorks/PersonalWorks.test.jsx');
  console.log(await run(mode));
} finally { await server.close(); dom.window.close(); }
