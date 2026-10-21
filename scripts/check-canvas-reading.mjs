import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const out='artifacts/canvas-reading';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),checks=[],errors=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  page.on('pageerror',error=>{if(!/youtube|isExternalMethodAvailable/.test(error.stack||error.message))errors.push(error.message);});
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('.preloader').waitFor({state:'hidden'});
  const root=page.locator('.desk-canvas-interface'),view=root.locator('.figma-canvas-viewport');
  const settled=()=>page.waitForFunction(()=>{
    const el=document.querySelector('.desk-canvas-interface');
    return el?.dataset.backgroundReady==='true'&&el.dataset.cameraMoving==='false';
  });
  const geometry=()=>view.evaluate(el=>{
    const frame=el.querySelector('.is-selected'),v=el.getBoundingClientRect(),f=frame?.getBoundingClientRect();
    return f?{top:f.top-v.top,bottom:f.bottom-v.top,left:f.left-v.left,right:f.right-v.left,height:f.height,vh:v.height,vw:v.width}:null;
  });
  const wheel=deltaY=>view.evaluate((el,deltaY)=>el.dispatchEvent(new WheelEvent('wheel',{deltaY,bubbles:true,cancelable:true})),deltaY);
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1100});
    for(let chapter=0;chapter<(width===1440?6:1);chapter++){
      await page.locator(`[data-step="${chapter}"]`).click();
      await page.waitForTimeout(1000);await view.scrollIntoViewIfNeeded();await settled();
      const ids=await root.locator('[data-desk-layer]').evaluateAll(nodes=>nodes.map(el=>el.dataset.deskLayer));
      for(const id of ids){
        await root.locator(`[data-desk-layer="${id}"]`).click();await settled();
        const g=await geometry();
        assert.ok(g.left>=-1&&g.right<=g.vw+1,`${id}: width fits viewport`);
        assert.ok(g.top>=-1,`${id}: document starts above viewport`);
        if(g.height>g.vh-46){
          assert.ok(g.top<35,`${id}: long document must start at top`);
          const scroll=await page.evaluate(()=>scrollY);
          const rect=await view.boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
          await page.mouse.wheel(0,100);await page.waitForTimeout(80);
          const down=await geometry();assert.ok(down.top<g.top-5,`${id}: wheel reads downward`);
          assert.ok(Math.abs(await page.evaluate(()=>scrollY)-scroll)<2,'Reading must not scroll portfolio');
          await wheel(-100000);assert.ok((await geometry()).top>=-1,'Up stops at document start');
          await wheel(100000);const end=await geometry();
          assert.ok(end.bottom<=end.vh&&end.bottom>=end.vh-35,'Down stops at document end');
          await wheel(40);assert.ok(await geometry(),'Momentum at bottom must not dismiss document');
          await page.waitForTimeout(210);await wheel(60);await settled();
          assert.equal(await geometry(),null,'Fresh downward gesture at end returns to overview');
        }else{
          assert.ok(g.bottom<=g.vh+1,`${id}: short document fits`);
          await wheel(100);await settled();assert.equal(await geometry(),null);
        }
        checks.push({width,chapter,id});console.log(JSON.stringify({passed:id,width,chapter}));
      }
      await root.locator('[data-desk-layer]').first().click();await settled();
      await root.screenshot({path:`${out}/${width}-${chapter}-top.png`});
      await view.focus();await page.keyboard.press('Escape');await settled();
    }
  }
  assert.equal(await page.locator('a[href*="figma.com"]').count(),0);
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/verification.json`,JSON.stringify({checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors}));
}finally{await browser.close();}
