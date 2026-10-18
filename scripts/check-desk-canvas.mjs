import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {deskResearchLayers} from '../src/components/sections/PortfolioProcess/DeskResearch.data.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome'}),output='artifacts/diptyque-process/desk-canvas';
await mkdir(output,{recursive:true});
const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1800}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173');
 const section=page.locator('#zara-process'),root=page.locator('.diptyque-retro-window'),world=page.locator('.figma-canvas-world'),viewport=page.locator('.figma-canvas-viewport');
 await root.scrollIntoViewIfNeeded();await root.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));await page.waitForTimeout(1600);
 const snapshot=async name=>{await root.screenshot({path:`${output}/${name}.png`});};
 const uiGeometry=()=>root.evaluate(el=>[el,el.querySelector('.figma-workspace-ui'),el.querySelector('.diptyque-retro-window__frame')].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,x:e.getBoundingClientRect().x-el.getBoundingClientRect().x,y:e.getBoundingClientRect().y-el.getBoundingClientRect().y,transform:getComputedStyle(e).transform})));
 const fixed=await uiGeometry();
 const assertInside=async id=>{
  const v=await viewport.boundingBox();
  const frames=id?root.locator(`[data-desk-frame="${id}"]`):root.locator('[data-desk-frame]');
  for(const f of await frames.all()){const b=await f.boundingBox();assert.ok(b.x>=v.x-1&&b.y>=v.y-1&&b.x+b.width<=v.x+v.width+1&&b.y+b.height<=v.y+v.height+1,`Frame clipped ${id||'overview'}`);}
 };
 await assertInside();await snapshot('1440-overview');
 const first=root.locator('[data-desk-frame="brand-analysis"] button');
 await first.hover();await page.waitForTimeout(380);
 assert.ok(await first.locator('..').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a>1.03));
 assert.equal(await root.locator('.desk-canvas-caption strong').textContent(),'자사 분석');
 await snapshot('1440-hover');
 await first.click();await page.waitForTimeout(1150);await assertInside('brand-analysis');await snapshot('1440-focus-brand');
 assert.deepEqual(await uiGeometry(),fixed,'UI and frame must not move');
 let previous=await world.getAttribute('style');
 for(const layer of deskResearchLayers.slice(1)){
  await root.locator(`[data-desk-layer="${layer.id}"]`).click();
  await page.waitForTimeout(250);assert.notEqual(await world.getAttribute('style'),previous);
  assert.deepEqual(await uiGeometry(),fixed,'Fixed UI during motion');
  assert.equal(await root.locator('[data-desk-frame]').count(),3);
  await page.waitForTimeout(950);await assertInside(layer.id);await snapshot(`1440-focus-${layer.id}`);
  assert.equal(await root.locator(`[data-desk-layer="${layer.id}"]`).getAttribute('aria-pressed'),'true');
  previous=await world.getAttribute('style');
 }
 await root.locator('[data-desk-frame="user-research"] button').click();
 const dialog=page.locator('.research-reader');await dialog.locator('img').evaluate(i=>i.decode());
 assert.equal(await page.locator('a[href*="figma.com"]').count(),0,'No outbound Figma links, including the document reader');
 assert.equal(await dialog.locator('img').getAttribute('src'),deskResearchLayers[2].document.src);
 await dialog.getByRole('button',{name:'크게 보기',exact:true}).click();
 assert.ok(await dialog.locator('.research-reader__scroll').evaluate(e=>e.scrollWidth>e.clientWidth));
 await page.keyboard.press('Escape');assert.equal(await dialog.count(),0);
 await viewport.focus();await page.keyboard.press('Escape');await page.waitForTimeout(1450);await assertInside();
 assert.equal(await root.locator('.desk-layer-controls [aria-pressed="true"]').count(),0);
 await page.mouse.move(0,0);await snapshot('1440-return-overview');
 for(const width of [1024,390]){
  await page.setViewportSize({width,height:1600});await page.waitForTimeout(1450);
  await assertInside();await snapshot(`${width}-overview`);
  await root.locator('[data-desk-layer="market-research"]').click();await page.waitForTimeout(1150);await assertInside('market-research');await snapshot(`${width}-focus`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await root.getByRole('button',{name:'조사 자료 전체 보기'}).click();await page.waitForTimeout(1450);
  checks.push(`${width}: overview, focus, no overflow`);
 }
 await page.setViewportSize({width:1440,height:1800});
 await root.locator('[data-desk-layer="market-research"]').click();await page.waitForTimeout(1150);
 await page.setViewportSize({width:1024,height:1600});await page.waitForTimeout(1450);await assertInside('market-research');
 await root.evaluate(el=>{for(const id of ['brand-analysis','market-research','user-research'])el.querySelector(`[data-desk-layer="${id}"]`).click();});
 await page.waitForTimeout(1150);await assertInside('user-research');
 await page.emulateMedia({reducedMotion:'reduce'});
 await root.locator('[data-desk-layer="user-research"]').click();await page.waitForTimeout(50);await assertInside('user-research');
 await root.evaluate(el=>{for(const id of ['brand-analysis','market-research','user-research','brand-analysis'])el.querySelector(`[data-desk-layer="${id}"]`).click();});
 await page.waitForTimeout(100);assert.equal(await root.locator('[data-desk-layer="brand-analysis"]').getAttribute('aria-pressed'),'true');
 await section.locator('[data-step="1"]').click();await page.waitForTimeout(100);
 assert.equal(await section.locator('.figma-workspace').count(),1);
 await section.locator('[data-step="0"]').click();await page.waitForTimeout(100);await assertInside();
 assert.deepEqual(errors,[]);
 checks.push('1440: overview, hover, frame click, layers, continuous focus, fixed UI','full reader, zoom, ESC, overview reset','resize while focused, reduced motion, rapid clicks, chapter return');
 await writeFile(`${output}/verification.json`,JSON.stringify({checks,errors},null,2));console.log({checks,errors});
}finally{await browser.close();}
