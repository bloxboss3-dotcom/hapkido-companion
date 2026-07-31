# Changes vs. Hanbit (`hanbit-korean.html`)

## v0.2.0-provisional additions

Two-track path: every domain carries `track: knowledge | technique`; the home
path renders a **Mind — knowledge & customs** lane and a **Body — techniques**
lane, each with its own numbering and glowing next step, plus "Mind only" /
"Body only" filtered session buttons (track-aware planner). New provisional
**White·Yellow Stripe (9th gup)** belt — 30 items synthesized from the
broadly-shared second-level material documented in the Phase-0 research
(front fall + forward roll, roundhouse/side/knee kicks, danjeon breathing,
three more wrist releases, first lapel/sleeve grab defenses, Sino-Korean
numbers + directions, belt-ladder and kihap concepts) — original wording, no
school's curriculum copied, all `provisional`. Voice quality: Korean TTS
voices auto-ranked (premium/enhanced/natural first, compact last) with
device tips in Settings. Test matrix now 57 checks, all passing.

---

The original file was never modified. A checksum-verified backup exists
(`hanbit-korean.BACKUP-2026-07-30.html`); this app was built by a scripted
transform of a copy, so every change below is reproducible and auditable.

## Preserved byte-for-byte (the engine)

FSRS-5 scheduler (all 19 weights, formulas, fuzz, same-day handling) · card
store and ladder-unlock mechanics (`isHolding`, `unlockSkills`) · session
planner (shuffled reviews, interleaved new items, expanding within-session
lags, relearn caps, session budget with "stop here?") · grade-adjust rewind ·
day records and honest measured-vs-predicted retention · storage layer
(debounced save, storage probe, deepMerge migration, orphan-card retirement) ·
export/import validation pattern (raw-file check + test-render before commit) ·
boot recovery from corrupted saves · FX engine (particles, banners, combo
tiers, WebAudio synth) · the tiger mascot · reduced-motion and fx-off
handling · settings framework with clamped bounds · Progress tab · event
delegation and keyboard support · `esc()` HTML-escaping discipline.

## Removed

Korean course data (`HANGUL_UNITS`, `UNITS_A/B`) and the catalogue constants
that consumed it. (The Hangul IME/composer remains in the file, dormant — free
to power an optional "type the Korean term" rung later.)

## Replaced (overridden, originals inert)

Catalogue builder (now reads `data/curriculum.js`: belts → domains → units →
items) · ladders (`term`, `concept`, `technique` knowledge rungs; rungs
auto-skip when an item lacks the needed data) · exercise generator (MC
recognition KO↔EN, audio ID, concept quizzes incl. spot-the-unsafe and
scenario/ethics, technique ID/situation, **step sequencing** on the tile
engine, spot-the-mistake, key points, **self-graded say-it-aloud**) ·
`renderToday` → belt path home (unit nodes, glow, seals, locked future belts) ·
Browse → Belt page (per-belt requirements, expandable technique details) ·
Method essay (rewritten for hapkido incl. why restricted techniques are
class-only) · Settings (Hangul-specific options removed; Instructor + About
added) · milestones (item counts, technique knowledge-mastered, unit complete,
belt knowledge complete, instructor-verified celebration) · brand/head/theme
glyphs.

## Added (net-new)

- `data/curriculum.js` — 11-belt provisional ladder (every element flagged),
  9 domains, 10 White-belt units, 53 items (29 terms, 14 concepts, 10
  techniques) with steps, key points, common errors, safety notes, checklists.
- Safety system: six `safetyClass` values; restricted classes render a
  supervision notice, hide practice logging, and require instructor
  verification. **No FSRS value ever unlocks physical practice.**
- Practice log (self-reported checklists + honest 1–5 self-rating).
- Instructor mode: PIN (deterrent-grade, documented as such), verify/unverify
  with initials + date + note + curriculum version, readiness gaps, overdue
  terminology, progress-file export/import.
- Five-bar belt readiness (retention / exposure / mastery / practice /
  verification, plus cumulative) — never a single percentage.
- Media slots with "Demonstration coming soon" and broken-file fallback;
  synthesized Korean voice labeled as a stand-in until real recordings.
- State v2: `practiceLog`, `verifications`, `instructor`, `verifySeen`,
  `curriculumVersion`; new store key `lmaa-hapkido.v1`.
- `window.__HKD` debug/test handle (local only; powers the automated tests).

## Test results (automated, headless Chromium 390×844 + 320×640)

**55/55 checks passed**, covering: first launch (zero console/page errors) ·
teach→exercise→FSRS write (values verified against FSRS-5 math: first fast
correct → S=15.69105=w₃) · wrong answer (grade 1, +10 min due, in-session
requeue, combo reset) · step-sequencing (order check, submit gating) ·
self-graded speak rung · belt gating & cumulative counts · belt page ·
missing-media placeholder · deliberately-broken video path → fallback ·
preview-belt empty state · practice logging (and its absence on restricted
techniques) · instructor PIN (short/wrong/set), verify with metadata,
student-side celebration, unverify · export→wipe→import round-trip ·
malformed import rejected · orphaned/deleted-item card retirement after a
curriculum change · returning user · review session from overdue cards ·
keyboard (digits answer, Enter advances) · light theme · 320 px no overflow ·
reduced-motion boot · reset · corrupted-save recovery.

**Not tested (honest list):** real TTS voices (headless has none — needs a
device check) · playback of actual video files (none exist yet; only the
missing/broken states are exercised) · true multi-day scheduling drift (due
dates were shifted to simulate it) · iOS Safari specifics · screen-reader
behavior (aria labels carried over from Hanbit, no full audit yet).
