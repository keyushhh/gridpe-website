"""Build the GridPe adaptation; preserve the vendored renderer and motion code."""
from pathlib import Path
import re, json
root = Path(__file__).resolve().parent.parent
s = (root/'_source/zero-reference-runtime.js').read_text()
old = (root/'index.html').read_text()
# Existing public GridPe waitlist config, saved independently of the new page.
config_path = root/'assets/experience/waitlist.json'
if not config_path.exists():
    endpoint = re.search(r'data-endpoint="([^"]+)"', old).group(1)
    key = re.search(r'data-key="([^"]+)"', old).group(1)
    config_path.write_text(json.dumps({'endpoint':endpoint,'key':key},indent=2)+'\n')
config = json.loads(config_path.read_text())

def replace(old, new):
    global s
    assert old in s, f'Missing reference anchor: {old[:100]}'
    s = s.replace(old, new)

def function(name, next_anchor, body):
    global s
    start = s.index(name)
    end = s.index(next_anchor, start)
    s = s[:start] + body + s[end:]

replace('type:`ktx2`,key:`textsAtlas`,path:`assets/atlases/texts.ktx2`',
        'type:`texture`,key:`textsAtlas`,path:`assets/experience/gridpe-texts.png`,mipmaps:!1')
replace('type:`ktx2`,key:`spcAtlas`,path:`assets/atlases/shards-petals-coins.ktx2`','type:`texture`,key:`spcAtlas`,path:`assets/experience/gridpe-shards.png`,mipmaps:!1')
replace('type:`ktx2`,key:`certAtlas`,path:`assets/atlases/board-certificates.ktx2`','type:`texture`,key:`certAtlas`,path:`assets/experience/gridpe-papers.png`,mipmaps:!1')
replace('type:`ktx2`,key:`moneyShredsAtlas`,path:`assets/atlases/leather-money-shreds.ktx2`','type:`texture`,key:`moneyShredsAtlas`,path:`assets/experience/gridpe-shreds.png`,mipmaps:!1')
replace('type:`ktx2`,key:`worldMap`,path:`assets/atlases/world.ktx2`',
        'type:`texture`,key:`worldMap`,path:`assets/experience/indian-bank-city.png`')
