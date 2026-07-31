/* ================================================================
   HAPKIDO LAYER — done screen, afterRender, actions, listeners
   ================================================================ */

function renderDone() {
  const doneCourse = sess && sess.courseId ? COURSE_BY_ID[sess.courseId] : null;
  const st = stats(doneCourse);
  const rec = dayRec(todayKey());
  const acc = sess && sess.answered ? sess.correct / sess.answered : 0;
  const mins = sess ? (Date.now() - sess.started) / 60000 : 0;
  const missed = sess ? Array.from(sess.againKeys) : [];
  const best = sess ? sess.bestCombo : 0;
  const CIRC = 351.86;
  const headline = sess && sess.perfect ? '완벽!' : acc >= 0.9 ? '잘했어요!' : acc >= 0.7 ? '좋아요!' : '수고했어요!';
  const headSub = sess && sess.perfect ? 'a flawless session'
    : acc >= 0.9 ? 'that was a strong round'
      : acc >= 0.7 ? 'right in the productive band'
        : 'the hard sessions are the ones that build memory';

  const tip = acc > 0.95
    ? 'Accuracy was very high, which usually means the schedule is being too cautious. Nudging target retention down to 0.87 in Settings gets you more new material for the same minutes.'
    : acc < 0.7
      ? 'Accuracy under 70% means new items are arriving faster than they stick. Drop the daily new count for a week and let the backlog settle.'
      : 'That accuracy is right in the productive band. Difficulty you can just about handle is exactly where memory gets built.';

  return `<div class="card">
    <div class="done-hero">
      <div class="ringwrap">
        <svg viewBox="0 0 132 132">
          <circle class="trk" cx="66" cy="66" r="56"></circle>
          <circle class="val" cx="66" cy="66" r="56" style="stroke-dashoffset:${(CIRC * (1 - acc)).toFixed(1)}"></circle>
        </svg>
        <div class="pctxt">${pct(acc)}</div>
      </div>
      <div class="dh-num ko">${headline}</div>
      ${romFor(headline) ? `<div class="faint" style="font-size:11px;font-family:var(--mono);letter-spacing:.08em">${esc(romFor(headline))}</div>` : ''}
      <div class="dh-lab">${esc(headSub)}</div>
    </div>
    <p class="sub" style="text-align:center;margin-top:14px">${doneCourse ? esc(doneCourse.nameEnglish) + ' · ' : (sess && COURSES.length ? 'Both courses · ' : '')}${Math.round(mins)} min · ${sess ? sess.answered : 0} answers${sess && sess.newSeen ? ` · ${sess.newSeen} new` : ''}${best >= 3 ? ` · best streak ${best}` : ''}</p>
    <div class="grid four" style="margin-top:6px">
      <div class="stat"><div class="n">${st.wordsKnown}</div><div class="l">${doneCourse ? esc(doneCourse.shortName) + ' holding' : 'Items holding'}</div></div>
      <div class="stat"><div class="n">${best}</div><div class="l">Best streak</div></div>
      <div class="stat"><div class="n">${st.forecast[1] || 0}</div><div class="l">Due tomorrow</div></div>
      <div class="stat"><div class="n">${fmtMin(rec.ms)}</div><div class="l">Time today</div></div>
    </div>
    <div class="notice" style="margin-top:14px">${tip}</div>
    ${missed.length ? `<h3>Worth a second look</h3><div class="row wrap">${
      missed.slice(0, 12).map(k => { const it = cardItem(k); return it ? `<span class="chip"><span class="${it.ko ? 'ko' : ''}">${esc(it.ko || it.name)}</span></span>` : ''; }).join('')
    }</div>` : ''}
    <div class="prose" style="margin-top:16px;font-size:13.5px">
      <p class="faint">Sleep does the consolidation you cannot do consciously. Nothing more to do today — the schedule will bring these back exactly when they are about to slip. See you in class.</p>
    </div>
    <div class="row" style="margin-top:8px">
      <button class="btn" data-view="today">Back to the path</button>
      <button class="btn ghost" data-act="start">Another round</button>
      ${(() => {
        const other = otherCourses().find(c => planTotal(c) > 0);
        return other ? `<button class="btn ghost" data-course="${other.id}">Switch to ${esc(other.shortName)} <b>${planTotal(other)}</b></button>` : '';
      })()}
    </div>
  </div>`;
}

