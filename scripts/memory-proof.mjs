import { readFile } from 'node:fs/promises';

export async function renderMemoryProof(browser, output, count) {
  const photos = await Promise.all(Array.from({ length: count }, (_, index) =>
    readFile(`${output}/photo-${String(index + 1).padStart(2, '0')}.png`)));
  const proof = await browser.newPage({ viewport: { width: 1500, height: 800 }, deviceScaleFactor: 1 });
  try {
    await proof.setContent(`<html><body style="margin:0;padding:28px;background:#e8d8ba;display:grid;grid-template-columns:repeat(5,1fr);gap:24px;align-items:center;justify-items:center">${photos.map((data, index) => `<figure style="margin:0;text-align:center"><img src="data:image/png;base64,${data.toString('base64')}" style="display:block;max-width:260px;max-height:300px;margin:auto"/><figcaption style="font:12px sans-serif;margin-top:10px">${String(index + 1).padStart(2, '0')}</figcaption></figure>`).join('')}</body></html>`);
    await proof.screenshot({ path: `${output}/08-all-photo-crops.png`, fullPage: true });
  } finally { await proof.close(); }
}
