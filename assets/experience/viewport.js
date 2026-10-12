// Keep the signup bar above a mobile keyboard without resizing WebGL to the
// visual viewport. The browser's layout viewport remains the scene coordinate system.
export function syncVisualViewport() {
  const viewport = window.visualViewport;
  const height = viewport?.height || window.innerHeight;
  const offset = viewport?.offsetTop || 0;
  const keyboard = document.activeElement?.matches('input,textarea')
    ? Math.max(0, window.innerHeight - height - offset) : 0;
  document.documentElement.style.setProperty('--visual-height', `${height}px`);
  document.documentElement.style.setProperty('--keyboard-offset', `${keyboard}px`);
}
window.visualViewport?.addEventListener('resize', syncVisualViewport);
window.visualViewport?.addEventListener('scroll', syncVisualViewport);
window.addEventListener('resize', syncVisualViewport);
document.addEventListener('focusin', syncVisualViewport);
document.addEventListener('focusout', () => requestAnimationFrame(syncVisualViewport));
syncVisualViewport();
