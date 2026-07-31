/* ============================================================
   THE DOJANG — economy, packs, and the room they live in
   ------------------------------------------------------------
   Design rules that are load-bearing, not decoration:

   * 기 (ki) is earned for WORK DONE, never for being right. It is derived
     from S.days[*].reviews, which counts every graded answer regardless of
     grade. Paying more for correct answers would quietly reintroduce the
     punishment mechanic invariant 5 forbids, and would give a student a
     reason to lie on the self-graded speaking drill — the one exercise that
     only works if you are honest with it.
   * Because it is DERIVED from work already recorded, there is nothing to
     hook, nothing to double-count, and it survives export/import for free.
     Only spending is stored.
   * A daily cap means grinding past a healthy session earns nothing extra.
     The app already tells you to stop at 20 minutes; the economy agrees.
   * No real money. Ever. There is no purchase path and there must never be.
   * Collectibles are toys, not rank. Nothing here unlocks a technique, a
     belt, or any physical practice.
   ============================================================ */

const KI_PER_REVIEW = 2;        // every graded answer, right or wrong
const KI_DAY_CAP_REVIEWS = 60;  // past this in one day, extra reps pay nothing
const KI_DAY_BONUS = 10;        // for turning up at all
const KI_PER_MASTERED = 25;     // an item whose whole ladder holds
const PACK_COST = 100;

/* Weights are per-pull. Pity counters below guarantee the tail. */
const DJ_WEIGHTS = { common: 60, rare: 28, legendary: 9.5, mythical: 2.5 };
const PITY_RARE = 10;   // a rare or better at least this often
const PITY_LEG = 50;    // a legendary or better at least this often

function djState() {
  if (!S.dojang) S.dojang = { spent: 0, refunded: 0, owned: {}, opened: 0, pityRare: 0, pityLeg: 0, seen: {}, last: null };
  const d = S.dojang;
  if (!d.owned) d.owned = {};
  if (!d.seen) d.seen = {};
  return d;
}

/* Ki you have earned, derived entirely from work the app already recorded. */
function kiEarned() {
  let n = 0;
  Object.keys(S.days || {}).forEach(k => {
    const revs = Math.max(0, (S.days[k] || {}).reviews || 0);
    if (revs > 0) n += KI_DAY_BONUS;
    n += Math.min(revs, KI_DAY_CAP_REVIEWS) * KI_PER_REVIEW;
  });
  let mastered = 0;
  SEQUENCE.forEach(id => { if (knowledgeMastered(ITEMS[id])) mastered++; });
  return n + mastered * KI_PER_MASTERED;
}
function kiBalance() {
  const d = djState();
  return Math.max(0, kiEarned() + (d.refunded || 0) - (d.spent || 0));
}
function djKiToday() {
  const revs = Math.max(0, (S.days[todayKey()] || {}).reviews || 0);
  return { revs, capped: revs >= KI_DAY_CAP_REVIEWS };
}

function djRollRarity() {
  const d = djState();
  if (d.pityLeg + 1 >= PITY_LEG) return Math.random() < 0.2 ? 'mythical' : 'legendary';
  if (d.pityRare + 1 >= PITY_RARE) {
    const r = Math.random();
    return r < 0.72 ? 'rare' : r < 0.95 ? 'legendary' : 'mythical';
  }
  const total = DJ_RARITY_ORDER.reduce((n, k) => n + DJ_WEIGHTS[k], 0);
  let roll = Math.random() * total;
  for (const k of DJ_RARITY_ORDER) { roll -= DJ_WEIGHTS[k]; if (roll <= 0) return k; }
  return 'common';
}