# Recognize physically circular strokes in portrait/ultrawide viewports.
replace('let e=this.strokePoints,t=e.length>>1;if(t<jg)return;', 'let aspect=typeof window!==`undefined`?window.innerWidth/window.innerHeight:1;let e=this.strokePoints.map((n,i)=>i%2===0?n*aspect:n),t=e.length>>1;if(t<jg)return;')
replace('this.circleCenterUV={x:(n+1)*.5,y:(r+1)*.5}', 'this.circleCenterUV={x:(Math.min(...e.filter((v,i)=>i%2===0))+Math.max(...e.filter((v,i)=>i%2===0)))/(4*aspect)+.5,y:(Math.min(...e.filter((v,i)=>i%2===1))+Math.max(...e.filter((v,i)=>i%2===1)))/4+.5}')
# Keep the original circle opening, with a keyboard alternative to drawing.
replace('this._container.setAttribute(`aria-hidden`,`true`);let n=', '(()=>{let skip=document.createElement(`button`);skip.className=`intro-skip`;skip.textContent=`Skip drawing`;skip.type=`button`;skip.tabIndex=-1;skip.addEventListener(`click`,()=>{X.arm();Ak.isReady&&!Ak.isComplete&&Ak._onZeroComplete()});this._skip=skip;this._container.appendChild(skip)})();let n=')
replace('this._container.classList.add(`is-visible`),this._setCursor', 'this._container.classList.add(`is-visible`),this._skip.tabIndex=0,this._setCursor')
replace('this._container.classList.remove(`is-visible`),this._stopDemo()', 'this._container.classList.remove(`is-visible`),this._skip.tabIndex=-1,this._stopDemo()')
replace('E.type=`email`,E.name=`email`', 'E.type=`email`,E.setAttribute(`aria-label`,`Email address`),E.inputMode=`email`,E.name=`email`')
replace('this.el.className=`mobile-timeline`,this.el.setAttribute(`aria-hidden`,`true`)', 'this.el.className=`mobile-timeline`,this.el.setAttribute(`role`,`button`),this.el.setAttribute(`aria-label`,`Choose a scene`),this.el.tabIndex=0')
replace('this.el.addEventListener(`click`,this._onTap),this._lastProgress=-1', 'this.el.addEventListener(`click`,this._onTap),this._onTimelineKey=e=>{if(e.key===`Enter`||e.key===` `){e.preventDefault();this._onTap()}if(e.key===`Escape`)this._closeMenu()},this.el.addEventListener(`keydown`,this._onTimelineKey),this._lastProgress=-1')
replace('this.el.removeEventListener(`click`,this._onTap),this.el.parentNode', 'this.el.removeEventListener(`click`,this._onTap),this.el.removeEventListener(`keydown`,this._onTimelineKey),this.el.parentNode')
replace('if(e===this._activeStageId){this._closeMenu();return}', 'if(e===this._activeStageId&&e!==`stage1`){this._closeMenu();return}')
# Mobile visitors need the same discoverable service/zoom controls as desktop.
replace('e._stage5Controls=e.ui&&e.ui._isMobile?null:JS(', 'e._stage5Controls=JS(')
# Service cards need an explicit touch/keyboard close action, and hidden
# cards must not expose focusable controls behind the map.
replace('t.className=`map-panel`;let n=', 't.className=`map-panel`;t.setAttribute(`role`,`dialog`);t.setAttribute(`aria-label`,`GridPe service`);t.setAttribute(`aria-hidden`,`true`);t.inert=true;let n=')
replace('t.addEventListener(`pointerdown`,e=>e.stopPropagation()),t.addEventListener(`pointerup`,e=>e.stopPropagation()),t.querySelector(`[data-join]`)', '(()=>{let close=document.createElement(`button`);close.className=`mp-close`;close.type=`button`;close.setAttribute(`aria-label`,`Close service card`);close.innerHTML=`<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path d="m3 3 10 10M13 3 3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;close.addEventListener(`click`,()=>{OD(t);t._returnFocus?.focus?.()});t.querySelector(`.mp-hero`).appendChild(close);t.addEventListener(`keydown`,event=>{if(event.key===`Escape`){OD(t);t._returnFocus?.focus?.()}})})(),t.addEventListener(`pointerdown`,e=>e.stopPropagation()),t.addEventListener(`pointerup`,e=>e.stopPropagation()),t.querySelector(`[data-join]`)')
replace('function DD(e,t){X.play(`hand-entry`);', 'function DD(e,t){e.inert=false;e.setAttribute(`aria-hidden`,`false`);e._returnFocus=document.activeElement;e.scrollTop=0;X.play(`hand-entry`);')
replace('function OD(e){MD(e),AD(e),', 'function OD(e){e.inert=true;e.setAttribute(`aria-hidden`,`true`);MD(e),AD(e),')
# Fit expanded signup controls down to narrow phone widths.
replace('Math.max(120,Math.round(window.innerWidth-40-(2*o+2*c+2*s))-56)', 'Math.max(64,Math.round(window.innerWidth-40-(2*o+2*c+2*s))-56)')
# Reflow the signup bar when width changes within one breakpoint. Keep a
# partially entered address and the expanded/collapsed state intact.
replace('function pe(){Y.killTweensOf([_,v,C,O,w,T,S])', '''let resizeWidth=window.innerWidth;const reflowGate=()=>{if(resizeWidth===window.innerWidth)return;resizeWidth=window.innerWidth;B();F&&F.kill();F=null;Y.killTweensOf([_,v,C,O,w,T,S]);a=resizeWidth<=768;o=a?44:48;s=a?4:5;c=s;l=a?Math.max(64,Math.round(resizeWidth-40-(2*o+2*c+2*s))-56):320;u=o;d=s;f=o+c+l+c+o;p=l+c+o;m=a?15:16;h=a?56:104;g=f+h;_.style.setProperty(`--eg-pad`,`${s}px`);_.style.width=`${M?g:f}px`;_.style.height=`${u}px`;v.style.width=`${M?g:f}px`;v.style.height=`${u}px`;for(let button of [y,S,k]){button.style.width=`${o}px`;button.style.height=`${o}px`}x.style.top=`${-d}px`;x.style.width=`${o}px`;x.style.height=`${o+d}px`;C.style.left=`${o+c}px`;C.style.width=`${M?p+h:l}px`;C.style.height=`${u}px`;O.style.left=`${o+c+l+c}px`;O.style.width=`${o}px`;O.style.height=`${o}px`;Y.set(O,{x:M?o+c:0,opacity:M?0:1});Y.set(S,{y:M?0:-(o+d)});Y.set(A,{autoAlpha:0})};window.addEventListener(`resize`,reflowGate);function pe(){window.removeEventListener(`resize`,reflowGate);Y.killTweensOf([_,v,C,O,w,T,S])''')
replace('t.stage===`gate0to1`||t.stage===`stage1`?null:t', 't.stage===`gate0to1`||t.stage===`stage1`&&!t.resize?null:t')
# Preserve scene progress when rotation crosses the renderer asset breakpoint.
replace('JSON.stringify({stage:e,audioEnabled:X.isEnabled(),t:Date.now()})', 'JSON.stringify({stage:e,scrollPos:Gk.scrollPos,resize:!!window._gridpeResizePending,audioEnabled:X.isEnabled(),t:Date.now()})')
replace('var fk=nk<768', 'var fk=nk<=768')
replace('if(e<768!==fk){location.reload();return}', 'if(e<=768!==fk){window._gridpeResizePending=true;YO();location.reload();return}')
replace('oA.skipTo(p),qk.activate(Gk)', 'oA.skipTo(p).then(()=>{if(f&&Number.isFinite(f.scrollPos)){let bound=oA._segmentBounds[oA._activeIndex];if(bound){let position=Math.max(bound.start,Math.min(bound.end,f.scrollPos));Gk.scrollPos=position;Gk.targetScrollPos=position}}}),qk.activate(Gk)')
replace('console.error(`Fatal Error:`,e),qk.pin', 'console.error(`Fatal Error:`,e),window.dispatchEvent(new Event(`gridpe:load-error`)),qk.pin')
# Match the ₹500 note's physical aspect without altering motion or burn timing.
replace('new Zr(.345,.15,16,8)', 'new Zr(.3571428571,.15,16,8)')
replace('aspect:2.3,seed:t*.33', 'aspect:2.380952381,seed:t*.33')
# Use one native pointer. The DOM sprite duplicates the host cursor in embedded browsers.
replace('DC(),NC(X),uO()', 'NC(X),uO()')
replace('function OC(){return`url("${iC}") 0 0, pointer`}', 'function OC(){return`pointer`}')
replace('function kC(){return`url("${iC}") 0 0, grab`}', 'function kC(){return`grab`}')
replace('function AC(){return`url("${iC}") 0 0, grabbing`}', 'function AC(){return`grabbing`}')
replace('DRAW A ZERO','DRAW A CIRCLE')
# The flat stage3 panels are intact delivery slips. The strip meshes retain
# their choreography but become route ribbons rather than shredded documents.
replace('float tearDepth = 0.12;', 'float tearDepth = 0.0;')
replace('float tearDepth = 0.15 * smoothstep(0.0, 0.3, vStripBelowAmount);', 'float tearDepth = 0.0;')
replace('vec3 backBase = vec3(0.341, 0.333, 0.286);', 'vec3 backBase = vec3(0.12, 0.42, 0.32);')
replace('endHintText:`TAP\nHOLD`,onHoldStart:e=>', 'endHintText:`HOLD TO SEE\nATM HASSLES`,onHoldStart:e=>')
replace('endHintText:`TAP\nHOLD`,onHoldStart:(e,{resumeT:t}={})=>', 'endHintText:`HOLD TO EXPLORE\nCASH DELIVERY`,onHoldStart:(e,{resumeT:t}={})=>')
replace('this._wrapper.style.display=`block`,this._label&&', 'this._wrapper.style.display=`block`,this.btn.setAttribute(`aria-label`,(t.label||`Continue`).replace(/\\n/g,` `)),this._label&&')
replace('e.textContent=`degree`','e.textContent=`%`')
replace('`Next company`','`Next service`')
replace('`Previous company`','`Previous service`')
replace('KO=`zero:resume`','KO=`gridpe-experience:resume`')
replace(' BZ',' GP')
replace('Join Beta','Join Early')
replace('assets/textures/origami_certificate.webp','assets/experience/gridpe-welcome.png')
replace('Your degree is finally useful','Your cash is finally within reach')
replace('assets/ui/congrats.webp','assets/ui/gridpe-congrats.png')
replace('assets/ui/share-card_congrats.webp','assets/ui/gridpe-share-card_congrats.png')
replace('Be the first one to be onboard','Be the first one to get doorstep cash')
replace("We'll be in touch soon. Until then, keep dreaming.","We'll email when we reach your street. Until then, sit tight.")
replace('is inviting you to be part of the most immersive education experience in the world.',
        'is inviting you to get real notes delivered to your door, without the ATM hunt.')
