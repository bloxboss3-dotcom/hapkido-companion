# Hapkido Training Companion — Phase 0 Report
**Audit of Hanbit · Research findings · Proposed design · Provisional framework**

Working title: *LMAA Hapkido Companion* (placeholder until you approve a name)
Date: July 30, 2026 · Status: **No code has been changed. The original `hanbit-korean.html` is untouched.**

---

## Executive summary

Hanbit is in excellent shape to become the engine of a Hapkido companion. Roughly 60–70% of the file — the FSRS scheduler, session planner, state/storage layer, export/import safety, effects system, mascot, settings, and the whole visual system — can be reused unchanged or with light generalization. The Korean-language-specific parts (Hangul IME, cloze/sentence-builder content, the curriculum data itself) are cleanly separable, and one of them (the sentence-tile builder) converts almost directly into the step-sequencing exercise physical techniques need.

The research confirms your core premise: **there is no universal Hapkido colored-belt curriculum.** Nine documented systems disagree on gup counts (8, 10, 12, numbered levels), on which colors exist, and on what sits before black. Any belt structure in this app must therefore be data-driven and provisional until Grandmaster Lee approves the real one. The learning-science literature strongly supports the product split you specified: FSRS-scheduled retrieval for terminology/concepts/recognition, and a separate practice-log + instructor-verification track for physical skill — with hard supervision gates on falls, throws, locks, and chokes, which is exactly where the judo injury literature and the AAP's 2016 youth-martial-arts report point.

What I did in this phase: read all 4,916 lines of Hanbit; smoke-tested the original in a headless browser (first launch, session, grading, persistence, returning user, corrupted-save recovery, light theme — all pass, zero console errors); ran deep web research through two research passes (~50 searches, ~60 sources); and re-verified the most load-bearing sources myself. Everything below is labeled by how well it is sourced.

**Source labels used throughout:**
- ✅ **Re-verified** — I fetched the page myself this session and confirmed the claim.
- 🔎 **Agent-verified** — fetched and quoted during the research pass, URL in the source log.
- 🟡 **[TENTATIVE]** — plausible, weakly sourced, or single-source.
- 🔴 **[GM-LEE]** — must be confirmed by Grandmaster Lee; never ship as fact without his approval.

---

# Part 1 — Audit of `hanbit-korean.html`

4,916 lines, 240 KB, one file, zero external requests. Line numbers below refer to the uploaded file.

## 1.1 Architecture map

| Lines | Subsystem | What it does |
|---|---|---|
| 1–620 | **CSS + design system** | Design tokens in `:root` (dark default) with a complete `:root.light` override set; Korean font stack variable `--ko`; 780px-max mobile-first shell; cards/buttons/tabs/chips/stats; session UI; on-screen keyboard; feedback panel; forecast bars, 12-week heatmap, tables; settings controls; toast; one `@media (max-width:560px)` pass; full FX layer styling (flash, edge glow, float text, banner, shake/pulse, combo chip, shimmer); mascot styling with mood classes; `prefers-reduced-motion` collapse (line 612) plus an app-level `:root.fx-off` kill switch (615–618). |
| 633–881 | **Hangul curriculum data** | `HANGUL_UNITS` — 10 units of letters, sound-change rules, words. Pure data. |
| 890–1790 | **Core curriculum data** | `UNITS_A`/`UNITS_B` — 12 units of grammar patterns + vocabulary with example sentences, conjugations, notes. Pure data. |
| 1801–2272 | **FX engine** | `Sfx` WebAudio synth (all sounds procedural — tiered C-major triads for correct, deliberately soft low tones for wrong); `FX` canvas particle system (burst/ring/rays/bloom/rain/fireworks, 1,400-particle cap, `subtle` mode scales counts, `avoidCenter` keeps text readable); DOM flourishes (flash, shake, pulse, float text, edge glow); banner queue capped at 2 so celebrations never stack unreadably. |
| 2283–2462 | **Mascot** | 호랑이 — a Korean folk tiger in inline SVG, complete with the 王 forehead mark. Moods (idle/happy/wow/oops/think), blink scheduler, speech bubble. Lives outside `#app` so re-renders never interrupt its animation. |
| 2473–2643 | **Juice layer** | Commentary line banks keyed to context (production, listening, comeback, "nemesis" card with ≥3 lapses, combo tiers at 3/5/8/12); mascot lines; `celebrateCorrect` escalates by tier; `celebrateWrong` is a soft sound + small shake + concerned-not-disapproving tiger ("a miss is information, not a failure"); word-count and unit-completion milestones. |
| 2659–2787 | **FSRS scheduler** | A correct FSRS-5 implementation: 19-weight vector matching published FSRS-5 defaults, power-law forgetting curve `R(t,S)=(1+19/81·t/S)^-0.5`, initial S/D from grade, difficulty update with linear damping + mean reversion (w7 toward D0(4)), recall-stability growth with the low-R bonus (w10), separate lapse formula (w11–w14), same-day short-term formula (w17/w18), interval fuzz ±5% to break up review lumps. `schedule()` validates grade and clamps target retention against corrupted saves. I confirmed the formula set against the FSRS wiki (✅ re-verified) and watched it produce correct values live: a first-try fast-correct answer wrote `S=15.69105` (= w3, initial stability for grade 4), `D≈3.22` (= D0(4)), interval ≈15.4 days with fuzz. |
| 2800–2957 | **Hangul input engine** | A full 두벌식 IME in ~150 lines: jamo composition, double-batchim combine/split, batchim carry-over, native-feeling backspace decomposition, QWERTY map + shift layer. |
| 2979–3101 | **Catalogue + state shape** | Curriculum flattened into `ITEMS` (id → item) + `SEQUENCE` (ordered ids); **skill ladders per item kind** (`LADDER`: word = recog→listen→recall→cloze, etc.); `DEFAULTS` state: `{settings, milestones, cards, introduced, log, days, created, version:1}`; every numeric setting clamped through one `SETTING_BOUNDS` table. Storage key `hanbit.v1`. |
| 3103–3192 | **Persistence** | `load()` with try/catch + `deepMerge` over defaults (old saves gain new fields automatically — this *is* the migration mechanism); storage probe with an honest "this browser won't save" banner; debounced `save()` with failure toast; DST-safe calendar-day arithmetic. |
| 3196–3280 | **Cards + planner** | Card key = `itemId|skill`; `isHolding` (reps ≥ 2 and S ≥ 3 days) gates ladder-rung unlocks; `dueCards()` **retires orphaned cards whose skill no longer exists on the item's ladder** — the code's existing answer to "curriculum changed under an old save"; overdue-ratio sort; `plan()` = due (capped) + new (daily budget). |
| 3285–3480 | **Session engine** | Reviews shuffled, new items *interleaved evenly* through them; expanding within-session lags (new card re-tested ~3 later, then ~9 later); failed cards requeued +4 with a 2-relearn cap; session time budget with a polite "stop here?" card; milestone detection; FX timer registry so quitting a session cancels every pending celebration. |
| 3485–3661 | **Exercise generation** | One exercise per card key: MC recognition (distractors drawn same-kind/same-POS), audio-only listening, free Korean production, cloze gap-fill inside real example sentences, and the sentence **tile builder** with decoy tiles pulled from sibling content. Instances are cached per queue position so re-renders never reshuffle options under your finger. |
| 3666–3698 | **Answer checking** | Normalizers, Levenshtein, three-way verdicts (right / close / wrong); "close" (edit distance 1, or stem-vs-conjugated form) grades as Hard rather than failing. |
| 3702–3737 | **Speech** | `speechSynthesis` with ko-KR voice discovery, per-voice setting, playing animation, graceful "no Korean voice" guidance. Speech is "a bonus, never a blocker." |
| 3742–3803 | **Analytics** | Honest split of **predicted recall** (model) vs **measured retention** (actual graded reviews, new cards excluded from the denominator — confirmed live in the smoke test); learning/young/mature counts; 14-day forecast; 12-week heatmap; streak that tolerates 2 rest days per rolling week by design. |
| 3824–4500 | **Views** | `render()` dispatch to Today / Progress / Course / Method / Settings + session/done screens. Everything is template-string rendering with a single `esc()` HTML-escaper applied consistently. The Method tab is a full essay explaining every design decision. |
| 4505–4692 | **Events** | One delegated click handler on `document` (data-attributes), change/input handlers clamped through `SETTING_BOUNDS`, full physical-keyboard support (1–4 answer MC, Enter advances, letters compose jamo, real IME passthrough). |
| 4697–4895 | **Actions** | Session lifecycle; grade-adjust bar that *rewinds the log entry* and re-grades; export (JSON download); **import that validates the raw file, then test-renders the new state and reverts if rendering throws**; reset with confirm. |
| 4900–4913 | **Boot** | Load → normalize → render inside try/catch; a save that cannot render is discarded with a toast rather than a blank screen; `beforeunload` flush. |

