import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
const output='artifacts/diptyque-process/desk-canvas';
const context=await browser.newContext({viewport:{width:1440,height:1100},recordVideo:{dir:output,size:{width:1440,height:1100}}});
const page=await context.newPage(),checks=[];
try{
 await page.goto('http://127.0.0.1:5173');
 const root=page.locator('.diptyque-retro-window');
 await root.scrollIntoViewIfNeeded();await root.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));await page.waitForTimeout(1400);
 const click=async id=>root.locator(`[data-desk-layer="${id}"]`).click();
 const interrupt=async id=>{
  const delta=await root.evaluate((el,id)=>{
   const world=el.querySelector('.figma-canvas-world');
   const before=getComputedStyle(world).transform;
   el.querySelector(id?`[data-desk-layer="${id}"]`:'.desk-canvas-tools button').click();
   const after=getComputedStyle(world).transform;
   return {before,after};
  },id);
  assert.equal(delta.before,delta.after,'Retarget must not synchronously reset camera');
 };
 await click('brand-analysis');await page.waitForTimeout(350);await interrupt('market-research');await page.waitForTimeout(1400);
 checks.push('Focus interrupted by another layer: no transform reset');
 await click('user-research');await page.waitForTimeout(350);await interrupt(null);await page.waitForTimeout(1500);
 checks.push('Focus interrupted by overview: no transform reset');
 await click('brand-analysis');await page.waitForTimeout(1400);await interrupt(null);await page.waitForTimeout(450);await interrupt('user-research');await page.waitForTimeout(1400);
 checks.push('Overview interrupted by focus: continuous retarget');
 const labelSize=await root.locator('[data-desk-frame="user-research"] .desk-frame__name>span').evaluate(el=>el.getBoundingClientRect().height);
 assert.ok(Math.abs(labelSize-18)<.2,'Label should remain 12px / 18px at camera zoom');
 assert.equal(await root.locator('.figma-canvas-world').evaluate(e=>e.style.willChange),'auto');
 await root.screenshot({path:`${output}/after-refinement-focus.png`});
 await interrupt(null);await page.waitForTimeout(1500);await root.screenshot({path:`${output}/after-refinement-overview.png`});
 await click('market-research');await page.waitForTimeout(300);await page.setViewportSize({width:1024,height:1000});await page.waitForTimeout(1400);
 const inside=await root.evaluate(el=>{const v=el.querySelector('.figma-canvas-viewport').getBoundingClientRect(),f=el.querySelector('[data-desk-frame="market-research"]').getBoundingClientRect();return f.left>=v.left&&f.right<=v.right&&f.top>=v.top&&f.bottom<=v.bottom;});
 assert.ok(inside);checks.push('Resize during focus: final frame inside viewport','Label remains 12px; temporary GPU hint cleared');
 await writeFile(`${output}/motion-verification.json`,JSON.stringify({checks},null,2));
 console.log(checks);
}finally{await context.close();await page.video().saveAs(`${output}/motion-refinement.webm`);await browser.close();}