/* afterRender: Hanbit's original flow + hapkido verification celebration */
function afterRender() {
  Mascot.show(view === 'session' || view === 'done');
  if (Mascot.el) {
    const ab = activeBelt();
    Mascot.el.style.setProperty('--beltc', ab.color);
    Mascot.el.style.setProperty('--beltstripe', ab.stripe || 'transparent');
  }

  if (view === 'done' && sess && sess.doneFx) {
    const kind = sess.doneFx;
    sess.doneFx = null;
    scheduleFx(() => {
      if (kind === 'perfect') {
        Sfx.play('levelup');
        FX.rain({ count: 110, avoidCenter: true });
        FX.fireworks(3);
        bannerFx('PERFECT', 'not a single miss', { hold: 1700 });
        edgeGlow('good', 1700);
        Mascot.mood('wow', 3200);
        Mascot.say('완벽해요!', 3000);
      } else if (kind === 'great') {
        Sfx.play('big');
        FX.rain({ count: 70, avoidCenter: true });
        FX.fireworks(2);
        Mascot.mood('wow', 2400);
        Mascot.say('잘했어요!', 2200);
      } else {
        Sfx.play('milestone');
        FX.rain({ count: 35, avoidCenter: true });
        Mascot.mood('happy', 2200);
        Mascot.say('수고했어요!', 2000);
      }
    }, 220);
  }

  if (sess && sess.pendingFx) {
    const fx = sess.pendingFx;
    sess.pendingFx = null;
    if (fx.kind === 'good') {
      celebrateCorrect(fx.ctx);
      if (S.settings.spokenPraise && comboTier(fx.ctx.combo) >= 1) {
        scheduleFx(() => speak(PRAISE_KO[Math.floor(Math.random() * PRAISE_KO.length)]), 520);
      }
    } else {
      celebrateWrong(fx.ctx);
    }
  }

  if (sess && sess.celebrations && sess.celebrations.length) {
    const queued = sess.celebrations.splice(0, 3);
    queued.forEach((m, i) => scheduleFx(() => celebrateMilestone(m), 1150 + i * 2300));
    save();
  }

  // A verification landed in class since the student last looked — celebrate it.
  const vc = Object.keys(S.verifications || {}).length;
  if (view === 'today' && vc > (S.verifySeen || 0)) {
    const newly = vc - (S.verifySeen || 0);
    S.verifySeen = vc;
    save();
    Mascot.show(true);
    scheduleFx(() => {
      celebrateMilestone({ title: 'INSTRUCTOR VERIFIED', sub: newly === 1 ? 'a technique earned its in-person check' : newly + ' techniques earned their in-person checks', big: true });
    }, 500);
    scheduleFx(() => Mascot.show(view === 'session' || view === 'done'), 4600);
  }
}

/* ---------- course switching ----------
   Switching is free and loses nothing: each course keeps its own place,
   its own daily budget and its own milestones. */
function switchCourse(id, opts) {
  const c = COURSE_BY_ID[id];
  if (!c) return;
  const wasFirstChoice = !activeCourse();
  if (activeCourse() && activeCourse().id === c.id && !(opts && opts.force)) {
    view = 'today'; render(); return;
  }
  S.settings.activeCourseId = c.id;
  beltScope = 'course';
  sess = null;
  view = 'today';
  save();
  Sfx.play('tap');
  render();
  if (wasFirstChoice) {
    scheduleFx(() => { Mascot.show(true); Mascot.mood('happy', 2200); Mascot.say('시작!', 2000); }, 260);
    scheduleFx(() => Mascot.show(false), 3000);
  } else {
    showToast(c.nameEnglish + ' — picked up where you left off.');
  }
}

/* Per-course daily budgets: a new item counts against its own course
   only. Overrides the engine's single global counter. */