/* One pull. Returns {id, rarity, dup, refund}. */
function djPull() {
  const d = djState();
  const rarity = djRollRarity();
  const pool = DJ_ROSTER.filter(c => c.r === rarity);
  const c = pool[Math.floor(Math.random() * pool.length)];
  d.pityRare = (rarity === 'common') ? d.pityRare + 1 : 0;
  d.pityLeg = (rarity === 'legendary' || rarity === 'mythical') ? 0 : d.pityLeg + 1;
  const dup = !!d.owned[c.id];
  d.owned[c.id] = (d.owned[c.id] || 0) + 1;
  if (!dup) d.seen[c.id] = Date.now();
  let refund = 0;
  if (dup) { refund = DJ_RARITY[rarity].refund; d.refunded = (d.refunded || 0) + refund; }
  return { id: c.id, rarity, dup, refund };
}

function openPacks(n) {
  const d = djState();
  const count = Math.max(1, Math.min(10, n || 1));
  if (kiBalance() < PACK_COST * count) return;
  d.spent = (d.spent || 0) + PACK_COST * count;
  const results = [];
  for (let i = 0; i < count; i++) { d.opened = (d.opened || 0) + 1; results.push(djPull()); }
  d.last = { results, t: Date.now() };
  save();
  const best = results.reduce((a, b) =>
    DJ_RARITY_ORDER.indexOf(b.rarity) > DJ_RARITY_ORDER.indexOf(a.rarity) ? b : a, results[0]);
  if (best && (best.rarity === 'legendary' || best.rarity === 'mythical') && S.settings.fxLevel !== 'off') {
    try { Sfx.play('milestone'); } catch (e) { /* sound is optional */ }
  }
  render();
}

function djOwnedList() {
  const d = djState();
  return DJ_ROSTER.filter(c => d.owned[c.id]);
}
function djCollectionStats() {
  const d = djState();
  const owned = DJ_ROSTER.filter(c => d.owned[c.id]).length;
  const byR = {};
  DJ_RARITY_ORDER.forEach(r => {
    const all = DJ_ROSTER.filter(c => c.r === r);
    byR[r] = { owned: all.filter(c => d.owned[c.id]).length, total: all.length };
  });
  return { owned, total: DJ_ROSTER.length, byR, opened: d.opened || 0 };
}

function djHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function djRarityTag(r, small) {
  const m = DJ_RARITY[r];
  // Rarity is always spelled out — the colour and the pips are extra, never
  // the only signal.
  return `<span class="dj-tag${small ? ' sm' : ''}" style="--rc:${m.c}">
    <span class="dj-pips" aria-hidden="true">${'●'.repeat(m.pips)}</span>${m.label}</span>`;
}

/* ---------- the room ---------- */
function renderDojangRoom() {
  const owned = djOwnedList();
  const st = djCollectionStats();
  if (!owned.length) {
    return `<div class="card dj-empty">
      <h2>Your dojang is empty</h2>
      <p class="sub">Train, earn 기, open a pack — whoever turns up moves in and starts training here.</p>
    </div>`;
  }
  // Deterministic even spacing, back rows first. Placing by hash clustered
  // them into a pile with overlapping names; a slot per character keeps the
  // room readable no matter how many move in. Drift is small and the figure
  // is centred on its slot, so nobody wanders into a neighbour or off-screen.
  const PER_ROW = 4, ROW_H = 76;
  const rows = Math.ceil(owned.length / PER_ROW);
  const roomH = 84 + rows * ROW_H;
  const floor = owned.map((c, i) => {
    const h = djHash(c.id);
    const r = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;
    const inRow = Math.min(PER_ROW, owned.length - r * PER_ROW);
    const left = ((col + 0.5) / inRow) * 100;
    const bottom = 12 + (rows - 1 - r) * ROW_H;
    const depth = rows > 1 ? r / (rows - 1) : 1;          // 0 = back, 1 = front
    const scale = (0.76 + 0.24 * depth).toFixed(3);
    const dur = 15 + h % 11;                               // seconds for a lap
    const delay = h % 8;
    const drift = 3 + h % 4;                               // small, in %
    return `<div class="dj-liv" style="left:${left.toFixed(2)}%;bottom:${bottom}px;z-index:${r + 1};--s:${scale};--dur:${dur}s;--dl:-${delay}s;--drift:${drift}%">
      <div class="dj-bob">${djCharSvg(c, { cls: 'dj-room' })}</div>
      <span class="dj-liv-name">${esc(c.name)}</span>
    </div>`;
  }).join('');
  return `<div class="dj-room-wrap">
    <div class="dj-room" style="height:${roomH}px" aria-label="Your dojang, ${owned.length} characters living here">
      <div class="dj-wall"><span class="dj-scroll ko" title="suryeon — training, practice" aria-hidden="true">수련</span></div>
      ${floor}
    </div>
    <p class="faint dj-roomnote">${owned.length} of ${st.total} living here. They train, stretch and wander — nobody here demonstrates a technique, and none of them are a rank.</p>
  </div>`;
}

