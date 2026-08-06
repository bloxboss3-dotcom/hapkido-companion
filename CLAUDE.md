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
4. **Research widely; write it in our own words.** Hapkido is a shared art and
   this app should cover it as completely as we can — study any published
   syllabus, manual, federation standard or video, name techniques the way the
   art commonly names them, and aim at the whole ladder rather than a thin
   slice. Breadth is a goal, not a risk. The single hard limit is *expression*:
   never paste another school's sentences, teaching notes, or house numbering
   into this app, and never present another school's curriculum as LMAA's.
   Facts, technique names, what a technique defends against and the general
   shape of a syllabus are all free to use; someone else's paragraphs and their
   proprietary numbering are not. Grandmaster Lee's material is the authority
   layer that sits *over* the researched base — it supplements and corrects it,
   which is why the base has to be ours to change.
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
  `course-art.js` + `dojang-art.js` + `hapkido-part1..7.js` before BOOT (later function declarations
  override the originals — that's the override mechanism), swaps the mascot SVG
  (`avatar-svg.js`), appends `extra.css`. Writes `dev/hapkido-companion/index.html`
  (folder build, external curriculum) AND repo-root `index.html` (single file,
  curriculum inlined — the deployed one). Every anchor is asserted; a failed
  assert means the source drifted — fix the anchor, don't fumble the region.
- `dev/build/hapkido-part1..7.js` — the hapkido layer: courses/catalogue/planner
  (1), exercises/session rendering (2), picker/path/belt/detail views (3), practice/
  instructor/method/settings (4), done/afterRender/actions/listeners/audio (5),
  dojang economy/packs/collection (6), obstacle course (7).
- `dev/build/course-art.js` — the two course emblems as inline SVG (vector, so the
  single-file build stays small and crisp). `window.HKD_COURSE_ART = {way, art}`
  overrides them per course with a URL or data: URI if real artwork ever arrives.
- `dev/build/dojang-art.js` — the collectible roster + ONE parametric character
  SVG (trait slots: skin/hair/uniform/trim/sash/accessory/pose/eyes), so thirty
  characters cost a few hundred bytes instead of thirty files. Adding a
  character is a row in `DJ_ROSTER`. **Two rules are load-bearing here:** no
  character may perform a technique (poses are solo — ready/guard/bow/stretch/
  cheer; an illustrated lock or throw is safety misinformation, same reason
  generated technique art is banned), and nothing here is rank — sashes are
  costume, rarity is never a belt colour, and the screen says so.
- `dev/build/hapkido-part7.js` — the obstacle course: your collected class
  fights an obstacle, each unit with its own health bar, rarity driving HP and
  damage, six on the mat and the rest tagging in. **The enemy is never a
  person** — they are 망각 (forgetting), impatience, sloppiness, overconfidence,
  drawn as abstract shapes. Two reasons, both load-bearing: an illustrated
  fight between humans is the same copyable-technique problem the dojang art
  rule exists for, and a game where the class gangs up on a person argues the
  opposite of the Green-belt content on proportionality and responsibility.
  **Losing costs nothing** — no entry fee, no lost characters, no lost ki,
  unlimited retries (invariant 5). Part of the damage comes from items actually
  mastered, so the game points back at the work. Winning unlocks a character
  and the next obstacle, never a rank. `simulateBattle()` is pure and returns
  an event log; playback just animates it, which is why it is testable.
- part6's economy: **기 (ki) pays for WORK, never for being right.** It is
  derived from `S.days[*].reviews`, which counts every graded answer whatever
  the grade — so there is nothing to hook and it survives import for free. Only
  spending is stored. Paying more for correct answers would reintroduce the
  punishment mechanic invariant 5 forbids AND give a student a reason to lie on
  the self-graded speaking drill. A daily cap means grinding past a healthy
  session earns nothing. There is no real-money path and there must never be.
- `dev/hapkido-companion/data/curriculum.js` — ALL content. Belts (data-driven:
  colors/order/gup/units), courses (name/glyph/accent/blurb/fxGlyphs per track),
  domains (with `track: knowledge|technique`, the ONLY thing deciding which course
  an item belongs to), items (term/concept/technique). Ladder rungs auto-skip when
  an item lacks the data (no stepSequence → no sequencing rung).
- `dev/hapkido-companion/manifest.webmanifest` + `apple-touch-icon.png` /
  `icon-192` / `icon-512` / `icon-maskable-512` — what makes it installable
  (own window, no browser chrome). `transform.py` copies them beside BOTH
  builds and asserts each exists, so they must live next to the `index.html`
  that references them. The manifest is the ONLY thing the page fetches at
  load, and it is same-origin — keep it that way; nothing external, ever.
- `SKILL_WEIGHT` (part1) — drills are NOT equal work, so they are not equal
  slices. `t-steps` (order the steps) is 4, `t-explain` 2.5, `t-error`/`t-points`
  1.5, everything else 1 — putting sequencing at ~35% of a full technique (it
  moves whenever a rung is added; never pin the literal number in a test), because it means
  reading every step and placing it, several times the effort of a four-option
  question. `itemProgress()` / `skillShare()` / `rungProgress()` are
  **display-only**: they drive the ring on an item and the "worth N%" line in
  feedback. `knowledgeMastered()` and the five belt measures are deliberately
  untouched — mastery still means every rung holds, and a rank is still not
  half a rank. Weight new long drills; never let weighting unlock anything.
- **Two traps this UI has already fallen into — check new UI against both.**
  (a) *Theme-coloured backgrounds behind fixed-colour art.* Uniforms run from
  near-white to near-black, so a themed backdrop made one family vanish in
  every theme. The dojang room and portraits use FIXED mid-tones for that
  reason. (b) *Korean without romanization.* Kevin cannot read Hangul yet —
  any new Korean-displaying UI must follow `showRomanization` like the rest.
- **Focus (`isMuted`, part1)** — `settings.mutedDomains` / `mutedItems` keep
  chosen categories or items out of scheduling, filtered in
  `eligibleSequence()` (new) and in `plan()`'s due list (reviews). Nothing is
  deleted: cards keep their schedule and unmuting restores them untouched.
  **Muting must never move the belt.** `beltStats()` reads `beltItems()`, not
  `eligibleSequence()`, so the five readiness measures keep counting the whole
  belt — Grandmaster Lee still tests what you skipped, and an app that called
  you "ready" because you hid half the syllabus would be lying about the one
  thing it exists to report. A test pins this; keep any new measure on
  `beltItems()`.
- **Pedagogy — what the exercise mix is for.** Four technique rungs are multiple
  choice (recognition); `t-explain` is the one that makes the student PRODUCE
  before seeing the answer, which is why it exists and why it is weighted 2.5.
  Inducing self-explanation is among the best-evidenced study interventions
  (Bisra et al. 2018 meta, g≈0.55 over 64 studies, and it holds for procedural
  knowledge). It grades against `keyDetails`, so it costs no new content. The
  mental-rehearsal prompt (`imageryPrompt()`, part3) is deliberately *smaller*
  in tone: pooled effects survive publication-bias correction but are modest
  (Toth et al. 2020, r≈0.13), strongest for **externally cued** movement — hence
  the wording is built around the attack as the cue, and it says outright that
  it is not a substitute for mat time. Do not inflate either claim; §2.7 of the
  Phase-0 report is the evidence table this all answers to.
- `window.__HKD` — debug/test handle used by the test harness. Keep it working.
  Note `Object.assign` **invokes** getters and copies values, so accessors must
  go on via `Object.defineProperty` or they silently freeze.
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
npm test                              # 156 checks; needs playwright + chromium
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

The matrix must pass 156/156 (grow it with every feature — count goes up, never
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
`index.html` automatically).

**Deploys are automatic, and the matrix is the only gate.** `verify.yml` has an
`auto-merge` job (`needs: verify`) that squash-merges a green PR, after which
Pages republishes on its own — so a change reaches students with no human
click. It is scoped to non-draft `claude/*` branches; a human's PR still merges
by hand. Two consequences worth holding onto: a check the matrix does not cover
is a check nothing performs, so grow it with every feature; and green tests are
**not** curriculum approval — invariant 3 still stands, content stays
`provisional` until Grandmaster Lee signs off. Keep a PR in draft until it is
genuinely finished, because marking it ready is what ships it. Report honestly what was and wasn't tested; headless
can't test TTS or real video playback.

## Content authoring rules

- Technique items need: nameEnglish/nameHangul/romanization, purpose,
  startingPosition or attackOrGrab, stepSequence (4-6 steps), keyDetails (3+),
  commonErrors (2-3), safetyNotes, safetyClass, instructorCheckpoints (if
  restricted), practiceAssignment ONLY if soloSafe. Quizzes for t-error/t-points
  auto-generate from keyDetails×commonErrors, and keyDetails (2+) also drives
  `t-explain` — so weak, vague keyDetails now cost twice: they make a bad quiz
  AND a bad self-explanation yardstick. Write them as the three things you would
  actually say to a student about to try it.
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
- New belts want items in BOTH courses, or one course's path goes empty at that
  belt (handled gracefully, but it reads as neglect). A test enforces it.
- **A unit MAY hold both courses' items** — "Falling Without Fear" naturally
  teaches the word 낙법 and the falls themselves. `courseUnits()` puts such a
  unit on *both* paths and `unitState()` counts only that course's items, so
  each path shows its own material and its own totals. This replaces the old
  "keep units single-track" rule, which existed because `unitTrack()` handed a
  mixed unit wholly to Techniques — quietly hiding 47 of 83 Terminology items
  and 31 of 41 Techniques items from the path they belonged to. They were still
  scheduled and quizzed, just invisible where the student looks. Two tests now
  pin it: nothing scheduled in a course may be missing from that course's path,
  and no unit may appear on a path with nothing on it for that course.

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