## 1.2 What I actually tested (headless Chromium, 390×844 viewport)

| Test | Result |
|---|---|
| First launch | ✅ Renders "Start with the alphabet", 585-item course, no localStorage until first action, **zero console errors/warnings, zero page errors** |
| New lesson session | ✅ Teach card → "Got it — test me" → MC exercise with 4 options |
| Answering + FSRS write | ✅ Feedback "Correct"; card `L:ㅇ\|sound` persisted with S=15.69105, D=3.2245, state `review`, interval 15.39 days — exactly what the FSRS-5 default weights predict for a fast first-try correct (auto-grade Easy) |
| Honest stats | ✅ Day record shows `reviews:1, correct:0, total:0` — new cards deliberately excluded from measured retention |
| Returning-user launch | ✅ Hero switches to "Today", "Done today 1", "Streak 1 day" |
| Corrupted saved data | ✅ Replaced the save with invalid JSON; app recovered to a fresh state and rendered (the `load()` catch path) |
| Dark/light | ✅ Toggle works, `:root.light` applies |
| Mobile layout | ✅ Verified visually at phone width (screenshot) |

Not yet exercised (deferred to the vertical-slice test pass): export/import round-trip, review-session scheduling across days, wrong-answer requeue timing, reduced-motion, keyboard-only navigation, TTS (headless browser has no Korean voice).

## 1.3 Reuse verdicts

**Reuse unchanged (engine):** FSRS module; card/ladder/unlock mechanics; session planner + interleaving + within-session lags; state load/save/merge/normalize; storage probe; export/import validation pattern; boot recovery; settings framework + bounds table; FX engine; mascot component; banner queue; toast; stats machinery; event delegation; `esc()` discipline; theme system; reduced-motion handling.

**Generalize (small, surgical changes):** the catalogue builder (currently hardcodes Hangul/core stages → becomes belt/domain/unit-driven); `LADDER` (per-kind ladders already exist — add new kinds instead of rewriting); progress groups on Today (stage groups → belt groups); milestones (word-count milestones → belt-readiness and domain milestones); Done-screen copy; Method essay (rewrite content, keep the format); commentary/mascot line banks (rewrite content, keep the selection logic).

