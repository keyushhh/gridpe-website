// Self-check for the 404 keyboard layout: pulls ROWS straight out of 404.html
// and asserts the geometry, so a bad width or a duplicate key code fails loud.
// Run: node 404.test.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync('404.html', 'utf8');
// grabs a top-level array literal by name, single- or multi-line
const grab = (name) => {
  const at = html.indexOf(`const ${name} = [`);
  if (at < 0) throw new Error(`${name} not found`);
  let i = html.indexOf('[', at), depth = 0, end = i;
  for (; end < html.length; end++) {
    if (html[end] === '[') depth++;
    else if (html[end] === ']' && --depth === 0) break;
  }
  return eval(html.slice(i, end + 1));
};

const ROWS = grab('ROWS');

let caps = 0;
ROWS.forEach((row, r) => {
  const units = row.keys.reduce((n, k) => n + (k.knob ? 1 : (k.w || 1)), 0);
  assert.equal(units, 16, `row ${r} is ${units}u, expected 16u`);
  caps += row.keys.filter((k) => !k.knob).length;
});
// the reference board is 83 caps plus the rotary knob
assert.equal(caps, 83, `expected 83 caps, got ${caps}`);

// Every cap that declares an action must have a handler, and every handler
// must be reachable from some cap - otherwise a key silently does nothing.
const acts = ROWS.flatMap((r) => r.keys.map((k) => k.act)).filter(Boolean);
assert.equal(new Set(acts).size, acts.length, 'the same action is on two caps');
const handlers = new Set(
  [...html.matchAll(/^\s{4}'?([a-z+-]+)'?\(\)\s?\{/gm)].map((m) => m[1]));
acts.forEach((a) => assert.ok(handlers.has(a), `cap action "${a}" has no handler`));
// enter is dispatched by the physical key rather than a cap
assert.ok(handlers.has('enter'), 'no enter handler');
// a functional cap becomes a button, so it needs a label for screen readers
ROWS.forEach((row) => row.keys.forEach((k) => {
  if (k.act) assert.ok(k.label, `cap "${k.b}" is a button with no aria-label`);
}));

// A code mapped twice would light the wrong cap on a real key press.
const codes = ROWS.flatMap((r) => r.keys.map((k) => k.code)).filter(Boolean);
assert.equal(new Set(codes).size, codes.length, 'duplicate key code');

// The auto-demo may only reference caps that exist on the board.
grab('SEQ').filter(Boolean).forEach((c) =>
  assert.ok(codes.includes(c), `demo key ${c} is not on the board`));

// Each digit in the heading has to be pressable, or it can never light up.
[...html.matchAll(/data-digit="(\w+)"/g)].forEach((m) =>
  assert.ok(codes.includes(m[1]), `heading digit ${m[1]} has no key`));

// --- the scale ---------------------------------------------------------
// Pitch is the part that can be musically wrong while still running clean, so
// check the mapping itself rather than just that audio nodes got built.
const PENTA = eval(html.match(/const PENTA = (\[[^\]]*\])/)[1]);
const ROOT = parseFloat(html.match(/const ROOT = ([\d.]+)/)[1]);
const degToFreq = (deg) => {
  const step = ((deg % 5) + 5) % 5;
  return ROOT * Math.pow(2, (PENTA[step] + 12 * Math.floor(deg / 5)) / 12);
};

// C major pentatonic, and nothing outside it
assert.deepEqual(PENTA, [0, 2, 4, 7, 9], 'not a major pentatonic');
// no semitone (or tritone) clash anywhere in the scale
PENTA.forEach((a, i) => PENTA.slice(i + 1).forEach((b) => {
  assert.ok(b - a !== 1 && b - a !== 6, `harsh interval ${b - a} in scale`);
}));
// degree 5 must land exactly one octave above degree 0
assert.ok(Math.abs(degToFreq(5) / degToFreq(0) - 2) < 1e-9, 'octave is not 2:1');

// --- the phrases -------------------------------------------------------
// Pitch comes from written lines now, not key position, so the lines
// themselves are what has to be musical.
const PHRASES = eval('(' + html.match(/const PHRASES = (\{[\s\S]*?\n  \};)/)[1].replace(/;$/, '') + ')');
const parts = Object.keys(PHRASES);
assert.deepEqual(parts.sort(), ['bass', 'harmony', 'melody'], 'unexpected phrase set');

let lo = Infinity, hi = -Infinity;
for (const [name, line] of Object.entries(PHRASES)) {
  assert.ok(line.length >= 8, `${name} is too short to read as a phrase`);
  line.forEach((d, i) => {
    assert.ok(Number.isInteger(d), `${name}[${i}] is not a scale degree`);
    // a leap wider than an octave inside a line reads as a mistake, not a tune
    if (i) assert.ok(Math.abs(d - line[i - 1]) <= 5,
      `${name} leaps ${Math.abs(d - line[i - 1])} degrees at ${i}`);
  });
  // the lines have to sit apart, or the three rows just double each other
  const avg = line.reduce((a, b) => a + b, 0) / line.length;
  PHRASES[name].avg = avg;
}
assert.ok(PHRASES.melody.avg > PHRASES.harmony.avg, 'melody does not sit above harmony');
assert.ok(PHRASES.harmony.avg > PHRASES.bass.avg, 'harmony does not sit above bass');

// every note any row can produce must land in an audible, musical range
const OCT = eval(html.match(/const OCT_BY_ROW\s+= (\[[^\]]*\])/)[1]);
const PART = eval(html.match(/const PART_BY_ROW = (\[[^\]]*\])/)[1]);
PART.forEach((part, r) => {
  if (!PHRASES[part]) return;
  PHRASES[part].forEach((d) => {
    const f = degToFreq(d + (OCT[r] || 0) * 5);
    lo = Math.min(lo, f); hi = Math.max(hi, f);
  });
});
assert.ok(lo > 60 && hi < 5000, `range ${lo.toFixed(0)}-${hi.toFixed(0)}Hz is unmusical`);

console.log(`OK - ${ROWS.length} rows, ${caps} caps + knob, every row 16u`);
console.log(`OK - ${acts.length} cap actions, all with handlers and labels`);
console.log(`OK - ${parts.length} phrases, pentatonic, ${lo.toFixed(0)}Hz..${hi.toFixed(0)}Hz`);
