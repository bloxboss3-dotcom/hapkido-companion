/* ============================================================
   THE OBSTACLE COURSE — your class vs. what erodes training
   ------------------------------------------------------------
   Your collected characters go in together. Each has its own health bar,
   rarity drives damage and toughness, and the whole thing plays out as an
   animation until either the obstacle is down or your class is.

   Four rules keep this from fighting the rest of the app:

   * The enemy is never a person (see BOSS_ROSTER). Attacks are abstract
     lunges, never a technique anyone could copy onto a partner.
   * LOSING COSTS NOTHING. No entry fee, no lost characters, no lost ki,
     unlimited retries. Invariant 5 forbids punishment mechanics, and a
     boss that eats your currency when you lose is exactly that. The only
     thing standing between you and a win is how strong your class is.
   * Studying makes you stronger. Part of your damage comes from items you
     have actually mastered, so the game points back at the work instead of
     competing with it.
   * Winning never awards rank. It unlocks a character and the next
     obstacle. Grandmaster Lee awards belts; a cartoon does not.
   ============================================================ */

/* Rarity → toughness and hitting power. */
const BOSS_UNIT = {
  common:    { hp: 40,  atk: 7 },
  rare:      { hp: 62,  atk: 12 },
  legendary: { hp: 95,  atk: 19 },
  mythical:  { hp: 140, atk: 28 }
};
const BT_ACTIVE = 6;          // on the mat at once; the rest tag in as reserves
const BT_MAX_ROUNDS = 60;

function bossState() {
  const d = djState();
  if (!d.bosses) d.bosses = { cleared: {} };
  if (!d.bosses.cleared) d.bosses.cleared = {};
  return d.bosses;
}

/* Obstacles unlock in order — you meet Impatience after The Forgetting. */
function bossUnlockedIndex() {
  const cleared = bossState().cleared;
  let i = 0;
  while (i < BOSS_ROSTER.length && cleared[BOSS_ROSTER[i].id]) i++;
  return Math.min(i, BOSS_ROSTER.length - 1);
}
function bossIsUnlocked(id) {
  const idx = BOSS_ROSTER.findIndex(b => b.id === id);
  return idx <= bossUnlockedIndex();
}

/* Mastered knowledge is real damage. Capped so collecting still matters and
   so a beginner is not locked out — it is a bonus, never the whole story. */
function studyBonus() {
  const mastered = SEQUENCE.filter(id => knowledgeMastered(ITEMS[id])).length;
  return Math.min(0.6, mastered * 0.005);
}

function battleRoster() {
  return djOwnedList()
    .map(c => {
      const s = BOSS_UNIT[c.r] || BOSS_UNIT.common;
      return { id: c.id, name: c.name, r: c.r, max: s.hp, hp: s.hp, atk: s.atk };
    })
    .sort((a, b) => (b.atk * b.max) - (a.atk * a.max));
}

/* Simulate the whole fight up front, then play the log back. Keeping the
   simulation pure makes it testable without touching the DOM or the clock. */
function simulateBattle(boss, roster, bonus) {
  const units = roster.map(u => ({ ...u }));
  const active = units.slice(0, BT_ACTIVE);
  const bench = units.slice(BT_ACTIVE);
  const mul = 1 + bonus;
  const jitter = () => 0.85 + Math.random() * 0.3;
  let bossHp = boss.hp;
  const log = [];
  let round = 0;

  while (round < BT_MAX_ROUNDS) {
    round++;
    for (const u of active) {
      if (u.hp <= 0) continue;
      const dmg = Math.max(1, Math.round(u.atk * mul * jitter()));
      bossHp = Math.max(0, bossHp - dmg);
      log.push({ t: 'hit', unit: u.id, dmg, bossHp, round });
      if (bossHp <= 0) { log.push({ t: 'win', round }); return { log, win: true, round, bossHp: 0 }; }
    }
    // The longer it drags on, the harder it presses — a stalemate is a loss,
    // which is what makes a bigger, better-studied class actually matter.
    const swings = round >= 8 ? 3 : round >= 4 ? 2 : 1;
    for (let s = 0; s < swings; s++) {
      const standing = active.filter(u => u.hp > 0);
      if (!standing.length) break;
      const target = standing[Math.floor(Math.random() * standing.length)];
      const dmg = Math.max(1, Math.round(boss.atk * jitter()));
      target.hp = Math.max(0, target.hp - dmg);
      log.push({ t: 'boss', unit: target.id, dmg, hp: target.hp, round });
      if (target.hp <= 0) {
        log.push({ t: 'down', unit: target.id, round });
        const next = bench.shift();
        if (next) {
          const slot = active.indexOf(target);
          active[slot] = next;
          log.push({ t: 'tagin', unit: next.id, replaces: target.id, hp: next.hp, max: next.max, round });
        }
      }
    }
    if (!active.some(u => u.hp > 0)) break;
  }
  log.push({ t: 'lose', round });
  return { log, win: false, round, bossHp };
}

