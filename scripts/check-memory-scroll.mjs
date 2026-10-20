import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'artifacts/memory-wall/scroll';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const checks = [], errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 600 } });
const page = await context.newPage();
page.on('pageerror', e => { if (!/isExternalMethodAvailable/.test(e.message)) errors.push(e.message); });
const phase = () => page.locator('#closing').getAttribute('data-memory-state');
const wait = value => page.waitForFunction(v => document.querySelector('#closing').dataset.memoryState === v, value);
const geometry = () => page.locator('#closing').evaluate(el => {
  const r = el.getBoundingClientRect(), s = el.querySelector('.memory-wall__stage').getBoundingClientRect();
  return { top: r.top + scrollY, bottom: r.bottom + scrollY, stage: s.top + scrollY, height: s.height, viewport: innerHeight };
});
const setup = async y => { await page.evaluate(async y => (await import('/src/motion/scroll.js')).scrollToPosition(y, true), y); await page.waitForTimeout(100); };
const positions = () => page.locator('.memory-card').evaluateAll(nodes => nodes.map(n => {
  const m = new DOMMatrix(getComputedStyle(n).transform);
  return { x: m.m41, y: m.m42, scale: Math.hypot(m.a, m.b), z: +getComputedStyle(n).zIndex };
}));
const stack = async () => {
  await wait('stacked');
  assert((await positions()).every((p, i) => Math.abs(p.x) < .1 && Math.abs(p.y) < .1 && Math.abs(p.scale - .78) < .001 && p.z === i + 1));
};
const capture = name => page.screenshot({ path: `${output}/${name}.png` });
const wheelTo = async y => {
  const current = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, y - current);
};
try {
  await page.goto('http://127.0.0.1:5173'); await page.waitForTimeout(4000);
  await stack(); checks.push('Before entry: centered stack, original order and scale');
  let g = await geometry();
  await setup(g.stage - g.viewport - 100);
  await wheelTo(g.stage - g.viewport + 140);
  await wait('scattering');
  await page.waitForTimeout(250); const mid = await positions();
  assert(mid.some(p => Math.abs(p.x) > 1));
  await capture('01-entering'); await wait('scattered');
  const scattered = await positions();
  assert(scattered.filter(p => Math.abs(p.x) > 100).length >= 6);
  checks.push('Physical downward wheel automatically scatters with stagger, no click');
  await setup(g.stage + g.height / 2 - g.viewport / 2);
  await capture('02-scattered');
  // Navigation and direct clicks share the same focus implementation.
  await page.locator('.memory-wall__nav').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: '다음 사진', exact: true }).click(); await wait('focused');
  await page.locator('.memory-card').first().scrollIntoViewIfNeeded();
  await capture('03-focused');
  await page.locator('.memory-card').first().click();
  assert.equal(await page.locator('.memory-card').first().getAttribute('data-back'), 'true');
  await page.waitForTimeout(350); await capture('04-back');
  await page.locator('.memory-card').first().click();
  await page.getByRole('button', { name: '다음 사진', exact: true }).click(); await wait('focused');
  assert.equal(await page.locator('.memory-card').nth(1).getAttribute('data-selected'), 'true');
  checks.push('Focus, reverse face, close and next focus survive automatic entry');
  g = await geometry();
  await setup(g.bottom - 140); await page.waitForTimeout(150);
  assert.equal(await phase(), 'focused');
  checks.push('Stage outside viewport but section still visible: no premature gather');
  await wheelTo(g.bottom + 10); await wait('gathering'); await stack();
  checks.push('Entire section above viewport: downward exit gathers');
  await wheelTo(g.stage + g.height - 120); await wait('scattering'); await wait('scattered');
  checks.push('Reentry from below automatically scatters');
  await setup(g.top - g.viewport + 80);
  await wheelTo(g.top - g.viewport - 30); await wait('gathering'); await stack();
  checks.push('Entire section below viewport: upward exit gathers');
  await setup(g.stage - g.viewport - 100);
  await wheelTo(g.stage - g.viewport + 140); await wait('scattering');
  await page.waitForTimeout(260);
  await setup(g.top - g.viewport - 20); assert.equal(await phase(), 'gathering');
  const before = await positions();
  await setup(g.stage - g.viewport + 100); assert.equal(await phase(), 'scattering');
  const after = await positions();
  assert(after.some(p => Math.abs(p.x) > 1));
  assert(after.some((p, i) => Math.abs(p.x - before[i].x) < 80));
  await wait('scattered');
  checks.push('Scatter interrupted by exit; gathering interrupted by reentry without reset');
  await setup(g.top - g.viewport - 20); await stack();
  await setup(g.stage + 220); assert.equal(await phase(), 'scattering');
  // Click a currently exposed, moving card using the real pointer.
  const point = await page.locator('.memory-card').evaluateAll(nodes => {
    for (const node of [...nodes].reverse()) {
      const r = node.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (y > 100 && y < innerHeight && node.contains(document.elementFromPoint(x, y))) return { x, y };
    }
    return null;
  });
  assert(point); await page.mouse.click(point.x, point.y); await wait('focused');
  checks.push('Physical card click during scatter smoothly takes over with focus');
  await setup(g.top - g.viewport - 20); await stack();
  await setup(g.stage - 200); await wait('scattered');
  await page.setViewportSize({ width: 900, height: 600 }); await page.waitForTimeout(500);
  assert.equal(await phase(), 'scattered');
  await page.setViewportSize({ width: 1440, height: 600 }); await page.waitForTimeout(500);
  assert.equal(await page.evaluate(async () => (await import('/src/motion/scroll.js')).ScrollTrigger.getAll().filter(t => t.vars.id === 'memory-wall-lifecycle').length), 1);
  checks.push('Responsive resize retains scatter; exactly one local lifecycle ScrollTrigger');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  g = await geometry(); await setup(g.top - 650); await stack();
  await setup(g.stage - 450); await wait('scattered');
  checks.push('Reduced motion reaches stack/scatter immediately');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 500 }, isMobile: true, hasTouch: true });
  const mp = await mobile.newPage();
  await mp.goto('http://127.0.0.1:5173'); await mp.waitForTimeout(4000);
  const mg = await mp.locator('.memory-wall__stage').evaluate(el => el.getBoundingClientRect().top + scrollY);
  await mp.evaluate(async y => (await import('/src/motion/scroll.js')).scrollToPosition(y, true), mg - 550);
  const cdp = await mobile.newCDPSession(mp);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 420 }] });
  for (let y = 390; y >= 140; y -= 25) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y }] });
    await mp.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mp.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'scattered');
  await mp.getByRole('button', { name: '다음 사진', exact: true }).tap();
  await mp.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'focused');
  await mp.locator('.memory-card').first().tap();
  assert.equal(await mp.locator('.memory-card').first().getAttribute('data-back'), 'true');
  assert(await mp.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await mp.screenshot({ path: `${output}/05-mobile-touch.png` });
  checks.push('Mobile physical touch swipe auto-scatters; touch focus/flip; no horizontal overflow');
  const mobileTop = await mp.locator('#closing').evaluate(el => el.getBoundingClientRect().top + scrollY);
  await mp.evaluate(async y => (await import('/src/motion/scroll.js')).scrollToPosition(y, true), mobileTop - 550);
  await mp.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'stacked');
  await mp.evaluate(async y => (await import('/src/motion/scroll.js')).scrollToPosition(y, true), mg - 200);
  await mp.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'scattered');
  checks.push('Mobile complete exit gathers and reentry scatters again');
  await mobile.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'passed', checks }, null, 2));
  await writeFile(`${output}/result.json`, JSON.stringify({ status: 'passed', checks, errors }, null, 2));
} catch (e) {
  await capture('failure');
  await writeFile(`${output}/result.json`, JSON.stringify({ status: 'failed', checks, errors, failure: e.stack }, null, 2));
  throw e;
} finally { await context.close(); await browser.close(); }
