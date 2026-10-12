/* Compile editable GridPe copy into the source's exact UV coordinate system.
 * Narrative slots retain the reference geometry, anchors, and shader timing.
 * Run with NODE_PATH pointing to the bundled @napi-rs/canvas package. */
const fs = require('node:fs');
const path = require('node:path');
const {createCanvas, loadImage, GlobalFonts} = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/Bethany Elingston.otf'), 'Narrative');
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/PPSupplySans-Regular.otf'), 'Supply');
const spec = JSON.parse(fs.readFileSync(path.join(root,'assets/experience/content.json')));
(async () => {
  const brand = await loadImage(path.join(root,'assets/logo-full.png'));
  const original = await loadImage(path.join(root,'assets/experience/reference-texts.png'));
  // Isolate complete connected calligraphic glyphs, never slice through letters.
  const leadCanvas=createCanvas(1098,504),leadCtx=leadCanvas.getContext('2d');
  leadCtx.drawImage(original,581.43*1.5,1135.89*1.5,732.38*1.5,335.67*1.5,0,0,1098,504);
  let selected=0;
  const pixels=leadCtx.getImageData(0,0,1098,504),seen=new Uint8Array(1098*504),mask=new Uint8Array(seen.length);
  for(let i=0;i<seen.length;i++){
    if(seen[i]||pixels.data[i*4+3]<128)continue;
    const queue=[i];seen[i]=1;let minY=504,maxY=0,maxX=0;
    for(let k=0;k<queue.length;k++){const n=queue[k],x=n%1098,y=(n/1098)|0;minY=Math.min(minY,y);maxY=Math.max(maxY,y);maxX=Math.max(maxX,x);
      for(const next of [n-1098,n+1098,x>0?n-1:-1,x<1097?n+1:-1])if(next>=0&&next<seen.length&&!seen[next]&&pixels.data[next*4+3]>=128){seen[next]=1;queue.push(next)}
    }
    if(queue.length>7000&&minY<60&&maxY<270&&maxX<600){selected++;for(const n of queue)mask[n]=1;}
  }
  if(selected!==2)throw new Error(`Expected two complete calligraphic glyph components, received ${selected}`);
  const expanded=new Uint8Array(mask.length);
  for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%1098,y=(i/1098)|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<1098&&y+dy>=0&&y+dy<504)expanded[(y+dy)*1098+x+dx]=1}
  for(let i=0;i<mask.length;i++)if(!expanded[i])pixels.data[i*4+3]=0;
  leadCtx.putImageData(pixels,0,0);
  const lead=createCanvas(563,251);lead.getContext('2d').drawImage(leadCanvas,0,0,563,251,0,0,563,251);
  function fit(t,label,size,x,y,max){t.font=`400 ${size}px Narrative`;let m=t.measureText(label);if(m.width>max)t.font=`400 ${size*max/m.width}px Narrative`;t.fillText(label,x,y)}
  const atlas=createCanvas(3072,3072),ctx=atlas.getContext('2d');
  // Start transparent so no unreferenced original lettering survives between slots.
  for (const slot of spec.slots) {
    if(slot.preserve){
      const [px,py,pw,ph]=slot.rect,k=spec.atlasScale;
      ctx.drawImage(original,px*k,py*k,pw*k,ph*k,px*k,py*k,pw*k,ph*k);continue;
    }
    const [x,y,w,h]=slot.rect,ratio=spec.atlasScale;
    const tw=Math.round(w*ratio),th=Math.round(h*ratio);
    const tile=createCanvas(tw,th),t=tile.getContext('2d');
    if(slot.image){
      const scale=Math.min(tw*.97/brand.width,th*.97/brand.height),bw=brand.width*scale,bh=brand.height*scale;
      t.drawImage(brand,(tw-bw)/2,(th-bh)/2,bw,bh);ctx.drawImage(tile,x*ratio,y*ratio);continue;
    }
    if(slot.calligraphicLead){
      const k=th/503;t.fillStyle='#527b74';t.textBaseline='middle';
      if(slot.id==='real'){
        t.drawImage(lead,0,th*.29,tw*.99,th*.7);fit(t,'where',th*.16,tw*.25,th*.07,tw*.42);fit(t,'CASH',th*.24,tw*.44,th*.2,tw*.51);fit(t,'gets',th*.18,tw*.64,th*.42,tw*.3);
      }else{
        t.drawImage(lead,0,0,563*k,251*k);
        const word=slot.id==='notes'?'notes':slot.id==='delivery'?'cash':'riders';
        const start=slot.id==='riders'?.18:.32;
        fit(t,word,th*.46,tw*start,th*.57,tw*(slot.id==='riders'?.66:.45));
        if(slot.id==='notes'){fit(t,'that',th*.15,tw*.78,th*.47,tw*.2);fit(t,'you',th*.15,tw*.78,th*.66,tw*.2);fit(t,'use every day',th*.18,tw*.51,th*.88,tw*.48)}
        if(slot.id==='delivery'){fit(t,'when',th*.14,tw*.79,th*.64,tw*.2);fit(t,'you need it',th*.18,tw*.53,th*.87,tw*.46)}
        if(slot.id==='riders'){fit(t,'KYC',th*.14,tw*.82,th*.65,tw*.17);fit(t,'verified',th*.19,tw*.62,th*.88,tw*.37)}
      }
      ctx.clearRect(x*ratio,y*ratio,tw,th);ctx.drawImage(tile,x*ratio,y*ratio);continue;
    }
    const top=slot.preserveAbove?Math.round(th*slot.preserveAbove):0;
    const bottom=slot.preserveBelow?Math.round(th*slot.preserveBelow):th;
    if(slot.preserveAbove) t.drawImage(original,x*ratio,y*ratio,tw,top,0,0,tw,top);
    if(slot.preserveBelow) t.drawImage(original,x*ratio,y*ratio+bottom,tw,th-bottom,0,bottom,tw,th-bottom);
    const gradient=t.createLinearGradient(0,top,tw,bottom);
    const colors=slot.tone==='dark'?['#d1ffdf','#b9ffd5']:slot.tone==='white'?['#ffffff','#ffffff']:['#86b7a6','#466c76'];
    gradient.addColorStop(0,colors[0]);gradient.addColorStop(.48,colors[1]);gradient.addColorStop(1,colors[0]);
    t.fillStyle=gradient;t.textBaseline='alphabetic';
    const lineGap=th*(slot.lineGap||0);
    let cy=top+Math.max(8,th*.025);
    const spread=slot.wordSpacingEm||0;
    const spacedWidth=(text,size)=>t.measureText(text).width+(text.split(' ').length-1)*size*spread;
    const rows=[];
    for (const [text,fraction] of slot.lines) {
      const boxHeight=th*fraction;
      let size=boxHeight*1.1;
      const family=slot.family||'Narrative';
      const font=()=>`${family==='Supply'?'700':'400'} ${size}px ${family}`;
      t.font=font();
      let metrics=t.measureText(text);
      const maxWidth=tw*.965;
      if(spacedWidth(text,size)>maxWidth){size*=maxWidth/spacedWidth(text,size);t.font=font();metrics=t.measureText(text);}
      const inkHeight=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
      if(inkHeight>boxHeight*.94){size*=boxHeight*.94/inkHeight;t.font=font();metrics=t.measureText(text);}
      size*=slot.fontScale||1;t.font=font();metrics=t.measureText(text);
      const left=slot.align==='left'?tw*.025:(tw-spacedWidth(text,size))/2;
      const baseline=cy+(boxHeight-(metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent))/2+metrics.actualBoundingBoxAscent;
      rows.push({text,size,font:font(),metrics,left,baseline});
      cy+=boxHeight+lineGap;
    }
    if(slot.compact){
      const gap=Math.max(...rows.map(row=>row.size))*(slot.lineGapEm||.12);
      const height=rows.reduce((sum,row)=>sum+row.metrics.actualBoundingBoxAscent+row.metrics.actualBoundingBoxDescent,0)+gap*(rows.length-1);
      let inkTop=(th-height)/2;
      for(const row of rows){row.baseline=inkTop+row.metrics.actualBoundingBoxAscent;inkTop+=row.metrics.actualBoundingBoxAscent+row.metrics.actualBoundingBoxDescent+gap;}
    }
    for(const row of rows){
      t.font=row.font;
      if(spread){
        let cursor=row.left;const words=row.text.split(' '),space=t.measureText(' ').width+row.size*spread;
        for(const word of words){t.fillText(word,cursor,row.baseline);cursor+=t.measureText(word).width+space;}
      }else t.fillText(row.text,row.left,row.baseline);
    }
    ctx.save();ctx.clearRect(x*ratio,y*ratio,(slot.rotate?h:w)*ratio,(slot.rotate?w:h)*ratio);
    if(slot.rotate){ctx.translate(x*ratio+th,y*ratio);ctx.rotate(Math.PI/2);ctx.drawImage(tile,0,0);}
    else ctx.drawImage(tile,x*ratio,y*ratio);
    ctx.restore();
  }
  fs.writeFileSync(path.join(root,'assets/experience/gridpe-texts.png'),atlas.toBuffer('image/png'));
  console.log('Built 23 narrative slots; reference UVs and preserved lettering retained.');
})();
