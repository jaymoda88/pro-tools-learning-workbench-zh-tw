/** Validate the generated single-file release and exercise its DOM offline in jsdom.
 * This does not test real browser layout, device rendering, or visual fidelity.
 * Run after building and packaging: node scripts/check-single-file.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';

let phase = 'parse single-file payload';
process.on('uncaughtExceptionMonitor', error => console.error('Single-file phase:', phase, error.name, error.message, error.stack));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'site-dist');
const read = (base, name) => fs.readFileSync(path.join(base, name), 'utf8');
const version = JSON.parse(read(root, 'package.json')).version;
const release = path.join(root, 'release', `pro-tools-workbench-v${version}.html`);
const html = fs.readFileSync(release, 'utf8');
const jsonMatch = html.match(/<script\b(?=[^>]*\bid=["']pt-single-file-assets["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>([\s\S]*?)<\/script\s*>/i);
assert.ok(jsonMatch, 'Missing single-file JSON payload');
assert.doesNotMatch(jsonMatch[1], /<\/script/i, 'JSON must escape closing script tags');
const payload = JSON.parse(jsonMatch[1]); // strict JSON, never eval
assert.equal(payload.schemaVersion, 1);
assert.equal(payload.version, version);

const images = fs.readdirSync(path.join(site, 'assets')).filter(name => name.endsWith('.png')).sort();
assert.ok(images.length > 0, 'Source images must be present');
const imageKeys = Object.keys(payload.assets).filter(key => key.startsWith('assets/')).sort();
assert.deepEqual(imageKeys, images.map(name => `assets/${name}`));
for (const name of images) {
  const data = payload.assets[`assets/${name}`];
  assert.match(data, /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/);
  assert.deepEqual(Buffer.from(data.split(',')[1], 'base64'), fs.readFileSync(path.join(site, 'assets', name)), name);
}
const runtimePaths = ['vendor/mermaid.min.js', 'vendor/katex/katex.min.js', 'vendor/katex/contrib/auto-render.min.js'];
assert.deepEqual(Object.keys(payload.scripts).sort(), [...runtimePaths].sort());
for (const name of runtimePaths) assert.equal(payload.scripts[name], read(site, name), `Runtime changed: ${name}`);
const cssName = 'vendor/katex/katex.min.css';
const originalCss = read(site, cssName);
const css = payload.styles[cssName];
assert.equal(typeof css, 'string');
const fontUrls = [...originalCss.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(match => match[1]);
assert.ok(fontUrls.length, 'Expected KaTeX font URLs');
for (const url of new Set(fontUrls)) {
  assert.match(url, /^fonts\//);
  const key = `vendor/katex/${url}`;
  const ext = path.extname(url).slice(1);
  const mime = { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf' }[ext];
  assert.ok(mime, `Unexpected font type: ${url}`);
  const font = payload.assets[key];
  assert.equal(font, `data:${mime};base64,${fs.readFileSync(path.join(site, key)).toString('base64')}`, key);
}
// Replace complete url() tokens, so the .woff name cannot corrupt .woff2.
const expectedCss = originalCss.replace(/url\(["']?([^"')]+)["']?\)/g,
  (token, url) => token.replace(url, payload.assets[`vendor/katex/${url}`]));
assert.equal(css, expectedCss, 'KaTeX CSS must only replace every font URL with its exact embedded bytes');
assert.doesNotMatch(css, /url\(["']?fonts\//);
const noticeFiles = new Map([
  ['NOTICE.txt', site], ['LICENSE', root], ['CITATION.cff', root],
  ['vendor/MERMAID-LICENSE.txt', site], ['vendor/KATEX-LICENSE.txt', site]
]);
assert.ok(Array.isArray(payload.notices));
assert.equal(new Set(payload.notices.map(item => item.path)).size, payload.notices.length);
for (const [name, base] of noticeFiles) {
  const item = payload.notices.find(entry => entry.path === name);
  assert.ok(item, `Missing notice ${name}`);
  assert.equal(item.text, read(base, name), `Notice changed: ${name}`);
}
for (const item of payload.notices) {
  assert.ok(typeof item.path === 'string' && typeof item.text === 'string');
  const base = fs.existsSync(path.join(site, item.path)) ? site : root;
  assert.equal(item.text, read(base, item.path), `Notice changed: ${item.path}`);
}

class NoNetwork extends ResourceLoader {
  fetch(url) { throw new Error(`Unexpected resource request: ${url}`); }
}
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => errors.push(error));
const dom = new JSDOM(html, {
  url: pathToFileURL(release).href, runScripts: 'outside-only', resources: new NoNetwork(), virtualConsole
});
const { window } = dom;
const { document } = window;
window.fetch = () => { throw new Error('Unexpected fetch in offline release'); };
window.structuredClone = globalThis.structuredClone;
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.matchMedia = query => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} });
assert.equal(document.querySelectorAll('#pt-single-file-assets').length, 1);
for (const element of document.querySelectorAll('script[src],link[rel~="stylesheet"][href]')) {
  assert.fail(`External initial dependency: ${element.outerHTML.slice(0, 150)}`);
}
for (const name of ['style.css', 'responsive.css', 'rights.css']) {
  const elements = document.querySelectorAll(`style[data-pt-source="${name}"]`);
  assert.equal(elements.length, 1, `Expected inline ${name}`);
  assert.equal(elements[0].textContent, read(site, name));
}
assert.equal(document.querySelector('.usage-notice-link')?.getAttribute('href'), '#pt-offline-notices');
const noticeDetails = document.querySelector('#pt-offline-notices');
assert.ok(noticeDetails && (noticeDetails.matches('details') || noticeDetails.querySelector('details')));
for (const { text } of payload.notices) assert.ok(noticeDetails.textContent.includes(text), 'Notice text must be readable in the page');
const bySource = name => {
  const nodes = document.querySelectorAll(`script[data-pt-source="${name}"]`);
  assert.equal(nodes.length, 1, `Expected inline script ${name}`);
  return nodes[0].textContent;
};
const sourceData = read(site, 'data.js');
const assignment = /^window\.PT_DATA\s*=\s*([\s\S]+);\s*$/.exec(sourceData);
assert.ok(assignment, 'Expected strict source data JSON');
const data = JSON.parse(assignment[1]);
const sourceUrls = [...sourceData.matchAll(/https?:\/\/[^\s"\\<>]+/g)].map(match => match[0]);
assert.ok(sourceUrls.length, 'Expected original external source URLs');
const append = document.head.append.bind(document.head);
document.head.append = (...nodes) => {
  for (const node of nodes) {
    if (node.tagName === 'SCRIPT') {
      assert.ok(!node.hasAttribute('src'), 'Dynamic script must not fetch a URL');
      assert.ok(node.textContent, 'Dynamic offline script must have inline source');
      window.eval(node.textContent);
      if (window.mermaid && !window.mermaid.__domRunStubbed) {
        window.mermaid.run = async () => {}; // jsdom has no SVG layout; parser remains real.
        window.mermaid.__domRunStubbed = true;
      }
    }
    if (node.tagName === 'LINK') assert.fail('Dynamic stylesheet must be inline');
  }
  return append(...nodes);
};
for (const name of ['bootstrap.js', 'rights.js', 'data.js', 'app.js']) { phase = 'evaluate ' + name; window.eval(bySource(name)); }
assert.deepEqual(JSON.parse(JSON.stringify(window.PT_DATA)), data, 'Inline data must preserve original content and URLs');
const serializedData = JSON.stringify(window.PT_DATA);
for (const url of new Set(sourceUrls)) assert.ok(serializedData.includes(url), `Lost source URL: ${url}`);
assert.ok(window.PT_OFFLINE && window.PTWorkbench);
assert.ok(document.querySelector('#main').textContent.trim(), 'Homepage should render');
assert.ok(document.getElementById('pt-rights-watermark'), 'Rights watermark should render');
const route = hash => { phase = 'navigate ' + hash; window.history.replaceState(null, '', hash); window.PTWorkbench.render(); };
const drain = async () => { for (let i = 0; i < 500; i++) await Promise.resolve(); };
route('#/shortcuts');
const routeBeforeNotice = window.location.hash;
const mainBeforeNotice = document.querySelector('#main').innerHTML;
document.querySelector('.usage-notice-link').click();
assert.equal(window.location.hash, routeBeforeNotice, 'Notice link must preserve the current route');
assert.equal(document.querySelector('#main').innerHTML, mainBeforeNotice, 'Notice link must not replace the current page');
assert.ok(noticeDetails.open, 'Notice link should open the details element');
for (const [name] of noticeFiles) {
  const section = [...noticeDetails.querySelectorAll('section')].find(node => node.querySelector('h2')?.textContent === name);
  assert.ok(section?.querySelector('pre'), `Missing readable notice section: ${name}`);
  assert.equal(section.querySelector('pre').textContent, payload.notices.find(item => item.path === name).text);
}
route('#/search?q=' + encodeURIComponent('Pro Tools'));
assert.ok(document.querySelector('#main').textContent.includes('Pro Tools'), 'Search should render results');
route('#/shortcuts');
assert.equal(document.querySelectorAll('#shortcutResults tbody tr').length, data.shortcuts.length);
route('#/practice');
assert.ok(document.querySelector('#practiceBasis'), 'Practice should render');
const imageNote = data.notes.find(note => /<img\b[^>]*src=["']assets\//.test(note.html || ''));
assert.ok(imageNote, 'Expected a note containing an image');
route('#/note/' + encodeURIComponent(imageNote.id));
const readerImages = [...document.querySelectorAll('#readerContent img')];
assert.ok(readerImages.length);
for (const image of readerImages) assert.match(image.getAttribute('src'), /^data:image\/png;base64,/);
await drain();
const mathNote = data.notes.find(note => Number(note.mathCount) > 0);
assert.ok(mathNote, 'Expected a note containing math');
route('#/note/' + encodeURIComponent(mathNote.id));
await drain();
assert.ok(window.katex && window.renderMathInElement, 'Real KaTeX libraries should load from the payload');
assert.ok(document.querySelector('#readerContent .katex'), 'A real formula should render as KaTeX DOM');
if (!window.mermaid) {
  const diagramNote = data.notes.find(note => Number(note.mermaidCount) > 0);
  assert.ok(diagramNote);
  route('#/note/' + encodeURIComponent(diagramNote.id));
  await drain();
}
assert.ok(window.mermaid?.parse, 'Real Mermaid parser should load');
assert.ok(await window.mermaid.parse('flowchart LR\n A-->B'), 'Real Mermaid parser should accept a simple diagram');
assert.deepEqual(errors, [], 'No jsdom resource or execution errors');
window.PTRights?.stop();
window.close();
console.log(`PASS single-file v${version}: assets, payload, notices and offline DOM (jsdom; no real-browser visual test)`);
