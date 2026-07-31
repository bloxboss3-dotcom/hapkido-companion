# NEXT STEPS — what full network access unblocks

Written July 31, 2026, right after v0.5.0 (two courses) went live.
Companion to `HANDOFF.md`; the rules in `CLAUDE.md` still bind all of it.

State at time of writing: v0.5.0-provisional, 84/84 checks passing, CI green on
`main` (run `30610475127`), deployed at
<https://bloxboss3-dotcom.github.io/hapkido-companion/>.

---

## 0. Read this first — the network change has NOT reached this container

You changed the setting, but **this session is still running under the old
policy**, so nothing below is actually unblocked *yet*. Containers get their
network policy when they are created; an existing session keeps the one it
booted with.

This was proven end-to-end, not inferred. A real Runway image was generated from
this session and then could not be pulled in:

1. `generate_image` → task `759ea43e-abd5-4f36-b0e1-196bf73cdb81` → **SUCCEEDED**.
   The MCP call runs through the harness, so generation is unaffected by the
   sandbox's policy.
2. `curl` of the returned asset URL on `dnznrvs05pmza.cloudfront.net` →
   `curl: (56) CONNECT tunnel failed, response 403`, 0 bytes.

So the credit was spent, the artwork exists, and it is stranded on the other side
of the proxy. Supporting probes:

| Probe | Result |
|---|---|
| `registry.npmjs.org`, `pypi.org` | ✅ reachable (bypass the proxy entirely) |
| `raw.githubusercontent.com` | ✅ 301 |
| `storage.googleapis.com` | ✅ CONNECT allowed (400 to the bare request) |
| `dnznrvs05pmza.cloudfront.net` (Runway assets) | ❌ `403 CONNECT` |
| `bloxboss3-dotcom.github.io` (our own live site) | ❌ `403 CONNECT` |
| `runway.com`, `example.com` | ❌ `403 CONNECT` |

`example.com` being denied is the tell: this is not one unlucky CDN, it is the
general internet. `$HTTPS_PROXY/__agentproxy/status` reports `"selective": false`
locally while the gateway still answers `403` to `CONNECT` — the signature of a
container running on a stale policy rather than a misconfigured proxy.

