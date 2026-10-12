import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../assets/experience/engine.js',import.meta.url),'utf8');
const start=source.indexOf('function JO()'),end=source.indexOf('function restartGridPeExperience()',start);
function restore(snapshot){
 const read=Function('sessionStorage','WO','KO','qO',source.slice(start,end)+';return JO();');
 return read({getItem:()=>JSON.stringify(snapshot)},false,'gridpe-experience:resume',1800000);
}
test('orientation can restore progress in the first story scene',()=>{
 const snapshot={stage:'stage1',scrollPos:123,resize:true,t:Date.now()};
 assert.deepEqual(restore(snapshot),snapshot);
});
test('ordinary first-scene refresh retains the original drawing intro behavior',()=>{
 assert.equal(restore({stage:'stage1',scrollPos:123,t:Date.now()}),null);
});
test('other scenes retain their resume position and expired sessions are ignored',()=>{
 const snapshot={stage:'stage3',scrollPos:500,t:Date.now()};
 assert.deepEqual(restore(snapshot),snapshot);
 assert.equal(restore({...snapshot,t:Date.now()-1900000}),null);
});