function learnedStep() {
  const step = currentStep();
  if (!step || step.t !== 'teach') return;
  const item = ITEMS[step.id];
  if (!S.introduced[step.id]) {
    S.introduced[step.id] = Date.now();
    countNewItem(item);
    sess.newSeen++;
  }
  const first = ladderFor(item)[0];
  const key = ck(step.id, first);
  if (!S.cards[key]) S.cards[key] = newCard();
  sess.queue[sess.pos] = { t: 'card', key: key };
  liveEx = null;
  composer.reset();
  sess.build = [];
  save();
  render();
}

/* "Learn extra anyway" stays inside the course you are studying. */
function startExtra() {
  const course = activeCourse();
  const ids = nextNewItems(5, course);
  if (!ids.length) {
    showToast(course ? 'You have already met every ' + course.shortName.toLowerCase() + ' item at this belt.'
                     : 'You have already seen every item in the course.');
    return;
  }
  cancelFx();
  resetTransient();
  sess = {
    queue: ids.map(id => ({ t: 'teach', id })), pos: 0, combo: 0, bestCombo: 0, lastTier: 0,
    justMissed: false, pendingFx: null, celebrations: [],
    started: Date.now(), answered: 0, correct: 0,
    againKeys: new Set(), newSeen: 0, plannedNew: ids.length, plannedReviews: 0,
    reveal: null, lastGradeKey: null, budgetMs: Infinity, overtime: true,
    courseId: course ? course.id : null, track: course ? course.track : null
  };
  view = 'session';
  render();
}

/* ---------- hapkido actions ---------- */
function verifyAction(id) {
  const it = ITEMS[id];
  if (!it || !instrUnlocked) return;
  const byEl = document.getElementById('iv-by');
  const noteEl = document.getElementById('iv-note');
  const by = byEl ? byEl.value.trim() : '';
  if (S.verifications[id]) {
    if (!confirm('Remove the verification for ' + it.name + '?')) return;
    delete S.verifications[id];
    S.verifySeen = Math.max(0, Math.min(S.verifySeen, Object.keys(S.verifications).length));
    S.instructor.log.push({ t: Date.now(), a: 'unverify', id, by });
  } else {
    if (!by) { showToast('Enter instructor initials first.'); return; }
    S.verifications[id] = { by, date: todayKey(), note: noteEl ? noteEl.value.trim() : '', curriculumVersion: S.curriculumVersion };
    S.instructor.lastBy = by;
    S.instructor.log.push({ t: Date.now(), a: 'verify', id, by });
    showToast(it.name + ' verified.');
  }
  save(); render();
}

function savePractice() {
  const it = ITEMS[practiceItemId];
  if (!it || !practiceState || !practiceState.rating || !canPractice(it)) return;
  S.practiceLog.push({ t: Date.now(), itemId: it.id, rating: practiceState.rating, checked: practiceState.checked.slice() });
  save();
  Sfx.play('milestone');
  FX.rain({ count: 24, avoidCenter: true });
  showToast('Practice logged — bring one good question to class.');
  practiceItemId = null; practiceState = null;
  view = 'belt'; render();
}

/* ---------- export / import (hapkido shapes) ---------- */
function doExport() {
  const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'hapkido-progress-' + todayKey() + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  showToast('Backup downloaded.');
}

function doImport(file) {
  const r = new FileReader();
  r.onload = () => {
    let next;
    try {
      const data = JSON.parse(r.result);
      const obj = v => v && typeof v === 'object' && !Array.isArray(v);
      if (!obj(data) || !obj(data.cards) || !obj(data.settings)) throw new Error('not a Hapkido Companion backup');
      next = deepMerge(structuredCloneSafe(DEFAULTS), data);
      if (!Array.isArray(next.log)) next.log = [];
      if (!Array.isArray(next.practiceLog)) next.practiceLog = [];
      if (!obj(next.days)) next.days = {};
      if (!obj(next.introduced)) next.introduced = {};
      if (!obj(next.verifications)) next.verifications = {};
      if (!obj(next.instructor)) next.instructor = { pinHash: null, log: [] };
      Object.keys(next.cards).forEach(k => { if (!obj(next.cards[k])) delete next.cards[k]; });
    } catch (e) {
      showToast('That file could not be read as a Hapkido Companion backup.');
      return;
    }
    const prev = S;
    S = next;
    normalizeSettings();
    resetTransient();
    sess = null; view = 'today';
    try { render(); }
    catch (e) {
      S = prev; render();
      showToast('That backup could not be loaded — your progress is unchanged.');
      return;
    }
    save();
    showToast('Progress restored.');
  };
  r.readAsText(file);
}