**Korean-language-specific (keep, repurpose, or drop):**
- *HangulComposer + on-screen keyboard* — not needed for v1 Hapkido (students won't type Hangul), but it costs nothing to keep dormant and could power an optional "type the Korean term" advanced rung later. Recommend: keep the module, don't surface it in v1.
- *TTS (ko-KR)* — **keep.** It can pronounce 차렷, 준비, counting, and technique names today, before any Grandmaster Lee audio exists — clearly labeled as a synthetic voice placeholder until his recordings replace it.
- *Cloze/sentence-builder content* — the sentence tiles convert directly into **step-sequencing** ("arrange the major steps of this technique in order") with decoy steps as distractors. This is the single luckiest reuse in the file.
- *Romanization display setting* — keep; maps perfectly onto dojang practice.

**Replace entirely (content):** all curriculum data (Hangul units, vocab, grammar); brand block; particle glyphs (`FX_JAMO` → 합기도-relevant glyphs); praise lines context.

**Net-new (does not exist in Hanbit):** belt layer above units; technique schema; practice-log store; instructor-verification store; multi-bar readiness model; safety classification + gating; video player with "Demonstration coming soon" state; media folder architecture; instructor mode (PIN); approved-terminology glossary; curriculum versioning metadata (Hanbit's deepMerge + orphan-card retirement is a good foundation, but Hapkido needs explicit `curriculumVersion` stamping).

# Part 2 — Research findings

## 2.1 How Hapkido organizations vary — and why this forces a data-driven belt system

**The landscape.** Hapkido descends from Choi Yong-sool (최용술, 1904–1986), who claimed training under Takeda Sōkaku in Daitō-ryū aiki-jūjutsu — a claim documented as *disputed* in the Aikido Journal encyclopedia entry (🔎 [aikidojournal.com](https://aikidojournal.com/2011/08/27/yong-sul-choi/)). From his students the art fragmented into many simultaneous "governing" bodies, several of which claim primacy today: the Korea Kido Association / Daehan Kido Hoe (기도회, sanctioned 1963; 🔎 [documentation](http://www.hapkidoselfdefense.com/kidohae/index.html)); the Korea Hapkido Federation (대한합기도협회, from Ji Han-jae's 1965 association; 🔎 [history](https://www.scottshaw.com/koreahapkidofederation.html)); Ji Han-jae's later Sin Moo Hapkido (🔎 [federation PDF](http://hapkidoliitto.com/tapahtumat/dojunim.pdf)); Myung Jae-nam's International H.K.D. Federation / Hankido lineage (🔎 [hapkido.or.kr](https://www.hapkido.or.kr/bbs/intro1_6_kr.php), Korean, live and issuing dan certificates); the World Kido Federation / Hanminjok Hapkido Association (🔎 [membership page](https://www.worldkidofederation.com/membership-info)); Bong Soo Han's International Hapkido Federation (🔎 [bongsoohanihf.com](https://bongsoohanihf.com/)); the World Hapkido Association (🔎 [thehapkidocenter.com](http://www.thehapkidocenter.com/info/association.html)); Hapkidowon (🔎 [hapkidowon.com](https://www.hapkidowon.com/)); the World Hapkido Union (🔎 [theworldhapkidounion.org](https://theworldhapkidounion.org/)); Myung Kwang-sik's World Hapkido Federation; Jang Mu Won Hapkido; and the modern Combat Hapkido offshoot (ICHF, est. 1992; 🔎 [combathapkido.com](https://www.combathapkido.com/)). Note the name-collision hazard: at least **three distinct bodies** call themselves "International Hapkido Federation."

**Documented belt-ladder variation** (each row from a published rank page or handbook):

| System | Ladder | Source |
|---|---|---|
| International Hapkido Federation (Benko) | 10 gup, stripe-based: White → W/Y stripe → Yellow → Y/G → Green → G/B → Blue → B/R → Red → R/Black stripe → 1st Dan. No orange/purple/brown. Published minimum hours: 2 mo/36 hr early gups → 9 mo/162 hr at 1st gup | ✅ Re-verified: [itatkd.com](http://www.itatkd.com/ihfpromotegup.html), [time-in-rank](https://www.itatkd.com/ihfmintime.html) |
| Carter's MAA (Mu Sool Kwan lineage) | Same 10-gup stripe pattern as above — independently replicated | 🔎 [school handbook PDF](https://cartermartialarts.weebly.com/uploads/5/0/5/9/50596975/cartersmaa_handbook.pdf) |
| United States Hapkido Federation | 8 kup: Yellow → Orange → Green → Purple → Blue → **Brown → Red** → Temporary Black | 🔎 [ushapkidofederation.wordpress.com](https://ushapkidofederation.wordpress.com/belt-testing-sheets-and-certificate-information/) |
| Combat Hapkido school (ICHF) | 10 belts: White → Yellow → Orange → Green → Purple → Blue → **Brown → Red** → Red/Black → Black | 🔎 [chonjidefensivearts.com](https://www.chonjidefensivearts.com/self_defense_combat_hapkido/Belt-Ranks_74_pg.htm) |
| Australian Hapkido Association | 10 kup "tip" system: White → Yellow tip → Yellow → … → Red → Black tip → 1st Dan; ~3–6 months between early gradings, ~4–5 years to black | 🔎 [national handbook PDF](https://hapkidoaustralia.com/wp-content/uploads/2019/09/Student-Handbook-AHA-V7-2019.pdf) |
| Master Kwon (Daemoo) | **12 steps** incl. both purple and brown and a double-striped red | 🔎 [masterkwon.com](https://www.masterkwon.com/gups.html) |
| Sin Moo Hapkido (school syllabus) | Numbered **levels**, not a color ladder | 🔎 [nvahkd.com](https://nvahkd.com/syllabus-1) |
| Historical Korean baseline | White → Yellow → Blue → Red → Black, no gup ladder 🟡 [TENTATIVE — single author] | 🔎 [scottshaw.com](https://www.scottshaw.com/hapkidorank.html) |
| Youth variants | Junior ladders ending in **Junior Black / Poom**, class-count minimums (24–40 classes/level), age-16 conversion | 🔎 [Northwest Hapkido PDF](https://media.musclegrid.io/northwesthapkido.com/uploads/2020/01/07120525/Northwest-Hapkido-Curriculum.pdf), [questhapkido.com](https://www.questhapkido.com/programs/kids-hapkido-program/belts-and-promotions) |

**Conclusion (broadly shared, direct documentary evidence):** gup counts differ (8/10/12/levels); orange, purple, and brown exist in some systems and not others; where brown exists it sits *below* red (Korean convention — red is the senior color, unlike Japanese-lineage arts); the pre-black rank is variously "red/black stripe," "black tip," or "temporary black"; and multiple Korean national bodies certify dan ranks independently under their own regulations. **No researched ladder may be presented as LMAA's.** Worth noting: LMAA's existing school ladder (White → Yellow → Orange → Sr. Orange → Green → Sr. Green → Blue → Sr. Blue → Brown → Sr. Brown → Red → Sr. Red → Jr. Black → Black) is structurally consistent with the Korean red-above-brown convention and with the "senior/stripe intermediate rank" pattern several Hapkido systems use — but whether the Hapkido program shares that ladder is a 🔴 [GM-LEE] question.

## 2.2 Curriculum domains across reputable systems

Broadly shared across 3+ independent lineages (all sourced in the log): **breakfalls/nakbeop** (first-rank material everywhere — the signature early domain along with wrist-grab releases); **kicks**; **hand strikes and blocks**; **stances/footwork**; **wrist-grab releases**; **clothing/body-grab defenses**; **punch/kick/choke defenses**; **joint locks**; **throws** (including judo-derived); **pins/controls and basic ground survival** (depth varies widely); **weapons** — the *domain* is broadly shared while the weapon set is lineage-specific (danbong short stick and cane are the most common; staff, knife defense, sword family, rope/belt binding vary); **danjeon breathing / ki work** (traditional lineages; de-emphasized in Combat Hapkido); **etiquette/commands**; **sparring** (formats vary).

**The forms split is real and documented:** Scott Shaw states flatly that Hapkido "does not possess … forms" (🔎 [curriculum page](https://www.scottshaw.com/curriculum.html)); Combat Hapkido advertises "no forms or Hyungs" (🔎 [uwmta.org](https://uwmta.org/Forms/CombatHapkido.html)) — while Myung Kwang-sik's World Hapkido Federation publishes an entire *Hapkido Forms — Hyong Sae* textbook (🔎 [worldhapkidofederation.com](https://www.worldhapkidofederation.com/product-page/hapkido-forms-hyong-sae-by-grandmaster-kwang-sik-myung)) and the AHA curriculum contains named patterns. Whether LMAA Hapkido uses forms is 🔴 [GM-LEE]; the domain list must treat "Forms" as optional per belt.

## 2.3 Typical progression arc (from published rank documents)

Across the Benko IHF syllabus (✅), the AHA handbook, Carter's handbook, Master Kwon's ladder, Sin Moo's levels, and Northwest's youth curriculum (all 🔎), the same arc recurs:

1. **Beginner:** etiquette, stances, breakfalls and rolls, basic kicks/strikes/blocks, same-side wrist-grab releases.
2. **Intermediate:** clothing/hair/belt grabs, combination and spinning/jumping kicks, first joint-lock chains, hip/leg throws, bear hugs and headlocks.
3. **Advanced (pre-dan):** choke defense, knife defense, kick-catching defenses, multiple attackers, seated/ground defense, first weapons (danbong, cane).
4. **Dan levels:** weapons depth, pressure points, rope/belt binding, teaching.

This arc is a sensible default shape for the provisional framework — as a *shape*, not as content.

## 2.4 Principles — 원 / 유 / 화

The Won (circle) / Yu (water-flow) / Hwa (harmony/nonresistance) triad is verified across independent lineages: an American Black Belt Academy concepts page (🔎 [abbakick.com](https://www.abbakick.com/programs/hapkido/hapkido-concepts/)), the World Hankimuye Federation's "Sam Dae Wolli" (🔎 [hankimuye.org](https://www.hankimuye.org/what-we-teach/hankido/)), and Jang Mu Won's "Water, Circle, and Harmony" (🔎 [jangmuhapkido.com](https://www.jangmuhapkido.com/)). Wording varies; Combat Hapkido swaps "Harmony" for "Coordination." Safe to teach as the standard cross-lineage theory frame, with LMAA's exact phrasing 🔴 [GM-LEE].

## 2.5 Terminology and the romanization problem

The research produced a 70-term starter glossary (Hangul + Revised Romanization + observed gym spellings + English) covering commands, titles, counting (native and Sino-Korean), breakfall names, kicks, strikes/blocks, self-defense categories, weapons, and principles — drawn from school and federation glossaries (🔎 evokeacademy.com, ghahapkido.com, AHA handbook, hankimuye.org, and others in the log). Two findings matter for the app design:

1. **No two published glossaries agree on spellings.** *Gup/kup/geup* for 급; *kyung ye/kyungnet/gyeongnye* for 경례; *nak bop/nak-bup/nakbeop* for 낙법; one author even labels the side fall with a spelling (*chun bang*) that contradicts the standard 측방 (*cheukbang*). This validates your requirement for a **central approved-terminology glossary as the single source of truth**, with one canonical field per term (`schoolCommand` — however LMAA actually says/spells it) plus a standard-RR field and Hangul. The app engine should never romanize ad hoc.
2. **Recommended policy** (pending 🔴 [GM-LEE]): store Hangul as canonical; display LMAA's house spelling as primary; keep strict Revised Romanization in a secondary field for consistency checks; record known variants in `alternativeNames`.

The full glossary draft ships with the vertical slice as seed data, every row flagged `approvalStatus: 'draft'` until reviewed.

## 2.6 Children and safety — what authoritative sources actually say

- **AAP clinical report** (Demorest & Koutures, *Pediatrics* 2016; ✅ re-verified via the open PDF): children should train "only … supervised by instructors with appropriate training"; "martial arts competition and contact-based training should be delayed until children and adolescents have demonstrated adequate physical and emotional maturity during noncontact preparation"; youth participation in bouts involving chokeholds "should be strongly discouraged," with chokeholds carrying risk of "asphyxia, or other head and neck injury." ([article](https://publications.aap.org/pediatrics/article/138/6/e20163022/52609/Youth-Participation-and-Injury-Risk-in-Martial) · [open PDF](https://ncys.org/wp-content/uploads/2022/10/Injury-Risk-in-Martial-Arts_AAP.pdf))
- **Judo governing bodies:** USJF junior rules — no chokes (shime-waza) below age ~13, armlocks essentially 16+/black-belt divisions (🔎 [junior rank PDF](https://www.usjf.com/wp-content/uploads/2019/01/7JrRankReqs1s100715.pdf), [tournament rules](https://www.usjf.com/smoothcomp-tournament-rules/)); Kodokan/IJF junior guidance prohibits all joint locks and chokes for primary-school-age children because immature joints are vulnerable (🔎 [judo-ch.jp](https://www.judo-ch.jp/english/dictionary/terms/boy_kansetu/)).
- **BJJ (IBJJF):** youth technique legality is belt- and age-gated (wrist locks not until adult purple, etc.) (🔎 [rule summary](https://jits.gg/guides/kids-bjj-legal-submissions), [official rulebook](https://ibjjf.com/books-videos)).
- **Judo injury literature:** catastrophic head/neck injuries concentrate in **beginners in their first year**, implicating inadequate breakfall skill and supervision (Kamitani et al., *Am J Sports Med* 2013, 🔎 [PubMed](https://pubmed.ncbi.nlm.nih.gov/23765041/)); a structured in-person "Safe Fall" program raised correct protective backward-fall responses in 10–12-year-olds from <33% to >85% (DelCastillo-Andrés et al. 2018, 🔎 [MDPI](https://www.mdpi.com/1660-4601/15/12/2669)) — falls *can* be taught safely, progressively, and in person.
- **Hapkido-specific:** no major Hapkido federation publishes a formal restricted-technique list for minors (a verified *absence* — the field simply hasn't standardized this). Individual schools improvise: Quest Hapkido excludes "the more dangerous joint-locks" from its kids' program (🔎), while Northwest teaches youth chokes/throws (🔎) — policies diverge school by school. Meanwhile Korean bodies certify child dans (minimum age 8 for 1st dan per one body's summarized regs, 🟡 [TENTATIVE — Namuwiki summary; official site unreachable]).

**Design consequence:** the app must not inherit anyone's youth policy — it must make age/rank gating **configurable per technique** and default the dangerous categories to instructor-supervised, exactly as you specified. The judo/BJJ age rules are good reference defaults to *propose* to Grandmaster Lee, clearly labeled as borrowed reference points.

## 2.7 Learning-science evidence → what the app should do

Every row: finding → citation → design commitment. (Full URLs in the source log; agent-verified except where noted.)

| Evidence | Key source(s) | Commitment in this app |
|---|---|---|
| Retrieval practice beats restudy; effect grows with delay and feedback (g≈0.5–0.7) | Roediger & Karpicke 2006; Rowland 2014 meta; Adesope et al. 2017 (exact pooled g 🟡 paywalled) | Keep Hanbit's retrieve-first rule for all knowledge content. Corrective feedback after every answer. |
| Testing transfers to related material, but less than to identical items; varied retrieval helps | Pan & Rickard 2018 meta | Include application cards (new scenario, new clip) — not only verbatim term↔meaning pairs. |
| Spacing works; optimal gap scales with retention horizon | Cepeda et al. 2006 (317 experiments) | Keep FSRS (adaptive expansion), not fixed ladders. |
| FSRS is the documented state of the art for open schedulers | Ye, Su & Cao, KDD '22; open-spaced-repetition docs (✅ re-verified) | Keep Hanbit's FSRS-5 implementation byte-for-byte. Keep logging full review history (it already does) so parameters could be optimized later. |
| Fitts & Posner stages: cognitive → associative → autonomous (primary book 🟡 [UNVERIFIED online]; model standard in secondary sources) | Human Kinetics summary | The app serves the *cognitive* stage (what/why/sequence) and observation; the associative/autonomous stages belong to the mat. Say so explicitly in the Method tab. |
| Contextual interference: interleaving helps retention in lab motor tasks, but the applied-sport benefit is weak/inconsistent | Shea & Morgan 1979; Magill & Hall 1990; 2023 sport meta-analysis | Keep interleaving for *knowledge* cards (Hanbit already interleaves). Make no CI claims about physical practice; don't prescribe home drill schedules on its basis. |
| Modeling + physical practice beats either alone; observation and practice contribute distinct information | Shea, Wright, Wulf & Whitacre 2000; Ste-Marie et al. 2012 | Video demonstrations are paired with retrieval (watch → recall steps → re-watch), and the app frames itself as the *observation + knowledge* half of a whole whose other half is class. |
| A mix of expert and error-corrected novice models improves error detection | Rohbanfard & Proteau 2011 | "Spot the common error" exercises; future: GM Lee films common-mistake clips, not only perfect reps. |
| AO+MI (watching while imagining doing) outperforms observation alone | Chye et al. 2022 meta; Eaves et al. 2016 | Add a one-line imagery prompt to video screens: "As you watch, imagine performing it." Cheap, evidence-backed. |
| Video feedback helps only when paired with expert verbal cues | Mödinger et al. 2021 systematic review | Every clip carries key coaching cues + common errors as on-screen text; no raw unexplained video. |
| Slow motion is not automatically better | Bureau et al. 2021 (dance-skill study; authors 🟡) | Offer slow-mo as an option, never as a claim of superiority. |
| Mental practice enhances performance (less than physical practice; decays without it) | Driskell et al. 1994; Toth et al. 2020 replication | Optional guided mental-rehearsal step after sequence mastery — always framed as supplement to mat time. |
| Guidance hypothesis: constant feedback creates dependency; self-estimation first is better | Winstein & Schmidt 1990; Carter et al. 2014 | In practice logs, ask the student to self-rate *before* showing the checklist/reference. |
| External focus of attention beats internal | Wulf 2013 review | Coaching-cue *style guide* for content: prefer effect-focused cues ("drive the wrist toward the floor") where compatible with GM Lee's own teaching language. |
| Rewards can undermine intrinsic motivation; competence/autonomy sustain it; broken streaks demotivate most when self-blamed | Deci, Koestner & Ryan 1999 meta; Ryan & Deci 2000; Silverman & Barasch 2023 | Keep Hanbit's asymmetric celebration, rest-day-tolerant streak, no hearts/timers/penalties. (A dedicated peer-reviewed condemnation of punitive streaks specifically is thin — flagged honestly; the reward-undermining literature is the defensible base.) |
| Desirable difficulties: struggle is the mechanism | Bjork & Bjork 2011/2020 | Keep Hanbit's philosophy verbatim; rewrite the Method essay for Hapkido. |
| Unsupervised acquisition of throws/falls/locks/chokes has no supporting research base, and beginner injury data argues the opposite | Kamitani 2013; Angioi 2022; AAP 2016 (✅) | Hard gates: restricted techniques get recognition/sequencing/observation only, an explicit supervision notice, and instructor verification as the only completion path. No full-speed solo assignments. Ever. |

# Part 3 — Proposed design

## 3.1 Data model

Three cleanly separated layers, so moving a technique between belts is a data edit, never a logic edit.

**Layer 1 — Curriculum content (versioned, replaceable, shipped in `data/curriculum.js`):**

```js
CURRICULUM = {
  meta: { school: "LMAA (placeholder)", version: "0.1.0-provisional",
          approvalStatus: "provisional",           // provisional | approved
          approvedBy: null, approvedDate: null },

  belts: [ // fully data-driven: colors, order, gup numbers, names all editable
    { id: "white", order: 1, gup: 10,              // gup number TBD by GM Lee
      nameEnglish: "White Belt", nameKorean: "흰띠", romanization: "huin tti",
      color: "#f5f5f0", accentColor: "#c9c9c2",
      theme: "Foundation: how we train safely and respectfully",
      domains: ["etiquette","terminology","safety","stances","falling","kicks","strikes","releases"],
      minClassesSuggested: null,                    // 🔴 GM-LEE
      cumulative: true,                             // requires all previous-belt material
      childVariantOf: null }                        // supports separate junior ladders
    // ...
  ],

  domains: [ // configurable; not every domain appears at every belt
    { id: "etiquette",  nameEnglish: "Etiquette & School Procedures", nameKorean: "예절" },
    { id: "terminology",nameEnglish: "Korean Terminology",            nameKorean: "용어" },
    { id: "falling",    nameEnglish: "Falling & Rolling",             nameKorean: "낙법" }
    // ... the full list from your spec, each optional per belt
  ],

  glossary: [ // the single source of truth for spelling & translation
    { id: "charyeot", hangul: "차렷", rr: "charyeot", schoolSpelling: null, // 🔴 GM-LEE
      english: "attention", audioFile: null, approvalStatus: "draft" }
  ],

  items: [ /* techniques, terms, concepts — see technique schema below */ ]
}
```

**Technique schema** (your field list, typed and grouped — all fields optional except id/beltId/domain/kind/nameEnglish):

```js
{ id: "wb-rel-01", beltId: "white", domain: "releases", kind: "technique",
  sequenceOrder: 1,

  // naming — glossary-linked, never ad-hoc romanized
  nameEnglish: "Same-side wrist grab release (inward turn)",
  nameHangul: "손목수 1번", romanization: "sonmoksu il beon",
  schoolCommand: null /* 🔴 GM-LEE */, alternativeNames: [],

  // teaching content
  purpose: "...", principle: "won-circle",          // links to principle items
  startingPosition: "...", attackOrGrab: "Same-side straight wrist grab",
  stepSequence: ["...","...","..."],                // powers the sequencing exercise
  keyDetails: ["..."], commonErrors: ["..."], safetyNotes: ["..."],

  // safety & gating
  safetyClass: "partnerWithCare",   // knowledgeOnly | soloSafe | partnerWithCare |
                                    // instructorSupervisionRequired | academyOnly | restrictedByAge
  soloSafe: false, partnerRequired: true, instructorRequired: true,
  minimumAge: null, practiceRestrictions: "...",
  prerequisites: ["wb-fall-01"], cumulativeRequirement: true,

  // media — every field nullable; UI shows "Demonstration coming soon"
  media: { videoFullSpeed: null, videoSlowMotion: null,
           videoFront: null, videoSide: null, videoRear: null, videoCloseup: null,
           audioKorean: null, poster: null },
  transcriptKorean: null, translationLiteral: null, translationInstructional: null,
  translationStatus: "unverified",                  // unverified | verified

  // learning & verification
  quizPrompts: [], practiceAssignment: { type: "checklist", items: [], selfRateFirst: true },
  instructorCheckpoints: ["..."],

  // provenance
  source: "GM Lee curriculum (pending)", approvalStatus: "provisional",
  approvedBy: null, approvedDate: null, version: 1 }
```

**Layer 2 — Engine** (belt/domain-agnostic; the adapted Hanbit machinery). **Layer 3 — Student state** (localStorage, versioned, migratable), which *adds to* Hanbit's shape rather than replacing it:

```js
{ settings, milestones, cards, introduced, log, days, created,
  version: 2, curriculumVersion: "0.1.0-provisional",   // stamped for migration
  practiceLog: [ { itemId, date, type: "checklist"|"mental"|"class-prep",
                   selfRating, notes } ],                // self-reported — never "verified"
  verifications: { "wb-rel-01": { verified: true, by: "initials", date, note,
                                  curriculumVersion } }, // instructor-mode only
  instructor: { pinHash: null, log: [] } }
```

Migration policy: keep Hanbit's `deepMerge`-over-defaults plus orphan-card retirement, and add an explicit `migrate(state, fromVersion)` chain and a curriculum-diff check on boot (if an item id disappears from the curriculum, its cards retire exactly as Hanbit already does; verifications are preserved but flagged "for a previous curriculum version").

## 3.2 Learning ladders and the FSRS boundary

Per-kind ladders, exactly like Hanbit's `LADDER` table — just new kinds:

- **`term`** (FSRS-scheduled): recognize English meaning → recognize Korean term → hear & identify (TTS or GM Lee audio) → recall English meaning → recall/pronounce Korean (self-graded aloud, optional typing later) → use in context (scenario MC).
- **`concept`** (principles, safety, etiquette, history — FSRS-scheduled): recognize → explain purpose (MC, later "own words" self-check) → choose correct example → identify unsafe application → apply to scenario.
- **`technique`** — split across the boundary:
  - *Knowledge rungs (FSRS):* identify technique → identify starting situation/attack → arrange steps in order (tile builder) → select correct demonstration (video observation MC) → spot the common error → recall key coaching points.
  - *Physical rungs (NOT FSRS):* practice checkpoint (only if `soloSafe`/allowed; self-rated checklist, logged to `practiceLog`) → **instructor verification** (settable only in instructor mode).

**Hard rule, enforced in the engine:** FSRS stability, ladder position, streaks, and milestones can never change `safetyClass`, unlock a restricted technique's physical rung, or mark anything "verified." High stability marks *knowledge* mastered — the UI vocabulary is exactly your four phrases: "Knowledge mastered," "Ready to practice in class," "Instructor check required," "Instructor verified."

## 3.3 Readiness — five bars, never one number

Per belt: **Knowledge retention** (FSRS predicted recall over that belt's cards) · **Curriculum exposure** (items introduced / total) · **Practice completion** (assignments logged, permitted items only) · **Instructor verification** (verified / required) · **Cumulative readiness** (same rollup over all previous belts). Belt-test readiness displays as the five bars plus a plain-language sentence ("12 techniques still need an instructor check"), never a single percentage. Self-reported, app-measured, and instructor-observed numbers are visually distinct (your three-category distinction, kept everywhere including exports).

## 3.4 Safety system

Your six classifications, as a required enum on every item. Proposed defaults **(pending 🔴 GM-LEE sign-off)**: terminology/history/etiquette → `knowledgeOnly`–`soloSafe`; stances, footwork, breathing, solo kick/strike form at slow speed → `soloSafe` (adult), with kids defaulting more conservative; breakfalls → `instructorSupervisionRequired` until first verified in class, then GM Lee decides what home practice (if any) is allowed — the judo beginner-injury data is the reason for the conservative default; releases → `partnerWithCare` after instructor introduction; joint locks, throws, takedowns, chokes and choke defenses, weapon defenses → `instructorSupervisionRequired` (several likely `academyOnly`); anything age-flagged → `restrictedByAge` with `minimumAge`.

Restricted techniques get: no full-speed solo assignments, no reward for unsupervised completion, a persistent supervision notice, recognition/sequencing content only, instructor verification as the only completion path, and — for partner techniques — tapping/communication/control/release expectations surfaced in `instructorCheckpoints`. A permanent app-level disclaimer: preparation companion, not emergency/medical/legal/self-defense advice; rank is awarded only by the school.

## 3.5 Exercise types

Reused from Hanbit: MC recognition (KO→EN, EN→KO), audio identification, tile builder (→ **step sequencing**), teach cards, requeue-on-miss, grade-adjust bar. New but built on existing machinery: match attack→response (MC with attack prompt), match technique→principle, spot-the-safety-violation (MC on scenario text), select correct stance/direction, video observation → active recall (watch, then answer without replay; replay unlocks after attempt — your "retrieval before replaying" rule), identify-the-error (text now; video clips when recorded), scenario-based ethical decision (MC + explanation), belt-requirement recall ("name the three new releases at yellow"), cumulative belt-test review mode (pulls due + weak cards from all belts ≤ target), "explain it in your own words" (self-graded against key points — honest self-grading, like Hanbit's read-aloud rung), practice checklist, instructor checkpoint. Explicitly kept out, per your spec and the motivation literature: hearts, lives, timers, ads, loot boxes, punitive streaks.

## 3.6 Media architecture

**Recommended structure** (runs by double-clicking `index.html`; no server, no build system, no framework — none earns its cost here):

```
hapkido-companion/
  index.html            (engine + UI — the adapted Hanbit)
  data/curriculum.js    (all content; a .js file, not .json, because file:// 
                         blocks fetch() of local JSON in Chromium — a script tag works everywhere)
  assets/videos/  assets/audio/  assets/images/   (referenced relatively; <video>/<audio> tags work on file://)
  manifest.json + sw.js  (OPTIONAL, later, only if hosted — service workers do not
                          register on file://, so offline-caching is a hosted-deployment feature;
                          opened from disk, the folder is inherently offline)
```

Tradeoff stated plainly: leaving single-file costs "email one file" convenience (zip the folder instead) and buys sane video handling, editable curriculum data, and a workable recording workflow. Base64-embedding video would balloon the file by ~33% over raw size and break mobile browsers' memory budgets — not viable. The vertical slice ships this folder layout from day one with `assets/` empty, so the missing-media states are exercised from the start.

**Per-demonstration media workflow** (matching your 14-point list): GM Lee records in Korean (phone camera is fine; front + side minimum, close-up when detail demands) → files dropped into `assets/videos/` under a naming convention (`wb-rel-01_full_front.mp4`) → transcript in Korean → literal + instructional English translations (AI-drafted, **`translationStatus: "unverified"` until reviewed by GM Lee, you, or a qualified bilingual martial artist** — the UI shows an "unverified translation" badge) → subtitles as WebVTT (native `<track>` support, keeps his voice primary) → optional English voice-over as a separate audio toggle, never replacing the Korean audio → coaching cues, common errors, safety restrictions as structured fields → GM Lee approval flips `approvalStatus`. Missing any piece → polished "Demonstration coming soon" card with the technique's text content still fully functional; invalid path → same state plus a console warning (never a broken player).

**Copyright discipline:** research links in this report are citations, not assets. The app ships only original/licensed/permitted material; a `SOURCES.md` permission record accompanies any non-original asset. No YouTube rips, no other schools' manuals or demonstrations, no federation marks.

## 3.7 Instructor mode

Local, PIN-protected (hash stored locally; honest note that local PINs deter casual misuse, not determined tampering — fine for a single-device dojang context, revisit only if it ever goes multi-user/cloud, which is out of scope per your instruction). Capabilities: verify/unverify a technique, note, verifying instructor initials, date + curriculum version stamped automatically; belt-readiness gap view; overdue-terminology view; cumulative previous-belt weakness view; export/import a student progress file (same validated-import pattern as Hanbit). Student-facing screens always distinguish self-reported / app-measured / instructor-observed.

## 3.8 Progression rules

New-at-this-belt vs. review-from-previous vs. cumulative-test flags per item; prerequisite chains; instructor gates; minimum knowledge-retention threshold per belt (configurable, e.g., predicted recall ≥ 0.85 over the belt's cards before "test-ready" — 🔴 GM-LEE approves the threshold); optional attendance/time minimums if GM Lee uses them (fields exist; app treats attendance as school-recorded, not self-clicked); curriculum-version history retained. **Preview without unlock:** higher belts browsable read-only (if you choose), clearly watermarked "Preview — not started"; previewing never marks anything unlocked, earned, or in-progress. The app never awards rank; it reports preparation.

## 3.9 Visual identity

Keep: the entire layout system, both themes, typography, cards, bars, session flow, celebration asymmetry, reduced-motion support, settings depth. Adapt: an accent-token layer per belt (each belt page/session tints from `belt.color` against WCAG-checked text contrast — meaningful color without sacrificing readability); a belt-band motif in headers rather than decorative clip-art; respectful Korean visual influence via typography and restraint (the existing `--ko` stack), no stereotyped brush fonts or dragon clip-art; the tiger stays (a Korean folk tiger with the 王 mark is already culturally right at home in a dojang app) with dialogue rewritten to a young training partner's voice — encouraging, safety-aware, never authoritative about physical technique; clean placeholder slots for the LMAA logo and school colors; `FX_JAMO` particle glyphs swap to 합/기/도/원/유/화 and related. No federation marks or borrowed logos anywhere.

---

# Part 4 — Provisional belt framework

> ⚠️ **EXAMPLE ONLY — AWAITING GRANDMASTER LEE'S APPROVAL.**
> This is a discussion scaffold so the vertical slice has data to run on. It is not LMAA's curriculum, it is not presented to students as anyone's curriculum, and every element ships tagged `approvalStatus: "provisional"` with a visible "Provisional — pending Grandmaster Lee" badge in the UI until replaced.

**Shape A (default for the slice) — mirrors the school's existing ladder shape:** White → Yellow → Orange → Sr. Orange → Green → Sr. Green → Blue → Sr. Blue → Brown → Sr. Brown → Red → Sr. Red → Junior Black (under-16) / 1st Dan, mapped provisionally to 12th–1st gup. Chosen only because LMAA's TKD program already uses this shape and the red-above-brown order matches Korean convention; the Hapkido program may differ entirely. **Shape B (alternate, one edit away):** federation-style 10-gup stripe ladder (White → W/Y → Y → Y/G → G → G/B → B → B/R → Red → R/Black → Dan) as published by the Benko IHF (✅) and replicated by unrelated schools. The data model handles either (or anything else) by editing `belts[]` only.

**Provisional White-belt slice content** (the vertical-slice demo set, all `provisional`, shaped by the broadly-shared beginner arc in §2.3):

- *Etiquette & procedures:* bowing in/out, addressing instructors (관장님/사범님), dojang rules, tying the belt, class commands (차렷, 경례, 준비, 시작, 그만, 바로).
- *Terminology:* ~25 seed terms — commands, counting 1–10 (native), dojang/dobok/tti, hapkido, nakbeop, chagi basics.
- *History & philosophy:* what Hapkido is; the three principles (원/유/화) at recognition level; lineage one-paragraph (with the disputed-history honesty appropriate at this level).
- *Safety & responsible use:* tapping and partner communication; why supervision exists; when self-defense knowledge may and may not be used (age-appropriate, non-legal-advice framing).
- *Stances & movement:* ready stance, front stance, basic footwork — `soloSafe`.
- *Falling & rolling:* back fall, side fall (후방/측방낙법) — **knowledge + recognition only; `instructorSupervisionRequired` for practice.**
- *Basic kicks & strikes:* front kick (앞차기), basic blocks — knowledge rungs plus slow-form solo assignment if GM Lee permits.
- *Releases:* 2–3 same-side wrist-grab releases — `partnerWithCare`, instructor verification required.

Cumulative flag: on (each belt retests earlier material) — the broadly observed pattern, but 🔴 GM-LEE confirms.

---

# Part 5 — What we need from Grandmaster Lee

The complete intake list is packaged as a **separate bilingual (English/한국어) questionnaire document** — `grandmaster-lee-curriculum-intake.md` — formatted so he can answer section by section (or you can transcribe from existing paper testing sheets; photos of them are enough for me to structure the data). It covers, verbatim from your requirements: exact belt colors and order; stripes/intermediate ranks; gup/kup numbers; adult vs. child requirements; every technique per belt; testing standards; attendance/time minimums; school Korean terminology and spellings; cumulativeness; home-practice permissions; instructor-and-partner-required techniques; private/school-specific material; school name and branding; intended users. Plus the items this report surfaced: forms or no forms; weapon set (if any) and placement; junior black belt rules; readiness-threshold approval; safety-classification sign-off; media-recording willingness and translation-review workflow.

---

# Part 6 — Phased implementation plan

- **Phase 0 — this report.** Done. No code changed.
- **Phase 1 — answers.** You answer the four blocking questions (below); the questionnaire goes to Grandmaster Lee in parallel. Nothing blocks on his full answers — the slice runs provisional.
- **Phase 2 — engine separation + vertical slice.** Timestamped backup of the original; split engine from content into the folder layout; implement belt/domain/item catalogue, technique schema, safety gating, practice log, verification store, readiness bars, missing-media states; build the **White-belt slice end-to-end** (terminology, principles, safety, sequencing, observation-with-placeholder, practice checklist, instructor verification) with placeholder video slots; instructor mode v1. Test against the Part-7 matrix; deliver with an honest tested/untested report and a change summary against Hanbit.
- **Phase 3 — media pipeline.** Video player + WebVTT subtitles + unverified-translation badges; recording checklist for GM Lee; glossary enforcement pass; first real demonstration wired end-to-end as the template.
- **Phase 4 — curriculum ingestion.** GM Lee's real data replaces provisional (data-only change proves the architecture); belt-by-belt build-out **with your approval between belts**; child variants if in scope.
- **Phase 5 — hardening.** Full test matrix rerun, migration tests against Phase-2 saves, accessibility pass, device pass, reduced-motion audit; optional PWA/service worker only if you decide to host it.

# Part 7 — Vertical-slice test matrix (Phase 2 exit criteria)

First launch · returning user · new lesson session · review session (clock-shifted saves) · wrong-answer requeue · FSRS scheduling values spot-checked against hand-computed expectations · belt filtering · cumulative requirements · instructor verify/unverify + PIN · practice logging (and its absence for restricted techniques) · missing-video state · invalid media path · export/import round-trip + malformed-file rejection · curriculum update with existing progress (item moved between belts; item deleted) · dark/light · 320px-wide phone · keyboard-only run-through · reduced-motion · reset · corrupted save recovery. Each will be reported as **actually executed** (headless browser + manual) — not assumed from code existing. Known headless limitation: TTS requires a real device check.

# Part 8 — Source log

**Re-verified by me this session (✅):** [Benko IHF gup syllabus](http://www.itatkd.com/ihfpromotegup.html) · [AAP youth martial arts report (open PDF)](https://ncys.org/wp-content/uploads/2022/10/Injury-Risk-in-Martial-Arts_AAP.pdf) · [FSRS algorithm documentation](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm). (The AAP publisher page itself returns 403 to automated fetchers; the PDF mirror carries the full text. The old fsrs4anki wiki URL redirects to the awesome-fsrs wiki — cite the latter.)

**Hapkido organizations & curricula (agent-fetched 🔎):** aikidojournal.com/2011/08/27/yong-sul-choi · hapkidoselfdefense.com/kidohae · scottshaw.com/{koreahapkidofederation, hapkidorank, curriculum} · hapkidoliitto.com/tapahtumat/dojunim.pdf · nvahkd.com/{sinmoo, syllabus-1} · hapkido.or.kr/bbs/intro1_6_kr.php · hankimuye.org/{what-we-teach/hapkido, what-we-teach/hankido, h-k-d/hankido/myung-jae-nam} · worldkidofederation.com/membership-info · bongsoohanihf.com · itatkd.com/{ihfpromotegup, ihfmintime} · theworldhapkidounion.org · hapkidowon.com · combathapkido.com · worldhapkidofederation.com (Hyong Sae) · thehapkidocenter.com/info/association.html · jangmuhapkido.com · kimshapkido.com/faq · ushapkidofederation.wordpress.com (belt testing) · hapkidoaustralia.com student handbook PDF · cartermartialarts handbook PDF · chonjidefensivearts.com belt ranks · uwmta.org/Forms/CombatHapkido.html · masterkwon.com/gups.html · media.musclegrid.io Northwest Hapkido curriculum PDF · questhapkido.com kids belts · abbakick.com hapkido-concepts · evokeacademy.com Korean terms · ghahapkido.com Korean language · uskido.org origins article · usadojo.com/bong-soo-han · mookas.com/news/6225 (Korean news) · postype.com/@wundong (Korean practitioner, terminology corroboration only). *Tertiary, used as locators/clearly-labeled summaries only:* en.wikipedia.org (Choi Yong-sool, Hapkidowon), ko.wikipedia.org (대한합기도협회), namu.wiki (승단 규정), dikr.co.kr (단증 explainer). *Located but unreachable (TLS failures — noted honestly, not cited for content):* koreahapkido.kr · k-hapkido.com · hapkido7330.com · krhapkido.net · hmjhapkido.or.kr.

**Learning science & safety (agent-fetched 🔎, key items):** Roediger & Karpicke 2006 (*Psych Science*) · Rowland 2014 (*Psych Bulletin*) · Adesope et al. 2017 (*Rev Ed Research*) · Pan & Rickard 2018 (*Psych Bulletin*) · Cepeda et al. 2006 (*Psych Bulletin*) · Ye, Su & Cao KDD '22 (dl.acm.org/doi/10.1145/3534678.3539081) + open-spaced-repetition GitHub (py-fsrs, fsrs-rs, ts-fsrs) · Shea & Morgan 1979 · Magill & Hall 1990 · Buszard et al. 2023 sport-CI meta · Lee & Genovese 1988 · Wulf 2013 · Winstein & Schmidt 1990 · Carter, Carlsen & Ste-Marie 2014 (PMC4237043) · Shea, Wright, Wulf & Whitacre 2000 · Ste-Marie et al. 2012 · Rohbanfard & Proteau 2011 · Chye et al. 2022 (*Neurosci Biobehav Rev*) + 2025 follow-ups incl. the ankle-pick takedown study (*Frontiers in Psychology* 16:1596660) · Eaves et al. 2016 · Mödinger, Woll & Wagner 2021 · Bureau et al. 2021 · Driskell, Copper & Moran 1994 · Toth et al. 2020 · Kamitani et al. 2013 (*AJSM*) · Angioi et al. 2022 ukemi review (MDPI) · DelCastillo-Andrés et al. 2018 Safe Fall (MDPI) · Demorest & Koutures 2016 AAP (✅) · USJF junior rank PDF + tournament rules · judo-ch.jp junior kansetsu/shime page · jits.gg + ibjjf.com rulebook · Ryan & Deci 2000 · Deci, Koestner & Ryan 1999 · Bjork & Bjork 2011/2020 · Silverman & Barasch 2023 (*JCR*) · Sailer & Homner 2020 · Kukkiwon poom/dan rules PDF.

**Honestly flagged as unverified (🟡):** Fitts & Posner 1967 primary text (model confirmed via secondary sources only) · exact pooled effect sizes in Adesope 2017 (paywalled abstract) · the IEEE TKDE FSRS companion paper's independent DOI · author lists for Buszard 2023 and Bureau 2021 · Scott Shaw's historical 4-belt claim (single author) · Namuwiki's summary of Korean promotion regulations (official site unreachable) · absence of peer-reviewed work specifically on punitive streak mechanics.

---

*End of Phase 0 report. Nothing in this document is Grandmaster Lee's curriculum. The next code that gets written is the backup copy, then the schema, then one polished White-belt vertical slice — after the blocking questions below are answered.*


