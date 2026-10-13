import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';

const root = new URL('../', import.meta.url);
const base = 'https://personal3-gilt.vercel.app/';
const html = await readFile(new URL('reference/personal3.html', root), 'utf8');
const $ = load(html);
$('br').replaceWith(' ');
const clean = el => $(el).text().replace(/\s+/g, ' ').trim();
const local = p => `/media/${p}`;
const data = {
  story: $('.story-bottom p').map((_, el) => clean(el)).get(),
  profile: { title: clean($('.profile-copy h2')), body: clean($('.profile-copy p')) },
  values: $('.value-grid article').map((_, el) => ({ title: clean($(el).find('h3')), body: clean($(el).find('p')) })).get(),
  details: $('.detail-panel').map((_, el) => ({ title: clean($(el).find('h3')), paragraphs: $(el).find('.panel-copy p').map((_, p) => clean(p)).get() })).get(),
  processIntro: clean($('#zara-process .process-cover .process-copy p')),
  process: $('#zara-process .process-step').map((_, el) => ({
    title: clean($(el).find('h2')), body: clean($(el).find('.process-copy p')),
    materials: $(el).find('[data-process-material]').map((_, b) => ({id: $(b).attr('data-process-material'), label: clean(b), src: local(`images/zara-methodology/${$(b).attr('data-process-material')}.png`)})).get()
  })).get(),
  personal: $('.work-card').map((i, el) => ({ name: i === 0 ? 'ÉLAN' : 'ONDA', title: clean($(el).find('.card-meta h3')), body: clean($(el).find('.card-meta p')), href: new URL($(el).find('a').attr('href'), base).href, image: i === 0 ? 'perfume' : 'tea', tags: $(el).find('.tag').map((_, t) => clean(t)).get() })).get(),
  films: $('.shortform-scene').map((i, el) => ({title: clean($(el).find('h3')), subtitle: clean($(el).find('.work-scenes__desc-en')), src: local($(el).find('source').attr('src')), poster: local($(el).find('video').attr('poster')), wide: i === 2, meta: $(el).find('dl > div').map((_, d) => ({label: clean($(d).find('dt')), text: clean($(d).find('dd'))})).get()})).get(),
  clones: $('.clone-card').map((i, el) => ({title: clean($(el).find('h3')).replace('↗','').trim(), category: clean($(el).find('.clone-meta > span')), body: clean($(el).find('.clone-meta p')), href: new URL($(el).attr('href'), base).href, image: ['architecture','office','fashion'][i], name: ['NORTH','FORM','MODE'][i]})).get(),
  skills: $('.skill-row').map((_, el) => ({name: clean($(el).find('> span')).split(' / ')[1], tools: $(el).find('.skill-tool').map((_, t) => clean(t)).get(), body: clean($(el).find('p'))})).get(),
  about: {title: clean($('.about-copy h3')), body: clean($('.about-copy p'))},
  questions: $('.qa details').map((_, el) => ({q: clean($(el).find('summary')).replace(/\+$/, '').trim(), a: clean($(el).find('p'))})).get(),
  contact: { email: '', resume: '', github: '' },
};
await mkdir(new URL('src/data/', root), {recursive: true});
await writeFile(new URL('src/data/content.json', root), JSON.stringify(data, null, 2)+'\n');
const files = new Set(['assets/editorial-sheet.png']);
for (const step of data.process) for (const m of step.materials) files.add(m.src.replace('/media/', ''));
for (const film of data.films) { files.add(film.src.replace('/media/','')); files.add(film.poster.replace('/media/','')); }
const manifest = [];
const queue = [...files];
await Promise.all(Array.from({length: 5}, async () => {
  while (queue.length) {
    const file = queue.shift();
    const response = await fetch(new URL(file, base));
    if (!response.ok) throw new Error(`${file}: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const output = new URL(`public/media/${file}`, root);
    await mkdir(path.dirname(output.pathname.replace(/^\/(\w:)/, '$1')), {recursive: true});
    await writeFile(output, bytes);
    manifest.push({file: `/media/${file}`, source: new URL(file, base).href, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')});
  }
}));
await writeFile(new URL('reference/media-manifest.json', root), JSON.stringify(manifest.sort((a,b)=>a.file.localeCompare(b.file)), null, 2));
console.log(JSON.stringify({processSteps:data.process.length, materials:data.process.reduce((n,s)=>n+s.materials.length,0), films:data.films.length, skills:data.skills.length, questions:data.questions.length, assets:manifest.length, totalBytes:manifest.reduce((n,a)=>n+a.bytes,0)},null,2));
