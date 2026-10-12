function showFallback() {
  const fallback = document.getElementById('experience-fallback');
  if (fallback) fallback.hidden = false;
}
window.addEventListener('gridpe:load-error', showFallback);
if (!window.WebGLRenderingContext) showFallback();
else import('./engine.js').catch(error => { console.error('GridPe experience failed to start', error); showFallback(); });
