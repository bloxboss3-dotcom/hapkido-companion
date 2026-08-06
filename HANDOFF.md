# HANDOFF — state of the project (July 31, 2026)

Built in Claude Cowork over one intensive stretch; continuing in Claude Code from
this repo. Read `CLAUDE.md` first — especially the invariants.

## Where things stand — v0.5.0-provisional (deployed)

- **Two courses.** The headline change. Terminology & Philosophy (73 items) and
  Techniques (33 items) are now separate courses the way a language app has
  separate languages: a picker on first launch, a header switcher, and per-course
  paths, daily budgets, readiness bars, colours, celebration glyphs and
  milestones. The belt is deliberately shared — the Belt tab still shows all five
  measures for the whole belt, and one "everything due" session crosses both for
  the week before a test. Courses live in `CURRICULUM.courses`; `domain.track`
  assigns items; a third course is a data entry.
- **Engine:** Hanbit's FSRS-5 scheduler, session planner, FX/celebration system,
  storage/migration safety — preserved via the transform-override build
  (`dev/build/`). 156/156 automated checks passing.
- **Repo:** `npm run build` / `npm test` / `npm run check`, plus a GitHub Actions
  job that rebuilds `index.html` on every PR and fails if the deployed file has
  drifted from the source it is generated from. Dependencies are locked
  (`package-lock.json`, `playwright` pinned exactly, CI on `npm ci`) so an
  upstream release can't break an unrelated PR. `npm run smoke` optionally
  checks the deployed site — the one failure class `file://` tests can't see.