/* ---------- the scene ----------
   Six mats' worth of people on the left, the obstacle on the right, both on a
   fixed mid-tone floor for the same reason the dojang room has one: uniforms
   run from near-white to near-black, so a theme-coloured backdrop makes one
   family of characters vanish.

   Slot 0 is the strongest of the six (battleRoster() sorts that way), so the
   slots put slot 0 at the front where you can see them. x is a percentage
   across the floor, b is pixels up from it, s is the depth scale. */
const BT_SLOTS = [
  { x: 31, b: 26,  s: 1.02, z: 6 },   // front rank
  { x: 15, b: 20,  s: 1.04, z: 7 },
  { x: 43, b: 42,  s: 0.93, z: 5 },
  { x: 25, b: 96,  s: 0.78, z: 3 },   // back rank
  { x: 9,  b: 88,  s: 0.80, z: 4 },
  { x: 40, b: 110, s: 0.73, z: 2 }
];

/* How long each beat of the choreography holds, before pacing is applied.
   A round reads as: banner, the class charges in together, each strike lands,
   they regroup, the obstacle winds up, it swings back, everyone resets. */
const BT_BEAT_MS = {
  round: 520, charge: 470, hit: 205, regroup: 380,
  windup: 500, boss: 380, down: 460, tagin: 430, recover: 400, end: 320
};
/* A won fight is usually a handful of rounds, which lands around 15-20s — long
   enough to watch, short enough to want again. A grinding loss can run sixty,
   so the whole thing is scaled to fit inside this budget rather than making
   anyone sit through four minutes. There is a Skip button either way. */
const BT_TARGET_MS = 34000;
const BT_MIN_SPEED = 0.2;

/* ---------- battle state + playback ---------- */
let bt = null;              // { boss, roster, sim, i, done, live:{id:hp}, bossHp, beats, bi }
let btTimers = [];
function btClear() { btTimers.forEach(clearTimeout); btTimers = []; }

/* Group the flat event log into beats. The simulation already tags every
   event with its round, so this is pure re-shaping — no game logic lives
   here, and changing the choreography can never change who wins. */
function buildBeats(log) {
  const beats = [];
  let i = 0;
  while (i < log.length) {
    if (log[i].t === 'win' || log[i].t === 'lose') { beats.push({ k: 'end', ev: log[i++] }); continue; }
    const round = log[i].round;
    const hits = [], swings = [];
    while (i < log.length && log[i].t === 'hit' && log[i].round === round) hits.push(log[i++]);
    while (i < log.length && log[i].round === round && log[i].t !== 'hit' &&
           log[i].t !== 'win' && log[i].t !== 'lose') swings.push(log[i++]);
    beats.push({ k: 'round', n: round, hits: hits.length });
    if (hits.length) {
      beats.push({ k: 'charge', units: hits.map(h => h.unit) });
      hits.forEach(h => beats.push({ k: 'hit', ev: h }));
      beats.push({ k: 'regroup', units: hits.map(h => h.unit) });
    }
    if (swings.length) {
      beats.push({ k: 'windup' });
      swings.forEach(e => beats.push({ k: e.t, ev: e }));
      beats.push({ k: 'recover' });
    }
  }
  return beats;
}

