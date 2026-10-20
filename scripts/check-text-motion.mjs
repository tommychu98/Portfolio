import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'artifacts/text-motion';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390,
      recordVideo: { dir: `${out}/video`, size: { width: Math.min(width, 1280), height: 900 } } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => { if (!e.message.includes('isExternalMethodAvailable')) errors.push(e.message); });
    await page.goto('http://127.0.0.1:5173');
    await page.waitForTimeout(4000);
    await page.waitForFunction(() => document.querySelectorAll('[data-text-motion]').length > 40);
    const snapshot = () => page.locator('[data-text-motion]').evaluateAll(nodes => nodes.map(n => ({
      text: n.textContent, height: n.offsetHeight, width: n.offsetWidth,
      font: getComputedStyle(n).font, section: n.closest('section').id,
    })));
    const splitLayout = await snapshot();
    assert.equal(await page.locator('[data-reveal] [data-text-motion], [data-entry] [data-text-motion], [data-personal-copy] [data-text-motion], .site-header [data-text-motion], .memory-card [data-text-motion]').count(), 0);
    const move = async y => page.evaluate(async y => (await import('/src/motion/scroll.js')).scrollToPosition(y, true), y);
    const goto = async selector => {
      const y = await page.locator(selector).first().evaluate(n => n.getBoundingClientRect().top + scrollY - innerHeight * .45);
      await move(y); await page.waitForTimeout(1450);
    };
    await goto('#film-title');
    await page.screenshot({ path: `${out}/${width}-film.png` });
    await goto('#memory-wall-title');
    await page.screenshot({ path: `${out}/${width}-memory-title.png` });
    assert.equal(await page.locator('#memory-wall-title').getAttribute('data-text-revealed'), 'true');
    assert.equal(await page.locator('#memory-wall-title .text-motion-highlight').count(), 0);
    // Fast forward and reverse traversal must never leave skipped copy hidden.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 1800) { await move(y); await page.waitForTimeout(35); }
    await move(height); await page.waitForTimeout(1800);
    assert.deepEqual(await page.locator('[data-text-motion]:not([data-text-revealed="true"])').allTextContents(), []);
    const nativeLayout = await snapshot();
    const diffs = splitLayout.flatMap((n, i) => Math.abs(n.height-nativeLayout[i].height)>2 || Math.abs(n.width-nativeLayout[i].width)>2 ? [{ text:n.text.slice(0,45), before:n, after:nativeLayout[i] }] : []);
    assert.deepEqual(diffs, [], 'SplitText retains native line wrapping and block geometry');
    for (let y = height; y >= 0; y -= 4000) { await move(y); await page.waitForTimeout(20); }
    await page.setViewportSize({ width: width === 390 ? 430 : 1200, height: 800 });
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.text-motion-line-mask').count(), 0, 'Finished text uses native responsive layout');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload(); await page.waitForTimeout(3500);
    assert.equal(await page.locator('.text-motion-line-mask').count(), 0);
    assert.equal(await page.locator('[data-text-motion]:not([data-text-revealed="true"])').count(), 0);
    assert.deepEqual(errors, []);
    results.push({ width, elements: splitLayout.length, sections: [...new Set(splitLayout.map(n=>n.section))], geometryDifferences: diffs, errors });
    await context.close();
  }
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
