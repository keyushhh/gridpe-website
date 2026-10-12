import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('all experience navigation stays in its own website',()=>{
 const engine=read('assets/experience/engine.js');
 const menus=[...engine.matchAll(/label:`(Home|Our Story|Why GridPe)`,href:`([^`]+)`/g)];
 assert.equal(menus.length,6);
 for(const [,label,href] of menus){assert.ok(label==='Home'?href==='/gridpe-experience.html':href.startsWith('/experience/'),label);assert.ok(fs.existsSync(new URL('..'+href,import.meta.url)),href)}
 assert.ok(!engine.includes('https://grid.pe'));
 assert.ok(!engine.includes('grid.pe/privacy.html'));
 for(const file of ['gridpe-experience.html',...['home','our-story','why-gridpe','privacy','terms'].map(slug=>'experience/'+slug+'.html')]){
  const html=read(file);
  for(const [,href] of html.matchAll(/<a[^>]*href="([^"]+)"/g)){
   assert.ok(href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('/experience/')||href==='/gridpe-experience.html',`${file}: ${href}`);
   if(href.startsWith('/'))assert.ok(fs.existsSync(new URL('..'+href,import.meta.url)),href);
  }
  assert.ok(html.includes('noindex, nofollow'),file);
 }
 assert.ok(!read('index.html').includes('gridpe-experience'));
 assert.ok(!read('main.js').includes('gridpe-experience'));
});