function startBattle(bossId) {
  const boss = BOSS_BY_ID[bossId];
  if (!boss || !bossIsUnlocked(bossId)) return;
  const roster = battleRoster();
  if (!roster.length) return;
  btClear();
  const sim = simulateBattle(boss, roster, studyBonus());
  const live = {};
  roster.forEach(u => { live[u.id] = u.max; });
  bt = { boss, roster, sim, i: 0, done: false, live, bossHp: boss.hp,
         active: roster.slice(0, BT_ACTIVE).map(u => u.id), rewarded: null,
         beats: buildBeats(sim.log), bi: 0, round: 0 };
  djTab = 'battle';
  render();
  playBattle();
}

/* Reduced motion or FX off means no animation at all — jump to the result
   rather than making someone sit through a show they asked not to see. */
function btInstant() {
  return S.settings.fxLevel === 'off' ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function playBattle() {
  if (!bt) return;
  if (btInstant()) { bt.i = bt.sim.log.length; applyBattleEvents(bt.sim.log); finishBattle(); return; }
  const beats = bt.beats;
  const total = beats.reduce((n, b) => n + (BT_BEAT_MS[b.k] || 200), 0);
  const speed = Math.max(BT_MIN_SPEED, Math.min(1, BT_TARGET_MS / Math.max(1, total)));
  const tick = () => {
    if (!bt || bt.done) return;
    if (bt.bi >= beats.length) { finishBattle(); return; }
    const b = beats[bt.bi++];
    if (b.ev) { applyBattleEvents([b.ev]); bt.i++; }
    paintBeat(b);
    btTimers.push(setTimeout(tick, Math.max(55, Math.round((BT_BEAT_MS[b.k] || 200) * speed))));
  };
  btTimers.push(setTimeout(tick, 460));
}

/* Watching is optional. Applying the whole log is safe to do twice: a tag-in
   whose slot has already been swapped finds nothing to replace, and the
   health values are absolute rather than deltas. */
function btSkip() {
  if (!bt || bt.done) return;
  btClear();
  applyBattleEvents(bt.sim.log);
  bt.i = bt.sim.log.length;
  bt.bi = bt.beats.length;
  finishBattle();
}

function applyBattleEvents(evs) {
  evs.forEach(ev => {
    if (!bt) return;
    if (ev.t === 'hit') bt.bossHp = ev.bossHp;
    else if (ev.t === 'boss') bt.live[ev.unit] = ev.hp;
    else if (ev.t === 'tagin') {
      const slot = bt.active.indexOf(ev.replaces);
      if (slot >= 0) bt.active[slot] = ev.unit;
    }
  });
}

/* ---------- painting a beat ----------
   Direct DOM updates rather than a re-render, so in-flight CSS transitions
   and animations survive the next beat. */
function btFig(arena, id) {
  return Array.prototype.find.call(arena.querySelectorAll('.bt-fig'), f => f.dataset.bu === id);
}
/* The named rows, the bench line and the announcer sit OUTSIDE the scene —
   the scene is the picture, they are the readable half — so these look at the
   document rather than at the arena. Scoping them to the arena silently found
   nothing and left every row frozen at full health. */
function btRow(id) {
  return Array.prototype.find.call(document.querySelectorAll('[data-bur]'), r => r.dataset.bur === id);
}

/* Every animation on a figure drives `transform`, so exactly one may be on it
   at a time. Deciding that here rather than by CSS ordering means adding a
   sixth animation later cannot silently cancel the charge. */
const BT_FIG_ANIM = ['charging', 'back', 'hurt', 'tagin'];
function btAnim(f, cls) {
  BT_FIG_ANIM.forEach(c => f.classList.remove(c));
  void f.offsetWidth;                       // restart even if it is the same class
  if (cls) f.classList.add(cls);
}

function paintBeat(b) {
  const arena = document.getElementById('bt-arena');
  if (!arena || !bt) return;
  const bossEl = arena.querySelector('.bt-bosschar');

  if (b.k === 'round') {
    bt.round = b.n;
    btBanner(arena, 'Round ' + b.n);
    btSay('Round ' + b.n + '. ' + bt.boss.name + ' at ' +
      Math.max(0, bt.bossHp) + ' of ' + bt.boss.hp + '.');
  } else if (b.k === 'charge') {
    btMove(arena, b.units, true);
  } else if (b.k === 'regroup') {
    btMove(arena, b.units, false);
  } else if (b.k === 'hit') {
    const f = btFig(arena, b.ev.unit);
    if (f) { f.classList.remove('strike'); void f.offsetWidth; f.classList.add('strike'); }
    if (bossEl) {
      bossEl.classList.remove('shake'); void bossEl.offsetWidth; bossEl.classList.add('shake');
      btBurst(bossEl);
      floatNum(bossEl, '-' + b.ev.dmg, 'dmg');
    }
    btSetBossHp(arena);
  } else if (b.k === 'windup') {
    if (bossEl) bossEl.classList.add('windup');
    btBanner(arena, bt.boss.name + ' answers', 'warn');
  } else if (b.k === 'boss') {
    if (bossEl) {
      bossEl.classList.remove('windup');
      bossEl.classList.remove('boss-lunge'); void bossEl.offsetWidth; bossEl.classList.add('boss-lunge');
    }
    const f = btFig(arena, b.ev.unit);
    if (f) {
      f.style.animationDelay = '0ms';
      btAnim(f, 'hurt');
      btBurst(f, 'small');
      floatNum(f, '-' + b.ev.dmg, 'dmg');
    }
    btSetUnitHp(arena, b.ev.unit, b.ev.hp);
  } else if (b.k === 'down') {
    const f = btFig(arena, b.ev.unit);
    if (f) f.classList.add('down');
    btSetUnitHp(arena, b.ev.unit, 0);
  } else if (b.k === 'tagin') {
    btSwapIn(arena, b.ev);
  } else if (b.k === 'recover') {
    if (bossEl) bossEl.classList.remove('windup');
  }
}

/* Where each attacker lands, as a fraction of the obstacle's own box. Fanned
   on purpose: sent to one point they stack into a single silhouette and the
   whole thing reads as a queue instead of a class going in together. */
const BT_LAND = [
  [-0.34, 0.10], [-0.02, -0.14], [-0.48, -0.06],
  [0.16, 0.16], [-0.24, 0.36], [0.24, -0.02]
];

/* Everyone still standing runs in together, hops onto the obstacle, then
   drops back to their spot. Distances are measured live against the two
   boxes, so it lands correctly at any width without hard-coded pixels. */
function btMove(arena, ids, forward) {
  const bossEl = arena.querySelector('.bt-bosschar');
  if (!bossEl) return;
  const br = bossEl.getBoundingClientRect();
  ids.forEach((id, i) => {
    const f = btFig(arena, id);
    if (!f) return;
    if (!forward) {
      f.style.animationDelay = (i * 40) + 'ms';
      f.style.zIndex = f.dataset.z || '';
      btAnim(f, 'back');
      return;
    }
    if (f.classList.contains('down')) return;
    const r = f.getBoundingClientRect();
    const land = BT_LAND[i % BT_LAND.length];
    const dx = (br.left + br.width * (0.44 + land[0])) - (r.left + r.width / 2);
    const dy = (br.top + br.height * (0.58 + land[1])) - (r.top + r.height * 0.62);
    f.style.setProperty('--cx', Math.round(dx) + 'px');
    f.style.setProperty('--cy', Math.round(dy) + 'px');
    f.style.animationDelay = (i * 60) + 'ms';
    f.style.zIndex = 40 + i;             // in front of the obstacle, not behind it
    btAnim(f, 'charging');
  });
}

function btSetBossHp(arena) {
  const bar = arena.querySelector('.bt-bosshp i');
  if (bar) bar.style.width = Math.max(0, Math.min(1, bt.bossHp / bt.boss.hp)) * 100 + '%';
  const n = arena.querySelector('.bt-bosshp-num');
  if (n) n.textContent = Math.max(0, bt.bossHp) + ' / ' + bt.boss.hp;
}

function btSetUnitHp(arena, id, hp) {
  const u = bt.roster.find(x => x.id === id);
  if (!u) return;
  const frac = Math.max(0, Math.min(1, hp / u.max));
  const f = btFig(arena, id);
  if (f) {
    const bar = f.querySelector('.bt-fighp i');
    if (bar) bar.style.width = frac * 100 + '%';
    if (hp <= 0) f.classList.add('down');
  }
  const row = btRow(id);
  if (row) {
    const bar = row.querySelector('.bt-uhp i');
    if (bar) bar.style.width = frac * 100 + '%';
    const st = row.querySelector('.bt-ustate');
    if (st) st.textContent = hp <= 0 ? 'catching their breath' : hp + ' / ' + u.max;
    row.classList.toggle('down', hp <= 0);
  }
}

/* A fresh face on the mat takes the tired one's slot, markup and all. Doing
   it in place rather than re-rendering keeps every other animation alive. */
function btSwapIn(arena, ev) {
  const u = bt.roster.find(x => x.id === ev.unit);
  if (!u) return;
  const slot = bt.active.indexOf(ev.unit);
  const host = Array.prototype.find.call(arena.querySelectorAll('.bt-fig'),
    f => Number(f.dataset.slot) === slot);
  if (host) {
    host.classList.remove('down', 'strike');
    host.style.zIndex = host.dataset.z || '';
    host.style.animationDelay = '0ms';
    host.dataset.bu = u.id;
    host.innerHTML = btFigInner(u, bt.live[u.id]);
    btAnim(host, 'tagin');
  }
  const row = btRow(ev.replaces);
  if (row) row.outerHTML = btUnitRow(u, bt.live[u.id]);
  const bench = document.querySelector('.bt-bench');
  if (bench) {
    const left = bt.roster.filter(x => bt.active.indexOf(x.id) < 0 && bt.live[x.id] > 0).length;
    bench.textContent = left ? left + ' more waiting to tag in' : 'nobody left on the bench';
  }
  btSay(u.name + ' tags in.');
}

function btBanner(arena, text, cls) {
  const el = arena.querySelector('.bt-banner');
  if (!el) return;
  el.textContent = text;
  el.className = 'bt-banner' + (cls ? ' ' + cls : '');
  void el.offsetWidth;
  el.classList.add('show');
}

/* The scene is meaningless to a screen reader, so say what happened. Coarse
   on purpose — once a round, not once a punch. */
function btSay(text) {
  const el = document.querySelector('.bt-say');
  if (el) el.textContent = text;
}

/* A ring and a few sparks where the strike lands. Pure decoration: it is
   spawned and removed, and nothing reads it. */
function btBurst(host, size) {
  if (!host) return;
  const w = document.createElement('span');
  w.className = 'bt-burst' + (size === 'small' ? ' small' : '');
  w.setAttribute('aria-hidden', 'true');
  let sparks = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.random() * 0.7;
    const d = 16 + Math.random() * 14;
    sparks += '<i style="--tx:' + Math.round(Math.cos(a) * d) + 'px;--ty:' +
      Math.round(Math.sin(a) * d) + 'px;--d:' + (i * 30) + 'ms"></i>';
  }
  w.innerHTML = '<b></b>' + sparks;
  w.style.left = (36 + Math.random() * 28) + '%';
  w.style.top = (30 + Math.random() * 28) + '%';
  host.appendChild(w);
  setTimeout(() => w.remove(), 700);
}

