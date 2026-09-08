/* =====================================================================
   GRID.PE — cookie consent + analytics
   ---------------------------------------------------------------------
   GA4 sets cookies, so it does not load until the visitor accepts. The
   banner injects itself (no markup to keep in sync across four pages) and
   only appears when there is no stored choice. Decline is a real decline:
   nothing loads, and the choice is remembered so the banner stays gone.

   GA_ID is the "gridpe-website" web stream on the Grid.Pe property - separate
   from the Firebase-created gridpe-rider property, which measures the rider
   app and a different set of people. Blank the ID out and this whole file goes
   inert: no banner, no cookies, nothing loaded.
   ===================================================================== */
(() => {
  const GA_ID = 'G-4931QV7MN8';                  /* gridpe-website web stream */
  const KEY   = 'gridpe:consent';               /* 'yes' | 'no' */

  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) return;  /* not configured yet */

  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = v  => { try { localStorage.setItem(KEY, v); } catch (e) {} };

  function loadGA() {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  if (read() === 'yes') { loadGA(); return; }
  if (read() === 'no') return;

  /* ---------- banner ---------- */
  const el = document.createElement('div');
  el.className = 'cbar';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Cookie notice');
  /* The sentence carries the site's voice; the two buttons do not. Consent has
     to be unambiguous, so "Accept" and "Decline" stay the plain words they are
     - a clever label on a consent button is the thing regulators call a dark
     pattern, and it is the one place on this site where being cute costs us. */
  el.innerHTML =
    '<svg class="cbar__ico" viewBox="0 0 24 24" width="21" height="21" fill="none" '
    + 'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" '
    + 'stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5 4 4 0 0 1-5-5 3.6 3.6 0 0 1-4.5-4.5Z"/>'
    + '<circle cx="9" cy="10" r="1.05" fill="currentColor" stroke="none"/>'
    + '<circle cx="8.6" cy="15.2" r="1.05" fill="currentColor" stroke="none"/>'
    + '<circle cx="13.8" cy="15.6" r="1.05" fill="currentColor" stroke="none"/>'
    + '</svg>'
    + '<p class="cbar__t">We count which pages get read. Nothing else, and never '
    + 'your email. <a href="/privacy.html">Privacy Policy</a></p>'
    + '<div class="cbar__b">'
    + '<button type="button" class="cbar__no">Decline</button>'
    + '<button type="button" class="cbar__ok">Accept</button>'
    + '</div>';

  const close = () => { el.classList.remove('is-in'); setTimeout(() => el.remove(), 600); };

  el.querySelector('.cbar__ok').addEventListener('click', () => { save('yes'); loadGA(); close(); });
  el.querySelector('.cbar__no').addEventListener('click', () => { save('no'); close(); });

  const mount = () => {
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
  };
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', mount)
    : mount();
})();
