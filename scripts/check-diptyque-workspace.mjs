import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {workspaceSteps} from '../src/components/sections/PortfolioProcess/Workspace.data.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const output='artifacts/diptyque-process/canvas-after';
await mkdir(output,{recursive:true});
const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
 const root=page.locator('#zara-process');
 await root.scrollIntoViewIfNeeded();await page.waitForTimeout(2200);
 const triggers=()=>page.evaluate(async()=>{const {ScrollTrigger}=await import('/src/motion/scroll.js');return ScrollTrigger.getAll().filter(t=>!document.querySelector('#zara-process').contains(t.trigger)).length;});
 const beforeTriggers=await triggers();
 for(const width of [1440,1024,390]){
  await page.setViewportSize({width,height:1000});
  for(const [index,step] of workspaceSteps.entries()){
   await root.locator(`[data-step="${index}"]`).click();await page.waitForTimeout(950);
   let frameHeight;
   for(const mode of ['research','result']){
    await root.locator(`#archive-tab-${mode}`).click();await page.waitForTimeout(950);
    assert.equal(await root.locator('[data-finding]>p').textContent(),step.keyFinding);
    assert.ok(await root.locator('[data-finding]').isVisible());
    assert.equal(await root.locator('[data-work-frame="selected"]').count(),1);
    const count=await root.locator('[data-document]').count();
    assert.equal(count,step.scene.frames.length);
    // Selecting does not shuffle source frame coordinates.
    const positions=await root.locator('[data-work-frame]').evaluateAll(es=>es.map(e=>[e.style.left,e.style.top,e.style.width]));
    assert.deepEqual(positions,step.scene.frames.map(e=>[`${e.position.x}px`,`${e.position.y}px`,`${e.position.w}px`]));
    await root.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${width}`);
    const info=await root.locator('.research-archive__description').evaluate(e=>({h:e.getBoundingClientRect().height,line:parseFloat(getComputedStyle(e).lineHeight)}));
    assert.ok(info.h<=info.line*2+1,`Description over 2 lines at ${width}/${step.id}: ${info.h/info.line}`);
    const height=await root.locator('[data-workspace]').evaluate(e=>e.getBoundingClientRect().height);
    if(frameHeight)assert.ok(Math.abs(height-frameHeight)<2,'Workspace jumps between tabs');
    frameHeight=height;
    await page.evaluate(()=>document.activeElement.blur());
    await root.screenshot({path:`${output}/${width}-${index+1}-${mode}.png`,style:'.site-header,.skip-link{visibility:hidden!important}'});
    if(width===1440 && mode==='research'){
     for(const [i,item] of step[mode].entries()){
      await root.locator('.workspace-layer-list button').nth(i).click();await page.waitForTimeout(950);
      const active=root.locator('[data-work-frame="selected"] [data-document]');
      assert.equal(await active.getAttribute('data-document'),item.id);
      await active.click();
      const dialog=page.locator('.research-reader');
      await dialog.locator('img').evaluate(image=>image.decode());
      assert.deepEqual(await dialog.locator('img').evaluate(e=>[e.naturalWidth,e.naturalHeight]),[item.width,item.height]);
      assert.equal(await dialog.locator('a').getAttribute('href'),item.source);
      await dialog.getByRole('button',{name:'크게 보기',exact:true}).click();
      assert.ok(await dialog.locator('.research-reader__scroll').evaluate(e=>e.scrollWidth>e.clientWidth));
      await page.keyboard.press('Escape');await page.waitForTimeout(100);
      assert.equal(await active.evaluate(e=>e===document.activeElement),true);
     }
    }
    checks.push(`${width}/${step.number}/${mode}`);
   }
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(600);
 assert.equal(await triggers(),beforeTriggers);
 await root.evaluate(e=>{for(const i of [1,3,5,2,0])e.querySelector(`[data-step="${i}"]`).click();});await page.waitForTimeout(1000);
 assert.equal(await root.locator('.research-archive__step-copy h3').textContent(),'Desk Research');
 await root.locator('#archive-tab-research').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(1000);
 assert.equal(await root.locator('#archive-tab-result').getAttribute('aria-selected'),'true');
 const plane=root.locator('.workspace-plane');
 const pose=()=>plane.evaluate(e=>getComputedStyle(e).transform);
 const originalPose=await pose();
 await root.getByRole('button',{name:'캔버스 확대',exact:true}).click();await page.waitForTimeout(750);
 assert.notEqual(await pose(),originalPose,'Zoom must change the camera');
 await root.getByRole('button',{name:'전체',exact:true}).click();await page.waitForTimeout(750);
 const canvas=root.locator('.workspace-canvas');await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
 const box=await canvas.boundingBox(),beforeDrag=await pose();
 await page.mouse.move(box.x+12,box.y+12);await page.mouse.down();await page.mouse.move(box.x+95,box.y+65,{steps:6});await page.mouse.up();
 await page.waitForTimeout(100);
 assert.notEqual(await pose(),beforeDrag,'Drag must pan the camera');
 await canvas.focus();const beforeKey=await pose();await page.keyboard.press('ArrowRight');await page.waitForTimeout(750);
 assert.notEqual(await pose(),beforeKey,'Keyboard must pan the camera');
 await page.emulateMedia({reducedMotion:'reduce'});
 await root.locator('[data-step="5"]').click();await root.locator('#archive-tab-result').click();
 assert.equal(await root.locator('[data-work-frame="selected"] [data-document]').getAttribute('data-document'),'wire-history');
 assert.equal(await root.locator('[data-work-cursor]').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 assert.deepEqual(errors,[]);
 await writeFile(`${output}/verification.json`,JSON.stringify({checks,errors},null,2));
 console.log({states:checks.length,errors,verified:'all layers, original pixels, zoom, ESC, focus, keyboard tabs, rapid steps, reduced motion, fixed workspace height, descriptions <=2 lines, other triggers preserved'});
}finally{await browser.close();}
