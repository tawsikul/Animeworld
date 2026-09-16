/* ==========================================================
   ANIME WORLD — CHARACTER STAGE + SOUND
   ----------------------------------------------------------
   Everything here is generated in the browser: the figures are
   original geometric silhouettes drawn as SVG, and every sound
   is synthesised live with the Web Audio API. No copyrighted
   artwork, sprites, or soundtrack files are used or shipped.
   ========================================================== */

/* ==========================================================
   1. SOUND — original synthesised cues, off until you turn it on
   ========================================================== */
const Sfx = (() => {
  /* real files shipped in /sfx — on by default; the speaker button mutes */
  const VOL = { tick: .35, save: .6, open: .6, close: .4, impact: .85, charge: .7, dive: .75, bloom: .85, motif: .55 };
  let on = localStorage.getItem('aw.sound') !== 'off';
  let unlocked = false;
  const pool = {};

  const file = key => {
    if (!pool[key]) { const a = new Audio('sfx/' + key + '.mp3'); a.preload = 'auto'; pool[key] = a; }
    return pool[key];
  };
  const keyFor = (name, arg) => name === 'motif' ? 'motif-' + (arg || 'default') : name;

  /* mobile browsers only let audio start inside a tap — the first tap anywhere primes it */
  function unlock() {
    if (unlocked) return; unlocked = true;
    ['tick', 'open', 'close', 'impact', 'save', 'charge', 'dive', 'bloom'].forEach(file);
    const a = file('tick'); a.volume = 0;
    a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = 1; }).catch(() => {});
    Synth.boot();
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { once: true, capture: true, passive: true }));

  /* ---- tiny synth kept as a fallback if a file can't load (e.g. opened from file://) ---- */
  const Synth = (() => {
    let ctx = null, master = null;
    function boot() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = .2; master.connect(ctx.destination); return ctx;
    }
    function tone(freq, t0, dur, { type = 'triangle', vol = .5, glide = 0 } = {}) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * glide), t0 + dur);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + .05);
    }
    function play(name) {
      if (!boot()) return; if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime + .01;
      ({ tick: () => tone(880, t, .07, { vol: .2, type: 'sine' }),
         save: () => { tone(659, t, .1, { vol: .3 }); tone(988, t + .07, .18, { vol: .28 }); },
         open: () => tone(147, t, .5, { vol: .3, type: 'sine', glide: 1.9 }),
         close: () => tone(392, t, .12, { vol: .18, type: 'sine', glide: .55 }),
         impact: () => tone(82, t, .42, { vol: .4, type: 'sine', glide: .5 }),
         charge: () => tone(110, t, 1.1, { vol: .3, type: 'sawtooth', glide: 12 }),
         dive: () => tone(600, t, 1.4, { vol: .25, type: 'sine', glide: .08 }),
         bloom: () => { [262, 330, 392, 523].forEach(f => tone(f, t, 1.6, { vol: .18, type: 'sine' })); },
         motif: () => [392, 440, 523, 587, 784].forEach((f, i) => tone(f, t + i * .13, .34, { vol: .2 }))
      }[name] || (() => {}))();
    }
    return { boot, play };
  })();

  const api = {
    get on() { return on; },
    toggle() {
      on = !on;
      localStorage.setItem('aw.sound', on ? 'on' : 'off');
      if (on) { unlock(); api.play('tick'); }
      paintToggle();
      return on;
    },
    play(name, arg) {
      if (!on) return;
      const key = keyFor(name, arg);
      const base = file(key);
      const a = base.paused || base.ended ? base : base.cloneNode();
      a.volume = VOL[name] ?? .6;
      try { a.currentTime = 0; } catch {}
      const p = a.play();
      if (p && p.catch) p.catch(() => Synth.play(name));
    }
  };

  function paintToggle() {
    document.querySelectorAll('.sound-toggle').forEach(b => {
      b.classList.toggle('on', on);
      b.textContent = on ? '🔊' : '🔇';
      b.setAttribute('aria-label', on ? 'Mute sound' : 'Unmute sound');
      b.setAttribute('aria-pressed', String(on));
    });
  }
  document.addEventListener('DOMContentLoaded', paintToggle);
  document.addEventListener('click', e => { if (e.target.closest('.sound-toggle')) api.toggle(); });
  return api;
})();

