/* ================================================================
   HAPKIDO LAYER — views: path, belt, detail, practice, instructor
   ================================================================ */

let beltView = null;          // belt being viewed on the Belt tab
let beltScope = 'course';     // 'course' (the active one) | 'all'
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
  applyCourseIdentity();
  applyFxSettings();

  // No course picked yet? Then the picker is the app. Nothing to study
  // until a student says which of the two they are here for.
  if (COURSES.length && !activeCourse() && view !== 'courses') view = 'courses';

  if (view === 'session') { app.innerHTML = renderSession(); afterRender(); return; }
  if (view === 'done') { app.innerHTML = shell(renderDone()); afterRender(); return; }

  let body = '';
  if (view === 'today') body = renderPath();
  else if (view === 'courses') body = renderCourses();
  else if (view === 'belt') body = renderBelt();
  else if (view === 'progress') body = renderCourseProgress() + renderProgress();
  else if (view === 'dojang') body = renderDojang();
  else if (view === 'method') body = renderMethod();
  else if (view === 'settings') body = renderSettings();
  else if (view === 'practice') body = renderPractice();
  else if (view === 'instructor') body = renderInstructor();
  else { view = 'today'; body = renderPath(); }
  app.innerHTML = shell(body);
  afterRender();
}

function shell(body) {
  const course = activeCourse();
  const picking = COURSES.length && !course;
  const tabs = [['today', 'Path'], ['belt', 'Belt'], ['dojang', 'Dojang'], ['progress', 'Progress'], ['method', 'Method'], ['settings', 'Settings']];
  const switcher = course
    ? `<button class="cswitch" data-view="courses" title="Switch course" aria-label="Switch course — currently ${esc(course.nameEnglish)}">
         ${courseMark(course)}<span class="cs-name">${esc(course.shortName)}</span><span class="cs-caret">▾</span>
       </button>`
    : '';
  return `
  <header class="top">
    <div class="brand"><span class="mark ko">합</span><span>Hapkido Companion<br><small>working title · provisional curriculum</small></span></div>
    <div class="spacer"></div>
    ${switcher}
    <button class="iconbtn" data-act="theme" title="Light / dark">${S.settings.theme === 'dark' ? '☀' : '☾'}</button>
  </header>
  ${picking ? '' : `<nav class="tabs">${tabs.map(([k, l]) => `<button data-view="${k}" class="${view === k ? 'on' : ''}">${l}</button>`).join('')}</nav>`}
  ${storageOk ? '' : `<div class="notice" style="margin-bottom:14px">
    <b>This browser will not let the app save.</b> Nothing you study here will survive closing the tab.
    That usually means a private window, or the page is running inside another app. Open <code>index.html</code>
    directly in Chrome, Edge, Firefox or Safari and bookmark it — then progress sticks. Export in Settings still works either way.
  </div>`}
  ${body}`;
}

/* ---------- the course picker — two courses, one belt ---------- */
function courseArt(c) {
  const raster = (window.HKD_COURSE_ART || {})[c.id];
  if (raster) return `<span class="cart"><img src="${esc(raster)}" alt="" loading="lazy"></span>`;
  const emblem = (window.HKD_COURSE_EMBLEM || {})[c.id];   // local, trusted markup
  if (emblem) return `<span class="cart emb" style="color:${c.accent}">${emblem}</span>`;
  return `<span class="cart plain"><span class="cart-glyph ko">${esc(c.glyph || '')}</span></span>`;
}

function courseSummary(c) {
  const st = stats(c);
  const p = plan(c);
  const total = eligibleSequence(c).length;
  const all = SEQUENCE.filter(id => courseIdOf(ITEMS[id]) === c.id).length;
  return { st, p, total, all, due: p.due.length + p.newIds.length,
           frac: total ? st.introduced / total : 0 };
}

