import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1158, height: 894 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:5173/#diptyque-history');
  await page.waitForTimeout(6500);
  const plant = page.locator('.history-object--plant');
  assert.equal(await plant.locator('img').count(), 2);
  assert(await plant.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth)));
  await plant.screenshot({ path: 'artifacts/history-browser/plant.png' });
  for (const id of ['fabric', 'objects']) {
    await page.locator('.brand-history__footer').getByRole('button', { name: new RegExp(id, 'i') }).click();
    const chapter = page.locator(`.brand-history__chapter--${id}`);
    await page.waitForTimeout(1800);
    if (id === 'objects') {
      // Longer than the entire GIF: it must still be waiting above the scene.
      await page.waitForTimeout(6500);
      const waiting = await chapter.locator('iframe').first().evaluate(frame => {
        const image = frame.contentDocument.querySelector('[data-once-gif]');
        return { state: image.dataset.playback, src: image.getAttribute('src') };
      });
      assert.equal(waiting.state, undefined, 'Man must not leave when the page viewer starts');
      assert(waiting.src.endsWith('.png'));
      assert.deepEqual(await chapter.locator('.history-object').evaluateAll(items => items.slice(4).map(item => item.querySelector('img').getAttribute('src').split('/').pop())), [
        'floating-framed-image-01.png', 'objects-shelf-object-05.png', 'story-02-decorative-visual.png', 'objects-shelf-object-07.png',
      ]);
      await chapter.locator('.history-object--quote-frame button').hover();
      await page.waitForTimeout(250);
      await page.screenshot({ path: 'artifacts/history-browser/objects-revised.png' });
      const flame = chapter.locator('.history-object__flame');
      const first = await flame.evaluate(el => getComputedStyle(el).transform);
      await page.waitForTimeout(250);
      assert.notEqual(await flame.evaluate(el => getComputedStyle(el).transform), first, 'Candle flame must flicker');
    }
    await chapter.locator('.history-preview__viewport').evaluate(async viewport => {
      const frame = viewport.querySelector('iframe');
      const img = frame.contentDocument.querySelector('[data-once-gif]');
      const scale = viewport.clientWidth / 1920;
      const travel = Math.max(0, img.getBoundingClientRect().top * scale - viewport.clientHeight * .1);
      const { gsap } = await import('/src/motion/scroll.js');
      const loop = gsap.getTweensOf(viewport.querySelector('[data-preview-page]'))[0].parent;
      loop.time(2 + Number(viewport.dataset.previewDuration) * Math.min(1, travel / Number(viewport.dataset.previewDistance)));
    });
    if (id === 'objects') {
      await page.waitForFunction(() => document.querySelector('.brand-history__chapter--objects iframe').contentDocument.querySelector('[data-once-gif]').dataset.playback === 'playing');
      await page.screenshot({ path: 'artifacts/history-browser/man-visible-playing.png' });
      const ratio = await chapter.locator('.history-preview__viewport').evaluate(viewport => {
        const frame = viewport.querySelector('iframe'), image = frame.contentDocument.querySelector('[data-once-gif]');
        const rect = image.getBoundingClientRect(), bounds = viewport.getBoundingClientRect(), scale = bounds.width / 1920;
        const [, y, , h] = image.dataset.gifSubject.split(',').map(Number);
        const top = frame.getBoundingClientRect().top + (rect.top + y * rect.height) * scale;
        return (Math.min(top + rect.height * h * scale, bounds.bottom) - Math.max(top, bounds.top)) / Math.min(rect.height * h * scale, bounds.height);
      });
      assert(ratio >= .85, 'The viewport must contain the man before playback');
    }
    await page.waitForFunction(id => {
      const img = document.querySelector(`.brand-history__chapter--${id} iframe`).contentDocument.querySelector('[data-once-gif]');
      return img.dataset.playback === 'finished';
    }, id, { timeout: 15000 });
    assert.equal(await chapter.locator('iframe').first().evaluate(frame => frame.contentDocument.querySelector('[data-once-gif]').style.visibility), 'hidden');
    await chapter.getByRole('button', { name: `${id.toUpperCase()} 미리보기 처음부터` }).click();
    await page.waitForTimeout(1000);
    for (const frame of await chapter.locator('iframe').all()) {
      assert.equal(await frame.evaluate(frame => frame.contentDocument.querySelector('[data-once-gif]').style.visibility), 'hidden');
    }
    assert((await chapter.locator('.history-object img').first().getAttribute('src')).endsWith('.gif'));
    console.log(`${id}: plays once, disappears, stays hidden on restart; object GIF unchanged`);
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
