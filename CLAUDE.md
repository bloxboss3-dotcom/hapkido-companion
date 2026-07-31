# CLAUDE.md — Hapkido Companion

A belt-rank Korean martial-arts training companion for Lee's Martial Arts Academy
(LMAA, Wilsonville OR), built on the engine of Kevin's "Hanbit" Korean-learning app.
Live at: https://bloxboss3-dotcom.github.io/hapkido-companion/
Working title. Read `HANDOFF.md` for current state and roadmap before doing anything.

## NON-NEGOTIABLE INVARIANTS — never weaken these, in any session

1. **The app never awards rank.** It reports preparation. Grandmaster Lee and the
   school award belts. Any copy implying otherwise is a bug.
2. **Safety gating is absolute.** Joint locks, throws, takedowns, breakfalls/rolls,
   choke defenses, weapon defenses: `safetyClass: "instructorSupervisionRequired"`
   (or stricter), NO `practiceAssignment`, `soloSafe: false`. The app teaches
   names/steps/recognition only for these. Nothing — no FSRS stability, streak,
   milestone, or setting — ever unlocks physical practice of a restricted technique.
   Only instructor mode records verification, and only in person.
3. **Everything curriculum-related is PROVISIONAL until Grandmaster Lee approves it.**
   `approvalStatus: "provisional"` + visible badges stay until he signs off. Never
   present researched content as his curriculum.
4. **Original wording only.** Research other schools' published syllabi for
   *structure*, never copy any school's curriculum, text, or numbered system.
5. **No punishment mechanics.** No hearts, lives, timers, streak guilt, or penalties.
   Wrong answers reschedule sooner and get gentle feedback. The celebration layer is
   deliberately asymmetric. Streak tolerates 2 rest days/week.
6. **AI translations/audio are labeled stand-ins** until reviewed by Grandmaster Lee,
   Kevin, or a qualified bilingual martial artist.
7. **The FSRS module is preserved verbatim from Hanbit** (FSRS-5, 19 default weights).
   Do not "improve" it. It schedules knowledge cards only.
8. **Engine vs. content stay separated.** Moving/adding techniques = editing
   `dev/hapkido-companion/data/curriculum.js` only. If a content change requires an
   engine change, the engine is wrong.
9. **The two courses stay separate, and the belt stays shared.** A course owns its
   path, daily new-item budget, milestones and colour. The BELT owns rank, and the
   Belt tab always shows all five readiness measures for the whole belt, both
   courses — a rank is not half a rank. Never gate one course behind the other.

## Architecture (unusual — read before editing)

`index.html` (repo root, served by Pages) is **generated — never edit it by hand.**

- `dev/hanbit-korean.BACKUP-2026-07-30.html` — pristine Hanbit engine (FSRS, FX,
  session machinery, storage). NEVER modified.
