import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { archiveSteps } from '../src/components/sections/ZaraProcess/DiptyqueProcess.data.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const output = 'artifacts/diptyque-process';
await mkdir(output, { recursive: true });
const errors = [], verified = [], originals = new Set();
const url = process.env.PREVIEW_URL || 'http://localhost:5173/';
const style = '.site-header,.skip-link{visibility:hidden!important}';
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1400);
  const root = page.locator('#zara-process');
  await root.scrollIntoViewIfNeeded(); await page.waitForTimeout(900);
  assert.equal(await root.locator('[data-step]').count(), 6);
  assert.equal(await root.locator('[data-track],.planning-board').count(), 0);
  assert.equal(await root.locator('img[src*=interview-answers]').count(), 0);
  await root.locator('.research-desk__stack').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  // Find an actually exposed part of a back sheet, then move the mouse onto it.
  const hoverPoint = await root.evaluate(element => {
    const sheets = [...element.querySelectorAll('.research-sheet:not(.is-active) button')];
    for (const sheet of sheets) {
      const rect = sheet.getBoundingClientRect();
      for (let y=Math.max(110,rect.top+10);y<Math.min(innerHeight-20,rect.bottom);y+=12)
        for (let x=rect.left+5;x<rect.right;x+=12)
          if (document.elementFromPoint(x,y)?.closest('[data-document]')===sheet) return {x,y,id:sheet.dataset.document};
    }
  });
  assert.ok(hoverPoint, 'At least one back document must be exposed');
  await page.mouse.move(hoverPoint.x,hoverPoint.y);
  await page.waitForTimeout(650);
  assert.equal(await root.locator('.research-sheet.is-active button').getAttribute('data-document'),hoverPoint.id);
  await page.waitForTimeout(600);
  assert.equal(await root.locator('.research-sheet.is-active button').getAttribute('data-document'),hoverPoint.id, 'Hover must not oscillate while pointer is still');
  await page.mouse.move(0,0);
  const unrelated = await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/src/motion/scroll.js');
    const own = document.querySelector('#zara-process');
    return ScrollTrigger.getAll().filter(item => !own.contains(item.trigger)).length;
  });
  for (const [i, step] of archiveSteps.entries()) {
    await root.locator('.research-archive__nav').scrollIntoViewIfNeeded(); await page.waitForTimeout(350);
    const before = await page.evaluate(() => scrollY);
    await root.locator(`[data-step="${i}"]`).click(); await page.waitForTimeout(1000);
    assert.equal(await root.locator('.research-archive__step-copy h3').textContent(), step.title);
    assert.equal(await root.locator('.research-archive__finding>p').textContent(), step.keyFinding);
    assert.ok(Math.abs(await page.evaluate(() => scrollY) - before) < 5, `Step navigation must not scroll the page: ${i} ${before} → ${await page.evaluate(() => scrollY)}`);
    if (step.held) { assert.equal(await root.locator('.research-sheet').count(), 0); continue; }
    for (const material of step.documents) {
      await root.locator('.research-desk__index button').filter({ hasText: material.label }).click();
      await page.waitForTimeout(550);
      assert.ok(await root.locator('.research-sheet').count() <= 3);
      const trigger = root.locator('.research-sheet.is-active button');
      assert.equal(await trigger.getAttribute('data-document'), material.id);
      if (material.kind !== 'summary') await trigger.locator('img').evaluate(image => image.decode());
      await trigger.click();
      const dialog = page.locator('.research-reader');
      assert.equal(await dialog.evaluate(element => element.open), true);
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      assert.equal(await dialog.locator('a').getAttribute('href'), material.source);
      if (material.kind === 'summary') assert.equal(await dialog.locator('dl>div').count(), 3);
      else {
        const image = dialog.locator('img'); await image.evaluate(element => element.decode());
        assert.deepEqual(await image.evaluate(element => [element.naturalWidth,element.naturalHeight]), [material.width,material.height]);
        await dialog.getByRole('button', { name: '크게 보기', exact: true }).click();
        assert.ok(await dialog.locator('.research-reader__scroll').evaluate(element => element.scrollWidth > element.clientWidth));
      }
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('.research-reader'));
      await page.waitForFunction(element => element === document.activeElement, await trigger.elementHandle());
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      originals.add(material.id);
    }
  }
  // Latest selection wins even while a previous timeline is still running.
  await root.locator('[data-step="0"]').click();
  for (const i of [4,1,3,2,4]) { await root.locator(`[data-step="${i}"]`).click(); await page.waitForTimeout(35); }
  await page.waitForTimeout(1100);
  assert.equal(await root.locator('.research-archive__step-copy h3').textContent(), 'UX Strategy & IA');
  assert.ok(await root.locator('[data-finding]').evaluate(element => Number(getComputedStyle(element).opacity) > .99));
  await root.locator('[data-step="4"]').focus();await page.keyboard.press('Home');await page.waitForTimeout(1000);
  assert.equal(await root.locator('[data-step="0"]').getAttribute('aria-current'), 'step');
  await page.mouse.move(0,0);
  for (const width of [1440,1024,768,390,320]) {
    await page.setViewportSize({ width, height:1000 });await root.scrollIntoViewIfNeeded();await page.waitForTimeout(650);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    await root.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await root.screenshot({ path: `${output}/archive-${width}.png`, style });
    if (width <= 700) assert.equal(await root.locator('.research-sheet:visible').count(),1);
  }
  await root.locator('[data-step="2"]').click();await page.waitForTimeout(1000);
  const notesBounds = await root.locator('.research-sheet__page--notes').evaluate(element => ({height:element.clientHeight,scroll:element.scrollHeight}));
  assert.ok(notesBounds.scroll <= notesBounds.height + 2, 'Interview summary must fit at 320px');
  await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/src/motion/scroll.js');
    const own = document.querySelector('#zara-process');
    for (const item of ScrollTrigger.getAll()) { if (own.contains(item.trigger) && item.pin) throw Error('Archive must not pin'); }
    return ScrollTrigger.getAll().filter(item => !own.contains(item.trigger)).length;
  });
  // Responsive behavior can change other sections' trigger counts; compare at original size.
  await page.setViewportSize({ width:1440,height:1000 });await page.waitForTimeout(500);
  const restored = await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/src/motion/scroll.js');
    return ScrollTrigger.getAll().filter(item => !document.querySelector('#zara-process').contains(item.trigger)).length;
  });
  assert.equal(restored,unrelated);
  verified.push('6 stages, rapid navigation, keyboard Home, 14 images + interview summary, zoom, Escape, focus return, no pin, other triggers preserved', '1440/1024/768/390/320px screenshots, no horizontal page overflow');
  await page.close();
  const mobile = await browser.newPage({ viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce' });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(url,{waitUntil:'domcontentloaded'});await mobile.waitForTimeout(1500);
  await mobile.locator('#zara-process [data-step="2"]').tap();await mobile.waitForTimeout(100);
  await mobile.getByRole('button',{name:'다음 자료',exact:true}).tap();
  await mobile.locator('.research-sheet.is-active button').tap();
  assert.equal(await mobile.locator('dialog.research-reader').evaluate(element => element.open),true);
  await mobile.getByRole('button',{name:'자료 상세 보기 닫기',exact:true}).tap();
  assert.equal(await mobile.locator('.research-reader').count(),0);
  verified.push('mobile touch: stage selection, document paging, open/close; reduced-motion enabled');
  await mobile.close();
  assert.deepEqual(errors,[]);
  const result={verified,originals:[...originals],runtimeErrors:errors};
  await writeFile(`${output}/archive-verification.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
} finally { await browser.close(); }