replace("this is the first education thing i've seen that actually looks pretty cool. i just joined the beta, wanna do it with me?",
        "cash to your door, without the ATM hunt. i just joined GridPe’s waitlist, wanna join me?")
replace('WT=1245','WT=6')
replace('Founding member','Secure handover')
replace('>#${r}</span>','>6 DIGITS</span>')
replace('You are in ${o}, there are','You’re in ${o}. Your cash uses')
replace('You are in, there are','Your cash handover uses')
replace('${a}</span> people','${a}</span> digits')
replace('ahead of you.','at your door.')
replace('Share to move up','Share with a friend')
replace('Sanjay Chauhan','GridPe')
replace('sanjayboi','gridpe')
replace('https://www.zero.university','https://grid.pe')
replace('https://zero.university/founder-letters','/case-study.html')
replace('https://why.zero.university','/')
replace('zero.university','grid.pe')
replace('label:`Letters`','label:`Our Story`')
replace('label:`Why Zero`','label:`Why GridPe`')
replace('label:`Why GridPe`,href:`/`','label:`Why GridPe`,href:`/experience/why-gridpe.html`')
replace('label:`Manifesto`,href:`/manifesto`','label:`Our Story`,href:`/case-study.html`')
# Keep navigation, sharing, and the logo inside the experience website.
s=s.replace('label:`Home`,href:`/`', 'label:`Home`,href:`/gridpe-experience.html`')
s=s.replace('href:`/case-study.html`}])', 'href:`/case-study.html`},{label:`Why GridPe`,href:`/experience/why-gridpe.html`}])')
s=s.replace('https://grid.pe', '/experience/home.html')
s=s.replace('/case-study.html', '/experience/our-story.html')
s=s.replace('grid.pe/privacy.html', '/experience/privacy.html')
replace('assets/ui/zero_icon.jpg','assets/favicon/android-icon-192x192.png')
replace('assets/brand/nav_logo_white.svg','assets/experience/gridpe-logo-white.png')
replace('assets/brand/nav_logo.svg','assets/logo-full-760.webp')
# The reference swaps the loading counter for a large corner wordmark for two
# seconds. Hide the completed loader before the resumed city becomes visible.
function('onLoadComplete(){this._loaderWidth', 'showNavbar(){',
         'onLoadComplete(){this._loaderTl?.kill();this.loader.container.style.display=`none`;this.loader.text.replaceChildren()}')
