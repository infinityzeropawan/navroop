/* =============================================
   NavRoop Portfolio — Main JavaScript
   ============================================= */

// ═══ PRELOADER ═══
(function () {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('out');
      prepareHeroWords();
      initHero();
    }, 2400);
  });
})();

function prepareHeroWords() {
  // Wraps each .word's content in a .word-inner span so CSS can slide it up
  document.querySelectorAll('.h-title .word').forEach((word, i) => {
    const inner = document.createElement('span');
    inner.className = 'word-inner';
    inner.style.transitionDelay = (0.04 + i * 0.13) + 's';
    // Move ALL child nodes (text, em, etc.) inside the inner span
    while (word.firstChild) inner.appendChild(word.firstChild);
    word.appendChild(inner);
  });
}

function initHero() {
  document.querySelector('.h-title').classList.add('go');
  setTimeout(() => document.querySelector('.h-desc')?.classList.add('go'), 350);
  setTimeout(() => document.querySelector('.h-acts')?.classList.add('go'), 550);
}

// ═══ HAMBURGER MENU ═══
(function () {
  const hamBtn = document.getElementById('hamBtn');
  const mobNav = document.getElementById('mobNav');
  if (!hamBtn || !mobNav) return;

  function openMenu() {
    hamBtn.classList.add('open');
    mobNav.classList.add('open');
    document.body.classList.add('nav-open');
    hamBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    hamBtn.classList.remove('open');
    mobNav.classList.remove('open');
    document.body.classList.remove('nav-open');
    hamBtn.setAttribute('aria-expanded', 'false');
  }

  hamBtn.addEventListener('click', () => {
    hamBtn.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when any link is clicked
  mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Close on Escape key
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();

// ═══ CURSOR ═══
(function () {
  const dot = document.querySelector('.c-dot');
  const ring = document.querySelector('.c-ring');
  if (!dot || !ring) return;
  let tx = 0, ty = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  (function tick() {
    dot.style.left = tx + 'px'; dot.style.top = ty + 'px';
    rx += (tx - rx) * 0.12; ry += (ty - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  })();

  const hoverEls = document.querySelectorAll('a,button,.svc-card,.gal-item,.stat');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('h'); ring.classList.add('h'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('h'); ring.classList.remove('h'); });
  });
})();

// ═══ AMBIENT GLOW ═══
(function () {
  const glow = document.querySelector('.glow');
  if (!glow) return;
  let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
  document.addEventListener('mousemove', e => { gx += (e.clientX - gx) * 0.03; gy += (e.clientY - gy) * 0.03; });
  (function tick() { glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; requestAnimationFrame(tick); })();
})();

// ═══ NAVBAR SCROLL ═══
(function () {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => nav.classList.toggle('s', window.scrollY > 60), { passive: true });
})();

// ═══ PARALLAX HERO BG ═══
(function () {
  const bg = document.querySelector('.h-bg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    bg.style.transform = 'translateY(' + window.scrollY * 0.35 + 'px)';
  }, { passive: true });
})();

// ═══ HORIZONTAL GALLERY SCROLL ═══
(function () {
  const track = document.getElementById('galTrack');
  if (!track) return;
  let x = 0, vx = 0, isDragging = false, startX = 0, trackX = 0;
  let maxX = 0;

  function updateMax() { maxX = -(track.scrollWidth - track.parentElement.clientWidth); }
  updateMax();
  window.addEventListener('resize', updateMax);

  // auto-scroll
  let autoDir = -1, autoAnim = null;
  function autoScroll() {
    if (!isDragging) {
      x += autoDir * 0.6;
      if (x <= maxX) { x = maxX; autoDir = 1; }
      if (x >= 0) { x = 0; autoDir = -1; }
      vx = 0;
      track.style.transform = 'translateX(' + x + 'px)';
    }
    autoAnim = requestAnimationFrame(autoScroll);
  }
  autoAnim = requestAnimationFrame(autoScroll);

  // drag
  track.addEventListener('mousedown', e => {
    isDragging = true; startX = e.clientX; trackX = x;
    cancelAnimationFrame(autoAnim);
    track.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    x = Math.max(maxX, Math.min(0, trackX + (e.clientX - startX)));
    track.style.transform = 'translateX(' + x + 'px)';
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';
    autoAnim = requestAnimationFrame(autoScroll);
  });

  // touch
  track.addEventListener('touchstart', e => { isDragging = true; startX = e.touches[0].clientX; trackX = x; cancelAnimationFrame(autoAnim); }, { passive: true });
  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    x = Math.max(maxX, Math.min(0, trackX + (e.touches[0].clientX - startX)));
    track.style.transform = 'translateX(' + x + 'px)';
  }, { passive: true });
  track.addEventListener('touchend', () => { isDragging = false; autoAnim = requestAnimationFrame(autoScroll); });
})();

