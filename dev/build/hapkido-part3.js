/* ================================================================
   HAPKIDO LAYER — views: path, belt, detail, practice, instructor
   ================================================================ */

let beltView = null;          // belt being viewed on the Belt tab
let practiceItemId = null;    // item open in the practice-log view
let practiceState = null;     // transient checklist state
let instrUnlocked = false;    // instructor mode session flag (never persisted)

function beltBand(b, lg) {
  return `<span class="beltband${lg ? ' lg' : ''}" style="background:${b.color}">${b.stripe ? `<i style="background:${b.stripe}"></i>` : ''}</span>`;
}
function gupLabel(b) { return b.gup > 0 ? b.gup + (b.gup === 1 ? 'st' : b.gup === 2 ? 'nd' : b.gup === 3 ? 'rd' : 'th') + ' gup' : '1st Dan'; }

function supervisionNotice(item) {
  const partner = item.safetyClass === 'partnerWithCare';
  return `<div class="notice-supervision"><b>${partner ? 'Partner drills — in class' : 'Instructor supervision required'}</b><br>
    ${partner
      ? 'Practice this with a partner at the dojang, at drilling speed, after your instructor introduces it. Tap or “stop” means instant release — both directions.'
      : 'This is learned physically only with your instructor, on mats. The app teaches the name, steps, and safety points so class time goes further — it never replaces the mat.'}
    ${item.practiceRestrictions ? `<br><span class="faint">${esc(item.practiceRestrictions)}</span>` : ''}
  </div>`;
}

function mediaSlot(item) {
  const m = item.media || {};
  const src = m.videoFullSpeed || m.videoFront || m.videoSide || m.videoSlowMotion || null;
  const hear = item.ko ? ` <button class="speak" style="width:30px;height:30px;display:inline-grid;vertical-align:middle" aria-label="Play audio" data-speak="${esc(item.ko)}">${SPEAKER_SVG}</button>` : '';
  const fallback = `<div class="ms-icon" aria-hidden="true">🎬</div>
      <b>Demonstration coming soon</b><br>
      <span class="faint" style="font-size:12.5px">Grandmaster Lee's video will appear here.${item.ko ? ' Hear the Korean name:' : ''}</span>${hear}`;
  if (!src) return `<div class="media-slot">${fallback}</div>`;
  return `<div class="media-slot has">
    <video controls preload="metadata" src="${esc(src)}" onerror="this.closest('.media-slot').classList.add('failed')"></video>
    <div class="ms-fallback">${fallback}</div>
  </div>`;
}

/* ---------- shell + routing ---------- */
function render() {
  const app = document.getElementById('app');
  document.documentElement.classList.toggle('light', S.settings.theme === 'light');
  applyFxSettings();

  if (view === 'session') { app.innerHTML = renderSession(); afterRender(); return; }
  if (view === 'done') { app.innerHTML = shell(renderDone()); afterRender(); return; }

  let body = '';
  if (view === 'today') body = renderPath();
  else if (view === 'belt') body = renderBelt();
  else if (view === 'progress') body = renderProgress();
  else if (view === 'method') body = renderMethod();
  else if (view === 'settings') body = renderSettings();
  else if (view === 'practice') body = renderPractice();
  else if (view === 'instructor') body = renderInstructor();
  else { view = 'today'; body = renderPath(); }
  app.innerHTML = shell(body);
  afterRender();
}

function shell(body) {
  const tabs = [['today', 'Path'], ['belt', 'Belt'], ['progress', 'Progress'], ['method', 'Method'], ['settings', 'Settings']];
  return `
  <header class="top">
    <div class="brand"><span class="mark ko">합</span><span>Hapkido Companion<br><small>working title · provisional curriculum</small></span></div>
    <div class="spacer"></div>
    <button class="iconbtn" data-act="theme" title="Light / dark">${S.settings.theme === 'dark' ? '☀' : '☾'}</button>
  </header>
  <nav class="tabs">${tabs.map(([k, l]) => `<button data-view="${k}" class="${view === k ? 'on' : ''}">${l}</button>`).join('')}</nav>
  ${storageOk ? '' : `<div class="notice" style="margin-bottom:14px">
    <b>This browser will not let the app save.</b> Nothing you study here will survive closing the tab.
    That usually means a private window, or the page is running inside another app. Open <code>index.html</code>
    directly in Chrome, Edge, Firefox or Safari and bookmark it — then progress sticks. Export in Settings still works either way.
  </div>`}
  ${body}`;
}