/* ==========================================================
   2. ARCHETYPES — original geometric figures, matched by title
   ========================================================== */
const ARCHETYPES = {
  ninja:     { accent: '#FF8A1F', accent2: '#FFD84D', ink: '#2A1400', label: 'Shinobi' },
  swordsman: { accent: '#3FE0A8', accent2: '#7DE3FF', ink: '#002018', label: 'Blade' },
  hero:      { accent: '#5CE65C', accent2: '#FFE14D', ink: '#0A2000', label: 'Hero' },
  pirate:    { accent: '#FF4757', accent2: '#FFC048', ink: '#2A0008', label: 'Voyager' },
  sorcerer:  { accent: '#A97BFF', accent2: '#FF6BD6', ink: '#180030', label: 'Sorcerer' },
  pilot:     { accent: '#4EA8FF', accent2: '#9BE8FF', ink: '#001830', label: 'Pilot' },
  hunter:    { accent: '#2ED8C3', accent2: '#87FFB0', ink: '#002420', label: 'Scout' },
  athlete:   { accent: '#FF7043', accent2: '#FFD54F', ink: '#2A0C00', label: 'Ace' },
  spirit:    { accent: '#FF8FC7', accent2: '#C9B5FF', ink: '#2A0018', label: 'Spirit' },
  default:   { accent: '#FF3B54', accent2: '#FFB020', ink: '#170208', label: 'Protagonist' }
};

/* keyword → archetype. First match wins. */
const ARCH_RULES = [
  [/naruto|boruto|ninja|shinobi|shinobu no|kunoichi/i, 'ninja'],
  [/one piece|pirate|treasure|voyage|grand line/i, 'pirate'],
  [/demon slayer|kimetsu|bleach|samurai|rurouni|sword art|katana|blade|vinland|gintama|afro/i, 'swordsman'],
  [/hero academia|one punch|hero|tiger.*bunny|saitama|vigilante/i, 'hero'],
  [/jujutsu|sorcer|magi|frieren|witch|mage|fate|madoka|spell|curse|black clover|mushoku/i, 'sorcerer'],
  [/gundam|evangelion|mecha|code geass|86|eighty|pilot|macross|robot|armored/i, 'pilot'],
  [/attack on titan|shingeki|hunter|chainsaw|devil|tokyo ghoul|parasyte|dungeon|solo leveling|goblin/i, 'hunter'],
  [/haikyu|kuroko|slam dunk|blue lock|ping pong|yowamushi|free!|volley|basket|soccer|football|baseball|olympic/i, 'athlete'],
  [/spirited|mushishi|natsume|kimi no na|your name|weathering|violet evergarden|angel|ghost|spirit|xxxholic|clannad/i, 'spirit']
];
const GENRE_FALLBACK = {
  Action: 'swordsman', Adventure: 'pirate', Fantasy: 'sorcerer', 'Sci-Fi': 'pilot',
  Mecha: 'pilot', Sports: 'athlete', Horror: 'hunter', Supernatural: 'spirit',
  Psychological: 'sorcerer', Romance: 'spirit', 'Slice of Life': 'spirit', Comedy: 'hero'
};

function archetypeFor(m) {
  const hay = [m?.title?.english, m?.title?.romaji, m?.title?.native].filter(Boolean).join(' ');
  for (const [re, key] of ARCH_RULES) if (re.test(hay)) return key;
  for (const g of (m?.genres || [])) if (GENRE_FALLBACK[g]) return GENRE_FALLBACK[g];
  return 'default';
}

/* ---- the rig ----
   An articulated human figure: head, neck, torso, two-segment arms with
   elbows, two-segment legs with knees, hands and shoes. Each joint is its
   own <g> so CSS can pose it. A generic person in the series' palette with
   a small archetype accent; not a drawing of any particular character. */
