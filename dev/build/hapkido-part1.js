/* ================================================================
   HAPKIDO LAYER — catalogue, safety, readiness, milestones
   ----------------------------------------------------------------
   Everything below either ADDS hapkido-specific machinery or
   OVERRIDES a Hanbit function by redeclaring it (function
   declarations later in the file win). The FSRS scheduler, FX,
   mascot, storage, and session engine above are untouched.
   ================================================================ */

const DAY = 86400000;
const STORE_KEY = 'lmaa-hapkido.v1';

/* ---------- catalogue: flatten CURRICULUM into ITEMS/SEQUENCE ---------- */
const BELTS = (window.CURRICULUM && CURRICULUM.belts) || [];
const BELT_BY_ID = {}; BELTS.forEach(b => BELT_BY_ID[b.id] = b);
const DOMAIN_BY_ID = {}; ((window.CURRICULUM && CURRICULUM.domains) || []).forEach(d => DOMAIN_BY_ID[d.id] = d);
const UNIT_BY_ID = {}; BELTS.forEach(b => (b.units || []).forEach(u => UNIT_BY_ID[u.id] = Object.assign({ beltId: b.id }, u)));

const ITEMS = {};
const SEQUENCE = [];
((window.CURRICULUM && CURRICULUM.items) || []).forEach(raw => {
  if (ITEMS[raw.id]) return;
  const item = Object.assign({}, raw);
  item.name = item.nameEnglish || item.en || item.id;
  item.en = item.en || item.nameEnglish || '';
  item.ko = item.ko || item.nameHangul || '';
  item.rom = item.rom || item.romanization || '';
  const u = UNIT_BY_ID[item.unit];
  item.unitTitle = u ? u.title : '';
  const b = BELT_BY_ID[item.beltId];
  item.beltOrder = b ? b.order : 999;
  ITEMS[item.id] = item;
  SEQUENCE.push(item.id);
});

/* Hangul → romanization lookup, so romanization can follow Korean text
   everywhere (MC options, reveals, banners) while the toggle is on. */
const KO_ROM = {};
SEQUENCE.forEach(id => { const it = ITEMS[id]; if (it.ko && it.rom) KO_ROM[it.ko] = it.rom; });
BELTS.forEach(b => { if (b.nameKorean && b.rom) KO_ROM[b.nameKorean] = b.rom; });
const SAY_ROM = {
  '잘했어요': 'jal-hae-sseo-yo', '좋아요': 'jo-a-yo', '맞아요': 'ma-ja-yo',
  '완벽해요': 'wan-byeok-hae-yo', '완벽': 'wan-byeok', '최고예요': 'choe-go-ye-yo',
  '대박': 'dae-bak', '불이야': 'bul-i-ya', '수고했어요': 'su-go-hae-sseo-yo',
  '괜찮아요': 'gwaen-chan-a-yo', '다시': 'da-si', '정확해요': 'jeong-hwak-hae-yo',
  '빨라요': 'ppal-la-yo', '들었어요': 'deul-eo-sseo-yo'
};
function romFor(text) {
  if (!S || !S.settings.showRomanization || !text) return '';
  const base = String(text).replace(/[!?.…~]/g, '').trim();
  return SAY_ROM[base] || KO_ROM[base] || '';
}

/* ---------- ladders per kind (knowledge rungs only — physical
   practice and instructor verification are NOT FSRS cards) ---------- */
function ladderFor(item) {
  if (item.kind === 'term') return item.ko ? ['recog', 'listen', 'recallKO', 'speak'] : ['recog'];
  if (item.kind === 'concept') {
    const q = item.quiz || {};
    const l = ['c-recog', 'c-example', 'c-unsafe', 'c-scenario'].filter(s => q[s.slice(2)]);
    return l.length ? l : ['c-recog'];   // recog falls back to key points if no quiz authored
  }
  if (item.kind === 'technique') {
    const l = ['t-id'];
    if (item.attackOrGrab || item.startingPosition) l.push('t-situation');
    if ((item.stepSequence || []).length >= 3) l.push('t-steps');
    if ((item.commonErrors || []).length && (item.keyDetails || []).length >= 2) l.push('t-error');
    if ((item.keyDetails || []).length && (item.commonErrors || []).length) l.push('t-points');
    return l;
  }
  return ['recog'];
}

const SKILL_LABEL = {
  recog: 'Meaning', listen: 'By ear', recallKO: 'Korean term', speak: 'Say it in Korean',
  'c-recog': 'Recognize it', 'c-example': 'Pick the example', 'c-unsafe': 'Spot the unsafe call', 'c-scenario': 'Apply it',
  't-id': 'Name the technique', 't-situation': 'Read the situation', 't-steps': 'Order the steps',
  't-error': 'Spot the mistake', 't-points': 'Key points'
};