/* ---------- the belt path (home) ---------- */
function unitState(u) {
  const ids = SEQUENCE.filter(id => ITEMS[id].unit === u.id);
  const intro = ids.filter(id => S.introduced[id]).length;
  const held = ids.filter(id => {
    const it = ITEMS[id];
    const c = S.cards[ck(id, ladderFor(it)[0])];
    return c && c.state !== 'new' && (c.S || 0) >= 3;
  }).length;
  const mastered = ids.filter(id => knowledgeMastered(ITEMS[id])).length;
  const techs = ids.filter(id => ITEMS[id].kind === 'technique' && ITEMS[id].instructorRequired);
  const verified = techs.filter(id => S.verifications[id]).length;
  return { ids, intro, held, mastered, done: ids.length > 0 && intro === ids.length && held === ids.length,
           sealed: techs.length > 0 && verified === techs.length, techCount: techs.length, verified };
}

function renderPath() {
  const belt = activeBelt();
  const p = plan();
  const st = stats();
  const rec = dayRec(todayKey());
  const total = p.due.length + p.newIds.length;
  const first = st.introduced === 0;
  const doneToday = rec.reviews;

  const units = belt.units || [];
  const check = '<svg viewBox="0 0 26 26" style="width:15px;height:15px"><path d="M4 14l6 6L22 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const lock = '<svg class="lockico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  const nodec = belt.stripe || (belt.dark ? belt.color : 'var(--accent)');

  // Two lanes: mind and body, each with its own numbering and its own glowing next step.
  const renderLane = laneUnits => {
    const states = laneUnits.map(u => unitState(u));
    let activeIdx = states.findIndex(s => !s.done);
    return laneUnits.map((u, i) => {
      const s = states[i];
      const cls = s.done ? 'done' : i === activeIdx ? 'active' : 'up';
      return `<div class="pnode ${cls}" data-gotounit="${u.id}" style="--nodec:${nodec}">
        <div class="dot">${s.done ? check : (i + 1)}</div>
        <div class="pinfo">
          <div class="pt">${esc(u.title)}${s.sealed ? '<span class="seal" title="All techniques instructor-verified">✓</span>' : ''}</div>
          <div class="ps">${esc(u.blurb)}</div>
          <div class="ps">${s.intro}/${s.ids.length} learned${s.mastered ? ` · ${s.mastered} mastered` : ''}${s.techCount ? ` · ${s.verified}/${s.techCount} verified` : ''}</div>
        </div>
      </div>`;
    }).join('');
  };
  const knUnits = units.filter(u => unitTrack(u) === 'knowledge');
  const tkUnits = units.filter(u => unitTrack(u) === 'technique');

  const nextBelts = BELTS.filter(b => b.order > belt.order).map(b => {
    const has = SEQUENCE.some(id => ITEMS[id].beltId === b.id);
    return `<div class="pnode lockb">
      <div class="dot">${lock}</div>
      <div class="pinfo">
        <div class="pt">${beltBand(b)} ${esc(b.nameEnglish)} <span class="faint" style="font-weight:400;font-size:12px">· ${gupLabel(b)}</span></div>
        <div class="ps">${has ? 'Locked — finish your current belt first' : "Awaiting Grandmaster Lee's curriculum"}</div>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="belt-banner" style="--belt:${belt.color}">
    <div class="row" style="gap:14px">
      ${beltBand(belt, true)}
      <div style="flex:1">
        <div class="bb-name">${esc(belt.nameEnglish)} <span class="ko">${esc(belt.nameKorean)}</span>${romFor(belt.nameKorean) ? ` <span class="faint" style="font-size:11.5px;font-family:var(--mono);font-weight:400">${esc(romFor(belt.nameKorean))}</span>` : ''}</div>
        <div class="bb-sub">${gupLabel(belt)} · ${esc(belt.theme)}</div>
      </div>
    </div>
    ${CURRICULUM.meta.approvalStatus !== 'approved' ? `<div class="badge-prov">Provisional — awaiting Grandmaster Lee's approval</div>` : ''}
  </div>

  <div class="card hero" style="margin-top:14px">
    <h2>${first ? 'Begin your White Belt journey' : 'Today'}</h2>
    <p class="sub">${first
      ? 'Etiquette, commands, and your first movements. Ten short units stand between you and being genuinely ready for class.'
      : total === 0
        ? 'Nothing is due. That is the schedule working, not a failure — come back tomorrow rather than grinding ahead.'
        : 'Reviews come first, new material is threaded through them.'}</p>
    <div class="plan">
      <span class="chip accent">Due <b>${p.due.length}</b>${p.dueTotal > p.due.length ? ` <span class="faint">of ${p.dueTotal}</span>` : ''}</span>
      <span class="chip good">New <b>${p.newIds.length}</b></span>
      <span class="chip">Target <b>~${S.settings.sessionMinutes} min</b></span>
      ${doneToday ? `<span class="chip">Done today <b>${doneToday}</b> · ${fmtMin(rec.ms)}</span>` : ''}
      ${st.streak ? `<span class="chip">Streak <b>${st.streak}</b> ${st.streak === 1 ? 'day' : 'days'}</span>` : ''}
    </div>
    <button class="btn primary big" data-act="start" ${total === 0 ? 'disabled' : ''}>
      ${total === 0 ? 'All clear for today' : (first ? 'Start Unit 1 — Entering the Dojang' : `Train ${total} card${total === 1 ? '' : 's'}`)}
    </button>
    ${(() => {
      const pk = plan('knowledge'), pt = plan('technique');
      const nk = pk.due.length + pk.newIds.length, nt = pt.due.length + pt.newIds.length;
      return `<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
        <button class="btn ghost" data-act="start-kn" ${nk ? '' : 'disabled'}>Mind only <b>${nk}</b></button>
        <button class="btn ghost" data-act="start-tk" ${nt ? '' : 'disabled'}>Body only <b>${nt}</b></button>
      </div>`;
    })()}
    ${total === 0 && p.remainingInCourse > 0 ? `<div style="margin-top:10px"><button class="btn ghost" data-act="extra">Learn ${Math.min(5, p.remainingInCourse)} extra new items anyway</button></div>` : ''}
  </div>

  <div class="card" style="margin-top:14px">
    <h3 style="margin-top:0">Mind — knowledge &amp; customs</h3>
    <div class="path">${renderLane(knUnits) || '<p class="sub">Nothing here yet.</p>'}</div>
    <h3>Body — techniques</h3>
    <div class="path">${renderLane(tkUnits) || '<p class="sub">Nothing here yet.</p>'}</div>
    <h3>The road ahead</h3>
    <div class="path">${nextBelts}</div>
  </div>

  <div class="card">
    <h3 style="margin-top:0">Belt readiness — five measures, never one number</h3>
    ${renderReadiness(belt)}
  </div>

  ${first ? `<div class="card"><h3 style="margin-top:0">How this app fits your training</h3>
    <div class="prose">
    <p>This is a <em>training companion</em>, not a substitute for the mat. It builds the half of Hapkido that lives in your head — terminology, principles, sequences, safety — with the same retrieval-and-spacing engine serious language learners use, so class time can go to the half that lives in your body.</p>
    <p>Falls, throws, locks and partner work are learned <em>only</em> with your instructors. The app prepares you for them, tracks what has been instructor-verified, and celebrates like crazy when things stick. It never awards rank — Grandmaster Lee does that.</p>
    </div></div>` : ''}
  `;
}

function renderReadiness(belt) {
  const bs = beltStats(belt);
  const cum = cumulativeStats(belt);
  const row = (label, valText, frac) => `<div class="rrow">
    <div class="rl"><span>${label}</span><span>${valText}</span></div>
    <div class="bar"><i class="${frac >= 1 ? 'good' : ''}" style="width:${Math.round(Math.min(1, frac) * 100)}%"></i></div>
  </div>`;
  return `
    ${row('Knowledge retention', bs.retention == null ? '—' : pct(bs.retention), bs.retention || 0)}
    ${row('Curriculum exposure', `${bs.intro}/${bs.total}`, bs.total ? bs.intro / bs.total : 0)}
    ${row('Knowledge mastered', `${bs.mastered}/${bs.total}`, bs.total ? bs.mastered / bs.total : 0)}
    ${row('Practice logged (solo-safe)', bs.practicable ? `${bs.practiced}/${bs.practicable}` : '—', bs.practicable ? bs.practiced / bs.practicable : 0)}
    ${row('Instructor verification', bs.vreq ? `${bs.vdone}/${bs.vreq}` : '—', bs.vreq ? bs.vdone / bs.vreq : 0)}
    ${cum.total ? row('Previous belts (cumulative)', `${cum.mastered}/${cum.total} mastered · ${cum.vdone}/${cum.vreq} verified`, cum.total ? cum.mastered / cum.total : 0) : ''}
    <p class="sub" style="margin:10px 0 0">Practice entries are your own honest log. Verification comes only from an instructor, in person. The belt itself comes from Grandmaster Lee — the app only reports preparation.</p>`;
}

/* ---------- belt tab ---------- */
function renderBelt() {
  const active = activeBelt();
  const viewing = BELT_BY_ID[beltView] || active;
  const preview = viewing.order > active.order;
  const ids = beltItems(viewing.id, true);

  const pills = `<div class="belt-pills">${BELTS.map(b =>
    `<button class="belt-pill ${b.id === viewing.id ? 'on' : ''}" style="--belt:${b.color}" data-beltsel="${b.id}">${beltBand(b)} ${esc(b.nameEnglish.replace(' Belt', ''))}</button>`).join('')}</div>`;

  const banner = `<div class="belt-banner" style="--belt:${viewing.color}">
    <div class="row" style="gap:14px">
      ${beltBand(viewing, true)}
      <div style="flex:1">
        <div class="bb-name">${esc(viewing.nameEnglish)} <span class="ko">${esc(viewing.nameKorean)}</span>${romFor(viewing.nameKorean) ? ` <span class="faint" style="font-size:11.5px;font-family:var(--mono);font-weight:400">${esc(romFor(viewing.nameKorean))}</span>` : ''}</div>
        <div class="bb-sub">${gupLabel(viewing)} · ${esc(viewing.theme)}</div>
      </div>
    </div>
    ${preview ? '<div class="badge-prov">Preview — not started. Nothing here is unlocked or earned by looking.</div>' : ''}
    ${CURRICULUM.meta.approvalStatus !== 'approved' ? `<div class="badge-prov">Provisional — awaiting Grandmaster Lee's approval</div>` : ''}
  </div>`;

  if (!ids.length) {
    return `${pills}${banner}
    <div class="card" style="margin-top:14px;text-align:center;padding:34px 20px">
      <div style="font-size:26px;margin-bottom:8px">🥋</div>
      <b>This belt is waiting for Grandmaster Lee's curriculum.</b>
      <p class="sub" style="margin:8px 0 0">When his requirements are entered in <code>data/curriculum.js</code>, this page fills in automatically — the engine never changes. Rank always comes from testing at the school.</p>
    </div>`;
  }

  const units = (viewing.units || []).map(u => {
    const uids = ids.filter(id => ITEMS[id].unit === u.id);
    if (!uids.length) return '';
    return `<div class="card" style="margin-top:14px">
      <h2>${esc(u.title)}</h2>
      <p class="sub">${esc(u.blurb)}</p>
      ${uids.map(id => {
        const it = ITEMS[id];
        const stt = STATUS_META[itemStatus(it)];
        const open = expanded[id];
        return `<div class="item-row">
          <div class="unit-h" data-expand="${id}">
            <span class="t" style="font-weight:600;font-size:14.5px">${esc(it.name)}${it.ko && it.kind !== 'term' ? ` <span class="ko faint" style="font-size:13px">${esc(it.ko)}</span>` : ''}${it.kind === 'term' ? ` <span class="ko" style="font-size:15px">${esc(it.ko)}</span>${S.settings.showRomanization && it.rom ? ` <span class="faint" style="font-size:11px;font-family:var(--mono);font-weight:400">${esc(it.rom)}</span>` : ''}` : ''}</span>
            <span class="spacer"></span>
            ${it.optional ? '<span class="st">optional</span>' : ''}
            ${isRestricted(it) ? `<span class="st restrict">${SAFETY_META[it.safetyClass].label}</span>` : ''}
            <span class="st ${stt.cls}">${stt.l}</span>
            <span class="faint">${open ? '▾' : '▸'}</span>
          </div>
          ${open ? `<div class="unit-body">${renderItemDetail(it)}</div>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  const cum = cumulativeStats(viewing);
  const cumCard = cum.total ? `<div class="card" style="margin-top:14px">
    <h2>Also on your test — previous belts</h2>
    <p class="sub">Testing is cumulative: earlier material stays live. ${cum.mastered}/${cum.total} mastered, ${cum.vdone}/${cum.vreq} verified.</p>
  </div>` : '';

  return `${pills}${banner}
    ${preview ? '' : `<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Readiness</h3>${renderReadiness(viewing)}</div>`}
    ${units}${cumCard}`;
}

function renderItemDetail(it) {
  const prov = it.approvalStatus && it.approvalStatus !== 'approved'
    ? '<div style="margin:6px 0 10px"><span class="badge-prov sm">Provisional — awaiting Grandmaster Lee</span></div>' : '';

  if (it.kind === 'term') {
    return `${prov}<div class="row" style="align-items:center;gap:14px">
      <div style="flex:1">
        <div class="big-ko" style="font-size:34px">${esc(it.ko)}</div>
        <div class="rom">${esc(it.rom)}</div>
        <div style="font-size:15px;margin-top:4px">${esc(it.en)}</div>
      </div>
      <button aria-label="Play audio" class="speak" data-speak="${esc(it.ko)}">${SPEAKER_SVG}</button>
    </div>
    ${it.note ? `<div class="tip">${esc(it.note)}</div>` : ''}`;
  }

  if (it.kind === 'concept') {
    return `${prov}${(it.body || []).map(p => `<p style="font-size:14px;margin:0 0 10px">${esc(p)}</p>`).join('')}
      ${(it.keyPoints || []).length ? `<div class="tip"><b>Key points</b><ul class="kd">${it.keyPoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}`;
  }

  // technique
  const ver = S.verifications[it.id];
  const logged = S.practiceLog.filter(p => p.itemId === it.id).length;
  return `${prov}
    ${it.purpose ? `<p style="font-size:14px;margin:0 0 8px">${esc(it.purpose)}</p>` : ''}
    ${it.attackOrGrab ? `<div class="kv"><b>Against:</b> ${esc(it.attackOrGrab)}</div>` : ''}
    ${it.startingPosition ? `<div class="kv"><b>Starts:</b> ${esc(it.startingPosition)}</div>` : ''}
    ${mediaSlot(it)}
    ${(it.stepSequence || []).length ? `<div class="tip"><b>The steps</b><ol class="kd">${it.stepSequence.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
    ${(it.keyDetails || []).length ? `<div class="tip"><b>Key points</b><ul class="kd">${it.keyDetails.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
    ${(it.commonErrors || []).length ? `<div class="tip"><b>Common mistakes to spot</b><ul class="kd">${it.commonErrors.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
    ${(it.safetyNotes || []).length ? `<div class="tip"><b>Safety</b><ul class="kd">${it.safetyNotes.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
    ${isRestricted(it) ? supervisionNotice(it) : ''}
    ${(it.instructorCheckpoints || []).length ? `<div class="tip"><b>What your instructor checks</b><ul class="kd">${it.instructorCheckpoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
    ${canPractice(it)
      ? `<div class="row" style="margin-top:12px"><button class="btn" data-practice="${it.id}">Log a solo practice session</button><span class="faint" style="font-size:12px">${logged ? logged + ' logged — self-reported, never “verified”' : 'self-reported, never “verified”'}</span></div>`
      : `<div class="kv" style="margin-top:10px"><b>Practice:</b> in class${it.partnerRequired ? ', with a partner' : ''} — ask your instructor to work on this.</div>`}
    ${ver
      ? `<div class="ver-line">✓ <b>Instructor verified</b> — ${esc(ver.by || 'instructor')}, ${esc(ver.date || '')}${ver.note ? ` · “${esc(ver.note)}”` : ''}<span class="faint"> · curriculum ${esc(ver.curriculumVersion || '')}</span></div>`
      : it.instructorRequired ? `<div class="kv" style="margin-top:8px"><b>Verification:</b> ${knowledgeMastered(it) ? 'knowledge is ready — ask for a check in class' : 'instructor check required (finish the knowledge track first)'}</div>` : ''}`;
}
