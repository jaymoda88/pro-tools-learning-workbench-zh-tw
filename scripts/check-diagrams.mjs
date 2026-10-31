/** Parse diagrams with the shipped Mermaid bundle in a DOM fixture; no browser layout. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const wrapper = /^window\.PT_DATA\s*=\s*([\s\S]+);\s*$/.exec(fs.readFileSync('dist/data.js', 'utf8'));
assert.ok(wrapper, 'Expected a JSON assignment');
const data = JSON.parse(wrapper[1]);
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
dom.window.eval(fs.readFileSync('dist/vendor/mermaid.min.js', 'utf8'));
const mermaid = dom.window.mermaid;
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true });
let count = 0;
const failures = [];
for (const document of [...data.notes, ...data.pages]) {
  const holder = dom.window.document.createElement('div');
  holder.innerHTML = document.html;
  const blocks = [...holder.querySelectorAll('pre code.language-mermaid')];
  assert.equal(blocks.length, document.mermaidCount, `Lost diagram: ${document.id}`);
  for (const [index, block] of blocks.entries()) {
    try {
      const parsed = await mermaid.parse(block.textContent);
      assert.ok(parsed, 'Parser did not accept the diagram');
      count++;
    } catch (error) {
      failures.push(`${document.id}, diagram ${index + 1}: ${error.message}`);
    }
  }
}
dom.window.close();
assert.deepEqual(failures, [], failures.join('\n'));
assert.ok(count > 0, 'No diagrams were parsed');
console.log(`PASS: ${count} Mermaid diagrams parsed with the shipped bundle. Layout, SVG appearance and device rendering are not tested.`);
