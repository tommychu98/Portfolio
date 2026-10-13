import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base=process.argv[2]||'http://localhost:5173/';
const page=await fetch(base);
assert.equal(page.status,200);
const html=await page.text();
assert(html.includes('JEON JIHYUN'));
assert(html.includes('정보를 정리하고'));
const manifest=JSON.parse(await readFile('reference/media-manifest.json','utf8'));
const queue=[...manifest];const results=[];
await Promise.all(Array.from({length:4},async()=>{
  while(queue.length){
    const item=queue.shift();const response=await fetch(new URL(item.file,base));
    assert.equal(response.status,200,item.file);
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.file);
    results.push({file:item.file,status:response.status,type:response.headers.get('content-type'),bytes:bytes.length,sha256Matches:true});
  }
}));
const ranges=[];
for(const item of manifest.filter(item=>item.file.endsWith('.webm'))){
  const response=await fetch(new URL(item.file,base),{headers:{Range:'bytes=0-63'}});
  assert.equal(response.status,206);assert.equal((await response.arrayBuffer()).byteLength,64);
  ranges.push({file:item.file,status:response.status,range:response.headers.get('content-range')});
}
const result={url:base,htmlStatus:200,utf8:true,media:results.sort((a,b)=>a.file.localeCompare(b.file)),videoRangeRequests:ranges,browserRenderingVerified:false};
await writeFile('reference/local-preview.json',JSON.stringify(result,null,2)+'\n');
console.log({url:base,html:200,mediaFiles:results.length,mediaHashes:'all match',videoRangeRequests:ranges.length,browserRenderingVerified:false});
