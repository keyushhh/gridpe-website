/* Replace baked copy in scene props without changing UVs or mesh animation. */
const fs=require('node:fs'),path=require('node:path');
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'assets/experience');
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/Bethany Elingston.otf'),'Narrative');
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/PPSupplySans-Regular.otf'),'Supply');
function text(x,label,size,cx,cy,max){x.font=`${size}px Narrative`;const measured=x.measureText(label).width;if(measured>max)x.font=`${size*max/measured}px Narrative`;x.fillText(label,cx,cy)}
(async()=>{
 const shards=createCanvas(2048,2048),s=shards.getContext('2d');s.drawImage(await loadImage(path.join(dir,'reference-shards.png')),0,0);
 const slots=[
  // Text-only ATM frustrations, centered inside the existing shard UVs.
  [0,0,856,381,false,null,['Out of cash.','Another ATM.','Another trip.']],
  [881,0,860,518,false,null,['A long queue.','Your time','on hold.']],
  [1765,0,735,283,true,null,['Need smaller notes?','The machine may','not have them.']],
  [0,699,1024,363,false,null,['Network down.','Withdrawal failed.','Try again.']],
  [1042,737,952,502,false,null,['Withdrawal limits.','More attempts.','More hassle.']],
  [563,1073,975,370,true,null,['Travel. Parking.','Time away.','Just to get cash.']]
 ];
 for(const [px,py,w,h,rot,number,lines] of slots){
  const tile=createCanvas(w,h),x=tile.getContext('2d');x.fillStyle='#ffffff';x.textBaseline='middle';
  if(number){
    x.textAlign='left';x.textBaseline='alphabetic';let size=h*.96;x.font=`${size}px Narrative`;let m=x.measureText(number);
    if(m.width>w*.45){size*=w*.45/m.width;x.font=`${size}px Narrative`;m=x.measureText(number)}
    const ink=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;
    if(ink>h*.94){size*=h*.94/ink;x.font=`${size}px Narrative`;m=x.measureText(number)}
    x.fillText(number,4,(h-m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2+m.actualBoundingBoxAscent);x.textBaseline='middle';
  }
  x.textAlign='center';const left=number?w*.46:0,width=w-left;
  for(let i=0;i<lines.length;i++)text(x,lines[i],h*.24,left+width*.5,h*(.2+i*.29),width*.88);
  s.clearRect(px,py,rot?h:w,rot?w:h);s.save();
  if(rot){s.translate(px+h,py);s.rotate(Math.PI/2);s.drawImage(tile,0,0)}else s.drawImage(tile,px,py);s.restore();
 }
 // Preserve the pearl/coin silhouette and replace only its central logotype.
 const coinRects=[[0,1877],[171,1877],[986,1877],[1157,1877],[1327,1877],[1498,1877],[1669,1877],[1840,1877]];
 for(let i=0;i<coinRects.length;i++){const [x,y]=coinRects[i];s.save();s.beginPath();s.arc(x+85.5,y+85.5,75,0,Math.PI*2);s.clip();const g=s.createRadialGradient(x+85.5,y+85.5,10,x+85.5,y+85.5,80);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#e9f4ee');s.fillStyle=g;s.fillRect(x,y,171,171);s.fillStyle='#589988';s.textAlign='center';s.textBaseline='middle';s.font='700 40px Supply';s.fillText(['cash','OTP','track','KYC','fees','notes','door','grid.pe'][i],x+85.5,y+85.5,148);s.restore()}
 fs.writeFileSync(path.join(dir,'gridpe-shards.png'),shards.toBuffer('image/png'));
 const papers=createCanvas(2048,2048),p=papers.getContext('2d');p.drawImage(await loadImage(path.join(dir,'reference-papers.png')),0,0);
 const regions=[[0,0,658,512],[658,0,658,512],[1316,0,658,512],[0,512,658,512],[0,1024,658,512],[0,1536,658,512],[658,1536,658,512],[1316,1536,658,512]];
 // Each strip has its own route marking, so the moving meshes read as
 // delivery paths throughout the original unfolding/spiralling animation.
 for(const [left,top,w,h] of regions){
  p.save();p.beginPath();p.rect(left,top,w,h);p.clip();
  for(let row=0;row<10;row++){
   const y=top+row*h/10,band=h/10;
   p.fillStyle=row%2?'#327c68':'#479981';p.fillRect(left,y,w,band);
   p.strokeStyle='#c4ffdc';p.lineWidth=3;p.setLineDash([15,15]);
   p.beginPath();p.moveTo(left+10,y+band/2);p.lineTo(left+w-10,y+band/2);p.stroke();p.setLineDash([]);
   p.fillStyle='#e1ffed';
   for(let x=left+100;x<left+w;x+=180){p.beginPath();p.moveTo(x-8,y+band*.22);p.lineTo(x+6,y+band/2);p.lineTo(x-8,y+band*.78);p.lineTo(x-2,y+band/2);p.fill()}
  }
  p.restore();
 }
 fs.writeFileSync(path.join(dir,'gridpe-papers.png'),papers.toBuffer('image/png'));
 const shreds=createCanvas(2048,2048),n=shreds.getContext('2d');n.drawImage(await loadImage(path.join(dir,'reference-shreds.png')),0,0);
 const quoteRects=[[0,0,492,912],[492,0,492,912],[982,0,492,912],[0,911,491,1137],[492,913,490,1135],[983,912,491,911]];
 const slips=[
  ['CHOOSE YOUR NOTES',['Your amount.','Your denominations.'],['Amount','Your choice','Notes','Your choice']],
  ['CHECK YOUR TOTAL',['Every fee shown','before you pay.'],['Cash amount','Separate','Delivery + platform','Shown upfront']],
  ['TRACK YOUR RIDER',['A verified rider.','Live on the map.'],['Partner','KYC verified','Tracking','Pickup to door']],
  ['CASH AT YOUR DOOR',['Real notes.','Delivered to you.'],['Destination','Your doorstep','Handover','In person']],
  ['CONFIRM WITH OTP',['Your six-digit OTP.','Your secure handover.'],['Confirmation','6-digit OTP','Cash received','By you']],
  ['GRIDPE EARLY ACCESS',['Bengaluru first.','Guwahati next.'],['Availability','Launching soon','Get notified','Join Early']]
 ];
 const logo=await loadImage(path.join(root,'assets/logo-full-760.webp'));
 for(let i=0;i<quoteRects.length;i++){
  const [left,top,w,h]=quoteRects[i], [heading,lines,details]=slips[i];
  n.save();n.beginPath();n.rect(left,top,w,h);n.clip();
  n.fillStyle='#f0f5ed';n.fillRect(left,top,w,h);
  n.fillStyle='#316f59';n.fillRect(left,top,w,14);
  n.drawImage(logo,left+w*.27,top+h*.07,w*.46,w*.46*logo.height/logo.width);
  n.fillStyle='#316f59';n.textAlign='center';n.textBaseline='middle';n.font='24px Supply';
  n.fillText('DELIVERY SLIP',left+w/2,top+h*.18,w*.85);
  n.font='22px Supply';n.fillText(heading,left+w/2,top+h*.26,w*.85);
  n.fillStyle='#213e31';
  for(let j=0;j<lines.length;j++)text(n,lines[j],48,left+w/2,top+h*(.36+j*.075),w*.84);
  n.strokeStyle='#a6bfae';n.lineWidth=2;n.setLineDash([6,6]);n.beginPath();n.moveTo(left+w*.08,top+h*.56);n.lineTo(left+w*.92,top+h*.56);n.stroke();n.setLineDash([]);
  n.font='21px Supply';n.textAlign='left';n.fillStyle='#597664';
  for(let j=0;j<4;j+=2){let y=top+h*(.63+j*.055);n.fillText(details[j],left+w*.08,y,w*.46);n.textAlign='right';n.fillStyle='#213e31';n.fillText(details[j+1],left+w*.92,y,w*.43);n.textAlign='left';n.fillStyle='#597664'}
  // A route diagram gives the intact slip a visible pickup-to-door meaning.
  let y=top+h*.84;n.strokeStyle='#316f59';n.lineWidth=4;n.setLineDash([8,10]);n.beginPath();n.moveTo(left+w*.17,y);n.lineTo(left+w*.83,y);n.stroke();n.setLineDash([]);
  for(let x of [left+w*.17,left+w*.83]){n.fillStyle='#316f59';n.beginPath();n.arc(x,y,9,0,Math.PI*2);n.fill()}
  n.font='19px Supply';n.textAlign='center';n.fillText('PICKUP',left+w*.17,top+h*.9);n.fillText('YOUR DOOR',left+w*.83,top+h*.9);
  n.restore();
 }
 // Use GridPe's existing ₹500 asset in the source's rotated banknote UV slot.
 const rupees=await loadImage(path.join(root,'assets/notes/500.webp'));
 n.save();n.beginPath();n.rect(1474,0,574,1284);n.clip();n.clearRect(1474,0,574,1284);
 n.translate(2048,0);n.rotate(Math.PI/2);n.drawImage(rupees,0,0,1284,574);n.restore();
 fs.writeFileSync(path.join(dir,'gridpe-shreds.png'),shreds.toBuffer('image/png'));
 console.log('Updated text-only shards, delivery-route ribbons, intact delivery slips, and service coins.');
})();
