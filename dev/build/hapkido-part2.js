/* ================================================================
   HAPKIDO LAYER — exercise generation, session rendering
   ================================================================ */

function mcOptions(answer, cands) {
  return uniqBy([answer].concat((cands || []).filter(x => x != null && x !== '' && x !== answer)), x => x).slice(0, 4);
}
function termPool(item, n) {
  return pool(i => i.kind === 'term' && i.domain === item.domain, item.id, n)
    .concat(pool(i => i.kind === 'term', item.id, n));
}

function makeExercise(key) {
  const item = cardItem(key);
  const skill = cardSkill(key);
  const ex = { key, item, skill, kind: item.kind };

  if (item.kind === 'term') {
    if (skill === 'recog') {
      ex.type = 'mc';
      ex.prompt = 'What does this mean?';
      ex.target = item.ko;
      ex.sub = S.settings.showRomanization ? item.rom : '';
      ex.answer = item.en;
      ex.options = mcOptions(item.en, termPool(item, 8).map(i => i.en));
      ex.speakAfter = item.ko;
    } else if (skill === 'listen') {
      ex.type = 'mc';
      ex.prompt = 'Listen — which term is it?';
      ex.audioOnly = item.ko;
      ex.answer = item.en;
      ex.options = mcOptions(item.en, termPool(item, 8).map(i => i.en));
      ex.revealKo = item.ko;
    } else if (skill === 'recallKO') {
      ex.type = 'mc';
      ex.prompt = 'Which is the Korean for:';
      ex.target = item.en;
      ex.targetEn = true;
      ex.answer = item.ko;
      ex.koOptions = true;
      ex.options = mcOptions(item.ko, pool(i => i.kind === 'term' && i.ko, item.id, 8).map(i => i.ko));
      ex.speakAfter = item.ko;
    } else { // speak — honest self-graded production, out loud
      ex.type = 'self';
      ex.prompt = 'Say it in Korean — out loud, before you reveal.';
      ex.target = item.en;
      ex.targetEn = true;
      ex.answer = item.ko;
      ex.sub2 = item.rom;
      ex.speakAfter = item.ko;
    }
  }

  else if (item.kind === 'concept') {
    const q = (item.quiz || {})[skill.slice(2)];
    ex.type = 'mc';
    if (q && q.a) {
      ex.prompt = q.q || 'Choose the best answer.';
      ex.target = q.target || item.name;
      ex.answer = q.a;
      ex.options = mcOptions(q.a, (q.d || []).slice());
      if (q.why) ex.why = q.why;
    } else {
      // No authored quiz for this rung — fall back to a key-point check.
      const kp = (item.keyPoints || [])[0] || item.name;
      ex.prompt = 'Which is a key point of this concept?';
      ex.target = item.name;
      ex.answer = kp;
      ex.options = mcOptions(kp, pool(i => i.kind === 'concept' && (i.keyPoints || []).length, item.id, 6)
        .map(i => i.keyPoints[0]));
    }
    ex.targetEn = true;
  }

  else { // technique — knowledge rungs only
    if (skill === 't-id') {
      ex.type = 'mc';
      ex.prompt = 'Which technique is this?';
      ex.target = item.purpose || item.attackOrGrab || '';
      ex.targetEn = true;
      ex.answer = item.name;
      ex.options = mcOptions(item.name, pool(i => i.kind === 'technique', item.id, 8).map(i => i.name));
    } else if (skill === 't-situation') {
      ex.type = 'mc';
      ex.prompt = 'What situation does this technique answer?';
      ex.target = item.name;
      ex.targetEn = true;
      ex.answer = item.attackOrGrab || item.startingPosition;
      ex.options = mcOptions(ex.answer,
        pool(i => i.kind === 'technique' && (i.attackOrGrab || i.startingPosition), item.id, 8)
          .map(i => i.attackOrGrab || i.startingPosition));
    } else if (skill === 't-steps') {
      ex.type = 'build';
      ex.stepMode = true;
      ex.prompt = 'Arrange the steps of ' + item.name + ' in order.';
      ex.tiles = item.stepSequence.map((w, i) => ({ w, i }));
      shuffle(ex.tiles);
      ex.orderAnswer = item.stepSequence;
      ex.answer = item.stepSequence.join(' → ');
    } else if (skill === 't-error') {
      ex.type = 'mc';
      ex.prompt = 'One of these is a COMMON MISTAKE in ' + item.name + '. The rest are correct practice. Which is the mistake?';
      ex.answer = pick(item.commonErrors);
      ex.options = mcOptions(ex.answer, shuffle(item.keyDetails.slice()));
      ex.why = 'Knowing the mistake trains your eye — you will spot it in class before it costs anyone.';
    } else { // t-points
      ex.type = 'mc';
      ex.prompt = 'Which is a key point of ' + item.name + '?';
      ex.answer = pick(item.keyDetails);
      ex.options = mcOptions(ex.answer,
        shuffle((item.commonErrors || []).slice())
          .concat(pool(i => i.kind === 'technique' && (i.keyDetails || []).length, item.id, 4)
            .map(i => i.keyDetails[0])));
    }
    if (item.ko) ex.speakAfter = item.ko;
  }

  return ex;
}

