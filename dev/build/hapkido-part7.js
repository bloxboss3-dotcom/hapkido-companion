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
      log.push({ t: 'hit', unit: u.id, dmg, bossHp });
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
      log.push({ t: 'boss', unit: target.id, dmg, hp: target.hp });
      if (target.hp <= 0) {
        log.push({ t: 'down', unit: target.id });
        const next = bench.shift();
        if (next) {
          const slot = active.indexOf(target);
          active[slot] = next;
          log.push({ t: 'tagin', unit: next.id, replaces: target.id, hp: next.hp, max: next.max });
        }
      }
    }
    if (!active.some(u => u.hp > 0)) break;
  }
  log.push({ t: 'lose', round });
  return { log, win: false, round, bossHp };
}

/* ---------- battle state + playback ---------- */
let bt = null;              // { boss, roster, sim, i, done, live:{id:hp}, bossHp }
let btTimers = [];
function btClear() { btTimers.forEach(clearTimeout); btTimers = []; }

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
         active: roster.slice(0, BT_ACTIVE).map(u => u.id), rewarded: null };
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
  const log = bt.sim.log;
  if (btInstant()) { bt.i = log.length; applyBattleEvents(log); finishBattle(); return; }
  const step = Math.max(90, Math.min(280, Math.round(3400 / Math.max(1, log.length))));
  const tick = () => {
    if (!bt || bt.i >= log.length) { finishBattle(); return; }
    const ev = log[bt.i++];
    applyBattleEvents([ev]);
    paintBattleEvent(ev);
    btTimers.push(setTimeout(tick, step));
  };
  btTimers.push(setTimeout(tick, 420));
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

/* Direct DOM updates rather than a re-render, so CSS animations survive. */
function paintBattleEvent(ev) {
  const arena = document.getElementById('bt-arena');
  if (!arena) return;
  const bossEl = arena.querySelector('.bt-boss');
  const setBar = (el, frac) => { if (el) el.style.width = Math.max(0, Math.min(1, frac)) * 100 + '%'; };

  if (ev.t === 'hit') {
    const u = arena.querySelector(`[data-bu="${ev.unit}"]`);
    if (u) { u.classList.remove('lunge'); void u.offsetWidth; u.classList.add('lunge'); }
    if (bossEl) { bossEl.classList.remove('shake'); void bossEl.offsetWidth; bossEl.classList.add('shake'); }
    setBar(arena.querySelector('.bt-bosshp i'), bt.bossHp / bt.boss.hp);
    const n = arena.querySelector('.bt-bosshp-num');
    if (n) n.textContent = bt.bossHp + ' / ' + bt.boss.hp;
    floatNum(bossEl, '-' + ev.dmg, 'dmg');
  } else if (ev.t === 'boss') {
    const u = arena.querySelector(`[data-bu="${ev.unit}"]`);
    if (u) {
      u.classList.remove('hurt'); void u.offsetWidth; u.classList.add('hurt');
      const unit = bt.roster.find(x => x.id === ev.unit);
      setBar(u.querySelector('.bt-uhp i'), unit ? ev.hp / unit.max : 0);
      floatNum(u, '-' + ev.dmg, 'dmg');
    }
    if (bossEl) { bossEl.classList.remove('boss-lunge'); void bossEl.offsetWidth; bossEl.classList.add('boss-lunge'); }
  } else if (ev.t === 'down') {
    const u = arena.querySelector(`[data-bu="${ev.unit}"]`);
    if (u) { u.classList.add('down'); const s = u.querySelector('.bt-ustate'); if (s) s.textContent = 'catching their breath'; }
  } else if (ev.t === 'tagin') {
    render();                          // a new face on the mat needs real markup
  }
}

function floatNum(host, text, cls) {
  if (!host) return;
  const s = document.createElement('span');
  s.className = 'bt-float ' + (cls || '');
  s.textContent = text;
  host.appendChild(s);
  setTimeout(() => s.remove(), 900);
}

function finishBattle() {
  if (!bt || bt.done) return;
  bt.done = true;
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
  const cards = BOSS_ROSTER.map((b, i) => {
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
    <p class="sub">Your whole class goes in — six on the mat, the rest tag in as people tire.
    Rarer students hit harder and last longer, and <b>${bonus}% of your damage comes from what you have actually mastered</b>.
    Losing costs nothing at all: no entry fee, nobody lost, retry as often as you like.</p>
    <p class="sub faint">These are not people. They are the things that actually beat martial artists —
    and beating one is never a rank.</p>
  </div>
  <div class="bt-list">${cards}</div>`;
}

function renderBattle() {
  const b = bt.boss;
  const bossFrac = bt.bossHp / b.hp;
  const activeIds = bt.active;
  const units = activeIds.map(id => bt.roster.find(u => u.id === id)).filter(Boolean);
  const bench = bt.roster.filter(u => activeIds.indexOf(u.id) < 0 && bt.live[u.id] > 0).length;
  const done = bt.done;
  const won = done && bt.sim.win;

  const rows = units.map(u => {
    const hp = bt.live[u.id];
    const c = DJ_BY_ID[u.id];
    return `<div class="bt-unit${hp <= 0 ? ' down' : ''}" data-bu="${esc(u.id)}" style="--rc:${DJ_RARITY[u.r].c}">
      <div class="bt-uart">${c ? djCharSvg(c) : ''}</div>
      <div class="bt-ubody">
        <div class="bt-uname"><span class="bt-un">${esc(u.name)}</span>${djRarityTag(u.r, true)}</div>
        <div class="bt-uhp"><i style="width:${Math.max(0, hp / u.max) * 100}%"></i></div>
        <div class="bt-ustate">${hp <= 0 ? 'catching their breath' : hp + ' / ' + u.max}</div>
      </div>
    </div>`;
  }).join('');

  return `<div class="card bt-arena" id="bt-arena">
    <div class="bt-bosswrap">
      <div class="bt-boss" style="--bc:${b.tint}">${bossSvg(b)}</div>
      <div class="bt-bossname">${esc(b.name)} <span class="ko faint">${esc(b.ko)}</span></div>
      <div class="bt-bosshp"><i style="width:${Math.max(0, bossFrac) * 100}%"></i></div>
      <div class="bt-bosshp-num">${Math.max(0, bt.bossHp)} / ${b.hp}</div>
      <div class="bt-bossline faint">${esc(b.line)}</div>
    </div>
    <div class="bt-units">${rows}</div>
    ${bench ? `<div class="bt-bench faint">${bench} more waiting to tag in</div>` : ''}
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
    </div>` : `<div class="bt-running faint">fighting…</div>`}
  </div>`;
}

/* Debug/test handles — declared here for the same TDZ reason as part6's. */
Object.assign(window.__HKD, {
  BOSS_ROSTER, BOSS_BY_ID, BOSS_UNIT, BT_ACTIVE,
  bossState, bossIsUnlocked, bossUnlockedIndex, studyBonus,
  battleRoster, simulateBattle, startBattle, finishBattle
});
Object.defineProperty(window.__HKD, 'bt', {
  get() { return bt; }, set(v) { bt = v; }, configurable: true
});