function renderCourseCard(c, opts) {
  const o = opts || {};
  const s = courseSummary(c);
  const active = activeCourse() && activeCourse().id === c.id;
  const started = s.st.introduced > 0;
  return `<button class="ccard${active ? ' on' : ''}${o.mini ? ' mini' : ''}" data-course="${c.id}" style="--cacc:${c.accent};--cacd:${c.accentDim}">
    ${courseArt(c)}
    <span class="cbody">
      <span class="ctitle">${esc(c.nameEnglish)}</span>
      <span class="ckor ko">${esc(c.nameKorean)}${S.settings.showRomanization && c.rom ? ` <i>${esc(c.rom)}</i>` : ''}</span>
      ${o.mini ? '' : `<span class="cblurb">${esc(c.blurb)}</span>`}
      <span class="cmeta">
        <span class="chip">${s.all} items</span>
        <span class="chip">${started ? s.st.introduced + ' learned' : 'not started'}</span>
        ${s.due ? `<span class="chip accent">${s.due} due today</span>` : '<span class="chip">all clear today</span>'}
      </span>
      <span class="cbar"><i style="width:${Math.round(Math.min(1, s.frac) * 100)}%"></i></span>
    </span>
    <span class="cgo">${active ? 'Studying' : started ? 'Continue' : 'Start'}</span>
  </button>`;
}

function renderCourses() {
  const course = activeCourse();
  const belt = activeBelt();
  return `
  <div class="course-pick">
    <h1>${course ? 'Switch course' : 'Choose your course'}</h1>
    <p class="sub">Two separate courses, the way a language app teaches two separate languages —
      each with its own path, its own daily pace and its own celebrations.
      ${course ? 'Switching loses nothing: each course keeps its own place.' : 'Pick either one. You can switch whenever you like, and the other will be waiting exactly where you left it.'}</p>
    <div class="ccards">${COURSES.map(c => renderCourseCard(c)).join('')}</div>
    <div class="onebelt">
      ${beltBand(belt, true)}
      <div>
        <b>One belt, both courses.</b>
        <span class="faint">Whichever you study, it counts toward the same rank — ${esc(belt.nameEnglish)} right now.
        The app only ever reports how prepared you are. Grandmaster Lee awards the belt, at the school, in person.</span>
      </div>
    </div>
    ${course ? `<div class="row" style="justify-content:center;margin-top:6px"><button class="btn ghost" data-view="today">Stay in ${esc(course.shortName)}</button></div>` : ''}
  </div>`;
}

/* ---------- the belt path (home) ---------- */
/* Counts are per course: a unit shown on the Terminology path reports its
   terms, not the techniques that happen to share it. Without the filter a
   mixed unit reads "0/6 learned" on a path that only contains two of them. */
function unitState(u, courseSel) {
  const course = asCourse(courseSel);
  const all = SEQUENCE.filter(id => ITEMS[id].unit === u.id &&
    (!course || courseIdOf(ITEMS[id]) === course.id));
  // Muted items drop out of the unit's counts, so a unit you are skipping does
  // not sit at "0/4 learned" forever looking like neglected work.
  const ids = all.filter(id => !isMuted(ITEMS[id]));
  const skipped = all.length - ids.length;
  const intro = ids.filter(id => S.introduced[id]).length;
  const held = ids.filter(id => {
    const it = ITEMS[id];
    const c = S.cards[ck(id, ladderFor(it)[0])];
    return c && c.state !== 'new' && (c.S || 0) >= 3;
  }).length;
  const mastered = ids.filter(id => knowledgeMastered(ITEMS[id])).length;
  const techs = ids.filter(id => ITEMS[id].kind === 'technique' && ITEMS[id].instructorRequired);
  const verified = techs.filter(id => S.verifications[id]).length;
  return { ids, intro, held, mastered, skipped, allCount: all.length,
           done: ids.length > 0 && intro === ids.length && held === ids.length,
           sealed: techs.length > 0 && verified === techs.length, techCount: techs.length, verified };
}

