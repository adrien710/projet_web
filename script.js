/* ============================================
   AMERICA'S TEAM — SCRIPT.JS (v2)
   Fond étoilé dynamique (clair) + bandeau défilant.
   Le patchwork de photos est remplacé par un champ
   d'étoiles vectorielles qui dérivent : fond clair,
   net, sans dépendre d'images à fond noir.
   ============================================ */

/* ──────────────────────────────────────────
   INTRO PLEIN ÉCRAN (page d'accueil uniquement)
   La photo s'affiche au chargement, puis disparaît
   au CLIC ou au SCROLL (molette, touche, swipe).
   Une seule fois par session (sessionStorage).
   ────────────────────────────────────────── */
function initIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return; // pas d'intro sur les autres pages

  // déjà vue dans cette session → on retire sans rien afficher
  try {
    if (sessionStorage.getItem('intro-seen') === '1') {
      intro.remove();
      return;
    }
  } catch (_) { /* sessionStorage indisponible : on affiche quand même */ }

  // bloque le défilement tant que l'intro est là
  document.body.style.overflow = 'hidden';

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    intro.classList.add('intro-leaving');
    document.body.style.overflow = '';
    try { sessionStorage.setItem('intro-seen', '1'); } catch (_) {}
    setTimeout(() => intro.remove(), 950);
  };

  // déclencheurs : clic, molette, swipe tactile, touches courantes
  intro.addEventListener('click', dismiss);
  window.addEventListener('wheel',     dismiss, { once: true, passive: true });
  window.addEventListener('touchmove', dismiss, { once: true, passive: true });
  window.addEventListener('keydown', e => {
    if (['Enter', ' ', 'ArrowDown', 'PageDown', 'Escape'].includes(e.key)) dismiss();
  });
}

/* ──────────────────────────────────────────
   CONFIG : densité du fond étoilé
   (plus le nombre est petit, plus il y a d'étoiles)
   ────────────────────────────────────────── */
const STAR_DENSITY = 16000; // 1 étoile par ~16 000 px²
const STAR_MAX     = 28;    // plafond d'étoiles

/* ──────────────────────────────────────────
   FOND ÉTOILÉ DYNAMIQUE  (ex buildPatchwork)
   On garde le même nom de fonction pour ne pas
   toucher au reste du câblage (init / resize).
   ────────────────────────────────────────── */
function buildPatchwork() {
  const grid = document.getElementById('patchwork');
  if (!grid) return;

  grid.innerHTML = '';
  grid.style.display = 'block'; // ce n'est plus une grille

  const area  = window.innerWidth * window.innerHeight;
  const count = Math.min(STAR_MAX, Math.max(8, Math.round(area / STAR_DENSITY)));

  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    s.textContent = '★';

    const size = 14 + Math.random() * 72;          // 14 → 86 px
    const o    = 0.04 + Math.random() * 0.12;       // opacité max discrète

    s.style.left     = (Math.random() * 100).toFixed(2) + '%';
    s.style.top      = (Math.random() * 100).toFixed(2) + '%';
    s.style.fontSize = size.toFixed(0) + 'px';
    s.style.setProperty('--o0', (o * 0.35).toFixed(3));
    s.style.setProperty('--o1', o.toFixed(3));

    // deux durées : dérive + scintillement
    s.style.animationDuration =
      (7 + Math.random() * 12).toFixed(1) + 's, ' +
      (3 + Math.random() * 4).toFixed(1) + 's';
    s.style.animationDelay =
      (-Math.random() * 12).toFixed(1) + 's, ' +
      (-Math.random() * 4).toFixed(1) + 's';

    grid.appendChild(s);
  }
}

/* ──────────────────────────────────────────
   BANDEAU DÉFILANT (ruban type stade)
   Injecté juste sous la navbar, sur toutes les pages.
   ────────────────────────────────────────── */
function buildTicker() {
  if (document.getElementById('ticker')) return;
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const ticker = document.createElement('div');
  ticker.id = 'ticker';
  ticker.setAttribute('aria-hidden', 'true');

  const phrase = "DALLAS COWBOYS \u2605 AMERICA'S TEAM \u2605 DEPUIS 1960 \u2605 ";
  const track  = document.createElement('div');
  track.className = 'ticker-track';
  // deux copies identiques → boucle continue sans couture
  track.innerHTML =
    '<span>' + phrase.repeat(6) + '</span>' +
    '<span>' + phrase.repeat(6) + '</span>';

  ticker.appendChild(track);
  nav.insertAdjacentElement('afterend', ticker);
}