- **Installs as a real app.** A web app manifest (`display: standalone`) plus the
  Apple meta tags, so adding it to a home screen opens it in its own window with
  no browser chrome — on iOS *and* on Android/desktop Chrome, which now offers a
  proper Install prompt. iOS status-bar style is the opaque `black` on purpose:
  `black-translucent` slides content under the status bar and nothing in this
  app uses safe-area insets.
  Icon set: `apple-touch-icon.png` (180), `icon-192`, `icon-512`, and
  `icon-maskable-512` (art inset into Android's safe zone so a circular mask
  can't clip the ring). The enso ink ring is generated art; the 합 is
  composited from a real Korean font (Noto Sans KR), **not** drawn by the image
  model — an approximated Hangul glyph is not acceptable on this app.
  `transform.py` copies all five files plus the manifest beside both builds and
  asserts each exists. Nothing here is needed for the app to *run*: it still
  works with the network off, and the only load-time request is the manifest,
  same-origin. Nothing external is ever contacted.
- **Step sequencing reads as a result, not a wall of text.** A wrong order now
  marks the student's own answer — green tick for right place, red with the
  position it belongs in ("→ 3"), a "3 of 5 in the right place" tally — and the
  correct list underneath fades what was already right. The tile pool is
  dropped once checked (it was a third copy of the same sentences). Colour is
  never the only signal; every step carries an aria-label. Grading was fixed
  too: the flat 14s "easy" threshold, inherited from 3.2s multiple choice, made
  the longest exercise in the app effectively unable to earn the longer
  interval, so it kept coming back to be re-read. It now scales with the
  reading load.
- **Drills are weighted by effort** (`SKILL_WEIGHT`): ordering the steps is
  ~44% of a technique, recognition drills 11% each. An item detail shows a
  progress ring and a per-drill breakdown, and session feedback says what the
  drill just answered was worth. Display only — `knowledgeMastered()` and the
  five belt measures are unchanged, and nothing here unlocks practice.
- **The Dojang (collectibles).** A sixth tab. Training earns 기 (ki); ki buys
  packs; packs roll 30 characters across Common/Rare/Legendary/Mythical, and
  whoever you own lives in a room and wanders about. Guardrails that are part
  of the design, not decoration: ki is earned for **work done, never for being
  right** (derived from `days[*].reviews`, so a wrong answer pays exactly the
  same — anything else would punish mistakes and give a reason to lie on the
  self-graded drill); a daily cap means grinding past a healthy session earns
  nothing; duplicates refund; pity counters guarantee a Rare within 10 packs
  and a Legendary within 50; and **there is no real-money path, ever.** No
  character performs a technique, and nothing here is rank — the screen says
  so, and tests assert both.
- **Learning effectiveness, with no video yet.** Four of the five technique
  rungs were multiple choice — recognition, not production. Added `t-explain`:
  the student explains the technique in their own words FIRST, then compares
  against purpose + keyDetails and grades honestly. Inducing self-explanation
  is among the best-evidenced study interventions (Bisra et al. 2018, g≈0.55,
  and it holds for procedural knowledge), and it needed no new content. Also a
  mental-rehearsal prompt on each technique, written around the attack as the
  cue because that is the condition the evidence actually supports (Toth et al.
  2020, r≈0.13 — real but small, and the copy says so rather than overselling).
  **Heads-up:** adding a rung means items that were "mastered" now have one more
  thing to do, so the Knowledge-mastered count dips once. That is honest, not a
  bug — there is genuinely more to know.
- **Content:** 142 provisional items across FIVE belts —
  White (53: etiquette, commands, counting, principles, safety, stances,
  falls-knowledge, first strikes, wrist releases), White·Yellow Stripe (30:
  front fall/forward roll, roundhouse/side/knee kicks, danjeon breathing, 3 more
  releases, first clothing grabs, Sino-Korean numbers), Yellow (23: **the first
  three joint locks** + lock theory/ethics, body-part terms, back/axe kicks,
  knife hand, bigger grabs, weak-side roll), and **Yellow·Green (18: lock
  chains — release into lock and into arm bar; the first two throws as
  KNOWLEDGE ONLY, restricted-class, no practice assignment; combination and
  stepping kicks; held-from-behind and side-headlock escapes; balance and
  throwing vocabulary; the ethics of putting someone on the floor)**, and
  **Green (18: the self-defence core — two-hand wrist grabs and the release
  into control, one- and two-hand collar grabs, bear hugs front and rear
  including arms-pinned, hair grabs, and holding a lock as control; plus
  distance, what a two-handed grab costs the attacker, what being held does
  to judgement, and proportionality)**. Belts 6-11 are empty shells
  ("Awaiting Grandmaster Lee's curriculum").
- **Emphasis is deliberate.** Kevin's steer: the striking/stance material is
  welcome but the app exists for the SELF-DEFENCE side — holds, grabs, locks.
  Self-defence domains (releases/grabs/locks/throws) are now 55% of technique
  items, up from 46%; Green belt is entirely holds and control. Keep new belts
  weighted that way. Everything on Green is restricted class — being held is a
  partner situation by definition, and none of it is solo-practicable.
- **The obstacle course (boss fights).** A third Dojang tab. Your whole
  collected class goes in — six on the mat, the rest tag in as people tire —
  each with an individual health bar, rarity driving toughness and damage, and
  the fight plays out as an animation until one side is down. Four obstacles
  unlock in order. **The enemy is never a person**: 망각 (The Forgetting),
  Impatience, Sloppiness, Overconfidence, drawn as abstract shapes — an
  illustrated human fight is the copyable-technique problem again, and ganging
  up on someone contradicts the proportionality content. **Losing costs
  nothing** (no fee, no losses, unlimited retries) because invariant 5 forbids
  punishment mechanics. Study bonus: up to +60% damage from items mastered, so
  the game points at the work. Balance is tuned as a ladder — a beginner's five
  commons clear the first at ~98%, and each later obstacle needs real
  collection growth; a weak class loses the last one ~100% of the time.
- **Focus — skip what you are not working on.** Settings has a Focus panel
  listing every category with a toggle; each item's own page has a "skip this
  one for now" button. Muted material stops appearing in sessions, new and
  review alike, and a fully-skipped unit reads "Skipped for now" on the path
  rather than sitting at 0/4 looking neglected. Nothing is deleted — cards keep
  their schedule and come back untouched. **Muting deliberately does not move
  belt readiness**, because the school still tests the whole belt; the Focus
  panel says so and a test enforces it.
- **Structural lesson from reference footage (not yet built).** Kevin shared
  Grandmaster Bong Soo Han's Green Belt Requirements videos. The important
  takeaway is not any single technique, it is the SHAPE: real Hapkido teaches
  many answers to the SAME attack, catalogued by attack category first ("one
  wrist grabbed", "one wrist, two hands", "two wrists grabbed") and then
  numbered — his green belt has at least nine responses to a single wrist grab
  alone. Our curriculum currently has ONE technique per situation, which is not
  how the art is organised or taught. Intake questions 3.3 and 3.4 now ask
  Grandmaster Lee whether he teaches and numbers variations, because his answer
  decides whether items should gain an `attack` grouping + `variation` field.
  Do not adopt anyone else's numbering — that is invariant 4, and a student
  whose school numbers differently would be actively confused.
  The videos themselves cannot ship: they are a third-party rip of a commercial
  DVD (the last frame solicits donations), and 476×360 would look poor beside
  Grandmaster Lee's own footage anyway. Reference for us, not media for the app.
- **Content gates in CI.** The matrix now tests the CONTENT, not just the
  machinery: every technique in a falls/locks/throws/choke/weapon domain must
  be instructor-gated and non-practicable; every technique must carry
  safetyNotes, 3+ keyDetails, 2+ commonErrors, 4-6 steps and checkpoints; no
  item may claim approval; every one of the 609 generated exercises must be
  well formed (4 distinct options, answer exactly once); and nothing may be
  scheduled in a course but missing from that course's path. A future belt
  cannot ship mis-gated or malformed.
- **Features:** two-course model (above); five-bar belt readiness; practice logs
  (solo-safe only); PIN instructor mode (verify with
  initials/date/note/curriculum-version, belt advancement, gaps, overdue,
  export/import); romanization-under-Hangul everywhere (toggleable); belt-wearing
  avatar with moods; step-sequencing, spot-the-mistake, self-graded speaking
  exercises; missing/broken media fallbacks; real-audio hook (`HKD_AUDIO`).
- **Deploy:** GitHub Pages serves root `index.html` (generated single-file), now
  by `git push` to `main` rather than manual upload. **Fully automatic:** the
  `auto-merge` job in `verify.yml` squash-merges a green non-draft `claude/*`
  PR and Pages republishes itself, so nobody clicks merge. The 156-check matrix
  is therefore the only gate before students see a change — grow it, and keep
  PRs in draft until they are actually finished. The repo had drifted — only
  a hand-uploaded `index.html` was on GitHub, one build behind (still the old
  tiger mascot); the whole source tree is committed now and CI guards the drift.

## Known open items, in rough priority

1. **Voice quality.** Live TTS is mediocre. Paths: (a) users install enhanced
   device voices (Settings copy already guides this; auto-ranking picks them up);
   (b) generated neural clips — plumbing ready via `HKD_AUDIO`; any generated
   Korean needs a pronunciation sanity-check before shipping (label as stand-in
   regardless); (c) **the real fix:** Grandmaster Lee records the terms (one voice
   memo, ~3 min) → split into clips → `data/audio.js` as
   `window.HKD_AUDIO = {"차렷": "data:audio/mp3;base64,..."}` or asset paths.
   NOTE for agent sessions: the old network restriction is **gone**. Generated
   media can now be pulled straight into the repo — the Runway MCP round trip
   (generate → download from the CDN → commit) is proven, and produced the
   `apple-touch-icon.png` described below. Generated Korean audio still ships
   labeled as a stand-in and still needs a pronunciation check (invariant 6).
2. **Grandmaster Lee's questionnaire** (`docs/grandmaster-lee-curriculum-intake.md`)
   — when answered, replace the provisional ladder/requirements (data-only change),
   flip approvalStatus per item as he approves, and re-badge the UI accordingly.
3. **Next belts** (all provisional; research broadly and write it ourselves —
   invariant 4 was rewritten to make that explicit). Yellow·Green and Green are
   now authored. Remaining, following the arc in Phase-0 §2.3 and Kevin's steer
   toward self-defence: Green·Blue — punch-defence chains, seated and ground
   defence, defence against a push or shove; Blue — choke defences (the most
   restricted category yet), multiple-hold combinations, kick-catching; Red —
   first weapon knowledge (danbong, cane), multiple attackers as recognition;
   Black — weapons depth, teaching, and whatever Grandmaster Lee's dan
   standards turn out to be. Kevin wants the ladder built all the way up.
4. **Media pipeline** when videos exist: WebVTT subtitles, unverified-translation
   badges, angle switcher (fields exist on item.media; player UI is minimal now).
5. **Untested surface (honest list):** real TTS on devices, actual video files,
   true multi-day scheduling (only simulated via due-shifting), iOS Safari
   specifics, screen-reader audit.
6. Nice-to-haves parked: cumulative belt-test review mode as a dedicated session
   type (data exists; UI is the readiness bars + normal scheduling), avatar
   customization, per-student profiles (explicitly out of scope: cloud/accounts —
   don't build unless Kevin asks).

## Opening moves for the next session

```bash
npm ci                                           # playwright, exactly as locked
npm run check                                    # build + in-sync check + matrix
```
Confirm 156/156, commit any drift, then pick up item 1 or 3 above with Kevin.
After a deploy lands, `npm run smoke` checks the live site (needs network).
When authoring the next belt, remember it wants units in BOTH courses.
Original Hanbit app must never be modified: `dev/hanbit-korean.BACKUP-2026-07-30.html`
is the pristine source (sha256 c964c277…8b86).

## Provenance

Phase-0 research (federation belt-system survey with sources, learning-science
evidence base, and safety literature — AAP 2016, judo injury data) is in
`docs/hapkido-companion-phase0-report.md`. It is the reference for why the
safety gates exist and for what "broadly shared" means when authoring new belts.
