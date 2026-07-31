# Hapkido Companion — White Belt vertical slice (working title)

A training companion for students of the school, built on the Hanbit engine
(FSRS spaced repetition, retrieval-first exercises, no punishment mechanics).
**Everything curriculum-related is provisional and awaiting Grandmaster Lee's
approval** — the UI says so on every screen that needs it.

## Two courses

Students pick between **Terminology & Philosophy** and **Techniques** on first
launch, and can switch any time from the header. Each course keeps its own path,
its own daily pace, its own colour and its own celebrations; both count toward
the same belt. Courses are declared in `data/curriculum.js` under `courses`, and
an item joins one purely through its domain's `track` — so moving a whole domain
between courses is a one-word edit.

## Run it

Unzip, then double-click `index.html`. No server, no build step, no network.
Progress lives in that browser's localStorage; use Settings → Export for backups.

## Folder layout

```
index.html          the whole app (engine + UI)
data/curriculum.js  ALL content: belts, domains, units, items — edit this, never the engine
assets/videos/      drop Grandmaster Lee's demonstration files here
assets/audio/       his voice recordings of terms (replaces the synthesized voice)
assets/images/      school logo / photos when ready
```

## Editing the curriculum

Open `data/curriculum.js`:

- **Change the belt ladder**: edit the `belts` array (id, order, gup, names, color,
  stripe, units). The provisional 10-gup ladder is a placeholder for the school's
  real Hapkido ladder.
- **Move a technique between belts**: change its `beltId` and `unit`. Nothing else.
- **Move material between courses**: change the `track` on its entry in `domains`
  (`knowledge` or `technique`). Every item in that domain moves course, path lane
  and session with it.
- **Rename or recolour a course**: edit `courses` (name, Korean name, glyph,
  tagline, blurb, accent colours, celebration glyphs). Adding a third course means
  adding an entry here and giving some domains its track.
- **Add media**: put the file in `assets/videos/` and set e.g.
  `media: { videoFullSpeed: "assets/videos/wb-rel-01_full_front.mp4" }`.
  Missing or broken files show a polished "Demonstration coming soon" state.
- **Safety**: every technique carries `safetyClass`
  (`knowledgeOnly | soloSafe | partnerWithCare | instructorSupervisionRequired |
  academyOnly | restrictedByAge`). Restricted classes get no practice button,
  a supervision notice, and can only be completed by instructor verification.
- **Approval**: flip `approvalStatus` per item (and `meta.approvalStatus`) when
  Grandmaster Lee approves; the provisional badges disappear on approved content.

## Instructor mode

Settings → Instructor. First open sets a 4–8 digit PIN (a deterrent for casual
taps, not real security — data lives on the device). Inside: verify/unverify
techniques (records initials, date, note, curriculum version), see readiness
gaps and overdue terminology, and export/import student progress files.

## What the app never does

It never awards rank, never certifies physical skill, and never unlocks a
restricted technique because of a streak or a memory score. Knowledge is the
app's half; the mat, the partners, and the instructors are the other half.
Not emergency, medical, legal, or self-defense advice.
