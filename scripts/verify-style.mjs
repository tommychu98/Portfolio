import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import postcss from 'postcss';

// Captured before the poster restyle. Compares box/motion declarations rather
// than screenshots; the latter still require an available browser connection.
const baseline = JSON.parse(await readFile('reference/visual-style-before.json', 'utf8'));
const fontAndColor = new Set(['color', 'font-family', 'font-weight', 'font-style', 'text-shadow', '--paper', '--ink', '--text', '--stone', '--line', '--serif', '--sans', '--korean-serif', '--compact', '--emphasis', '--teal', '--teal-dark', '--accent', '--paper-light', '--personal-accent']);
function geometry(css) {
  const declarations = [];
  postcss.parse(css).walkDecls(decl => {
    if (decl.parent.type === 'atrule' && decl.parent.name === 'font-face') return;
    if (fontAndColor.has(decl.prop)) return;
    if (['letter-spacing', 'text-transform', '--poster', '--subheading'].includes(decl.prop)) return; // Authorized poster-type follow-up.
    if (decl.prop === 'background' && /^(?:#[a-f0-9]{3,8}|transparent|currentColor|var\(--(?:paper|ink|stone|accent|personal-accent)\))$/i.test(decl.value)) return;
    if (decl.parent.selector === '.paper-grain::before' && decl.prop === 'opacity') return;
    let value = decl.value;
    if (decl.prop === 'font') value = value.replace(/^(?:italic\s+)?(?:[1-9]00\s+|650\s+)?/, '');
    value = value.replace(/#[a-f0-9]{3,8}\b/gi, 'COLOR').replace(/rgba?\([^)]*\)/g, 'COLOR');
    const ancestors = [];
    for (let parent = decl.parent; parent; parent = parent.parent) {
      if (parent.type === 'rule') ancestors.unshift(parent.selector);
      if (parent.type === 'atrule') ancestors.unshift(`@${parent.name} ${parent.params}`);
    }
    declarations.push([ancestors.join(' > '), decl.prop, value]);
  });
  return declarations;
}
const checked = { cssFiles: 0, sourceFiles: 0, mediaFiles: 0 };
for (const [file, before] of Object.entries(baseline)) {
  const bytes = await readFile(file);
  if (file.endsWith('.css')) {
    assert.deepEqual(geometry(bytes.toString('utf8')), geometry(before.text), `Layout or motion changed: ${file}`);
    checked.cssFiles++;
  } else if (!file.endsWith('.md')) {
    assert.equal(createHash('sha256').update(bytes).digest('hex'), before.hash, `Protected file changed: ${file}`);
    checked[file.startsWith('public/media/') ? 'mediaFiles' : 'sourceFiles']++;
  }
}
function luminance(hex) {
  const c = hex.match(/[a-f0-9]{2}/gi).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
  return c[0]*.2126+c[1]*.7152+c[2]*.0722;
}
const contrasts = [['11130f','e8d8ba'],['11130f','508f8d'],['285b59','e8d8ba'],['11130f','e5cc72'],['e8d8ba','11130f']].map(([foreground,background]) => {
  const a=luminance(foreground),b=luminance(background);
  const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  assert(ratio>=4.5, `Insufficient solid text contrast: ${foreground}/${background}`);
  return { foreground:'#'+foreground, background:'#'+background, ratio:Number(ratio.toFixed(2)) };
});
const result = { passed:true, checked, preserved:'All existing JSX, content, motion modules, media hashes, CSS box dimensions, gaps, transforms, transitions, animation settings and media queries checked against the before snapshot.', contrasts, limitation:'Source and solid-color checks only. Browser unavailable: before/after screenshots, rendered line breaks, real button widths, overflow and scroll playback remain unverified.' };
await writeFile('reference/visual-style-verification.json',JSON.stringify(result,null,2)+'\n');
console.log(result);