/* ---------- extra event wiring (new data-attributes only) ---------- */
const HKD_ACTS = new Set(['selfreveal', 'psave', 'pback', 'instructor', 'pinset', 'pinsubmit', 'instrexit', 'start-both']);

document.addEventListener('click', e => {
  const t = e.target.closest('[data-selfgrade],[data-beltsel],[data-practice],[data-pcheck],[data-prate],[data-verify],[data-gotounit],[data-instrbelt],[data-course],[data-scope],[data-act]');
  if (!t) return;

  if (t.dataset.course) { switchCourse(t.dataset.course); return; }
  if (t.dataset.scope) {
    Sfx.play('tap');
    if (t.dataset.scope === 'all') beltScope = 'all';
    else if (activeCourse() && activeCourse().id === t.dataset.scope) beltScope = 'course';
    else { S.settings.activeCourseId = t.dataset.scope; beltScope = 'course'; save(); }
    render();
    return;
  }

  if (t.dataset.instrbelt) {
    if (!instrUnlocked) return;
    Sfx.play('tap');
    S.settings.activeBeltId = t.dataset.instrbelt;
    beltView = t.dataset.instrbelt;
    save(); render();
    return;
  }

  if (t.dataset.selfgrade) { selfGrade(parseInt(t.dataset.selfgrade, 10)); return; }
  if (t.dataset.beltsel) { Sfx.play('tap'); beltView = t.dataset.beltsel; render(); return; }
  if (t.dataset.gotounit) { Sfx.play('tap'); beltView = activeBelt().id; view = 'belt'; render(); return; }
  if (t.dataset.practice) { Sfx.play('tap'); practiceItemId = t.dataset.practice; practiceState = null; view = 'practice'; render(); return; }
  if (t.dataset.pcheck != null) { Sfx.play('pop'); practiceState.checked[parseInt(t.dataset.pcheck, 10)] = !practiceState.checked[parseInt(t.dataset.pcheck, 10)]; render(); return; }
  if (t.dataset.prate) { Sfx.play('pop'); practiceState.rating = parseInt(t.dataset.prate, 10); render(); return; }
  if (t.dataset.verify) { verifyAction(t.dataset.verify); return; }

  const act = t.dataset.act;
  if (!act || !HKD_ACTS.has(act)) return;
  if (act === 'start-both') { startSession('*'); return; }
  if (act === 'selfreveal') { if (sess && liveEx && liveEx.type === 'self') { sess.selfOpen = true; render(); } return; }
  if (act === 'psave') { savePractice(); return; }
  if (act === 'pback') { practiceItemId = null; practiceState = null; view = 'belt'; render(); return; }
  if (act === 'instructor') { view = 'instructor'; render(); return; }
  if (act === 'instrexit') { instrUnlocked = false; view = 'settings'; render(); return; }
  if (act === 'pinset') {
    const p1 = (document.getElementById('pin1') || {}).value || '';
    const p2 = (document.getElementById('pin2') || {}).value || '';
    if (!/^\d{4,8}$/.test(p1)) { showToast('PIN must be 4–8 digits.'); return; }
    if (p1 !== p2) { showToast('The PINs do not match.'); return; }
    S.instructor.pinHash = pinHash(p1);
    instrUnlocked = true; save(); render(); return;
  }
  if (act === 'pinsubmit') {
    const p1 = (document.getElementById('pin1') || {}).value || '';
    if (pinHash(p1) === S.instructor.pinHash) { instrUnlocked = true; render(); }
    else showToast('That PIN does not match.');
    return;
  }
});

document.addEventListener('keydown', e => {
  if (view !== 'session' || !sess || sess.reveal) return;
  if (liveEx && liveEx.type === 'self' && !sess.selfOpen && e.key === 'Enter') {
    e.preventDefault();
    sess.selfOpen = true;
    render();
  }
});

