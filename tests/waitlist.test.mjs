import test from 'node:test';
import assert from 'node:assert/strict';
import {joinWaitlist} from '../assets/experience/waitlist.js';
const config={endpoint:'https://gridpe-test.invalid/waitlist',key:'test-public-key'};
test('submits normalized email to GridPe without reference or profile data',async()=>{
 const calls=[];
 const request=async(url,options)=>{calls.push({url,options});return calls.length===1?{ok:true,json:async()=>config}:{ok:true,status:201}};
 assert.deepEqual(await joinWaitlist('  TEST@example.com ',request),{success:true});
 assert.equal(calls[1].url,config.endpoint);
 assert.deepEqual(JSON.parse(calls[1].options.body),{email:'test@example.com',source:'website'});
 assert.equal(calls[1].options.headers.apikey,config.key);
});
test('failed insert never reports success',async()=>{
 let count=0;
 await assert.rejects(joinWaitlist('test@example.com',async()=>++count===1?{ok:true,json:async()=>config}:{ok:false,status:503}),/Could not join/);
});
test('duplicate insert is accepted',async()=>{
 let count=0;
 assert.deepEqual(await joinWaitlist('test@example.com',async()=>++count===1?{ok:true,json:async()=>config}:{ok:false,status:409}),{success:true});
});
test('invalid email causes no request',async()=>{
 await assert.rejects(joinWaitlist('bad',async()=>{assert.fail('unexpected request')}),/valid email/);
});
