import assert from 'node:assert/strict';
import { readFile, access, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';
import { load } from 'cheerio';

const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
  const {render}=await server.ssrLoadModule('/scripts/render.jsx');
  const html=render();
  const $=load(html);
  const ids=$('main > section').map((_,el)=>$(el).attr('id')).get();
  assert.deepEqual(ids,['intro','story','values','profile','work','zara','zara-details','zara-process','personal','film','clone','skills','about','closing','contact']);
  assert.equal($('h1').length,1);
  assert.equal($('#zara-details [data-panel]').length,4);
  assert.equal($('#zara-process [data-panel]').length,7);
  assert.equal($('#zara-process .zara-process__tabs button').length,20);
  assert.equal($('video').length,3);
  assert.equal($('.film__copy dl > div').length,18);
  assert.equal($('.skills__list article').length,6);
  assert.equal($('.about details').length,4);
  assert.equal($('a[href=""], a[href="#"], video[autoplay]').length,0);
  const seen=new Set();
  $('[id]').each((_,el)=>{const id=$(el).attr('id');assert(!seen.has(id),`Duplicate id: ${id}`);seen.add(id);});
  $('a[href^="#"]').each((_,el)=>assert(seen.has($(el).attr('href').slice(1)),`Broken anchor: ${$(el).attr('href')}`));
  $('img').each((_,el)=>assert($(el).attr('alt')!==undefined,'Image missing alt'));
  const manifest=JSON.parse(await readFile('reference/media-manifest.json','utf8'));
  for(const item of manifest){
    const bytes=await readFile(`public${item.file}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,`Changed source asset: ${item.file}`);
  }
  const media=new Set();
  $('[src],image[href]').each((_,el)=>{const p=$(el).attr('src')||$(el).attr('href');if(p?.startsWith('/media/'))media.add(p);});
  for(const p of media)await access(`public${p}`);
  const links=[...new Set($('a[href^="https:"]').map((_,el)=>$(el).attr('href')).get())];
  const externalResults=await Promise.all(links.map(async url=>{
    try{const response=await fetch(url,{signal:AbortSignal.timeout(20000)});await response.body?.cancel();return {url,status:response.status,ok:response.ok};}
    catch(error){return {url,ok:false,error:error.message};}
  }));
  const result={sections:ids,headings:1,zaraDetailPanels:4,uxPanels:7,uxMaterials:20,videos:3,videoDescriptions:18,skillCategories:6,questions:4,sourceAssetsVerified:manifest.length,externalLinks:externalResults,browserVerification:'Not run: browser runtime returned no available browsers. Layout, playback, focus and scroll behaviour still require real-browser verification.'};
  await writeFile('reference/verification.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
} finally {await server.close();}