// ═══ VIDEO AUTOPLAY IN GALLERY ═══
(function () {
  const videos = document.querySelectorAll('.gal-item video');
  if (!videos.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting && en.intersectionRatio > 0.6) {
        en.target.play().catch(() => {});
      } else {
        en.target.pause();
      }
    });
  }, { threshold: 0.6 });
  videos.forEach(v => obs.observe(v));
})();

// ═══ LIGHTBOX ═══
(function () {
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lbImg');
  const lbVid = document.getElementById('lbVid');
  const lbCap = document.getElementById('lbCap');
  const lbBox = document.querySelector('.lb-box');
  if (!lb) return;

  let items = [], cur = 0;

  function openLb(index) {
    cur = index;
    const item = items[cur];
    if (item.type === 'video') {
      lbVid.src = item.src; lbVid.style.display = 'block';
      lbImg.style.display = 'none';
      lbVid.play().catch(() => {});
    } else {
      lbImg.src = item.src; lbImg.style.display = 'block';
      lbVid.style.display = 'none'; lbVid.pause();
    }
    lbCap.textContent = item.title + ' — ' + item.category;
    lb.classList.add('open');
    lbBox.className = 'lb-box enter';
  }

  window.openLightbox = function (index, arr) { items = arr; openLb(index); };

  document.getElementById('lbClose')?.addEventListener('click', () => {
    lbBox.className = 'lb-box exit';
    setTimeout(() => { lb.classList.remove('open'); lbVid.pause(); }, 300);
  });
  lb.addEventListener('click', e => {
    if (e.target === lb) {
      lbBox.className = 'lb-box exit';
      setTimeout(() => { lb.classList.remove('open'); lbVid.pause(); }, 300);
    }
  });
  document.getElementById('lbPrev')?.addEventListener('click', () => {
    cur = (cur - 1 + items.length) % items.length; openLb(cur);
  });
  document.getElementById('lbNext')?.addEventListener('click', () => {
    cur = (cur + 1) % items.length; openLb(cur);
  });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') { cur = (cur - 1 + items.length) % items.length; openLb(cur); }
    if (e.key === 'ArrowRight') { cur = (cur + 1) % items.length; openLb(cur); }
    if (e.key === 'Escape') lb.classList.remove('open');
  });
})();

// ═══ BEFORE / AFTER SLIDER ═══
(function () {
  const wrap = document.querySelector('.ba-wrap');
  const afterEl = document.querySelector('.ba-a');
  const divEl = document.querySelector('.ba-div');
  const handleEl = document.querySelector('.ba-h');
  if (!wrap) return;

  let dragging = false;

  function setPos(pct) {
    pct = Math.max(3, Math.min(97, pct));
    afterEl.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    divEl.style.left = pct + '%';
    handleEl.style.left = pct + '%';
  }

  function getPos(e) {
    const r = wrap.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    return (cx / r.width) * 100;
  }

  wrap.addEventListener('mousedown', e => { dragging = true; setPos(getPos(e)); });
  wrap.addEventListener('touchstart', e => { dragging = true; setPos(getPos(e)); }, { passive: true });
  window.addEventListener('mousemove', e => { if (dragging) setPos(getPos(e)); });
  window.addEventListener('touchmove', e => { if (dragging) setPos(getPos(e)); }, { passive: true });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('touchend', () => dragging = false);

  setPos(50);
})();

// ═══ SCROLL REVEAL ═══
(function () {
  const els = document.querySelectorAll('.rv');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('on'); obs.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
})();

