import {joinWaitlist} from './waitlist.js';
const form=document.querySelector('#join-form');
form?.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=form.querySelector('button'),notice=document.querySelector('#join-status');
  button.disabled=true;notice.textContent='Joining…';
  try{await joinWaitlist(new FormData(form).get('email'));notice.textContent='You’re on the list. We’ll email when GridPe reaches your street.';form.reset()}
  catch(error){notice.textContent=error.message||'Could not join. Please try again.'}
  finally{button.disabled=false}
});
const menu=document.querySelector('.dock-menu');
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.open=false}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus()}});
const sceneVideo=document.querySelector('.scene-hero video');
if(sceneVideo){
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{if(motion.matches)sceneVideo.pause();else sceneVideo.play().catch(()=>{})};
  update();motion.addEventListener('change',update);
}
// Small product illustrations; these controls never place an order.
const sculpture=document.querySelector('.choose .cash-sculpture');
let noteTimer;
document.querySelectorAll('[data-note]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-note]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  const note=sculpture.querySelector('.selected-note');
  note.src=`/assets/notes/${button.dataset.note}.webp`;note.alt=`₹${button.dataset.note} note`;
  sculpture.classList.add('is-changing');clearTimeout(noteTimer);
  noteTimer=setTimeout(()=>sculpture.classList.remove('is-changing'),650);
}));
const handover=document.querySelector('.handover');
handover?.querySelector('button').addEventListener('click',()=>{
  const confirmed=handover.classList.toggle('is-confirmed');
  handover.querySelector('.handover-status').textContent=confirmed?'Handover confirmed · illustration':'Illustration · six-digit OTP';
  handover.querySelector('button').textContent=confirmed?'Replay the handover':'Preview the handover';
});
// Reveal sections and keep ambient motion offscreen or paused by visitor choice.
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const motionButton=document.querySelector('.motion-toggle');
const sections=[...document.querySelectorAll('.journey,.story-spread')];
let motionPaused=false;
const syncMedia=()=>{
  document.body.classList.toggle('motion-paused',motionPaused||reduceMotion.matches);
  motionButton?.setAttribute('aria-pressed',String(motionPaused));
  if(motionButton){motionButton.textContent=motionPaused?'Resume motion':'Pause motion';motionButton.disabled=reduceMotion.matches}
  document.querySelectorAll('.route-world svg').forEach(svg=>{if(motionPaused||reduceMotion.matches)svg.pauseAnimations?.();else svg.unpauseAnimations?.()});
  if(sceneVideo){if(motionPaused||reduceMotion.matches)sceneVideo.pause();else sceneVideo.play().catch(()=>{})}
};
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      // Text reveals once; the notes animate only while their section is onscreen.
      if(entry.isIntersecting)entry.target.classList.add('in-view');
      entry.target.querySelectorAll('.note,.selected-note').forEach(note=>{note.style.animationPlayState=entry.isIntersecting?'running':'paused'});
    });
  },{threshold:.12});
  sections.forEach(section=>{section.classList.add('motion-ready');observer.observe(section)});
}
motionButton?.addEventListener('click',()=>{motionPaused=!motionPaused;syncMedia()});
reduceMotion.addEventListener('change',syncMedia);
syncMedia();
import {mountNotes} from './notes-scene.js';
document.querySelectorAll('.cash-sculpture').forEach(mountNotes);
