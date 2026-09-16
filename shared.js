/* ==========================================================
   ANIME WORLD — CORE
   Loaded on every page, after firebase-config.js
   ========================================================== */

/* ---------- tiny helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================
   AMBIENT PARTICLES — drifting motes, tinted by the live accent
   ========================================================== */
(function particles() {
  const cv = $('#particles');
  if (!cv || REDUCED) return;
  const ctx = cv.getContext('2d');
  let W, H, dots = [], dpr = Math.min(devicePixelRatio || 1, 2);

  function size() {
    W = cv.width = innerWidth * dpr;
    H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
  }
  function seed() {
    const n = innerWidth < 700 ? 45 : 90;
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.4 + .35) * dpr,
      a: Math.random() * .6 + .15,
      da: (Math.random() - .5) * .006,
      dx: (Math.random() - .5) * .18 * dpr,
      dy: -(Math.random() * .22 + .04) * dpr
    }));
  }
  size(); seed();
  addEventListener('resize', () => { size(); seed(); }, { passive: true });

  function accent() {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF3B54';
    const m = c.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 59, 84];
  }
  let rgb = accent(), tick = 0;

  (function draw() {
    if (++tick % 45 === 0) rgb = accent();
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.a += d.da;
      if (d.a <= .1 || d.a >= .8) d.da *= -1;
      d.x = (d.x + d.dx + W) % W;
      d.y += d.dy;
      if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, 6.2832);
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${d.a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  })();
})();

/* ==========================================================
   NAV
   ========================================================== */
(function nav() {
  document.addEventListener('click', e => {
    const burger = e.target.closest('#hamburger');
    const links = $('#navLinks');
    if (burger && links) { links.classList.toggle('open'); burger.classList.toggle('open'); return; }
    if (links && links.classList.contains('open') && !e.target.closest('#navLinks')) {
      links.classList.remove('open'); $('#hamburger')?.classList.remove('open');
    }
  });
})();

/* ==========================================================
   SCROLL REVEAL
   ========================================================== */
const revealIO = 'IntersectionObserver' in window
  ? new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    }), { threshold: .06, rootMargin: '0px 0px -40px' })
  : null;
function reveal(root = document) {
  if (!revealIO) { $$('.rv', root).forEach(el => el.classList.add('in')); return; }
  $$('.rv:not(.in)', root).forEach(el => revealIO.observe(el));
}
document.addEventListener('DOMContentLoaded', () => reveal());

/* ==========================================================
   TOASTS
   ========================================================== */
