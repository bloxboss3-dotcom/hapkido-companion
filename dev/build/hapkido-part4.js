/* ================================================================
   HAPKIDO LAYER — practice log, instructor mode, method, settings
   ================================================================ */

function renderPractice() {
  const it = ITEMS[practiceItemId];
  if (!it || !canPractice(it)) {
    return `<div class="card"><h2>Not available for solo practice</h2>
      <p class="sub">This one is practiced in class. Ask your instructor.</p>
      <button class="btn" data-act="pback">Back</button></div>`;
  }
  if (!practiceState) practiceState = { checked: it.practiceAssignment.items.map(() => false), rating: 0 };
  const items = it.practiceAssignment.items;
  const anyChecked = practiceState.checked.some(Boolean);
  return `
  <div class="card">
    <div class="q-kind">Solo practice · self-reported</div>
    <h2>${esc(it.name)} <span class="ko" style="font-size:16px;color:var(--tx-dim)">${esc(it.ko)}</span></h2>
    <p class="sub">Slow and controlled. This log is yours and stays honest — it records that you practiced, never that the technique is “verified.” Instructors do that, in person.</p>
    ${items.map((txt, i) => `<button class="pc-row ${practiceState.checked[i] ? 'on' : ''}" data-pcheck="${i}">
      <span class="box">✓</span><span>${esc(txt)}</span></button>`).join('')}
    <div class="field" style="border:none;padding-top:16px"><div class="lab">How did it feel?
      <small>1 = rough, 5 = smooth. Rate before you look anything up — honest self-assessment is itself a skill.</small></div></div>
    <div class="rate">${[1, 2, 3, 4, 5].map(n =>
      `<button class="${practiceState.rating === n ? 'on' : ''}" data-prate="${n}">${n}</button>`).join('')}</div>
    <div class="row" style="margin-top:8px">
      <button class="btn primary" data-act="psave" ${practiceState.rating && anyChecked ? '' : 'disabled'}>Save practice log</button>
      <button class="btn ghost" data-act="pback">Cancel</button>
    </div>
  </div>`;
}