replace('your education','your service')
replace('your university name','your neighbourhood')
replace('your age','cash amount')
replace("I'm in university",'Cash delivery')
replace("I'm a graduate",'Currency exchange')
replace('Lastly, is there anything we should know about you that will help us as we select people for the beta?',
        'Lastly, which denominations do you need? We’ll email when GridPe reaches your street. Read our privacy policy at /experience/privacy.html.')
replace('age:{required:!0,pattern:/^\\d{1,3}$/,validate:e=>+e>=5&&+e<=120}',
        'age:{required:!0,pattern:/^\\d{1,6}$/,validate:e=>+e>=100&&+e<=100000}')
replace('inputmode:`numeric`,maxlength:3','inputmode:`numeric`,maxlength:6')
# Keep all user data and analytics away from the reference service.
start = s.index('var lw=')
end = s.index('function bw()',start)
s = s[:start] + 'var gw=`gridpe_signup`,_w=`gridpe_waitlist_email`,vw=`gridpe_profile_complete`,yw=`gridpe:utm`;' + s[end:]
function('function bw()', 'function xw', 'function bw(){return {"Content-Type":"application/json"}}')
function('function Aw()', 'function jw', 'function Aw(){}')
function('async function Nw(', 'Y.registerPlugin(rw)', '''async function Nw(email){return joinWaitlist(email)}
async function Fw(email){
 const value=String(email||'').trim().toLowerCase(),animal=Nb();
 if(Mw(_w)!==value||!Mw(gw)){await Nw(value);jw(vw,'0');jw('gridpe_preferences','{}');jw(gw,'joined');jw(_w,value)}
 Pb(animal);Ib(animal);
 // The existing endpoint accepts email only. Optional preferences stay local.
 const profile=JSON.parse(Mw('gridpe_preferences')||'{}');
 return {registered:true,profileComplete:Mw(vw)==='1',uuid:'joined',name:profile.name||'',age:profile.age||'',city:profile.city||'',education:profile.education||'',university:profile.university||'',notes:profile.notes||'',asset:animal,referralUrl:new URL('/gridpe-experience.html',location.href).href,aheadCount:6,memberNumber:6};
}
async function Iw(profile){
 if(!Mw(gw))return {ok:false,error:'Please join with your email first.'};
 jw('gridpe_preferences',JSON.stringify(profile));jw(vw,'1');
 return {ok:true,asset:Nb(),position:null};
}
''')
replace('try{t=await Fw(e)}catch{t={registered:!1,profileComplete:!1}}',
        'try{t=await Fw(e)}catch(error){f&&f.setBusy(!1);let notice=document.getElementById("gridpe-signup-error");if(!notice){notice=document.createElement("p");notice.id="gridpe-signup-error";notice.setAttribute("role","alert");notice.style.cssText="position:fixed;bottom:92px;left:50%;transform:translateX(-50%);max-width:85vw;padding:12px 20px;border-radius:24px;background:#fff;color:#a52222;font:14px Inter,sans-serif;z-index:10000;text-align:center";document.body.appendChild(notice)}notice.textContent=error.message||"Could not join. Please try again.";return}document.getElementById("gridpe-signup-error")?.remove();')
