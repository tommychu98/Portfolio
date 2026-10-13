import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
const baseline=JSON.parse(await readFile('reference/typography-before.json','utf8'));
function protectedStyles(text){
  const result=[];
  postcss.parse(text).walkDecls(d=>{
    if(d.parent.type==='atrule'&&d.parent.name==='font-face')return;
    if(['font-family','font-weight','font-style','letter-spacing','text-transform','--poster','--subheading'].includes(d.prop))return;
    const ancestry=[];
    for(let p=d.parent;p;p=p.parent){if(p.type==='rule')ancestry.unshift(p.selector);if(p.type==='atrule')ancestry.unshift('@'+p.name+' '+p.params);}
    result.push([ancestry.join(' > '),d.prop,d.value]);
  });
  return result;
}
let css=0,source=0,media=0;
for(const [file,before] of Object.entries(baseline)){
  const bytes=await readFile(file);
  if(file.endsWith('.css')){assert.deepEqual(protectedStyles(bytes.toString('utf8')),protectedStyles(before.text),file);css++;}
  else if(!file.endsWith('.md')){assert.equal(createHash('sha256').update(bytes).digest('hex'),before.hash,file);if(file.startsWith('public/media/'))media++;else source++;}
}
const result={passed:true,cssFiles:css,sourceFiles:source,mediaFiles:media,preserved:'Exact color, background, border, box, spacing, font-size, line-height, motion and breakpoint declarations; original JSX/data/media unchanged.',limitation:'Source comparison, not rendered browser layout. Font advance measurements do not replace viewport testing.'};
await writeFile('reference/typography-verification.json',JSON.stringify(result,null,2)+'\n');
console.log(result);