/* ---------- instructor mode ---------- */
function pinHash(p) { // deterrent, not cryptography — data lives on this device anyway
  let h = 5381; const s = 'lmaa·' + p;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function renderInstructor() {
  if (!instrUnlocked) {
    const setup = !S.instructor.pinHash;
    return `<div class="card" style="max-width:420px;margin:0 auto">
      <h2>Instructor mode</h2>
      <p class="sub">${setup
        ? 'Set a PIN (4–8 digits). It deters casual taps from students — it is not bank security, and everything stays on this device.'
        : 'Enter the instructor PIN.'}</p>
      <input class="typebox" id="pin1" type="password" inputmode="numeric" autocomplete="off" placeholder="PIN" style="font-family:var(--mono);font-size:20px">
      ${setup ? '<input class="typebox" id="pin2" type="password" inputmode="numeric" autocomplete="off" placeholder="repeat PIN" style="font-family:var(--mono);font-size:20px;margin-top:10px">' : ''}
      <div class="row" style="margin-top:12px">
        <button class="btn primary" data-act="${setup ? 'pinset' : 'pinsubmit'}">${setup ? 'Set PIN & open' : 'Open'}</button>
        <button class="btn ghost" data-view="settings">Back</button>
      </div>
    </div>`;
  }

  const active = activeBelt();
  const techs = SEQUENCE.filter(id => ITEMS[id].kind === 'technique' && ITEMS[id].beltOrder <= active.order);
  const gaps = techs.filter(id => itemStatus(ITEMS[id]) === 'ready');
  const now = Date.now();
  const overdue = Object.keys(S.cards)
    .filter(k => ITEMS[k.split('|')[0]] && S.cards[k].state !== 'new' && now - S.cards[k].due > 3 * DAY)
    .sort((a, b) => S.cards[a].due - S.cards[b].due).slice(0, 8);

  return `
  <div class="card">
    <div class="row"><h2 style="margin:0">Instructor mode</h2><span class="spacer"></span>
      <button class="btn ghost" data-act="instrexit">Exit</button></div>
    <p class="sub" style="margin-top:6px">Verification is the only thing in this app that asserts physical skill — and it can only be granted here, in person. Student practice logs are self-reported; knowledge numbers are app-measured.</p>
    <div class="grid two">
      <div class="field" style="border:none;display:block"><div class="lab">Verifying instructor (initials)</div>
        <input class="typebox" id="iv-by" style="font-size:16px;min-height:44px" maxlength="12" value="${esc(S.instructor.lastBy || '')}" placeholder="e.g. KV"></div>
      <div class="field" style="border:none;display:block"><div class="lab">Note (optional)</div>
        <input class="typebox" id="iv-note" style="font-size:16px;min-height:44px" maxlength="80" placeholder="e.g. clean at drilling speed"></div>
    </div>
  </div>

  <div class="card">
    <h2>Student's current belt</h2>
    <p class="sub">Set this to the rank the school has actually awarded — it gates which belts schedule new material. Changing it here records a promotion that happened on the mat; it never grants one.</p>
    <div class="belt-pills">${BELTS.map(b =>
      `<button class="belt-pill ${b.id === active.id ? 'on' : ''}" style="--belt:${b.color}" data-instrbelt="${b.id}">${beltBand(b)} ${esc(b.nameEnglish.replace(' Belt', ''))}</button>`).join('')}</div>
  </div>

  <div class="card">
    <h2>Techniques — ${esc(active.nameEnglish)} and below</h2>
    ${techs.map(id => {
      const it = ITEMS[id]; const ver = S.verifications[id]; const stt = STATUS_META[itemStatus(it)];
      return `<div class="item-row"><div class="row">
        <div style="flex:1"><b style="font-size:14px">${esc(it.name)}</b> <span class="ko faint" style="font-size:12.5px">${esc(it.ko)}</span><br>
          <span class="st ${stt.cls}" style="margin-top:4px">${stt.l}</span>
          ${ver ? `<span class="faint" style="font-size:12px"> ${esc(ver.by || '')} · ${esc(ver.date || '')}${ver.note ? ` · “${esc(ver.note)}”` : ''}</span>` : ''}</div>
        <button class="btn ${ver ? 'ghost' : ''}" data-verify="${id}">${ver ? 'Remove' : 'Verify'}</button>
      </div></div>`;
    }).join('')}
  </div>

  <div class="card">
    <h2>Readiness gaps</h2>
    ${gaps.length ? `<p class="sub">Knowledge mastered, awaiting an in-person check:</p>
      <div class="row wrap">${gaps.map(id => `<span class="chip">${esc(ITEMS[id].name)}</span>`).join('')}</div>`
      : '<p class="sub" style="margin:0">No students techniques are currently waiting on a check.</p>'}
  </div>

  <div class="card">
    <h2>Overdue knowledge</h2>
    ${overdue.length ? `<p class="sub">More than 3 days past due — worth a quick quiz in class:</p>
      ${overdue.map(k => { const it = cardItem(k); const d = Math.round((now - S.cards[k].due) / DAY);
        return `<div class="kv">${esc(it.ko || it.name)} · ${esc(SKILL_LABEL[cardSkill(k)] || '')} — <b>${d}d overdue</b></div>`; }).join('')}`
      : '<p class="sub" style="margin:0">Nothing seriously overdue. The schedule is being kept.</p>'}
  </div>

  <div class="card">
    <h2>Student progress file</h2>
    <p class="sub">Exports include knowledge state, practice logs, and verifications (with instructor, date, and curriculum version).</p>
    <div class="row wrap">
      <button class="btn" data-act="export">Export progress (.json)</button>
      <button class="btn" data-act="import">Import a progress file</button>
    </div>
  </div>`;
}

/* ---------- method ---------- */
function renderMethod() {
  return `<div class="card"><h2>Why the app behaves the way it does</h2>
  <div class="prose">
    <p>Nothing here is decorative. Each mechanic exists because the research on learning points the same way — and one boundary exists because the research on martial-arts injuries points the same way too.</p>

    <h4>Two halves, honestly separated</h4>
    <p>Hapkido lives half in your head — names, sequences, principles, safety — and half in your body. This app trains the head half with the best tools that exist for it, and refuses to pretend about the body half. Physical skill is built on the mat and <em>verified only by your instructors</em>. The app's own vocabulary keeps the line sharp: “knowledge mastered” and “ready to practice in class” are app claims; “instructor verified” is a human's.</p>

    <h4>Retrieval, not review</h4>
    <p>Every card asks you to produce something before it shows you anything. Pulling a term or a step sequence out of memory strengthens it far more than re-reading — the best-replicated finding in the field. It is also why the app feels harder than flipping through notes, and why the harder version wins.</p>

    <h4>Spacing on a real forgetting curve</h4>
    <p>Scheduling is <code>FSRS</code>, which tracks stability, difficulty, and current retrievability per card, and brings each one back just as you are about to lose it. The Progress tab shows the model's predicted recall next to your measured retention, so you can see whether it is calibrated for you.</p>

    <h4>Why some techniques are class-only</h4>
    <p>Injury data in throwing arts is worst for beginners in their first year — before falling skill exists. So falls, throws, locks, and partner defenses here teach names, sequences, and safety points, then stop, on purpose. No streak, no stability number, nothing in this app ever unlocks physical practice of a restricted technique. Your instructor does, in person, and the app records that with their initials and the date.</p>

    <h4>Watch like a student, not a viewer</h4>
    <p>When Grandmaster Lee's demonstrations arrive, each one comes with the key points and common mistakes written next to it — research on video learning is blunt that raw footage without expert cues teaches little. Before re-watching an explanation, the app will usually ask you to recall first; and while watching, imagine performing the movement. Watching-while-imagining measurably outperforms just watching.</p>

    <h4>Difficulty is honored, never punished</h4>
    <p>There are no hearts, no lives, no timers, and no penalty for a miss — a wrong answer simply comes back sooner, which is the schedule learning, not you failing. The celebration layer is deliberately one-sided: right answers escalate from sparks to fireworks; misses get a soft tone and a little training partner who looks mildly concerned on your behalf. That partner wears your current belt — as you advance, so do they.</p>

    <h4>A streak that allows rest</h4>
    <p>The streak tolerates two rest days a week by design. A streak you are afraid to lose starts driving the behavior instead of the learning — and rest is part of training. Ask any instructor.</p>

    <h4>Honest numbers, five of them</h4>
    <p>Belt readiness is never one percentage. Retention, exposure, mastery, practice, and verification are different truths, and collapsing them would let a strong memory hide an unverified fall. The bars stay separate so you — and your instructors — can see exactly what kind of ready you are.</p>

    <h4>What you should do outside the app</h4>
    <p>Go to class. Nothing here replaces mats, partners, and eyes that catch what you cannot feel yet. Between classes: run your reviews, do your solo-safe assignments slowly, picture the restricted techniques step by step, and arrive with one good question for your instructor. That combination — knowledge here, skill there — is the whole design.</p>
  </div></div>`;
}

/* ---------- settings ---------- */
/* Focus — choose what you are NOT working on right now. Grouped by category
   because that is how the wish arrives ("leave the stances alone"), with a
   per-item escape hatch on each item's own page for finer cuts. */
function renderFocus() {
  const muted = mutedCount();
  const rows = ((window.CURRICULUM && CURRICULUM.domains) || []).map(d => {
    const ids = SEQUENCE.filter(id => ITEMS[id].domain === d.id);
    if (!ids.length) return '';
    const off = (S.settings.mutedDomains || []).indexOf(d.id) >= 0;
    const items = ids.filter(id => (S.settings.mutedItems || []).indexOf(id) >= 0).length;
    const course = COURSE_BY_TRACK[d.track];
    return `<div class="focus-row${off ? ' off' : ''}">
      <button class="focus-tog" data-mutedom="${esc(d.id)}" role="switch" aria-checked="${off ? 'false' : 'true'}"
        aria-label="${off ? 'Include' : 'Skip'} ${esc(d.nameEnglish)}">${off ? '＋' : '−'}</button>
      <div class="focus-body">
        <div class="focus-name">${esc(d.nameEnglish)}${course ? ` <span class="faint">· ${esc(course.shortName)}</span>` : ''}</div>
        <div class="focus-sub">${ids.length} item${ids.length === 1 ? '' : 's'}${off ? ' · skipped for now' : items ? ` · ${items} skipped individually` : ''}</div>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="card">
    <h2>Focus — what to skip for now</h2>
    <p class="sub">Turn a category off and it stops appearing in sessions, new and review alike. Nothing is deleted:
    every card keeps its schedule and its history, and turning it back on brings it straight back.</p>
    <div class="focus-list">${rows}</div>
    <div class="notice" style="margin-top:12px">
      <b>This never changes your belt readiness.</b> The Belt tab keeps measuring the whole belt, because
      Grandmaster Lee still tests the whole belt. Skipping something here changes what you study today —
      it does not change what you will be asked to show.
    </div>
    ${muted ? `<div class="row" style="margin-top:12px">
      <button class="btn" data-act="unmuteall">Bring back everything (${muted} item${muted === 1 ? '' : 's'} skipped)</button>
    </div>` : ''}
  </div>`;
}

function renderSettings() {
  const st = stats();
  const koVoices = voices;
  return `
  ${renderFocus()}
  <div class="card">
    <h2>Study settings</h2>
    <p class="sub">These are the two dials that actually matter. Everything else is cosmetic.</p>
    <div class="field"><div class="lab">New items per day
      <small>Each new item becomes several scheduled cards, so this drives future workload more than anything else. Six is a sustainable pace alongside real classes.</small></div>
      <div class="ctl"><input type="number" min="0" max="40" value="${S.settings.dailyNew}" data-set="dailyNew"></div></div>
    <div class="field"><div class="lab">Target retention
      <small>The recall probability the scheduler aims for. Around 0.85–0.90 maximises memory per minute for most people.</small></div>
      <div class="ctl"><input type="range" min="0.75" max="0.97" step="0.01" value="${S.settings.targetRetention}" data-set="targetRetention">
      <span class="faint" style="font-size:12px;margin-left:8px">${Number(S.settings.targetRetention).toFixed(2)}</span></div></div>
    <div class="field"><div class="lab">Session length target
      <small>The app suggests stopping here. You can always continue.</small></div>
      <div class="ctl"><select data-set="sessionMinutes">${[10, 15, 20, 25, 30, 45, 60].map(m =>
    `<option value="${m}" ${S.settings.sessionMinutes === m ? 'selected' : ''}>${m} min</option>`).join('')}</select></div></div>
    <div class="field"><div class="lab">Daily review cap
      <small>A safety valve for coming back after a break. Overdue cards are deferred, never lost.</small></div>
      <div class="ctl"><input type="number" min="20" max="500" step="10" value="${S.settings.reviewCap}" data-set="reviewCap"></div></div>
  </div>

  <div class="card">
    <h2>Sound</h2>
    <div class="field"><div class="lab">Korean voice
      <small>${koVoices.length ? koVoices.length + ' Korean voice(s) available — best one auto-selected. Want it to sound better? On iPhone: Settings → Accessibility → Spoken Content → Voices → Korean → download an Enhanced/Premium voice, then pick it here. On Android: update Google Speech Services. All of this is a stand-in until Grandmaster Lee records the real audio.' : 'No Korean voice found. Chrome and Edge usually have one built in; on Windows add Korean under Settings → Time & language → Language.'}</small></div>
      <div class="ctl">${koVoices.length ? `<select data-set="ttsVoice">${koVoices.map(v =>
      `<option value="${esc(v.name)}" ${S.settings.ttsVoice === v.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select>` : '<span class="faint">unavailable</span>'}</div></div>
    <div class="field"><div class="lab">Speech rate</div>
      <div class="ctl"><input type="range" min="0.5" max="1.2" step="0.05" value="${S.settings.ttsRate}" data-set="ttsRate">
      <span class="faint" style="font-size:12px;margin-left:8px">${Number(S.settings.ttsRate).toFixed(2)}×</span></div></div>
    <div class="field"><div class="lab">Test it</div><div class="ctl"><button class="btn" data-speak="차렷! 경례!">Play a sample</button></div></div>
  </div>

  <div class="card">
    <h2>Effects</h2>
    <p class="sub">Celebrating a correct answer is honest feedback, so it is turned all the way up by default. What is deliberately absent is the other half of the usual formula — no hearts, no timers, no penalty for a wrong answer.</p>
    <div class="field"><div class="lab">Visual effects
      <small>Full gives you the confetti, combo escalation and fireworks. Subtle keeps feedback, drops particles. Off removes all of it, including your avatar.</small></div>
      <div class="ctl"><select data-set="fxLevel">
        ${[['full', 'Full'], ['subtle', 'Subtle'], ['off', 'Off']].map(([v, l]) =>
      `<option value="${v}" ${S.settings.fxLevel === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select></div></div>
    <div class="field"><div class="lab">Sound effects
      <small>Synthesised in the browser — no files. The wrong-answer sound is a soft low tone, on purpose.</small></div>
      <div class="ctl"><button class="switch ${S.settings.sound ? 'on' : ''}" data-toggle="sound"><i></i></button></div></div>
    <div class="field"><div class="lab">Volume</div>
      <div class="ctl"><input type="range" min="0" max="1" step="0.05" value="${S.settings.volume}" data-set="volume">
      <span class="faint" style="font-size:12px;margin-left:8px">${Math.round(Number(S.settings.volume) * 100)}</span></div></div>
    <div class="field"><div class="lab">Spoken praise
      <small>The Korean voice says 잘했어요 or 대박 on streaks. Off by default.</small></div>
      <div class="ctl"><button class="switch ${S.settings.spokenPraise ? 'on' : ''}" data-toggle="spokenPraise"><i></i></button></div></div>
    <div class="field"><div class="lab">Try it</div>
      <div class="ctl"><button class="btn" data-act="demofx">Fire the big one</button></div></div>
  </div>

  <div class="card">
    <h2>Display</h2>
    <div class="field"><div class="lab">Show romanized Korean
      <small>Helpful at first. As terms stick, try turning it off and trusting your ear.</small></div>
      <div class="ctl"><button class="switch ${S.settings.showRomanization ? 'on' : ''}" data-toggle="showRomanization"><i></i></button></div></div>
    <div class="field"><div class="lab">Theme</div>
      <div class="ctl"><select data-set="theme"><option value="dark" ${S.settings.theme === 'dark' ? 'selected' : ''}>Dark</option><option value="light" ${S.settings.theme === 'light' ? 'selected' : ''}>Light</option></select></div></div>
  </div>

  <div class="card">
    <h2>Instructor</h2>
    <p class="sub">Verify techniques in person, see readiness gaps and overdue knowledge, and manage student progress files. PIN-protected.</p>
    <button class="btn" data-act="instructor">Open instructor mode</button>
  </div>

  <div class="card">
    <h2>Your data</h2>
    <p class="sub">Everything lives in this browser and nowhere else — no account, no server, no analytics. Clearing site data wipes progress, so export a backup occasionally.</p>
    <div class="row wrap">
      <button class="btn" data-act="export">Export progress (.json)</button>
      <button class="btn" data-act="import">Import a backup</button>
      <button class="btn ghost" data-act="reset">Reset everything</button>
    </div>
    <p class="sub" style="margin:14px 0 0">${st.cards} scheduled cards · ${S.log.length} logged reviews · ${S.practiceLog.length} practice entries · ${Object.keys(S.verifications).length} verifications · started ${new Date(S.created).toLocaleDateString()}</p>
    <p class="sub" style="margin:10px 0 0">Curriculum <b>${esc(S.curriculumVersion)}</b> · ${CURRICULUM.meta.approvalStatus === 'approved' ? 'approved by ' + esc(CURRICULUM.meta.approvedBy || '') : 'provisional — awaiting Grandmaster Lee'}.</p>
    <p class="sub" style="margin:10px 0 0;font-size:12px">This app is a training companion for students of the school. It never awards rank, never certifies physical competence, and is not emergency, medical, legal, or self-defense advice.</p>
    <input type="file" id="importfile" accept="application/json" style="display:none">
  </div>`;
}
