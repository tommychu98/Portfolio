const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://127.0.0.1:5173/#personal', { waitUntil: 'domcontentloaded' });
    await page.locator('#personal').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1800);
    await page.getByRole('button', { name: 'ZIPPO', exact: true }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'ZIPPO 상세 보기', exact: true }).click();
    const dialog = page.locator('#selected-work-detail');
    await page.waitForTimeout(1500);
    assert.equal(await dialog.locator('.feature-video').count(), 4);
    assert.equal(await dialog.locator('a[href*="figma.com"]').count(), 0);
    await page.screenshot({ path: `artifacts/zippo/detail-${viewport.width}.png` });
    const videos = [];
    for (const name of ['main', 'shop', 'cart', 'design']) {
      const video = dialog.locator(`#zippo-${name}-video`);
      await video.scrollIntoViewIfNeeded();
      await page.waitForFunction(id => {
        const v = document.getElementById(id);
        return v.readyState >= 2 && !v.paused && v.currentTime > 0;
      }, `zippo-${name}-video`, { timeout: 15000 });
      const state = await video.evaluate(v => ({ src: v.getAttribute('src'), duration: v.duration, loop: v.loop, muted: v.muted, width: v.videoWidth, height: v.videoHeight, error: v.error }));
      assert(state.loop && state.muted && !state.error);
      assert(state.src.includes(`zippo-${name}`));
      videos.push(state);
      await page.screenshot({ path: `artifacts/zippo/${name}-${viewport.width}.png` });
    }
    const overflow = await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1);
    assert.equal(overflow, false);
    await page.getByRole('button', { name: '프로젝트 상세 닫기' }).click();
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('dialog[open]').count(), 0);
    results.push({ viewport, videos, overflow, close: true });
    await page.close();
  }
  await writeFile('artifacts/zippo/verification.json', JSON.stringify(results, null, 2));
  console.log('Desktop/mobile: all 4 ZIPPO videos playing, muted, looping; no overflow; dialog closes.');
} finally { await browser.close(); }
