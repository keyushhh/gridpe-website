const fs=require('node:fs'),{createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
const root=require('node:path').resolve(__dirname,'..');
(async()=>{GlobalFonts.registerFromPath(root+'/assets/fonts/Bethany Elingston.otf','Narrative');const im=await loadImage(root+'/assets/textures/origami_certificate.webp'),c=createCanvas(1433,1024),x=c.getContext('2d');x.drawImage(im,0,0);
for(const [left,top,w,h] of [[425,285,580,125],[420,580,600,155],[160,893,270,36],[1060,893,200,36]])x.drawImage(im,500,120,w,h,left,top,w,h);
x.fillStyle='#33302b';x.textAlign='center';x.textBaseline='middle';x.font='25px Narrative';
for(const [text,y] of [['Real notes, to your door.',308],['Delivered by KYC-verified partners.',346],['Confirmed with a secure six-digit OTP.',385],['No wallet. No locked balance.',600],['Clear fees before you pay.',638],['Your invitation to doorstep cash.',677],['Bengaluru first. Guwahati next.',716]])x.fillText(text,716,y);
x.font='23px Narrative';x.fillText('GridPe Cash Logistics',294,908);x.fillText('Early Access',1157,908);
fs.writeFileSync(root+'/assets/experience/gridpe-welcome.png',c.toBuffer('image/png'));})();