/* Commentary routing for hapkido skills. */
function commentaryFor(ctx) {
  const n = ctx.combo || 0;
  if (n >= 12) return pick(COMMENTARY.combo12);
  if (n >= 8) return pick(COMMENTARY.combo8);
  if (n >= 5) return pick(COMMENTARY.combo5);
  if (ctx.nemesis) return pick(COMMENTARY.nemesis);
  if (n >= 3) return pick(COMMENTARY.combo3);
  if (ctx.comeback) return pick(COMMENTARY.comeback);
  if (ctx.close) return pick(COMMENTARY.close);
  if (ctx.skill === 'speak' || ctx.skill === 'recallKO') return pick(COMMENTARY.production);
  if (ctx.skill === 'listen') return pick(COMMENTARY.listening);
  if (ctx.skill === 't-steps') return pick(COMMENTARY.sequencing);
  if (ctx.fast) return pick(COMMENTARY.fast);
  return pick(COMMENTARY.correct);
}

/* Dojang-flavored line banks (mutating the const object is fine). */
COMMENTARY.production = [
  'Recalled cold, out loud. That is the version that shows up in class.',
  'From memory, not recognition — 잘했어요!',
  'You own that term now. Use it next class.',
  'Produced from nothing. That is the hard skill.'
];
COMMENTARY.listening = [
  'Understood by ear — exactly how commands arrive in class.',
  'Heard it and knew it. Line-up Korean is yours.',
  '들었어요! Your ear is training.'
];
COMMENTARY.sequencing = [
  'Steps in order — your body learns faster when your head knows the map.',
  'Sequence locked. In class you can think about feel, not what comes next.',
  'That is the whole technique, in order, from memory.'
];

