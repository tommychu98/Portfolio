import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'artifacts/memory-wall/layer-audit';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];

// Inspect opaque source pixels, not transparent PNG bounding boxes or z-index
// numbers alone. At actual photo/PNG intersections, the painted hit order must
// put a decoration first. Temporarily enable hit testing only during this audit.
async function audit(page) {
  return page.locator('.memory-wall__stage').evaluate(async stage => {
    const selected = stage.querySelector('.memory-card[data-selected="true"]');
    const focus = selected.getBoundingClientRect();
    const photos = [...stage.querySelectorAll('.memory-card')].map(node => node.getBoundingClientRect());
    const props = [...stage.querySelectorAll('.memory-prop')];
    const bounds = stage.getBoundingClientRect();
    const contains = (rect, x, y) => x > rect.left + 2 && x < rect.right - 2 && y > rect.top + 2 && y < rect.bottom - 2;
    const oldPointers = props.map(node => node.style.pointerEvents);
    const oldArtPointers = props.map(node => node.querySelector('svg').style.pointerEvents);
    props.forEach(node => { node.style.pointerEvents = 'auto'; node.querySelector('svg').style.pointerEvents = 'auto'; });
    try {
      return await Promise.all(props.map(async node => {
        const svg = node.querySelector('svg');
        const imageNode = svg.querySelector('image');
        const image = new Image();
        image.src = imageNode.getAttribute('href');
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const view = svg.viewBox.baseVal;
        const sourceWidth = imageNode.width.baseVal.value;
        const sourceHeight = imageNode.height.baseVal.value;
        const matrix = svg.getScreenCTM();
        let photoIntersections = 0, selectedIntersections = 0, hiddenPixels = 0;
        const hiddenSamples = [];
        for (let row = 0; row < 32; row++) for (let column = 0; column < 32; column++) {
          const x = view.x + (column + .5) / 32 * view.width;
          const y = view.y + (row + .5) / 32 * view.height;
          const ix = Math.min(canvas.width - 1, Math.max(0, Math.floor(x / sourceWidth * canvas.width)));
          const iy = Math.min(canvas.height - 1, Math.max(0, Math.floor(y / sourceHeight * canvas.height)));
          if (pixels[(iy * canvas.width + ix) * 4 + 3] < 240) continue;
          const point = new DOMPoint(x, y).matrixTransform(matrix);
          if (point.x < 1 || point.x >= innerWidth - 1 || point.y < 1 || point.y >= innerHeight - 1) continue;
          if (!photos.some(rect => contains(rect, point.x, point.y))) continue;
          photoIntersections++;
          if (contains(focus, point.x, point.y)) selectedIntersections++;
          const top = document.elementFromPoint(point.x, point.y);
          if (!top?.closest('.memory-prop')) {
            hiddenPixels++;
            if (hiddenSamples.length < 3) hiddenSamples.push({ x: point.x, y: point.y, top: `${top?.tagName}.${top?.getAttribute('class')}` });
          }
        }
        const rect = node.getBoundingClientRect();
        return { id: node.dataset.memoryProp, related: node.dataset.related === 'true',
          x: Math.round(rect.left + rect.width / 2 - bounds.left - bounds.width / 2),
          y: Math.round(rect.top + rect.height / 2 - bounds.top - bounds.height / 2),
          photoIntersections, selectedIntersections, hiddenPixels, hiddenSamples };
      }));
    } finally { props.forEach((node, index) => { node.style.pointerEvents = oldPointers[index]; node.querySelector('svg').style.pointerEvents = oldArtPointers[index]; }); }
  });
}

try {
  for (const mode of process.argv.includes('--mobile-only') ? ['mobile'] : ['desktop', 'mobile']) {
    const page = await browser.newPage({ viewport: mode === 'desktop' ? { width: 1440, height: 1100 } : { width: 390, height: 844 }, isMobile: mode === 'mobile', hasTouch: mode === 'mobile' });
    await page.goto('http://127.0.0.1:5173');
    await page.waitForTimeout(3500);
    await page.addStyleTag({ content: '.site-header,.skip-link{visibility:hidden!important}' });
    const next = page.getByRole('button', { name: '다음 사진', exact: true });
    for (let i = 0; i < 10; i++) {
      await next.click();
      await page.waitForTimeout(1250);
      const selected = page.locator('.memory-card[data-selected="true"]');
      await selected.scrollIntoViewIfNeeded();
      const props = await audit(page);
      assert.equal(props.length, 8);
      assert(props.every(prop => prop.hiddenPixels === 0), `${mode} photo ${i + 1}: PNG pixels must paint above photos: ${JSON.stringify(props)}`);
      assert(props.filter(prop => prop.related).every(prop => prop.selectedIntersections >= 3), `${mode} photo ${i + 1}: every related PNG must visibly cross the front of the selected paper: ${JSON.stringify(props)}`);
      assert.equal(await page.locator('.memory-prop').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).pointerEvents === 'none')), true);
      await page.locator('.memory-wall__stage').screenshot({ path: `${output}/${mode}-${String(i + 1).padStart(2, '0')}.png` });
      results.push({ mode, photo: i + 1, props });
      if (i === 5) {
        if (mode === 'mobile') await selected.tap(); else await selected.click();
        await page.waitForTimeout(400);
        assert.equal(await selected.getAttribute('data-back'), 'true');
        assert((await audit(page)).every(prop => prop.hiddenPixels === 0));
      }
    }
    await page.close();
  }
  await writeFile(`${output}/result.json`, JSON.stringify({ status: 'passed', results }, null, 2));
  console.log('PASS: all 8 PNGs audited on all 10 centered photos, desktop + mobile; opaque overlap pixels paint in front; related stickers cross the paper; back-face and touch clicks work');
} catch (error) {
  await writeFile(`${output}/result.json`, JSON.stringify({ status: 'failed', failure: error.message, results }, null, 2));
  throw error;
} finally { await browser.close(); }