/* ---------- safety classifications ---------- */
const SAFETY_META = {
  knowledgeOnly:                { label: 'Knowledge only',                  cls: '' },
  soloSafe:                     { label: 'Solo practice OK',                cls: 'mast' },
  partnerWithCare:              { label: 'Partner drills — in class',      cls: 'restrict' },
  instructorSupervisionRequired:{ label: 'Instructor supervision required', cls: 'restrict' },
  academyOnly:                  { label: 'Academy only',                    cls: 'restrict' },
  restrictedByAge:              { label: 'Age-restricted',                  cls: 'restrict' }
};
function isRestricted(item) {
  return ['partnerWithCare', 'instructorSupervisionRequired', 'academyOnly', 'restrictedByAge'].includes(item.safetyClass);
}
function canPractice(item) {
  return !!(item.practiceAssignment && (item.practiceAssignment.items || []).length &&
    ['soloSafe', 'knowledgeOnly'].includes(item.safetyClass));
}

/* ---------- belt helpers ---------- */
function activeBelt() { return BELT_BY_ID[S.settings.activeBeltId] || BELTS[0]; }
function beltItems(beltId, includeOptional) {
  return SEQUENCE.filter(id => ITEMS[id].beltId === beltId && (includeOptional || !ITEMS[id].optional));
}
function knowledgeMastered(item) {
  const l = ladderFor(item);
  return l.length > 0 && l.every(sk => isHolding(S.cards[ck(item.id, sk)]));
}
function itemStatus(item) {
  if (item.kind === 'technique' && S.verifications[item.id]) return 'verified';
  if (knowledgeMastered(item)) return (item.kind === 'technique' && item.instructorRequired) ? 'ready' : 'mastered';
  if (S.introduced[item.id]) return 'learning';
  return 'new';
}
const STATUS_META = {
  new:      { l: 'Not started',                 cls: '' },
  learning: { l: 'Learning',                    cls: 'learn' },
  mastered: { l: 'Knowledge mastered',          cls: 'mast' },
  ready:    { l: 'Ready to practice in class',  cls: 'ready' },
  verified: { l: 'Instructor verified',         cls: 'ver' }
};

/* One belt's five readiness measures. Never collapsed to one number. */
function beltStats(belt) {
  const now = Date.now();
  const ids = beltItems(belt.id, false);
  const practiced = new Set(S.practiceLog.map(p => p.itemId));
  let intro = 0, mastered = 0, rsum = 0, rcount = 0,
      practicable = 0, practicedN = 0, vreq = 0, vdone = 0;
  ids.forEach(id => {
    const it = ITEMS[id];
    if (S.introduced[id]) intro++;
    if (knowledgeMastered(it)) mastered++;
    ladderFor(it).forEach(sk => {
      const c = S.cards[ck(id, sk)];
      if (c && c.state !== 'new') { rsum += currentR(c, now); rcount++; }
    });
    if (canPractice(it)) { practicable++; if (practiced.has(id)) practicedN++; }
    if (it.kind === 'technique' && it.instructorRequired) { vreq++; if (S.verifications[id]) vdone++; }
  });
  return { total: ids.length, intro, mastered, retention: rcount ? rsum / rcount : null,
           practicable, practiced: practicedN, vreq, vdone };
}
function cumulativeStats(belt) {
  const prev = BELTS.filter(b => b.order < belt.order);
  const agg = { total: 0, intro: 0, mastered: 0, vreq: 0, vdone: 0 };
  prev.forEach(b => { const s = beltStats(b);
    agg.total += s.total; agg.intro += s.intro; agg.mastered += s.mastered;
    agg.vreq += s.vreq; agg.vdone += s.vdone; });
  return agg;
}

/* ---------- belt gating: schedule only your belt and below.
   FSRS never unlocks a belt, and never unlocks physical practice. */
function eligibleSequence() {
  const ab = activeBelt();
  return SEQUENCE.filter(id => ITEMS[id].beltOrder <= ab.order);
}

