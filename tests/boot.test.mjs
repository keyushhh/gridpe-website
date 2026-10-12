import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/experience/boot.js',import.meta.url),'utf8');
function harness(support){
 const fallback={hidden:true},events={};
 const context={window:{WebGLRenderingContext:support,addEventListener:(name,fn)=>events[name]=fn},document:{getElementById:()=>fallback},console:{error(){}}};
 return {fallback,events,context};
}
test('unsupported WebGL presents the experience fallback',()=>{
 const h=harness(undefined);vm.runInNewContext(source,h.context);assert.equal(h.fallback.hidden,false);
});
test('failed renderer module import presents a usable fallback',async()=>{
 const h=harness(function(){});h.context.loadEngine=()=>Promise.reject(new Error('Renderer failed'));
 vm.runInNewContext(source.replace("import('./engine.js')",'loadEngine()'),h.context);
 await new Promise(resolve=>setImmediate(resolve));assert.equal(h.fallback.hidden,false);
});
test('fatal scene-asset errors present the fallback',()=>{
 const h=harness(undefined);vm.runInNewContext(source,h.context);h.fallback.hidden=true;
 h.events['gridpe:load-error']();assert.equal(h.fallback.hidden,false);
});
