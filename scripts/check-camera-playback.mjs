import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.CAPTURE_DIR||'artifacts/diptyque-process/motion-fixed';await mkdir(output,{recursive:true});
const url=process.env.TEST_URL||'http://127.0.0.1:5173';
const browser=await chromium.launch({channel:'chrome'}),results=[];
try {
 for(const reducedMotion of ['no-preference','reduce']){
  const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(url);await page.locator('.preloader').waitFor({state:'hidden'});
  const root=page.locator('.diptyque-retro-window');await root.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.desk-canvas-interface')?.dataset.backgroundReady==='true');
  const flights=[];
  for(const [id,name] of [['brand-analysis','zoom-in'],['market-research','brand-to-market'],['user-research','market-to-user'],['brand-analysis','user-to-brand'],[null,'zoom-out']]){
   const frames=await root.evaluate((el,id)=>new Promise((resolve,reject)=>{
    const world=el.querySelector('.figma-canvas-world'),ui=el.querySelector('.desk-canvas-interface'),start=performance.now(),samples=[];
    const snapshot=t=>{const matrix=new DOMMatrix(getComputedStyle(world).transform);samples.push({t:t-start,x:matrix.e,y:matrix.f,scale:matrix.a,transform:world.style.transform});};
    snapshot(start);el.querySelector(id?`[data-desk-layer="${id}"]`:'.desk-canvas-tools button').click();
    const timer=setTimeout(()=>reject(new Error('Camera did not finish')),8000);
    const tick=t=>{snapshot(t);if(ui.dataset.cameraMoving==='false'){clearTimeout(timer);resolve(samples);}else requestAnimationFrame(tick);};requestAnimationFrame(tick);
   }),id);
   const distinct=new Set(frames.map(f=>f.transform)).size,maxGap=Math.max(...frames.slice(1).map((f,i)=>f.t-frames[i].t));
   assert.ok(distinct>=25,`${reducedMotion} ${name}: missing visible intermediate camera frames (${distinct})`);
   assert.ok(maxGap<180,`${reducedMotion} ${name}: freeze ${maxGap}ms`);
   assert.ok(frames.at(-1).t>=900,`${name}: instant transition`);
   const scaleRange=Math.max(...frames.map(f=>f.scale))-Math.min(...frames.map(f=>f.scale));assert.ok(scaleRange>.01,`${name}: zoom missing`);
   flights.push({name,distinct,maxGap,duration:frames.at(-1).t,frames});
  }
  await root.screenshot({path:`${output}/${reducedMotion}-overview.png`});
  await root.locator('[data-desk-layer="brand-analysis"]').click();await page.waitForFunction(()=>document.querySelector('.desk-canvas-interface').dataset.cameraMoving==='false');
  await root.screenshot({path:`${output}/${reducedMotion}-focus.png`});
  const requested=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/window/figma-workspace')).map(r=>r.name));
  assert.ok(requested.some(r=>r.includes('figma-workspace-preview.png')));assert.ok(!requested.some(r=>r.endsWith('/figma-workspace.png')));
  assert.deepEqual(errors,[]);results.push({reducedMotion,errors,requested,flights});console.log(JSON.stringify({reducedMotion,flights:flights.map(({frames:_frames,...rest})=>rest),errors}));
  await context.close();
 }
 await writeFile(`${output}/verification.json`,JSON.stringify({url,videoRecordingDuringPerformanceTest:false,results},null,2));
}finally{await browser.close();}