function floatNum(host, text, cls) {
  if (!host) return;
  const s = document.createElement('span');
  s.className = 'bt-float ' + (cls || '');
  s.setAttribute('aria-hidden', 'true');
  s.textContent = text;
  s.style.left = (30 + Math.random() * 40) + '%';
  host.appendChild(s);
  setTimeout(() => s.remove(), 950);
}

function finishBattle() {
  if (!bt || bt.done) return;
  bt.done = true;
  btClear();
  const boss = bt.boss;
  const st = bossState();
  if (bt.sim.win) {
    const first = !st.cleared[boss.id];
    st.cleared[boss.id] = (st.cleared[boss.id] || 0) + 1;
    const d = djState();
    // First clear grants someone you do NOT already have, at the obstacle's
    // tier or the best below it — a reward you already own is not a reward.
    const pick = first ? firstUnownedAtOrBelow(boss.rewardTier) : null;
    if (pick) {
      d.owned[pick] = 1;
      d.seen[pick] = Date.now();
      bt.rewarded = pick;
    } else {
      d.refunded = (d.refunded || 0) + 60;      // repeat clears pay a little ki
      bt.rewarded = null;
    }
    save();
    if (S.settings.fxLevel !== 'off') {
      try { Sfx.play('big'); FX.rain({ count: 60, avoidCenter: true }); } catch (e) { /* optional */ }
    }
  }
  render();
}

