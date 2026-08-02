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

/* ---------- courses: two separate schools of study ----------------
   Data-driven from CURRICULUM.courses. A course is to this app what a
   language is to a language app: its own path, its own daily budget,
   its own colour, its own celebrations. The belt is shared, because
   the belt is the school's — not the app's. */
const COURSES = ((window.CURRICULUM && CURRICULUM.courses) || [])
  .slice().sort((a, b) => (a.order || 0) - (b.order || 0));
const COURSE_BY_ID = {}; COURSES.forEach(c => COURSE_BY_ID[c.id] = c);
const COURSE_BY_TRACK = {}; COURSES.forEach(c => { if (!COURSE_BY_TRACK[c.track]) COURSE_BY_TRACK[c.track] = c; });

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
    // Last rung, and the only one that asks the student to PRODUCE rather than
    // recognise. Four of the rungs above are multiple choice; inducing
    // self-explanation is one of the better-evidenced things a study tool can
    // do (Bisra et al. 2018 meta, g≈0.55 over 64 studies, and it holds for
    // procedural knowledge, not just facts). Costs no new content — it grades
    // against keyDetails, which every technique already has.
    if ((item.keyDetails || []).length >= 2) l.push('t-explain');
    return l;
  }
  return ['recog'];
}

/* ---------- how much of an item each rung is worth ----------
   Rungs are not equal work. Ordering the steps means reading every step,
   finding each in a shuffled pool and placing them — several times the effort
   of a four-option recognition question, and the exercise students feel the
   cost of. Weighting it as one-of-five made the longest drill in the app look
   like the cheapest.

   Spotting mistakes and key points sit in between: real recall, less reading.
   Everything else defaults to 1. On a full technique ladder this puts
   sequencing at ~44% — by far the largest single slice, without letting one
   drill outweigh safety recognition and the key points combined. */
const SKILL_WEIGHT = { 't-steps': 4, 't-explain': 2.5, 't-error': 1.5, 't-points': 1.5 };
const skillWeight = sk => SKILL_WEIGHT[sk] || 1;

/* A rung's completion, 0..1. Half credit at most until the card actually
   holds, so the bar moves while you work without ever claiming you are done
   before the scheduler agrees. */
function rungProgress(card) {
  if (!card || card.state === 'new') return 0;
  if (isHolding(card)) return 1;
  const toward = Math.min(1, Math.min((card.reps || 0) / 2, (card.S || 0) / 3));
  return 0.5 * Math.max(0, toward);
}

/* Weighted share of one rung within its item, 0..1 (for "this drill is 44%
   of this technique"). */
function skillShare(item, skill) {
  const l = ladderFor(item);
  const total = l.reduce((n, sk) => n + skillWeight(sk), 0);
  return total && l.includes(skill) ? skillWeight(skill) / total : 0;
}

/* How far through an item's knowledge you are, weighted by rung effort.
   Reports preparation only — it never awards rank and never unlocks
   physical practice. */
function itemProgress(item) {
  const l = ladderFor(item);
  let done = 0, total = 0;
  l.forEach(sk => {
    const w = skillWeight(sk);
    total += w;
    done += w * rungProgress(S.cards[ck(item.id, sk)]);
  });
  return total ? done / total : 0;
}