function renderPath() {
  const belt = activeBelt();
  const course = activeCourse();
  const p = plan(course);
  const st = stats(course);
  const rec = dayRec(todayKey());
  const total = p.due.length + p.newIds.length;
  const first = st.introduced === 0;
  const doneToday = rec.reviews;

  const units = courseUnits(course, belt);
  const check = '<svg viewBox="0 0 26 26" style="width:15px;height:15px"><path d="M4 14l6 6L22 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const lock = '<svg class="lockico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  const nodec = belt.stripe || (belt.dark ? belt.color : 'var(--accent)');

  // One lane — this course's. Its own numbering, its own glowing next step.
  const renderLane = laneUnits => {
    const states = laneUnits.map(u => unitState(u, course));
    let activeIdx = states.findIndex(s => !s.done);
    return laneUnits.map((u, i) => {
      const s = states[i];
      const allSkipped = s.allCount > 0 && s.ids.length === 0;
      const cls = allSkipped ? 'skipped' : s.done ? 'done' : i === activeIdx ? 'active' : 'up';
      return `<div class="pnode ${cls}" data-gotounit="${u.id}" style="--nodec:${nodec}">
        <div class="dot">${allSkipped ? '–' : s.done ? check : (i + 1)}</div>
        <div class="pinfo">
          <div class="pt">${esc(u.title)}${s.sealed ? '<span class="seal" title="All techniques instructor-verified">✓</span>' : ''}</div>
          <div class="ps">${esc(u.blurb)}</div>
          <div class="ps">${allSkipped
            ? `Skipped for now · ${s.allCount} item${s.allCount === 1 ? '' : 's'} waiting`
            : `${s.intro}/${s.ids.length} learned${s.mastered ? ` · ${s.mastered} mastered` : ''}${s.techCount ? ` · ${s.verified}/${s.techCount} verified` : ''}${s.skipped ? ` · ${s.skipped} skipped` : ''}`}</div>
        </div>
      </div>`;
    }).join('');
  };

  const nextBelts = BELTS.filter(b => b.order > belt.order).map(b => {
    const has = SEQUENCE.some(id => ITEMS[id].beltId === b.id && (!course || courseIdOf(ITEMS[id]) === course.id));
    return `<div class="pnode lockb">
      <div class="dot">${lock}</div>
      <div class="pinfo">
        <div class="pt">${beltBand(b)} ${esc(b.nameEnglish)} <span class="faint" style="font-weight:400;font-size:12px">· ${gupLabel(b)}</span></div>
        <div class="ps">${has ? 'Locked — finish your current belt first' : "Awaiting Grandmaster Lee's curriculum"}</div>
      </div>
    </div>`;
  }).join('');

  const others = otherCourses().filter(c => eligibleSequence(c).length);
  const otherBlock = others.length ? `<div class="card othercourse">
    <h3 style="margin-top:0">Your other course</h3>
    <p class="sub">Waiting exactly where you left it. Studying it costs this one nothing — each course keeps its own daily pace.</p>
    ${others.map(c => renderCourseCard(c, { mini: true })).join('')}
  </div>` : '';

  return `
  ${course ? `<div class="course-banner" style="--cacc:${course.accent};--cacd:${course.accentDim}">
    ${courseMark(course, 30)}
    <div style="flex:1">
      <div class="cb-name">${esc(course.nameEnglish)}</div>
      <div class="cb-sub"><span class="ko">${esc(course.nameKorean)}</span>${S.settings.showRomanization && course.rom ? ` <span class="faint" style="font-family:var(--mono);font-size:11px">${esc(course.rom)}</span>` : ''} · ${esc(course.tagline)}</div>
    </div>
    <button class="btn ghost sm" data-view="courses">Switch</button>
  </div>` : ''}

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
    <h2>${first ? (course ? esc(course.firstStep || ('Begin ' + course.nameEnglish)) : 'Begin your journey') : 'Today'}</h2>
    <p class="sub">${first
      ? (course ? esc(course.blurb) + ' ' : '') + `${units.length} short unit${units.length === 1 ? '' : 's'} at ${esc(belt.nameEnglish)}, and none of it is busywork — it is what your instructors expect you to know.`
      : total === 0
        ? 'Nothing is due in this course. That is the schedule working, not a failure — come back tomorrow rather than grinding ahead.'
        : 'Reviews come first, new material is threaded through them.'}</p>
    <div class="plan">
      <span class="chip accent">Due <b>${p.due.length}</b>${p.dueTotal > p.due.length ? ` <span class="faint">of ${p.dueTotal}</span>` : ''}</span>
      <span class="chip good">New <b>${p.newIds.length}</b></span>
      <span class="chip">Target <b>~${S.settings.sessionMinutes} min</b></span>
      ${doneToday ? `<span class="chip">Done today <b>${doneToday}</b> · ${fmtMin(rec.ms)}</span>` : ''}
      ${st.streak ? `<span class="chip">Streak <b>${st.streak}</b> ${st.streak === 1 ? 'day' : 'days'}</span>` : ''}
    </div>
    <button class="btn primary big" data-act="start" ${total === 0 ? 'disabled' : ''}>
      ${total === 0 ? 'All clear for today' : (first ? `Start Unit 1 — ${esc((units[0] || {}).title || 'the first unit')}` : `Train ${total} card${total === 1 ? '' : 's'}`)}
    </button>
    ${(() => {
      const both = planTotal();
      return both > total ? `<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
        <button class="btn ghost" data-act="start-both">Everything due · both courses <b>${both}</b></button>
        <span class="faint" style="font-size:12px">for the week before a belt test</span>
      </div>` : '';
    })()}
    ${total === 0 && p.remainingInCourse > 0 ? `<div style="margin-top:10px"><button class="btn ghost" data-act="extra">Learn ${Math.min(5, p.remainingInCourse)} extra new items anyway</button></div>` : ''}
  </div>

  <div class="card" style="margin-top:14px">
    <h3 style="margin-top:0">${course ? esc(course.nameEnglish) : 'Your path'} <span class="faint" style="font-weight:400;font-size:12.5px">· ${esc(belt.nameEnglish)}</span></h3>
    <div class="path" data-course="${course ? esc(course.id) : ''}">${renderLane(units) || '<p class="sub">This belt has no units for this course yet.</p>'}</div>
    <h3>The road ahead</h3>
    <div class="path">${nextBelts}</div>
  </div>

  <div class="card">
    <h3 style="margin-top:0">${course ? esc(course.shortName) + ' readiness' : 'Belt readiness'} <span class="faint" style="font-weight:400;font-size:12.5px">· ${esc(belt.nameEnglish)}</span></h3>
    ${renderReadiness(belt, course)}
    <p class="sub" style="margin:10px 0 0"><button class="btn ghost sm" data-view="belt">See all five belt measures</button></p>
  </div>

  ${otherBlock}

  ${first ? `<div class="card"><h3 style="margin-top:0">How this app fits your training</h3>
    <div class="prose">
    <p>This is a <em>training companion</em>, not a substitute for the mat. It builds the half of Hapkido that lives in your head — terminology, principles, sequences, safety — with the same retrieval-and-spacing engine serious language learners use, so class time can go to the half that lives in your body.</p>
    <p>Falls, throws, locks and partner work are learned <em>only</em> with your instructors. The app prepares you for them, tracks what has been instructor-verified, and celebrates like crazy when things stick. It never awards rank — Grandmaster Lee does that.</p>
    </div></div>` : ''}
  `;
}