/* ---------- the collection grid ---------- */
function renderDojangCollection() {
  const d = djState();
  const st = djCollectionStats();
  const groups = DJ_RARITY_ORDER.map(r => {
    const rows = DJ_ROSTER.filter(c => c.r === r).map(c => {
      const n = d.owned[c.id] || 0;
      if (!n) {
        return `<div class="dj-card locked">
          <div class="dj-art"><div class="dj-unknown" aria-hidden="true">?</div></div>
          <div class="dj-name">Not found yet</div>
          ${djRarityTag(r, true)}
        </div>`;
      }
      return `<div class="dj-card" style="--rc:${DJ_RARITY[r].c}">
        <div class="dj-art">${djCharSvg(c)}</div>
        <div class="dj-name">${esc(c.name)}</div>
        ${djRarityTag(r, true)}
        ${n > 1 ? `<span class="dj-count">×${n}</span>` : ''}
        <div class="dj-blurb">${esc(c.blurb)}</div>
      </div>`;
    }).join('');
    return `<div class="dj-group">
      <div class="dj-group-h">${djRarityTag(r)}<span class="faint">${st.byR[r].owned} / ${st.byR[r].total}</span></div>
      <div class="dj-grid">${rows}</div>
    </div>`;
  }).join('');
  return `<div class="card">
    <h2>Collection</h2>
    <p class="sub">${st.owned} of ${st.total} found · ${st.opened} pack${st.opened === 1 ? '' : 's'} opened.
    These are characters, not curriculum — their names are nobody's vocabulary and will not be on any test.
    They are also not rank: only Grandmaster Lee awards belts.</p>
  </div>${groups}`;
}

/* ---------- the pull reveal ---------- */
function renderDojangReveal() {
  const d = djState();
  if (!d.last || !d.last.results || !d.last.results.length) return '';
  const cards = d.last.results.map((res, i) => {
    const c = DJ_BY_ID[res.id];
    if (!c) return '';
    return `<div class="dj-reveal-card r-${res.rarity}" style="--rc:${DJ_RARITY[res.rarity].c};--i:${i}">
      <div class="dj-art">${djCharSvg(c)}</div>
      <div class="dj-name">${esc(c.name)}</div>
      ${djRarityTag(res.rarity, true)}
      ${res.dup ? `<div class="dj-dupe">Already had them — +${res.refund} 기${S.settings.showRomanization ? ' (ki)' : ''} back</div>`
              : '<div class="dj-newtag">New!</div>'}
    </div>`;
  }).join('');
  return `<div class="card dj-reveal">
    <h2>${d.last.results.length > 1 ? 'Your packs' : 'Your pack'}</h2>
    <div class="dj-reveal-row">${cards}</div>
    <div class="row" style="margin-top:12px"><button class="btn primary" data-dj="dismiss">Nice</button></div>
  </div>`;
}

