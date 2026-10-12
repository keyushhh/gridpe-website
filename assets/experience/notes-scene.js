/** Standalone note planes using the Home scene's two-wave paper deformation.
 * The fragment shader only samples the note: no burn mask, char, or embers.
 */
export function mountNotes(host) {
 const canvas=document.createElement('canvas');
 canvas.className='notes-canvas';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true});
 if(!gl)return;
 const vertex=`precision highp float;
 attribute vec2 aUV; varying vec2 vUv;
 uniform float uTime,uSeed,uAspect,uScale;uniform vec3 uAngles,uPosition;
 void main(){vUv=aUV;vec3 pos=vec3((aUV.x-.5)*2.380952381,aUV.y-.5,0.);
 float wave=sin(aUV.x*8.+uTime*2.+uSeed*6.283)*.09;
 wave+=sin(aUV.y*8.*.7+uTime*1.5+uSeed*3.7)*.09*.5;pos.z+=wave;
 pos*=uScale;
 float c=cos(uAngles.x),s=sin(uAngles.x);pos.yz=mat2(c,s,-s,c)*pos.yz;
 c=cos(uAngles.y);s=sin(uAngles.y);pos.xz=mat2(c,s,-s,c)*pos.xz;
 c=cos(uAngles.z);s=sin(uAngles.z);pos.xy=mat2(c,s,-s,c)*pos.xy;
 pos+=uPosition;float depth=4.-pos.z;
 gl_Position=vec4(pos.x*2.4/uAspect,pos.y*2.4,-pos.z*.1,depth);}`;
 const fragment=`precision highp float;varying vec2 vUv;uniform sampler2D uNote;
 void main(){gl_FragColor=texture2D(uNote,vUv);}`;
 const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader};
 const program=gl.createProgram();
 try{gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Note shader link failed')}
 catch(error){console.error(error);return}
 gl.useProgram(program);
 const vertices=[];
 for(let y=0;y<12;y++)for(let x=0;x<24;x++){const a=x/24,b=y/12,c=(x+1)/24,d=(y+1)/12;vertices.push(a,b,c,b,a,d,a,d,c,b,c,d)}
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
 const attribute=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
 const uniform=Object.fromEntries(['uTime','uSeed','uAspect','uScale','uAngles','uPosition'].map(name=>[name,gl.getUniformLocation(program,name)]));
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 let ready=false,visible=false,frame=0,time=0,last=0,loadId=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const load=()=>{const id=++loadId,img=new Image();img.onload=()=>{if(id!==loadId)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);ready=true;host.classList.add('has-notes-scene');draw();schedule()};img.src=host.querySelector('.selected-note')?.getAttribute('src')||'/assets/notes/500.webp'};
 const placements=[[-1.3,.8,-.9,.75,-.35],[1.1,.85,-.8,.65,.45],[-1.2,-.6,-.6,.7,.3],[1.2,-.75,-.4,.7,-.4],[0,0,.3,1.05,-.5]];
 function draw(){if(!ready||gl.isContextLost())return;gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(uniform.uTime,time);gl.uniform1f(uniform.uAspect,canvas.width/canvas.height);
 placements.forEach(([x,y,z,scale,angle],i)=>{const seed=i*.33;gl.uniform1f(uniform.uSeed,seed);gl.uniform1f(uniform.uScale,scale);gl.uniform3f(uniform.uPosition,x+Math.sin(time*.35+i)*.12,y+Math.sin(time*.45+i)*.16,z);gl.uniform3f(uniform.uAngles,Math.sin(time*.5+i)*.25,Math.sin(time*.4+i)*.5,angle+Math.sin(time*.3+i)*.12);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2)})}
 function allowed(){return visible&&!document.hidden&&!reduced.matches&&!document.body.classList.contains('motion-paused')}
 function schedule(){if(!frame&&ready&&allowed())frame=requestAnimationFrame(tick)}
 function tick(now){frame=0;if(!allowed()){last=0;return}if(last)time+=Math.min((now-last)/1000,.05);last=now;draw();schedule()}
 function sync(){if(!allowed()){cancelAnimationFrame(frame);frame=0;last=0;draw()}else schedule()}
 host.appendChild(canvas);
 new ResizeObserver(()=>{const box=host.getBoundingClientRect(),ratio=Math.min(devicePixelRatio,1.5);canvas.width=Math.max(1,Math.round(box.width*ratio));canvas.height=Math.max(1,Math.round(box.height*ratio));draw()}).observe(host);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()}).observe(host);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 const selected=host.querySelector('.selected-note');if(selected)new MutationObserver(load).observe(selected,{attributes:true,attributeFilter:['src']});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;ready=false;host.classList.remove('has-notes-scene')});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 load();
}
