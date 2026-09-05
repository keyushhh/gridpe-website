#!/usr/bin/env node
/* Audits every <img> in the production HTML (and every <img> string main.js
   injects at runtime). Fails the build if any of them lacks an alt attribute.
   Run: node check-alt.mjs                                                   */
import { readFileSync } from 'node:fs';

const FILES = ['index.html', 'privacy.html', 'terms.html', '404.html', 'main.js'];
const IMG   = /<img\b[^>]*>/gi;
const ALT   = /\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const SRC   = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

let missing = 0, empty = 0, described = 0, total = 0;
const rows = [];

for (const file of FILES) {
  const text = readFileSync(file, 'utf8');
  for (const m0 of text.matchAll(IMG)) {
    const tag = m0[0];
    total++;
    const line = text.slice(0, m0.index).split('\n').length;
    const m    = tag.match(ALT);
    const src  = (tag.match(SRC) || [])[1] || (tag.match(SRC) || [])[2] || '(dynamic)';
    let state;
    if (!m)                         { state = 'MISSING';    missing++; }
    else if ((m[1] ?? m[2] ?? m[3]) === '') { state = 'empty (decorative)'; empty++; }
    else                            { state = `"${m[1] ?? m[2] ?? m[3]}"`; described++; }
    rows.push(`${state === 'MISSING' ? '✗' : '·'} ${file}:${line}  ${src}  ->  ${state}`);
  }
}

console.log(rows.join('\n'));
console.log(`\ntotal <img>            ${total}`);
console.log(`missing alt            ${missing}`);
console.log(`empty alt (decorative) ${empty}`);
console.log(`non-empty alt          ${described}`);

// every logo-full instance is what the crawler flagged - list them explicitly
const logos = rows.filter(r => /logo-full/.test(r));
console.log(`\nlogo-full instances    ${logos.length}, missing alt: ${logos.filter(r => r.startsWith('✗')).length}`);

if (missing !== 0) { console.error(`\nFAIL: ${missing} images with missing alt attributes`); process.exit(1); }
console.log('\nPASS: 0 images with missing alt attributes');