/* ---------- session rendering (mc / build-steps / self) ---------- */
function renderExercise(step) {
  if (!liveEx || liveEx.key !== step.key || liveEx._pos !== sess.pos) {
    liveEx = makeExercise(step.key);
    liveEx._pos = sess.pos;
    composer.reset();
    sess.build = [];
    sess.selfOpen = false;
    exStart = Date.now();
  }
  const ex = liveEx;
  const fresh = S.cards[step.key] && S.cards[step.key].freshSkill;

  let promptBlock = '';
  if (ex.audioOnly) {
    promptBlock = `<div class="q-kind">${esc(SKILL_LABEL[ex.skill])}</div>
      <div class="q-prompt">${esc(ex.prompt)}</div>
      <div class="row" style="justify-content:center;padding:8px 0 4px">
        <button aria-label="Play audio" class="speak lg" data-speak="${esc(ex.audioOnly)}">${SPEAKER_SVG}</button>
      </div>
      <div class="faint" style="text-align:center;font-size:12px;margin-top:8px">Tap to replay</div>`;
  } else {
    promptBlock = `<div class="q-kind">${esc(SKILL_LABEL[ex.skill])}${fresh ? ' · new exercise type' : ''}</div>
      <div class="q-prompt">${esc(ex.prompt)}</div>
      ${ex.target ? `<div class="q-target ${ex.targetEn ? 'en' : 'ko'} ${(ex.target || '').length > 26 ? 'small' : ''}">${esc(ex.target)}</div>` : ''}
      ${ex.sub ? `<div class="q-rom">${esc(ex.sub)}</div>` : ''}`;
  }

  let answerBlock = '';
  if (ex.type === 'mc') {
    if (!ex._opts) ex._opts = shuffle(ex.options.slice());
    const opts = ex._opts;
    answerBlock = `<div class="grid" style="margin-top:14px">${opts.map(o => {
      let cls = 'opt' + (ex.koOptions ? ' ko-opt' : '');
      if (sess.reveal) {
        if (o === ex.answer) cls += ' right';
        else if (o === sess.reveal.picked) cls += ' wrong';
      }
      const rom = ex.koOptions ? romFor(o) : '';
      return `<button class="${cls}" data-pick="${esc(o)}" ${sess.reveal ? 'disabled' : ''}>${esc(o)}${rom ? `<small>${esc(rom)}</small>` : ''}</button>`;
    }).join('')}</div>`;
  } else if (ex.type === 'build') {
    const chosen = (sess.build || []);
    const full = chosen.length === ex.tiles.length;
    answerBlock = `<div class="build-target steps" id="buildtarget">${chosen.map((t, i) =>
      `<button class="tile step" data-unpick="${i}"><span class="stepnum">${i + 1}.</span><span>${esc(t.w)}</span></button>`).join('')
      || '<span class="faint" style="font-size:13px;align-self:center">tap the steps in order, first to last</span>'}</div>
      <div class="build-pool steps">${ex.tiles.map(t =>
      `<button class="tile step ${chosen.some(c => c.i === t.i) ? 'used' : ''}" data-pickt="${t.i}">${esc(t.w)}</button>`).join('')}</div>
      ${sess.reveal ? '' : `<div class="row" style="margin-top:12px">
        <button class="btn primary" data-act="submit" ${full ? '' : 'disabled'}>Check order</button>
        <button class="btn ghost" data-act="giveup">Show me</button></div>`}`;
  } else if (ex.type === 'self') {
    if (!sess.reveal && !sess.selfOpen) {
      answerBlock = `<div class="row" style="margin-top:16px">
        <button class="btn primary" data-act="selfreveal">Reveal the Korean <span class="faint" style="font-weight:400;font-size:11.5px">↵</span></button>
        <span class="faint" style="font-size:12px">Actually say it first — producing the sound is the exercise.</span></div>`;
    } else if (!sess.reveal) {
      answerBlock = `<div class="q-card" style="margin-top:12px;min-height:0">
        <div class="answer ko" style="font-size:32px">${esc(ex.answer)}</div>
        ${S.settings.showRomanization && ex.sub2 ? `<div class="q-rom">${esc(ex.sub2)}</div>` : ''}
        <div class="row" style="margin-top:10px">
          <button aria-label="Play audio" class="speak" data-speak="${esc(ex.answer)}">${SPEAKER_SVG}</button>
          <span class="faint" style="font-size:12px">Compare, then grade yourself honestly — the schedule only works on the truth.</span>
        </div></div>
        <div class="gradebar" style="margin-top:12px">
          <button data-selfgrade="1">Not yet<b>see it again soon</b></button>
          <button data-selfgrade="3" class="keep">Got it<b>with effort</b></button>
          <button data-selfgrade="4">Instant<b>easy</b></button>
        </div>`;
    }
  }

  const fb = sess.reveal ? renderFeedback(ex) : '';
  return `<div class="q-card">${promptBlock}</div>${answerBlock}${fb}`;
}