function('BD=()=>', 'function VD(', 'BD=()=>`GridPe — Early Access`;')
# Four original marker/card slots, now describing GridPe's product.
logo_badge = re.compile(r'<div class="mp-logo"[^>]*>\s*<img data-company-logo[^>]*>\s*</div>')
s, badge_count = logo_badge.subn('', s)
assert badge_count == 1, 'Map card logo badge anchor changed'
replace('let n=e.querySelector(`[data-company-logo]`);n.alt=t.company,n.style.display=``,n.onerror=()=>{n.style.display=`none`},n.src=`/assets/logos/companies/${t.logo||ED(t.company)}.webp`;', '')
start=s.index('XS=[{name:');end=s.index('],ZS=',start)+1
cards=[
 {'name':'GridPe','logo':'gridpe','video':'1.%20Cash%20Delivery.mp4','role':'Cash Delivery','scenario':'Real notes, straight to your door','poster':'','description':'Choose your amount and denominations. See every fee before you pay.','tools':['notes','fees','otp']},
 {'name':'GridPe','logo':'gridpe','video':'2.%20Live%20Tracking.mp4','role':'Live Tracking','scenario':'Follow your verified rider, live','poster':'','description':'Watch your KYC-verified delivery partner come to you, from pickup to door.','tools':['tracking','kyc','otp']},
 {'name':'GridPe','logo':'gridpe','video':'3.%20Clear%20Pricing.mp4','role':'Clear Pricing','scenario':'Your cash. Your fees. One clear total.','poster':'','description':'Delivery fee, platform fee, and GST on fees only. No locked balances.','tools':['fees','notes','security']},
 {'name':'GridPe','logo':'gridpe','video':'','role':'India First','scenario':'Bengaluru first. Guwahati next.','poster':'/assets/tiles/onboard.webp','description':'Join the waitlist. One email when we reach your street. Nothing else.','tools':['tracking','notes','security']}
]
from urllib.parse import unquote
for card in cards:
    if card['video']:
        assert (root/'assets/videos'/unquote(card['video'])).is_file(), card['video']