/* ──────────────────────────────────────────
   OVERLAY MENU  (inchangé)
   ────────────────────────────────────────── */
function openOverlay(title, items) {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;

  document.getElementById('overlay-title').textContent = title;

  const list = document.getElementById('overlay-items');
  list.innerHTML = '';
  items.forEach((item, idx) => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = item.href;
    a.innerHTML = `<span class="item-num">0${idx + 1}</span>${item.label}`;
    li.appendChild(a);
    list.appendChild(li);
  });

  document.body.classList.add('overlay-active');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.classList.remove('overlay-active');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────
   PARALLAXE SOURIS sur les étoiles du fond
   ────────────────────────────────────────── */
function initParallax() {
  const grid = document.getElementById('patchwork');
  if (!grid) return;

  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    // valeurs normalisées -0.5 → 0.5
    mx = (e.clientX / window.innerWidth)  - 0.5;
    my = (e.clientY / window.innerHeight) - 0.5;
  });

  (function animateParallax() {
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;

    const stars = grid.querySelectorAll('.star');
    stars.forEach((s, i) => {
      const depth = 0.4 + (i % 4) * 0.3; // 0.4 → 1.3
      const ox = cx * 28 * depth;
      const oy = cy * 18 * depth;
      s.style.translate = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`;
    });

    requestAnimationFrame(animateParallax);
  })();
}

/* ──────────────────────────────────────────
   SCROLL REVEAL (Intersection Observer)
   Important : les éléments déjà visibles au chargement
   reçoivent .visible DIRECTEMENT, sans passer par
   l'état initial .reveal. Cela évite le « décalage »
   au sommet de la page (texte qui finit d'arriver à
   sa place après que le scroll est déjà terminé).
   ────────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  const vh = window.innerHeight;
  let revealIdx = 0;

  document.querySelectorAll('.body-text, h2.section-title, .back-link').forEach((el) => {
    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < vh && rect.bottom > 0;

    if (alreadyInView) {
      // Déjà à l'écran : on saute l'animation, on l'affiche net
      el.classList.add('reveal', 'visible');
      return;
    }

    // Hors viewport : on l'anime quand il y entrera
    el.classList.add('reveal');
    if (revealIdx % 3 === 1) el.classList.add('reveal-delay-1');
    if (revealIdx % 3 === 2) el.classList.add('reveal-delay-2');
    revealIdx++;
    observer.observe(el);
  });
}

function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────
   ACTIVE NAV LINK
   ────────────────────────────────────────── */
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ──────────────────────────────────────────
   SLOT MACHINE sur les liens de la navbar
   On découpe le texte en deux couches stackées :
   au survol, la couche du haut glisse, celle du
   bas (identique mais en blanc franc) la remplace.
   ────────────────────────────────────────── */
function wrapNavLinks() {
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.dataset.wrapped === '1') return;
    const text = a.textContent.trim();
    if (!text) return;
    a.dataset.wrapped = '1';
    a.setAttribute('aria-label', text);
    a.innerHTML =
      '<span class="nav-clip" aria-hidden="true">' +
        '<span class="nav-text">' +
          '<span class="nav-text-up">' + text + '</span>' +
          '<span class="nav-text-dn">' + text + '</span>' +
        '</span>' +
      '</span>';
  });
}

/* ──────────────────────────────────────────
   BOUTON « PAGE SUIVANTE »
   Injecté en bas des pages de contenu, il se révèle
   quand il entre dans le viewport (= bas de page atteint)
   et mène à la page suivante.
   👉 Pour changer l'ordre de lecture, réordonnez PAGE_ORDER.
   ────────────────────────────────────────── */
const PAGE_ORDER = [
  { file: 'index.html',           label: 'Accueil' },
  { file: 'introduction.html',    label: 'Introduction' },
  { file: 'introspection.html',   label: 'Introspection' },
  { file: 'sub-chap1-1.html',     label: 'Une NFL historique' },
  { file: 'sub-chap1-2.html',     label: 'L&#39;arrivée de Jerry Jones' },
  { file: 'sub-chap1-3.html',     label: 'Les piliers du modèle Cowboys' },
   { file: 'sub-chap1-4.html',     label: 'Une rupture qui dépasse les Cowboys' },
  { file: 'sub-chap2-1.html',     label: 'La généralisation du modèle Cowboys' },
  { file: 'sub-chap2-2.html',     label: 'L&#39;uniformisation des stratégies marketing NFL' },
  { file: 'sub-chap2-3.html',     label: 'Les limites contemporaines du modèle Cowboys' },
  { file: 'sub-chap2-4.html',     label: 'Dépasser l&#39;héritage Cowboys' },
  { file: 'sub-interview-1.html', label: 'Interviewé 1' },
  { file: 'sub-interview-2.html', label: 'Interviewé 2' },
  { file: 'sub-interview-3.html', label: 'Interviewé 3' },
  { file: 'sub-interview-4.html', label: 'Interviewé 4' },
  { file: 'conclusion.html',      label: 'Conclusion' },
  { file: 'bibliographie.html',   label: 'Bibliographie' },
];

function initNextButton() {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html') return;                       // pas de bouton sur l'accueil
  const idx = PAGE_ORDER.findIndex(p => p.file === page);
  if (idx === -1 || idx >= PAGE_ORDER.length - 1) return;  // page inconnue ou dernière

  const next   = PAGE_ORDER[idx + 1];
  const pageEl = document.querySelector('.page');
  if (!pageEl) return;

  const wrap = document.createElement('div');
  wrap.className = 'next-page reveal';
  wrap.innerHTML =
    '<a class="next-btn" href="' + next.file + '">' +
      '<span class="next-btn-text">' +
        '<span class="next-btn-meta">Page suivante</span>' +
        '<span class="next-btn-name">' + next.label + '</span>' +
      '</span>' +
      '<span class="next-btn-arrow" aria-hidden="true">→</span>' +
    '</a>';
  pageEl.appendChild(wrap);

  // révèle le bouton dès qu'il entre dans le viewport (bas de page)
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        wrap.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  io.observe(wrap);
}

/* ──────────────────────────────────────────
   PAGE TRANSITIONS  (inchangé)
   ────────────────────────────────────────── */
function initPageTransitions() {
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || a.dataset.overlay) return;

    a.addEventListener('click', e => {
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { location.href = href; }, 220);
    });
  });
}

/* ──────────────────────────────────────────
   INIT
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  buildPatchwork();
  buildTicker();
  initParallax();
  initScrollReveal();
  initScrollTop();
  setActiveNav();
  wrapNavLinks();
  initNextButton();
  initPageTransitions();

  const overlayEl = document.getElementById('overlay');
  if (overlayEl) {
    document.getElementById('overlay-close')
      ?.addEventListener('click', closeOverlay);
    document.getElementById('overlay-backdrop')
      ?.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeOverlay();
    });
  }

  document.querySelectorAll('[data-overlay]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const key = el.dataset.overlay;
      const cfg = OVERLAY_CONFIGS[key];
      if (cfg) openOverlay(cfg.title, cfg.items);
    });
  });
});

window.addEventListener('resize', buildPatchwork);

/* ──────────────────────────────────────────
   OVERLAY CONFIGS  (inchangé)
   ────────────────────────────────────────── */
const OVERLAY_CONFIGS = {

  chap1: {
    title: 'Chapitre 1',
    items: [
      { label: 'Une NFL historique', href: 'sub-chap1-1.html' },
      { label: 'L&#39;arrivée de Jerry Jones', href: 'sub-chap1-2.html' },
      { label: 'Les piliers du modèle Cowboys', href: 'sub-chap1-3.html' },
       { label: 'Une rupture qui dépasse les Cowboys', href: 'sub-chap1-4.html' },
    ],
  },

  chap2: {
    title: 'Chapitre 2',
    items: [
      { label: 'La généralisation du modèle Cowboys', href: 'sub-chap2-1.html' },
      { label: 'L&#39;uniformisation des stratégies marketing NFL', href: 'sub-chap2-2.html' },
      { label: 'Les limites contemporaines du modèle Cowboys', href: 'sub-chap2-3.html' },
      { label: 'Dépasser l&#39;héritage Cowboys', href: 'sub-chap2-4.html' },
    ],
  },

  interview: {
    title: 'Interview',
    items: [
      { label: 'Interviewé 1', href: 'sub-interview-1.html' },
      { label: 'Interviewé 2', href: 'sub-interview-2.html' },
      { label: 'Interviewé 3', href: 'sub-interview-3.html' },
      { label: 'Interviewé 4', href: 'sub-interview-4.html' },
    ],
  },

};