/* The five measures. Course-scoped on the path, whole-belt on the Belt
   tab — where all five always show, because that is the honest picture
   of a rank. A course with no physical requirements simply has no
   physical bars to draw. */
function renderReadiness(belt, courseSel) {
  const course = asCourse(courseSel);
  const bs = beltStats(belt, course);
  const cum = cumulativeStats(belt, course);
  const physical = !course || bs.practicable > 0 || bs.vreq > 0;
  const row = (label, valText, frac) => `<div class="rrow">
    <div class="rl"><span>${label}</span><span>${valText}</span></div>
    <div class="bar"><i class="${frac >= 1 ? 'good' : ''}" style="width:${Math.round(Math.min(1, frac) * 100)}%"></i></div>
  </div>`;
  return `
    ${row('Knowledge retention', bs.retention == null ? '—' : pct(bs.retention), bs.retention || 0)}
    ${row('Curriculum exposure', `${bs.intro}/${bs.total}`, bs.total ? bs.intro / bs.total : 0)}
    ${row('Knowledge mastered', `${bs.mastered}/${bs.total}`, bs.total ? bs.mastered / bs.total : 0)}
    ${physical ? row('Practice logged (solo-safe)', bs.practicable ? `${bs.practiced}/${bs.practicable}` : '—', bs.practicable ? bs.practiced / bs.practicable : 0) : ''}
    ${physical ? row('Instructor verification', bs.vreq ? `${bs.vdone}/${bs.vreq}` : '—', bs.vreq ? bs.vdone / bs.vreq : 0) : ''}
    ${cum.total ? row('Previous belts (cumulative)', `${cum.mastered}/${cum.total} mastered · ${cum.vdone}/${cum.vreq} verified`, cum.total ? cum.mastered / cum.total : 0) : ''}
    <p class="sub" style="margin:10px 0 0">${physical
      ? 'Practice entries are your own honest log. Verification comes only from an instructor, in person.'
      : 'This course is knowledge, so these are knowledge measures. Practice and verification live in the techniques course.'}
      The belt itself comes from Grandmaster Lee — the app only reports preparation.</p>`;
}

