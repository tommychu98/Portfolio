const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const output = 'artifacts/memory-wall/desert';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [], errors = [];
try {
  for (const [mode, width, height] of [['desktop', 1440, 900], ['tablet', 900, 800], ['mobile', 390, 700]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: mode === 'mobile', isMobile: mode === 'mobile' });
    const page = await context.newPage();
    page.on('pageerror', e => { if (!/isExternalMethodAvailable/.test(e.message)) errors.push(e.message); });
    await page.goto('http://127.0.0.1:5173'); await page.waitForTimeout(3500);
    await page.evaluate(async () => { const image = new Image(); image.src = document.querySelector('.memory-wall__desert image').getAttribute('href'); await image.decode(); });
    const geometry = () => page.evaluate(async () => {
      const { sceneGeometry } = await import('/src/components/sections/About/memoryScene.js');
      const root = document.querySelector('#closing');
      return { ...sceneGeometry(root, root.querySelector('.memory-wall__stage'), root.querySelector('.memory-wall__rule')),
        top: root.getBoundingClientRect().top + scrollY, rootHeight: root.offsetHeight };
    });
    let g = await geometry();
    console.log(mode, JSON.stringify(g));
    assert(g.height > 160 && g.width > 250, 'Enough sky remains for the photographs');
    assert(Math.abs(g.image.width - width) < 1, 'Background covers the entire viewport width');
    assert(g.person.bottom > g.person.top, 'Embedded figure bounds follow the shared scene transform');
    assert(g.person.bottom < g.rootHeight && g.person.top > g.sky.bottom);
    // Observe every rendered frame, including inner PNG pulses, rather than only
    // testing target coordinates. A bounding box includes rotation and scale.
    await page.evaluate(() => {
      window.desertAudit = { samples: 0, violations: [] };
      const sample = async () => {
        const { sceneGeometry } = await import('/src/components/sections/About/memoryScene.js');
        const root = document.querySelector('#closing'), stage = root.querySelector('.memory-wall__stage');
        const area = sceneGeometry(root, stage, root.querySelector('.memory-wall__rule'));
        const r = root.getBoundingClientRect();
        for (const node of root.querySelectorAll('.memory-card__float,.memory-prop svg,.memory-wall__hint,.memory-wall__nav')) {
          const b = node.getBoundingClientRect();
          const box = { left: b.left - r.left, right: b.right - r.left, top: b.top - r.top, bottom: b.bottom - r.top };
          const p = area.person;
          if (box.left < p.right && box.right > p.left && box.top < p.bottom && box.bottom > p.top) {
            if (window.desertAudit.violations.length < 10) window.desertAudit.violations.push({ id: node.dataset.memoryId || node.parentElement.dataset.memoryProp, box, person: p });
          }
          if (!node.matches('.memory-wall__hint,.memory-wall__nav') && (box.bottom > area.sky.bottom + 1 || box.top < area.sky.top - 1 || box.left < area.sky.left - 1 || box.right > area.sky.right + 1)) {
            if (window.desertAudit.violations.length < 10) window.desertAudit.violations.push({ reason: 'outside sky', id: node.dataset.memoryId || node.parentElement.dataset.memoryProp, box, sky: area.sky });
          }
        }
        window.desertAudit.samples++;
        // Sample after the frame's pre-paint ResizeObserver corrections.
        window.desertAudit.frame = requestAnimationFrame(() => setTimeout(sample, 0));
      };
      sample();
    });
    const move = async y => {
      await page.evaluate(async y => (await import('/src/motion/scroll.js')).scrollToPosition(y, true), y);
      await page.waitForTimeout(70);
    };
    const state = value => page.waitForFunction(v => document.querySelector('#closing').dataset.memoryState === v, value);
    const capture = async name => {
      // Beyond-viewport compositor captures restore scroll underneath Lenis.
      // Ordinary viewport captures leave the tested lifecycle untouched.
      if (name !== 'stack') await page.screenshot({ path: `${output}/${mode}-${name}.png`, style: '.site-header,.skip-link{visibility:hidden!important}' });
    };
    await state('stacked'); await capture('stack');
    await move(g.top + g.sky.top - height - 90);
    await page.mouse.wheel(0, 320); await state('scattering'); await state('scattered');
    await move(g.top + (g.sky.top + g.sky.bottom) / 2 - height / 2);
    await capture('scatter');
    // Direct pointer/touch selection on an exposed paper.
    const point = await page.locator('.memory-card').evaluateAll(nodes => {
      for (const n of nodes) {
        const r = n.getBoundingClientRect();
        for (let y = Math.max(100, r.top + 5); y < Math.min(innerHeight, r.bottom - 5); y += 8) {
          for (let x = Math.max(5, r.left + 5); x < Math.min(innerWidth, r.right - 5); x += 8) {
            if (n.contains(document.elementFromPoint(x, y))) return { x, y };
          }
        }
      }
      return null;
    });
    assert(point);
    if (mode === 'mobile') await page.touchscreen.tap(point.x, point.y);
    else await page.mouse.click(point.x, point.y);
    await state('focused'); await capture('focus');
    const focused = page.locator('.memory-card[data-selected="true"]');
    await focused.click(); await page.waitForTimeout(350);
    assert.equal(await focused.getAttribute('data-back'), 'true');
    await capture('back'); await focused.click();
    // Navigation reaches every existing photo and exercises all shuffle paths.
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: '다음 사진', exact: true }).click(); await state('focused');
    }
    await page.getByRole('button', { name: '이전 사진', exact: true }).click(); await state('focused');
    const next = await page.getByRole('button', { name: '다음 사진', exact: true }).boundingBox();
    for (let i = 0; i < 6; i++) await page.mouse.click(next.x + next.width / 2, next.y + next.height / 2);
    await state('focused');
    // Full upper exit, interrupted gather and reentry, then full lower exit.
    await move(g.top - height - 30); await page.waitForTimeout(150);
    await move(g.top + g.sky.top); await state('scattered');
    await move(g.top - height - 30); await state('stacked');
    await move(g.top + g.sky.top); await state('scattered');
    // A short viewport makes complete bottom exit possible without touching Footer.
    await page.setViewportSize({ width, height: 400 }); await page.waitForTimeout(500);
    g = await geometry();
    await move(g.top + g.rootHeight + 10); await state('stacked');
    await page.mouse.wheel(0, -650); await page.waitForTimeout(900);
    await move(g.top + g.sky.top); await state('scattered');
    await page.setViewportSize({ width: width === 390 ? 430 : width - 100, height: 700 });
    await page.waitForTimeout(700);
    g = await geometry(); await move(g.top + g.sky.top); await state('scattered');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const audit = await page.evaluate(() => { cancelAnimationFrame(window.desertAudit.frame); return window.desertAudit; });
    assert.deepEqual(audit.violations, [], JSON.stringify(audit.violations));
    // A real tall viewport shows sky and the complete figure in one capture;
    // no compositor capture or stitched/modified scene is needed.
    await page.setViewportSize({ width, height: mode === 'desktop' ? 2050 : mode === 'tablet' ? 1600 : 1100 });
    await page.waitForTimeout(450); g = await geometry(); await move(g.top); await state('scattered');
    const sceneCapture = name => page.screenshot({ path: `${output}/${mode}-scene-${name}.png`,
      clip: { x: 0, y: 0, width, height: Math.ceil(g.rootHeight) }, style: '.site-header,.skip-link{visibility:hidden!important}' });
    await sceneCapture('scatter');
    await page.getByRole('button', { name: '다음 사진', exact: true }).click(); await state('focused');
    await sceneCapture('focus');
    results.push({ mode, frames: audit.samples, checks: ['full-width background with independent figure', 'auto scatter', 'direct focus/touch', 'all 10 photo shuffle transitions', 'reverse and close', 'previous/next and rapid clicks', 'both complete exits and reentry', 'interrupted gather', 'resize', 'all sampled card and sticker bounds remain in sky'] });
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/result.json`, JSON.stringify({ status: 'passed', results, errors }, null, 2));
  console.log(JSON.stringify({ status: 'passed', results }, null, 2));
} catch (e) {
  await writeFile(`${output}/result.json`, JSON.stringify({ status: 'failed', results, errors, failure: e.stack }, null, 2));
  throw e;
} finally { await browser.close(); }
