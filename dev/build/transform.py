#!/usr/bin/env python3
"""Transform the Hanbit copy into the Hapkido Companion index.html.

Strategy: the engine (CSS system, FX, mascot, FSRS, storage, session
machinery, events) is preserved byte-for-byte. Korean course data and
the catalogue/const declarations are removed; hapkido layers are
appended before BOOT, where later function declarations override the
originals. Every anchor is asserted so a drifted source fails loudly
instead of silently mangling the file.
"""
import sys, pathlib, shutil

# Path-portable: works from any checkout. Expected layout:
#   <repo>/dev/build/transform.py   (this file)
#   <repo>/dev/hanbit-korean.BACKUP-2026-07-30.html   (pristine engine source)
#   <repo>/dev/hapkido-companion/   (folder build + data/curriculum.js)
#   <repo>/index.html               (deployed single-file — written by this script)
BUILD = pathlib.Path(__file__).resolve().parent
DEV = BUILD.parent
REPO = DEV.parent
SRC = DEV / 'hanbit-korean.BACKUP-2026-07-30.html'
if not SRC.exists():  # fallback for the original sandbox layout
    SRC = pathlib.Path('/home/claude/hanbit-korean.html')
OUT = DEV / 'hapkido-companion' / 'index.html'

s = SRC.read_text(encoding='utf-8')
orig_len = len(s)

def sub1(text, a, b, label):
    assert a in text, f'ANCHOR MISSING ({label}): {a[:70]!r}'
    return text.replace(a, b, 1)

def cut(text, start, end, label):
    assert start in text, f'CUT START MISSING ({label})'
    i = text.index(start)
    j = text.index(end, i)
    return text[:i] + text[j:]

def repl_region(text, start, end, replacement, label):
    assert start in text, f'REGION START MISSING ({label})'
    i = text.index(start)
    j = text.index(end, i) + len(end)
    return text[:i] + replacement + text[j:]

# ---------- 1. head / branding ----------
s = sub1(s, '<title>한빛 Hanbit · Learn Korean</title>',
         '<title>Hapkido Companion · LMAA (working title)</title>', 'title')
s = sub1(s, 'content="Hanbit — an ad-free Korean trainer built on retrieval practice and FSRS spaced repetition. Works offline, stores nothing anywhere but your own browser."',
         'content="Hapkido Companion (working title) — an ad-free training companion for students of the school. Terminology, principles, and technique knowledge on FSRS spaced repetition; physical skill is verified only by instructors. Stores nothing anywhere but your own browser."',
         'meta-desc')
s = sub1(s, '%ED%95%9C%3C', '%ED%95%A9%3C', 'icon-glyph')  # 한 -> 합

# iOS ignores SVG favicons, so Add-to-Home-Screen needs a real raster or it
# falls back to a generic glyph. This is the only file the page references;
# Safari fetches it when a student adds the app, never on load — so the
# "works with the network off" property survives (you just lose the icon).
s = sub1(s, '''<!-- No external requests of any kind: Korean text uses the system font stack
     so the file works with the network switched off and nothing is ever
     fetched, logged or phoned home. -->''',
         '''<!-- No external requests of any kind: Korean text uses the system font stack,
     so the app runs with the network switched off and nothing is ever logged
     or phoned home. The only files referenced are same-origin and local to
     this folder: the manifest and the icons that let it install to a home
     screen. Chrome fetches the manifest once on load; iOS fetches an icon
     only when a student adds the app. Nothing else is ever requested, and
     none of it is needed for the app to work. -->''', 'offline-comment')
#
# The manifest + these meta tags are what make it *install* — added to the
# home screen it opens in its own window instead of a browser tab. Status bar
# style is the opaque 'black' on purpose: 'black-translucent' slides content
# under the iOS status bar, and nothing in this app uses safe-area insets, so
# that would clip the header.
s = sub1(s, '%3E%ED%95%A9%3C/text%3E%3C/svg%3E">',
         '%3E%ED%95%A9%3C/text%3E%3C/svg%3E">\n'
         '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
         '<link rel="manifest" href="manifest.webmanifest">\n'
         '<meta name="mobile-web-app-capable" content="yes">\n'
         '<meta name="apple-mobile-web-app-capable" content="yes">\n'
         '<meta name="apple-mobile-web-app-status-bar-style" content="black">\n'
         '<meta name="apple-mobile-web-app-title" content="Hapkido">', 'app-icons-and-manifest')
s = sub1(s, 'Hanbit needs JavaScript — the whole app, including the scheduler, runs locally in your browser.',
         'This app needs JavaScript — everything, including the scheduler, runs locally in your browser.', 'noscript')
s = sub1(s, '</head>', '<script src="data/curriculum.js"></script>\n</head>', 'curriculum-script')

# ---------- 2. CSS append ----------
extra_css = (BUILD / 'extra.css').read_text(encoding='utf-8')
s = sub1(s, '\n</style>', '\n\n' + extra_css + '\n</style>', 'css-append')

# ---------- 3. delete Korean course data (HANGUL_UNITS .. UNITS_B) ----------
M_DATA = '/* ============================================================\n   HANGUL COURSE DATA'
M_FX = '/* ============================================================\n   FX — particles'
s = cut(s, M_DATA, M_FX, 'course-data')

# ---------- 4. delete catalogue consts (redefined in hapkido layer) ----------
M_CAT = 'const ALL_CORE_UNITS = UNITS_A.concat(UNITS_B);'
M_STATE = '/* ---------------------------------------------------------------\n   2. STATE\n   --------------------------------------------------------------- */'
s = cut(s, M_CAT, M_STATE, 'catalogue')

