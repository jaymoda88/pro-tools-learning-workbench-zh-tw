/** Check attribution and image provenance without running application code. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const owner = '許惟傑 Xue_hwcxx';
const wrapper = /^window\.PT_DATA\s*=\s*([\s\S]+);\s*$/.exec(fs.readFileSync('dist/data.js', 'utf8'));
assert.ok(wrapper);
const data = JSON.parse(wrapper[1]);
assert.equal(data.rights.owner, owner);
assert.equal(data.rights.handle, 'jaymoda88');
assert.match(data.rights.policy, /commercial reuse requires written permission/);
for (const document of [...data.notes, ...data.pages]) {
  assert.equal(document.contentDigest, sha256(document.title + '\n' + document.html), `Content fingerprint: ${document.id}`);
  assert.match(document.sourceVersion, /^\d+\.\d+(?:\.\d+)?$/);
}
for (const file of ['LICENSE', 'NOTICE.txt', 'CITATION.cff']) {
  assert.ok(fs.readFileSync(file, 'utf8').includes(owner) || file === 'CITATION.cff');
}
const html = fs.readFileSync('dist/index.html', 'utf8');
assert.match(html, /href="rights\.css"/);
assert.match(html, /src="rights\.js"/);
assert.match(html, /href="NOTICE\.txt"/);
assert.match(fs.readFileSync('dist/rights.css', 'utf8'), /@media print/);
assert.match(fs.readFileSync('dist/rights.css', 'utf8'), /pointer-events:\s*none/);
assert.ok(fs.readFileSync('dist/rights.js', 'utf8').includes(owner));
assert.ok(fs.readFileSync('dist/app.js', 'utf8').includes('PTRights?.stampArticle'));

function imageMetadata(buffer, label, required = true) {
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `PNG signature: ${label}`);
  let offset = 8;
  let metadata;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    assert.ok(offset + 12 + length <= buffer.length, `Truncated PNG: ${label}`);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const payload = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'iTXt') {
      const zero = payload.indexOf(0);
      if (payload.subarray(0, zero).toString('latin1') === 'pt_provenance') {
        assert.equal(payload[zero + 1], 0, 'Provenance must be readable uncompressed iTXt');
        let textOffset = zero + 3;
        textOffset = payload.indexOf(0, textOffset) + 1; // language
        textOffset = payload.indexOf(0, textOffset) + 1; // translated keyword
        metadata = JSON.parse(payload.subarray(textOffset).toString('utf8'));
      }
    }
    offset += length + 12;
  }
  if (required) assert.ok(metadata, `Missing pixel-attribution provenance: ${label}`);
  return metadata;
}

const pngNames = fs.readdirSync('public/assets').filter(name => name.toLowerCase().endsWith('.png'));
assert.ok(pngNames.length);
for (const name of pngNames) {
  const bytes = fs.readFileSync(path.join('dist/assets', name));
  const metadata = imageMetadata(bytes, name);
  assert.equal(metadata.schemaVersion, 1);
  assert.equal(metadata.owner, owner);
  assert.equal(metadata.policy, 'non-commercial-v1');
  assert.equal(metadata.protectionVersion, 'footer-v1');
  assert.equal(metadata.asset, name);
  const original = fs.readFileSync(path.join('public/assets', name));
  const sourceMetadata = imageMetadata(original, name, false);
  assert.equal(metadata.sourceSha256, sourceMetadata ? sourceMetadata.sourceSha256 : sha256(original), `Source fingerprint mismatch: ${name}`);
  assert.match(metadata.sourceSha256, /^[a-f0-9]{64}$/);
  assert.ok(Array.isArray(metadata.sourceSize) && metadata.sourceSize.length === 2 && metadata.sourceSize.every(value => Number.isInteger(value) && value > 0));
  assert.deepEqual(metadata.protectedSize, [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]);
  assert.deepEqual(metadata.sourceSize, sourceMetadata ? sourceMetadata.sourceSize : [original.readUInt32BE(16), original.readUInt32BE(20)]);
  if (sourceMetadata) assert.deepEqual(original, bytes, `Protected sources must remain byte-identical: ${name}`);
  // Footer pixels must live outside the source chart's dimensions.
  assert.equal(bytes.readUInt32BE(16), metadata.sourceSize[0]);
  assert.ok(bytes.readUInt32BE(20) > metadata.sourceSize[1], `Missing image footer: ${name}`);
  assert.deepEqual(fs.readFileSync(path.join('site-dist/assets', name)), bytes);
}
console.log(`PASS: ${data.notes.length + data.pages.length} content fingerprints, ${pngNames.length} image provenance records, attribution modules and notices. Hashes are not DRM or ownership proof.`);