- `dev/build/transform.py` — builds the app: takes the Hanbit source, deletes the
  Korean course data, applies anchored string substitutions, appends
  `course-art.js` + `hapkido-part1..5.js` before BOOT (later function declarations
  override the originals — that's the override mechanism), swaps the mascot SVG
  (`avatar-svg.js`), appends `extra.css`. Writes `dev/hapkido-companion/index.html`
  (folder build, external curriculum) AND repo-root `index.html` (single file,
  curriculum inlined — the deployed one). Every anchor is asserted; a failed
  assert means the source drifted — fix the anchor, don't fumble the region.
- `dev/build/hapkido-part1..5.js` — the hapkido layer: courses/catalogue/planner
  (1), exercises/session rendering (2), picker/path/belt/detail views (3), practice/
  instructor/method/settings (4), done/afterRender/actions/listeners/audio (5).
- `dev/build/course-art.js` — the two course emblems as inline SVG (vector, so the
  single-file build stays small and crisp). `window.HKD_COURSE_ART = {way, art}`
  overrides them per course with a URL or data: URI if real artwork ever arrives.
- `dev/hapkido-companion/data/curriculum.js` — ALL content. Belts (data-driven:
  colors/order/gup/units), courses (name/glyph/accent/blurb/fxGlyphs per track),
  domains (with `track: knowledge|technique`, the ONLY thing deciding which course
  an item belongs to), items (term/concept/technique). Ladder rungs auto-skip when
  an item lacks the data (no stepSequence → no sequencing rung).
- `window.__HKD` — debug/test handle used by the test harness. Keep it working.
- `window.HKD_AUDIO` — maps exact Korean text → audio URL/data URI; `speak()`
  prefers it over TTS. This is where Grandmaster Lee's recordings plug in
  (planned: `data/audio.js`).

## The two courses (the app's main shape)

A course is to this app what a language is to a language app. `CURRICULUM.courses`
declares them; `domain.track` assigns items. Adding a third = one data entry.

- `S.settings.activeCourseId` — `''` means "hasn't picked yet", which routes to the
  picker (`view: 'courses'`). Never default it to a course; the choice is the student's.
- `applyCourseIdentity()` repaints `--accent`/`--accent-dim` on `:root` and swaps the
  CONTENTS of `FX_JAMO` (it's an engine `const`, so mutate, never rebind). Everything
  already written against `var(--accent)` recolours for free — keep new UI that way.
- Deliberate default asymmetry: `plan()` / `stats()` / `beltStats()` / `eligibleSequence()`
  with no course mean **everything** (the shared Progress and Belt views want that);
  `startSession()` with no course means **the active course** (the engine calls it bare
  from the path's big button). `startSession('*')` is the explicit both-courses review.
- Daily new-item budgets are per course: `days[key].newByCourse[courseId]`, written by
  the `learnedStep()` override. Studying one course never spends the other's allowance.
- Milestones are per course (`k:<courseId>:<n>`, `b:<courseId>:<beltId>`), plus one
  shared `b<beltId>` when both courses of a belt are complete.
- Colour rule: a course accent must stay clear of the feedback palette — `--good` is
  "correct", `--warn` is "wrong", `--bad` is "danger". Blue and violet are taken.

## Build & test — required before every deploy

```bash
npm ci                                # once: playwright, exactly as locked
npm run build                         # rebuilds both index.html files
npm test                              # 85 checks; needs playwright + chromium
npm run check                         # build + in-sync check + test (what CI runs)
npm run smoke                         # optional: tests the DEPLOYED site (needs network)
```

`playwright` is pinned exactly and `package-lock.json` is committed — CI runs
`npm ci`, so a silent upstream upgrade can't break an unrelated PR. The pin
(1.56.1) matches the chromium build preinstalled in agent sandboxes, so `npm
test` runs there without downloading a browser. `npm run smoke` is deliberately
outside `npm run check`: it loads the live GitHub Pages URL and catches
deploy-only failures (stale deploy, 404 or wrong MIME on an asset) that a
`file://` matrix structurally cannot see. It is not in CI and needs real
network — a sandbox that blocks the browser's egress can't run it.

The matrix must pass 85/85 (grow it with every feature — count goes up, never
down). It covers: boot, course picker + switching + persistence, per-course paths,
per-course daily budgets, course-scoped and both-course sessions, course-scoped vs
whole-belt readiness, FSRS values against hand-computed expectations, wrong-answer
requeue, step sequencing, self-graded speaking, belt gating, cumulative counts,
practice logging + restricted-technique gating, instructor PIN/verify/unverify/
belt-advance, export/import round-trip, malformed import, unknown course id in a
save, orphan-card retirement, missing/broken media states, themes, 320px, reduced
motion, keyboard, reset, corrupted-save recovery. `.github/workflows/verify.yml`
runs all of it on every PR and also fails if the committed `index.html` no longer
matches its source. Deploy = commit + push to `main` (Pages redeploys root
`index.html` automatically). Report honestly what was and wasn't tested; headless
can't test TTS or real video playback.

## Content authoring rules

- Technique items need: nameEnglish/nameHangul/romanization, purpose,
  startingPosition or attackOrGrab, stepSequence (4-6 steps), keyDetails (3+),
  commonErrors (2-3), safetyNotes, safetyClass, instructorCheckpoints (if
  restricted), practiceAssignment ONLY if soloSafe. Quizzes for t-error/t-points
  auto-generate from keyDetails×commonErrors.
- Terms: ko/rom/en (+note). Concepts: body[], keyPoints[], quiz{recog/example/
  unsafe/scenario} (recog minimum).
- Romanization: Revised Romanization until Grandmaster Lee sets house spellings.
  `KO_ROM` map auto-builds from items; romanization follows Hangul everywhere via
  the `showRomanization` setting — keep new Korean-displaying UI consistent with it.
- Bump `CURRICULUM.meta.version` on content changes. Old saves survive: deepMerge
  + orphan-card retirement handle it; verifications keep their granted version.
- Belt progression shape (provisional 10-gup ladder) mirrors the broadly-shared
  arc documented in `docs/hapkido-companion-phase0-report.md` — read it before
  authoring new belts. Locks arrived at yellow; throws/pins/chokes/weapons are
  future belts, all restricted-class.
- New belts want units in BOTH courses, or one course's path goes empty at that
  belt (handled gracefully, but it reads as neglect). A unit's course is decided
  by its items' domains — `unitTrack()` — so a unit mixing tracks lands in
  Techniques. Keep units single-track.

## Context

Kevin is LMAA's head instructor (a TKD black belt learning Hapkido himself — he
can't read Hangul yet, hence romanization-under-everything). Grandmaster C.Y. Lee
(6th-degree) is the final curriculum authority; a bilingual intake questionnaire
(`docs/grandmaster-lee-curriculum-intake.md`) is awaiting his answers — when they
arrive, his real ladder/requirements REPLACE the provisional data (data edit only).
His recorded Korean demo videos/audio are the planned media (drop into
`dev/hapkido-companion/assets/`, wire via item.media / HKD_AUDIO; missing media
shows "Demonstration coming soon" by design). The avatar wears the student's
current belt color (`--beltc`/`--beltstripe`, set in afterRender). Duolingo-like
progressive feel is a core product goal — protect the juice.