s=s[:start]+'XS='+json.dumps(cards,separators=(',',':'))+s[end:]
start=s.index('YS={');end=s.index('},XS=',start)+1
s=s[:start]+'YS='+json.dumps({'notes':'Real Notes','fees':'Upfront Fees','otp':'Secure OTP','tracking':'Live Map','kyc':'Verified Rider','security':'Protected'},separators=(',',':'))+s[end:]
replace('description:e.description,tools:e.tools','description:e.description,tools:e.tools,poster:e.poster')
replace('r.style.display=t.video?``:`none`','r.poster=t.poster||``,r.style.display=(t.video||t.poster)?``:`none`')
# Copy the small preview chunk beside the adapted runtime.
replace('./stats.min-B8Jrjy3P.js','../stats.min-B8Jrjy3P.js')
# Preview route is local-only; it skips the gesture without showing debug controls.
replace('GO=(()=>{if(!WO)return null;', 'GO=(()=>{if(!WO&&!(location.hostname===`localhost`||location.hostname===`127.0.0.1`))return null;')
# The first ruler stop restarts the drawing gate, which precedes stage1.
# Suppress the unload resume save so a reload cannot return to the map.
replace('function YO(){if(!WO)try{', 'function restartGridPeExperience(){window._gridpeRestarting=!0;try{sessionStorage.removeItem(KO)}catch{}location.replace(location.pathname+location.search)}function YO(){if(window._gridpeRestarting)return;if(!WO)try{')
replace('async navigateToSegment(e){if(this._isTransitioning)return;', 'async navigateToSegment(e){if(e===`stage1`){restartGridPeExperience();return}if(this._isTransitioning)return;')
replace('e!==this._activeStageId&&this._onStageClick', '(e!==this._activeStageId||e===`stage1`)&&this._onStageClick')
# Align restored/preview scenes with the global scroll timeline.
replace('await this._activateSegment(t)}getResumeSegmentId()', 'await this._activateSegment(t);let bound=this._segmentBounds[t];if(bound){n.scrollPos=bound.start;n.targetScrollPos=bound.start;if(location.hostname===`localhost`||location.hostname===`127.0.0.1`){let params=new URLSearchParams(location.hash.slice(1)),sample=Number(params.get(`progress`));if(params.has(`progress`)&&Number.isFinite(sample)){let position=bound.start+(bound.end-bound.start)*Math.max(0,Math.min(.99,sample));n.scrollPos=position;n.targetScrollPos=position}}}}getResumeSegmentId()')
# Reference prewarm can finish after a user switches scenes and disposes materials.
replace('pe.get(e).currentProgram.isReady()', '(pe.get(e)?.currentProgram?.isReady?.()??!0)')
replace('this.ctx=e,this.segments=t,this.isActive', 'this.ctx=e,e._stage3HoldZoomT??=0,this.segments=t,this.isActive')
s=s.replace('`/experience/home.html?ref=${e}`', 'new URL(`/gridpe-experience.html?ref=${e}`,location.href).href')
s=s.replace('`/experience/home.html?ref=${r}`', 'new URL(`/gridpe-experience.html?ref=${r}`,location.href).href')
s=s.replace(':`/experience/home.html`);c.replace', ':new URL(`/gridpe-experience.html`,location.href).href);c.replace')
s=s.replace(':`/experience/home.html`),g=h.replace', ':new URL(`/gridpe-experience.html`,location.href).href),g=h.replace')
s=s.replace('label:`Home`,href:`/experience/home.html`', 'label:`Home`,href:`/gridpe-experience.html`')
s=s.replace('window.open(`/experience/home.html`,`_blank`,`noopener`)', 'window.location.assign(`/gridpe-experience.html`)')
s=s.replace('`Visit grid.pe`', '`GridPe experience home`')
# Source attribution retained in console; adaptation explicitly identified.
replace('Website designed by Zero University and developed by BUNQ LABS.',
        'Reference experience designed by Zero University and developed by BUNQ LABS. GridPe content adaptation.')