function rigSVG(kind, cls = 'rig') {
  const A = ARCHETYPES[kind] || ARCHETYPES.default;
  const S = `fill="url(#rg-fill)" stroke="url(#rg-rim)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
  const F = `fill="url(#rg-rim)"`;
  /* hair / headwear + one prop, per archetype */
  const acc = {
    ninja:     `<path d="M47 22 q4 -14 22 -10 q6 2 6 8 l-4 -2 q-8 -4 -16 0 l-6 6Z" ${S}/><rect x="46" y="23" width="28" height="5" rx="2" ${F}/><path d="M46 25 q-12 4 -20 14 l3 1 q8 -8 17 -10Z" ${F}/><path d="M46 28 q-14 6 -22 20 l3 0 q8 -12 19 -16Z" ${F} opacity=".6"/>`,
    swordsman: `<path d="M46 22 q6 -12 24 -8 q4 4 2 10 q-10 -6 -20 -2 l-4 4Z" ${S}/><path d="M50 20 q-6 12 -2 30" stroke="url(#rg-rim)" stroke-width="2" fill="none" opacity=".7"/><path d="M86 100 L114 152" stroke="url(#rg-rim)" stroke-width="3.5" stroke-linecap="round"/><path d="M86 100 L114 152" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>`,
    hero:      `<path d="M46 20 q8 -14 26 -6 q2 4 0 8 q-12 -6 -24 0Z" ${S}/><path d="M44 46 q-24 40 -14 100 l6 0 q-8 -60 12 -96Z" ${F} opacity=".45"/><path d="M76 46 q24 40 14 100 l-6 0 q8 -60 -12 -96Z" ${F} opacity=".3"/>`,
    pirate:    `<path d="M34 24 q26 -14 52 0 q4 2 0 4 q-26 8 -52 0 q-4 -2 0 -4Z" ${S}/><path d="M48 24 q12 -14 24 0Z" ${S}/><path d="M80 60 q26 30 20 90" stroke="url(#rg-rim)" stroke-width="2.5" fill="none" opacity=".45"/>`,
    sorcerer:  `<path d="M44 26 q16 -22 32 0 l-2 6 q-14 -8 -28 0Z" ${S}/><path d="M42 44 q-20 40 -10 100 l6 0 q-8 -58 12 -96Z" ${F} opacity=".35"/><circle cx="106" cy="66" r="6" ${F}/><circle cx="106" cy="66" r="10" fill="none" stroke="url(#rg-rim)" opacity=".7"/>`,
    pilot:     `<path d="M46 18 q14 -10 28 0 v10 h-28Z" ${S}/><rect x="47" y="23" width="26" height="8" rx="3" ${F}/><path d="M44 52 h32 v6 h-32Z" ${F} opacity=".5"/><path d="M62 86 h12 v6 h-12Z" ${F} opacity=".5"/>`,
    hunter:    `<path d="M46 22 q8 -14 26 -8 l0 8 q-12 -4 -24 2Z" ${S}/><path d="M42 46 q-6 34 -2 68" stroke="url(#rg-rim)" stroke-width="3" fill="none" opacity=".6"/><path d="M78 46 q6 34 2 68" stroke="url(#rg-rim)" stroke-width="3" fill="none" opacity=".6"/>`,
    athlete:   `<path d="M46 20 q10 -12 26 -4 l-2 8 q-10 -6 -22 0Z" ${S}/><path d="M22 72 h16 M16 86 h20 M20 100 h14" stroke="url(#rg-rim)" stroke-width="3" stroke-linecap="round" opacity=".6"/>`,
    spirit:    `<path d="M44 24 q10 -18 30 -6 q4 6 2 12 q-14 -8 -28 0Z" ${S}/><path d="M44 30 q-16 20 -12 60" stroke="url(#rg-rim)" stroke-width="2" fill="none" opacity=".45"/><circle cx="28" cy="64" r="3" ${F}/><circle cx="98" cy="92" r="2.5" ${F} opacity=".8"/>`,
    default:   `<path d="M46 22 q8 -14 26 -8 q2 4 0 8 q-12 -6 -24 2Z" ${S}/>`
  }[kind] || '';

  return `<svg class="${cls}" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="rg-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141c34"/><stop offset="1" stop-color="#05070f"/></linearGradient>
      <linearGradient id="rg-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${A.accent2}"/><stop offset="1" stop-color="${A.accent}"/></linearGradient>
    </defs>

    <!-- legs: thigh + shin (knee joint) + shoe -->
    <g class="f-leg-l">
      <path d="M50 116 q-6 18 -5 36 h12 q2 -18 5 -36Z" ${S}/>
      <g class="f-shin-l"><path d="M45 150 q-3 18 -2 34 h11 q2 -16 3 -34Z" ${S}/><path d="M42 184 q4 -3 12 -1 l4 4 q1 3 -2 3 h-15 q-2 -3 1 -6Z" ${S}/></g>
    </g>
    <g class="f-leg-r">
      <path d="M70 116 q6 18 5 36 h-12 q-2 -18 -5 -36Z" ${S}/>
      <g class="f-shin-r"><path d="M75 150 q3 18 2 34 h-11 q-2 -16 -3 -34Z" ${S}/><path d="M78 184 q-4 -3 -12 -1 l-4 4 q-1 3 2 3 h15 q2 -3 -1 -6Z" ${S}/></g>
    </g>

    <!-- torso, neck, head -->
    <g class="f-body">
      <path d="M41 52 q19 -10 38 0 q3 14 1 30 q-2 18 -6 36 h-28 q-4 -18 -6 -36 q-2 -16 1 -30Z" ${S}/>
      <path d="M41 52 q19 -6 38 0" stroke="url(#rg-rim)" stroke-width="1.4" fill="none" opacity=".5"/>
      <path d="M55 40 q5 3 10 0 l1 12 q-6 3 -12 0Z" ${S}/>
      <path d="M47 26 q0 -13 13 -13 q13 0 13 13 q0 8 -4 13 q-4 5 -9 5 q-5 0 -9 -5 q-4 -5 -4 -13Z" ${S}/>
      ${acc}
    </g>

    <!-- arms: upper + forearm (elbow joint) + hand -->
    <g class="f-arm-l">
      <path d="M42 56 q-8 4 -10 14 l-3 20 h9 l4 -18 q4 -8 8 -12Z" ${S}/>
      <g class="f-fore-l"><path d="M29 90 q-2 12 -1 24 h8 q1 -12 2 -24Z" ${S}/><path d="M28 114 q4 -2 8 0 q3 4 1 8 q-4 2 -8 0 q-3 -4 -1 -8Z" ${S}/></g>
    </g>
    <g class="f-arm-r">
      <path d="M78 56 q8 4 10 14 l3 20 h-9 l-4 -18 q-4 -8 -8 -12Z" ${S}/>
      <g class="f-fore-r"><path d="M91 90 q2 12 1 24 h-8 q-1 -12 -2 -24Z" ${S}/><path d="M92 114 q-4 -2 -8 0 q-3 4 -1 8 q4 2 8 0 q3 -4 1 -8Z" ${S}/></g>
    </g>
  </svg>`;
}
/* kept for any old call sites */
const figureSVG = kind => rigSVG(kind, 'rig');

/* ==========================================================
   3. PALETTE TAKEOVER
   ========================================================== */
const BASE_PALETTE = { accent: '#22E1FF', accent2: '#6C8CFF', ink: '#041226' };

/* derive a full palette from the series' own cover colour (AniList supplies it) */
function paletteFromColor(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
  if (!m) return null;
  let r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0, l = (max + min) / 2, sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d) {
    if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  /* push it into a range that glows on a dark ground */
  sat = Math.max(.6, Math.min(1, sat + .15));
  const L = Math.max(.56, Math.min(.7, l + .12));
  const hsl = (H, S, Lt) => `hsl(${Math.round((H + 360) % 360)} ${Math.round(S * 100)}% ${Math.round(Lt * 100)}%)`;
  return { accent: hsl(h, sat, L), accent2: hsl(h + 32, sat, Math.min(.78, L + .1)), ink: hsl(h, .6, .07) };
}
function setPalette(p) {
  const r = document.documentElement.style;
  r.setProperty('--accent', p.accent);
  r.setProperty('--accent-2', p.accent2);
  r.setProperty('--accent-ink', p.ink);
}
function resetPalette() { setPalette(BASE_PALETTE); }

/* ==========================================================
   4. DETAIL SHEET
   Opens instantly from the cached card data, then fills in the
   trailer, cast and recommendations as they arrive.
   ========================================================== */
const DETAIL_EXTRA = `
  trailer { id site thumbnail }
  characters(perPage: 10, sort: [ROLE, RELEVANCE]) { nodes { id name { full } image { medium } } }
  recommendations(perPage: 10, sort: RATING_DESC) { nodes { mediaRecommendation { ${MEDIA_FIELDS} } } }
`;
const DETAILS = new Map();

function ensureSheet() {
  if ($('#sheetScrim')) return;
  const el = document.createElement('div');
  el.id = 'sheetScrim';
  el.className = 'sheet-scrim';
  el.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
      <button class="sheet-back" id="sheetBack" aria-label="Back">‹ Back</button>
      <button class="sheet-close" id="sheetClose" aria-label="Close">✕</button>
      <div class="stage" id="stage">
        <img class="stage-bg" id="stageBg" alt="">
        <div class="stage-lines"></div>
        <div class="stage-aura"></div>
        <div id="stageFig"></div>
        <div class="cutin" id="cutin"></div>
        <div class="stage-flash"></div>
        <div class="stage-title">
          <h2 id="sheetTitle"></h2>
          <div class="native jp" id="sheetNative"></div>
        </div>
      </div>
      <div class="sheet-body">
        <div class="pill-row" id="sheetPills"></div>
        <div id="sheetCd"></div>
        <div class="sheet-status">
          <span class="lab">My list</span>
          <div class="seg" id="sheetSeg">
            <button data-status="watching">Watching</button>
            <button data-status="planning">Plan to watch</button>
            <button data-status="completed">Completed</button>
            <button class="rm" data-status="">Remove</button>
          </div>
        </div>
        <p class="sheet-desc" id="sheetDesc"></p>
        <div class="where">
          <h4>Also streaming on</h4>
          <div class="where-links" id="sheetWhere"></div>
        </div>
        <div class="sheet-actions">
          <a class="btn" id="sheetWatch" href="#">▶  Watch now</a>
        </div>
        <div class="sheet-tools">
          <button class="tool" id="sheetShare">⇪ Share</button>
          <a class="tool" id="sheetAniList" href="#" target="_blank" rel="noopener">AniList page ↗</a>
        </div>
        <div id="sheetExtra"></div>
      </div>
    </div>`;
  document.body.appendChild(el);

  el.addEventListener('click', e => { if (e.target === el) closeSheet(); });
  $('#sheetClose').addEventListener('click', () => closeSheet());
  $('#sheetBack').addEventListener('click', () => closeSheet());
  $('#sheetWatch').addEventListener('click', watchNowSequence);
  $('#sheetSeg').addEventListener('click', e => {
    const b = e.target.closest('button[data-status]'); if (!b) return;
    setStatus($('#sheetSeg').dataset.id, b.dataset.status, b);
  });
  $('#sheetShare').addEventListener('click', shareSheet);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && el.classList.contains('open')) closeSheet(); });

  /* trailer click-to-play, recs open another sheet */
  $('#sheetExtra').addEventListener('click', e => {
    const tr = e.target.closest('.trailer[data-yt]');
    if (tr) {
      tr.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(tr.dataset.yt)}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Trailer"></iframe>`;
      tr.removeAttribute('data-yt'); tr.style.cursor = 'default';
      Sfx.play('tick');
    }
  });
}

