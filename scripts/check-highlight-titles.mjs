import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'artifacts/highlight-titles';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [], externalErrors = [];
    page.on('pageerror', error => {
      if (/youtube\.com/.test(error.stack || '') && /isExternalMethodAvailable/.test(error.message)) externalErrors.push(error.message);
      else errors.push(error.message);
    });
    await page.goto('http://127.0.0.1:5173');
    await page.waitForTimeout(4500);
    assert.equal(await page.locator('.highlight-title').count(), 5);
    const titles = [];
    for (const id of ['work-title', 'personal-title', 'clone-title', 'skills-title', 'about-title']) {
      const title = page.locator(`#${id}`);
      await page.evaluate(async id => {
        const { scrollToPosition } = await import('/src/motion/scroll.js');
        const element = document.getElementById(id);
        scrollToPosition(element.getBoundingClientRect().top + scrollY - 180, true);
      }, id);
      await page.waitForTimeout(1500);
      const geometry = await title.evaluate(element => {
        const paper = element.querySelector('.highlight-title__paper');
        const rect = paper.getBoundingClientRect();
        return {
          id: element.id, text: element.textContent, title: element.getBoundingClientRect().toJSON(),
          paper: rect.toJSON(), font: getComputedStyle(element).fontFamily,
          color: getComputedStyle(paper).color,
          before: { content: getComputedStyle(paper, '::before').content, zIndex: getComputedStyle(paper, '::before').zIndex, transform: getComputedStyle(paper, '::before').transform },
          after: { content: getComputedStyle(paper, '::after').content, zIndex: getComputedStyle(paper, '::after').zIndex },
          masks: element.querySelectorAll('.text-motion-line-mask').length,
        };
      });
      assert(geometry.paper.left >= 8 && geometry.paper.right <= width - 8, `${id} tape retains safe margins at ${width}px`);
      assert.equal(geometry.color, 'rgb(17, 19, 15)');
      assert.equal(geometry.before.content, '""');
      assert.equal(geometry.after.content, '""');
      assert.equal(geometry.masks, 0, 'Completed titles retain native inline markup');
      assert(geometry.font.includes('Anton'));
      await page.screenshot({ path: `${out}/${width}-${id}.png` });
      titles.push(geometry);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForTimeout(3500);
    assert.equal(await page.locator('.highlight-title .text-motion-line-mask').count(), 0);
    assert.equal(await page.locator('.highlight-title .highlight-title__paper').count(), 5);
    assert.equal(await page.locator('a[href*="figma.com"]').count(), 0);
    assert.deepEqual(errors, []);
    results.push({ width, titles, errors, externalErrors });
    await page.close();
  }
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(results.map(({ width, errors }) => ({ width, titles: 5, errors })));
} finally { await browser.close(); }