function renderFeedback(ex) {
  const r = sess.reveal;
  const good = r.result === 'right' || r.result === 'close';
  const item = ex.item;

  let answerLine = '';
  if (ex.stepMode) {
    answerLine = `<ol class="fb-steps">${ex.orderAnswer.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
  } else if (r.result !== 'right' || ex.revealKo) {
    const shown = ex.revealKo || ex.answer;
    const rom = romFor(shown);
    answerLine = ex.koOptions || (!ex.targetEn && item.kind === 'term')
      ? `<div class="answer ko">${esc(shown)}</div>${rom ? `<div class="q-rom" style="font-size:13px;margin-top:2px">${esc(rom)}</div>` : ''}`
      : `<div class="answer" style="font-size:17px;font-family:inherit">${esc(shown)}</div>`;
  }

  const extra = [];
  if (item.kind === 'term') {
    extra.push(`<div class="note"><span class="ko">${esc(item.ko)}</span> · ${esc(item.rom)} — ${esc(item.en)}</div>`);
    if (item.note) extra.push(`<div class="note">${esc(item.note)}</div>`);
  }
  if (ex.why) extra.push(`<div class="why">${esc(ex.why)}</div>`);
  if (item.kind === 'technique' && isRestricted(item) && (ex.skill === 't-steps' || r.result !== 'right')) {
    extra.push(`<div class="why">Remember: ${esc(item.name)} is practiced physically only ${item.safetyClass === 'partnerWithCare' ? 'with a partner in class' : 'under instructor supervision'}.</div>`);
  }

  const verdict = r.result === 'right' ? 'Correct'
    : r.result === 'close' ? 'Almost'
      : r.result === 'shown' ? 'Here it is' : 'Not quite';
  const mark = good
    ? '<svg class="verdict-mark" viewBox="0 0 26 26"><path d="M4 14l6 6L22 6"/></svg>'
    : '<svg class="verdict-mark" viewBox="0 0 26 26"><path d="M5 13h16"/></svg>';

  const adjust = good && ex.type !== 'self' ? `<div class="gradebar">
      <button data-grade="2">Felt hard<b>sooner</b></button>
      <button data-grade="3" class="keep">Fine<b>keep schedule</b></button>
      <button data-grade="4">Instant<b>later</b></button>
    </div>` : '';

  return `<div class="fb ${good ? 'right' : 'wrong'}">
    <div class="row" style="align-items:flex-start;gap:9px">
      ${mark}
      <div style="flex:1">
        ${r.line ? `<div class="commentary">${esc(r.line)}${romFor(r.line) ? ` <span class="faint" style="font-weight:400;font-size:11px;font-family:var(--mono)">${esc(romFor(r.line))}</span>` : ''}</div>` : ''}
        <div class="verdict" style="color:var(--tx-dim);font-weight:500;font-size:12.5px">${verdict}</div>
      </div>
    </div>
    ${answerLine}
    ${extra.join('')}
    <div class="row" style="margin-top:12px">
      ${ex.speakAfter ? `<button aria-label="Play audio" class="speak" data-speak="${esc(ex.speakAfter)}">${SPEAKER_SVG}</button>` : ''}
      <button class="btn primary" data-act="next">Continue <span class="faint" style="font-weight:400;font-size:11.5px">↵</span></button>
    </div>
    ${adjust}
  </div>`;
}

/* Submit for step-sequencing (order check) — mc uses pickMC, self uses selfGrade. */
function submitAnswer() {
  const ex = liveEx;
  if (!ex || sess.reveal || ex.type !== 'build') return;
  const chosen = sess.build || [];
  if (ex.stepMode && chosen.length !== ex.tiles.length) return;
  const result = chosen.length && chosen.every((t, idx) => t.i === idx) ? 'right' : 'wrong';
  const elapsed = Date.now() - exStart;
  const grade = result === 'right' ? (elapsed < 14000 ? 4 : 3) : 1;
  const line = scoreAnswer(ex, result, elapsed, grade);
  sess.reveal = { result, line };
  if (ex.speakAfter) speak(ex.speakAfter);
  render();
}

function selfGrade(grade) {
  const ex = liveEx;
  if (!ex || ex.type !== 'self' || sess.reveal) return;
  const result = grade > 1 ? 'right' : 'wrong';
  const line = scoreAnswer(ex, result, Date.now() - exStart, grade);
  sess.reveal = { result, line };
  sess.selfOpen = false;
  render();
}

/* ---------- teach cards ---------- */
function teachFooter(kind) {
  const nudge = kind === 'technique'
    ? 'Close your eyes and picture the movement once — imagining it is real practice.'
    : kind === 'concept'
      ? 'Say the main idea back to yourself in your own words before continuing.'
      : 'Say it out loud once before you continue. Producing the sound builds a stronger trace than reading it.';
  return `<div style="margin-top:18px" class="row">
    <button class="btn primary" data-act="learned">Got it — test me</button>
    <span class="faint" style="font-size:12px">${nudge}</span>
  </div>`;
}

function renderTeach(item) {
  const prov = item.approvalStatus && item.approvalStatus !== 'approved'
    ? '<div style="margin-top:12px"><span class="badge-prov sm">Provisional — awaiting Grandmaster Lee</span></div>' : '';

  if (item.kind === 'term') {
    return `<div class="card teach">
      <div class="q-kind">New term · ${esc(item.unitTitle)}</div>
      <div class="row" style="align-items:center;gap:16px">
        <div style="flex:1">
          <div class="big-ko">${esc(item.ko)}</div>
          <div class="rom">${esc(item.rom)}</div>
          <div class="en">${esc(item.en)}</div>
        </div>
        <button aria-label="Play audio" class="speak lg" data-speak="${esc(item.ko)}">${SPEAKER_SVG}</button>
      </div>
      ${item.note ? `<div class="tip">${esc(item.note)}</div>` : ''}
      ${teachFooter('term')}
    </div>`;
  }

  if (item.kind === 'concept') {
    return `<div class="card teach">
      <div class="q-kind">New concept · ${esc(item.unitTitle)}</div>
      <div style="font-size:21px;font-weight:650">${esc(item.name)}</div>
      ${item.ko ? `<div class="rom" style="font-family:var(--ko);font-size:15px">${esc(item.ko)}</div>` : ''}
      ${(item.body || []).map(p => `<p class="sub" style="margin:10px 0 0;font-size:14px;color:var(--tx)">${esc(p)}</p>`).join('')}
      ${(item.keyPoints || []).length ? `<div class="tip"><b>Key points</b><ul class="kd">${item.keyPoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
      ${prov}
      ${teachFooter('concept')}
    </div>`;
  }

  // technique
  return `<div class="card teach">
    <div class="q-kind">New technique · ${esc(item.unitTitle)}</div>
    <div style="font-size:21px;font-weight:650">${esc(item.name)}</div>
    <div class="rom"><span class="ko" style="font-size:16px">${esc(item.ko)}</span> · ${esc(item.rom)}</div>
    ${item.purpose ? `<p class="sub" style="margin:10px 0 0;font-size:14px;color:var(--tx)">${esc(item.purpose)}</p>` : ''}
    ${item.attackOrGrab ? `<div class="kv"><b>Against:</b> ${esc(item.attackOrGrab)}</div>` : ''}
    ${item.startingPosition ? `<div class="kv"><b>Starts:</b> ${esc(item.startingPosition)}</div>` : ''}
    ${mediaSlot(item)}
    ${(item.stepSequence || []).length ? `<div class="tip"><b>The steps</b><ol class="kd">${item.stepSequence.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
    ${(item.keyDetails || []).length ? `<div class="tip"><b>Key points</b><ul class="kd">${item.keyDetails.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
    ${isRestricted(item) ? supervisionNotice(item) : ''}
    ${prov}
    ${teachFooter('technique')}
  </div>`;
}
