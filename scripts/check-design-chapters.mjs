import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'artifacts/design-chapters';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [1440, 390, 1024]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1024 ? 768 : 900 } });
    const errors = [], externalErrors = [];
    page.on('pageerror', e => {
      if (e.message === 'this.api.isExternalMethodAvailable is not a function' && /youtube\.com/.test(e.stack || '')) externalErrors.push({ message: e.message, stack: e.stack });
      else errors.push(e.message);
    });
    await page.goto('http://127.0.0.1:5173');
    await page.waitForTimeout(4500);
    const move = async y => {
      await page.evaluate(async y => (await import('/src/motion/scroll.js')).scrollToPosition(y, true), y);
      await page.waitForTimeout(1600);
    };
    const state = await page.evaluate(async () => {
      const { ScrollTrigger } = await import('/src/motion/scroll.js');
      const root = document.querySelector('#zara-details');
      const pin = ScrollTrigger.getAll().filter(t => t.trigger === root && t.pin);
      return { start: pin[0]?.start, end: pin[0]?.end, pins: pin.length, top: root.getBoundingClientRect().top + scrollY };
    });
    assert.equal(state.pins, width >= 1024 ? 1 : 0);
    const panels = page.locator('#zara-details [data-panel]');
    assert.equal(await panels.count(), 4);
    assert.match(await page.locator('#zara-details .section-label').innerText(), /07/);
    const parts = [];
    for (let i = 0; i < 4; i++) {
      const panel = panels.nth(i);
      if (width >= 1024) {
        if (i === 0) await move(state.start + 1);
        else { await page.locator('#zara-details [data-next]').click(); await page.waitForTimeout(1600); }
      } else await move(await panel.evaluate(n => n.getBoundingClientRect().top + scrollY - 100));
      assert.equal(await panel.locator('h3').getAttribute('data-text-revealed'), 'true');
      assert.equal(await panel.locator('.text-motion-line-mask').count(), 0);
      const geometry = await panel.evaluate(n => {
        const header = n.querySelector('.zara-details__boundary').getBoundingClientRect();
        const title = n.querySelector('h3').getBoundingClientRect();
        const copy = n.querySelector('.zara-details__copy').getBoundingClientRect();
        const visual = n.lastElementChild.getBoundingClientRect();
        return { title: n.querySelector('h3').textContent, header: header.toJSON(), heading: title.toJSON(), copy: copy.toJSON(), visual: visual.toJSON() };
      });
      assert(geometry.heading.left >= -1 && geometry.heading.right <= width + 1);
      if (width >= 1024) {
        assert(geometry.header.top >= 90);
        assert(geometry.copy.bottom <= (width === 1024 ? 768 : 900), 'Copy stays inside pinned viewport');
        assert(geometry.visual.bottom <= (width === 1024 ? 768 : 900), 'Visual stays inside pinned viewport');
      }
      await page.screenshot({ path: `${out}/${width}-part-${i + 1}.png` });
      parts.push(geometry);
    }
    if (width >= 1024) {
      await page.locator('.diptyque-work-folder').hover();
      await page.waitForTimeout(1100);
      assert(await page.locator('.diptyque-work-folder').evaluate(n => n.classList.contains('is-open')));
      await page.locator('[data-work-card]').first().click();
      assert(await page.locator('.diptyque-work-folder__dialog').evaluate(n => n.open));
      await page.locator('.diptyque-work-folder__close').click();
      assert.equal(await page.locator('.diptyque-work-folder__dialog').evaluate(n => n.open), false);
      await move(state.start + (state.end - state.start) * 2 / 3);
      await page.locator('.diptyque-project-list__row').first().hover();
      await page.waitForTimeout(900);
      assert(await page.locator('[data-title-color]').first().evaluate(async n => {
        const { gsap } = await import('/src/motion/scroll.js');
        return Math.abs(+gsap.getProperty(n, 'yPercent')) < 1;
      }));
      await move(state.start);
      await move(state.end);
      await move(state.start);
      assert.equal(await page.locator('#zara-details .text-motion-line-mask').count(), 0);
    }
    await move(await page.locator('#zara-process').evaluate(n => n.getBoundingClientRect().top + scrollY - 100));
    assert(await page.locator('#process-title').isVisible());
    if (width === 1440) {
      for (const resized of [390, 1440]) {
        await page.setViewportSize({ width: resized, height: 900 });
        await page.waitForTimeout(1200);
        assert.equal(await page.locator('#zara-details .text-motion-line-mask').count(), 0);
        assert.equal(await page.evaluate(async () => {
          const { ScrollTrigger } = await import('/src/motion/scroll.js');
          return ScrollTrigger.getAll().filter(t => t.trigger?.id === 'zara-details' && t.pin).length;
        }), resized === 1440 ? 1 : 0);
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('#zara-details .text-motion-line-mask').count(), 0);
    assert.deepEqual(errors, []);
    results.push({ width, pins: state.pins, parts, errors, externalErrors });
    await page.close();
  }
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(results.map(({ width, pins, errors }) => ({ width, pins, errors, parts: 4 })));
} finally { await browser.close(); }