/* ---------- per-course numbers above the shared Progress tab ---------- */
function renderCourseProgress() {
  if (!COURSES.length) return '';
  return `<div class="card" style="margin-bottom:14px">
    <h2 style="margin-top:0">Course by course</h2>
    <p class="sub">Two courses, measured separately. The forecast, consistency grid and card tables below cover everything you study — one habit, one calendar.</p>
    <div class="cprog">${COURSES.map(c => {
      const s = courseSummary(c);
      const active = activeCourse() && activeCourse().id === c.id;
      return `<button class="cprow${active ? ' on' : ''}" data-course="${c.id}" style="--cacc:${c.accent}">
        ${courseMark(c)}
        <span class="cp-body">
          <span class="cp-t">${esc(c.nameEnglish)}${active ? ' <i class="cp-now">studying</i>' : ''}</span>
          <span class="cp-n">${s.st.introduced}/${s.total} met at ${esc(activeBelt().nameEnglish)} · ${s.st.wordsKnown} holding · ${s.st.mature} mature</span>
          <span class="cbar"><i style="width:${Math.round(Math.min(1, s.frac) * 100)}%"></i></span>
        </span>
        <span class="cp-due">${s.due ? s.due + ' due' : 'clear'}</span>
      </button>`;
    }).join('')}</div>
  </div>`;
}

/* ---------- belt tab ---------- */
function renderBelt() {
  const active = activeBelt();
  const viewing = BELT_BY_ID[beltView] || active;
  const preview = viewing.order > active.order;
  const course = beltScope === 'all' ? null : activeCourse();
  const ids = beltItems(viewing.id, true).filter(id => !course || courseIdOf(ITEMS[id]) === course.id);
  const scopeBar = COURSES.length ? `<div class="scopebar">
    ${COURSES.map(c => `<button class="${beltScope !== 'all' && activeCourse() && activeCourse().id === c.id ? 'on' : ''}" data-scope="${c.id}">${esc(c.shortName)}</button>`).join('')}
    <button class="${beltScope === 'all' ? 'on' : ''}" data-scope="all">Everything</button>
  </div>` : '';

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
    const anyAtAll = beltItems(viewing.id, true).length;
    return `${pills}${banner}${scopeBar}
    <div class="card" style="margin-top:14px;text-align:center;padding:34px 20px">
      <div style="font-size:26px;margin-bottom:8px">🥋</div>
      ${anyAtAll
        ? `<b>Nothing from ${esc((course || {}).nameEnglish || 'this course')} at this belt.</b>
           <p class="sub" style="margin:8px 0 0">This belt has ${anyAtAll} requirement${anyAtAll === 1 ? '' : 's'} in the other course — switch the filter above to “Everything” to see them.</p>`
        : `<b>This belt is waiting for Grandmaster Lee's curriculum.</b>
           <p class="sub" style="margin:8px 0 0">When his requirements are entered in <code>data/curriculum.js</code>, this page fills in automatically — the engine never changes. Rank always comes from testing at the school.</p>`}
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
    <p class="sub">Testing is cumulative: earlier material stays live, from both courses. ${cum.mastered}/${cum.total} mastered, ${cum.vdone}/${cum.vreq} verified.</p>
  </div>` : '';

  return `${pills}${banner}${scopeBar}
    ${preview ? '' : `<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Readiness — five measures, never one number</h3>
      <p class="sub" style="margin-top:0">The whole belt, both courses. A rank is not half a rank.</p>${renderReadiness(viewing)}</div>`}
    ${units}${cumCard}`;
}

/* Mental rehearsal. Worth being honest about the size of this one: pooled
   across 37 studies the effect survives publication-bias correction but is
   small (Toth et al. 2020, r≈0.13), well below retrieval practice or
   self-explanation. What the same analysis found is that it works best for
   EXTERNALLY CUED movement — a response to something that happens to you —
   which is exactly the shape of a defence against a grab. So the prompt is
   written around the cue rather than as free-floating visualisation.

   It is rehearsal of knowledge, not practice: no restricted technique is ever
   unlocked by it, and for those the wording deliberately stays on recognising
   the situation and your own footing rather than applying anything to anyone. */
function imageryPrompt(it) {
  const steps = (it.stepSequence || []).length;
  if (!steps) return '';
  const cue = it.attackOrGrab ? lowerFirst(it.attackOrGrab) : null;
  const open = cue
    ? `Picture <b>${esc(cue)}</b> happening — the moment it starts, not after.`
    : `Picture the moment <b>${esc(it.name)}</b> begins.`;
  const body = isRestricted(it)
    ? 'Then walk the steps through in your head: what you would recognise, where your feet go, where your balance is. Rehearsing it mentally is not practising it — this one is still class-only.'
    : 'Then run the steps through in your head at your own pace, feeling where your weight is at each one.';
  return `<div class="imagery"><b>Before class, in your head:</b> ${open} ${body}
    <span class="faint"> Mental rehearsal is a small effect, not a substitute for mat time — but it is free and it costs nothing to do on the bus.</span></div>`;
}

