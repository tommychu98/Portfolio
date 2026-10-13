import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('artifacts/diptyque-process', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.evaluate(() => document.fonts.ready);
const root = page.locator('#zara-process');
assert.match(await root.innerText(), /DIPTYQUE \/ UX PLANNING PROCESS/);
assert.doesNotMatch(await root.innerText(), /ZARA|Lean Canvas|Requirements/);
assert.equal(await root.locator('[data-panel]').count(), 7);
async function panel(index) {
  await page.evaluate(async index => {
    const { ScrollTrigger, scrollToPosition } = await import('/src/motion/scroll.js');
    ScrollTrigger.refresh();
    const trigger = ScrollTrigger.getAll().find(t => t.trigger.id === 'zara-process' && t.vars.pin);
    const fraction = index / 6;
    scrollToPosition(trigger.start + (trigger.end - trigger.start) * fraction, true);
    trigger.animation.progress(fraction); ScrollTrigger.update();
  }, index);
  await page.waitForTimeout(650);
}
for (const size of [{ width:1440,height:1000 }, { width:1366,height:768 }]) {
  await page.setViewportSize(size);
  for (let i = 0; i < 7; i++) {
    await panel(i);
    const current = root.locator('[data-panel]').nth(i);
    const copy = current.locator(i === 0 ? '.zara-process__intro' : '.zara-process__copy');
    const bounds = await copy.boundingBox();
    assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= size.height, 'Copy clipped: ' + size.height + '/' + i + JSON.stringify(bounds));
    assert.ok(await current.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)));
    await page.screenshot({ path: `artifacts/diptyque-process/${size.width}-${i}.png` });
  }
}
await panel(3);
const target = root.locator('.zara-process__step').nth(2);
await target.getByRole('button', { name: '주요 퍼소나 · 박지은', exact:true }).click();
assert.match(await target.locator('.zara-process__preview img').getAttribute('src'), /persona.png/);
await target.locator('.zara-process__preview').click();
assert.ok(await root.locator('dialog').evaluate(el => el.open));
await page.keyboard.press('Escape');
assert.equal(await root.locator('dialog').evaluate(el => el.open), false);
assert.ok(await target.locator('.zara-process__preview').evaluate(el => el === document.activeElement));
await root.locator('[data-next]').click();
await page.waitForTimeout(600);
assert.match(await root.locator('[data-count]').innerText(), /05 \/ 07/);
for (const width of [390, 768]) {
  await page.setViewportSize({width,height:844});
  await page.waitForTimeout(500);
  assert.equal(await root.evaluate(el => el.classList.contains('has-horizontal')), false);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  for(let i=0;i<7;i++) {
    const current=root.locator('[data-panel]').nth(i);
    await current.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await current.screenshot({path:`artifacts/diptyque-process/mobile-${width}-${i}.png`});
  }
}
assert.deepEqual(errors, []);
console.log('PASS: 7 panels, 1440/1366/768/390 layouts, assets, no ZARA content, tabs, modal, Escape/focus restoration, next navigation, no runtime errors.');
await browser.close();