/* ---------- avatar belt color + romanized mascot speech ---------- */
Mascot.say = function (text, ms) {
  this.mount();
  const b = this.el.querySelector('.m-bubble');
  if (!b) return;
  const rom = romFor(text);
  b.innerHTML = esc(text) + (rom ? ` <span style="font-weight:400;font-size:10px;color:var(--tx-faint);font-family:var(--mono)">${esc(rom)}</span>` : '');
  b.classList.add('on');
  clearTimeout(this._sayTimer);
  this._sayTimer = setTimeout(() => b.classList.remove('on'), ms || 2200);
};

/* ---------- real audio hook: recorded clips beat TTS ----------
   window.HKD_AUDIO maps exact Korean text -> audio URL or data URI.
   Populated by data/audio.js (Grandmaster Lee's recordings, or generated
   clips) when present. speechSynthesis remains the fallback. */
window.HKD_AUDIO = window.HKD_AUDIO || {};
function speak(text, btn) {
  if (!text) return;
  const clip = window.HKD_AUDIO[text];
  if (clip) {
    try {
      if (speak._a) { speak._a.pause(); }
      const a = new Audio(clip);
      speak._a = a;
      a.volume = Math.max(0.2, Math.min(1, S.settings.volume + 0.4));
      if (btn) {
        btn.classList.add('playing');
        const off = () => btn.classList.remove('playing');
        a.onended = off; a.onerror = off;
        setTimeout(off, 5000);
      }
      a.play().catch(() => {});
      return;
    } catch (e) { /* fall through to TTS */ }
  }
  if (!('speechSynthesis' in window)) return;
  refreshVoices();
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (btn) {
      btn.classList.add('playing');
      const off = () => btn.classList.remove('playing');
      u.onend = off; u.onerror = off;
      setTimeout(off, 4000);
    }
    u.lang = 'ko-KR';
    u.rate = S.settings.ttsRate;
    const chosen = voices.find(v => v.name === S.settings.ttsVoice) || voices[0];
    if (chosen) u.voice = chosen;
    window.speechSynthesis.speak(u);
    if (!chosen && !voiceWarned) {
      voiceWarned = true;
      showToast('No Korean voice found in this browser — see Settings for how to add one.');
    }
  } catch (e) { /* speech is a bonus, never a blocker */ }
}

/* ---------- voice quality: prefer enhanced/natural Korean voices ----------
   Browser TTS is a labeled stand-in until Grandmaster Lee records real audio.
   Until then, at least pick the best voice the device has. */
function refreshVoices() {
  if (!('speechSynthesis' in window)) return;
  const score = v => {
    const n = (v.name || '').toLowerCase();
    let s = 0;
    if (/premium|natural|neural/.test(n)) s += 40;
    if (/enhanced/.test(n)) s += 30;
    if (/google|online/.test(n)) s += 12;
    if (/siri/.test(n)) s += 8;
    if (/compact/.test(n)) s -= 30;
    return s;
  };
  voices = window.speechSynthesis.getVoices()
    .filter(v => /^ko/i.test(v.lang))
    .sort((a, b) => score(b) - score(a));
}
refreshVoices();

/* ---------- debug/test handle (local only; used by the test harness) ---------- */
window.__HKD = {
  get S() { return S; }, set S(v) { S = v; },
  get sess() { return sess; }, get liveEx() { return liveEx; },
  get view() { return view; }, set view(v) { view = v; },
  get instrUnlocked() { return instrUnlocked; }, set instrUnlocked(v) { instrUnlocked = !!v; },
  set beltView(v) { beltView = v; }, set practiceItemId(v) { practiceItemId = v; practiceState = null; },
  get beltScope() { return beltScope; }, set beltScope(v) { beltScope = v; },
  get fxGlyphs() { return FX_JAMO.slice(); },
  save, render, plan, planTotal, stats, beltStats, cumulativeStats, activeBelt, ladderFor, knowledgeMastered,
  itemStatus, eligibleSequence, newCard, ck, ITEMS, SEQUENCE, BELTS, schedule, retrievability, itemTrack,
  COURSES, COURSE_BY_ID, activeCourse, switchCourse, courseOf, courseIdOf, courseUnits, newToday, startSession,
  sequenceFastMs, itemProgress, skillShare, rungProgress, skillWeight
};
// The dojang layer adds its own handles in part6 — its consts live after this
// point, so naming them here would hit the temporal dead zone.
