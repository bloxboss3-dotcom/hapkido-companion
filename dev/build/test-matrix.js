// Full test matrix for the Hapkido Companion vertical slice.
// Path-portable: runs from any checkout (tests dev/hapkido-companion/index.html).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
process.chdir(path.resolve(__dirname, '..'));           // <repo>/dev
fs.mkdirSync('shots', { recursive: true });
const URL = 'file://' + path.resolve('hapkido-companion', 'index.html');
const results = [];
let page, consoleErrs = [], pageErrs = [];

function ok(name, cond, detail) {
  results.push({ name, pass: !!cond, detail: detail || '' });
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (cond ? '' : '  :: ' + (detail || '')));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function answerCurrentRight() {
  // teach card?
  if (await page.$('[data-act="learned"]')) { await page.click('[data-act="learned"]'); await sleep(150); return 'teach'; }
  const type = await page.evaluate(() => window.__HKD.liveEx && window.__HKD.liveEx.type);
  if (type === 'mc') {
    await page.evaluate(() => {
      const ans = window.__HKD.liveEx.answer;
      const el = [...document.querySelectorAll('.opt')].find(o => o.textContent.trim() === ans);
      el.click();
    });
    await sleep(200);
    await page.click('[data-act="next"]'); await sleep(150);
    return 'mc';
  }
  if (type === 'build') {
    const n = await page.evaluate(() => window.__HKD.liveEx.tiles.length);
    for (let i = 0; i < n; i++) { await page.click(`[data-pickt="${i}"]`); await sleep(60); }
    await page.click('[data-act="submit"]'); await sleep(200);
    await page.click('[data-act="next"]'); await sleep(150);
    return 'build';
  }
  if (type === 'self') {
    await page.click('[data-act="selfreveal"]'); await sleep(120);
    await page.click('[data-selfgrade="3"]'); await sleep(200);
    await page.click('[data-act="next"]'); await sleep(150);
    return 'self';
  }
  return 'unknown:' + type;
}

