/** Validate serialized data without evaluating data.js or any application code. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';

const input = fs.readFileSync('dist/data.js', 'utf8');
const wrapper = /^window\.PT_DATA\s*=\s*([\s\S]+);\s*$/.exec(input);
assert.ok(wrapper, 'data.js must contain only the PT_DATA JSON assignment');
const data = JSON.parse(wrapper[1]);
const sourceFiles = fs.readdirSync('content').filter(name => name.endsWith('.md'));
const sourceNotes = sourceFiles.filter(name => /^PT-Ch/.test(name));
const sourcePages = sourceFiles.filter(name => /^PT-00-/.test(name));
const notes = data.notes || [];
const pages = data.pages || [];
const documents = [...notes, ...pages];
const noteIds = new Set(notes.map(note => note.id));
const pageIds = new Set(pages.map(page => page.id));
const byId = new Map(documents.map(document => [document.id, document]));
assert.ok(notes.length > 0 && pages.length > 0, 'Chapter and reference content are required');
assert.deepEqual([...noteIds].sort(), sourceNotes.map(name => name.slice(0, -3)).sort(), 'Every chapter source must have exactly one generated document');
assert.deepEqual([...pageIds].sort(), sourcePages.map(name => name.slice(0, -3)).sort(), 'Every reference source must have a browser route');
assert.equal(documents.length, byId.size, 'Document IDs must be unique');

const sourceChapters = new Set(sourceNotes.map(name => {
  const text = fs.readFileSync(path.join('content', name), 'utf8');
  const match = /^chapter:\s*(\d+)/m.exec(text);
  assert.ok(match, `Missing chapter metadata: ${name}`);
  return Number(match[1]);
}));
assert.deepEqual([...new Set(notes.map(note => note.chapter))].sort((a, b) => a - b), [...sourceChapters].sort((a, b) => a - b));
const categoryIds = new Set(data.categories.map(category => category.id));
assert.equal(categoryIds.size, data.categories.length, 'Category IDs must be unique');

const avidBase = 'https://resources.avid.com/SupportFiles/PT/';
const officialPdfNames = new Set([
  'Pro_Tools_Reference_Guide_2023.3.pdf',
  'Pro_Tools_Shortcuts_2023.3.pdf',
]);
let assetReferences = 0;
let documentLinks = 0;
let officialLinks = 0;
let diagrams = 0;
let formulae = 0;

for (const document of documents) {
  assert.ok(document.title && document.summary && document.html && document.plain && document.category, `Incomplete document: ${document.id}`);
  assert.ok(!Object.hasOwn(document, 'markdown'), `Unused Markdown payload: ${document.id}`);
  assert.ok(!/PTWEBTOKEN\d+END|PTMATHPLACEHOLDER/.test(document.html), `Unresolved rendering placeholder: ${document.id}`);
  assert.ok(!/標籤[:：]\s*#/.test(document.html), `Vault tag boilerplate leaked: ${document.id}`);
  assert.ok(!/Pro<em>Tools<\/em>Reference/.test(document.html), `PDF label corrupted by Markdown: ${document.id}`);
  assert.ok(!/<a\b[^>]*>\s*PT-(?:Ch\d+|00-)/i.test(document.html), `Internal identifier exposed as a link label: ${document.id}`);
  assert.ok(!/language-(?:dataview|tasks)/.test(document.html), `Plugin-only query leaked: ${document.id}`);
  assert.ok(Array.isArray(document.headings), `Missing heading index: ${document.id}`);
  const headingIds = new Set(document.headings.map(heading => heading.id));
  assert.equal(headingIds.size, document.headings.length, `Duplicate heading IDs: ${document.id}`);
  if (document.type === 'study-note') assert.ok(categoryIds.has(document.category), `Unknown category: ${document.id}`);
  diagrams += document.mermaidCount || 0;
  formulae += document.mathCount || 0;
  for (const match of document.html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const url = match[1].replaceAll('&amp;', '&');
    if (url.startsWith('assets/')) {
      const filename = decodeURIComponent(url.split('#')[0]);
      assert.ok(!filename.toLowerCase().endsWith('.pdf'), `Locally redistributed source PDF: ${url}`);
      assert.ok(fs.existsSync(path.join('dist', filename)), `Missing asset: ${url}`);
      assetReferences++;
    }
    if (url.startsWith('#/note/') || url.startsWith('#/reference/')) {
      const route = /^#\/(note|reference)\/([^#]+)(?:#(.*))?$/.exec(url);
      assert.ok(route, `Invalid document route: ${url}`);
      const identifier = decodeURIComponent(route[2]);
      const expectedIds = route[1] === 'note' ? noteIds : pageIds;
      assert.ok(expectedIds.has(identifier), `Broken ${route[1]} link: ${url}`);
      if (route[3]) {
        const targetIds = new Set(byId.get(identifier).headings.map(heading => heading.id));
        assert.ok(targetIds.has(decodeURIComponent(route[3])), `Broken target heading: ${url}`);
      }
      documentLinks++;
    } else if (url.startsWith('#') && !url.startsWith('#/')) {
      assert.ok(headingIds.has(decodeURIComponent(url.slice(1))), `Broken local heading in ${document.id}: ${url}`);
    }
    if (url.includes('.pdf')) {
      const parsed = new URL(url);
      assert.ok(url.startsWith(avidBase), `Source PDF must use an official Avid URL: ${url}`);
      assert.ok(officialPdfNames.has(decodeURIComponent(parsed.pathname.split('/').at(-1))), `Unexpected PDF: ${url}`);
      if (parsed.hash) assert.match(parsed.hash, /^#page=[1-9]\d*$/, `Invalid PDF page anchor: ${url}`);
      officialLinks++;
    }
  }
  for (const image of document.html.matchAll(/<img\b[^>]*\balt="([^"]*)"[^>]*>/g)) {
    assert.ok(image[1] && !/^PT-Ch\d+.*\.png$/i.test(image[1]), `Image needs a descriptive alt: ${document.id}`);
  }
}

const shortcutSource = fs.readFileSync('content/PT-00-Mac快捷鍵.md', 'utf8');
const shortcutSourceIds = [...shortcutSource.matchAll(/^\| (K\d{3}) /gm)].map(match => match[1]);
const shortcutIds = data.shortcuts.map(shortcut => shortcut.id);
assert.deepEqual(shortcutIds, shortcutSourceIds, 'Generated shortcuts must cover the source rows in order');
assert.equal(new Set(shortcutIds).size, shortcutIds.length, 'Shortcut IDs must be unique');
for (const shortcut of data.shortcuts) {
  assert.ok(shortcut.id && shortcut.action && shortcut.key && shortcut.context && shortcut.group, `Incomplete shortcut: ${shortcut.id}`);
  assert.ok(Number.isInteger(shortcut.pdfPage) && shortcut.pdfPage > 0, `Invalid shortcut page: ${shortcut.id}`);
}
for (const workflow of data.workflows) {
  assert.ok(workflow.title && workflow.description && workflow.noteIds?.length, 'Workflows must use explicit note IDs');
  for (const id of workflow.noteIds) assert.ok(noteIds.has(id), `Broken workflow target: ${id}`);
}
for (const [feature, id] of Object.entries(data.featureNoteIds || {})) {
  assert.ok(noteIds.has(id), `Broken feature target ${feature}: ${id}`);
}
const featurePrefixes = {bus: 'PT-Ch06b-', send: 'PT-Ch50b-', freeze: 'PT-Ch47b-', monitoring: 'PT-Ch24b-'};
for (const [feature, prefix] of Object.entries(featurePrefixes)) {
  assert.ok(data.featureNoteIds[feature].startsWith(prefix), `Feature must target the relevant split note: ${feature}`);
}
assert.ok(data.workflows.find(workflow => workflow.title.includes('沒有聲音')).noteIds.includes(data.featureNoteIds.monitoring), 'Latency workflow must include the monitoring subchapter');
assert.ok(officialLinks > 0 && diagrams > 0 && formulae > 0, 'References, diagrams and math must survive conversion');
console.log(`PASS: ${notes.length} notes, ${pages.length} references, ${sourceChapters.size} chapters, ${data.shortcuts.length} shortcuts, ${assetReferences} image references, ${documentLinks} document links, ${officialLinks} official PDF links, ${diagrams} Mermaid diagrams, ${formulae} math spans. JSON parsed without evaluation.`);