**The fix: start a new Claude Code session** (or recreate the environment) now
that the setting is saved. Then confirm before trusting any of section 1:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://bloxboss3-dotcom.github.io/hapkido-companion/
# want 200. "000" with "CONNECT tunnel failed" means the policy still hasn't landed.
```

---

## 1. Unblocked by full network — in priority order

### 1.1 Real Korean audio · biggest quality gap in the app

Today `speak()` falls back to the browser's own TTS. It is mediocre on desktop,
inconsistent on Android, and on some devices there is **no Korean voice at all** —
the student just gets silence and a toast.

The plumbing is already finished and shipped. `speak()` (in
`dev/build/hapkido-part5.js`) checks `window.HKD_AUDIO` *before* TTS:

```js
window.HKD_AUDIO = { "차렷": "<url, path, or data: URI>" };   // exact Korean text → clip
```

Two routes, not mutually exclusive:

- **Route A — Grandmaster Lee records it. This is the real fix.** One voice memo,
  ~3 minutes, reading the term list; split into clips; write
  `dev/hapkido-companion/data/audio.js`. Needs no network at all and needs no
  stand-in label, because he *is* the authority the label was protecting against.
  Everything in Route B is a placeholder for this.
- **Route B — generated neural Korean, now possible.** Runway `generate_audio` /
  Higgsfield voice → download the clip → encode → same `data/audio.js`.
  Non-negotiable conditions (invariant 6): it ships **labeled as a stand-in**, and
  a Korean speaker sanity-checks pronunciation before it goes near students.
  Wrong pronunciation taught confidently is worse than no audio.

**Decision Kevin has to make before anyone writes code** — roughly 120 terms at
~25 KB per clip is ~3 MB, far too much to inline into the single-file build:

- **(a) Recommended.** Ship `assets/audio/*.mp3` as real files and have
  `data/audio.js` hold *paths*. Costs the strict "one file, works from a USB
  stick" property; Pages serves it fine and the browser caches it after first
  load. Requires teaching `transform.py` to also place `assets/` at the repo root.
- **(b)** Inline only the ~40 highest-value clips (the commands you hear every
  class) as data: URIs, leave the long tail on TTS. Keeps single-file purity.

*Done when:* `data/audio.js` exists, `npm run check` is still green, and the
matrix has a new check proving `HKD_AUDIO` wins over TTS.

### 1.2 Course emblem artwork · drop-in, zero engine change

`dev/build/course-art.js` already exposes the override hook, deliberately:

```js
window.HKD_COURSE_ART = { way: "<url or data: URI>", art: "<url or data: URI>" };
```

Set it and generated art replaces the built-in emblems per course, with no other
edit anywhere.

**There is already one image generated and paid for.** Recover it in the next
session without spending another credit — `get_task` re-issues a fresh signed URL
for a finished task:

```
get_task("759ea43e-abd5-4f36-b0e1-196bf73cdb81")   # Terminology & Philosophy card art
```

It is a 1:1 Korean ink-wash (sumukhwa): an unclosed enso brush circle in indigo
and slate-blue over dark charcoal paper, three fading horizontal strokes beneath
it. The matching Techniques piece was never generated — the download failure
stopped the run before the second call.

Pipeline once the URL is reachable, all local after the download:

```bash
curl -o art/way.png "<url from get_task>"
# downscale + re-encode without PIL: load it in Playwright, draw to a canvas at
# the target size, canvas.toDataURL('image/webp', 0.82) → paste into the hook.
```

Budget ≤ ~40 KB per emblem if inlining as a data: URI; above that, put the files
in `assets/images/` and reference by path.

Before you do, know what you would be giving up: the current emblems are ~1.5 KB
of vector that stays crisp at any size, renders in both themes, and is **painted
by each course's own accent colour via `currentColor`**. A generated raster is a
fixed-colour image that will not follow the course accent or the light/dark
theme. Only swap if the art is genuinely better, and consider keeping the SVG as
the small-size variant.

**Hard constraint:** emblems stay abstract — ink circles, taegeuk motifs, Hangul.
Do **not** generate images that depict a technique. An AI-drawn joint lock is
safety misinformation with a school's name attached, and it collides with
invariants 2 and 3.

Same unblock, smaller win: a real 180×180 PNG `apple-touch-icon` (raster only —
iOS ignores SVG), so Add-to-Home-Screen stops rendering a generic glyph.

### 1.3 Reproducible dependency installs

There is no `package-lock.json`, so CI's `npm install` re-resolves Playwright on
every run — a silent upgrade can break the matrix on an unrelated PR.

```bash
npm install            # once, with network, then commit package-lock.json
```

Then switch `.github/workflows/verify.yml` from `npm install --no-audit --no-fund`
to `npm ci`. Locally, `npx playwright install chromium` also works now instead of
depending on the sandbox's pre-installed browser.

### 1.4 Smoke-test the *deployed* site, not just the built file

The matrix runs against `file://`. That cannot catch Pages-only failures — MIME
types, `.nojekyll` behaviour, cache headers, a half-finished deploy. With network,
add an optional `npm run smoke` that loads the live URL in Playwright and asserts
the course picker renders. Keep it out of `npm run check` so offline work stays
fast.

### 1.5 Research-backed content authoring

WebSearch/WebFetch become available for the Yellow·Green belt synthesis and for
romanization cross-checks. Invariant 4 does not relax: research **structure**,
never copy another school's text, numbering, or curriculum.

---

## 2. Improvements that never needed the network — ranked

1. **Yellow·Green belt content.** Highest-value content work. It wants units in
   **both** courses — a belt with technique units only leaves the Terminology
   path empty at that belt, which the app handles gracefully but reads as
   neglect. Lock chains (release→lock), first throws as *knowledge only*
   (restricted class, no practice assignment), harder kick combos.
2. **Grandmaster Lee's questionnaire** (`docs/grandmaster-lee-curriculum-intake.md`).
   When answered, his ladder replaces the provisional one — a `curriculum.js` edit,
   nothing else — and `approvalStatus` flips per item, retiring the provisional
   badges. This is the single change that turns the app from a well-built
   placeholder into the school's actual curriculum.
3. **Belt-test review mode as a first-class session.** The data exists
   (`cumulativeStats`, `startSession('*')`); today it surfaces only as readiness
   bars and a both-courses button. A dedicated "test in two weeks" mode that
   weights earlier belts is a genuine student need.
4. **Media pipeline** for when videos exist: WebVTT subtitles, angle switcher,
   unverified-translation badges. Fields already exist on `item.media`.
5. **Accessibility and iOS Safari audit.** Both are on the honest untested list.
   Screen-reader pass over the course picker and session flow especially — the
   two-course switch is new and unaudited.
6. **Course-complete end state.** Finishing a course currently just goes quiet.
   It should say something, without inventing a rank.
7. **A third course is a data entry** (`CURRICULUM.courses` + `domain.track`) if
   weapons or sparring ever deserve their own path. No engine change.

---

## 3. Guardrails this work will brush against

Full text in `CLAUDE.md`; these are the ones section 1 touches directly.

- **#2 Safety gating is absolute.** No generated media, audio cue, or emblem
  softens a restricted technique. Nothing unlocks physical practice.
- **#3 Everything is provisional** until Grandmaster Lee signs off. Badges stay.
- **#6 AI audio/translation ships labeled as a stand-in**, always, until reviewed.
- **#8 Engine vs. content stay separated.** Audio and art both have data-side
  hooks precisely so this stays true — if adding media needs an engine change,
  the engine is wrong.
- **#9 Two courses, one shared belt.** Per-course budgets and paths; the Belt tab
  always shows all five measures for the whole belt. Never gate one course behind
  the other.

---

## 4. Commands

```bash
npm install                  # once; commit the lockfile it produces
npm run build                # regenerate both index.html files
npm test                     # 84 checks (grow the count, never shrink it)
npm run check                # build + in-sync check + test — what CI runs
```

`index.html` is generated. Never hand-edit it; CI fails the PR if it drifts from
the source it is built from.
