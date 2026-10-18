import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

const dom = new JSDOM('<!doctype html><div id="root"></div>', { pretendToBeVisual: true });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLDialogElement', 'Element', 'Node', 'Event', 'MouseEvent', 'getComputedStyle']) {
  globalThis[key] = key === 'getComputedStyle' ? dom.window[key].bind(dom.window) : dom.window[key];
}
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
globalThis.matchMedia = window.matchMedia;
window.scrollTo = () => {};
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const root = createRoot(document.getElementById('root'));
try {
  const { default: WorkFolder } = await server.ssrLoadModule('/src/components/sections/PortfolioDetails/WorkFolder.jsx');
  await act(() => root.render(React.createElement(WorkFolder)));
  const trigger = document.querySelector('.diptyque-work-folder__trigger');
  const click = element => act(() => element.click());
  // Touch produces focus before click: clicking must leave the folder expanded.
  await act(() => trigger.focus());
  await click(trigger);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  const cards = [...document.querySelectorAll('[data-work-card]')];
  const dialog = document.querySelector('dialog');
  for (const [index, card] of cards.entries()) {
    await click(card);
    assert(dialog.open);
    assert.equal(document.body.style.overflow, 'hidden');
    assert.equal(dialog.querySelector('strong').textContent, card.querySelector('strong').textContent);
    if (index === 0) await click(dialog.querySelector('.diptyque-work-folder__close'));
    else if (index === 1) await click(dialog.querySelector('.diptyque-work-folder__enlarged'));
    else if (index === 2) await act(() => dialog.dispatchEvent(new Event('cancel', { cancelable: true })));
    else await click(dialog);
    assert(!dialog.open);
    assert.equal(document.body.style.overflow, '');
    assert.equal(document.activeElement, card);
  }
  await click(cards[0]);
  await act(() => root.unmount());
  assert.equal(document.body.style.overflow, '');
  console.log('PASS: touch expand; all four cards; close button, backdrop and Escape; focus return; scroll lock cleanup.');
  console.log('DOM verification only: browser layout and native focus trapping are not covered.');
} finally {
  const { gsap, ScrollTrigger } = await server.ssrLoadModule('/src/motion/scroll.js');
  ScrollTrigger.disable();
  gsap.ticker.sleep();
  await server.close();
  dom.window.close();
}
