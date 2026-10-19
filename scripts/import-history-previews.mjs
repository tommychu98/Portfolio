import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const source = process.argv[2] || 'C:/Users/mbc/Desktop/mbc_teamproject-main/mbc_teamproject-main';
const requireSource = createRequire(path.join(source, 'package.json'));
const { createElement } = requireSource('react');
const { renderToStaticMarkup } = requireSource('react-dom/server');
const sourceComponents = 'src/components/about/DiptyqueHistory';
const target = 'public/media/diptyque-history';
const chapters = ['Fabric', 'Objects', 'Scent', 'Maison'];
const server = await createServer({ root: source, configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom' });
const copied = new Set();
try {
  await mkdir(`${target}/previews`, { recursive: true });
  const variables = await readFile(path.join(source, 'src/styles/variables.css'), 'utf8');
  const reset = await readFile(path.join(source, 'src/styles/reset.css'), 'utf8');
  const fonts = `@font-face{font-family:'History Garamond';src:url('/media/diptyque-history/previews/garamond.woff2')}@font-face{font-family:'History Dotum';src:url('/media/diptyque-history/previews/dotum.woff2')}@font-face{font-family:'History Dotum';font-weight:700;src:url('/media/diptyque-history/previews/dotum-bold.woff2')}:root{--font-family-display:'History Garamond',Georgia,serif;--font-family-serif-kr:'History Dotum',serif;--font-family-sans:'History Dotum',sans-serif}body{font-family:var(--font-family-sans);font-size:16px;line-height:1.5;letter-spacing:.02em}html,body{margin:0;width:1920px;min-width:1920px;overflow:hidden;background:#faf7f0}*{box-sizing:border-box}`;
  await copyFile('node_modules/@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-normal.woff2', `${target}/previews/garamond.woff2`);
  await copyFile(path.join(source, 'public/ForThePlanet/KoPubWorld-Dotum-Light.woff2'), `${target}/previews/dotum.woff2`);
  await copyFile(path.join(source, 'public/ForThePlanet/planet-dotum-bold.woff2'), `${target}/previews/dotum-bold.woff2`);
  for (const name of chapters) {
    const { default: Component } = await server.ssrLoadModule(`/${sourceComponents}/History${name}.jsx`);
    let html = renderToStaticMarkup(createElement(Component));
    const $ = load(html, null, false);
    // The original component's markup and positioning are retained. Effects do
    // not run during SSR; this read-only document is moved by the portfolio.
    $('link[rel="preload"]').remove();
    for (const image of $('img').toArray()) {
      const url = $(image).attr('src');
      if (!url?.startsWith('/images/history/')) continue;
      const relative = url.slice('/images/history/'.length);
      const output = `${target}/${relative}`;
      await mkdir(path.dirname(output), { recursive: true });
      if (!copied.has(relative)) { await copyFile(path.join(source, `public${url}`), output); copied.add(relative); }
      $(image).attr('src', `/media/diptyque-history/${relative}`).attr('loading', 'eager');
    }
    const css = await readFile(path.join(source, sourceComponents, `History${name}.css`), 'utf8');
    // A static full-scene preview must expose content normally revealed by the
    // original lighting hook. This override exists only inside the preview.
    $('img[src$="/fabric/fabric-pick-up.png"]').attr('data-once-gif', '/media/diptyque-history/fabric/fabric-pick-up.gif');
    $('img[src$="/objects/objects-walking-figure.png"]')
      .attr('data-once-gif', '/media/diptyque-history/objects/objects-walking-figure.gif')
      .attr('data-gif-subject', '.17,.07,.23,.89')
      .attr('data-gif-visible-ratio', '.85');
    const preview = `.history-scent-scroll{--title-opacity:1;--title-blur:0px;--intro-copy-opacity:1;--story-copy-opacity:1;--flame-opacity:1}
      .history-objects__detail-visual-02{animation:preview-clock 12s linear infinite}
      .history-maison__story-03-feature{animation:preview-clock 45s linear infinite}
      @keyframes preview-clock{to{transform:rotate(360deg)}}
      @media(prefers-reduced-motion:reduce){*{animation:none!important}}`;
    html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${name.toUpperCase()} History</title><style>${reset}\n${variables}\n${fonts}\n${css}\n${preview}</style></head><body>${$.html()}</body></html>`;
    await writeFile(`${target}/previews/${name.toLowerCase()}.html`, html);
  }
  for (const relative of ['fabric/fabric-pick-up.gif', 'objects/objects-walking-figure.gif']) {
    await copyFile(path.join(source, 'public/images/history', relative), `${target}/${relative}`);
  }
  console.log(`Imported four complete scene documents and ${copied.size} original images; source project unchanged.`);
} finally { await server.close(); }