function toast(msg, isErr = false) {
  let wrap = $('#toasts');
  if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.innerHTML = `<span class="ic"></span><span>${esc(msg)}</span>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

/* ==========================================================
   POSTER FALLBACK — generated locally, never a broken image
   ========================================================== */
function posterFor(title) {
  const t = String(title || 'Anime World');
  const lines = (() => {
    const w = t.split(/\s+/); const out = []; let cur = '';
    for (const word of w) { const test = cur ? cur + ' ' + word : word; if (test.length > 13 && cur) { out.push(cur); cur = word; } else cur = test; }
    if (cur) out.push(cur); return out.slice(0, 3);
  })();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF3B54';
  const txt = lines.map((l, i) =>
    `<text x="200" y="${330 + i * 34 - (lines.length - 1) * 17}" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="600" font-size="24" fill="#F3F0FA">${esc(l)}</text>`
  ).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1C1633"/><stop offset="1" stop-color="#07060E"/></linearGradient>
      <radialGradient id="r" cx=".5" cy=".34" r=".65"><stop offset="0" stop-color="${accent}" stop-opacity=".3"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="400" height="600" fill="url(#g)"/><rect width="400" height="600" fill="url(#r)"/>
    <circle cx="200" cy="215" r="46" fill="none" stroke="${accent}" stroke-opacity=".55" stroke-width="2"/>
    <path d="M188 197 L224 215 L188 233 Z" fill="${accent}" fill-opacity=".9"/>
    ${txt}
    <text x="200" y="560" text-anchor="middle" font-family="Outfit,sans-serif" font-size="11" letter-spacing="3" fill="${accent}" fill-opacity=".55">ANIME WORLD</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}
function armFallbacks(root = document) {
  $$('img[data-fb]', root).forEach(img => {
    if (img.dataset.armed) return;
    img.dataset.armed = '1';
    img.addEventListener('error', function () { this.onerror = null; this.src = posterFor(this.dataset.fb); }, { once: true });
  });
}

/* ==========================================================
   ANILIST API
   - single in-flight request per "channel" (search, browse, …)
   - stale responses are dropped, so fast typing can't scramble results
   - 429 rate-limit aware with one polite retry
   ========================================================== */
const MEDIA_FIELDS = `
  id
  isAdult
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  genres
  averageScore
  popularity
  format
  status
  episodes
  duration
  season
  seasonYear
  description(asHtml: false)
  siteUrl
  studios(isMain: true) { nodes { name } }
  nextAiringEpisode { airingAt episode timeUntilAiring }
  externalLinks { site url type language }
  characters(role: MAIN, perPage: 1, sort: [ROLE, RELEVANCE]) { nodes { name { full } image { large } } }
`;

const _inflight = {};       // channel -> AbortController
const _token = {};          // channel -> monotonically increasing id

async function gql(query, variables = {}, channel = 'default') {
  const id = (_token[channel] = (_token[channel] || 0) + 1);
  _inflight[channel]?.abort();
  const ac = new AbortController();
  _inflight[channel] = ac;

  const run = async () => fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal: ac.signal
  });

  let res = await run();
  if (res.status === 429) {
    const wait = Math.min(Number(res.headers.get('Retry-After') || 2), 6) * 1000;
    await new Promise(r => setTimeout(r, wait));
    res = await run();
  }
  if (id !== _token[channel]) throw { stale: true };     // a newer request superseded this one
  if (!res.ok) throw new Error('Network error (' + res.status + ')');

  const json = await res.json();
  if (id !== _token[channel]) throw { stale: true };
  if (json.errors?.length) throw new Error(json.errors[0].message || 'API error');
  return json.data;
}
const isStale = e => e && (e.stale || e.name === 'AbortError');

const titleOf = m => m?.title?.english || m?.title?.romaji || 'Untitled';
const scoreOf = m => (m?.averageScore ? (m.averageScore / 10).toFixed(1) : null);
const cleanText = s => String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* media cache so opening a card never needs a second round trip */
const MEDIA = new Map();
const stash = list => { (list || []).forEach(m => m && MEDIA.set(String(m.id), m)); return list; };
const cached = id => MEDIA.get(String(id));

/* ==========================================================
   CARD MARKUP
   ========================================================== */
function cardHTML(m, opts = {}) {
  const t = titleOf(m), s = scoreOf(m);
  const meta = [m.format?.replace('_', ' '), m.seasonYear].filter(Boolean).join(' · ');
  const cd = opts.countdown && m.nextAiringEpisode
    ? `<div class="card-cd" data-at="${m.nextAiringEpisode.airingAt}" data-ep="${m.nextAiringEpisode.episode}">—</div>` : '';
  const extra = opts.extra ? `<div class="meta">${esc(opts.extra)}</div>` : '';
  return `<article class="card rv" data-id="${m.id}" tabindex="0" role="button" aria-label="${esc(t)}">
    <div class="card-img">
      <img src="${esc(m.coverImage?.large || '')}" alt="" loading="lazy" data-fb="${esc(t)}">
      ${m.format ? `<span class="card-tag">${esc(m.format.replace('_', ' '))}</span>` : ''}
      ${s ? `<span class="card-score">★ ${s}</span>` : ''}
      <div class="card-foot">
        <h3>${esc(t)}</h3>
        <div class="meta">${esc(meta)}</div>
        ${cd}${extra}
      </div>
    </div>
    <button class="card-fav" data-fav="${m.id}" aria-label="Save ${esc(t)}">♥</button>
  </article>`;
}

/* one delegated listener handles every card on every page */
document.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) { e.stopPropagation(); toggleFavorite(fav.dataset.fav, fav); return; }
  const card = e.target.closest('.card[data-id]');
  if (card) openSheet(card.dataset.id);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest?.('.card[data-id]');
  if (card) { e.preventDefault(); openSheet(card.dataset.id); }
});
/* touch feedback on devices with no hover */
document.addEventListener('touchstart', e => {
  const c = e.target.closest('.card');
  if (c) { c.classList.add('touch-active'); setTimeout(() => c.classList.remove('touch-active'), 420); }
}, { passive: true });

/* ==========================================================
   COUNTDOWNS — one ticker for the whole page
   ========================================================== */
function fmtCountdown(sec, ep) {
  if (sec <= 0) return `Episode ${ep} · out now`;
  const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600),
        m = Math.floor(sec % 3600 / 60), s = sec % 60;
  const pad = n => String(n).padStart(2, '0');
  return `EP ${ep} · ${d > 0 ? d + 'd ' : ''}${pad(h)}:${pad(m)}:${pad(s)}`;
}
function tickCountdowns() {
  const now = Math.floor(Date.now() / 1000);
  $$('[data-at]').forEach(el => {
    el.textContent = fmtCountdown(Number(el.dataset.at) - now, el.dataset.ep);
  });
}
setInterval(tickCountdowns, 1000);

/* ==========================================================
   ACCOUNTS
   Two modes, same API surface:
     • Firebase  — real accounts, synced everywhere (once configured)
     • Local     — works instantly with zero setup, stored on this device
   The old build was stuck in a broken half-state: with placeholder keys
   nothing rendered and login silently did nothing. Now it always works.
   ========================================================== */
const Auth = (() => {
  let mode = 'local', fbAuth = null, fbDb = null, user = null, ready = false;
  const listeners = [];
  const LS_USERS = 'aw.users', LS_SESSION = 'aw.session', LS_FAVS = 'aw.favs';

  const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  async function hash(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('aw|' + str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function emit() {
    ready = true;
    renderNav();
    listeners.forEach(fn => { try { fn(user); } catch (e) { console.warn(e); } });
    document.dispatchEvent(new CustomEvent('authchange', { detail: { user, mode } }));
  }

  function init() {
    const configured = typeof firebaseConfig !== 'undefined'
      && firebaseConfig.apiKey && !/^YOUR_/.test(firebaseConfig.apiKey)
      && typeof firebase !== 'undefined';

    if (configured) {
      try {
        firebase.initializeApp(firebaseConfig);
        fbAuth = firebase.auth();
        fbDb = firebase.firestore();
        mode = 'firebase';
        fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
        fbAuth.onAuthStateChanged(u => { user = u ? { uid: u.uid, email: u.email, name: u.displayName } : null; emit(); });
        return;
      } catch (e) { console.warn('Firebase unavailable, using local accounts:', e.message); mode = 'local'; }
    }
    const s = readJSON(LS_SESSION, null);
    user = s?.email ? s : null;
    emit();
  }

  async function signup(email, password, name) {
    email = String(email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) throw new Error('Enter a valid email address.');
    if (String(password).length < 6) throw new Error('Password needs at least 6 characters.');

    if (mode === 'firebase') {
      const c = await fbAuth.createUserWithEmailAndPassword(email, password);
      if (name) await c.user.updateProfile({ displayName: name });
      return;
    }
    const users = readJSON(LS_USERS, {});
    if (users[email]) throw new Error('That email already has an account. Log in instead.');
    users[email] = { email, name: name || email.split('@')[0], pw: await hash(password), created: Date.now() };
    writeJSON(LS_USERS, users);
    user = { uid: email, email, name: users[email].name };
    writeJSON(LS_SESSION, user);
    emit();
  }

  async function login(email, password) {
    email = String(email || '').trim().toLowerCase();
    if (mode === 'firebase') { await fbAuth.signInWithEmailAndPassword(email, password); return; }
    const users = readJSON(LS_USERS, {});
    const rec = users[email];
    if (!rec || rec.pw !== await hash(password)) throw new Error('Email or password is incorrect.');
    user = { uid: email, email, name: rec.name };
    writeJSON(LS_SESSION, user);
    emit();
  }

  async function logout() {
    if (mode === 'firebase') { await fbAuth.signOut(); return; }
    localStorage.removeItem(LS_SESSION);
    user = null; emit();
  }

  /* ---- watch list: each entry carries a status ----
     status: 'watching' | 'planning' | 'completed'  */
  const localList = () => readJSON(LS_FAVS + '.' + (user?.uid || 'guest'), {});
  const saveLocalList = o => writeJSON(LS_FAVS + '.' + (user?.uid || 'guest'), o);

  async function listItems() {
    if (!user) return [];
    if (mode === 'firebase') {
      try {
        const snap = await fbDb.collection('users').doc(user.uid).collection('favorites').get();
        return snap.docs.map(d => d.data()).sort((a, b) => (b.updated || b.added || 0) - (a.updated || a.added || 0));
      } catch { return []; }
    }
    return Object.values(localList()).sort((a, b) => (b.updated || b.added || 0) - (a.updated || a.added || 0));
  }
  async function itemMap() {
    const m = new Map();
    (await listItems()).forEach(r => m.set(String(r.id), r.status || 'planning'));
    return m;
  }
  async function setItem(rec) {
    if (!user) throw new Error('auth');
    const now = Date.now();
    rec.status = rec.status || 'planning';
    rec.updated = now;
    if (mode === 'firebase') {
      const ref = fbDb.collection('users').doc(user.uid).collection('favorites').doc(String(rec.id));
      const cur = await ref.get();
      await ref.set({ ...(cur.exists ? cur.data() : { added: now }), ...rec }, { merge: true });
      return;
    }
    const f = localList();
    f[String(rec.id)] = { added: now, ...(f[String(rec.id)] || {}), ...rec };
    saveLocalList(f);
  }
  async function removeItem(id) {
    if (!user) throw new Error('auth');
    if (mode === 'firebase') { await fbDb.collection('users').doc(user.uid).collection('favorites').doc(String(id)).delete(); return; }
    const f = localList(); delete f[String(id)]; saveLocalList(f);
  }

  function renderNav() {
    const slot = $('#navAuth');
    if (!slot) return;
    slot.innerHTML = user
      ? `<a href="account.html" class="nav-avatar" title="${esc(user.email)}">${esc((user.name || user.email)[0].toUpperCase())}</a>`
      : `<a href="account.html" class="nav-auth-btn">Log in</a>`;
  }

  return {
    init, signup, login, logout, listItems, itemMap, setItem, removeItem,
    get user() { return user; },
    get mode() { return mode; },
    get ready() { return ready; },
    onChange(fn) { listeners.push(fn); if (ready) fn(user); }
  };
})();
document.addEventListener('DOMContentLoaded', Auth.init);

/* id -> status for the current user; keeps every heart and status control in sync */
let LIST = new Map();
const STATUS_LABEL = { watching: 'Watching', planning: 'Plan to watch', completed: 'Completed' };
async function refreshList() {
  LIST = await Auth.itemMap();
  paintList();
}
function paintList(root = document) {
  $$('[data-fav]', root).forEach(b => b.classList.toggle('on', LIST.has(String(b.dataset.fav))));
  const seg = $('#sheetSeg');
  if (seg?.dataset.id) {
    const st = LIST.get(String(seg.dataset.id));
    $$('button[data-status]', seg).forEach(b => b.classList.toggle('on', b.dataset.status === st));
    const rm = $('button.rm', seg);
    if (rm) rm.style.display = st ? '' : 'none';
  }
}
/* kept as aliases so any page still calling the old names keeps working */
const paintFavs = paintList, refreshFavSet = refreshList;
document.addEventListener('authchange', refreshList);

function snapshotOf(id) {
  const m = cached(id);
  return {
    id: Number(id), title: m ? titleOf(m) : 'Anime',
    cover: m?.coverImage?.large || '', format: m?.format || '', year: m?.seasonYear || null,
    score: m?.averageScore || null, episodes: m?.episodes || null
  };
}
function requireLogin() {
  toast('Log in to build your list', true);
  setTimeout(() => location.href = 'account.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'index.html'), 900);
}

/* heart on a card: add as "plan to watch", or remove if already listed */
async function toggleFavorite(id, btn) {
  if (!Auth.user) return requireLogin();
  const key = String(id);
  try {
    if (LIST.has(key)) {
      await Auth.removeItem(key); LIST.delete(key); toast('Removed from your list');
    } else {
      await Auth.setItem({ ...snapshotOf(key), status: 'planning' });
      LIST.set(key, 'planning'); toast('Added to Plan to watch');
      Sfx.play('save'); if (btn) burst(btn);
    }
    paintList();
    document.dispatchEvent(new CustomEvent('listchange'));
  } catch (e) { toast('Could not update your list. Try again.', true); }
}

/* status control in the sheet */
async function setStatus(id, status, btn) {
  if (!Auth.user) return requireLogin();
  const key = String(id);
  try {
    if (!status) {
      await Auth.removeItem(key); LIST.delete(key); toast('Removed from your list');
    } else {
      await Auth.setItem({ ...snapshotOf(key), status });
      LIST.set(key, status); toast(STATUS_LABEL[status]);
      Sfx.play('save'); if (btn) burst(btn);
    }
    paintList();
    document.dispatchEvent(new CustomEvent('listchange'));
  } catch (e) { toast('Could not update your list. Try again.', true); }
}

/* little particle burst when something is saved */
function burst(el) {
  if (REDUCED) return;
  const r = el.getBoundingClientRect();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('span');
    const a = (Math.PI * 2 * i) / 10, d = 26 + Math.random() * 22;
    Object.assign(p.style, {
      position: 'fixed', left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px',
      width: '5px', height: '5px', borderRadius: '50%', background: accent, zIndex: 3000,
      pointerEvents: 'none', boxShadow: `0 0 8px ${accent}`,
      transition: 'transform .65s cubic-bezier(.22,1,.36,1), opacity .65s'
    });
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(0)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 700);
  }
}

/* ==========================================================
   SEARCH BOX — reusable, debounced, with live suggestions
   Fixes the old build: no dropped keystrokes, no out-of-order
   results, Enter always searches, clear button actually clears.
   ========================================================== */
function makeSearch({ input, onSearch, onEnter, suggest = true, delay = 280, channel = 'search' }) {
  const box = input.closest('.searchbar');
  const panel = suggest ? box?.parentElement?.querySelector('.suggest') : null;
  let timer, activeIdx = -1, items = [];

  const setBusy = b => box?.classList.toggle('busy', b);
  const setValue = () => box?.classList.toggle('has-value', !!input.value.trim());

  function closePanel() { panel?.classList.remove('open'); activeIdx = -1; }

  async function suggestNow(q) {
    if (!panel || q.length < 2) return closePanel();
    try {
      setBusy(true);
      const d = await gql(
        `query($q:String){ Page(page:1,perPage:6){ media(type:ANIME, search:$q, sort:SEARCH_MATCH, isAdult:false){ ${MEDIA_FIELDS} } } }`,
        { q }, channel);
      items = stash(d.Page.media);
      if (!items.length) return closePanel();
      panel.innerHTML = items.map(m => `
        <div class="suggest-item" data-id="${m.id}">
          <img src="${esc(m.coverImage?.large || '')}" alt="" data-fb="${esc(titleOf(m))}">
          <div><div class="t">${esc(titleOf(m))}</div>
          <div class="m">${esc([m.format?.replace('_', ' '), m.seasonYear, scoreOf(m) ? '★ ' + scoreOf(m) : ''].filter(Boolean).join(' · '))}</div></div>
        </div>`).join('');
      armFallbacks(panel);
      panel.classList.add('open');
    } catch (e) { if (!isStale(e)) closePanel(); }
    finally { setBusy(false); }
  }

  input.addEventListener('input', () => {
    setValue();
    clearTimeout(timer);
    const q = input.value.trim();
    timer = setTimeout(() => { onSearch?.(q); suggestNow(q); }, delay);
  });

  input.addEventListener('keydown', e => {
    const open = panel?.classList.contains('open');
    if (e.key === 'Enter') {
      e.preventDefault(); clearTimeout(timer);
      if (open && activeIdx >= 0) { openSheet(items[activeIdx].id); closePanel(); input.blur(); return; }
      closePanel();
      const val = input.value.trim();
      if (onEnter) { onEnter(val); input.blur(); return; }
      onSearch?.(val); input.blur(); return;
    }
    if (e.key === 'Escape') { closePanel(); input.blur(); return; }
    if (!open) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = panel.children.length;
      activeIdx = (activeIdx + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
      [...panel.children].forEach((c, i) => c.classList.toggle('active', i === activeIdx));
      panel.children[activeIdx]?.scrollIntoView({ block: 'nearest' });
    }
  });

  panel?.addEventListener('click', e => {
    const it = e.target.closest('.suggest-item');
    if (it) { closePanel(); openSheet(it.dataset.id); }
  });

  box?.querySelector('.clear')?.addEventListener('click', () => {
    input.value = ''; setValue(); closePanel(); onSearch?.(''); input.focus();
  });

  document.addEventListener('click', e => { if (!e.target.closest('.suggest-wrap')) closePanel(); });
  setValue();
  return { close: closePanel, setBusy };
}

/* ==========================================================
   WATCH TARGET
   1. a site set in site-config.js  (search URL with {q})
   2. the official streaming page for this exact title
   3. the guide page lookup
   ========================================================== */
function watchTargetFor(m) {
  const t = titleOf(m);
  const cfg = (typeof SITE !== 'undefined' && SITE) || {};
  if (cfg.watchUrl && cfg.watchUrl.includes('{q}') && /^https?:\/\//i.test(cfg.watchUrl) && !/PASTE|YOUR-/i.test(cfg.watchUrl)) {
    let name = cfg.watchName;
    if (!name) { try { name = new URL(cfg.watchUrl).hostname.replace(/^www\./, '').split('.')[0]; } catch { name = 'Watch'; } }
    return { url: cfg.watchUrl.replace('{q}', encodeURIComponent(t)), name, official: false };
  }
  const st = (m.externalLinks || []).filter(l => l.type === 'STREAMING' && l.url);
  if (st.length) {
    /* prefer English-language links, then the big services */
    const rank = l => (/^(english|en)$/i.test(l.language || '') ? 0 : 1) +
      (/crunchyroll|netflix|hulu|prime|disney|hidive/i.test(l.site || '') ? 0 : 2);
    st.sort((a, b) => rank(a) - rank(b));
    return { url: st[0].url, name: st[0].site, official: true };
  }
  return { url: 'guide.html?q=' + encodeURIComponent(t), name: 'Watch guide', official: false };
}

/* ==========================================================
   CHROME INJECTED ON EVERY PAGE
   tab bar · progress bar · back-to-top · page curtain ·
   keyboard shortcuts · card tilt · intro · surprise me
   Injected from here so every page gets them without edits.
   ========================================================== */
(function chrome() {
  const PAGES = [
    ['index.html',    'Home',     '<path d="M3 11 12 3l9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>'],
    ['browse.html',   'Browse',   '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'],
    ['find.html',     'Find',     '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/>'],
    ['schedule.html', 'Schedule', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
    ['quotes.html',   'Quotes',   '<path d="M7 17h3l2-4V7H6v6h3zM15 17h3l2-4V7h-6v6h3z"/>'],
    ['guide.html',    'Guide',    '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-4 2 2-6z"/>']
  ];
  const here = location.pathname.split('/').pop() || 'index.html';

  document.addEventListener('DOMContentLoaded', () => {
    /* tab bar */
    const tb = document.createElement('div');
    tb.className = 'tabbar'; tb.setAttribute('role', 'navigation'); tb.setAttribute('aria-label', 'Main');
    tb.innerHTML = PAGES.map(([h, l, ic]) =>
      `<a href="${h}" class="${h === here ? 'current' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ic}</svg>${l}</a>`).join('');
    document.body.appendChild(tb);

    /* progress bar + back to top */
    const bar = document.createElement('div'); bar.id = 'progress'; document.body.appendChild(bar);
    const up = document.createElement('button'); up.id = 'toTop'; up.setAttribute('aria-label', 'Back to top'); up.textContent = '↑';
    up.addEventListener('click', () => { scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); Sfx.play('tick'); });
    document.body.appendChild(up);
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
      up.classList.toggle('show', scrollY > 600);
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    /* curtain: sweep in on internal navigation, sweep out on arrival */
    const cur = document.createElement('div'); cur.id = 'curtain'; document.body.appendChild(cur);
    if (sessionStorage.getItem('aw.curtain') === '1' && !REDUCED) {
      sessionStorage.removeItem('aw.curtain');
      cur.classList.add('arrive');
      requestAnimationFrame(() => requestAnimationFrame(() => cur.classList.add('leave')));
      setTimeout(() => cur.classList.remove('arrive', 'leave'), 600);
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || REDUCED || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html?$/.test(url.pathname) || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      sessionStorage.setItem('aw.curtain', '1');
      cur.classList.add('in');
      Sfx.play('tick');
      setTimeout(() => { location.href = url.href; }, 300);
    });
    addEventListener('pageshow', e => { if (e.persisted) cur.classList.remove('in'); });

    /* keyboard shortcuts */
    const keys = document.createElement('div'); keys.id = 'keys';
    keys.innerHTML = `<div class="box"><h3>Shortcuts</h3>
      <div class="k"><span>Focus search</span><kbd>/</kbd></div>
      <div class="k"><span>Random anime</span><kbd>R</kbd></div>
      <div class="k"><span>Toggle sound</span><kbd>M</kbd></div>
      <div class="k"><span>Close anything</span><kbd>Esc</kbd></div>
      <div class="k"><span>This panel</span><kbd>?</kbd></div></div>`;
    keys.addEventListener('click', e => { if (e.target === keys) keys.classList.remove('open'); });
    document.body.appendChild(keys);
    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === 'Escape') { keys.classList.remove('open'); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '/') { e.preventDefault(); const i = $('.searchbar input'); if (i) { i.focus(); i.select(); } else location.href = 'browse.html'; }
      else if (e.key === '?') { e.preventDefault(); keys.classList.toggle('open'); }
      else if (e.key.toLowerCase() === 'r') { surpriseMe(); }
      else if (e.key.toLowerCase() === 'm') { Sfx.toggle(); }
    });

    /* intro (pages that opt in with <body data-intro>) */
    if (document.body.dataset.intro !== undefined && !sessionStorage.getItem('aw.intro') && !REDUCED) {
      sessionStorage.setItem('aw.intro', '1');
      const o = document.createElement('div'); o.id = 'intro';
      o.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center">
        <div class="im">A</div>
        <div class="iw">${'ANIME WORLD'.split('').map((c, i) => `<span style="animation-delay:${.45 + i * .04}s">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div>
        <div class="il"></div></div><div class="ih">tap to skip</div>`;
      document.body.appendChild(o);
      document.body.style.overflow = 'hidden';
      const done = () => { if (o.classList.contains('out')) return; o.classList.add('out'); document.body.style.overflow = ''; setTimeout(() => o.remove(), 600); };
      o.addEventListener('click', done);
      setTimeout(done, 1900);
    }
  });

  /* 3D tilt — one delegated listener, pointer devices only */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !REDUCED) {
    document.addEventListener('pointermove', e => {
      const c = e.target.closest('.card'); if (!c) return;
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--ry', ((x - .5) * 14).toFixed(2) + 'deg');
      c.style.setProperty('--rx', ((.5 - y) * 12).toFixed(2) + 'deg');
      c.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      c.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    }, { passive: true });
    document.addEventListener('pointerout', e => {
      const c = e.target.closest('.card'); if (!c || c.contains(e.relatedTarget)) return;
      c.style.removeProperty('--rx'); c.style.removeProperty('--ry');
    }, { passive: true });
  }
})();

