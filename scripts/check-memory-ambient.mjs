import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
await mkdir('artifacts/memory-wall/ambient', { recursive: true });
try {
  for (const width of [1139, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    await page.goto('http://127.0.0.1:5173');
    await page.waitForTimeout(3500);
    const move = async offset => {
      await page.evaluate(async offset => {
        const root = document.querySelector('#closing');
        (await import('/src/motion/scroll.js')).scrollToPosition(scrollY + root.getBoundingClientRect().top + offset, true);
      }, offset);
      await page.waitForTimeout(500);
    };
    await move(-220);
    await page.screenshot({ path: `artifacts/memory-wall/ambient/${width}-boundary.png` });
    await move(400);
    await page.waitForTimeout(2000);
    const transforms = () => page.evaluate(() => [...document.querySelectorAll('.memory-wall__crown,.memory-card__float')].map(n => getComputedStyle(n).transform));
    const before = await transforms();
    await page.waitForTimeout(1800);
    const after = await transforms();
    assert(before.every((value, i) => value !== after[i]), 'Every crown and photograph subtly moves');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert((await transforms()).every(value => value === 'none'), 'Reduced motion disables ambient animations');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await move(width === 390 ? 400 : 1000);
    await page.screenshot({ path: `artifacts/memory-wall/ambient/${width}-palms.png` });
    console.log(`${width}: boundary captured, all 6 crowns and ${before.length - 6} photos move; reduced motion passes`);
    await page.close();
  }
} finally { await browser.close(); }
