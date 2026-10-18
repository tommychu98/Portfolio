import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
const output='artifacts/diptyque-process/retro-window',checks=[],errors=[];
await mkdir(output,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1400}});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5173');
 const section=page.locator('#zara-process'),window=section.locator('.diptyque-retro-window');
 await section.scrollIntoViewIfNeeded();await page.waitForTimeout(1600);
 await window.locator('img').evaluate(img=>img.decode());
 await page.evaluate(async()=>{const image=new Image();image.src='/media/images/diptyque/window/retro-frame-v2.png';await image.decode();});
 for(const width of [1440,1024,390]){
  await page.setViewportSize({width,height:1800});await page.waitForTimeout(300);
  const geometry=await window.evaluate(el=>{
   const outer=el.getBoundingClientRect(),inner=el.querySelector('.diptyque-retro-window__screen').getBoundingClientRect(),img=el.querySelector('img'),frame=getComputedStyle(el.querySelector('.diptyque-retro-window__frame'));
   return {outer:outer.toJSON(),inner:inner.toJSON(),image:img.getBoundingClientRect().toJSON(),natural:[img.naturalWidth,img.naturalHeight],border:[frame.borderTopWidth,frame.borderRightWidth,frame.borderBottomWidth,frame.borderLeftWidth].map(parseFloat),pointer:frame.pointerEvents,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.deepEqual(geometry.natural,[15356,8352]);
  assert.equal(geometry.pointer,'none');assert.equal(geometry.overflow,false);
  assert.ok(Math.abs(geometry.image.width/geometry.image.height-15356/8352)<.001);
  assert.ok(Math.abs(geometry.inner.x-geometry.outer.x-geometry.border[3])<1);
  assert.ok(Math.abs(geometry.inner.y-geometry.outer.y-geometry.border[0])<1);
  assert.ok(Math.abs(geometry.outer.bottom-geometry.inner.bottom-geometry.border[2])<1);
  assert.ok(Math.abs(geometry.outer.right-geometry.inner.right-geometry.border[1])<1);
  await section.screenshot({path:`${output}/${width}-section.png`,style:'.site-header{visibility:hidden!important}'});
  await window.screenshot({path:`${output}/${width}-window.png`});
  checks.push({width,...geometry});
 }
 await section.locator('[data-step="1"]').click();await page.waitForTimeout(1000);
 assert.equal(await section.locator('.figma-workspace').count(),1);
 await section.locator('[data-step="0"]').click();await page.waitForTimeout(1000);
 assert.equal(await window.count(),1);assert.deepEqual(errors,[]);
 await writeFile(`${output}/verification.json`,JSON.stringify({checks,errors},null,2));
 console.log('PASS: 1440/1024/390, original image aspect ratio, four-edge fit, pointer events, no overflow, chapter return, no runtime errors');
}finally{await browser.close();}
