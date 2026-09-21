/* =====================================================================
   GRID.PE — case study
   Self-contained: main.js is written against the homepage's sections and
   is not loaded here. The reveal classes it toggles (.is-in) are the same
   ones styles.css transitions, so the language matches without the weight.
   ===================================================================== */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal on enter -------------------------------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });

  $$('[data-reveal],[data-reveal-lines],[data-reveal-stagger]').forEach(el => {
    if (reduced) { el.classList.add('is-in'); return; }
    io.observe(el);
  });

  /* the hero fires immediately so the page never opens blank */
  requestAnimationFrame(() => {
    $$('.csh [data-reveal],.csh [data-reveal-lines],.csh [data-reveal-stagger]')
      .forEach(el => el.classList.add('is-in'));
  });

  /* ---------- nav: stuck state + drawer ---------------------------- */
  const nav = $('#nav');
  addEventListener('scroll', () => {
    nav.classList.toggle('is-stuck', scrollY > 40);
  }, { passive: true });

  const burger = $('#burger');
  const drawer = $('#drawer');
  const setDrawer = open => {
    burger.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.toggleAttribute('inert', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });

  /* ---------- chapter rail: which section is in view ---------------- */
  const rail = $('#rail');
  if (rail) {
    const links = new Map($$('a', rail).map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const a = links.get(e.target.id);
        if (a) a.classList.toggle('is-here', e.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- 04: the order lifecycle stepper ---------------------- */
  /* Which party is acting at each step, and the sentence under the diagram.
     The panes carry the prose; this only drives the highlight. Grid.Pe is
     never shown holding the customer's money - see the Terms. */
  const MONEY = [
    { at: 'you', say: 'Nothing has been paid yet.' },
    { at: 'pa',  say: 'Paid upfront, through the licensed payment processor.' },
    { at: 'gp',  say: 'Grid.Pe routes the order and collects the notes.' },
    { at: 'gp',  say: 'Grid.Pe is carrying the cash to you.' },
    { at: 'you', say: 'You confirm. The order is fulfilled.' }
  ];

  const steps = $$('.cyc__step');
  if (steps.length) {
    const panes   = $$('.cyc__pane');
    const fill    = $('#cycFill');
    const state   = $('#cycState');
    const parties = $$('.cyc__p');

    const show = i => {
      steps.forEach((s, n) => {
        const on = n === i;
        s.classList.toggle('is-on', on);
        s.setAttribute('aria-selected', String(on));
        s.tabIndex = on ? 0 : -1;
      });
      panes.forEach((p, n) => { p.hidden = n !== i; });
      parties.forEach(p => p.classList.toggle('is-at', p.dataset.party === MONEY[i].at));

      fill.style.width  = ((i + 1) / steps.length * 100) + '%';
      state.textContent = MONEY[i].say;
    };

    steps.forEach((s, i) => {
      s.addEventListener('click', () => show(i));
      /* arrow keys, per the tablist pattern */
      s.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const n = (i + d + steps.length) % steps.length;
        show(n);
        steps[n].focus();
      });
    });
    show(0);
  }

  /* ---------- 08: ATM / Grid.Pe column switch (narrow screens) ------ */
  const vs = $('.vs');
  if (vs) {
    vs.dataset.col = 'atm';
    $$('.vs__tab', vs).forEach(tab => tab.addEventListener('click', () => {
      vs.dataset.col = tab.dataset.col;
      $$('.vs__tab', vs).forEach(t => {
        const on = t === tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-pressed', String(on));
      });
    }));
  }
})();
