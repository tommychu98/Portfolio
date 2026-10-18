const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:'artifacts/diptyque-process/canvas-video',size:{width:1440,height:1000}}});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:5173/#zara-process');
 const root=page.locator('#zara-process');
 await root.locator('.research-archive__body').scrollIntoViewIfNeeded();await page.waitForTimeout(1800);
 await root.locator('.workspace-layer-list button').nth(1).click();await page.waitForTimeout(1200);
 await root.locator('#archive-tab-result').click();await page.waitForTimeout(1200);
 await root.locator('[data-step="3"]').click();await page.waitForTimeout(1200);
 await root.locator('.workspace-zoom button').nth(0).click();await page.waitForTimeout(900);
 await root.locator('.workspace-layer-list button').last().click();await page.waitForTimeout(1400);
 await root.locator('[data-step="5"]').click();await page.waitForTimeout(1000);
 await root.locator('.workspace-zoom button').nth(1).click();await page.waitForTimeout(1200);
 const video=page.video();await context.close();await video.saveAs('artifacts/diptyque-process/canvas-interaction.webm');
 const comparison=await browser.newPage({viewport:{width:1600,height:1100}});
 await comparison.goto('http://127.0.0.1:5173/artifacts/diptyque-process/canvas-comparison.html');
 await comparison.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
 await comparison.screenshot({path:'artifacts/diptyque-process/canvas-comparison.png'});
 console.log('Captured canvas-interaction.webm and canvas-comparison.png');
} finally {await browser.close();}