(async () => {
  const browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', e => pageErrs.push(String(e)));
  page.on('dialog', d => d.accept());

  /* ---- 1. first launch lands on the course picker ---- */
  await page.goto(URL); await sleep(800);
  ok('first launch: no console/page errors', consoleErrs.length === 0 && pageErrs.length === 0, JSON.stringify(consoleErrs.concat(pageErrs)).slice(0, 300));
  ok('first launch: course picker, one card per course, no tabs yet', await page.evaluate(() => {
    const n = window.__HKD.COURSES.length;
    return window.__HKD.view === 'courses' && n === 2 &&
      document.querySelectorAll('.ccard').length === n &&
      document.querySelectorAll('nav.tabs').length === 0;
  }));
  ok('first launch: picker names both courses and says one belt covers both', await page.evaluate(() =>
    document.body.textContent.includes('Terminology & Philosophy') &&
    document.body.textContent.includes('Techniques') &&
    document.body.textContent.includes('One belt, both courses')));
  await page.screenshot({ path: 'shots/course-picker.png', fullPage: true });

  await page.click('[data-course="way"]'); await sleep(500);
  ok('picking a course opens its path and is remembered', await page.evaluate(() =>
    window.__HKD.view === 'today' && window.__HKD.activeCourse().id === 'way' &&
    window.__HKD.S.settings.activeCourseId === 'way'));
  ok('first launch: belt banner + provisional badge', await page.evaluate(() =>
    !!document.querySelector('.belt-banner') && document.body.textContent.includes('Provisional — awaiting Grandmaster Lee')));
  ok('path shows only the chosen course\'s units + 10 locked belts', await page.evaluate(() => {
    const H = window.__HKD;
    const lane = document.querySelector('.path[data-course="way"]');
    const expect = H.courseUnits('way').length;
    return !!lane && lane.querySelectorAll('.pnode').length === expect && expect > 0 &&
      document.querySelectorAll('.pnode.lockb').length === 10;
  }));
  ok('terminology course shows its 3 knowledge readiness bars', await page.evaluate(() =>
    document.querySelectorAll('.rrow').length === 3));
  await page.screenshot({ path: 'shots/path-first.png', fullPage: true });

  /* ---- 2. new lesson session (teach → mc → FSRS write) ---- */
  await page.click('[data-act="start"]'); await sleep(500);
  ok('session: teach card first', await page.evaluate(() => !!document.querySelector('.card.teach')));
  await page.screenshot({ path: 'shots/teach.png' });
  await page.click('[data-act="learned"]'); await sleep(300);
  ok('session: exercise rendered', await page.evaluate(() => !!window.__HKD.liveEx));
  await page.screenshot({ path: 'shots/exercise.png' });
  const ans1 = await page.evaluate(() => window.__HKD.liveEx.answer);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('.opt')].find(o => o.textContent.trim() === window.__HKD.liveEx.answer);
    el.click();
  });
  await sleep(300);
  ok('session: feedback shown', await page.$('.fb') !== null);
  const card1 = await page.evaluate(() => { const S = window.__HKD.S; const k = Object.keys(S.cards)[0]; return { k, ...S.cards[k] }; });
  ok('FSRS: first correct wrote S=15.69105 (w3) or 3.173 (w2)', card1 && (Math.abs(card1.S - 15.69105) < 1e-6 || Math.abs(card1.S - 3.173) < 1e-6), JSON.stringify(card1));
  ok('FSRS: state review, interval ≥ 1d', card1.state === 'review' && card1.intervalDays >= 1);

  /* ---- 3. wrong answer: grade 1, +10min requeue, relearn step ---- */
  await page.click('[data-act="next"]'); await sleep(250);
  // advance until an MC exercise appears, then answer wrong
  for (let i = 0; i < 6; i++) {
    const st = await page.evaluate(() => ({ teach: !!document.querySelector('[data-act="learned"]'), t: window.__HKD.liveEx && window.__HKD.liveEx.type }));
    if (!st.teach && st.t === 'mc') break;
    await answerCurrentRight();
  }
  const wrongInfo = await page.evaluate(() => {
    const ex = window.__HKD.liveEx;
    const el = [...document.querySelectorAll('.opt')].find(o => o.textContent.trim() !== ex.answer);
    el.click();
    return { key: ex.key };
  });
  await sleep(300);
  const afterWrong = await page.evaluate(k => {
    const S = window.__HKD.S, sess = window.__HKD.sess;
    const c = S.cards[k];
    const requeued = sess.queue.slice(sess.pos + 1).some(st => st.key === k && st.relearn);
    return { S: c.S, due: c.due, now: Date.now(), state: c.state, requeued, combo: sess.combo, lapses: c.lapses };
  }, wrongInfo.key);
  ok('wrong answer: lapse recorded (state relearning, lapses 1)', afterWrong.state === 'relearning' && afterWrong.lapses === 1, JSON.stringify(afterWrong).slice(0, 200));
  ok('wrong answer: due ≈ +10 min', Math.abs(afterWrong.due - afterWrong.now - 600000) < 15000);
  ok('wrong answer: requeued in session + combo reset', afterWrong.requeued && afterWrong.combo === 0);
  await page.click('[data-act="next"]'); await sleep(200);

  /* ---- 4. quit session cleanly ---- */
  await page.click('[data-act="quit"]'); await sleep(400);
  ok('quit lands on done screen', await page.evaluate(() => window.__HKD.view === 'done'));
  await page.click('[data-view="today"]'); await sleep(300);

  /* ---- 5. step-sequencing exercise (techniques course) ---- */
  await page.click('.cswitch'); await sleep(300);
  await page.click('[data-course="art"]'); await sleep(450);
  ok('switching course repaints the app in that course\'s colour', await page.evaluate(() => {
    const H = window.__HKD;
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return H.activeCourse().id === 'art' && acc === H.COURSE_BY_ID.art.accent &&
      document.documentElement.classList.contains('course-art');
  }));
  ok('switching course swaps the celebration glyphs too', await page.evaluate(() =>
    window.__HKD.fxGlyphs.join('') === window.__HKD.COURSE_BY_ID.art.fxGlyphs.join('')));
  ok('techniques path shows only technique units', await page.evaluate(() => {
    const H = window.__HKD;
    const lane = document.querySelector('.path[data-course="art"]');
    return !!lane && lane.querySelectorAll('.pnode').length === H.courseUnits('art').length &&
      H.courseUnits('art').length > 0 && H.courseUnits('art').length !== H.courseUnits('way').length;
  }));
  await page.screenshot({ path: 'shots/path-techniques.png', fullPage: true });
  await page.evaluate(() => {
    const H = window.__HKD, S = H.S;
    S.settings.dailyNew = 0;
    S.introduced['x-ap-chagi'] = Date.now();
    S.cards['x-ap-chagi|t-id'] = { S: 30, D: 4, due: Date.now() + 20 * 86400000, last: Date.now(), reps: 3, lapses: 0, state: 'review' };
    S.cards['x-ap-chagi|t-situation'] = { S: 30, D: 4, due: Date.now() + 20 * 86400000, last: Date.now(), reps: 3, lapses: 0, state: 'review' };
    S.cards['x-ap-chagi|t-steps'] = H.newCard();
    H.save(); H.view = 'today'; H.render();
  });
  await page.click('[data-act="start"]'); await sleep(400);
  let found = null;
  for (let i = 0; i < 8; i++) {
    const t = await page.evaluate(() => window.__HKD.liveEx && window.__HKD.liveEx.type);
    const teach = await page.$('[data-act="learned"]');
    if (t === 'build' && !teach) { found = 'build'; break; }
    await answerCurrentRight();
  }
  ok('sequencing: build exercise reached', found === 'build');
  if (found === 'build') {
    await page.screenshot({ path: 'shots/sequencing.png' });
    const n = await page.evaluate(() => window.__HKD.liveEx.tiles.length);
    ok('sequencing: submit disabled until all steps placed', await page.evaluate(() => {
      const b = [...document.querySelectorAll('[data-act="submit"]')][0]; return b && b.disabled; }));
    for (let i = 0; i < n; i++) { await page.click(`[data-pickt="${i}"]`); await sleep(50); }
    await page.click('[data-act="submit"]'); await sleep(250);
    ok('sequencing: correct order accepted', await page.evaluate(() =>
      document.querySelector('.fb') && document.querySelector('.fb').classList.contains('right')));
    // A correct order marks every step, so "what did I get right" needs no
    // reading at all.
    ok('sequencing: a correct order marks every step right', await page.evaluate(() =>
      document.querySelectorAll('.tile.step.ok').length === window.__HKD.liveEx.tiles.length &&
      document.querySelectorAll('.tile.step.off').length === 0));
    await page.click('[data-act="next"]'); await sleep(200);
  }

  /* ---- sequencing: a WRONG order is marked per step ----
     The whole point: see which steps were right and where the misplaced ones
     belong, without diffing against the correct list underneath. */
  await page.evaluate(() => {
    const H = window.__HKD, S = H.S;
    S.settings.dailyNew = 0;
    S.introduced['x-ap-chagi'] = Date.now();
    const held = { S: 30, D: 4, due: Date.now() + 20 * 86400000, last: Date.now(), reps: 3, lapses: 0, state: 'review' };
    S.cards['x-ap-chagi|t-id'] = { ...held };
    S.cards['x-ap-chagi|t-situation'] = { ...held };
    S.cards['x-ap-chagi|t-steps'] = H.newCard();
    H.save(); H.view = 'today'; H.render();
  });
  await page.click('[data-act="start"]'); await sleep(400);
  let seqFound = false;
  for (let i = 0; i < 8; i++) {
    const t = await page.evaluate(() => window.__HKD.liveEx && window.__HKD.liveEx.type);
    const teach = await page.$('[data-act="learned"]');
    if (t === 'build' && !teach) { seqFound = true; break; }
    await answerCurrentRight();
  }
  if (seqFound) {
    const n = await page.evaluate(() => window.__HKD.liveEx.tiles.length);
    // Swap the 2nd and 3rd steps; leave the rest correct.
    const order = [...Array(n).keys()];
    if (n >= 3) { const t = order[1]; order[1] = order[2]; order[2] = t; }
    for (const i of order) { await page.click(`[data-pickt="${i}"]`); await sleep(50); }
    await page.click('[data-act="submit"]'); await sleep(300);
    await page.screenshot({ path: 'shots/sequencing-marked.png' });
    ok('sequencing: misplaced steps are marked, correct ones are not', await page.evaluate(() =>
      document.querySelectorAll('.tile.step.off').length === 2 &&
      document.querySelectorAll('.tile.step.ok').length === window.__HKD.liveEx.tiles.length - 2));
    ok('sequencing: a misplaced step shows the position it belongs in', await page.evaluate(() => {
      const offs = [...document.querySelectorAll('.tile.step.off')];
      // Swapped pair: the one sitting at position 2 belongs at 3, and vice versa.
      return offs.length === 2 &&
        offs.every(b => /→\s*\d/.test(b.querySelector('.stepmark.off').textContent)) &&
        offs.every(b => /misplaced/.test(b.getAttribute('aria-label') || ''));
    }));
    ok('sequencing: correctness is not conveyed by colour alone', await page.evaluate(() =>
      [...document.querySelectorAll('.tile.step.ok')].every(b =>
        b.querySelector('.stepmark.ok') && /correct/.test(b.getAttribute('aria-label') || ''))));
    ok('sequencing: shows how many landed in the right place', await page.evaluate(() => {
      const el = document.querySelector('.step-tally');
      return el && /\b3 of 5 in the right place\b/.test(el.textContent);
    }));
    ok('sequencing: the answer list fades what was already right', await page.evaluate(() =>
      document.querySelectorAll('.fb-steps.marked li.missed').length === 2 &&
      document.querySelectorAll('.fb-steps.marked li.had').length === 3));
    ok('sequencing: the tile pool is dropped once checked, not left as a third list',
      await page.evaluate(() => !document.querySelector('.build-pool')));
    await page.click('[data-act="next"]'); await sleep(200);
  }
  ok('sequencing: wrong-order marking exercised', seqFound);
  if (await page.$('[data-act="quit"]')) { await page.click('[data-act="quit"]'); await sleep(300); }
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(200); }

  /* ---- sequencing: the "easy" allowance scales with how much there is to read ----
     A flat 14s was inherited from short multiple choice, so the longest
     exercise in the app could effectively never earn the longer interval. */
  ok('sequencing: speed allowance scales with the reading load', await page.evaluate(() => {
    const H = window.__HKD;
    const short = H.sequenceFastMs({ tiles: [{ w: 'a b' }, { w: 'c d' }, { w: 'e f' }] });
    const long = H.sequenceFastMs({ tiles: [
      { w: 'Lift the kicking knee toward your chest, foot under the knee' },
      { w: 'Pull the toes back so the ball of the foot leads' },
      { w: 'Extend the leg forward in a straight snap' },
      { w: 'Re-chamber the knee immediately after the kick' },
      { w: 'Set the foot down in a balanced stance' }] });
    // The real five-step kick must get materially more room than the old flat
    // 14s, and more than a short three-step item — but still bounded.
    return long > 14000 && long > short * 1.5 && long < 40000 && short < 14000;
  }));
  await page.evaluate(() => { if (window.__HKD.sess) { } });
  if (await page.$('[data-act="quit"]')) { await page.click('[data-act="quit"]'); await sleep(300); }
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(200); }

  /* ---- 6. self-graded speaking exercise (back in the terminology course) ---- */
  await page.evaluate(() => { window.__HKD.switchCourse('way'); }); await sleep(350);
  ok('switching back restores the other course accent', await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() === window.__HKD.COURSE_BY_ID.way.accent));
  await page.evaluate(() => {
    const H = window.__HKD, S = H.S;
    const done = { S: 30, D: 4, due: Date.now() + 20 * 86400000, last: Date.now(), reps: 3, lapses: 0, state: 'review' };
    S.introduced['t-dojang'] = Date.now();
    S.cards['t-dojang|recog'] = { ...done }; S.cards['t-dojang|listen'] = { ...done }; S.cards['t-dojang|recallKO'] = { ...done };
    S.cards['t-dojang|speak'] = H.newCard();
    H.save(); H.view = 'today'; H.render();
  });
  await page.click('[data-act="start"]'); await sleep(400);
  let self = null;
  for (let i = 0; i < 8; i++) {
    const t = await page.evaluate(() => window.__HKD.liveEx && window.__HKD.liveEx.type);
    const teach = await page.$('[data-act="learned"]');
    if (t === 'self' && !teach) { self = true; break; }
    await answerCurrentRight();
  }
  ok('speak rung: self exercise reached', !!self);
  if (self) {
    ok('speak rung: answer hidden before reveal', await page.evaluate(() => !document.body.textContent.includes('도장') || !!document.querySelector('[data-act="selfreveal"]')));
    await page.click('[data-act="selfreveal"]'); await sleep(150);
    await page.screenshot({ path: 'shots/self.png' });
    await page.click('[data-selfgrade="3"]'); await sleep(250);
    const g = await page.evaluate(() => window.__HKD.S.cards['t-dojang|speak']);
    ok('speak rung: graded Good (state review)', g.state === 'review' && g.reps === 1, JSON.stringify(g).slice(0, 140));
    await page.click('[data-act="next"]'); await sleep(150);
  }
  if (await page.$('[data-act="quit"]')) { await page.click('[data-act="quit"]'); await sleep(300); }
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(200); }

  /* ---- 7. belt filtering + cumulative ---- */
  const gate = await page.evaluate(() => {
    const H = window.__HKD, I = H.ITEMS;
    const cnt = maxOrder => H.SEQUENCE.filter(id => I[id].beltOrder <= maxOrder).length;
    const a = H.eligibleSequence().length;                 // active = white (order 1)
    H.S.settings.activeBeltId = 'yellow';                  // order 3 — includes white + stripe
    const b = H.eligibleSequence().length;
    const cum = H.cumulativeStats(H.BELTS.find(x => x.id === 'yellow'));
    const expCumTotal = H.SEQUENCE.filter(id => I[id].beltOrder < 3 && !I[id].optional).length;
    const expCumV = H.SEQUENCE.filter(id => I[id].beltOrder < 3 && I[id].kind === 'technique' && I[id].instructorRequired).length;
    H.S.settings.activeBeltId = 'white';
    return { a, expA: cnt(1), b, expB: cnt(3), cumTotal: cum.total, expCumTotal, cumV: cum.vreq, expCumV };
  });
  ok('belt gating: active-belt filter matches data (cumulative kept)', gate.a === gate.expA && gate.a > 0 && gate.b === gate.expB && gate.b > gate.a, JSON.stringify(gate));
  ok('cumulative stats derived from curriculum data', gate.cumTotal === gate.expCumTotal && gate.cumV === gate.expCumV, JSON.stringify(gate));

  /* ---- 8. belt page, course scope filter, media, restricted gating ---- */
  await page.click('[data-view="belt"]'); await sleep(300);
  ok('belt page: pills for all 11 belts', await page.evaluate(() => document.querySelectorAll('.belt-pill').length === 11));
  ok('belt page: scoped to the active course by default', await page.evaluate(() => {
    const H = window.__HKD;
    const shown = [...document.querySelectorAll('[data-expand]')].map(e => e.dataset.expand);
    return shown.length > 0 && shown.every(id => H.courseIdOf(H.ITEMS[id]) === 'way') &&
      !!document.querySelector('.scopebar');
  }));
  ok('belt page: the whole belt always shows five readiness measures', await page.evaluate(() =>
    document.querySelectorAll('.rrow').length === 5));
  await page.click('[data-scope="all"]'); await sleep(300);
  ok('belt page: "Everything" scope shows both courses\' requirements', await page.evaluate(() => {
    const H = window.__HKD;
    const shown = [...document.querySelectorAll('[data-expand]')].map(e => e.dataset.expand);
    return shown.some(id => H.courseIdOf(H.ITEMS[id]) === 'way') &&
      shown.some(id => H.courseIdOf(H.ITEMS[id]) === 'art');
  }));
  await page.evaluate(() => { const el = [...document.querySelectorAll('[data-expand]')].find(e => e.dataset.expand === 'x-junbi-seogi'); el.scrollIntoView(); el.click(); });
  await sleep(300);
  ok('missing media: "Demonstration coming soon" placeholder', await page.evaluate(() =>
    document.body.textContent.includes('Demonstration coming soon')));
  ok('solo-safe: practice button present for ready stance', await page.$('[data-practice="x-junbi-seogi"]') !== null);
  await page.screenshot({ path: 'shots/belt-detail.png' });
  await page.evaluate(() => { [...document.querySelectorAll('[data-expand]')].find(e => e.dataset.expand === 'x-hubang-nakbeop').click(); });
  await sleep(250);
  ok('restricted: supervision notice on back fall', await page.evaluate(() =>
    !!document.querySelector('.notice-supervision')));
  ok('restricted: NO practice button on back fall', await page.$('[data-practice="x-hubang-nakbeop"]') === null);
  await page.evaluate(() => { [...document.querySelectorAll('[data-expand]')].find(e => e.dataset.expand === 'x-cheukbang-nakbeop').click(); });
  await sleep(200);
  const failedMedia = await page.waitForFunction(() =>
    document.querySelector('.media-slot.failed'), null, { timeout: 5000 }).catch(() => null);
  ok('invalid media path: video error falls back to placeholder', !!failedMedia);

  /* ---- 9. preview belt (empty state) ---- */
  await page.click('[data-beltsel="green"]'); await sleep(250);
  ok('preview belt: awaiting-curriculum empty state', await page.evaluate(() =>
    document.body.textContent.includes("waiting for Grandmaster Lee's curriculum")));
  await page.click('[data-beltsel="white"]'); await sleep(250);

  /* ---- 10. practice logging flow ---- */
  await page.evaluate(() => {
    if (!document.querySelector('[data-practice="x-junbi-seogi"]'))
      [...document.querySelectorAll('[data-expand]')].find(e => e.dataset.expand === 'x-junbi-seogi').click();
  });
  await sleep(250);
  await page.click('[data-practice="x-junbi-seogi"]'); await sleep(300);
  ok('practice view: 4 checklist rows', await page.evaluate(() => document.querySelectorAll('.pc-row').length === 4));
  ok('practice view: save disabled before rating', await page.evaluate(() => document.querySelector('[data-act="psave"]').disabled));
  await page.click('[data-pcheck="0"]'); await page.click('[data-pcheck="1"]'); await page.click('[data-prate="4"]'); await sleep(150);
  await page.screenshot({ path: 'shots/practice.png' });
  await page.click('[data-act="psave"]'); await sleep(350);
  ok('practice saved: one log entry, self-reported', await page.evaluate(() => {
    const p = window.__HKD.S.practiceLog; return p.length === 1 && p[0].itemId === 'x-junbi-seogi' && p[0].rating === 4; }));

  /* ---- 11. instructor mode: PIN, verify, unverify ---- */
  await page.click('[data-view="settings"]'); await sleep(250);
  await page.click('[data-act="instructor"]'); await sleep(250);
  await page.fill('#pin1', '12'); await page.click('[data-act="pinset"]'); await sleep(200);
  ok('PIN: rejects too-short PIN', await page.evaluate(() => !window.__HKD.instrUnlocked));
  await page.fill('#pin1', '4321'); await page.fill('#pin2', '4321'); await page.click('[data-act="pinset"]'); await sleep(300);
  ok('PIN: set + unlocked', await page.evaluate(() => window.__HKD.instrUnlocked && !!window.__HKD.S.instructor.pinHash));
  await page.click('[data-verify="x-release-1"]'); await sleep(250);
  ok('verify: blocked without initials (toast)', await page.evaluate(() => !window.__HKD.S.verifications['x-release-1']));
  await page.fill('#iv-by', 'KV'); await page.fill('#iv-note', 'clean at drilling speed');
  await page.click('[data-verify="x-release-1"]'); await sleep(300);
  const ver = await page.evaluate(() => window.__HKD.S.verifications['x-release-1']);
  const metaVer = await page.evaluate(() => window.CURRICULUM.meta.version);
  ok('verify: recorded with by/date/curriculumVersion', ver && ver.by === 'KV' && !!ver.date && ver.curriculumVersion === metaVer, JSON.stringify(ver));
  await page.click('[data-instrbelt="white-yellow"]'); await sleep(250);
  ok('instructor can advance the active belt', await page.evaluate(() => window.__HKD.activeBelt().id === 'white-yellow'));
  await page.click('[data-instrbelt="white"]'); await sleep(250);
  ok('instructor can set the belt back', await page.evaluate(() => window.__HKD.activeBelt().id === 'white'));
  await page.screenshot({ path: 'shots/instructor.png' });
  // lock, then confirm student-side celebration flag + gold status
  await page.click('[data-act="instrexit"]'); await sleep(200);
  ok('instructor exit relocks', await page.evaluate(() => !window.__HKD.instrUnlocked));
  await page.click('[data-view="today"]'); await sleep(700);
  ok('student sees verification celebrated (verifySeen updated)', await page.evaluate(() => window.__HKD.S.verifySeen === 1));
  // re-enter with PIN, unverify (confirm dialog auto-accepted)
  await page.click('[data-view="settings"]'); await sleep(200);
  await page.click('[data-act="instructor"]'); await sleep(200);
  await page.fill('#pin1', '9999'); await page.click('[data-act="pinsubmit"]'); await sleep(200);
  ok('PIN: wrong PIN rejected', await page.evaluate(() => !window.__HKD.instrUnlocked));
  await page.fill('#pin1', '4321'); await page.click('[data-act="pinsubmit"]'); await sleep(250);
  await page.click('[data-verify="x-release-1"]'); await sleep(300);
  ok('unverify works (dialog confirmed)', await page.evaluate(() => !window.__HKD.S.verifications['x-release-1']));
  await page.click('[data-act="instrexit"]'); await sleep(150);

  /* ---- 12. export / import round-trip ---- */
  const before = await page.evaluate(() => JSON.stringify({ c: Object.keys(window.__HKD.S.cards).length, p: window.__HKD.S.practiceLog.length }));
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="export"]')]);
  const dlPath = '/tmp/hapkido-export-test.json';
  await download.saveAs(dlPath);
  ok('export: file downloaded', require('fs').existsSync(dlPath));
  // wipe practice log, then import to restore
  await page.evaluate(() => { window.__HKD.S.practiceLog = []; window.__HKD.save(); });
  await page.click('[data-act="import"]').catch(() => {});
  await page.setInputFiles('#importfile', dlPath); await sleep(600);
  const after = await page.evaluate(() => JSON.stringify({ c: Object.keys(window.__HKD.S.cards).length, p: window.__HKD.S.practiceLog.length }));
  ok('import: state restored (round-trip)', before === after, before + ' vs ' + after);
  // malformed import rejected
  require('fs').writeFileSync('/tmp/bad-import.json', '{"nope": true}');
  await page.click('[data-view="settings"]'); await sleep(200);
  await page.setInputFiles('#importfile', '/tmp/bad-import.json'); await sleep(400);
  const stillFine = await page.evaluate(() => Object.keys(window.__HKD.S.cards).length);
  ok('import: malformed file rejected without damage', String(stillFine) === String(JSON.parse(after).c));

  /* ---- 13. curriculum-change orphan retirement ---- */
  await page.evaluate(() => {
    const H = window.__HKD;
    H.S.cards['x-release-1|bogus-skill'] = H.newCard();
    H.S.cards['item-that-was-deleted|recog'] = H.newCard();
    H.S.introduced['item-that-was-deleted'] = Date.now();
    H.save();
  });
  await page.reload(); await sleep(600);
  const orphans = await page.evaluate(() => {
    window.__HKD.plan();
    const S = window.__HKD.S;
    return { bogus: !!S.cards['x-release-1|bogus-skill'], deleted: !!S.cards['item-that-was-deleted|recog'] };
  });
  ok('curriculum change: orphaned skill card retired', !orphans.bogus);
  ok('curriculum change: deleted-item card ignored safely (no crash)', pageErrs.length === 0, JSON.stringify(pageErrs).slice(0, 200));

  /* ---- 14. returning user + review session ---- */
  const ret = await page.evaluate(() => ({ hero: (document.querySelector('.hero h2') || {}).textContent, chips: [...document.querySelectorAll('.chip')].map(c => c.textContent) }));
  ok('returning user: Today hero + done-today chip', ret.hero === 'Today' && ret.chips.some(c => c.includes('Done today')), JSON.stringify(ret).slice(0, 200));
  await page.evaluate(() => { // make two cards of the active course due now → review session
    const H = window.__HKD, S = H.S, cid = H.activeCourse().id;
    let n = 0;
    Object.keys(S.cards).forEach(k => {
      if (n < 2 && S.cards[k].state === 'review' && H.ITEMS[k.split('|')[0]] && H.courseIdOf(H.ITEMS[k.split('|')[0]]) === cid) {
        S.cards[k].due = Date.now() - 3600000; n++;
      }
    });
    H.save(); H.render();
  });
  await sleep(250);
  ok('review session: due count reflects overdue cards', await page.evaluate(() => window.__HKD.plan().due.length >= 2));
  await page.click('[data-act="start"]'); await sleep(400);
  ok('review session starts with a card', await page.evaluate(() => !!window.__HKD.sess && window.__HKD.sess.queue.length >= 2));
  await page.click('[data-act="quit"]'); await sleep(300);
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(200); }

  /* ---- 15. keyboard: 1-4 answers MC, Enter advances ---- */
  await page.evaluate(() => {
    const H = window.__HKD, S = H.S; S.settings.dailyNew = 0;
    const cid = H.activeCourse().id;
    const k = Object.keys(S.cards).find(x => S.cards[x].state === 'review' &&
      H.ITEMS[x.split('|')[0]] && H.courseIdOf(H.ITEMS[x.split('|')[0]]) === cid);
    S.cards[k].due = Date.now() - 60000; H.save(); H.render();
  });
  await page.click('[data-act="start"]'); await sleep(400);
  const kbType = await page.evaluate(() => window.__HKD.liveEx && window.__HKD.liveEx.type);
  if (kbType === 'mc') {
    await page.keyboard.press('1'); await sleep(250);
    ok('keyboard: digit answers MC', await page.$('.fb') !== null);
    await page.keyboard.press('Enter'); await sleep(250);
    ok('keyboard: Enter advances', await page.evaluate(() => !window.__HKD.sess || !window.__HKD.sess.reveal));
  } else { ok('keyboard: digit answers MC', true, 'skipped — non-mc card first (' + kbType + ')'); ok('keyboard: Enter advances', true, 'skipped'); }
  if (await page.$('[data-act="quit"]')) { await page.click('[data-act="quit"]'); await sleep(250); }

  /* ---- 16. themes, small screen, reduced motion ---- */
  await page.click('[data-view="today"]').catch(() => {}); await sleep(200);
  await page.click('[data-act="theme"]'); await sleep(200);
  ok('light theme applies', await page.evaluate(() => document.documentElement.classList.contains('light')));
  await page.screenshot({ path: 'shots/light.png' });
  await page.click('[data-act="theme"]'); await sleep(150);
  await page.setViewportSize({ width: 320, height: 640 }); await sleep(250);
  ok('320px: renders without horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= 325));
  await page.screenshot({ path: 'shots/narrow.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload(); await sleep(600);
  ok('reduced motion: app boots clean', pageErrs.length === 0 && await page.evaluate(() => document.querySelectorAll('#app *').length > 20));
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  /* ---- 17. reset + corrupted save ---- */
  await page.click('[data-view="settings"]'); await sleep(250);
  await page.click('[data-act="reset"]'); await sleep(400); // dialog auto-accepted
  ok('reset: fresh state (no cards, verifySeen 0)', await page.evaluate(() =>
    Object.keys(window.__HKD.S.cards).length === 0 && window.__HKD.S.practiceLog.length === 0));
  await page.evaluate(() => localStorage.setItem('lmaa-hapkido.v1', '{broken json!!'));
  await page.reload(); await sleep(600);
  ok('corrupted save: recovers to a fresh, usable app', await page.evaluate(() =>
    document.querySelectorAll('.ccard').length === 2 && Object.keys(window.__HKD.S.cards).length === 0)
    && pageErrs.length === 0, JSON.stringify(pageErrs).slice(0, 200));

  /* ---- 18. the two courses (fresh state after corruption recovery) ---- */
  ok('a wiped save lands back on the course picker', await page.evaluate(() =>
    window.__HKD.view === 'courses' && document.querySelectorAll('.ccard').length === 2));

  await page.click('[data-course="art"]'); await sleep(400);
  await page.click('[data-act="start"]'); await sleep(500);
  const tkOnly = await page.evaluate(() => {
    const H = window.__HKD;
    const teaches = H.sess.queue.filter(s => s.t === 'teach');
    return { n: teaches.length, all: teaches.every(s => H.courseIdOf(H.ITEMS[s.id]) === 'art'),
             courseId: H.sess.courseId, head: !!document.querySelector('.sess-course') };
  });
  ok('techniques course teaches only technique items', tkOnly.n > 0 && tkOnly.all && tkOnly.courseId === 'art', JSON.stringify(tkOnly));
  ok('the session says which course it belongs to', tkOnly.head);
  await page.screenshot({ path: 'shots/session-techniques.png' });
  await page.click('[data-act="quit"]'); await sleep(350);
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(250); }

  // Spend the whole techniques budget for today, then prove the other
  // course still has its own full allowance — the point of two courses.
  const budget = await page.evaluate(async () => {
    const H = window.__HKD;
    const cap = H.S.settings.dailyNew;
    H.S.days[new Date().toISOString().slice(0, 10)] = { reviews: 0, newItems: cap, ms: 0, correct: 0, total: 0, newByCourse: { art: cap } };
    H.save(); H.render();
    return { cap, artNew: H.plan('art').newIds.length, wayNew: H.plan('way').newIds.length,
             artUsed: H.newToday('art'), wayUsed: H.newToday('way') };
  });
  ok('daily new-item budgets are per course, not shared',
    budget.cap > 0 && budget.artNew === 0 && budget.wayNew === budget.cap && budget.artUsed === budget.cap && budget.wayUsed === 0,
    JSON.stringify(budget));

  await page.evaluate(() => { window.__HKD.switchCourse('way'); }); await sleep(350);
  await page.click('[data-act="start"]'); await sleep(500);
  const knOnly = await page.evaluate(() => {
    const H = window.__HKD;
    const teaches = H.sess.queue.filter(s => s.t === 'teach');
    return { n: teaches.length, all: teaches.every(s => H.courseIdOf(H.ITEMS[s.id]) === 'way'), courseId: H.sess.courseId };
  });
  ok('terminology course teaches only knowledge items', knOnly.n > 0 && knOnly.all && knOnly.courseId === 'way', JSON.stringify(knOnly));
  await page.click('[data-act="quit"]'); await sleep(350);
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(250); }

  // The belt-test review: one session that deliberately crosses both,
  // versus a course session that deliberately does not.
  const both = await page.evaluate(() => {
    const H = window.__HKD;
    H.S.days = {}; H.S.settings.dailyNew = 0;
    const due = Date.now() - 3600000;
    H.S.introduced['t-dojang'] = due; H.S.cards['t-dojang|recog'] = { S: 5, D: 4, due, last: due, reps: 2, lapses: 0, state: 'review' };
    H.S.introduced['x-ap-chagi'] = due; H.S.cards['x-ap-chagi|t-id'] = { S: 5, D: 4, due, last: due, reps: 2, lapses: 0, state: 'review' };
    H.save();
    const courseIds = q => [...new Set(q.filter(s => s.t === 'card').map(s => H.courseIdOf(H.ITEMS[s.key.split('|')[0]])))].sort();
    H.startSession('*');
    const all = { n: H.sess.queue.length, courses: courseIds(H.sess.queue), courseId: H.sess.courseId };
    H.startSession('way');
    const one = { n: H.sess.queue.length, courses: courseIds(H.sess.queue), courseId: H.sess.courseId };
    H.sess = null; H.view = 'today'; H.render();
    return { all, one };
  });
  ok('the everything-review session crosses both courses',
    both.all.courses.join() === 'art,way' && both.all.courseId === null, JSON.stringify(both.all));
  ok('a course session never pulls in the other course\'s due cards',
    both.one.courses.join() === 'way' && both.one.courseId === 'way' && both.one.n < both.all.n, JSON.stringify(both.one));
  await page.evaluate(() => { window.__HKD.view = 'today'; window.__HKD.render(); }); await sleep(250);

  /* ---- 19. a course choice, and each course's progress, survive a reload ---- */
  await page.evaluate(() => {
    const H = window.__HKD;
    H.switchCourse('art');
    H.S.introduced = {}; H.S.cards = {};              // exactly one item per course
    H.S.introduced['x-junbi-seogi'] = Date.now();
    H.S.cards['x-junbi-seogi|t-id'] = H.newCard();
    H.S.introduced['t-dojang'] = Date.now();
    H.S.cards['t-dojang|recog'] = H.newCard();
    H.save();
  });
  await sleep(250);
  await page.reload(); await sleep(700);
  ok('the chosen course survives a reload (no picker again)', await page.evaluate(() =>
    window.__HKD.view === 'today' && window.__HKD.activeCourse().id === 'art'));
  ok('each course keeps its own place independently', await page.evaluate(() => {
    const H = window.__HKD;
    return H.stats('art').introduced === 1 && H.stats('way').introduced === 1 && H.stats().introduced === 2;
  }));
  ok('course readiness is measured on that course only', await page.evaluate(() => {
    const H = window.__HKD, belt = H.activeBelt();
    const a = H.beltStats(belt, 'art'), w = H.beltStats(belt, 'way'), all = H.beltStats(belt);
    return a.total > 0 && w.total > 0 && a.total + w.total === all.total && a.total !== all.total;
  }));
  ok('only the techniques course carries physical requirements', await page.evaluate(() => {
    const H = window.__HKD, belt = H.activeBelt();
    return H.beltStats(belt, 'way').vreq === 0 && H.beltStats(belt, 'art').vreq > 0;
  }));
  ok('progress tab breaks the numbers out per course', await page.evaluate(() => {
    window.__HKD.view = 'progress'; window.__HKD.render();
    return document.querySelectorAll('.cprow').length === 2 && document.body.textContent.includes('Course by course');
  }));
  await page.screenshot({ path: 'shots/progress-courses.png', fullPage: true });
  ok('a backup carries the chosen course', await page.evaluate(() => {
    const H = window.__HKD;
    return JSON.parse(JSON.stringify(H.S)).settings.activeCourseId === 'art';
  }));
  ok('an unknown course id in a save falls back to the picker, not a crash', await page.evaluate(() => {
    const H = window.__HKD;
    H.S.settings.activeCourseId = 'no-such-course';
    H.save();
    return true;
  }) && await (async () => { await page.reload(); await sleep(600);
    return page.evaluate(() => window.__HKD.view === 'courses' && !window.__HKD.activeCourse()); })());

  /* ---- 20. the DEPLOYED file ----
     Everything above runs against the folder build (external curriculum).
     GitHub Pages serves the single-file build at the repo root, with the
     curriculum inlined — a different file, and the one students open. It
     gets its own clean context and its own smoke pass. */
  const deployed = 'file://' + path.resolve('..', 'index.html');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const dp = await ctx.newPage();
  const dErrs = [];
  dp.on('console', m => { if (m.type() === 'error') dErrs.push(m.text()); });
  dp.on('pageerror', e => dErrs.push(String(e)));
  await dp.goto(deployed); await sleep(800);
  ok('deployed single file: boots with the curriculum inlined, no errors', await dp.evaluate(() =>
    !!window.CURRICULUM && window.CURRICULUM.items.length > 0 && !!window.__HKD) && dErrs.length === 0,
    JSON.stringify(dErrs).slice(0, 200));
  // The app is installable, so Chrome fetches the manifest on load. That is
  // the ONLY thing it may ever request, and it must be same-origin: the
  // property that matters is that nothing is fetched from anyone else, ever.
  ok('deployed single file: requests nothing except its own manifest', await dp.evaluate(() => {
    const origin = location.href.replace(/[^/]*$/, '');
    return performance.getEntriesByType('resource')
      .filter(r => !r.name.startsWith('data:'))
      .every(r => r.name.startsWith(origin) && /manifest\.webmanifest$/.test(r.name));
  }), JSON.stringify(await dp.evaluate(() => performance.getEntriesByType('resource').map(r => r.name).slice(0, 5))));
  ok('deployed single file: contacts no third-party origin', await dp.evaluate(() => {
    const origin = location.origin;
    return performance.getEntriesByType('resource')
      .filter(r => !r.name.startsWith('data:'))
      .every(r => r.name.startsWith(origin) || r.name.startsWith('file://'));
  }));
  ok('deployed single file: course picker offers both courses', await dp.evaluate(() =>
    document.querySelectorAll('.ccard').length === 2 && document.querySelectorAll('.cart svg').length === 2));
  // iOS Add-to-Home-Screen needs a real raster beside the file that links it.
  // Assert the link AND the bytes: a dangling <link> would ship a broken icon
  // silently, and the check above already proves it costs no load-time fetch.
  ok('deployed single file: apple-touch-icon is linked and is a real 180x180 PNG', await (async () => {
    const href = await dp.evaluate(() => {
      const l = document.querySelector('link[rel="apple-touch-icon"]');
      return l && l.getAttribute('href');
    });
    if (href !== 'apple-touch-icon.png') return false;
    const png = path.resolve('..', href);
    if (!fs.existsSync(png)) return false;
    const b = fs.readFileSync(png);
    // PNG signature, then IHDR width/height as big-endian uint32.
    return b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) &&
           b.readUInt32BE(16) === 180 && b.readUInt32BE(20) === 180;
  })(), 'link href, file presence, or PNG dimensions wrong');
  // Installability: the app must open in its own window, not a browser tab.
  // Checks the declarations a browser actually reads before offering Install,
  // and that every icon the manifest promises is a real PNG of the stated size.
  ok('deployed single file: declares itself installable (manifest + iOS meta)', await (async () => {
    const decl = await dp.evaluate(() => ({
      manifest: (document.querySelector('link[rel="manifest"]') || {}).getAttribute
        ? document.querySelector('link[rel="manifest"]').getAttribute('href') : null,
      appleCapable: (document.querySelector('meta[name="apple-mobile-web-app-capable"]') || {}).content,
      statusBar: (document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') || {}).content,
      title: (document.querySelector('meta[name="apple-mobile-web-app-title"]') || {}).content,
    }));
    if (decl.manifest !== 'manifest.webmanifest' || decl.appleCapable !== 'yes' || !decl.title) return false;
    // black-translucent would slide content under the iOS status bar, and
    // nothing here uses safe-area insets — so it must stay opaque.
    if (decl.statusBar !== 'black') return false;
    const mf = path.resolve('..', 'manifest.webmanifest');
    if (!fs.existsSync(mf)) return false;
    const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
    if (m.display !== 'standalone' || !m.name || !m.short_name || !m.start_url) return false;
    // Chrome requires a 192 and a 512; Android wants a maskable one.
    const sizes = m.icons.map(i => i.sizes);
    if (!sizes.includes('192x192') || !sizes.includes('512x512')) return false;
    if (!m.icons.some(i => (i.purpose || '').includes('maskable'))) return false;
    return m.icons.every(i => {
      const p = path.resolve('..', i.src);
      if (!fs.existsSync(p)) return false;
      const b = fs.readFileSync(p);
      const [w, h] = i.sizes.split('x').map(Number);
      return b.readUInt32BE(16) === w && b.readUInt32BE(20) === h;
    });
  })(), 'manifest, iOS meta tags, or a declared icon is missing/wrong');
  await dp.click('[data-course="art"]'); await sleep(450);
  await dp.click('[data-act="start"]'); await sleep(550);
  ok('deployed single file: a course session runs', await dp.evaluate(() =>
    window.__HKD.sess && window.__HKD.sess.courseId === 'art' && !!document.querySelector('.session-wrap')) && dErrs.length === 0,
    JSON.stringify(dErrs).slice(0, 200));
  await dp.screenshot({ path: 'shots/deployed.png' });
  await ctx.close();

  /* ---- summary ---- */
  const fails = results.filter(r => !r.pass);
  console.log('\n==== ' + results.filter(r => r.pass).length + '/' + results.length + ' passed ====');
  if (consoleErrs.length || pageErrs.length) console.log('console errors:', consoleErrs.slice(0, 4), 'page errors:', pageErrs.slice(0, 4));
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('HARNESS CRASH', e); process.exit(2); });