// ═══ COUNTER ANIMATION ═══
(function () {
  const els = document.querySelectorAll('.stat-n[data-target]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, target = +el.dataset.target, suf = el.dataset.suf || '';
      let n = 0; const step = target / 55;
      const tick = () => {
        n = Math.min(n + step, target);
        el.textContent = Math.round(n) + suf;
        if (n < target) requestAnimationFrame(tick);
      };
      tick();
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
})();

// ═══ 3D CARD TILT ═══
(function () {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
      const y = -((e.clientY - r.top) / r.height - 0.5) * 14;
      card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

// ═══ MAGNETIC BUTTONS ═══
(function () {
  document.querySelectorAll('.btn-p,.btn-o,.nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

// ═══ LOAD GALLERY FROM ASSETS + INDEXEDDB ═══
(async function () {
  const IDB_NAME = 'NavRoop_Media', IDB_VER = 2, IDB_STORE = 'media';

  const DEFAULT_ITEMS = [
    { src: 'assets/gallery/asset1_tl.jpg', title: 'Luxury Living Room Panel', category: 'Wall Panels', type: 'image' },
    { src: 'assets/gallery/asset1_tr.jpg', title: 'Modern Fluted Louver Accent', category: 'Louvers', type: 'image' },
    { src: 'assets/gallery/asset1_bl.jpg', title: 'Executive Office Feature Wall', category: 'PVC Wall Art', type: 'image' },
    { src: 'assets/gallery/asset1_br.jpg', title: 'Custom Interior Wall Texture', category: 'Wall Coverings', type: 'image' },
    { src: 'assets/gallery/asset2_tl.jpg', title: 'Minimalist Bedroom Headboard Panel', category: 'Bedrooms', type: 'image' },
    { src: 'assets/gallery/asset2_tr.jpg', title: 'Gold Trimmed Accent Wall', category: 'Interior Design', type: 'image' },
    { src: 'assets/gallery/asset2_bl.jpg', title: 'High-Gloss Marble Texture Sheet', category: 'Marble Sheets', type: 'image' },
    { src: 'assets/gallery/asset2_br.jpg', title: 'Ambient LED Backlit Panel', category: 'Lighting & Panels', type: 'image' },
    { src: 'assets/gallery/asset3_tl.jpg', title: 'Contemporary Dining Wall Design', category: 'Dining Rooms', type: 'image' },
    { src: 'assets/gallery/asset3_tr.jpg', title: '3D Geometric Wall Art', category: '3D Panels', type: 'image' },
    { src: 'assets/gallery/asset3_bl.jpg', title: 'Wood Finish Acoustic Louvers', category: 'Wood Finish', type: 'image' },
    { src: 'assets/gallery/asset3_br.jpg', title: 'Luxury Villa Foyer Design', category: 'Full Interior', type: 'image' },
    { src: 'assets/gallery/asset4_tl.jpg', title: 'Architectural Fluted Wall Column', category: 'Architectural', type: 'image' },
    { src: 'assets/gallery/asset4_tr.jpg', title: 'Premium Motorized Zebra Blinds', category: 'Blinds', type: 'image' },
    { src: 'assets/gallery/asset4_bl.jpg', title: 'Commercial Reception Signage & Wall', category: 'Signage & Interior', type: 'image' },
    { src: 'assets/gallery/asset4_br.jpg', title: 'Custom PVC Marble TV Unit', category: 'Living Rooms', type: 'image' },
    { src: 'assets/gallery/img_3996.jpg', title: 'NavRoop Signature Interior Showcase', category: 'Featured Project', type: 'image' },
    { src: 'assets/gallery/wa_1.jpg', title: 'Bespoke Wall Panel Craftsmanship', category: 'Craftsmanship', type: 'image' },
    { src: 'assets/gallery/wa_2.jpg', title: 'Elegantly Finished Interior Suite', category: 'Full Interior', type: 'image' }
  ];

  function openDB() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(IDB_NAME, IDB_VER);
      r.onupgradeneeded = e => {
        if (!e.target.result.objectStoreNames.contains(IDB_STORE))
          e.target.result.createObjectStore(IDB_STORE, { keyPath: 'id' });
      };
      r.onsuccess = e => res(e.target.result);
      r.onerror = e => rej(e);
    });
  }

  let dbItems = [];
  try {
    const db = await openDB();
    dbItems = await new Promise(res => {
      const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => res([]);
    });
  } catch { dbItems = []; }

  const track = document.getElementById('galTrack');
  const galEmpty = document.getElementById('galEmpty');
  if (!track) return;

  dbItems.sort((a, b) => (a.order || 0) - (b.order || 0));

  let finalItems = [...DEFAULT_ITEMS];
  if (dbItems.length) {
    dbItems.forEach(item => {
      const url = URL.createObjectURL(item.blob);
      finalItems.unshift({ src: url, title: item.title || 'NavRoop Interior', category: item.category || 'Interior', type: item.type });
    });
  }

  if (galEmpty) galEmpty.style.display = 'none';
  track.innerHTML = '';

  finalItems.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'gal-item';
    div.innerHTML = `
      ${item.type === 'video'
        ? `<video src="${item.src}" muted loop playsinline preload="metadata"></video>`
        : `<img src="${item.src}" alt="${item.title}" loading="lazy">`}
      <div class="gal-ov">
        <div class="gal-ov-t">${item.title}</div>
        <div class="gal-ov-c">${item.category}</div>
      </div>`;
    div.addEventListener('click', () => window.openLightbox(idx, finalItems));
    track.appendChild(div);
  });
})();