let sheetOpenId = null;
let sheetPushed = false;   // true while a history entry for the open sheet exists

async function openSheet(id) {
  ensureSheet();
  const scrim = $('#sheetScrim');
  if (!sheetPushed) {
    history.pushState({ sheet: String(id) }, '', '#anime-' + id);
    sheetPushed = true;
  } else {
    history.replaceState({ sheet: String(id) }, '', '#anime-' + id);
  }
  let m = cached(id);

  if (!m) {
    try {
      const d = await gql(`query($id:Int){ Media(id:$id, type:ANIME){ ${MEDIA_FIELDS} ${DETAIL_EXTRA} } }`, { id: Number(id) }, 'detail');
      m = stash([d.Media])[0];
      DETAILS.set(String(id), d.Media);
    } catch (e) {
      if (!isStale(e)) toast('Could not load that title. Try again.', true);
      return;
    }
  }

  sheetOpenId = String(id);
  const kind = archetypeFor(m);
  const A = paletteFromColor(m.coverImage?.color) || ARCHETYPES[kind];
  setPalette(A);

  const t = titleOf(m);
  $('#sheetTitle').innerHTML = t.split('').map((c, i) =>
    `<span class="ch" style="animation-delay:${.35 + Math.min(i, 26) * .028}s">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
  $('#sheetNative').textContent = m.title?.native || A.label;
  $('#cutin').textContent = m.title?.native || m.title?.romaji || A.label;

  const bg = $('#stageBg');
  bg.src = m.bannerImage || m.coverImage?.extraLarge || m.coverImage?.large || '';
  bg.onerror = function () { this.onerror = null; this.src = posterFor(t); };

  const embers = Array.from({ length: 9 }, () => {
    const left = 10 + Math.random() * 24, dur = 2.6 + Math.random() * 2.4, delay = Math.random() * 2.4;
    return `<i class="ember" style="left:${left}%;bottom:${6 + Math.random() * 30}px;animation-duration:${dur}s;animation-delay:${delay}s"></i>`;
  }).join('');
  /* the real lead character from the catalogue as the figure; the drawn rig only if there is none */
  const lead = m.characters?.nodes?.[0];
  const fig = lead?.image?.large
    ? `<div class="fig-glow"></div>
       <div class="hero-photo"><img src="${esc(lead.image.large)}" alt="${esc(lead.name?.full || '')}" loading="eager"></div>
       <span class="fig-name">${esc(lead.name?.full || '')}</span>`
    : rigSVG(kind);
  $('#stageFig').innerHTML = fig + embers;

  const studio = m.studios?.nodes?.[0]?.name;
  const pills = [
    m.format && { t: m.format.replace(/_/g, ' '), hot: true },
    m.status && { t: m.status.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase()) },
    m.seasonYear && { t: [m.season && m.season[0] + m.season.slice(1).toLowerCase(), m.seasonYear].filter(Boolean).join(' ') },
    m.episodes && { t: m.episodes + (m.episodes === 1 ? ' episode' : ' episodes') },
    m.duration && { t: '~' + m.duration + ' min' },
    scoreOf(m) && { t: '★ ' + scoreOf(m) },
    studio && { t: studio },
    ...(m.genres || []).slice(0, 3).map(g => ({ t: g }))
  ].filter(Boolean);
  $('#sheetPills').innerHTML = pills.map(p => `<span class="pill${p.hot ? ' hot' : ''}">${esc(p.t)}</span>`).join('');

  const ep = m.nextAiringEpisode;
  $('#sheetCd').innerHTML = ep
    ? `<div class="cd-block"><div><div class="lab">Next episode</div>
         <div class="val hud" data-at="${ep.airingAt}" data-ep="${ep.episode}">—</div></div></div>` : '';
  tickCountdowns();

  $('#sheetDesc').textContent = cleanText(m.description) || 'No synopsis available for this title yet.';

  const streams = (m.externalLinks || []).filter(l => l.type === 'STREAMING');
  $('#sheetWhere').innerHTML = streams.length
    ? streams.slice(0, 8).map(l =>
        `<a class="where-link" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="dot"></span>${esc(l.site)}</a>`).join('')
    : `<span class="none">No official stream listed.</span>`;

  const watch = $('#sheetWatch');
  const target = watchTargetFor(m);
  watch.dataset.url = target.url; watch.dataset.name = target.name;
  watch.href = target.url;
  watch.innerHTML = '▶  Watch now';
  watch.title = 'Opens ' + target.name;
  $('#sheetAniList').href = m.siteUrl || ('https://anilist.co/anime/' + m.id);
  $('#sheetSeg').dataset.id = m.id;
  paintList();

  /* extras: from cache instantly, or skeleton then fetch */
  const extra = $('#sheetExtra');
  const det = DETAILS.get(String(id));
  if (det) renderExtras(det);
  else {
    extra.innerHTML = `<div class="sub-h">Cast</div><div class="sk-row">${'<div class="shimmer"></div>'.repeat(5)}</div>
      <div class="sub-h">More like this</div><div class="recs">${'<div class="sk"><div class="sk-img"></div></div>'.repeat(4)}</div>`;
    gql(`query($id:Int){ Media(id:$id, type:ANIME){ id ${DETAIL_EXTRA} } }`, { id: Number(id) }, 'extras')
      .then(d => { DETAILS.set(String(id), d.Media); if (sheetOpenId === String(id)) renderExtras(d.Media); })
      .catch(e => { if (!isStale(e) && sheetOpenId === String(id)) extra.innerHTML = ''; });
  }

  scrim.classList.add('open');
  document.body.style.overflow = 'hidden';
  $('.sheet-body').scrollTop = 0;
  const stage = $('#stage');
  stage.classList.remove('play');
  void stage.offsetWidth;
  stage.classList.add('play');
  Sfx.play('open');
  setTimeout(() => Sfx.play('impact'), 380);
  setTimeout(() => Sfx.play('motif', kind), 620);
  if (Sfx.on && !sessionStorage.getItem('aw.sfxhint')) {
    sessionStorage.setItem('aw.sfxhint', '1');
    setTimeout(() => toast('Sound is on — tap 🔊 in the top bar to mute'), 900);
  }
  $('#sheetClose').focus({ preventScroll: true });
}

function renderExtras(d) {
  const extra = $('#sheetExtra');
  const parts = [];

  if (d.trailer?.site === 'youtube' && d.trailer.id) {
    parts.push(`<div class="sub-h">Trailer</div>
      <div class="trailer" data-yt="${esc(d.trailer.id)}" role="button" tabindex="0" aria-label="Play trailer">
        <img src="${esc(d.trailer.thumbnail || 'https://i.ytimg.com/vi/' + d.trailer.id + '/hqdefault.jpg')}" alt="" loading="lazy">
        <div class="play"><i>▶</i></div>
      </div>`);
  }

  const chars = (d.characters?.nodes || []).filter(c => c?.image?.medium);
  if (chars.length) {
    parts.push(`<div class="sub-h">Cast</div><div class="chars">${chars.map(c =>
      `<div class="char"><img src="${esc(c.image.medium)}" alt="" loading="lazy"><span>${esc(c.name?.full || '')}</span></div>`).join('')}</div>`);
  }

  const recs = (d.recommendations?.nodes || []).map(n => n?.mediaRecommendation).filter(r => r && !r.isAdult && r.coverImage?.large);
  if (recs.length) {
    stash(recs);
    parts.push(`<div class="sub-h">More like this</div><div class="recs">${recs.map(r => cardHTML(r).replace('class="card rv"', 'class="card rv in"')).join('')}</div>`);
  }

  extra.innerHTML = parts.join('');
  armFallbacks(extra);
  /* Enter/Space plays the trailer */
  $('.trailer', extra)?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } });
}

async function shareSheet() {
  const m = cached(sheetOpenId); if (!m) return;
  const url = m.siteUrl || location.href;
  const data = { title: titleOf(m), text: 'Check out ' + titleOf(m) + ' on Anime World', url };
  try {
    if (navigator.share) { await navigator.share(data); return; }
    await navigator.clipboard.writeText(url);
    toast('Link copied');
  } catch (e) { if (e?.name !== 'AbortError') toast('Could not share', true); }
}

function closeSheet(fromHistory = false) {
  const scrim = $('#sheetScrim');
  if (!scrim?.classList.contains('open')) return;
  scrim.classList.remove('open');
  document.body.style.overflow = '';
  sheetOpenId = null;
  const fr = $('#sheetExtra iframe'); if (fr) fr.remove();
  Sfx.play('close');
  setTimeout(resetPalette, 320);
  /* ✕ or Back button: pop the entry we pushed so the URL and history stay clean */
  if (sheetPushed && !fromHistory) { sheetPushed = false; history.back(); }
  else sheetPushed = false;
}

/* phone / browser back button closes the sheet instead of leaving the site */
addEventListener('popstate', () => {
  if ($('#sheetScrim')?.classList.contains('open')) { sheetPushed = false; closeSheet(true); }
});

/* coming back from the watch site (or any bfcache restore): clear the hand-off
   overlay so it can't sit invisibly on top and eat taps */
addEventListener('pageshow', () => {
  cinTimers.forEach(clearTimeout); cinTimers = [];
  const c = $('#cinema'); if (c) c.className = '';
  const w = $('#sheetWatch'); if (w) { w.style.pointerEvents = ''; w.innerHTML = '▶  Watch now'; }
});

/* deep link: index.html#anime-123 opens that title.
   The hash is read now, at script load, because page scripts may rewrite the URL before DOMContentLoaded. */
const DEEP_LINK = /^#anime-(\d+)$/.exec(location.hash);
document.addEventListener('DOMContentLoaded', () => {
  if (!DEEP_LINK) return;
  history.replaceState(null, '', location.pathname + location.search);
  openSheet(DEEP_LINK[1]);
});

/* ==========================================================
   5. "WATCH NOW" — THE HANDOFF
   Black out → the figure steps in at the left → lifts its arm and points
   at the horizon → the screen dives toward that point → the destination's
   name appears there, modest size, with a glow that breathes but never
   swallows the screen → hand off.
   ========================================================== */
function ensureCinema() {
  if ($('#cinema')) return;
  const c = document.createElement('div');
  c.id = 'cinema';
  c.innerHTML = `
    <div class="cin-bg"></div>
    <div class="cin-horizon"></div>
    <div class="cin-ring" style="animation-delay:0s"></div>
    <div class="cin-ring" style="animation-delay:.16s"></div>
    <div class="cin-ring" style="animation-delay:.32s"></div>
    <div class="cin-fig" id="cinFig"></div>
    <div class="cin-beam"></div>
    <div class="cin-brand"><div class="halo"></div><div class="nm" id="cinName"></div><div class="sb" id="cinSub"></div></div>
    <button class="btn btn-ghost btn-sm cin-skip" id="cinSkip">Skip</button>`;
  document.body.appendChild(c);
}

let cinTimers = [];
function watchNowSequence(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const url = btn.dataset.url, name = btn.dataset.name || 'Watch';
  if (!url) return;
  if (REDUCED) { location.assign(url); return; }

  ensureCinema();
  const c = $('#cinema');
  const m = cached(sheetOpenId);
  const kind = archetypeFor(m || {});

  c.className = '';
  cinTimers.forEach(clearTimeout); cinTimers = [];
  $('.cin-bg', c).style.backgroundImage = `url("${(m?.bannerImage || m?.coverImage?.extraLarge || '').replace(/"/g, '')}")`;
  const lead = m?.characters?.nodes?.[0];
  c.classList.toggle('photo', !!lead?.image?.large);
  $('#cinFig').innerHTML = lead?.image?.large
    ? `<div class="hero-photo"><img src="${esc(lead.image.large)}" alt=""></div>`
    : rigSVG(kind, 'rig cin-rig');
  $('#cinName').textContent = name.toUpperCase();
  $('#cinSub').textContent = m ? titleOf(m) : '';

  const go = () => { cinTimers.forEach(clearTimeout); cinTimers = []; location.assign(url); };
  $('#cinSkip').onclick = go;

  const at = (ms, fn) => cinTimers.push(setTimeout(fn, ms));
  c.classList.add('on');                                                        // 0     black out
  at(350,  () => { c.classList.add('enter'); Sfx.play('impact'); });            // figure steps in, left
  at(1050, () => { $('#cinFig .rig')?.classList.add('point'); c.classList.add('point'); Sfx.play('charge'); }); // points at the horizon
  at(1900, () => { c.classList.add('zoom'); Sfx.play('dive'); });               // dive toward that point
  at(2700, () => { c.classList.add('brand'); Sfx.play('bloom'); });             // name + breathing glow
  at(4300, () => { c.classList.add('out'); });                                  // fade
  at(4650, go);
}
