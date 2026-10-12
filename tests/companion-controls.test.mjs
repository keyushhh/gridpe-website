import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/experience/pages.js',import.meta.url),'utf8').split('// Small product illustrations; these controls never place an order.')[1].split('// Reveal sections')[0];
test('denomination selection and illustrative handover update and replay',()=>{
 const buttons=[100,200,500].map(value=>({dataset:{note:String(value)},setAttribute(name,value){this[name]=value},addEventListener(name,fn){this.click=fn}}));
 const note={},sculpture={querySelector:()=>note,classList:{add(){},remove(){}}};
 let confirmed=false;
 const status={},button={addEventListener(name,fn){this.click=fn}};
 const handover={querySelector:selector=>selector==='button'?button:status,classList:{toggle(){return confirmed=!confirmed}}};
 const document={querySelector:selector=>selector==='.handover'?handover:sculpture,querySelectorAll:()=>buttons};
 vm.runInNewContext(source,{document,setTimeout:fn=>{fn();return 1},clearTimeout(){}});
 buttons[1].click();
 assert.equal(note.src,'/assets/notes/200.webp');
 assert.equal(note.alt,'₹200 note');
 assert.deepEqual(buttons.map(item=>item['aria-pressed']),['false','true','false']);
 button.click();assert.equal(button.textContent,'Replay the handover');assert.equal(status.textContent,'Handover confirmed · illustration');
 button.click();assert.equal(button.textContent,'Preview the handover');assert.equal(status.textContent,'Illustration · six-digit OTP');
});
test('section motion pauses offscreen and respects visitor pause and reduced motion',()=>{
 const full=fs.readFileSync(new URL('../assets/experience/pages.js',import.meta.url),'utf8');
 const motionSource='const reduceMotion'+full.split('const reduceMotion')[1].split('import {mountNotes}')[0];
 const media={matches:false,addEventListener(name,fn){this.change=fn}};
 const button={setAttribute(name,value){this[name]=value},addEventListener(name,fn){this.click=fn}};
 const classes=new Set(),note={style:{}},section={classList:{add(){}},querySelectorAll:()=>[note]};
 let observerCallback,svgPaused=false;
 const svg={pauseAnimations(){svgPaused=true},unpauseAnimations(){svgPaused=false}};
 const document={body:{classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name)}}},querySelector:()=>button,querySelectorAll:selector=>selector==='.route-world svg'?[svg]:[section]};
 class Observer{constructor(fn){observerCallback=fn}observe(){}}
 vm.runInNewContext(motionSource,{document,matchMedia:()=>media,window:{IntersectionObserver:Observer},IntersectionObserver:Observer,sceneVideo:null});
 observerCallback([{target:section,isIntersecting:true}]);assert.equal(note.style.animationPlayState,'running');
 observerCallback([{target:section,isIntersecting:false}]);assert.equal(note.style.animationPlayState,'paused');
 button.click();assert.equal(svgPaused,true);assert.equal(button.textContent,'Resume motion');assert.ok(classes.has('motion-paused'));
 button.click();assert.equal(svgPaused,false);
 media.matches=true;media.change();assert.equal(svgPaused,true);assert.equal(button.disabled,true);assert.ok(classes.has('motion-paused'));
});
