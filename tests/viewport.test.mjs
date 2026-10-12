import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/experience/viewport.js',import.meta.url),'utf8').replace('export function','function');
test('focused email field moves the signup bar above a reduced visual viewport',()=>{
 const values={};const viewport={height:420,offsetTop:10,addEventListener(){}};
 const context={window:{innerHeight:800,visualViewport:viewport,addEventListener(){}},document:{activeElement:{matches:()=>true},documentElement:{style:{setProperty:(key,value)=>values[key]=value}},addEventListener(){}},requestAnimationFrame:fn=>fn()};
 vm.runInNewContext(source,context);
 assert.equal(values['--visual-height'],'420px');assert.equal(values['--keyboard-offset'],'370px');
 context.document.activeElement.matches=()=>false;vm.runInNewContext('syncVisualViewport()',context);
 assert.equal(values['--keyboard-offset'],'0px');
});
test('layout-only browsers without visualViewport keep controls in the layout viewport',()=>{
 const values={};vm.runInNewContext(source,{window:{innerHeight:568,addEventListener(){}},document:{documentElement:{style:{setProperty:(k,v)=>values[k]=v}},addEventListener(){}},requestAnimationFrame:fn=>fn()});
 assert.equal(values['--visual-height'],'568px');assert.equal(values['--keyboard-offset'],'0px');
});