function renderDojang() {
  const bal = kiBalance();
  const today = djKiToday();
  const canOne = bal >= PACK_COST, canFive = bal >= PACK_COST * 5;
  const st = djCollectionStats();
  const tab = djTab === 'collection' ? 'collection' : 'room';
  // Romanization follows Hangul everywhere in this app — Kevin cannot read
  // Hangul yet, and a currency he cannot read is a currency he cannot reason
  // about. Honour the same setting the rest of the UI uses.
  const rom = S.settings.showRomanization;
  const ki = rom ? '기 <i class="dj-rom">ki</i>' : '기';
  // A short session is roughly a dozen reviews, and turning up at all pays the
  // day bonus — count both, or the estimate reads far bleaker than the truth.
  const perSession = KI_PER_REVIEW * 12 + KI_DAY_BONUS;
  const need = PACK_COST - bal;
  const sessions = Math.max(1, Math.ceil(need / perSession));
  return `
  <div class="card dj-head">
    <div class="row" style="align-items:center;gap:12px">
      <div style="flex:1">
        <h2 style="margin:0">Dojang</h2>
        <p class="sub" style="margin:4px 0 0">Training earns <b>기${rom ? ' (ki)' : ''}</b> — for the work, never for being right. Wrong answers pay exactly the same.</p>
      </div>
      <div class="dj-bal" aria-label="${bal} ki"><span class="ko" aria-hidden="true">${ki}</span><b>${bal}</b></div>
    </div>
    <div class="row" style="margin-top:12px;flex-wrap:wrap">
      <button class="btn primary" data-dj="open1" ${canOne ? '' : 'disabled'} aria-label="Open a pack for ${PACK_COST} ki">Open a pack · ${PACK_COST} 기</button>
      <button class="btn" data-dj="open5" ${canFive ? '' : 'disabled'} aria-label="Open five packs for ${PACK_COST * 5} ki">Open five · ${PACK_COST * 5} 기</button>
    </div>
    ${!canOne ? `<p class="faint" style="margin:9px 0 0;font-size:12.5px">${need} 기 to go — about ${sessions} more short session${sessions === 1 ? '' : 's'}.</p>` : ''}
    ${today.capped ? '<p class="faint" style="margin:9px 0 0;font-size:12.5px">You have earned today\'s full 기 — more reviews still count for your scheduling, they just stop paying. Rest is part of it.</p>' : ''}
    <div class="dj-pity faint">Guaranteed a Rare or better within ${PITY_RARE - djState().pityRare} pack${PITY_RARE - djState().pityRare === 1 ? '' : 's'} · Legendary or better within ${PITY_LEG - djState().pityLeg}.</div>
  </div>
  ${renderDojangReveal()}
  <div class="dj-tabs">
    <button data-dj="tab-room" class="${tab === 'room' ? 'on' : ''}">The room</button>
    <button data-dj="tab-collection" class="${tab === 'collection' ? 'on' : ''}">Collection · ${st.owned}/${st.total}</button>
  </div>
  ${tab === 'room' ? renderDojangRoom() : renderDojangCollection()}`;
}

/* Which dojang sub-tab is showing. */
let djTab = 'room';

/* Debug/test handles. Added here rather than in part5's literal because these
   consts are declared in this file — naming them earlier hits the TDZ. */
Object.assign(window.__HKD, {
  kiEarned, kiBalance, djState, djCollectionStats, openPacks, djPull, djRollRarity, djOwnedList,
  DJ_ROSTER, DJ_RARITY, DJ_RARITY_ORDER, PACK_COST, PITY_RARE, PITY_LEG,
  KI_PER_REVIEW, KI_DAY_CAP_REVIEWS, KI_DAY_BONUS
});
// Object.assign INVOKES getters and copies the resulting value, so an accessor
// passed through it would freeze into a stale string and its setter would
// silently do nothing. defineProperty keeps it live.
Object.defineProperty(window.__HKD, 'djTab', {
  get() { return djTab; }, set(v) { djTab = v; }, configurable: true
});

document.addEventListener('click', e => {
  const t = e.target.closest('[data-dj]');
  if (!t) return;
  const a = t.dataset.dj;
  if (a === 'open1') openPacks(1);
  else if (a === 'open5') openPacks(5);
  else if (a === 'dismiss') { djState().last = null; save(); render(); }
  else if (a === 'tab-room') { djTab = 'room'; render(); }
  else if (a === 'tab-collection') { djTab = 'collection'; render(); }
});