/* Someone new at this tier, or the best tier below it that still has someone
   left. Returns null only when the collection is already complete. */
function firstUnownedAtOrBelow(tier) {
  const d = djState();
  const start = Math.max(0, DJ_RARITY_ORDER.indexOf(tier));
  for (let i = start; i >= 0; i--) {
    const pool = DJ_ROSTER.filter(c => c.r === DJ_RARITY_ORDER[i] && !d.owned[c.id]);
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)].id;
  }
  for (let i = start + 1; i < DJ_RARITY_ORDER.length; i++) {
    const pool = DJ_ROSTER.filter(c => c.r === DJ_RARITY_ORDER[i] && !d.owned[c.id]);
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)].id;
  }
  return null;
}

/* ---------- views ---------- */
function renderBossPick() {
  const roster = battleRoster();
  const bonus = Math.round(studyBonus() * 100);
  const st = bossState();
  if (!roster.length) {
    return `<div class="card dj-empty">
      <h2>Nobody to send yet</h2>
      <p class="sub">Open a pack first — your class is who shows up.</p>
    </div>`;
  }
  const cards = BOSS_ROSTER.map(b => {
    const unlocked = bossIsUnlocked(b.id);
    const clears = st.cleared[b.id] || 0;
    return `<div class="bt-card${unlocked ? '' : ' locked'}" style="--bc:${b.tint}">
      <div class="bt-card-art">${unlocked ? bossSvg(b) : '<div class="dj-unknown" aria-hidden="true">?</div>'}</div>
      <div class="bt-card-body">
        <div class="bt-card-name">${esc(b.name)} <span class="ko faint">${esc(b.ko)}</span>${
          S.settings.showRomanization ? ` <i class="dj-rom">${esc(b.rom)}</i>` : ''}</div>
        <div class="bt-card-blurb">${unlocked ? esc(b.blurb) : 'Clear the one before it first.'}</div>
        ${unlocked ? `<div class="bt-card-meta">${b.hp} health · hits for ${b.atk}${clears ? ` · cleared ${clears}×` : ''}</div>` : ''}
      </div>
      ${unlocked ? `<button class="btn primary bt-go" data-boss="${esc(b.id)}">Face it</button>` : ''}
    </div>`;
  }).join('');
  return `<div class="card">
    <h2>The obstacle course</h2>
    <p class="sub">Your whole class walks onto the mat — six at a time, the rest tagging in as people tire.
    Rarer students hit harder and last longer, and <b>${bonus}% of your damage comes from what you have actually mastered</b>.
    Losing costs nothing at all: no entry fee, nobody lost, retry as often as you like.</p>
    <p class="sub faint">These are not people. They are the things that actually beat martial artists —
    and beating one is never a rank.</p>
  </div>
  <div class="bt-list">${cards}</div>`;
}

