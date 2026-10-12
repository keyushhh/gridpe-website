import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../assets/experience/engine.js',import.meta.url),'utf8');
const start=source.indexOf('Dg=5.76'),end=source.indexOf(',Pg={',start);
const Gesture=Function('var '+source.slice(start,end)+';return Ng')();
function gesture(){const g=new Gesture();g.setReady();return g}
test('full circle opens the experience',()=>{
 const g=gesture();let completed=0;g.onStageComplete=()=>completed++;
 for(let i=0;i<=120;i++){const a=i/120*Math.PI*2;g.handleInput(Math.cos(a)*.3,Math.sin(a)*.3,true)}
 assert.equal(g.isComplete,true);assert.equal(completed,1);
});
test('straight stroke leaves the opening gesture active',()=>{
 const g=gesture();for(let i=0;i<120;i++)g.handleInput(i/120*.7-.35,0,true);
 assert.equal(g.isComplete,false);
});
test('open semicircle does not unlock',()=>{
 const g=gesture();for(let i=0;i<=100;i++){const a=i/100*Math.PI;g.handleInput(Math.cos(a)*.3,Math.sin(a)*.3,true)}
 assert.equal(g.isComplete,false);
});
test('releasing an incomplete stroke resets recognition',()=>{
 const g=gesture();for(let i=0;i<30;i++)g.handleInput(i*.01,0,true);
 g.handleInput(0,0,false);assert.equal(g.strokePoints.length,0);
});
for (const [width,height] of [[320,1000],[390,844],[1024,768],[2560,1080]]) {
 test(`a physical circle opens at ${width}×${height}`,()=>{
  const ResponsiveGesture=Function('window','var '+source.slice(start,end)+';return Ng')({innerWidth:width,innerHeight:height});
  const g=new ResponsiveGesture();g.setReady();
  for(let i=0;i<=120;i++){const a=i/120*Math.PI*2;g.handleInput(Math.cos(a)*.2*height/width,Math.sin(a)*.2,true)}
  assert.equal(g.isComplete,true);
  assert.ok(Math.abs(g.circleCenterUV.x-.5)<.01);
 });
}
