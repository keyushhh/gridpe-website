const fs=require('node:fs'),path=require('node:path');
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/Bethany Elingston.otf'),'Narrative');
(async()=>{
 // Use the existing wordmark; only its colour changes on the dark loader.
 const logo=await loadImage(path.join(root,'assets/logo-full.png'));
 const mark=createCanvas(logo.width,logo.height),m=mark.getContext('2d');m.drawImage(logo,0,0);m.globalCompositeOperation='source-in';m.fillStyle='#ffffff';m.fillRect(0,0,logo.width,logo.height);
 fs.writeFileSync(path.join(root,'assets/experience/gridpe-logo-white.png'),mark.toBuffer('image/png'));
 fs.mkdirSync(path.join(root,'assets/logos/companies'),{recursive:true});
 fs.copyFileSync(path.join(root,'assets/logo-full-320.webp'),path.join(root,'assets/logos/companies/gridpe.webp'));
 fs.mkdirSync(path.join(root,'assets/logos/tools'),{recursive:true});
 const paths={notes:'M3 6h18v12H3z M9 12h6',fees:'M7 4h10v16H7z M10 8h4 M10 12h4 M10 16h4',otp:'M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5z M12 14v3',tracking:'M12 21s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13 M10 8h4',kyc:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',security:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6'};
 for(const [name,d] of Object.entries(paths))fs.writeFileSync(path.join(root,`assets/logos/tools/${name}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#327032" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`);
 for(const [name,w,h,lines] of [['congrats',488,236,['Cash to','Your Door']],['share-card_congrats',295,92,['Your cash, within reach']]]){
  const c=createCanvas(w,h),x=c.getContext('2d');x.fillStyle='#325646';x.textAlign='center';x.textBaseline='middle';
  for(let i=0;i<lines.length;i++){let size=lines.length===1?30:82;x.font=`${size}px Narrative`;let mw=x.measureText(lines[i]).width;if(mw>w*.95)x.font=`${size*w*.95/mw}px Narrative`;x.fillText(lines[i],w/2,h*(i+.5)/lines.length)}
  fs.writeFileSync(path.join(root,`assets/ui/gridpe-${name}.png`),c.toBuffer('image/png'));
 }
 console.log('Using the existing GridPe wordmark and favicon assets.');
})();