/* One figure's insides. Shared by the first render and by a tag-in, so the
   swapped-in student is built exactly the same way. */
function btFigInner(u, hp) {
  const c = DJ_BY_ID[u.id];
  const frac = Math.max(0, Math.min(1, hp / u.max)) * 100;
  return `<div class="bt-figwrap"><div class="bt-figart">${c ? djCharSvg(c, { cls: 'bt-char' }) : ''}</div></div>
    <div class="bt-fighp" style="--rc:${DJ_RARITY[u.r].c}"><i style="width:${frac}%"></i></div>`;
}

/* The readable half. The scene shows who is where; this says who they are and
   how they are doing, because six 38px bars cannot carry a name. */
function btUnitRow(u, hp) {
  return `<div class="bt-unit${hp <= 0 ? ' down' : ''}" data-bur="${esc(u.id)}" style="--rc:${DJ_RARITY[u.r].c}">
    <div class="bt-uname"><span class="bt-un">${esc(u.name)}</span>${djRarityTag(u.r, true)}</div>
    <div class="bt-uhp"><i style="width:${Math.max(0, Math.min(1, hp / u.max)) * 100}%"></i></div>
    <div class="bt-ustate">${hp <= 0 ? 'catching their breath' : hp + ' / ' + u.max}</div>
  </div>`;
}

