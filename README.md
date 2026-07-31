# Hapkido Companion

**▶ [Open the app](https://bloxboss3-dotcom.github.io/hapkido-companion/)** — works on any phone,
runs offline, no account, no ads, no tracking.

A belt-rank training companion for students of Lee's Martial Arts Academy, built on an
FSRS spaced-repetition engine. It trains the half of Hapkido that lives in your head —
terminology, principles, sequences, safety — so class time can go to the half that lives
in your body.

> **Working title, provisional curriculum.** Everything in `data/curriculum.js` is a
> researched placeholder awaiting Grandmaster C.Y. Lee's approval, and the app says so on
> every screen that needs it. The app never awards rank and never certifies physical skill.

## Two courses, one belt

Like a language app teaching two different languages, you pick a course and the whole app
becomes that course — its own path, its own daily pace, its own colour, its own celebrations.
You can switch whenever you like; the other one is waiting exactly where you left it.

| | 도 · **Terminology & Philosophy** | 기 · **Techniques** |
|---|---|---|
| Korean | 용어와 철학 · *yong-eo-wa cheol-hak* | 기술 · *gi-sul* |
| Covers | commands, counting, etiquette, history, principles, safety | stances, falls, kicks, strikes, releases, locks |
| Exercises | meaning, by ear, produce the Korean, say it out loud | name it, read the situation, order the steps, spot the mistake |
| Items today | 73 | 33 |

Both count toward the same rank. The Belt tab always shows the whole belt — a rank is not
half a rank — and the five readiness measures there are never collapsed into one number.

## Getting started as a student

Open the link, pick a course, train for the ~20 minutes it suggests, and go to class.
On a phone, **Share → Add to Home Screen** makes it behave like an installed app.
Progress lives in that browser and nowhere else, so use **Settings → Export** for a backup.

## Working on it

`index.html` at the repo root is **generated — never edit it by hand.** It is what GitHub
Pages serves.

```bash
npm ci                       # playwright, exactly as locked
npm run build                # rebuilds both index.html files from dev/
npm test                     # 96 automated checks (needs chromium)
npm run check                # build + "is the deployed file in sync?" + test
npm run smoke                # optional: checks the DEPLOYED site (needs network)
```

| Path | What it is |
|---|---|
| `dev/hanbit-korean.BACKUP-2026-07-30.html` | the pristine engine this is built on — **never modified** |
| `dev/build/transform.py` | the build: applies anchored edits, splices the hapkido layer in |
| `dev/build/hapkido-part1..5.js` | the hapkido layer (courses, exercises, views, instructor mode) |
| `dev/build/course-art.js` | the two course emblems (SVG) |
| `dev/hapkido-companion/data/curriculum.js` | **all content** — belts, courses, domains, units, items |
| `dev/build/test-matrix.js` | the 96-check matrix that gates every deploy |
| `dev/build/smoke-deployed.js` | optional post-deploy check against the live URL |

Adding or moving curriculum is a `curriculum.js` edit and nothing else. If a content change
needs an engine change, the engine is wrong. Read [`CLAUDE.md`](CLAUDE.md) for the
non-negotiable invariants (safety gating, provisional labelling, no punishment mechanics)
and [`HANDOFF.md`](HANDOFF.md) for where the project stands.

## What this app never does

It never awards rank, never certifies physical competence, and never unlocks physical
practice of a restricted technique because of a streak or a memory score. Falls, throws,
locks and partner work are learned on the mat, with instructors, in person. Not emergency,
medical, legal, or self-defense advice.