const SKILL_LABEL = {
  recog: 'Meaning', listen: 'By ear', recallKO: 'Korean term', speak: 'Say it in Korean',
  'c-recog': 'Recognize it', 'c-example': 'Pick the example', 'c-unsafe': 'Spot the unsafe call', 'c-scenario': 'Apply it',
  't-id': 'Name the technique', 't-situation': 'Read the situation', 't-steps': 'Order the steps',
  't-error': 'Spot the mistake', 't-points': 'Key points', 't-explain': 'Explain it yourself'
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

/* One belt's five readiness measures. Never collapsed to one number.
   Pass a course to measure only that course's half of the belt. */
function beltStats(belt, courseSel) {
  const now = Date.now();
  const course = asCourse(courseSel);
  const ids = beltItems(belt.id, false).filter(id => !course || courseIdOf(ITEMS[id]) === course.id);
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
function cumulativeStats(belt, courseSel) {
  const prev = BELTS.filter(b => b.order < belt.order);
  const agg = { total: 0, intro: 0, mastered: 0, vreq: 0, vdone: 0 };
  prev.forEach(b => { const s = beltStats(b, courseSel);
    agg.total += s.total; agg.intro += s.intro; agg.mastered += s.mastered;
    agg.vreq += s.vreq; agg.vdone += s.vdone; });
  return agg;
}

/* ---------- belt gating: schedule only your belt and below.
   FSRS never unlocks a belt, and never unlocks physical practice. */
/* ---------- focus: skip what you are not working on right now ----------
   A student mid-belt often wants to drill locks and grabs and leave the
   stances alone for a fortnight. Muting keeps those items out of scheduling
   without touching a single card — nothing is deleted, and unmuting brings
   the item straight back with its history intact.

   What muting deliberately does NOT do is move the belt. beltStats() reads
   beltItems(), never eligibleSequence(), so the five readiness measures keep
   counting the whole belt whether you are studying it or not. That is the
   point: skipping the front kick is a study choice, but Grandmaster Lee still
   tests the front kick, and an app that reported you "ready" because you had
   hidden half the syllabus would be lying about the only thing it exists to
   report. The Settings copy says so out loud. */
function isMuted(item) {
  if (!item) return false;
  const s = S.settings;
  return (s.mutedItems || []).indexOf(item.id) >= 0 ||
         (s.mutedDomains || []).indexOf(item.domain) >= 0;
}
function mutedCount() { return SEQUENCE.filter(id => isMuted(ITEMS[id])).length; }
function setMuted(kind, key, on) {
  const s = S.settings;
  const listName = kind === 'domain' ? 'mutedDomains' : 'mutedItems';
  const list = (s[listName] || []).slice();
  const at = list.indexOf(key);
  if (on && at < 0) list.push(key);
  if (!on && at >= 0) list.splice(at, 1);
  s[listName] = list;
  save();
}

function eligibleSequence(courseSel) {
  const ab = activeBelt();
  const course = asCourse(courseSel);
  return SEQUENCE.filter(id => ITEMS[id].beltOrder <= ab.order &&
    (!course || courseIdOf(ITEMS[id]) === course.id) &&
    !isMuted(ITEMS[id]));
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

  // Milestones are counted per course, so each one gets its own journey.
  const course = courseOf(item);
  const held = stats(course).wordsKnown;
  const mkey = course ? 'k:' + course.id + ':' : 'k';
  for (const m of KNOW_MILESTONES) {
    if (held >= m && !S.milestones[mkey + m]) {
      S.milestones[mkey + m] = Date.now();
      sess.celebrations.push({
        title: m + ' ITEMS',
        sub: 'holding in ' + (course ? course.nameEnglish.toLowerCase() : 'long-term memory'), big: m >= 30 });
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
  if (belt && course) {
    const ckey = 'b:' + course.id + ':' + belt.id;
    if (!S.milestones[ckey]) {
      const cs = beltStats(belt, course);
      if (cs.total && cs.mastered === cs.total) {
        S.milestones[ckey] = Date.now();
        sess.celebrations.push({
          title: belt.nameEnglish.toUpperCase() + ' · ' + course.shortName.toUpperCase(),
          sub: 'that whole course finished for this belt', big: true });
      }
    }
  }
  if (belt && !S.milestones['b' + belt.id]) {
    const bs = beltStats(belt);
    if (bs.total && bs.mastered === bs.total) {
      S.milestones['b' + belt.id] = Date.now();
      sess.celebrations.push({
        title: belt.nameEnglish.toUpperCase() + ' · BOTH COURSES',
        sub: 'every requirement mastered — polish it in class', big: true });
    }
  }
}

/* ---------- course identity: colour, glyph, celebration particles ----
   The whole app repaints when you switch course. FX_JAMO is a const in
   the engine, so its CONTENTS are swapped rather than the binding —
   the FX system keeps working untouched. */
function applyCourseIdentity() {
  const c = activeCourse();
  const root = document.documentElement;
  const light = S.settings.theme === 'light';
  COURSES.forEach(x => root.classList.remove('course-' + x.id));
  if (!c) { root.style.removeProperty('--accent'); root.style.removeProperty('--accent-dim'); }
  else {
    root.classList.add('course-' + c.id);
    root.style.setProperty('--accent', light ? (c.accentLight || c.accent) : c.accent);
    root.style.setProperty('--accent-dim', c.accentDim || (light ? c.accent : c.accentLight) || '#2b4d80');
  }
  const glyphs = (c && c.fxGlyphs && c.fxGlyphs.length) ? c.fxGlyphs
    : ['합', '기', '도', '원', '유', '화', '수', '련', '띠', '한'];
  FX_JAMO.length = 0;
  glyphs.forEach(g => FX_JAMO.push(g));
}
function courseMark(c, size) {
  if (!c) return '';
  return `<span class="cmark ko" style="--cacc:${c.accent};${size ? `--csz:${size}px` : ''}">${esc(c.glyph || '')}</span>`;
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
  // '' is a legitimate value: it means "hasn't picked a course yet", which
  // is what puts a returning-from-nothing student on the course picker.
  if (typeof S.settings.activeCourseId !== 'string' ||
      (S.settings.activeCourseId && !COURSE_BY_ID[S.settings.activeCourseId])) S.settings.activeCourseId = '';
  if (!Array.isArray(S.practiceLog)) S.practiceLog = [];
  if (!S.verifications || typeof S.verifications !== 'object') S.verifications = {};
  if (!S.instructor || typeof S.instructor !== 'object') S.instructor = { pinHash: null, log: [] };
  if (!Array.isArray(S.instructor.log)) S.instructor.log = [];
  S.verifySeen = Number(S.verifySeen) || 0;
  // Curriculum version stamp: cards for removed items retire via dueCards();
  // verifications keep the version they were granted under.
  S.curriculumVersion = CURRICULUM.meta.version;
}

/* ---------- which course does a thing belong to? ----------
   Driven by domain.track in the curriculum data — fully configurable. */
function itemTrack(item) {
  const d = DOMAIN_BY_ID[item.domain];
  return d && d.track === 'technique' ? 'technique' : 'knowledge';
}
function unitTrack(u) {
  const ids = SEQUENCE.filter(id => ITEMS[id].unit === u.id);
  return ids.some(id => itemTrack(ITEMS[id]) === 'technique') ? 'technique' : 'knowledge';
}
function courseOf(item) { return COURSE_BY_TRACK[itemTrack(item)] || null; }
function courseIdOf(item) { const c = courseOf(item); return c ? c.id : ''; }
function courseOfUnit(u) { return COURSE_BY_TRACK[unitTrack(u)] || null; }

/* Everything that takes a "course" accepts a course object, a course id,
   a bare track name ('knowledge'/'technique'), or nothing for "both". */
function asCourse(sel) {
  if (!sel) return null;
  if (typeof sel === 'object') return sel.id ? sel : null;
  return COURSE_BY_ID[sel] || COURSE_BY_TRACK[sel] || null;
}
function activeCourse() { return COURSE_BY_ID[S.settings.activeCourseId] || null; }
function otherCourses() {
  const a = activeCourse();
  return COURSES.filter(c => !a || c.id !== a.id);
}
/* A unit belongs to a course if it CONTAINS any of that course's items.

   It used to be decided by unitTrack(), which hands a mixed unit wholly to
   Techniques — so a unit like "Falling Without Fear", which quite naturally
   holds both the Korean word 낙법 and the falls themselves, vanished from the
   Terminology path and took its vocabulary with it. That silently hid 47 of
   83 Terminology items and 31 of 41 Techniques items from the path they
   belong to: still scheduled, still quizzed, just invisible where the student
   looks. A unit can legitimately teach a word and the movement it names;
   the model has to allow that rather than force the content to split. */
function courseUnits(courseSel, belt) {
  const course = asCourse(courseSel);
  return ((belt || activeBelt()).units || []).filter(u => !course ||
    SEQUENCE.some(id => ITEMS[id].unit === u.id && courseIdOf(ITEMS[id]) === course.id));
}

/* Each course carries its own daily new-item budget — studying one
   never eats the other's allowance, exactly as two language courses
   would behave. Older saves simply start today's counters at zero. */
function newToday(courseSel) {
  const rec = dayRec(todayKey());
  const course = asCourse(courseSel);
  if (!course) return rec.newItems || 0;
  return (rec.newByCourse || {})[course.id] || 0;
}
function countNewItem(item) {
  const rec = dayRec(todayKey());
  rec.newItems = (rec.newItems || 0) + 1;
  const c = courseOf(item);
  if (!c) return;
  if (!rec.newByCourse) rec.newByCourse = {};
  rec.newByCourse[c.id] = (rec.newByCourse[c.id] || 0) + 1;
}

function nextNewItems(n, courseSel) {
  const out = [];
  const seq = eligibleSequence(courseSel);
  for (const id of seq) {
    if (out.length >= n) break;
    if (S.introduced[id]) continue;
    out.push(id);
  }
  return out;
}

function plan(courseSel) {
  unlockSkills();
  const course = asCourse(courseSel);
  const now = Date.now();
  let due = dueCards(now);
  // Muted items stop coming up for review too, not just for new material —
  // otherwise "skip this for now" only half works. The cards keep their
  // schedule and simply wait.
  due = due.filter(k => { const it = cardItem(k); return it && !isMuted(it); });
  if (course) due = due.filter(k => { const it = cardItem(k); return it && courseIdOf(it) === course.id; });
  const newSlots = Math.max(0, S.settings.dailyNew - newToday(course));
  const newIds = nextNewItems(newSlots, course);
  return {
    course,
    due: due.slice(0, S.settings.reviewCap),
    dueTotal: due.length,
    newIds,
    remainingInCourse: eligibleSequence(course).filter(id => !S.introduced[id]).length
  };
}
function planTotal(courseSel) { const p = plan(courseSel); return p.due.length + p.newIds.length; }

/* Note the deliberate asymmetry in defaults: plan/stats/beltStats with
   no course mean "everything", because that is what the shared Progress
   and Belt views want. startSession with no course means "the course I
   am studying", because that is what the big button on the path means —
   the engine calls it bare. '*' is the explicit everything-session. */
function startSession(courseSel) {
  const course = courseSel === '*' ? null : (asCourse(courseSel) || activeCourse());
  const p = plan(course);
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
    showToast(course ? 'Nothing is due in ' + course.nameEnglish + ' right now.' : 'Nothing is due right now.');
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
    courseId: course ? course.id : null,
    track: course ? course.track : null
  };
  view = 'session';
  render();
}

/* ---------- stats (Hanbit's, with hapkido item kinds) ----------
   Pass a course to get that course's numbers only. Day records,
   streak and time stay shared: one student, one training habit. */
function stats(courseSel) {
  const now = Date.now();
  const course = asCourse(courseSel);
  const inCourse = id => !course || courseIdOf(ITEMS[id]) === course.id;
  const keys = Object.keys(S.cards).filter(k => ITEMS[k.split('|')[0]] && inCourse(k.split('|')[0]));
  let learning = 0, young = 0, mature = 0, rsum = 0, rcount = 0;
  keys.forEach(k => {
    const c = S.cards[k];
    if (c.state === 'new') { learning++; return; }
    const s = c.S || 0;
    if (s >= 21) mature++; else if (s >= 3) young++; else learning++;
    rsum += currentR(c, now); rcount++;
  });

  const eligible = new Set(eligibleSequence(course));
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
    courseTotal: eligible.size,
    forecast, streak, timeToday, totalMs
  };
}