/* ---------- milestones (hapkido) ---------- */
const KNOW_MILESTONES = [5, 15, 30, 50, 80, 120];
function checkMilestones(key, before, after) {
  const item = cardItem(key);
  if (!item) return;
  const label = item.ko || item.name || '';

  if (before && before.S && before.S < 21 && after.S >= 21) {
    const r = item.ko && item.rom ? item.rom + ' · ' : '';
    sess.celebrations.push({ title: label, sub: r + 'locked into long-term memory', ko: !!item.ko, big: false });
  }

  const held = stats().wordsKnown;
  for (const m of KNOW_MILESTONES) {
    if (held >= m && !S.milestones['k' + m]) {
      S.milestones['k' + m] = Date.now();
      sess.celebrations.push({ title: m + ' ITEMS', sub: 'holding in long-term memory', big: m >= 30 });
      break;
    }
  }

  if (item.kind === 'technique' && !S.milestones['tk:' + item.id] && knowledgeMastered(item)) {
    S.milestones['tk:' + item.id] = Date.now();
    sess.celebrations.push({
      title: 'KNOWLEDGE MASTERED',
      sub: item.name + (item.instructorRequired ? ' — now show it in class' : ''), big: false });
  }

  if (item.unit && !S.milestones['u' + item.unit]) {
    const ids = SEQUENCE.filter(id => ITEMS[id].unit === item.unit);
    if (ids.length && ids.every(id => S.introduced[id])) {
      S.milestones['u' + item.unit] = Date.now();
      sess.celebrations.push({ title: 'UNIT COMPLETE', sub: item.unitTitle || '', big: true });
    }
  }

  const belt = BELT_BY_ID[item.beltId];
  if (belt && !S.milestones['b' + belt.id]) {
    const bs = beltStats(belt);
    if (bs.total && bs.mastered === bs.total) {
      S.milestones['b' + belt.id] = Date.now();
      sess.celebrations.push({
        title: belt.nameEnglish.toUpperCase() + ' · KNOWLEDGE COMPLETE',
        sub: 'every requirement mastered — polish it in class', big: true });
    }
  }
}

/* ---------- settings & state shape ---------- */
function normalizeSettings() {
  Object.keys(SETTING_BOUNDS).forEach(k => {
    const [lo, hi] = SETTING_BOUNDS[k];
    const n = Number(S.settings[k]);
    S.settings[k] = Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : DEFAULTS.settings[k];
  });
  if (S.settings.theme !== 'light') S.settings.theme = 'dark';
  S.settings.showRomanization = !!S.settings.showRomanization;
  if (typeof S.settings.ttsVoice !== 'string') S.settings.ttsVoice = '';
  if (!['full', 'subtle', 'off'].includes(S.settings.fxLevel)) S.settings.fxLevel = 'full';
  const vol = Number(S.settings.volume);
  S.settings.volume = Number.isFinite(vol) ? Math.min(1, Math.max(0, vol)) : 0.5;
  ['sound', 'spokenPraise'].forEach(k => { S.settings[k] = !!S.settings[k]; });
  if (!S.milestones || typeof S.milestones !== 'object') S.milestones = {};
  if (!BELT_BY_ID[S.settings.activeBeltId]) S.settings.activeBeltId = BELTS.length ? BELTS[0].id : '';
  if (!Array.isArray(S.practiceLog)) S.practiceLog = [];
  if (!S.verifications || typeof S.verifications !== 'object') S.verifications = {};
  if (!S.instructor || typeof S.instructor !== 'object') S.instructor = { pinHash: null, log: [] };
  if (!Array.isArray(S.instructor.log)) S.instructor.log = [];
  S.verifySeen = Number(S.verifySeen) || 0;
  // Curriculum version stamp: cards for removed items retire via dueCards();
  // verifications keep the version they were granted under.
  S.curriculumVersion = CURRICULUM.meta.version;
}

/* ---------- two tracks: Knowledge & Customs vs. Techniques ----------
   Driven by domain.track in the curriculum data — fully configurable. */
function itemTrack(item) {
  const d = DOMAIN_BY_ID[item.domain];
  return d && d.track === 'technique' ? 'technique' : 'knowledge';
}
function unitTrack(u) {
  const ids = SEQUENCE.filter(id => ITEMS[id].unit === u.id);
  return ids.some(id => itemTrack(ITEMS[id]) === 'technique') ? 'technique' : 'knowledge';
}

function nextNewItems(n, track) {
  const out = [];
  const seq = eligibleSequence();
  for (const id of seq) {
    if (out.length >= n) break;
    if (S.introduced[id]) continue;
    if (track && itemTrack(ITEMS[id]) !== track) continue;
    out.push(id);
  }
  return out;
}