# ---------- 5. replace DEFAULTS (new state shape, version 2) ----------
DEFAULTS_NEW = '''const DEFAULTS = {
  settings: {
    dailyNew: 6,
    reviewCap: 100,
    targetRetention: 0.90,
    sessionMinutes: 20,
    showRomanization: true,
    ttsRate: 0.85,
    ttsVoice: '',
    theme: 'dark',
    fxLevel: 'full',        // full | subtle | off
    sound: true,
    volume: 0.5,
    spokenPraise: false,
    activeBeltId: '',       // the belt currently being trained for
    activeCourseId: ''      // '' until the student picks a course
  },
  milestones: {},           // one-time celebrations already fired
  cards: {},                // "itemId|skill" -> FSRS card (KNOWLEDGE only)
  introduced: {},           // itemId -> ts
  log: [],                  // [{t, key, grade, ms}]
  days: {},                 // "YYYY-MM-DD" -> {reviews, newItems, ms, correct, total}
  practiceLog: [],          // self-reported solo practice — never "verified"
  verifications: {},        // itemId -> {by, date, note, curriculumVersion}; instructor mode only
  instructor: { pinHash: null, lastBy: '', log: [] },
  verifySeen: 0,            // for the "verified in class" celebration
  // Collectibles. Only SPENDING is stored — ki earned is derived from the
  // work already in days[], so it can never drift from what was actually done
  // and survives export/import with no extra handling.
  dojang: { spent: 0, refunded: 0, owned: {}, opened: 0, pityRare: 0, pityLeg: 0, seen: {}, last: null },
  curriculumVersion: '',
  created: Date.now(),
  version: 2
};'''
s = repl_region(s, 'const DEFAULTS = {', '  version: 1\n};', DEFAULTS_NEW, 'defaults')

# ---------- 6. storage key strings ----------
s = sub1(s, "localStorage.setItem('hanbit.probe', '1');", "localStorage.setItem('hapkido.probe', '1');", 'probe-set')
s = sub1(s, "localStorage.removeItem('hanbit.probe');", "localStorage.removeItem('hapkido.probe');", 'probe-rm')
s = sub1(s, "showToast('Your saved progress could not be read, so Hanbit started fresh.');",
         "showToast('Your saved progress could not be read, so the app started fresh.');", 'boot-toast')

# ---------- 7. FX particle glyphs ----------
s = sub1(s, "const FX_JAMO = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', '한', '빛'];",
         "const FX_JAMO = ['합', '기', '도', '원', '유', '화', '수', '련', '띠', '한'];", 'fx-glyphs')

# ---------- 7b. replace the tiger with the belted student avatar ----------
avatar = (BUILD / 'avatar-svg.js').read_text(encoding='utf-8')
s = repl_region(s, 'const MASCOT_SVG = `', '</svg>`;', avatar, 'mascot-svg')

# ---------- 8. splice in the hapkido layer before BOOT ----------
parts = (BUILD / 'course-art.js').read_text(encoding='utf-8') + '\n\n' + \
        (BUILD / 'dojang-art.js').read_text(encoding='utf-8') + '\n\n' + \
        '\n\n'.join((BUILD / f'hapkido-part{i}.js').read_text(encoding='utf-8') for i in range(1, 7))
M_BOOT = '/* ---------------------------------------------------------------\n   12. BOOT'
assert M_BOOT in s, 'BOOT MARKER MISSING'
s = s.replace(M_BOOT, parts + '\n\n' + M_BOOT, 1)

OUT.write_text(s, encoding='utf-8')

# ---------- also emit the deployable single-file build at repo root ----------
cur_path = DEV / 'hapkido-companion' / 'data' / 'curriculum.js'
single = s.replace('<script src="data/curriculum.js"></script>',
                   '<script>\n' + cur_path.read_text(encoding='utf-8') + '\n</script>', 1)
(REPO / 'index.html').write_text(single, encoding='utf-8')

# ---------- place the install assets beside each index.html ----------
# Each has to sit next to the file that references it, so the folder build and
# the deployed root build each get their own copy. Source of truth is
# dev/hapkido-companion/; every file is asserted so a deleted asset fails the
# build instead of silently shipping a broken <link> or an uninstallable app.
APP_ASSETS = [
    'manifest.webmanifest',
    'apple-touch-icon.png',    # 180, iOS home screen
    'icon-192.png',            # Chrome install minimum
    'icon-512.png',            # Chrome install / splash
    'icon-maskable-512.png',   # Android adaptive icon (safe-zone inset)
]
for asset in APP_ASSETS:
    src_path = DEV / 'hapkido-companion' / asset
    assert src_path.exists(), f'MISSING APP ASSET: {src_path}'
    shutil.copyfile(src_path, REPO / asset)

# ---------- report ----------
lines = s.count('\n') + 1
removed_refs = {tok: s.count(tok) for tok in
                ['HANGUL_UNITS', 'UNITS_A', 'UNITS_B', 'ALL_CORE_UNITS', 'CORE_UNIT_BY_ID', 'skipHangul', 'hanbit.v1']}
print(f'OK  wrote {OUT}  ({lines} lines, {len(s)} bytes; source was {orig_len} bytes)')
print(f'OK  wrote {REPO / "index.html"}  ({len(single)} bytes, curriculum inlined — this is what GitHub Pages serves)')
print('leftover token counts (should be 0 or inside dead overridden functions):', removed_refs)