(root/'assets/experience/engine.js').write_text("import {joinWaitlist} from './waitlist.js';\nimport './viewport.js';\n"+s)

html=(root/'_source/zero-reference.html').read_text()
html=re.sub(r'<!-- Published:.*?-->','<!-- GridPe content adaptation of the requested Zero reference experience. -->',html,count=1)
html=re.sub(r'<script\s+async\s+src="https://www.googletagmanager.com/.*?</script>\s*<script>.*?</script>','',html,flags=re.S)
html=html.replace('Zero — Human Infrastructure to Get Hired','GridPe — Real Notes, to Your Door')
html=html.replace('Zero is building human infrastructure for the AI era. Learn, build, and get hired through immersive, AI-native experiences designed by reverse-engineering real jobs.',
                  'Skip the ATM hunt. Order real notes, track a verified rider, and confirm your doorstep cash delivery with a secure OTP. Bengaluru first, Guwahati next.')
html=html.replace('https://why.zero.university/assets/brand/og_image.jpg','https://grid.pe/assets/og-image.png')
html=html.replace('https://why.zero.university/','/gridpe-experience.html')
# The preview is separate and should not compete with the live homepage in search.
html=html.replace('<link rel="canonical" href="/gridpe-experience.html" />', '<meta name="robots" content="noindex, nofollow" />')
html=html.replace('<link rel="icon" type="image/svg+xml" href="./assets/brand/favicon.svg" />','<link rel="icon" href="/assets/favicon/favicon.ico" sizes="any" />')
html=html.replace('./assets/brand/favicon.png','/assets/favicon/favicon-32x32.png')
html=html.replace('./assets/brand/apple-touch-icon.png','/assets/favicon/apple-icon-180x180.png')
html=html.replace('/assets/main-B9-HtP-f.js','/assets/experience/engine.js')
html=html.replace('/assets/experience/engine.js','/assets/experience/boot.js')
html=html.replace('width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no','width=device-width, initial-scale=1.0, viewport-fit=cover')
html=html.replace('/assets/main-yeWZtezw.css','/assets/experience/experience.css')
html=html.replace('</head>', '<link rel="stylesheet" href="/assets/experience/story.css">\n</head>')
html=html.replace('</head>', '<link rel="stylesheet" href="/assets/experience/responsive.css">\n</head>')
html=html.replace('</body>', '<section id="experience-fallback" class="experience-fallback" hidden><h1>Cash, delivered to your door.</h1><p>The interactive experience could not load on this browser. You can still explore GridPe and join early on the experience Home page.</p><a href="/experience/home.html">Explore GridPe</a></section><script nomodule>var fallback=document.getElementById("experience-fallback");if(fallback)fallback.hidden=false;</script><noscript><div class="experience-fallback"><h1>Welcome to GridPe</h1><p>This interactive experience needs JavaScript.</p><a href="/experience/home.html">Explore GridPe</a></div></noscript>\n</body>')
html=html.replace('ZERO interactive 3D experience','GridPe interactive 3D experience')
(root/'gridpe-experience.html').write_text('\n'.join(line.rstrip() for line in html.splitlines())+'\n')
print('Adapted renderer, content, brand, marker cards, metadata, and signup service.')