/* Weighted progress for one item, plus what each drill is worth toward it.
   The long exercises carry the most weight, so ordering the steps visibly
   moves a technique further than a recognition question does. Reports
   preparation only — it never awards rank and never unlocks practice. */
function drillProgressBlock(it) {
  const l = ladderFor(it);
  if (l.length < 2) return '';
  const frac = itemProgress(it);
  const pct = Math.round(frac * 100);
  const C = 2 * Math.PI * 18;
  const rows = l.map(sk => {
    const share = Math.round(skillShare(it, sk) * 100);
    const done = Math.round(rungProgress(S.cards[ck(it.id, sk)]) * 100);
    return `<li><span class="dr-name">${esc(SKILL_LABEL[sk] || sk)}</span>
      <span class="dr-bar"><i class="${done >= 100 ? 'good' : ''}" style="width:${done}%"></i></span>
      <span class="dr-share">${share}%</span></li>`;
  }).join('');
  return `<div class="drills">
    <div class="drills-head">
      <svg class="pring" viewBox="0 0 42 42" aria-hidden="true">
        <circle class="pring-bg" cx="21" cy="21" r="18"/>
        <circle class="pring-fg" cx="21" cy="21" r="18"
          stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 21 21)"/>
      </svg>
      <div style="flex:1">
        <div class="drills-pct">${pct}% learned</div>
        <div class="faint" style="font-size:11.5px">Knowledge only — this is preparation, not rank. Each drill counts for as much work as it takes.</div>
      </div>
    </div>
    <ul class="drill-rows">${rows}</ul>
  </div>`;
}

function renderItemDetail(it) {
  const badge = it.approvalStatus && it.approvalStatus !== 'approved'
    ? '<div style="margin:6px 0 10px"><span class="badge-prov sm">Provisional — awaiting Grandmaster Lee</span></div>' : '';
  const domOff = (S.settings.mutedDomains || []).indexOf(it.domain) >= 0;
  const selfOff = (S.settings.mutedItems || []).indexOf(it.id) >= 0;
  const skip = `<div class="skip-row">
    <button class="btn ${selfOff ? '' : 'ghost'}" data-muteitem="${esc(it.id)}" ${domOff ? 'disabled' : ''}>
      ${selfOff ? 'Bring this back into sessions' : 'Skip this one for now'}</button>
    <span class="faint">${domOff
      ? 'The whole ' + esc((DOMAIN_BY_ID[it.domain] || {}).nameEnglish || 'category') + ' category is skipped in Settings.'
      : selfOff ? 'Not scheduled right now. Nothing is lost — its history is waiting.'
                : 'Keeps it out of sessions without deleting anything. Belt readiness still counts it.'}</span>
  </div>`;
  const prov = badge + drillProgressBlock(it) + skip;

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
    ${imageryPrompt(it)}
    ${isRestricted(it) ? supervisionNotice(it) : ''}
    ${(it.instructorCheckpoints || []).length ? `<div class="tip"><b>What your instructor checks</b><ul class="kd">${it.instructorCheckpoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
    ${canPractice(it)
      ? `<div class="row" style="margin-top:12px"><button class="btn" data-practice="${it.id}">Log a solo practice session</button><span class="faint" style="font-size:12px">${logged ? logged + ' logged — self-reported, never “verified”' : 'self-reported, never “verified”'}</span></div>`
      : `<div class="kv" style="margin-top:10px"><b>Practice:</b> in class${it.partnerRequired ? ', with a partner' : ''} — ask your instructor to work on this.</div>`}
    ${ver
      ? `<div class="ver-line">✓ <b>Instructor verified</b> — ${esc(ver.by || 'instructor')}, ${esc(ver.date || '')}${ver.note ? ` · “${esc(ver.note)}”` : ''}<span class="faint"> · curriculum ${esc(ver.curriculumVersion || '')}</span></div>`
      : it.instructorRequired ? `<div class="kv" style="margin-top:8px"><b>Verification:</b> ${knowledgeMastered(it) ? 'knowledge is ready — ask for a check in class' : 'instructor check required (finish the knowledge track first)'}</div>` : ''}`;
}
