import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { renderMemoryProof } from './memory-proof.mjs';

const output = 'artifacts/memory-wall';
await mkdir(output, { recursive: true });
await writeFile(`${output}/result.json`, JSON.stringify({ status: 'running' }));
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
const externalErrors = [];
const recordError = error => {
  // Film Archive's unmodified YouTube iframe can fail inside YouTube itself.
  // Preserve that evidence separately; never suppress application errors.
  if (error.message === 'this.api.isExternalMethodAvailable is not a function' && /https:\/\/www\.youtube\.com\/s\//.test(error.stack || '')) {
    externalErrors.push({ message: error.message, stack: error.stack });
  } else errors.push({ message: error.message, stack: error.stack });
};
const checks = [];
// Section-only captures omit fixed chrome which otherwise repeats midway
// through tall element screenshots. This does not change the application.
const capture = async (wall, filename) => {
  // Element screenshots can scroll a tall section across lifecycle boundaries.
  // Capture its document-space rectangle without changing the scroll position.
  return wall.page().screenshot({ path: `${output}/${filename}`, style: '.site-header,.skip-link{visibility:hidden!important}' });
};
const base = process.env.MEMORY_BASE_URL || 'http://127.0.0.1:5173';
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.on('pageerror', recordError);
const settle = () => page.waitForTimeout(1250);
const clickVisibleCard = async (target, index, touch = false) => {
  const card = target.locator('.memory-card').nth(index);
  await card.scrollIntoViewIfNeeded();
  const point = await card.evaluate(node => {
    const rect = node.getBoundingClientRect();
    for (let y = Math.max(110, rect.top + 12); y < Math.min(innerHeight, rect.bottom - 12); y += 10) {
      for (let x = rect.left + 12; x < rect.right - 12; x += 10) {
        if (node.contains(document.elementFromPoint(x, y))) return { x, y };
      }
    }
    return null;
  });
  assert(point, `Card ${index + 1} has an exposed selectable area`);
  if (touch) await target.touchscreen.tap(point.x, point.y);
  else await target.mouse.click(point.x, point.y);
};
const state = () => page.locator('.memory-card').evaluateAll(nodes => nodes.map(node => {
  const matrix = new DOMMatrix(getComputedStyle(node).transform);
  return { x: matrix.m41, y: matrix.m42, a: matrix.a, b: matrix.b, selected: node.dataset.selected, back: node.dataset.back };
}));
const centered = async (index) => {
  const values = await state();
  assert(Math.abs(values[index].x) < .1 && Math.abs(values[index].y) < .1);
  assert(Math.abs(values[index].a - 1.42) < .001 && Math.abs(values[index].b) < .001);
  assert(values.filter((_, i) => i !== index).every(value => Math.hypot(value.a, value.b) <= .781), 'Unselected cards shrink while the focused card grows');
  assert.equal(values.filter(value => value.selected === 'true').length, 1);
};
const bounded = async target => {
  const result = await target.locator('.memory-wall__stage').evaluate(stage => {
    const bounds = stage.getBoundingClientRect();
    const selected = stage.querySelector('[data-selected="true"]');
    const focus = selected?.getBoundingClientRect();
    const gap = stage.clientWidth > 1000 ? 56 : stage.clientWidth > 600 ? 44 : 34;
    return [...stage.querySelectorAll('.memory-card')].every(card => {
      const rect = card.getBoundingClientRect();
      if (focus && card !== selected && Math.max(focus.left - rect.right, rect.left - focus.right, focus.top - rect.bottom, rect.top - focus.bottom) < gap - 2) return false;
      return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
    });
  });
  assert(result, 'Cards stay in bounds and leave a 34–56px clear area around the selected photo');
};