/* random popular title, anywhere on the site */
async function surpriseMe() {
  toast('Rolling the dice…');
  try {
    const page = 1 + Math.floor(Math.random() * 120);
    const d = await gql(
      `query($p:Int){ Page(page:$p,perPage:1){ media(type:ANIME, sort:POPULARITY_DESC, isAdult:false){ ${MEDIA_FIELDS} } } }`,
      { p: page }, 'surprise');
    const m = stash(d.Page.media)[0];
    if (m) openSheet(m.id);
  } catch (e) { if (!isStale(e)) toast('Try that again', true); }
}

/* mouse / gyro parallax for elements marked .px with data-depth */
(function parallax() {
  if (REDUCED) return;
  const els = () => $$('.px');
  let tx = 0, ty = 0;
  const apply = () => els().forEach(el => {
    const d = Number(el.dataset.depth || 1);
    el.style.transform = `translate3d(${(tx * d).toFixed(1)}px, ${(ty * d).toFixed(1)}px, 0)`;
  });
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - .5) * 18; ty = (e.clientY / innerHeight - .5) * 12; apply();
    }, { passive: true });
  } else if ('DeviceOrientationEvent' in window) {
    addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 30)) * 14; ty = Math.max(-1, Math.min(1, (e.beta - 40) / 30)) * 10; apply();
    }, { passive: true });
  }
})();
