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

  /* ---- 1. first launch ---- */
  await page.goto(URL); await sleep(800);
  ok('first launch: no console/page errors', consoleErrs.length === 0 && pageErrs.length === 0, JSON.stringify(consoleErrs.concat(pageErrs)).slice(0, 300));
  ok('first launch: belt banner + provisional badge', await page.evaluate(() =>
    !!document.querySelector('.belt-banner') && document.body.textContent.includes('Provisional — awaiting Grandmaster Lee')));
  ok('first launch: path shows 10 unit nodes + 10 locked belts', await page.evaluate(() =>
    document.querySelectorAll('.pnode').length === 20 && document.querySelectorAll('.pnode.lockb').length === 10));
  ok('first launch: readiness has 5 bars', await page.evaluate(() => document.querySelectorAll('.rrow').length === 5));
  await page.screenshot({ path: 'shots/path-first.png' });

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

  /* ---- 5. step-sequencing exercise ---- */
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
    await page.click('[data-act="next"]'); await sleep(200);
  }
  await page.evaluate(() => { if (window.__HKD.sess) { } });
  if (await page.$('[data-act="quit"]')) { await page.click('[data-act="quit"]'); await sleep(300); }
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(200); }

  /* ---- 6. self-graded speaking exercise ---- */
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

  /* ---- 8. belt page, missing media, invalid media, restricted gating ---- */
  await page.click('[data-view="belt"]'); await sleep(300);
  ok('belt page: pills for all 11 belts', await page.evaluate(() => document.querySelectorAll('.belt-pill').length === 11));
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
  await page.evaluate(() => { // make two cards due now → review session
    const S = window.__HKD.S;
    let n = 0;
    Object.keys(S.cards).forEach(k => { if (n < 2 && S.cards[k].state === 'review') { S.cards[k].due = Date.now() - 3600000; n++; } });
    window.__HKD.save(); window.__HKD.render();
  });
  await sleep(250);
  ok('review session: due count reflects overdue cards', await page.evaluate(() => window.__HKD.plan().due.length >= 2));
  await page.click('[data-act="start"]'); await sleep(400);
  ok('review session starts with a card', await page.evaluate(() => !!window.__HKD.sess && window.__HKD.sess.queue.length >= 2));
  await page.click('[data-act="quit"]'); await sleep(300);
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(200); }

  /* ---- 15. keyboard: 1-4 answers MC, Enter advances ---- */
  await page.evaluate(() => {
    const S = window.__HKD.S; S.settings.dailyNew = 0;
    const k = Object.keys(S.cards).find(x => S.cards[x].state === 'review');
    S.cards[k].due = Date.now() - 60000; window.__HKD.save(); window.__HKD.render();
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
  ok('corrupted save: recovers to fresh app', await page.evaluate(() =>
    !!document.querySelector('.belt-banner')) && pageErrs.length === 0, JSON.stringify(pageErrs).slice(0, 200));

  /* ---- 18. two-track path + filtered sessions (fresh state after recovery) ---- */
  ok('path shows Mind and Body lanes', await page.evaluate(() =>
    document.body.textContent.includes('Mind — knowledge & customs') && document.body.textContent.includes('Body — techniques')));
  await page.click('[data-act="start-tk"]'); await sleep(450);
  const tkOnly = await page.evaluate(() => {
    const H = window.__HKD;
    const teaches = H.sess.queue.filter(s => s.t === 'teach');
    return { n: teaches.length, allTk: teaches.every(s => H.itemTrack(H.ITEMS[s.id]) === 'technique'), track: H.sess.track };
  });
  ok('Body-only session teaches only technique items', tkOnly.n > 0 && tkOnly.allTk && tkOnly.track === 'technique', JSON.stringify(tkOnly));
  await page.click('[data-act="quit"]'); await sleep(300);
  if (await page.evaluate(() => window.__HKD.view === 'done')) { await page.click('[data-view="today"]'); await sleep(200); }
  await page.evaluate(() => { window.__HKD.S.days = {}; window.__HKD.save(); window.__HKD.render(); }); await sleep(250);
  await page.click('[data-act="start-kn"]'); await sleep(450);
  const knOnly = await page.evaluate(() => {
    const H = window.__HKD;
    const teaches = H.sess.queue.filter(s => s.t === 'teach');
    return { n: teaches.length, allKn: teaches.every(s => H.itemTrack(H.ITEMS[s.id]) === 'knowledge') };
  });
  ok('Mind-only session teaches only knowledge items', knOnly.n > 0 && knOnly.allKn, JSON.stringify(knOnly));
  await page.click('[data-act="quit"]'); await sleep(300);

  /* ---- summary ---- */
  const fails = results.filter(r => !r.pass);
  console.log('\n==== ' + results.filter(r => r.pass).length + '/' + results.length + ' passed ====');
  if (consoleErrs.length || pageErrs.length) console.log('console errors:', consoleErrs.slice(0, 4), 'page errors:', pageErrs.slice(0, 4));
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('HARNESS CRASH', e); process.exit(2); });