function plan(track) {
  unlockSkills();
  const now = Date.now();
  let due = dueCards(now);
  if (track) due = due.filter(k => { const it = cardItem(k); return it && itemTrack(it) === track; });
  const rec = dayRec(todayKey());
  const newSlots = Math.max(0, S.settings.dailyNew - rec.newItems);
  const newIds = nextNewItems(newSlots, track);
  return {
    due: due.slice(0, S.settings.reviewCap),
    dueTotal: due.length,
    newIds,
    remainingInCourse: eligibleSequence().filter(id => !S.introduced[id] && (!track || itemTrack(ITEMS[id]) === track)).length
  };
}

function startSession(track) {
  const p = plan(track);
  const steps = [];
  p.due.forEach(k => steps.push({ t: 'card', key: k }));
  shuffle(steps);

  const teach = p.newIds.map(id => ({ t: 'teach', id }));
  const merged = [];
  if (teach.length === 0) {
    merged.push(...steps);
  } else {
    const gap = Math.max(1, Math.floor(steps.length / teach.length) || 1);
    let si = 0, ti = 0;
    while (si < steps.length || ti < teach.length) {
      for (let g = 0; g < gap && si < steps.length; g++) merged.push(steps[si++]);
      if (ti < teach.length) merged.push(teach[ti++]);
    }
  }

  if (!merged.length) {
    view = 'today'; sess = null;
    showToast(track ? 'Nothing is due on that track right now.' : 'Nothing is due right now.');
    render();
    return;
  }

  cancelFx();
  resetTransient();
  sess = {
    queue: merged, pos: 0, combo: 0, bestCombo: 0, lastTier: 0,
    justMissed: false, pendingFx: null, celebrations: [],
    started: Date.now(), answered: 0, correct: 0,
    againKeys: new Set(), newSeen: 0,
    plannedNew: p.newIds.length, plannedReviews: p.due.length,
    reveal: null, lastGradeKey: null,
    budgetMs: S.settings.sessionMinutes * 60000, overtime: false,
    track: track || null
  };
  view = 'session';
  render();
}

/* ---------- stats (Hanbit's, with hapkido item kinds) ---------- */
function stats() {
  const now = Date.now();
  const keys = Object.keys(S.cards).filter(k => ITEMS[k.split('|')[0]]);
  let learning = 0, young = 0, mature = 0, rsum = 0, rcount = 0;
  keys.forEach(k => {
    const c = S.cards[k];
    if (c.state === 'new') { learning++; return; }
    const s = c.S || 0;
    if (s >= 21) mature++; else if (s >= 3) young++; else learning++;
    rsum += currentR(c, now); rcount++;
  });

  const eligible = new Set(eligibleSequence());
  const introducedItems = Object.keys(S.introduced).filter(id => ITEMS[id] && eligible.has(id));
  const wordsKnown = introducedItems.filter(id => {
    const it = ITEMS[id];
    if (!['term', 'concept', 'technique'].includes(it.kind)) return false;
    const first = ladderFor(it)[0];
    const c = S.cards[ck(id, first)];
    return c && c.state !== 'new' && (c.S || 0) >= 3;
  }).length;

  let correct = 0, total = 0;
  Object.keys(S.days).forEach(k => { correct += S.days[k].correct; total += S.days[k].total; });
  const recent = S.log.filter(l => l.counted && l.t > now - 30 * DAY);
  let rcorrect = 0, rtotal = 0;
  recent.forEach(l => { const c = S.cards[l.key]; if (!c) return; rtotal++; if (l.grade > 1) rcorrect++; });

  const forecast = [];
  for (let d = 0; d < 14; d++) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const from = start.getTime() + d * DAY, to = from + DAY;
    let n = 0;
    keys.forEach(k => { const c = S.cards[k]; if (c.state !== 'new' && c.due >= (d === 0 ? 0 : from) && c.due < to) n++; });
    forecast.push(n);
  }

  let streak = 0, misses = 0;
  for (let d = 0; d < 400; d++) {
    const k = dayKeyBack(d);
    const rec = S.days[k];
    const studied = rec && rec.reviews > 0;
    if (studied) { streak++; misses = 0; }
    else if (d === 0) { /* today is not over yet */ }
    else { misses++; if (misses > 2) break; }
  }

  const timeToday = (S.days[todayKey()] || {}).ms || 0;
  let totalMs = 0; Object.keys(S.days).forEach(k => totalMs += S.days[k].ms || 0);

  return {
    learning, young, mature, cards: keys.length,
    predictedR: rcount ? rsum / rcount : 0,
    measuredR: rtotal ? rcorrect / rtotal : (total ? correct / total : 0),
    reviewsAll: total, wordsKnown,
    introduced: introducedItems.length,
    courseTotal: eligibleSequence().length,
    forecast, streak, timeToday, totalMs
  };
}
