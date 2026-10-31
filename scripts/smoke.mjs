/** Application behavior in jsdom; this does not measure layout or emulate a device. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const serialized = /^window\.PT_DATA\s*=\s*([\s\S]+);\s*$/.exec(fs.readFileSync('dist/data.js', 'utf8'));
assert.ok(serialized);
const fixture = JSON.parse(serialized[1]);
const source = fs.readFileSync('dist/app.js', 'utf8');
const index = fs.readFileSync('dist/index.html', 'utf8');
assert.match(index, /name="author" content="許惟傑 Xue_hwcxx"/);
assert.match(index, /class="author-credit" href="https:\/\/github.com\/jaymoda88"/);
assert.equal((index.match(/<script\b/g) || []).length, 2, 'Only data and app scripts load on entry');
assert.ok(!/src="vendor\/|href="vendor\/katex/.test(index), 'Enhancements must load on demand');

function setup({ mobile, dark = false, failLibraries = false }) {
  const dom = new JSDOM(index, { runScripts: 'outside-only', url: 'https://workbench.test/' });
  const { window } = dom;
  const { document } = window;
  window.PT_DATA = JSON.parse(serialized[1]);
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  const mediaListeners = new Map();
  window.matchMedia = query => ({
    matches: query.includes('max-width') ? mobile : query.includes('prefers-color-scheme') ? dark : false,
    media: query,
    addEventListener(type, fn) { mediaListeners.set(query, fn); }
  });
  const timers = new Map();
  let timerId = 0;
  window.setTimeout = fn => { timers.set(++timerId, fn); return timerId; };
  window.clearTimeout = id => timers.delete(id);
  const loads = [];
  const diagramThemes = [];
  const append = document.head.append.bind(document.head);
  document.head.append = (...nodes) => {
    append(...nodes);
    for (const node of nodes) {
      if (!['SCRIPT', 'LINK'].includes(node.tagName)) continue;
      loads.push(node.getAttribute('src') || node.getAttribute('href'));
      if (!failLibraries) {
        if (node.src?.includes('mermaid.min.js')) {
          window.mermaid = {
            initialize(config) { diagramThemes.push(config.theme); },
            async run({ nodes }) { for (const canvas of nodes) canvas.innerHTML = '<svg aria-label="fixture diagram"></svg>'; }
          };
        } else if (node.src?.includes('auto-render.min.js')) {
          window.renderMathInElement = root => {
            const span = document.createElement('span'); span.className = 'katex'; root.append(span);
          };
        } else if (node.src?.includes('katex.min.js')) window.katex = {};
      }
      queueMicrotask(() => failLibraries ? node.onerror?.() : node.onload?.());
    }
  };
  window.eval(source);
  const route = hash => { window.history.replaceState(null, '', hash); window.PTWorkbench.render(); };
  const click = (action, extra = {}) => {
    const button = document.createElement('button');
    button.dataset.action = action;
    Object.assign(button.dataset, extra);
    document.body.append(button);
    button.click();
    button.remove();
  };
  const flushTimers = () => { const pending = [...timers.values()]; timers.clear(); for (const fn of pending) fn(); };
  const drain = async () => { for (let i = 0; i < 400; i++) await Promise.resolve(); };
  return { dom, window, document, route, click, loads, diagramThemes, flushTimers, drain, mediaListeners };
}

for (const mobile of [false, true]) {
  const test = setup({ mobile, dark: mobile });
  const { window, document, route, click } = test;
  const app = window.PTWorkbench;
  const main = document.getElementById('main');
  assert.equal(app.state.theme, mobile ? 'dark' : 'light', 'First visit follows system theme');
  assert.equal(app.state.themePreference, 'system');
  assert.equal(test.loads.length, 0, 'Homepage must not request diagram or math vendors');
  assert.equal(document.querySelectorAll('#mobileNav a').length, 6);
  assert.equal(document.getElementById('sidebar').inert, mobile);
  assert.ok(app.rankNotes('沒有聲音')[0].id.startsWith('PT-Ch07a-'));
  assert.ok(app.rankNotes('沒有聲音').length < 20, 'Troubleshooting search must stay focused');
  assert.ok(app.rankNotes('卡音').length < 20, 'Stuck notes must not expand to all MIDI');
  assert.ok(app.rankNotes('修音 人聲').some(note => note.id.startsWith('PT-Ch46-')));
  assert.ok(app.rankDocuments('原文疑義').some(item => item.id === 'PT-00-版本與原文疑義'));
  assert.equal(app.rankNotes('zzzx不存在字串').length, 0);
  assert.equal(app.hasKey('⌘Space', 'A'), false);
  assert.equal(app.hasKey('⇧S', 'S'), true);

  const search = document.getElementById('globalSearch');
  search.focus();
  search.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles: true }));
  search.value = '修';
  const before = main.innerHTML;
  search.dispatchEvent(new window.InputEvent('input', { bubbles: true, isComposing: true }));
  search.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }));
  test.flushTimers();
  assert.equal(main.innerHTML, before, 'IME selection must not navigate');
  assert.equal(document.activeElement, search, 'IME selection must retain input focus');
  search.value = '修音 人聲';
  search.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles: true }));
  test.flushTimers();
  assert.match(main.textContent, /Melodyne/);

  for (const hash of ['#/topics', '#/workflows', '#/tools', '#/saved', '#/references']) route(hash);
  route('#/shortcuts');
  let results = document.getElementById('shortcutResults');
  assert.equal(results.querySelectorAll('tbody tr').length, fixture.shortcuts.length);
  for (const label of ['功能／用途', 'Mac 按鍵', '必要條件', '來源']) {
    assert.equal(results.querySelectorAll(`td[data-label="${label}"]`).length, fixture.shortcuts.length);
  }
  const shortcutQuery = document.getElementById('shortcutQuery');
  const shortcutBefore = results.innerHTML;
  shortcutQuery.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles: true }));
  shortcutQuery.value = '找不到的輸入';
  shortcutQuery.dispatchEvent(new window.InputEvent('input', { bubbles: true, isComposing: true }));
  assert.equal(results.innerHTML, shortcutBefore);
  shortcutQuery.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles: true }));
  assert.equal(results.querySelectorAll('tbody tr').length, 0);

  for (const note of fixture.notes) { route('#/note/' + encodeURIComponent(note.id)); assert.ok(main.querySelector('.reader-paper')); }
  for (const page of fixture.pages) { route('#/reference/' + encodeURIComponent(page.id)); assert.ok(main.querySelector('.reader-paper')); }
  await test.drain();
  const id = fixture.notes[0].id;
  route('#/note/' + encodeURIComponent(id));
  click('bookmark', { id }); click('read', { id }); click('font-larger');
  const previousTheme = app.state.theme;
  click('theme');
  const saved = JSON.parse(window.localStorage.getItem('pro-tools-workbench-v1'));
  assert.ok(saved.saved.includes(id) && saved.read.includes(id));
  assert.equal(saved.font, 19);
  assert.equal(saved.theme, previousTheme === 'light' ? 'dark' : 'light');
  assert.equal(saved.themePreference, saved.theme);
  route('#/tools'); click('signal', { node: 'bus' });
  assert.ok(document.getElementById('signalDetail').querySelector('a').getAttribute('href').includes(encodeURIComponent(app.featureNoteIds.bus)));
  const diagramNote = fixture.notes.find(note => note.mermaidCount > 0);
  route('#/note/' + encodeURIComponent(diagramNote.id)); await test.drain();
  assert.ok(test.loads.includes('vendor/mermaid.min.js'));
  const count = test.diagramThemes.length;
  click('theme'); await test.drain();
  assert.ok(test.diagramThemes.length > count, 'Theme changes must redraw diagrams');
  if (mobile) {
    click('menu');
    assert.equal(document.querySelector('.workspace').inert, true);
    assert.equal(document.getElementById('mobileNav').inert, true);
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(document.activeElement, document.querySelector('[data-action="menu"]'));
    assert.equal(document.getElementById('sidebar').inert, true);
    click('menu');
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    assert.equal(document.querySelector('.workspace').inert, false);
    assert.equal(document.activeElement, document.getElementById('globalSearch'));
  }
  await test.drain();
  test.dom.window.close();
}
const failed = setup({ mobile: true, failLibraries: true });
failed.route('#/note/' + encodeURIComponent(fixture.notes.find(note => note.mermaidCount > 0).id));
await failed.drain();
assert.match(failed.document.querySelector('.diagram-status').textContent, /未能載入/);
assert.equal(failed.document.querySelector('.diagram-source').open, true, 'Failed diagrams retain readable source');
failed.dom.window.close();
console.log(`PASS: mobile/desktop DOM behavior, ${fixture.notes.length} note and ${fixture.pages.length} reference routes, focused search, IME, persistence, lazy-load requests, theme redraw, failure fallback and drawer focus. Device layout remains untested.`);
