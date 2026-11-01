/** Application behavior in jsdom; this does not measure layout or emulate a device. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const serialized = /^window\.PT_DATA\s*=\s*([\s\S]+);\s*$/.exec(fs.readFileSync('dist/data.js', 'utf8'));
assert.ok(serialized);
const fixture = JSON.parse(serialized[1]);
const source = fs.readFileSync('dist/app.js', 'utf8');
const index = fs.readFileSync('dist/index.html', 'utf8');
const rightsSource = fs.readFileSync('dist/rights.js', 'utf8');
assert.match(index, /name="author" content="許惟傑 Xue_hwcxx"/);
assert.match(index, /class="author-credit" href="https:\/\/github.com\/jaymoda88"/);
assert.equal((index.match(/<script\b/g) || []).length, 3, 'Only rights, data and app scripts load on entry');
assert.ok(index.indexOf('src="rights.js"') < index.indexOf('src="data.js"'), 'Attribution initializes before the application');
assert.ok(!/src="vendor\/|href="vendor\/katex/.test(index), 'Enhancements must load on demand');

function setup({ mobile, dark = false, failLibraries = false, saved = null, mutateData = null }) {
  const dom = new JSDOM(index, { runScripts: 'outside-only', url: 'https://workbench.test/' });
  const { window } = dom;
  const { document } = window;
  window.PT_DATA = JSON.parse(serialized[1]);
  if (mutateData) mutateData(window.PT_DATA);
  if (saved) window.localStorage.setItem('pro-tools-workbench-v1', JSON.stringify(saved));
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
  window.eval(rightsSource);
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
  const close = () => { window.PTRights.stop(); dom.window.close(); };
  return { dom, window, document, route, click, loads, diagramThemes, flushTimers, drain, mediaListeners, close };
}

function changeSelect(test, selector, value) {
  const select = test.document.querySelector(selector);
  assert.ok(select, `Missing control: ${selector}`);
  select.value = value;
  select.dispatchEvent(new test.window.Event('change', { bubbles: true }));
}

function setTrainer(test, settings) {
  Object.assign(test.window.PTWorkbench.trainerState, {
    basis: '2023.3', mode: 'learn', group: 'all', reviewOnly: false,
    index: 0, questionId: null, revealed: false, answered: null,
    ...settings
  });
  test.route('#/practice');
}

function testLearningModules(test) {
  const { window, document, route, click } = test;
  const app = window.PTWorkbench;
  const resources = fixture.resources;
  const paths = fixture.learningPaths;
  assert.ok(resources.length > 0 && paths.length > 0 && fixture.updates.length > 0);

  route('#/resources');
  assert.equal(document.querySelectorAll('#resourceResults .resource-card').length, resources.length);
  assert.equal(document.querySelectorAll('.learning-path-card').length, paths.length);
  assert.ok(document.getElementById('resourceResultCount').hasAttribute('aria-live'));
  assert.ok(!document.getElementById('resourceResults').hasAttribute('aria-live'), 'Announce a result count instead of every card');
  const sample = resources.find(resource => resource.levels?.length && resource.topics?.length);
  const filters = { language: sample.language, format: sample.format, cost: sample.cost, level: sample.levels[0], topic: sample.topics[0] };
  for (const [key, value] of Object.entries(filters)) changeSelect(test, `[data-resource-filter="${key}"]`, value);
  const expected = resources.filter(resource => resource.language === filters.language && resource.format === filters.format
    && resource.cost === filters.cost && resource.levels.includes(filters.level) && resource.topics.includes(filters.topic));
  assert.ok(expected.length > 0);
  assert.equal(document.querySelectorAll('#resourceResults .resource-card').length, expected.length);
  assert.equal(app.filterResources(filters).length, expected.length);
  for (const card of document.querySelectorAll('#resourceResults .resource-card')) {
    assert.ok(expected.some(resource => resource.id === card.dataset.resourceId));
  }
  click('reset-resources');
  assert.equal(document.querySelectorAll('#resourceResults .resource-card').length, resources.length);
  const query = document.getElementById('resourceQuery');
  query.focus();
  query.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles: true }));
  query.value = '查無資源zzz';
  query.dispatchEvent(new window.InputEvent('input', { bubbles: true, isComposing: true }));
  assert.equal(document.querySelectorAll('#resourceResults .resource-card').length, resources.length, 'Resource IME must not filter mid-composition');
  query.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles: true }));
  assert.equal(document.querySelectorAll('#resourceResults .resource-card').length, 0);
  assert.equal(document.activeElement, query);
  assert.ok(app.rankDocuments(sample.title).some(item => item.kind === 'resource' && item.resourceId === sample.id));
  for (const resource of resources) {
    route('#/resource/' + encodeURIComponent(resource.id));
    assert.equal(document.querySelector('.resource-detail .resource-card')?.dataset.resourceId, resource.id);
  }

  for (const path of paths) {
    route('#/path/' + encodeURIComponent(path.id));
    assert.equal(document.querySelectorAll('.learning-step').length, path.steps.length);
    assert.ok(path.steps.every(step => typeof step.id === 'string' && step.id.length > 0));
  }
  const path = paths[0], step = path.steps[0];
  route('#/path/' + encodeURIComponent(path.id));
  click('path-check', { path: path.id, step: '0' });
  const stableKey = path.id + '::' + step.id;
  assert.ok(app.state.pathChecks.has(stableKey));
  assert.ok(!app.state.pathChecks.has(path.id + '::' + step.title));
  assert.equal(document.activeElement?.dataset.action, 'path-check');
  assert.equal(document.activeElement?.dataset.step, '0');
  const saved = JSON.parse(window.localStorage.getItem('pro-tools-workbench-v1'));
  assert.ok(saved.pathChecks.includes(stableKey));

  assert.ok(app.rankDocuments('Track Pinning').some(item => item.kind === 'update'));
  const release = fixture.updates.find(item => item.features.length > 0);
  const feature = release.features[0];
  assert.ok(app.rankDocuments(feature.name).some(item => item.kind === 'update' && item.releaseVersion === release.version));
  const anchor = app.featureAnchor(release, feature, 0);
  route('#/updates?version=' + encodeURIComponent(release.version) + '#' + encodeURIComponent(anchor));
  assert.ok(document.getElementById(anchor));
  assert.ok(document.getElementById(anchor).closest('details').open);
  assert.ok(app.filteredUpdates({ version: release.version, topic: 'all' }).every(item => item.version === release.version));
  assert.equal(document.querySelectorAll('.release-block').length, 1);

  const trackManagement = fixture.notes.find(note => note.id.startsWith('PT-Ch13b-'));
  assert.ok(trackManagement);
  route('#/note/' + encodeURIComponent(trackManagement.id));
  assert.ok(document.querySelector('.reader-version-links a[href^="#/updates?version=2026.4"]'));
  const modernGuides = fixture.pages.filter(page => page.sourceVersion === '2026.4');
  assert.ok(modernGuides.length > 0);
  for (const guide of modernGuides) {
    route('#/reference/' + encodeURIComponent(guide.id));
    assert.ok(document.querySelector('.reader-header .note-meta').textContent.includes(guide.sourceVersion));
  }

  const baseBank = app.getPracticeBank('2023.3');
  const newBank = app.getPracticeBank('2026.4');
  const baseIds = new Set(fixture.shortcuts.map(item => item.id));
  const verified = fixture.shortcutEvidence.filter(entry => entry.version === '2026.4' && entry.status === 'verified' && baseIds.has(entry.shortcutId));
  assert.equal(baseBank.length, fixture.shortcuts.length);
  assert.equal(newBank.length, verified.length);
  assert.ok(newBank.length > 0);
  assert.equal(JSON.stringify(window.PT_DATA.shortcuts), JSON.stringify(fixture.shortcuts), 'New-version practice must not mutate the original table');
  assert.equal(app.canonicalPracticeKey('⌘⇧S'), app.canonicalPracticeKey('⇧⌘S'));
  assert.equal(app.canonicalPracticeKey('⌘ Space'), app.canonicalPracticeKey('⌘Space'));
  for (const question of [...baseBank, ...newBank]) {
    const choices = Array.from(app.practiceChoices(question));
    const canonical = choices.map(choice => app.canonicalPracticeKey(choice));
    assert.equal(new Set(canonical).size, choices.length, `Equivalent distractors: ${question.id}`);
    assert.equal(canonical.filter(key => key === app.canonicalPracticeKey(question.key)).length, 1);
    assert.ok(choices.includes(question.key));
    assert.ok(choices.length >= 2 && choices.length <= 4);
  }

  setTrainer(test, { mode: 'quiz' });
  const current = app.getPracticeBank().find(question => question.id === app.trainerState.questionId);
  const attempts = app.state.practice.attempts, correct = app.state.practice.correct;
  click('practice-answer', { answer: current.key });
  assert.equal(app.state.practice.attempts, attempts + 1);
  assert.equal(app.state.practice.correct, correct + 1);
  assert.ok(Array.from(document.querySelectorAll('.practice-option')).every(button => button.disabled));
  click('practice-answer', { answer: current.key });
  assert.equal(app.state.practice.attempts, attempts + 1, 'Duplicate answer events must not grade twice');
  assert.equal(app.state.practice.correct, correct + 1);

  const common = newBank[0];
  app.state.practice.known.clear(); app.state.practice.missed.clear();
  setTrainer(test, { basis: '2023.3', index: baseBank.findIndex(question => question.id === common.id) });
  click('practice-reveal'); click('practice-known');
  assert.ok(app.state.practice.known.has('2023.3:' + common.id));
  assert.ok(!app.state.practice.known.has('2026.4:' + common.id));
  changeSelect(test, '#practiceBasis', '2026.4');
  assert.equal(app.getPracticePool().length, newBank.length);
  setTrainer(test, { basis: '2026.4', index: newBank.findIndex(question => question.id === common.id) });
  click('practice-reveal'); click('practice-known');
  assert.ok(app.state.practice.known.has('2023.3:' + common.id) && app.state.practice.known.has('2026.4:' + common.id));
  assert.equal(app.state.practice.attempts, attempts + 1, 'Self-assessment must not inflate quiz counts');

  const hazard = newBank.find(question => question.id === 'K019');
  assert.ok(hazard && hazard.hazard === 'not-undoable');
  setTrainer(test, { basis: '2026.4', index: newBank.findIndex(question => question.id === 'K019') });
  assert.ok(document.querySelector('.practice-hazard'));
  assert.equal(document.querySelector('.practice-condition p').textContent, hazard.context);

  // Removing A from the review pool must leave B next, rather than skipping B.
  const review = baseBank.slice(0, 3);
  app.state.practice.known.clear(); app.state.practice.missed.clear();
  for (const question of review) app.state.practice.missed.add('2023.3:' + question.id);
  setTrainer(test, { reviewOnly: true });
  assert.equal(app.trainerState.questionId, review[0].id);
  click('practice-reveal'); click('practice-known');
  assert.equal(app.trainerState.questionId, review[1].id);
  assert.ok(!app.state.practice.missed.has('2023.3:' + review[0].id));
  assert.equal(app.getPracticePool().length, 2);
}

function copySelection(test, node, target = node) {
  const { window } = test;
  const range = window.document.createRange();
  range.selectNodeContents(node);
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  const copied = new Map([['text/plain', 'native clipboard placeholder']]);
  const event = new window.Event('copy', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: { setData(type, value) { copied.set(type, value); }, getData(type) { return copied.get(type) || ''; } } });
  target.dispatchEvent(event);
  return { event, copied, selected: selection.toString() };
}

async function testRights(test) {
  const { window, document, route } = test;
  const layer = document.getElementById('pt-rights-watermark');
  assert.ok(layer);
  assert.equal(layer.querySelectorAll('.pt-rights-watermark-stamp').length, 12);
  assert.ok(layer.textContent.includes('許惟傑') && layer.textContent.includes('jaymoda88'));
  layer.remove(); await test.drain();
  assert.equal(document.getElementById('pt-rights-watermark'), layer, 'Removed watermark restores without replacing application content');

  const note = fixture.notes[0];
  route('#/note/' + encodeURIComponent(note.id));
  const paper = document.querySelector('.reader-paper');
  const credit = paper.querySelector('[data-pt-rights-credit]');
  assert.ok(credit);
  const canonical = window.PTRights.canonicalDocumentUrl(note);
  const url = new URL(canonical);
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.search, '');
  assert.ok(url.pathname.startsWith('/jaymoda88/pro-tools-learning-workbench-zh-tw/blob/main/content/'));
  assert.equal(credit.querySelector('a').href, canonical);
  assert.ok(!canonical.includes('workbench.test') && !canonical.startsWith('file:'));

  // Fixture prose is kept separate from code so the listener's prose-only rule is exercised.
  const prose = document.createElement('p');
  prose.textContent = '這是用來確認長文複製來源標記的教學文字。'.repeat(12);
  paper.querySelector('#readerContent').append(prose);
  document.getElementById('main').focus();
  const longCopy = copySelection(test, prose);
  assert.equal(longCopy.event.defaultPrevented, true);
  assert.ok(longCopy.copied.get('text/plain').startsWith(prose.textContent));
  assert.ok(longCopy.copied.get('text/plain').includes(canonical));
  assert.ok(longCopy.copied.get('text/plain').includes('許惟傑'));
  assert.ok(!longCopy.copied.has('text/html'), 'Do not inject copied executable HTML');

  const short = document.createElement('p'); short.textContent = 'Clip Gain'; paper.append(short);
  const shortCopy = copySelection(test, short);
  assert.equal(shortCopy.event.defaultPrevented, false);
  assert.equal(shortCopy.copied.get('text/plain'), 'native clipboard placeholder');
  const code = document.createElement('code');
  code.textContent = 'const sampleRate = 48000; // retain copyable code\n'.repeat(10);
  const pre = document.createElement('pre'); pre.append(code); paper.append(pre);
  const codeCopy = copySelection(test, code);
  assert.equal(codeCopy.event.defaultPrevented, false, 'Long code must remain unmodified');
  assert.equal(codeCopy.copied.get('text/plain'), 'native clipboard placeholder');
  const input = document.getElementById('globalSearch'); input.focus();
  const inputCopy = copySelection(test, prose, input);
  assert.equal(inputCopy.event.defaultPrevented, false);
  document.getElementById('main').focus();
  const copyKey = document.createElement('button'); copyKey.dataset.action = 'copy-key'; document.body.append(copyKey);
  const buttonCopy = copySelection(test, prose, copyKey);
  assert.equal(buttonCopy.event.defaultPrevented, false);
  copyKey.remove();
  window.getSelection().removeAllRanges();
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

  testLearningModules(test);

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
  await testRights(test);
  await test.drain();
  test.close();
}
// Existing title-based checkpoints migrate once; stable IDs then survive wording edits.
const migrationPath = fixture.learningPaths[0], migrationStep = migrationPath.steps[0];
const oldTitleKey = migrationPath.id + '::' + migrationStep.title;
const stableKey = migrationPath.id + '::' + migrationStep.id;
const legacy = setup({ mobile: false, saved: { version: 1, saved: [], read: [], pathChecks: [oldTitleKey, 'unknown-step'] } });
assert.ok(legacy.window.PTWorkbench.state.pathChecks.has(stableKey));
assert.ok(!legacy.window.PTWorkbench.state.pathChecks.has(oldTitleKey));
assert.equal(legacy.window.PTWorkbench.state.pathChecks.size, 1);
legacy.close();
const renamed = setup({ mobile: false, saved: { version: 1, saved: [], read: [], pathChecks: [stableKey] }, mutateData(data) { data.learningPaths[0].steps[0].title += ' revised'; } });
assert.ok(renamed.window.PTWorkbench.state.pathChecks.has(stableKey));
renamed.close();

const failed = setup({ mobile: true, failLibraries: true });
failed.route('#/note/' + encodeURIComponent(fixture.notes.find(note => note.mermaidCount > 0).id));
await failed.drain();
assert.match(failed.document.querySelector('.diagram-status').textContent, /未能載入/);
assert.equal(failed.document.querySelector('.diagram-source').open, true, 'Failed diagrams retain readable source');
failed.close();
console.log(`PASS: mobile/desktop DOM behavior, ${fixture.notes.length} note and ${fixture.pages.length} reference routes, resource filters/detail routes, learning paths and progress migration, version search, two-edition trainer and review ordering, attribution/copy safety, IME, persistence, lazy-load requests, theme redraw, failure fallback and drawer focus. Device layout remains untested.`);
