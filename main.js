/* =====================================================================
   GRID.PE — motion
   ===================================================================== */
(() => {
  /* Leaving for, and coming back from, the legal pages.
     A #foot anchor alone is not enough: ten lazy images above the footer load
     after the jump, the document grows, and the browser's landing point drifts
     back towards the top. So the exact offset is stashed on the way out and
     re-applied on the way back until the layout stops moving. */
  const RETURN_Y = 'gridpe:returnY';

  document.querySelectorAll('a[href$="privacy.html"],a[href$="terms.html"]')
    .forEach(a => a.addEventListener('click', () => {
      try { sessionStorage.setItem(RETURN_Y, String(window.scrollY)); } catch (e) {}
    }));

  (() => {
    const root = document.documentElement;
    let want = null;
    try {
      const saved = sessionStorage.getItem(RETURN_Y);
      if (saved !== null) {
        sessionStorage.removeItem(RETURN_Y);
        const n = parseInt(saved, 10);
        /* a stash of ~0 means they never scrolled: let the #foot anchor decide */
        if (Number.isFinite(n) && n > 200) want = n;
      }
    } catch (e) {}

    /* no stash (bookmark, hard refresh, JS off on the way out): fall back to #foot */
    if (want === null && location.hash.length > 1) {
      const t = document.querySelector(location.hash);
      if (t) want = -1;                                 /* resolve lazily, it moves too */
      else return;
    }
    if (want === null) return;

    const resolve = () => want >= 0
      ? want
      : document.querySelector(location.hash).getBoundingClientRect().top + root.scrollTop;

    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';                 /* smooth would animate up from 0 */

    let ticks = 0;
    const apply = () => { root.scrollTop = resolve(); };
    apply();
    const timer = setInterval(() => {
      apply();
      if (++ticks > 14) { clearInterval(timer); root.style.scrollBehavior = prev; }
    }, 70);
    addEventListener('load', apply, { once: true });
  })();

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- word splitting (band + mission) ---------------------- */
  $$('[data-reveal-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      const inner = document.createElement('i');
      inner.textContent = w;
      inner.style.transitionDelay = (i * 26) + 'ms';
      span.appendChild(inner);
      el.appendChild(span);
      el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- reveal on enter -------------------------------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  $$('[data-reveal],[data-reveal-lines],[data-reveal-words],[data-reveal-stagger]').forEach(el => {
    if (reduced) { el.classList.add('is-in'); return; }
    io.observe(el);
  });

  /* hero fires immediately so the page never opens on a blank screen */
  requestAnimationFrame(() => {
    $$('.hero [data-reveal],.hero [data-reveal-lines]').forEach(el => el.classList.add('is-in'));
  });

  /* ---------- keypad stagger index --------------------------------- */
  $$('.work__art--order .pad span').forEach((s, i) => s.style.setProperty('--i', i));

  /* ---------- nav: always on screen, + the parked hero line -------- */
  /* The nav used to retract on scroll-down. It now stays put for the whole
     page, with a line parked underneath that changes per section - repeating
     the hero sentence for ten screens spent the space without saying anything
     new. It steps aside over the coverage map, which is interactive. */
  const nav = $('#nav');
  const heroSub = $('.hero__sub');
  const tagline = $('#navTagline');
  const pill = $('.nav__pill');
  const coverage = $('.coverage');
  const noFloat = $$('.coverage, .strap');
  const tagged = $$('[data-tag]');
  let lastTag = '';

  const onNav = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 40);

    if (!heroSub || !tagline) return;

    const pillBottom = pill ? pill.getBoundingClientRect().bottom : 76;
    tagline.style.setProperty('--tagTop', Math.round(pillBottom + 9) + 'px');

    const handoff = pillBottom + 10;
    const arrived = heroSub.getBoundingClientRect().bottom <= handoff;

    /* the map is interactive and the strap is loud - do not float text over
       either of them */
    let blocked = false;
    for (const el of noFloat) {
      const r = el.getBoundingClientRect();
      if (r.top <= handoff + 30 && r.bottom >= handoff - 10) { blocked = true; break; }
    }

    tagline.classList.toggle('is-pinned', arrived && !blocked);
    heroSub.classList.toggle('is-parked', arrived);

    /* whichever tagged section the line is currently sitting over wins */
    let next = '';
    for (const el of tagged) {
      if (el.getBoundingClientRect().top <= handoff + 40) next = el.dataset.tag;
    }
    if (next && next !== lastTag) { tagline.textContent = next; lastTag = next; }
  };

  /* ---------- burger / drawer -------------------------------------- */
  const burger = $('#burger'), drawer = $('#drawer');
  const setDrawer = open => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
  $$('#drawer a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setDrawer(false));

  /* ---------- scroll-linked transforms ----------------------------- */
  const stage = $('#heroStage');
  const arts = $$('.pile__art');
  const vh = () => window.innerHeight;

  const onScroll = () => {
    /* hero phone rises + scales as it enters the viewport */
    if (stage) {
      const r = stage.getBoundingClientRect();
      const p = clamp(1 - (r.top / vh()), 0, 1);
      stage.style.transform =
        `translateY(${(46 * (1 - p)).toFixed(2)}px) scale(${(0.86 + 0.18 * p).toFixed(4)}) ` +
        `perspective(1200px) rotateX(${(7 * (1 - p)).toFixed(2)}deg)`;
    }

    /* Each cluster on the pinboard drifts at its own rate and sign, so the
       scatter keeps re-composing as you pass it. Translate only - the angles
       live on .snap in CSS, so a transform here can never flatten them. */
    arts.forEach(el => {
      const r = el.getBoundingClientRect();
      const p = clamp((r.top + r.height / 2) / vh(), -0.5, 1.5) - 0.5;
      const drift = Number(el.dataset.drift) || 1;
      el.style.transform = `translate3d(0,${(p * -32 * drift).toFixed(2)}px,0)`;
    });
  };

  /* ---------- one URL per section ----------------------------------
     The address bar follows the reader, so a link to whatever they are
     looking at is always one copy away. replaceState rather than pushState:
     the back button should leave the page, not walk back up it. */
  const sections = $$('main > section[id], footer[id]');
  let lastHash = location.hash;

  const syncHash = () => {
    if (!sections.length) return;
    const probe = innerHeight * 0.35;
    let active = '';
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= probe) active = sec.id;
    }
    /* at the very top the URL stays clean, with no stray #hero */
    const next = (scrollY < 80 || !active) ? '' : '#' + active;
    if (next === lastHash) return;
    lastHash = next;
    try {
      history.replaceState(null, '', next || location.pathname + location.search);
    } catch (e) { /* file:// and the like */ }
  };

  let ticking = false;
  const tick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onNav(); syncHash(); if (!reduced) onScroll(); ticking = false; });
  };
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  tick();

  /* ---------- kinetic strap: direction follows the scroll ----------- */
  /* Position is integrated from a velocity rather than mapped from scrollY.
     That is what buys the two things a scroll-linked transform cannot do: it
     keeps drifting when the page is still, and it eases through zero when the
     direction flips instead of snapping. The wrap is a modulo of one row's
     width, and every row is identical, so translating by -unit and by 0 are
     the same picture - there is no seam to see. */
  const strap = $('.strap');
  const strapTrack = $('#strapTrack');
  if (strap && strapTrack) {
    const row0 = $('.strap__row', strapTrack);

    const AMBIENT = 100;   // px/s of drift when nobody is scrolling
    const GAIN    = 0.65;  // px/s of strap per px/s of scroll
    const CAP     = 1700;  // px/s ceiling, so a trackpad flick stays legible
    const RESP    = 5;     // how fast speed chases its target (per second)
    const SMOOTH  = 8;     // how fast scroll speed is smoothed (per second)
    const RETURN  = 1.6;   // how fast it un-inverts once you stop scrolling up

    let unit = 0;
    /* One row is authored in HTML; clone only as many as the viewport needs to
       stay covered at the far end of the wrap. Re-run on resize and once the
       webfonts land, because both change the row's measured width. */
    const fill = () => {
      $$('.strap__row', strapTrack).forEach((r, i) => { if (i) r.remove(); });
      unit = row0.getBoundingClientRect().width;
      if (!unit) return;
      const need = Math.max(2, Math.ceil((innerWidth + unit) / unit));
      for (let i = 1; i < need; i++) strapTrack.appendChild(row0.cloneNode(true));
    };

    fill();
    addEventListener('resize', fill, { passive: true });
    document.fonts?.ready.then(fill);
    addEventListener('load', fill);

    if (!reduced) {
      /* Leftward is the resting state: the strap always slides left, and
         scrolling up inverts it. `up` is the inversion amount, not a latch -
         it is pinned to 1 while you scroll up and eases back to 0 when you
         stop, so the strap returns to its leftward drift on its own instead
         of staying reversed until the next downward scroll. */
      let offset = 0, speed = 0, up = 0, scrollSpd = 0, pending = 0;
      let lastY = window.scrollY, prev = 0, running = false, onScreen = false;

      addEventListener('scroll', () => {
        const y = window.scrollY, d = y - lastY;
        lastY = y;
        /* a small deadzone keeps sub-pixel jitter from flipping the direction */
        if (d < -0.4) up = 1; else if (d > 0.4) up = 0;
        pending += Math.abs(d);
      }, { passive: true });

      const frame = now => {
        if (!running) return;
        const dt = prev ? Math.min((now - prev) / 1000, 0.05) : 0.016;
        prev = now;

        const inst = pending / dt; pending = 0;
        scrollSpd += (inst - scrollSpd) * Math.min(1, dt * SMOOTH);
        up += (0 - up) * Math.min(1, dt * RETURN);

        /* +1 while resting or scrolling down, -1 while scrolling up, and every
           value between during the changeover - so the flip is a slide, not a
           switch, on top of the easing below */
        const swing = 1 - 2 * up;
        const target = swing * Math.min(AMBIENT + scrollSpd * GAIN, CAP);
        speed += (target - speed) * Math.min(1, dt * RESP);

        if (unit) {
          offset = (offset + speed * dt) % unit;
          if (offset < 0) offset += unit;
          strapTrack.style.transform = 'translate3d(' + -offset + 'px,0,0)';
        }
        requestAnimationFrame(frame);
      };

      /* off-screen and hidden tabs cost nothing: the loop is not scheduled */
      const run = on => {
        if (on === running) return;
        running = on;
        if (on) { prev = 0; requestAnimationFrame(frame); }
      };
      new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        run(onScreen && !document.hidden);
      }, { rootMargin: '150px 0px' }).observe(strap);
      document.addEventListener('visibilitychange',
        () => run(onScreen && !document.hidden));
    }
  }


  /* ---------- hero cursor sticker trail ---------------------------- */
  /* Each sticker is DROPPED at a point on the cursor's path and stays there
     while it lives, so the path itself stays drawn behind you. It is angled
     to the direction of travel, so consecutive drops overlap into a ribbon
     rather than looking scattered. Pure CSS transitions - no rAF - so the
     trail keeps working even when the tab throttles animation frames. */
  const trail = $('#trail'), hero = $('#hero');

  if (trail && hero && matchMedia('(pointer: fine)').matches && !reduced) {
    // real notes differ in size, so the sticker width tracks the denomination
    const NOTES = [
      ['10',  158], ['20',  166], ['50',  174],
      ['100', 182], ['200', 190], ['500', 198]
    ];

    const POOL    = 24;    // enough live cards to cover a fast sweep
    const EMIT_PX = 52;    // cursor travel between drops -> how tight the ribbon is
    const LIFE    = 950;   // ms a card holds before it starts fading

    const pool = Array.from({ length: POOL }, (_, i) => {
      const [note, w] = NOTES[i % NOTES.length];
      const el = document.createElement('div');
      el.className = 'sticker';
      el.style.width = w + 'px';
      el.innerHTML = `<img src="assets/notes/${note}.webp" alt="" draggable="false">`;
      trail.appendChild(el);
      return el;
    });

    // a straight 6-cycle would read as an obvious repeat, so fix one shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    let idx = 0, z = 1, lx = null, ly = null, travel = 0, flip = 1;

    const drop = (x, y, dx, dy) => {
      const el = pool[idx];
      idx = (idx + 1) % POOL;

      // tilt toward the direction of travel, folded into a gentle range so a
      // leftward sweep never flips a card upside down
      let a = Math.atan2(dy, dx) * 180 / Math.PI;
      if (a > 90) a -= 180; else if (a < -90) a += 180;
      const ang = (a * 0.42) + (flip = -flip) * 5;

      const at = s => `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${ang.toFixed(1)}deg) scale(${s})`;

      clearTimeout(el._in);
      clearTimeout(el._out);

      el.style.zIndex = String(++z);      // newest card lies on top of the ribbon
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = at('.68');

      void el.offsetWidth;                // commit the reset before animating

      el.style.transition = 'transform .45s cubic-bezier(.2,1.1,.3,1), opacity .14s linear';
      el.style.opacity = '1';
      el.style.transform = at('1');

      // it stays put, then sinks and fades where it was dropped
      el._out = setTimeout(() => {
        el.style.transition = 'transform .65s ease-out, opacity .5s ease-out';
        el.style.opacity = '0';
        el.style.transform =
          `translate3d(${x.toFixed(1)}px, ${(y + 20).toFixed(1)}px, 0) translate(-50%, -50%) rotate(${(ang * 1.25).toFixed(1)}deg) scale(.92)`;
      }, LIFE);
    };

    hero.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = trail.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;

      if (lx === null) { lx = x; ly = y; return; }   // need a direction first

      const dx = x - lx, dy = y - ly;
      travel += Math.hypot(dx, dy);
      lx = x; ly = y;

      if (travel < EMIT_PX) return;
      travel = 0;
      drop(x, y, dx, dy);
    }, { passive: true });

    hero.addEventListener('pointerleave', () => { lx = null; travel = 0; });
  }

  /* ---------- butterfly cursor: coverage map only -------------------- */
  /* Over the India map section the cursor becomes a 500-note butterfly.
     Position is driven by a CSS transition on transform (not rAF), so it
     trails the pointer with a little lag and never fights the frame budget. */
  const fly = $('#fly'), flyZone = $('.coverage');

  if (fly && flyZone && matchMedia('(pointer: fine)').matches && !reduced) {
    let on = false, lx = null, px = -1, py = -1;

    const setOn = v => {
      if (v === on) return;
      on = v;
      fly.classList.toggle('is-on', v);
      document.body.classList.toggle('is-fly', v);
      if (!v) lx = null;
    };

    // strictly inside the map section - not above it, not below it, and never
    // over the basemap itself, which needs a real cursor to be usable
    const basemap = $('#map');
    const inRect = (r) => py >= r.top && py <= r.bottom && px >= r.left && px <= r.right;
    const within = () => {
      if (px < 0) return false;
      if (basemap && inRect(basemap.getBoundingClientRect())) return false;
      return inRect(flyZone.getBoundingClientRect());
    };

    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY;
      setOn(within());
      if (!on) return;

      // bank into the turn, the way a real one leans when it changes course
      const dx = lx === null ? 0 : px - lx;
      lx = px;
      const bank = clamp(dx * 1.6, -24, 24);

      fly.style.transform =
        `translate3d(${px}px, ${py}px, 0) rotate(${bank.toFixed(1)}deg)`;
    }, { passive: true });

    // the section moves under a still cursor while scrolling, so re-test then
    // too - otherwise the butterfly stays stranded on screen outside the map
    addEventListener('scroll', () => setOn(within()), { passive: true });

    addEventListener('blur', () => setOn(false));
    document.addEventListener('pointerleave', () => { px = py = -1; setOn(false); });
  }

  /* ---------- testimonial rail: arrows + drag ---------------------- */
  const rail = $('#rail');
  if (rail) {
    const step = () => (rail.querySelector('.quote')?.offsetWidth || 400) + 18;
    $$('[data-scroll]').forEach(b =>
      b.addEventListener('click', () =>
        rail.scrollBy({ left: step() * Number(b.dataset.scroll), behavior: 'smooth' })));

    let down = false, startX = 0, startLeft = 0, moved = 0;
    rail.addEventListener('pointerdown', e => {
      down = true; moved = 0;
      startX = e.clientX; startLeft = rail.scrollLeft;
      rail.classList.add('is-dragging');
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', e => {
      if (!down) return;
      const d = e.clientX - startX;
      moved = Math.abs(d);
      rail.scrollLeft = startLeft - d;
    });
    const end = e => {
      if (!down) return;
      down = false;
      rail.classList.remove('is-dragging');
      try { rail.releasePointerCapture(e.pointerId); } catch {}
    };
    rail.addEventListener('pointerup', end);
    rail.addEventListener('pointercancel', end);
    rail.addEventListener('click', e => { if (moved > 6) e.preventDefault(); }, true);
  }

  /* ---------- coverage map ------------------------------------------ */
  /* Real tiled basemap via MapLibre GL (the engine mapcn's React component
     wraps) + the India boundary drawn on top. If the CDN is blocked we fall
     back to rendering the same boundary as the dot matrix. */
  const map = $('#map');
  if (map) {
    /* Coarse India mainland ring for the dot fallback, [lon, lat] at 2dp,
       from datameet/maps india-composite (the Indian government boundary,
       including the northern territory Natural Earth's de-facto data omits),
       Douglas-Peucker simplified. The basemap overlay uses the full-detail
       assets/india.geo.json instead. */
    const INDIA = [
      [77.52,35.49],[79.34,35.99],[80.05,35.42],[80.41,35.48],[80.07,34.71],[79.51,34.45],[79.4,34],[78.89,33.97],[79.09,33.64],[78.94,33.38],[79.41,33.19],[79.55,32.68],[78.97,32.34],[78.74,32.7],[78.4,32.53],[78.78,31.99],[78.78,31.31],[79.1,31.45],[79.43,31.02],[81.03,30.25],[80.37,29.75],[80.08,28.82],[81.88,27.86],[82.71,27.72],[82.74,27.5],[83.32,27.33],[84.15,27.52],[85.21,26.76],[85.63,26.87],[85.85,26.57],[88.01,26.36],[88.12,27.92],[88.64,28.12],[88.89,27.86],[88.75,27.14],[89.13,26.81],[92.06,26.85],[92.12,27.29],[91.65,27.48],[91.64,27.76],[92.46,27.79],[92.68,28.15],[94.63,29.3],[95.26,29.07],[96.05,29.38],[96.63,28.73],[96.41,28.51],[96.71,28.61],[97.4,28.01],[96.89,27.61],[97.14,27.09],[96.7,27.37],[96.23,27.28],[95.15,26.62],[95.19,26.07],[94.63,25.4],[94.71,24.94],[94.16,23.85],[93.33,24.08],[93.39,23.13],[93.13,23.04],[93.2,22.26],[92.91,21.94],[92.7,22.16],[92.6,21.98],[92.28,23.72],[91.96,23.73],[91.62,22.94],[91.16,23.61],[91.37,24.11],[91.9,24.14],[92.16,24.42],[92.43,25.03],[89.84,25.29],[89.68,26.24],[89.36,26.01],[89.09,26.4],[88.67,26.26],[88.4,26.63],[88.52,26.36],[88.11,25.82],[89.01,25.26],[88.44,25.21],[88.01,24.67],[88.74,24.28],[88.56,23.65],[88.8,23.5],[88.72,23.26],[89,23.22],[88.84,23.01],[89.1,21.64],[88.72,21.68],[88.64,22.08],[88.25,21.56],[88.02,22.22],[88.19,22.1],[87.8,21.7],[86.91,21.34],[86.87,20.78],[87.07,20.72],[86.37,19.95],[85.04,19.39],[84.13,18.31],[82.31,17.04],[82.3,16.56],[81.27,16.29],[80.94,15.71],[80.68,15.89],[80.26,15.67],[80.05,15.07],[80.35,13.28],[79.76,11.67],[79.88,10.31],[79.29,10.26],[78.9,9.49],[79.19,9.28],[78.27,9.02],[78.07,8.37],[77.55,8.07],[76.55,8.9],[75.87,11.12],[75.2,12],[74.52,14.24],[73.46,16.05],[72.86,18.69],[73.07,19.02],[72.99,19.19],[72.81,18.89],[72.89,19.52],[72.66,19.83],[72.93,20.76],[72.6,21.3],[72.93,21.68],[72.54,21.66],[72.75,21.97],[72.51,21.98],[72.91,22.26],[72.33,22.31],[72.11,21.2],[70.82,20.69],[68.94,22.31],[70.17,22.54],[70.45,22.97],[69.2,22.84],[68.43,23.51],[68.81,23.88],[68.17,23.62],[68.36,23.97],[68.75,23.97],[68.81,24.31],[70.03,24.17],[71.12,24.4],[70.66,25.7],[70.1,25.94],[70.17,26.55],[69.51,26.74],[69.59,27.18],[70.37,28.01],[70.87,27.71],[71.9,27.96],[72.39,28.77],[72.95,29.03],[73.4,29.95],[73.97,30.2],[73.93,30.49],[74.7,31.07],[74.51,31.13],[74.61,31.89],[75.37,32.23],[74.68,32.49],[74.71,32.84],[73.63,33.09],[73.4,34.38],[74.13,35.12],[73.18,35.86],[72.57,35.85],[72.55,36.23],[73.06,36.7],[73.86,36.72],[73.67,36.92],[75.15,37.03]
    ];
    const BLR = [77.5946, 12.9716];   // default view: Bangalore
    const CITIES = [
      ['Bangalore', 77.5946, 12.9716, 'Live pilot', 1],
      ['Guwahati',  91.7362, 26.1445, 'Next',       0],
      ['Shillong',  91.8933, 25.5788, 'Planned',    0]
    ];

    /* --- fallback: the old dot matrix, same geometry ------------------ */
    const renderDots = () => {
      const kx = Math.cos(21.7 * Math.PI / 180);
      const xs = INDIA.map(p => p[0] * kx), ys = INDIA.map(p => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      const y0 = Math.min(...ys), y1 = Math.max(...ys);
      const span = Math.max(x1 - x0, y1 - y0);
      const ox = (span - (x1 - x0)) / 2, oy = (span - (y1 - y0)) / 2;
      const fit = v => v * 0.9 + 0.05;
      const project = (lon, lat) => [
        fit((lon * kx - x0 + ox) / span),
        fit(1 - (lat - y0 + oy) / span)
      ];
      const poly = INDIA.map(p => project(p[0], p[1]));
      const inside = (x, y) => {
        let hit = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const [xi, yi] = poly[i], [xj, yj] = poly[j];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
        }
        return hit;
      };
      const place = (el, x, y) => {
        el.style.left = (x * 100).toFixed(3) + '%';
        el.style.top  = (y * 100).toFixed(3) + '%';
      };
      const N = 46, frag = document.createDocumentFragment();
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const x = (c + 0.5) / N, y = (r + 0.5) / N;
          if (!inside(x, y)) continue;
          const d = document.createElement('span');
          d.className = 'dot';
          place(d, x, y);
          frag.appendChild(d);
        }
      }
      CITIES.forEach(([, lon, lat, , live]) => {
        const d = document.createElement('span');
        d.className = 'dot' + (live ? ' hot' : '');
        if (!live) d.style.background = 'rgba(255,255,255,.7)';
        place(d, ...project(lon, lat));
        frag.appendChild(d);
      });
      map.appendChild(frag);
    };

    /* No WebGL means the Map constructor throws, which would take out every
       script after this block - so gate on capability, and still guard the
       construction itself. */
    const hasWebGL = (() => {
      try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch { return false; }
    })();

    /* MapLibre is ~856 KB for a section most visitors never reach, so it is
       fetched on approach rather than shipped in the first paint. */
    const MAPLIBRE_JS  = 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.js';
    const MAPLIBRE_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.css';

    const loadMapLibre = () => new Promise((resolve, reject) => {
      if (window.maplibregl) return resolve();
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = MAPLIBRE_CSS;
      document.head.appendChild(css);
      const js = document.createElement('script');
      js.src = MAPLIBRE_JS; js.async = true;
      js.onload = () => resolve();
      js.onerror = () => reject(new Error('maplibre failed to load'));
      document.head.appendChild(js);
    });

    const buildMap = () => {
      let m = null;
      try {
        m = new maplibregl.Map({
          container: map,
          style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
          center: BLR,
          zoom: 10.6,             // the pilot city, wide enough not to imply city-wide cover
          maxBounds: [[60, 2], [105, 42]],
          scrollZoom: false,      // the page must keep its own scroll
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: true }
        });
      } catch (err) {
        console.warn('[coverage map] could not start basemap:', err);
        renderDots();
        return;
      }

      /* Zoom and fullscreen only. A geolocate control on a marketing page
         raises a permission prompt with nothing behind it. */
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      m.addControl(new maplibregl.FullscreenControl(), 'top-right');

      m.on('load', () => {
        /* 34 polygons / 4.6k points - mainland plus Andaman, Nicobar and
           Lakshadweep. Served locally, so no third-party runtime dependency. */
        m.addSource('india', { type: 'geojson', data: 'assets/india.geo.json' });
        m.addLayer({ id: 'india-fill', type: 'fill', source: 'india',
          paint: { 'fill-color': '#d4ff3d',
            /* fades out as you zoom in - held over a city it just tints
               every tile olive */
            'fill-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.07, 7, 0.03, 9, 0] } });
        m.addLayer({ id: 'india-line', type: 'line', source: 'india',
          paint: { 'line-color': '#d4ff3d', 'line-width': 1.3, 'line-opacity': 0.5 } });
        map.classList.add('is-live');
      });

      /* A blocked tile host would leave an empty box, so the dots stay as a
         net - but on a watchdog, not on `error`. MapLibre fires error for a
         single missing tile or sprite, and tearing down a working map over one
         404 is worse than the thing being guarded against. */
      m.on('error', e => console.warn('[coverage map]', (e && e.error) || e));

      /* Proof the basemap is reachable, which is the only thing the watchdog
         below is guarding. `load` is not that proof: it waits for the first
         rendered frame, so a background tab or a throttled GPU was tearing
         down maps whose tiles had arrived fine. */
      let styleOk = false;
      m.on('styledata', () => { styleOk = true; });

      setTimeout(() => {
        if (styleOk || map.classList.contains('is-live')) return;
        console.warn('[coverage map] basemap did not load - falling back to dots');
        try { m.remove(); } catch {}
        map.innerHTML = '';
        renderDots();
      }, 10000);

      CITIES.forEach(([name, lon, lat, status, live]) => {
        const el = document.createElement('span');
        el.className = 'mk' + (live ? ' mk--live' : '');
        new maplibregl.Marker({ element: el })
          .setLngLat([lon, lat])
          .setPopup(new maplibregl.Popup({ offset: 14, closeButton: false })
            .setHTML('<b>' + name + '</b><i>' + status + '</i>'))
          .addTo(m);
      });
    };

    const start = () => {
      loadMapLibre().then(buildMap).catch(err => {
        console.warn('[coverage map]', err);
        renderDots();
      });
    };

    /* The only goal here is to keep 856 KB out of the first paint, so the
       trigger is deliberately dumb: the first scroll, or four seconds, whichever
       comes first. No element geometry and no observer - both of those depend on
       a measured viewport, and a trigger that silently never fires is a worse
       outcome than fetching a little earlier than strictly needed. */
    if (!hasWebGL) {
      renderDots();
    } else {
      let started = false;
      const startOnce = () => {
        if (started) return;
        started = true;
        removeEventListener('scroll', startOnce);
        start();
      };
      addEventListener('scroll', startOnce, { passive: true });
      setTimeout(startOnce, 4000);
    }
  }

  /* ---------- how-it-works: one clock for both card demos ----------- */
  /* The keypad and the OTP used to loop on their own timers, so three things
     moved in one viewport with no relationship between them. They now share a
     period and sit at different phases, which reads as the sequence the copy
     describes: order first, then receive. */
  const DEMO_CYCLE = 12000;
  const runPhased = (fn, offset) => {
    setTimeout(() => { fn(); setInterval(fn, DEMO_CYCLE); }, offset);
  };

  /* ---------- keypad auto-types an amount (card 01) ----------------- */
  const order = $('.work__art--order');
  if (order) {
    const keys   = $$('.pad span', order);
    const digits = $('.amt__digits', order);
    const fee    = $('.amt__fee', order);
    const AMOUNT = '2000';
    const IDLE   = 'Fee shown before you pay';
    /* No fee figure is invented here. Set data-fee on .amt in index.html to the
       real delivery fee in rupees and the demo will show it; leave it off and
       the card keeps the promise without quoting a number nobody has agreed. */
    const feeAmt = $('.amt', order)?.dataset.fee;
    const feeLine = feeAmt
      ? 'Fee \u20B9' + feeAmt + ' \u00B7 shown before you pay'
      : 'Every charge shown before you pay';
    const key    = label => keys.find(k => k.textContent === label);

    const show = v => { digits.textContent = v ? Number(v).toLocaleString('en-IN') : '0'; };
    const strike = el => {
      if (!el) return;
      el.classList.remove('hit');
      void el.offsetWidth;
      el.classList.add('hit');
      setTimeout(() => el.classList.remove('hit'), 300);
    };

    if (reduced) {
      show(AMOUNT);
      fee.textContent = feeLine;
      fee.classList.add('is-set');
    } else {
      let timers = [];
      const at = (ms, fn) => timers.push(setTimeout(fn, ms));

      const run = () => {
        timers.forEach(clearTimeout); timers = [];
        let v = '';
        show(''); fee.textContent = IDLE; fee.classList.remove('is-set');

        [...AMOUNT].forEach((d, i) => at(700 + i * 300, () => {
          v += d; strike(key(d)); show(v);
        }));

        const typed = 700 + AMOUNT.length * 300;
        at(typed + 450, () => {
          fee.textContent = feeLine;
          fee.classList.add('is-set');
        });

        /* backspace it out again so the loop reads as one continuous demo */
        [...AMOUNT].forEach((_, i) => at(typed + 3000 + i * 190, () => {
          v = v.slice(0, -1); strike(key('⌫')); show(v);
          if (!v) { fee.textContent = IDLE; fee.classList.remove('is-set'); }
        }));

      };
      runPhased(run, 0);
    }
  }

  /* ---------- track card expands on the shared clock (card 02) ------ */
  /* Was hover-only, which left it inert beside two self-running cards. The
     expanded state is the same one hover produces - .is-demo just joins the
     :is() group in the stylesheet, so there is one set of styles, not two. */
  const trackCard = $('.work__art--track')?.closest('.work');
  if (trackCard) {
    if (reduced) {
      trackCard.classList.add('is-demo');        // no motion: show it open
    } else {
      runPhased(() => {
        trackCard.classList.add('is-demo');
        setTimeout(() => trackCard.classList.remove('is-demo'), 4200);
      }, 2600);
    }
  }

  /* ---------- OTP demo (how-it-works, card 03) ---------------------- */
  /* Purely a demonstration: it types the code in, verifies, holds, repeats.
     The slots are spans, not inputs - a marketing page should not hand a
     keyboard user six dead fields or narrate "verifying with rider" to a
     screen reader when nothing was ordered. */
  $$('.otpf').forEach(f => {
    const slots = $$('.otpf__slot', f);
    const msg   = $('.otpf__msg', f);
    const code  = f.dataset.code;
    let timers = [];

    const at   = (ms, fn) => timers.push(setTimeout(fn, ms));
    const stop = () => { timers.forEach(clearTimeout); timers = []; };
    const set  = (state, text) => { f.dataset.state = state; msg.textContent = text; };
    const land = i => {
      const el = slots[i];
      el.classList.remove('in');
      void el.offsetWidth;              // restart the keyframe
      el.classList.add('in');
    };
    const clear = () => {
      slots.forEach(s => { s.textContent = ''; s.classList.remove('in'); });
      set('idle', '');
    };

    const cycle = () => {
      stop();
      clear();
      [...code].forEach((d, i) => at(400 + i * 190, () => { slots[i].textContent = d; land(i); }));
      at(400 + code.length * 190 + 200, () => set('checking', 'Verifying with rider…'));
      at(400 + code.length * 190 + 200 + 1100, () => set('ok', 'Delivery confirmed · receipt sent'));
    };

    if (reduced) {                       // no motion: just show the settled state
      [...code].forEach((d, i) => { slots[i].textContent = d; });
      set('ok', 'Delivery confirmed · receipt sent');
    } else {
      runPhased(cycle, 7200);            // after order, then track
    }
  });


  /* ---------- confetti on a successful signup ----------------------
     Same integrator and collision model as the Wozku landing page: gravity,
     air drag, a cheap top-face-only collision test against real element rects,
     and a rest state once the bounce energy dies. Two things differ here. The
     burst starts at the submit button and fans radially, rather than raining
     from a band across the top. And the obstacle list is this page's furniture,
     so pieces pile on the form, the copy under it and the footer edge.       */
  let confettiId = 0;

  function fireConfetti(originEl) {
    const canvas = document.getElementById('confetti');
    if (!canvas) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (confettiId) cancelAnimationFrame(confettiId);

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.width  = innerWidth  * dpr;
    const h = canvas.height = innerHeight * dpr;

    /* only the top edge of each rect is solid, which is all a falling piece
       ever meets and keeps the test to one comparison per obstacle */
    const SHELVES = ['.cta__form', '.cta__msg', '.cta__next', '.cta__consent',
                     '.nav__pill', '.foot__legal', '.foot'];
    const getObstacles = () => {
      const rects = [];
      SHELVES.forEach(sel => document.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight) {
          rects.push({ left:r.left*dpr, right:r.right*dpr, top:r.top*dpr, bottom:r.bottom*dpr });
        }
      }));
      rects.push({ left:0, right:w, top:h - 14*dpr, bottom:h + 100*dpr });  /* the floor */
      return rects;
    };
    let obstacles = getObstacles();

    const COLORS = ['#d4ff3d', '#ff00e5', '#ff6ae8', '#7b2bff', '#57d9ff',
                    '#fff4e0', '#ffffff', '#20c368', '#02bbff', '#b6ef12'];

    const box = (originEl || canvas).getBoundingClientRect();
    /* if the origin has been scrolled out of view the whole burst would spawn
       off-canvas and die on frame one, so keep it inside the viewport */
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const ox = clamp(box.left + box.width / 2, 40, innerWidth  - 40) * dpr;
    const oy = clamp(box.top + box.height / 2, 60, innerHeight - 60) * dpr;

    const COUNT = 140;
    const particles = Array.from({ length: COUNT }, () => {
      /* fan across the upper hemisphere so it reads as a popper, not a fountain */
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.72;
      const speed = (6 + Math.random() * 11) * dpr;
      return {
        x: ox + (Math.random() - 0.5) * box.width * 0.55 * dpr,
        y: oy + (Math.random() - 0.5) * 8 * dpr,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        pw: (5.5 + Math.random() * 5) * dpr,
        ph: (3.5 + Math.random() * 4) * dpr,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        resting: false
      };
    });

    let isFading = false, fade = 0, lastY = scrollY;

    /* pieces are painted in viewport space, so a scroll has to carry them */
    const onScroll = () => {
      const d = (lastY - scrollY) * dpr;
      lastY = scrollY;
      for (const p of particles) p.y += d;
      obstacles = getObstacles();
      isFading = true;
    };
    addEventListener('scroll', onScroll, { passive: true });

    const stop = () => {
      ctx.clearRect(0, 0, w, h);
      confettiId = 0;
      removeEventListener('scroll', onScroll);
    };

    (function tick() {
      ctx.clearRect(0, 0, w, h);
      if (isFading) fade += 0.03;
      const alpha = Math.max(0, 1 - fade);
      let alive = 0;

      for (const p of particles) {
        if (!p.resting) {
          p.vy += 0.38 * dpr;
          p.vx *= 0.992;
          p.vy *= 0.996;
          p.rot += p.vr;

          const nx = p.x + p.vx, ny = p.y + p.vy;
          let hit = false;

          for (const o of obstacles) {
            if (p.vy > 0 && p.y <= o.top + 2 * dpr && ny >= o.top - p.ph / 2 &&
                nx >= o.left - p.pw / 2 && nx <= o.right + p.pw / 2) {
              p.y = o.top - p.ph / 2;
              p.x = nx;
              p.vy = -p.vy * 0.2;      /* keep a fifth of the impact: paper does not bounce */
              p.vx *= 0.65;
              p.vr *= 0.35;
              if (Math.abs(p.vy) < 0.9 * dpr) { p.vy = p.vx = p.vr = 0; p.resting = true; }
              hit = true;
              break;
            }
          }
          if (!hit) { p.x = nx; p.y = ny; }
        }

        if (p.y < h + 50 && p.y > -50) alive++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.pw / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.pw / 2, -p.ph / 2, p.pw, p.ph);
        ctx.restore();
      }

      if (alive > 0 && alpha > 0.005) confettiId = requestAnimationFrame(tick);
      else stop();
    })();
  }

  /* ---------- waitlist form ---------------------------------------- */
  /* Posts to Supabase PostgREST (data-endpoint + data-key on the form). The
     table is insert-only for the anon role, so return=minimal is required: with
     no select policy, asking for the row back would 403. A duplicate email comes
     back as 409 / 23505 and is a success from the visitor's point of view.
     With no endpoint configured it does NOT pretend to have saved anything - it
     hands the visitor to email so the lead survives either way. */
  const form = $('#waitForm'), msg = $('#waitMsg');
  const FALLBACK_TO = 'hello@grid.pe';

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim();
    const btn = form.querySelector('button');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      msg.classList.add('err');
      msg.textContent = 'That email does not look right';
      form.email.focus();
      return;
    }
    msg.classList.remove('err');

    /* honeypot: a real person never fills a field they cannot see */
    if (form.company && form.company.value) {
      form.reset();
      msg.textContent = "You're on the list. We'll email you when Grid.Pe opens in your area.";
      return;
    }

    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      /* no backend yet - route it somewhere a human will actually read */
      msg.textContent = 'Opening your email app so this reaches us…';
      location.href = 'mailto:' + FALLBACK_TO
        + '?subject=' + encodeURIComponent('Waitlist: ' + email)
        + '&body=' + encodeURIComponent('Please add ' + email + ' to the Grid.Pe waitlist.');
      return;
    }

    btn.disabled = true;
    const wasLabel = btn.querySelector('span').textContent;
    btn.querySelector('span').textContent = 'Joining…';
    msg.textContent = '';

    try {
      const key = form.dataset.key;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          key ? { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'return=minimal' }
              : { Accept: 'application/json' }
        ),
        body: JSON.stringify({ email, source: 'website' })
      });

      /* already signed up: the unique index fires, which is not a failure */
      if (res.status === 409) {
        form.reset();
        msg.textContent = "You're already on the list. We'll email you when Grid.Pe opens in your area.";
        return;
      }
      if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await res.text()).slice(0, 120));

      form.reset();
      msg.textContent = "You're on the list. We'll email you when Grid.Pe opens in your area.";
      fireConfetti(btn);          /* only a real 201: a duplicate is not a new win */
    } catch (err) {
      console.warn('[waitlist]', err);
      msg.classList.add('err');
      msg.innerHTML = 'That did not go through. Email us at '
        + '<a href="mailto:' + FALLBACK_TO + '">' + FALLBACK_TO + '</a> and we will add you.';
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = wasLabel;
    }
  });
})();