function renderBattle() {
  const b = bt.boss;
  const units = bt.active.map(id => bt.roster.find(u => u.id === id)).filter(Boolean);
  const bench = bt.roster.filter(u => bt.active.indexOf(u.id) < 0 && bt.live[u.id] > 0).length;
  const done = bt.done;
  const won = done && bt.sim.win;
  const rom = S.settings.showRomanization;

  const figs = units.map((u, slot) => {
    const p = BT_SLOTS[slot] || BT_SLOTS[0];
    const hp = bt.live[u.id];
    return `<div class="bt-fig${hp <= 0 ? ' down' : ''}" data-bu="${esc(u.id)}" data-slot="${slot}" data-z="${p.z}"
      style="left:${p.x}%;bottom:${p.b}px;--s:${p.s};--idle:${(slot * 0.34).toFixed(2)}s;z-index:${p.z}">${btFigInner(u, hp)}</div>`;
  }).join('');

  return `<div class="card bt-wrap">
    <div class="bt-scene" id="bt-arena" role="img"
         aria-label="Your class facing ${esc(b.name)} on the mat">
      <div class="bt-wall"><span class="dj-scroll ko" aria-hidden="true">수련</span></div>
      <div class="bt-hud">
        <div class="bt-hud-name">${esc(b.name)} <span class="ko">${esc(b.ko)}</span>${
          rom ? ` <i class="dj-rom">${esc(b.rom)}</i>` : ''}</div>
        <div class="bt-bosshp"><i style="width:${Math.max(0, bt.bossHp / b.hp) * 100}%"></i></div>
        <div class="bt-bosshp-num">${Math.max(0, bt.bossHp)} / ${b.hp}</div>
      </div>
      <div class="bt-banner" aria-hidden="true"></div>
      ${figs}
      <div class="bt-bosschar" style="--bc:${b.tint}">${bossSvg(b)}</div>
    </div>
    <p class="bt-say sr-only" aria-live="polite"></p>
    <div class="bt-units">${units.map(u => btUnitRow(u, bt.live[u.id])).join('')}</div>
    <div class="bt-bench faint">${bench ? bench + ' more waiting to tag in' : 'nobody left on the bench'}</div>
    ${done ? `<div class="bt-result ${won ? 'win' : 'lose'}">
      <b>${won ? esc(b.name) + ' is done for today.' : 'Not this time.'}</b>
      <div class="sub">${won
        ? (bt.rewarded
            ? `${esc((DJ_BY_ID[bt.rewarded] || {}).name || 'Someone new')} saw it happen and joined your dojang.`
            : 'Cleared again — 60 기 for the trouble.')
        : 'Everyone is fine — they sat down, not out. Collect a few more students, master a bit more, and walk back in. Nothing was lost.'}</div>
      <div class="row" style="margin-top:10px">
        <button class="btn primary" data-boss="${esc(b.id)}">Go again</button>
        <button class="btn ghost" data-dj="tab-battle">Back to the list</button>
      </div>
    </div>` : `<div class="row bt-running">
      <span class="faint">Round ${bt.round || 1}…</span>
      <button class="btn ghost sm" data-bt="skip">Skip to the result</button>
    </div>`}
  </div>`;
}

/* Debug/test handles — declared here for the same TDZ reason as part6's. */
Object.assign(window.__HKD, {
  BOSS_ROSTER, BOSS_BY_ID, BOSS_UNIT, BT_ACTIVE, BT_SLOTS,
  bossState, bossIsUnlocked, bossUnlockedIndex, studyBonus,
  battleRoster, simulateBattle, buildBeats, startBattle, finishBattle, btSkip
});
Object.defineProperty(window.__HKD, 'bt', {
  get() { return bt; }, set(v) { bt = v; }, configurable: true
});

document.addEventListener('click', e => {
  const t = e.target.closest('[data-bt]');
  if (!t) return;
  if (t.dataset.bt === 'skip') btSkip();
});
