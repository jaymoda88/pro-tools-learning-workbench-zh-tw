/** Validate learning catalogues as JSON; no application or remote source is executed. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const wrapper = /^window\.PT_DATA\s*=\s*([\s\S]+);\s*$/.exec(fs.readFileSync('dist/data.js', 'utf8'));
assert.ok(wrapper, 'Expected only the serialized data assignment');
const data = JSON.parse(wrapper[1]);
const catalogue = JSON.parse(fs.readFileSync('content/resources.json', 'utf8'));
const bridge = JSON.parse(fs.readFileSync('content/updates.json', 'utf8'));
const evidence = JSON.parse(fs.readFileSync('content/shortcut-evidence.json', 'utf8'));
const notes = new Set(data.notes.map(note => note.id));
const shortcuts = new Map(data.shortcuts.map(shortcut => [shortcut.id, shortcut]));
const resourceIds = new Set();
const primaryUrls = new Set();
const pathIds = new Set();
const featureIds = new Set();
const enums = {
  language: new Set(['en', 'zh-Hant', 'zh-Hans', 'multi']),
  cost: new Set(['free', 'paid', 'mixed', 'unknown']),
  level: new Set(['beginner', 'intermediate', 'advanced']),
  status: new Set(['source-reviewed', 'limited', 'unverified', 'unavailable']),
  sourceGroup: new Set(['official', 'english', 'chinese', 'practice'])
};
function url(value, label) {
  const parsed = new URL(value);
  assert.ok(['https:', 'http:'].includes(parsed.protocol), `Unsafe URL in ${label}`);
  assert.ok(!parsed.username && !parsed.password, `Credentials in URL: ${label}`);
  assert.ok(!/localhost|127\.0\.0\.1/.test(parsed.hostname), `Local URL: ${label}`);
  return parsed;
}
function references(ids, label) {
  assert.ok(Array.isArray(ids), `Expected note references: ${label}`);
  for (const id of ids) assert.ok(notes.has(id), `Unknown note ${id} in ${label}`);
}
assert.deepEqual(data.resources, catalogue.resources, 'Resource source and output must agree');
assert.deepEqual(data.learningPaths, catalogue.learningPaths, 'Path source and output must agree');
assert.equal(data.resources.length, catalogue.resourceCount);
assert.ok(catalogue.sourceRecordCount >= data.resources.length);
assert.equal(data.resourceMeta.provenance.kind, 'user-research');
assert.equal(data.resourceMeta.provenance.liveAvailabilityChecked, false, 'Do not imply a full live audit');
for (const resource of data.resources) {
  assert.ok(resource.id && resource.title && resource.summary && resource.provider && resource.version && resource.rights);
  assert.ok(!resourceIds.has(resource.id), `Duplicate resource ID: ${resource.id}`);
  resourceIds.add(resource.id);
  url(resource.url, resource.title);
  assert.ok(!primaryUrls.has(resource.url), `Undeduplicated primary URL: ${resource.url}`);
  primaryUrls.add(resource.url);
  for (const link of resource.links) { assert.ok(link.label); url(link.url, resource.title); }
  assert.ok(enums.language.has(resource.language) && enums.cost.has(resource.cost));
  assert.ok(resource.levels.length && resource.levels.every(level => enums.level.has(level)));
  assert.ok(enums.sourceGroup.has(resource.sourceGroup) && resource.topics.length);
  assert.ok(enums.status.has(resource.verification.status));
  assert.equal(resource.verification.scope, 'user-research');
  assert.equal(resource.verification.checkedAt, catalogue.researchDate);
  references(resource.relatedNoteIds, resource.title);
}
let checkpoints = 0;
for (const path of data.learningPaths) {
  assert.ok(path.id && path.title && path.description && enums.level.has(path.level));
  assert.ok(!pathIds.has(path.id)); pathIds.add(path.id);
  assert.ok(path.steps.length > 1);
  for (const step of path.steps) {
    assert.ok(step.id && step.title && step.checkpoint && step.noteIds.length && step.resourceIds.length);
    references(step.noteIds, path.title);
    for (const id of step.resourceIds) assert.ok(resourceIds.has(id), `Unknown path resource: ${id}`);
    checkpoints++;
  }
}
assert.equal(data.updates.length, bridge.releases.length);
assert.equal(data.versionMeta.baseline, bridge.baseline);
assert.equal(data.versionMeta.documentVersion, bridge.documentVersion);
let features = 0;
for (const release of data.updates) {
  assert.ok(release.id && release.version && release.title && release.summary && release.features.length);
  for (const source of release.sources || []) if (source.url) url(source.url, release.title);
  for (const feature of release.features) {
    assert.ok(feature.id && feature.name && feature.summary && feature.sources.length);
    assert.ok(!featureIds.has(feature.id), `Duplicate feature ID: ${feature.id}`); featureIds.add(feature.id);
    references(feature.noteIds, feature.name);
    assert.ok(feature.noteIds.length && feature.steps.length && feature.checkpoint);
    for (const source of feature.sources) {
      const parsed = url(source.url, feature.name);
      assert.ok(['resources.avid.com', 'kb.avid.com', 'www.avid.com'].includes(parsed.hostname), 'Version evidence must be primary Avid sources');
      if (source.pdfPage !== undefined && source.pdfPage !== null) {
        assert.ok(Number.isInteger(source.pdfPage) && source.pdfPage > 0);
        assert.equal(parsed.hash, '#page=' + source.pdfPage);
      }
    }
    features++;
  }
}
assert.deepEqual(data.shortcutEvidence, evidence.entries, 'Shortcut evidence must not silently change');
const verified = data.shortcutEvidence.filter(entry => entry.status === 'verified');
assert.equal(verified.length, evidence.coverage.verified);
assert.equal(evidence.coverage.totalBaseShortcuts, data.shortcuts.length);
assert.equal(evidence.coverage.reviewed + evidence.coverage.unreviewed, data.shortcuts.length);
const seenEvidence = new Set();
for (const entry of data.shortcutEvidence) {
  assert.ok(shortcuts.has(entry.shortcutId), `Unknown evidence ID: ${entry.shortcutId}`);
  assert.ok(!seenEvidence.has(entry.shortcutId)); seenEvidence.add(entry.shortcutId);
  const original = shortcuts.get(entry.shortcutId);
  assert.equal(entry.macKey, original.key, 'Verified subset must retain the audited base binding');
  assert.equal(entry.context, original.context, 'Conditions must remain part of the answer');
  assert.ok(entry.pdfPage > 0 && entry.pdfPage <= evidence.source.pdfPages);
  assert.equal(entry.pdfPage, entry.printedPage + 6, 'New guide has its own page offset');
  const parsed = url(entry.sourceUrl, entry.shortcutId);
  assert.equal(parsed.hostname, 'resources.avid.com');
  assert.equal(parsed.pathname, '/SupportFiles/PT/Pro_Tools_Shortcuts_2026.4.pdf');
  assert.equal(parsed.hash, '#page=' + entry.pdfPage);
  assert.ok(entry.evidenceTextShort && entry.note);
}
const shipped = JSON.stringify({ resources: data.resources, resourceMeta: data.resourceMeta, updates: data.updates, versionMeta: data.versionMeta, shortcutEvidence: data.shortcutEvidence });
assert.ok(!/\/Users\/|\/Volumes\/|file:\/\//.test(shipped), 'Private source paths must not ship');
console.log(`PASS: ${data.resources.length} deduplicated resources, ${data.learningPaths.length} paths/${checkpoints} checkpoints, ${data.updates.length} releases/${features} feature guides, ${verified.length} version-evidenced Mac shortcuts. Original research limits are retained.`);
