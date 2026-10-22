const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const base = 'https://project-zippo-wine.vercel.app';
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
await Promise.all(['artifacts/zippo/raw', 'public/media/images/zippo', 'public/videos'].map(path => mkdir(path, { recursive: true })));
const browser = await chromium.launch({ channel: 'chrome' });
const evidence = JSON.parse(await readFile('artifacts/zippo/capture-manifest.json', 'utf8').catch(() => '[]'));
const pause = (page, ms = 1200) => page.waitForTimeout(ms);
async function scroll(page, y) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'smooth' }), y);
  await pause(page, 1700);
}
async function capture(name, route, prepare, action) {
  if (process.argv[2] && !process.argv[2].split(',').includes(name)) return;
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: 'artifacts/zippo/raw', size: { width: 1920, height: 1080 } } });
  const page = await context.newPage();
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('.hero-background img').waitFor();
  await pause(page, 2200);
  if (route === '/shop') {
    await page.getByRole('link', { name: 'SHOP', exact: true }).first().click();
    await page.locator('.shop-card-art').first().waitFor();
  }
  await pause(page);
  if (prepare) await prepare(page);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < innerHeight;
    }).map(img => img.decode().catch(() => {})));
  });
  const started = Date.now();
  await pause(page, 650);
  await action(page);
  await pause(page, 1400);
  const duration = (Date.now() - started) / 1000;
  const video = page.video();
  await context.close();
  const raw = await video.path();
  const probe = spawnSync(ffmpeg, ['-i', raw], { encoding: 'utf8' });
  const match = probe.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!match) throw new Error(probe.stderr);
  const total = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  const output = `public/videos/zippo-${name}.webm`;
  const result = spawnSync(ffmpeg, ['-y', '-ss', String(Math.max(0, total - duration)), '-i', raw, '-t', String(duration), '-vf', 'scale=1280:720', '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32', '-deadline', 'realtime', '-cpu-used', '8', '-threads', '4', output], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
  const old = evidence.findIndex(item => item.name === name);
  if (old >= 0) evidence.splice(old, 1);
  evidence.push({ name, source: base + route, raw, output, duration, recordedAt: new Date().toISOString() });
  await writeFile('artifacts/zippo/capture-manifest.json', JSON.stringify(evidence, null, 2));
  console.log(`Recorded ${name}: ${duration.toFixed(1)}s`);
}
try {
  await capture('main', '/', null, async page => {
    await page.screenshot({ path: 'public/videos/zippo-main-poster.jpg', type: 'jpeg', quality: 88 });
    await page.screenshot({ path: 'public/media/images/zippo/hero.jpg', type: 'jpeg', quality: 92 });
    await page.locator('.scroll-cue').click();
    await pause(page, 1800);
    await page.getByRole('tab', { name: 'EMBLEM', exact: true }).click();
    await pause(page, 1500);
    await page.getByRole('tab', { name: 'LIMITED', exact: true }).click();
    await pause(page, 1500);
    await scroll(page, 0);
  });
  await capture('shop', '/shop', page => scroll(page, 330), async page => {
    await page.screenshot({ path: 'public/videos/zippo-shop-poster.jpg', type: 'jpeg', quality: 88 });
    await page.locator('.shop-card-art').first().hover();
    await pause(page, 1700);
    await page.locator('.shop-sidebar a[href="/shop?category=custom"]').click();
    await pause(page, 1500);
    await scroll(page, 330);
    await page.getByLabel('상품 정렬').selectOption('low');
    await pause(page, 1500);
    await page.locator('.shop-card-art').nth(1).hover();
    await pause(page, 1700);
    await page.locator('.shop-sidebar a[href="/shop?category=new"]').click();
    await pause(page);
    await scroll(page, 330);
  });
  await capture('cart', '/shop', async page => {
    await page.locator('.shop-card-link').first().click();
    await pause(page);
  }, async page => {
    await page.locator('.product-add').click();
    await pause(page, 1300);
    await page.screenshot({ path: 'public/videos/zippo-cart-poster.jpg', type: 'jpeg', quality: 88 });
    await page.locator('.cart-dialog').getByRole('button', { name: /수량 늘리기/ }).first().click();
    await pause(page);
    await page.locator('.cart-recommendation').first().click();
    await pause(page, 1500);
    await page.locator('.cart-dialog').getByRole('button', { name: /수량 줄이기/ }).first().click();
    await pause(page);
    await page.locator('.cart-delete').last().click();
    await pause(page);
    await page.getByRole('button', { name: '장바구니 닫기' }).click();
    await pause(page);
  });
  await capture('design', '/', async page => {
    const y = await page.locator('#story').evaluate(el => el.offsetTop);
    await scroll(page, y - 200);
  }, async page => {
    const y = await page.locator('#story').evaluate(el => el.offsetTop);
    await scroll(page, y);
    await page.screenshot({ path: 'public/videos/zippo-design-poster.jpg', type: 'jpeg', quality: 88 });
    await page.screenshot({ path: 'public/media/images/zippo/story.jpg', type: 'jpeg', quality: 92 });
    await pause(page, 1600);
    await scroll(page, y + 430);
    await pause(page, 1800);
    await scroll(page, y);
    await pause(page, 1600);
  });
  await writeFile('artifacts/zippo/capture-manifest.json', JSON.stringify(evidence, null, 2));
} finally { await browser.close(); }
