import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { archiveSteps } from '../src/components/sections/PortfolioProcess/DiptyqueProcess.data.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const phase = process.argv[2] || 'after';
const directory = `artifacts/diptyque-process/typography-${phase}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel:'chrome', headless:true });
const report = [], errors = [];
try {
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror', error=>{errors.push(error.message); console.error(error.message);});
  await page.goto('http://127.0.0.1:5173/', {waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const root = page.locator('#zara-process');
  for (const width of [1440,1024,390]) {
    await page.setViewportSize({width,height:900});
    for (const index of phase==='after' ? [0,1,2,3,4,5] : [0]) {
      await root.locator(`[data-step="${index}"]`).click(); await page.waitForTimeout(1000);
      for (const mode of index===5 ? ['held'] : ['research','result']) {
        if(mode!=='held') { await root.locator(`#archive-tab-${mode}`).click(); await page.waitForTimeout(1000); }
        await root.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
        await page.evaluate(()=>document.activeElement.blur());
        const metrics = await root.evaluate(element=>{
          const style = selector=>getComputedStyle(element.querySelector(selector));
          const bounds = selector=>element.querySelector(selector)?.getBoundingClientRect();
          const image=element.querySelector('.research-cut__image img');
          return {body:style('.research-archive__description').fontSize,finding:style('[data-finding]>p').fontSize,title:style('h2').fontSize,stage:style('h3').fontSize,tab:element.querySelector('[role=tab]') ? style('[role=tab]').fontSize : null,bodyTop:bounds('.research-archive__body').top-element.getBoundingClientRect().top,imageWidth:image?.clientWidth,imageHeight:image?.clientHeight,ratio:image? image.clientWidth/image.clientHeight : null,naturalRatio:image?image.naturalWidth/image.naturalHeight:null,overflow:document.documentElement.scrollWidth>innerWidth};
        });
        if(phase==='after') {
          assert.equal(await root.locator('[data-finding]>p').textContent(),archiveSteps[index].keyFinding);
          assert.equal(metrics.overflow,false);
          assert.ok(parseFloat(metrics.body)>=16);
          assert.ok(parseFloat(metrics.finding)>=22);
          if(metrics.ratio) assert.ok(Math.abs(metrics.ratio-metrics.naturalRatio)<.02,'Image aspect ratio');
        }
        report.push({width,index,mode,...metrics});
        await root.screenshot({path:`${directory}/${width}-${index+1}-${mode}.png`,style:'.site-header,.skip-link{visibility:hidden!important}'});
      }
    }
  }
  assert.deepEqual(errors,[]);
  await writeFile(`${directory}/metrics.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({phase,states:report.length,errors,first:report[1]},null,2));
} finally {await browser.close();}