try {
  await page.goto(base);
  await page.waitForTimeout(4500);
  const wall = page.locator('#closing');
  await wall.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'scattered');
  const count = await page.locator('.memory-card').count();
  assert.equal(count, 10);
  assert.equal(await page.locator('.memory-prop').count(), 8);
  const propLoaded = await page.locator('.memory-prop image').evaluateAll(nodes => Promise.all(nodes.map(node => new Promise(resolve => {
    const image = new Image(); image.onload = () => resolve(true); image.onerror = () => resolve(false); image.src = node.getAttribute('href');
  }))));
  assert(propLoaded.every(Boolean), 'All supplied transparent PNG decorations load');
  assert(await page.locator('.memory-wall__stage').evaluate(stage => stage.clientWidth >= innerWidth - 1), 'Memory wall spans the viewport');
  const initialProps = await page.locator('.memory-prop').evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.memoryProp, matrix: getComputedStyle(node).transform })));
  assert.equal(await page.locator('.memory-card__image img').count(), count);
  await page.waitForFunction(() => [...document.querySelectorAll('.memory-card__image img')].every(image => image.complete && image.naturalWidth));
  assert.equal(await page.locator('.memory-card').evaluateAll(nodes => new Set(nodes.map(node => node.dataset.frame)).size), 6);
  assert.equal(await wall.locator('h2').innerText(), 'A LITTLE MORE\nABOUT ME.');
  await bounded(page);
  const initial = await state();
  assert(initial.every(value => Math.abs(Math.atan2(value.b, value.a) * 180 / Math.PI) <= 12.01));
  await capture(wall, '01-scatter.png');
  checks.push('10 supplied photos loaded, 6 supplied transparent frames, seeded scatter, rotations within ±12°, no clipping');

  await clickVisibleCard(page, 0);
  await page.waitForTimeout(240);
  const moving = await state();
  const movingProps = await page.locator('.memory-prop').evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.memoryProp, matrix: getComputedStyle(node).transform })));
  assert(movingProps.some((prop, index) => ['palms', 'car'].includes(prop.id) && prop.matrix !== initialProps[index].matrix), 'Associated props move during the photo focus, not afterwards');
  assert(Math.abs(moving[0].x) > 1, 'Focus must travel instead of jumping to the center');
  assert(Math.abs(moving[0].x - initial[0].x) > 1);
  assert(moving.slice(1).some((value, i) => Math.abs(value.x - initial[i + 1].x) > 3));
  await capture(wall, '02-in-flight.png');
  await settle(); await centered(0); await bounded(page);
  assert.deepEqual(await page.locator('.memory-prop[data-related="true"]').evaluateAll(nodes => nodes.map(node => node.dataset.memoryProp).sort()), ['car', 'palms']);
  await capture(wall, '03-focus.png');
  checks.push('Direct click: sampled in-flight center travel and simultaneous surrounding shuffle');

  await page.locator('.memory-card').first().click(); await page.waitForTimeout(400);
  assert.equal(await page.locator('.memory-card').first().getAttribute('data-back'), 'true');
  assert.equal(await page.locator('.memory-card__back').first().evaluate(el => getComputedStyle(el).opacity), '1');
  await capture(wall, '04-back.png');
  await page.locator('.memory-card').first().click(); await page.waitForTimeout(400);
  assert.equal(await page.locator('.memory-card__front').first().evaluate(el => getComputedStyle(el).opacity), '1');
  await clickVisibleCard(page, 1); await settle(); await centered(1);
  assert.deepEqual(await page.locator('.memory-prop[data-related="true"]').evaluateAll(nodes => nodes.map(node => node.dataset.memoryProp).sort()), ['camera', 'mask', 'script']);
  await capture(page.locator('.memory-wall__stage'), '10-props-on-set.png');
  checks.push('8 supplied PNGs load; viewport-wide scatter; travel/film associations switch and gather in the same focus timeline');
  checks.push('Back crossfade, close, another photo focuses from its existing position');

  await page.getByRole('button', { name: '다음 사진', exact: true }).click(); await settle(); await centered(2);
  await page.locator('.memory-card').nth(2).click();
  assert.equal(await page.locator('.memory-card').nth(2).getAttribute('data-back'), 'true');
  await page.getByRole('button', { name: '이전 사진', exact: true }).click(); await settle(); await centered(1);
  // Physical clicks, without Playwright waiting for the animated cards to stop.
  const next = await page.getByRole('button', { name: '다음 사진', exact: true }).boundingBox();
  for (let i = 0; i < 9; i++) await page.mouse.click(next.x + next.width / 2, next.y + next.height / 2);
  const rapidIndex = (1 + 9) % count;
  await settle(); await centered(rapidIndex);
  assert.match(await page.locator('.memory-wall__count').innerText(), /01\s*\/\s*10/);
  checks.push('Previous/Next, rapid 9-click interruption, photo front reset, current count');

  await page.setViewportSize({ width: 900, height: 1000 }); await settle();
  await centered(rapidIndex); await bounded(page);
  await capture(wall, '05-tablet.png');
  await page.setViewportSize({ width: 390, height: 844 }); await settle();
  // Responsive upstream sections can move this section entirely out of view.
  // That is a genuine lifecycle exit; reenter and select again in that case.
  if (await page.locator('.memory-card').nth(rapidIndex).getAttribute('data-selected') !== 'true') {
    await page.locator('.memory-wall__stage').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'scattered');
    await page.getByRole('button', { name: '다음 사진', exact: true }).click(); await settle();
  }
  await centered(rapidIndex); await bounded(page);
  checks.push('Resize desktop → tablet retains selection; mobile reflow exit/reentry and bounds verified');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  mobile.on('pageerror', recordError);
  await mobile.goto(base); await mobile.waitForTimeout(4500);
  await mobile.locator('#closing').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'scattered');
  await clickVisibleCard(mobile, 0, true); await mobile.waitForTimeout(1200);
  await bounded(mobile);
  await capture(mobile.locator('#closing'), '06-mobile-focus.png');
  await mobile.locator('.memory-card').first().tap(); await mobile.waitForTimeout(400);
  assert.equal(await mobile.locator('.memory-card').first().getAttribute('data-back'), 'true');
  assert(await mobile.locator('.memory-card__description').first().evaluate(el => el.scrollHeight <= el.clientHeight), 'Mobile description fits without clipping');
  await capture(mobile.locator('#closing'), '07-mobile-back.png');
  await mobile.getByRole('button', { name: '다음 사진', exact: true }).tap(); await mobile.waitForTimeout(1200);
  assert.equal(await mobile.locator('.memory-card').nth(1).getAttribute('data-selected'), 'true');
  assert(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  checks.push('Touch-enabled mobile: select, flip, Next, no horizontal overflow');
  await mobile.close();

  await page.setViewportSize({ width: 1440, height: 1100 }); await settle();
  await page.locator('.memory-wall__nav').scrollIntoViewIfNeeded();
  await page.mouse.move(750, 850); await page.mouse.wheel(0, 900); await settle();
  assert(await page.locator('#contact').evaluate(el => el.getBoundingClientRect().top < innerHeight));
  await page.mouse.wheel(0, -1500); await settle();
  assert(await wall.evaluate(el => el.getBoundingClientRect().bottom > 0));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.memory-wall__nav').scrollIntoViewIfNeeded();
  const beforeReduced = await page.locator('.memory-card').evaluateAll(nodes => nodes.findIndex(node => node.dataset.selected === 'true'));
  await page.getByRole('button', { name: '다음 사진', exact: true }).click(); await page.waitForTimeout(100); await centered((beforeReduced + 1) % count);
  checks.push('Wheel exits to Contact and returns, reduced motion settles immediately');

  // Capture every real photo at focus size for visual crop review.
  for (let i = 0; i < count; i++) {
    while (await page.locator('.memory-card').nth(i).getAttribute('data-selected') !== 'true') {
      await page.getByRole('button', { name: '다음 사진', exact: true }).click();
    }
    await page.waitForTimeout(60);
    await centered(i); await bounded(page);
    if (i === 5) await capture(page.locator('.memory-wall__stage'), '09-isolated-group-focus.png');
    const card = page.locator('.memory-card').nth(i);
    await card.screenshot({ path: `${output}/photo-${String(i + 1).padStart(2, '0')}.png` });
  }
  await renderMemoryProof(browser, output, count);
  checks.push('All ten photos individually focused; 34–56px exclusion gap verified from rotated bounds; group-photo isolation captured');

  // Verify future data growth in a browser-only fixture.
  if (!process.env.MEMORY_BASE_URL) {
    const many = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await many.route('**/About/memories.js*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: `${await response.text()}\nmemories.push(...Array.from({length:30-memories.length},(_,i)=>({id:'extra-'+i,category:'Notes',title:'Future memory '+i,year:'',image:null,description:''})));` });
    });
    await many.goto(base); await many.waitForTimeout(4500);
    assert.equal(await many.locator('.memory-card').count(), 30);
    await many.getByRole('button', { name: '이전 사진', exact: true }).click(); await many.waitForTimeout(1200);
    assert.equal(await many.locator('.memory-card').nth(29).getAttribute('data-selected'), 'true');
    await bounded(many);
    checks.push('30-card browser fixture: all render, last card reachable, bounded mobile layout');
    await many.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/result.json`, JSON.stringify({ status: 'passed', checks, errors, externalErrors }, null, 2));
  console.log(JSON.stringify({ status: 'passed', checks, externalErrorCount: externalErrors.length }, null, 2));
} catch (error) {
  await writeFile(`${output}/result.json`, JSON.stringify({ status: 'failed', checks, errors, externalErrors, failure: error.message }, null, 2));
  throw error;
} finally { await browser.close(); }
