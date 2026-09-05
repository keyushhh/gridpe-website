#!/usr/bin/env node
/* Real-browser audit of the homepage: what the initial viewport actually costs,
   plus a scroll pass to prove the deferred art still arrives.
   Run: node perf-audit.mjs [url]                                             */
/* needs: npm i puppeteer-core   (drives the Chrome already on the machine) */
import puppeteer from 'puppeteer-core';

const URL   = process.argv[2] || 'http://localhost:8777/';
const MOBILE = process.argv.includes('--mobile');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport(MOBILE ? { width: 390, height: 844, deviceScaleFactor: 2 }
                              : { width: 1440, height: 900, deviceScaleFactor: 1 });
if (MOBILE) {
  const c = await page.createCDPSession();
  await c.send('Network.emulateNetworkConditions',
    { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await c.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}

const reqs = [];
page.on('response', async r => {
  const rq = r.request();
  reqs.push({ url: r.url(), type: rq.resourceType(), status: r.status(),
              kb: +(((await r.headers())['content-length'] || 0) / 1024).toFixed(1),
              t: Date.now() });
});

const t0 = Date.now();
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
const initial = reqs.length;
const vitals = await page.evaluate(async () => {
  const p = performance.getEntriesByType('paint');
  const seen = [];
  new PerformanceObserver(l => seen.push(...l.getEntries()))
    .observe({ type: 'largest-contentful-paint', buffered: true });
  await new Promise(r => setTimeout(r, 300));
  const lcp = seen.pop();
  const n = performance.getEntriesByType('navigation')[0];
  const res = performance.getEntriesByType('resource');
  return { FCP: +(p.find(x => x.name === 'first-contentful-paint')?.startTime || 0).toFixed(0),
           LCP: +(lcp?.startTime || 0).toFixed(0), LCPsrc: lcp?.url || '',
           DCL: +n.domContentLoadedEventEnd.toFixed(0), load: +n.loadEventEnd.toFixed(0),
           bytes: +((res.reduce((a, r) => a + (r.transferSize || 0), 0) + (n.transferSize || 0)) / 1024).toFixed(0),
           imgs: [...document.images].map(i => ({ src: i.getAttribute('src'), pick: i.currentSrc.split('/').pop(),
             nat: i.naturalWidth + 'x' + i.naturalHeight,
             css: Math.round(i.getBoundingClientRect().width) + 'x' + Math.round(i.getBoundingClientRect().height),
             loading: i.loading, fold: i.getBoundingClientRect().top < innerHeight ? 'above' : 'below',
             broken: i.complete && i.naturalWidth === 0 })) };
});

console.log(`\n== ${MOBILE ? 'MOBILE / 1.6Mbps / 4x CPU' : 'DESKTOP / fast'} — ${URL}`);
console.log(`FCP ${vitals.FCP}ms  LCP ${vitals.LCP}ms  DCL ${vitals.DCL}ms  load ${vitals.load}ms`);
console.log(`initial-viewport requests: ${initial}   transferred: ${vitals.bytes} KB`);
console.log(`LCP resource: ${vitals.LCPsrc.split('/').pop()}`);

const bad = reqs.filter(r => r.status >= 400);
console.log(`broken requests: ${bad.length ? bad.map(b => b.status + ' ' + b.url).join(', ') : 'none'}`);
console.log(`broken images:   ${vitals.imgs.filter(i => i.broken).length}`);

const heavy = ['maplibre', 'carto', '/notes/'];
for (const h of heavy)
  console.log(`  ${h.padEnd(10)} on initial load: ${reqs.filter(r => r.url.includes(h)).length} requests`);

console.log('\n-- images in the initial document --');
for (const i of vitals.imgs)
  console.log(`  ${i.fold.padEnd(5)} ${(i.loading || 'eager').padEnd(5)} nat ${i.nat.padEnd(10)} css ${i.css.padEnd(10)} ${i.pick}${i.broken ? '  BROKEN' : ''}`);

// scroll the whole page: the deferred decoration must actually arrive
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    scrollTo(0, y); await new Promise(r => setTimeout(r, 90));
  }
});
await new Promise(r => setTimeout(r, 4000));
console.log('\n-- after a full scroll --');
for (const h of heavy)
  console.log(`  ${h.padEnd(10)} ${reqs.filter(r => r.url.includes(h)).length} requests`);
const st = await page.evaluate(() => ({
  ffgArmed: document.querySelector('.ffg')?.classList.contains('is-armed'),
  flyArmed: document.body.classList.contains('fly-armed'),
  brokenLate: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length }));
console.log(' ', JSON.stringify(st));
console.log(`  total requests ${reqs.length}, broken ${reqs.filter(r => r.status >= 400).length}`);

await browser.close();
if (bad.length || vitals.imgs.some(i => i.broken) || !st.ffgArmed || !st.flyArmed) {
  console.error('\nFAIL'); process.exit(1);
}
console.log('\nPASS');
