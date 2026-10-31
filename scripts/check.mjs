import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),sandbox);
const d=sandbox.window.PT_DATA;
assert.equal(d.notes.length,122,'Expected all 122 teaching notes');
assert.equal(d.shortcuts.length,135,'Expected 135 verified Mac shortcuts');
assert.equal(new Set(d.notes.map(n=>n.id)).size,122,'Note IDs must be unique');
assert.equal(new Set(d.notes.map(n=>n.chapter)).size,66,'All 66 chapters must be represented');
assert.equal(d.categories.length,8);
const ids=new Set(d.notes.map(n=>n.id));let assets=0,links=0;
for(const n of d.notes){
 assert.ok(n.title&&n.html&&n.plain&&n.category,`Incomplete note ${n.id}`);
 for(const m of n.html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
  const v=m[1];
  if(v.startsWith('assets/')){assert.ok(fs.existsSync(path.join('dist',decodeURIComponent(v.split('#')[0]))),`Missing asset ${v}`);assets++;}
  if(v.startsWith('#/note/')){assert.ok(ids.has(decodeURIComponent(v.slice(7).split('#')[0])),`Broken note link ${v}`);links++;}
 }
}
for(const k of d.shortcuts)assert.ok(k.id&&k.action&&k.key&&k.context,`Incomplete shortcut ${k.id}`);
console.log(`PASS: ${d.notes.length} notes, 66 chapters, ${d.shortcuts.length} shortcuts, ${assets} assets, ${links} internal links.`);
