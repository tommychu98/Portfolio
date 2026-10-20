import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const checks = [], errors = [], externalErrors = [];
page.on('pageerror', error => {
  if (/isExternalMethodAvailable/.test(error.message) && /youtube\.com/.test(error.stack || '')) externalErrors.push(error.message);
  else errors.push(error.message);
});
const settle = () => page.waitForTimeout(1400);
const move = async selector => {
  const y = await page.locator(selector).first().evaluate(n => n.getBoundingClientRect().top + scrollY - 160);
  await page.evaluate(async y => (await import('/src/motion/scroll.js')).scrollToPosition(y, true), y);
  await settle();
};
try {
  await page.goto('http://127.0.0.1:5173');
  await page.waitForTimeout(4500);
  assert.equal(await page.locator('#intro [data-text-motion]').count(), 0);
  assert(await page.locator('#intro h1').isVisible());
  assert.equal(await page.locator('a[href*="figma.com"]').count(), 0);
  checks.push('Initial Intro visible; existing Intro untouched; no external design-source links');

  // Resize and switch preference BEFORE pending reveals enter the viewport.
  await page.setViewportSize({ width: 1100, height: 850 });
  await settle();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settle();
  assert.equal(await page.locator('.text-motion-line-mask').count(), 0);
  assert.equal(await page.locator('[data-text-motion]').evaluateAll(ns => ns.filter(n => +getComputedStyle(n).opacity < 1).length), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await settle();
  checks.push('Pending split resize and live reduced-motion toggles restore readable text');
  await page.setViewportSize({ width: 1440, height: 900 });
  await settle();

  await move('#zara-process');
  await page.locator('.desk-frame__select').first().click();
  await settle();
  await page.getByRole('button', { name: '조사 자료 전체 보기', exact: true }).click();
  await settle();
  for (const index of [1, 2, 0]) {
    await page.locator(`#zara-process [data-step="${index}"]`).click();
    await settle();
    assert.equal(await page.locator(`#zara-process [data-step="${index}"]`).getAttribute('aria-current'), 'step');
  }
  assert.equal(await page.locator('[data-finding] [data-text-motion]').count(), 0);
  checks.push('Research canvas selection/reset and chapter changes; Key Finding remains owned by its original timeline');

  const history = await page.evaluate(async () => {
    const { ScrollTrigger, scrollToPosition } = await import('/src/motion/scroll.js');
    const trigger = ScrollTrigger.getById('portfolio-brand-history');
    if (!trigger) return false;
    scrollToPosition(trigger.start + (trigger.end - trigger.start) * .6, true);
    return true;
  });
  assert(history);
  await settle();
  assert.equal(await page.locator('[data-history-copy] [data-text-motion]').count(), 0);
  checks.push('History scroll timeline remains registered and seekable without nested text reveals');

  await move('#film-archive .film-archive__gallery');
  await page.locator('.film-archive__panel').nth(1).hover();
  await settle();
  assert(await page.locator('.film-archive__panel').nth(1).evaluate(n => n.classList.contains('is-active')));
  await page.locator('.film-archive__panel').nth(0).click();
  await settle();
  assert(await page.locator('.film-archive__panel').nth(0).evaluate(n => n.classList.contains('is-active')));
  checks.push('Film Archive hover and click accordion preserved');

  await move('.memory-wall__stage');
  await page.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'scattered');
  await page.getByRole('button', { name: '다음 사진', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#closing').dataset.memoryState === 'focused');
  await page.getByRole('button', { name: '이전 사진', exact: true }).click();
  await settle();
  assert.equal(await page.locator('.memory-card [data-text-motion]').count(), 0);
  checks.push('Memory Wall scroll scatter and next/previous focus preserved');

  assert.deepEqual(errors, []);
  const result = { checks, errors, externalErrors };
  await writeFile('artifacts/text-motion/regression.json', JSON.stringify(result, null, 2));
  console.log(result);
} finally { await browser.close(); }
