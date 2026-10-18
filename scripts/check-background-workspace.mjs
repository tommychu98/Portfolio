import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {deskResearchLayers} from '../src/components/sections/PortfolioProcess/DeskResearch.data.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.CAPTURE_DIR||'artifacts/diptyque-process/background-restoration';
await mkdir(output,{recursive:true});
const source=JSON.parse(await readFile('artifacts/diptyque-process/background-restoration/figma-node-geometry.json','utf8'));
const browser=await chromium.launch({channel:'chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1100},recordVideo:{dir:output,size:{width:1440,height:1100}}});
// Exercise predecode with cold, deliberately delayed background requests.
await context.route('**/desk-canvas/background/**',async route=>{await new Promise(resolve=>setTimeout(resolve,80));await route.continue();});
const page=await context.newPage(),errors=[],checks=[],motions=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const url=process.env.TEST_URL||'http://127.0.0.1:5174';
try {
 await page.goto(url);await page.locator('.preloader').waitFor({state:'hidden'});
 const root=page.locator('.diptyque-retro-window');await root.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('.desk-canvas-interface')?.dataset.backgroundReady==='true');
 await root.locator('img[src]').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 const settle=()=>page.waitForFunction(()=>document.querySelector('.desk-canvas-interface')?.dataset.cameraMoving==='false');
 const click=id=>id?root.locator(`[data-desk-layer="${id}"]`).click():root.getByRole('button',{name:'조사 자료 전체 보기'}).click();
 const shot=name=>root.screenshot({path:`${output}/${name}.png`});
 const fixedGeometry=()=>root.evaluate(el=>[el,el.querySelector('.figma-workspace-ui'),el.querySelector('.diptyque-retro-window__frame')].map(e=>{const r=e.getBoundingClientRect(),p=el.getBoundingClientRect();return {w:r.width,h:r.height,x:r.x-p.x,y:r.y-p.y,transform:getComputedStyle(e).transform};}));
 const fixed=await fixedGeometry();
 assert.equal(await root.locator('[data-background-frame] .desk-frame__name').count(),0);
 assert.equal(await root.locator('[data-desk-frame] .desk-frame__name').count(),3);
 const framing=await root.evaluate(el=>{const v=el.querySelector('.figma-canvas-viewport').getBoundingClientRect(),boxes=[...el.querySelectorAll('[data-desk-frame]')].map(f=>f.getBoundingClientRect());return {coverage:(Math.max(...boxes.map(b=>b.bottom))-Math.min(...boxes.map(b=>b.top)))/v.height,inside:boxes.every(b=>b.top>=v.top&&b.bottom<=v.bottom&&b.left>=v.left&&b.right<=v.right)};});
 assert.ok(framing.coverage>.8&&framing.inside,'Overview should closely frame all three Desk Research sources');
 checks.push('Background titles hidden; three primary labels retained; close overview fits all primary sources');
 const geometry=await root.locator('[data-figma-node]').evaluateAll(fs=>fs.map(f=>({id:f.dataset.figmaNode,x:parseFloat(f.style.left),y:parseFloat(f.style.top),width:parseFloat(f.style.width),height:parseFloat(f.style.height),sameWorld:f.parentElement.classList.contains('figma-canvas-world')})));
 assert.equal(geometry.length,40);assert.equal(new Set(geometry.map(f=>f.id)).size,40);
 const primaryIds=deskResearchLayers.map(f=>f.figmaNodeId);
 const expected=[...source.page.filter(n=>n.id!=='251:316'),...source.research];
 for(const frame of geometry){
  const n=expected.find(n=>n.id===frame.id);assert.ok(n,`Unverified node ${frame.id}`);
  for(const [key,value] of Object.entries({x:n.box.x-8981,y:n.box.y-3306,width:n.box.width,height:n.box.height}))assert.ok(Math.abs(frame[key]-value)<.001,`${frame.id} ${key}`);
  assert.ok(frame.sameWorld);
 }
 checks.push('40 unique source nodes: exact page/local bounds and one world; no fabricated frames');
 const styles=await root.locator('[data-figma-node]').evaluateAll(fs=>fs.map(f=>{const s=getComputedStyle(f),i=getComputedStyle(f.querySelector('img'));return {id:f.dataset.figmaNode,filter:s.filter==='none'?i.filter:s.filter,opacity:Number(s.opacity)*Number(i.opacity)};}));
 for(const s of styles){if(primaryIds.includes(s.id)){assert.equal(s.filter,'none');assert.equal(s.opacity,1);}else{assert.match(s.filter,/grayscale\(1\).*brightness\(0.82\)/);assert.equal(s.opacity,.65);}}
 assert.equal(await root.locator('.figma-canvas-world').evaluate(e=>getComputedStyle(e).filter),'none');
 checks.push('Only background assets have grayscale(1), brightness(.82), opacity(.65); primary assets unchanged');
 const resources=await root.locator('[data-background-frame] img').evaluateAll(imgs=>({loaded:imgs.filter(i=>i.hasAttribute('src')).length,deferred:imgs.filter(i=>!i.hasAttribute('src')).length}));
 assert.ok(resources.deferred>0,'Offscreen source assets should remain deferred');
 const initialHighRes=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/desk-canvas\/(brand|market|user)-section/.test(r.name)).map(r=>r.name));
 assert.equal(initialHighRes.length,0,'Do not eagerly load all primary focus assets');
 await shot('overview');checks.push(`Overview shows surrounding source documents; ${resources.deferred} far-offscreen assets deferred`);
 const begin=()=>root.evaluate(el=>{
  window.workspaceCapture=true;window.workspaceFrames=[];
  const world=el.querySelector('.figma-canvas-world'),view=el.querySelector('.figma-canvas-viewport'),backgrounds=[...el.querySelectorAll('[data-background-frame]')];
  const tick=t=>{const m=new DOMMatrix(getComputedStyle(world).transform),v=view.getBoundingClientRect();
   const visible=backgrounds.filter(f=>{const r=f.getBoundingClientRect();return r.right>v.left&&r.left<v.right&&r.bottom>v.top&&r.top<v.bottom;});
   window.workspaceFrames.push({t,scale:m.a,x:m.e,y:m.f,visible:visible.map(f=>f.dataset.backgroundFrame),unready:visible.filter(f=>f.querySelector('img').dataset.ready!=='true').map(f=>f.dataset.backgroundFrame)});
   if(window.workspaceCapture)requestAnimationFrame(tick);
  };requestAnimationFrame(tick);
 });
 const motion=async(id,name)=>{
  await begin();await click(id);await page.waitForTimeout(850);
  const actual=await fixedGeometry();
  for(let index=0;index<fixed.length;index++)for(const key of Object.keys(fixed[index])){
   if(key==='transform')assert.equal(actual[index][key],fixed[index][key]);
   else assert.ok(Math.abs(actual[index][key]-fixed[index][key])<.01,'Figma UI/retro frame moved');
  }
  await shot(`${name}-mid`);
  await settle();
  if(id)await root.locator(`[data-desk-frame="${id}"] .desk-frame__high-resolution`).waitFor();
  await shot(name);
  const samples=await page.evaluate(()=>{window.workspaceCapture=false;return window.workspaceFrames;});
  assert.ok(samples.length>20);assert.ok(samples.every(s=>s.scale>0&&s.unready.length===0),`Background popped in during ${name}`);
  assert.ok(samples.some(s=>s.visible.length>=2),'No surrounding frames traversed');
  if(id){const box=await root.locator(`[data-desk-frame="${id}"]`).boundingBox(),v=await root.locator('.figma-canvas-viewport').boundingBox();assert.ok(Math.abs(box.x+box.width/2-v.x-v.width/2)<1);assert.ok(Math.abs(box.y+box.height/2-v.y-v.height/2)<1);}
  motions.push({name,samples});checks.push(name);
 };
 await motion('brand-analysis','overview-to-brand');
 await motion('market-research','brand-to-market');
 await motion('user-research','market-to-user');
 await motion('brand-analysis','user-to-brand');
 await motion(null,'brand-to-overview');
 const highRes=await root.locator('.desk-frame__high-resolution').evaluateAll(imgs=>imgs.map(i=>({src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight})));
 assert.equal(highRes.length,3);assert.ok(highRes.every(i=>Math.max(i.width,i.height)>=4096));checks.push('On-demand 4096px focus images decoded for all primary frames');
 await click('brand-analysis');await page.waitForTimeout(350);
 const interrupt=async id=>{const r=await root.evaluate((el,id)=>{const w=el.querySelector('.figma-canvas-world'),before=w.style.transform;el.querySelector(`[data-desk-layer="${id}"]`).click();return {before,after:w.style.transform};},id);assert.equal(r.before,r.after);};
 await interrupt('market-research');await settle();
 for(const id of ['user-research','brand-analysis','market-research','user-research','brand-analysis']){await interrupt(id);await page.waitForTimeout(65);}
 await settle();assert.equal(await root.locator('[data-desk-layer="brand-analysis"]').getAttribute('aria-pressed'),'true');checks.push('Interrupted and rapid selections preserve transform and settle on final target');
 for(const width of [1024,390]){
  await page.setViewportSize({width,height:1100});await page.waitForTimeout(100);await settle();
  await click('market-research');await settle();await click('user-research');await settle();
  await shot(`${width}-focus`);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 checks.push('1024/390 resize, pan and zoom without document overflow');
 await page.setViewportSize({width:1440,height:1100});await page.waitForTimeout(100);await settle();await click(null);await settle();
 const brand=root.locator('[data-desk-frame="brand-analysis"] button');await brand.hover();await page.waitForTimeout(400);await brand.click();await settle();
 assert.equal(await page.locator('.research-reader').count(),0);await brand.click();await page.locator('.research-reader img').evaluate(i=>i.decode());await page.keyboard.press('Escape');checks.push('Hover then click, plus original full-document reader');
 await root.scrollIntoViewIfNeeded();await root.locator('.figma-canvas-viewport').hover();const y=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,450);await page.waitForTimeout(900);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-y)>100);checks.push('Canvas wheel permits page scrolling');
 const section=page.locator('#zara-process');
 for(const step of [1,2,3,4,5]){
  await section.locator(`[data-step="${step}"]`).click();await page.waitForTimeout(450);
  assert.equal(await section.locator('[data-background-frame]').count(),0);assert.equal(await section.locator('.figma-workspace').count(),1);
 }
 checks.push('Chapters 02–06 render their existing workspace without Desk Research layers');
 await section.locator('[data-step="0"]').click();await page.waitForFunction(()=>document.querySelector('.desk-canvas-interface')?.dataset.backgroundReady==='true');
 await root.scrollIntoViewIfNeeded();await shot('final-overview');await click('market-research');await settle();await shot('final-focus');
 await page.emulateMedia({reducedMotion:'reduce'});await click('user-research');await page.waitForTimeout(100);await settle();checks.push('Reduced motion and chapter remount');
 assert.deepEqual(errors,[]);
 await writeFile(`${output}/verification.json`,JSON.stringify({url,checks,errors,geometry,styles,resources,highRes,motions},null,2));
 console.log(JSON.stringify({checks,errors,resources,highRes}));
} finally {await context.close();await page.video().saveAs(`${output}/workspace-pan-zoom.webm`);await browser.close();}
