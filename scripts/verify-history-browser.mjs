import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const out = 'artifacts/history-browser';
const baseUrl = process.env.HISTORY_BASE_URL || 'http://localhost:5173';
await mkdir(out, { recursive: true });
await writeFile(`${out}/result.json`, JSON.stringify({ status: 'running' }));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && response.url().includes('/media/diptyque-history/')) errors.push(`${response.status()} ${response.url()}`); });
try {
  await page.goto(baseUrl);
  await page.waitForTimeout(2500);
  await page.locator('.site-header__nav').getByRole('link', { name: 'HISTORY', exact: true }).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}/entry.png` });
  console.log(await page.locator('#diptyque-history').evaluate(el => ({ top: el.getBoundingClientRect().top, height: el.offsetHeight, active: el.querySelector('[data-active="true"] h3')?.textContent, frames: el.querySelectorAll('iframe').length })));
  for (const name of ['FABRIC','OBJECTS','SCENT','MAISON']) {
    await page.locator('.brand-history__footer').getByRole('button', { name: new RegExp(name) }).click();
    await page.waitForTimeout(2000);
    const chapter = page.locator(`.brand-history__chapter--${name.toLowerCase()}`);
    assert.equal(await chapter.getAttribute('aria-hidden'), 'false');
    assert.equal(await chapter.locator('.history-object').count(), 8);
    await page.waitForFunction(id => {
      const root = document.querySelector(`.brand-history__chapter--${id}`);
      const doc = root.querySelector('iframe')?.contentDocument;
      return doc?.images.length && [...doc.images, ...root.querySelectorAll('img')].every(img => img.complete && img.naturalWidth);
    }, name.toLowerCase(), { timeout: 30000 });
    const bad = await chapter.locator('img').evaluateAll(images => images.filter(img => !img.complete || !img.naturalWidth).map(img => img.src));
    assert.deepEqual(bad, []);
    await page.screenshot({ path: `${out}/${name.toLowerCase()}.png` });
    await chapter.locator('.history-object button').first().hover();
    await page.waitForTimeout(250);
    assert.equal(await chapter.locator('.history-object__tooltip').first().evaluate(el => getComputedStyle(el).opacity), '1');
    await page.screenshot({ path: `${out}/${name.toLowerCase()}-hover.png` });
    for (const object of await chapter.locator('.history-object').all()) {
      await object.locator('button').hover();
      await page.waitForFunction(el => getComputedStyle(el).opacity === '1', await object.locator('[role="tooltip"]').elementHandle());
      assert.equal(await object.locator('[role="tooltip"]').evaluate(el => getComputedStyle(el).opacity), '1');
    }
    await page.mouse.move(20, 100);
    // Exercise the real loop timeline at normal speed, then seek to its
    // boundary to verify every chapter without waiting several minutes.
    const getY = () => chapter.locator('[data-preview-page]').first().evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42);
    const y1 = await getY(); await page.waitForTimeout(1300); const y2 = await getY();
    assert(y2 < y1, `${name}: full page must move down automatically`);
    assert.equal(await chapter.locator('.history-preview button, .history-preview input').count(), 0, 'Full-page preview has no playback controls');
    await chapter.locator('.history-preview__viewport').evaluate(async el => {
      const { gsap } = await import('/src/motion/scroll.js');
      const loop = gsap.getTweensOf(el.querySelector('[data-preview-page]'))[0].parent;
      loop.time(Number(el.dataset.previewDuration) + 3).pause();
    });
    const distance = Number(await chapter.locator('.history-preview__viewport').getAttribute('data-preview-distance'));
    assert(Math.abs(await getY() + distance) < 1, `${name}: reaches the exact page bottom`);
    await page.screenshot({ path: `${out}/${name.toLowerCase()}-end.png` });
    await chapter.locator('.history-preview__viewport').evaluate(async el => {
      const { gsap } = await import('/src/motion/scroll.js');
      gsap.getTweensOf(el.querySelector('[data-preview-page]'))[0].parent.time(Number(el.dataset.previewDuration) + 4.8);
    });
    const blend = await chapter.locator('[data-preview-page]').nth(1).evaluate(el => Number(getComputedStyle(el).opacity));
    assert(blend > .3 && blend < .7, `${name}: first frame overlaps last frame`);
    await page.screenshot({ path: `${out}/${name.toLowerCase()}-crossover.png` });
    await chapter.locator('.history-preview__viewport').evaluate(async el => {
      const { gsap } = await import('/src/motion/scroll.js');
      const loop = gsap.getTweensOf(el.querySelector('[data-preview-page]'))[0].parent;
      loop.timeScale(4).play();
    });
    await page.waitForTimeout(450);
    assert(Math.abs(await getY()) < 2, `${name}: returns to first frame after crossfade`);
    await chapter.locator('.history-preview__viewport').evaluate(async el => {
      const { gsap } = await import('/src/motion/scroll.js');
      gsap.getTweensOf(el.querySelector('[data-preview-page]'))[0].parent.timeScale(1);
    });
    console.log(`${name}: objects, hover, autoplay, bottom, crossfade, repeat passed`);
  }
  // Exit with physical wheel input, then return through the header anchor.
  await page.mouse.move(700, 500); await page.mouse.wheel(0, 2000); await page.waitForTimeout(1800);
  const nextTop = await page.locator('#personal').evaluate(el => el.getBoundingClientRect().top);
  assert(nextTop < 1000, 'Next portfolio section is reachable after history');
  await page.screenshot({ path: `${out}/next-section.png` });
  await page.locator('.site-header__nav').getByRole('link', { name: 'HISTORY', exact: true }).click(); await page.waitForTimeout(1800);
  assert.equal(await page.locator('[data-history-chapter][data-active="true"] h3').textContent(), 'FABRIC');
  await page.mouse.wheel(0, 2200); await page.waitForTimeout(1800);
  assert.notEqual(await page.locator('[data-history-chapter][data-active="true"] h3').textContent(), 'FABRIC');
  await page.mouse.wheel(0, -2200); await page.waitForTimeout(1800);
  assert.equal(await page.locator('[data-history-chapter][data-active="true"] h3').textContent(), 'FABRIC');
  // Mobile and reduced motion show one selected chapter, with automatic pan.
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1000);
  await page.locator('.brand-history__chapter--fabric').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('#diptyque-history').evaluate(el => el.classList.contains('is-animated')), false);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: `${out}/mobile.png` });
  for (const chapter of await page.locator('[data-history-chapter]').all()) assert.equal(await chapter.locator('.history-object button').count(), 8);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(800);
  assert.equal(await page.locator('.history-preview__seek').count(), 0);
  assert.equal(await page.locator('[data-history-chapter]:not([hidden])').count(), 1);
  assert.equal(await page.locator('[data-history-chapter][aria-hidden="true"]').count(), 0);
  assert.deepEqual(errors, []);
  await writeFile(`${out}/result.json`, JSON.stringify({ errors, status: 'passed', chapters: 4, objects: 32, checks: ['header entry', 'full page autoplay', 'no playback controls', 'page bottom', 'crossfade', 'loop restart', 'hover explanations', 'forward/reverse wheel', 'next section', 're-entry', '390px mobile', 'reduced motion'] }, null, 2));
} finally { await browser.close(); }
