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
  (`dev/build/`). 84/84 automated checks passing.
- **Repo:** `npm run build` / `npm test` / `npm run check`, plus a GitHub Actions
  job that rebuilds `index.html` on every PR and fails if the deployed file has
  drifted from the source it is generated from.
- **Content:** 106 provisional items across three belts —
  White (53: etiquette, commands, counting, principles, safety, stances,
  falls-knowledge, first strikes, wrist releases), White·Yellow Stripe (30:
  front fall/forward roll, roundhouse/side/knee kicks, danjeon breathing, 3 more
  releases, first clothing grabs, Sino-Korean numbers), Yellow (23: **the first
  three joint locks** + lock theory/ethics, body-part terms, back/axe kicks,
  knife hand, bigger grabs, weak-side roll). Belts 4-11 are empty shells
  ("Awaiting Grandmaster Lee's curriculum").
- **Features:** two-course model (above); five-bar belt readiness; practice logs
  (solo-safe only); PIN instructor mode (verify with
  initials/date/note/curriculum-version, belt advancement, gaps, overdue,
  export/import); romanization-under-Hangul everywhere (toggleable); belt-wearing
  avatar with moods; step-sequencing, spot-the-mistake, self-graded speaking
  exercises; missing/broken media fallbacks; real-audio hook (`HKD_AUDIO`).
- **Deploy:** GitHub Pages serves root `index.html` (generated single-file), now
  by `git push` to `main` rather than manual upload. The repo had drifted — only
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
   NOTE for agent sessions: this sandbox's network policy blocks the CDNs that
   image/audio generators return assets on, so generated media cannot be pulled
   into the repo from here — generate elsewhere and drop the file in, or keep
   authoring vector art locally (see `dev/build/course-art.js`).
2. **Grandmaster Lee's questionnaire** (`docs/grandmaster-lee-curriculum-intake.md`)
   — when answered, replace the provisional ladder/requirements (data-only change),
   flip approvalStatus per item as he approves, and re-badge the UI accordingly.
3. **Next belts** (all provisional, same synthesis method as before — see the
   Phase-0 report §2.3 for the documented progression arc): Yellow·Green — lock
   chains (release→lock transitions), first throws *knowledge* (hip throw, outer
   reap — restricted-class), harder kick combos; then punch-defense chains,
   headlock/bear-hug defenses, first danbong knowledge at later belts.
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
npm install && npx playwright install chromium   # if not present
npm run check                                    # build + in-sync check + matrix
```
Confirm 84/84, commit any drift, then pick up item 1 or 3 above with Kevin.
When authoring the next belt, remember it wants units in BOTH courses.
Original Hanbit app must never be modified: `dev/hanbit-korean.BACKUP-2026-07-30.html`
is the pristine source (sha256 c964c277…8b86).

## Provenance

Phase-0 research (federation belt-system survey with sources, learning-science
evidence base, and safety literature — AAP 2016, judo injury data) is in
`docs/hapkido-companion-phase0-report.md`. It is the reference for why the
safety gates exist and for what "broadly shared" means when authoring new belts.
