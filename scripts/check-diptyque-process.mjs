import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { archiveSteps } from '../src/components/sections/PortfolioProcess/DiptyqueProcess.data.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const output = 'artifacts/diptyque-process';
await mkdir(output, { recursive: true });
const errors = [], checked = [];
const page = await browser.newPage({ viewport: { width:1440,height:1000 } });
page.on('pageerror', error => errors.push(error.message));
const settle = () => page.waitForTimeout(950);
const triggerCount = () => page.evaluate(async () => {
  const { ScrollTrigger } = await import('/src/motion/scroll.js');
  const root = document.querySelector('#zara-process');
  for (const trigger of ScrollTrigger.getAll()) {
    if (root.contains(trigger.trigger) && trigger.pin) throw Error('Archive pins the page');
  }
  return ScrollTrigger.getAll().filter(trigger => !root.contains(trigger.trigger)).length;
});
try {
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:5173/', { waitUntil:'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const root = page.locator('#zara-process');
  await root.scrollIntoViewIfNeeded(); await settle();
  const before = await triggerCount();
  const tab = mode => root.getByRole('tab', {name:mode, exact:true});
  for (const [index, step] of archiveSteps.entries()) {
    await root.locator(`[data-step="${index}"]`).click(); await settle();
    assert.equal(await root.locator('.research-archive__step-copy h3').textContent(), step.title);
    if (step.held) { assert.equal(await root.locator('img').count(),0); continue; }
    for (const mode of ['RESEARCH','RESULT']) {
      await tab(mode).click(); await settle();
      assert.equal(await tab(mode).getAttribute('aria-selected'),'true');
      assert.equal(await root.locator('[data-finding]').isVisible(),mode==='RESULT');
      assert.equal(await root.locator('[data-finding]>p').textContent(),step.keyFinding);
      const count = await root.locator('.research-cut__pages button').count();
      for (let item=0;item<Math.max(1,count);item++) {
        if (count) { await root.locator('.research-cut__pages button').nth(item).click(); await settle(); }
        const image = root.locator('.research-cut__image img');
        if (!await image.count()) { assert.equal(step.id,'strategy'); assert.equal(mode,'RESEARCH'); continue; }
        assert.equal(await root.locator('img').count(),1);
        await image.evaluate(element => element.decode());
        const id = await root.locator('[data-document]').getAttribute('data-document');
        checked.push(id);
        const material = step.documents.find(doc => doc.id===id);
        assert.deepEqual(await image.evaluate(element=>[element.naturalWidth,element.naturalHeight]),[material.width,material.height]);
        await root.locator('[data-document]').click();
        const dialog=page.locator('.research-reader');
        assert.equal(await dialog.evaluate(element=>element.open),true);
        await dialog.getByRole('button',{name:'크게 보기',exact:true}).click();
        assert.ok(await dialog.locator('.research-reader__scroll').evaluate(element=>element.scrollWidth>element.clientWidth));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.research-reader').count(),0);
        assert.equal(await root.locator('[data-document]').evaluate(element=>element===document.activeElement),true);
      }
      if (index===0) {
        if (count) { await root.locator('.research-cut__pages button').first().click(); await settle(); }
        await root.locator('img').evaluate(element=>element.decode());
        await page.evaluate(()=>document.activeElement.blur());
        await root.screenshot({path:`${output}/cut-desktop-${mode.toLowerCase()}.png`, style:'.site-header,.skip-link{visibility:hidden!important}'});
      }
    }
    if (index===2) {
      await tab('RESEARCH').click(); await settle();
      await root.locator('.research-cut__summary').click();
      assert.equal(await page.locator('.research-reader dl>div').count(),3);
      await page.keyboard.press('Escape');
    }
  }
  await root.evaluate(element => { for (const i of [4,1,3,2,0]) element.querySelector(`[data-step="${i}"]`).click(); });
  await settle();
  assert.equal(await root.locator('h3').textContent(),'Desk Research');
  await root.evaluate(element => { for(const mode of ['result','research','result']) element.querySelector(`#archive-tab-${mode}`).click(); });
  await settle();
  assert.equal(await tab('RESULT').getAttribute('aria-selected'),'true');
  assert.ok(await root.locator('[data-finding]').evaluate(element=>Number(getComputedStyle(element).opacity)>.99));
  await tab('RESULT').focus(); await page.keyboard.press('ArrowLeft'); await settle();
  assert.equal(await tab('RESEARCH').getAttribute('aria-selected'),'true');
  assert.equal(before,await triggerCount());
  for (const width of [1024,768,390,320]) {
    await page.setViewportSize({width,height:1000}); await settle();
    await tab('RESULT').click(); await settle();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
    await page.evaluate(()=>document.activeElement.blur());
    await root.screenshot({path:`${output}/cut-${width}.png`, style:'.site-header,.skip-link{visibility:hidden!important}'});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await root.locator('[data-step="1"]').click();
  await tab('RESULT').click();
  assert.equal(await root.locator('.research-archive__step-copy h3').textContent(),'Competitive Analysis');
  assert.equal(await tab('RESULT').getAttribute('aria-selected'),'true');
  assert.ok(await root.locator('[data-finding]').evaluate(element=>Number(getComputedStyle(element).opacity)>.99));
  assert.deepEqual(errors,[]);
  const result={images:[...new Set(checked)],runtimeErrors:errors,checks:'6 stages; both tabs; every image; zoom/Escape/focus; summary; rapid input; tab keyboard; reduced motion; other ScrollTriggers preserved; 1440/1024/768/390/320px'};
  await writeFile(`${output}/cut-verification.json`,JSON.stringify(result,null,2));
  console.log(result);
} finally { await browser.close(); }
