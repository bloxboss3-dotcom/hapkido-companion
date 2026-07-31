/* ================================================================
   LMAA HAPKIDO COMPANION — CURRICULUM DATA (PROVISIONAL)
   ----------------------------------------------------------------
   ⚠ EVERYTHING IN THIS FILE IS AN EXAMPLE FRAMEWORK ONLY,
   AWAITING GRANDMASTER LEE'S APPROVAL. The belt ladder is a
   neutral 10-gup placeholder (the school's real Hapkido ladder
   replaces it by editing `belts` below — the engine never needs
   to change). No content here may be presented as the school's
   curriculum until approvalStatus is flipped by Grandmaster Lee.

   Editing rules:
   - Moving a technique between belts = change its beltId/unit.
   - Adding a belt = add an entry to `belts` (order + gup + color).
   - Media: drop files into assets/ and fill item.media paths.
     Missing media renders a polished "Demonstration coming soon"
     state — nothing breaks.
   ================================================================ */

window.CURRICULUM = {
  meta: {
    school: "Lee's Martial Arts Academy (branding placeholder)",
    appName: "Hapkido Companion",
    workingTitle: true,
    version: "0.5.0-provisional",
    approvalStatus: "provisional",          // provisional | approved
    approvedBy: null, approvedDate: null,
    audience: "current-students",
    minAgeTarget: 13,
    romanizationPolicy: "Revised Romanization until Grandmaster Lee sets house spellings"
  },

  /* ---------------- COURSES ---------------------------------------
     Two separate courses, the way a language app teaches two separate
     languages. Each one has its own path, its own daily new-item
     budget, its own colour, its own celebrations — and a student picks
     which one they are studying (and can switch any time).

       track  — which domains belong to it (see `domains` below).
       glyph  — the syllable shown in the course mark. Together with the
                app mark they spell 합·기·도.
       accent — the colour the WHOLE app takes while this course is
                active. Keep it clear of the feedback palette: green is
                "correct", amber is "wrong", salmon is "danger".

     Adding a third course later = add an entry here, give its domains
     that track, and nothing in the engine changes.
     ---------------------------------------------------------------- */
  courses: [
    { id: "way", order: 1, track: "knowledge",
      nameEnglish: "Terminology & Philosophy",
      shortName: "Terminology",
      nameKorean: "용어와 철학", rom: "yong-eo-wa cheol-hak",
      glyph: "도",
      tagline: "The words and the why",
      blurb: "Every Korean word you will hear in line, the etiquette around it, and the ideas the art is built on — 원, 유, 화, and why we tap.",
      firstStep: "Start with the room you train in",
      accent: "#6ea8fe", accentLight: "#2563eb", accentDim: "#2b4d80",
      fxGlyphs: ["도", "예", "말", "글", "원", "유", "화", "심", "한"] },
    { id: "art", order: 2, track: "technique",
      nameEnglish: "Techniques",
      shortName: "Techniques",
      nameKorean: "기술", rom: "gi-sul",
      glyph: "기",
      tagline: "The shape of every movement",
      blurb: "Stances, falls, kicks, strikes, releases and locks — named, sequenced and understood in your head, so class time goes to your body.",
      firstStep: "Start with how you stand",
      accent: "#b18cff", accentLight: "#6d3ce0", accentDim: "#463079",
      fxGlyphs: ["기", "술", "차", "막", "낙", "법", "손", "발", "합"] }
  ],

  /* ---------------- BELTS (provisional 10-gup example) ------------- */
  belts: [
    { id: "white",        order: 1,  gup: 10, nameEnglish: "White Belt",               nameKorean: "흰띠",        rom: "huin tti",
      color: "#e8e6da", stripe: null,      dark: false,
      theme: "Foundation — safety, respect, and your first movements",
      cumulative: true, provisional: true,
      units: [
        { id: "W1",  title: "Entering the Dojang",   blurb: "How we enter, bow, and treat the training hall." },
        { id: "W2",  title: "Words of Command",      blurb: "The Korean commands you will hear in every class." },
        { id: "W3",  title: "Counting to Ten",       blurb: "Count drills in Korean like everyone else in line." },
        { id: "W4",  title: "What Hapkido Is",       blurb: "The name, the history, and the three principles." },
        { id: "W5",  title: "Training Safely",       blurb: "Tapping, partner care, and why supervision exists." },
        { id: "W6",  title: "Standing Strong",       blurb: "Stances and stepping — your base for everything." },
        { id: "W7",  title: "Falling Without Fear",  blurb: "What breakfalls are and how we learn them safely." },
        { id: "W8",  title: "First Strikes & Kicks", blurb: "Front kick, low block, straight punch." },
        { id: "W9",  title: "Wrist Releases",        blurb: "Hapkido's classic first self-defense skills." },
        { id: "W10", title: "Getting Ready to Test", blurb: "What a belt evaluation looks like at our school." }
      ] },
    { id: "white-yellow", order: 2,  gup: 9,  nameEnglish: "White Belt · Yellow Stripe", nameKorean: "흰띠 · 노란줄", rom: "huin tti",
      color: "#e8e6da", stripe: "#f2c744", dark: false,
      theme: "Momentum — falling forward, kicking wider, first grab defenses",
      cumulative: true, provisional: true,
      units: [
        { id: "WY1", title: "Falling Forward",          blurb: "Front fall and the forward roll — the ones that make throws survivable later." },
        { id: "WY2", title: "Kicking Wider",            blurb: "Roundhouse, side kick, and the knee — angles beyond straight ahead." },
        { id: "WY3", title: "Breath & Energy",          blurb: "Danjeon breathing — the calm engine under every technique." },
        { id: "WY4", title: "Stronger Grips, Smarter Escapes", blurb: "Two hands on one, both wrists caught, grabbed from behind." },
        { id: "WY5", title: "First Clothing Grabs",     blurb: "Lapel and sleeve — when they grab cloth instead of wrist." },
        { id: "WY6", title: "Numbers & Directions",     blurb: "Sino-Korean counting, left-right, front-back — class navigation words." },
        { id: "WY7", title: "The Art Around You",       blurb: "What the belt ladder means, and why we shout." },
        { id: "WY8", title: "Testing Up",               blurb: "What changes at your second evaluation." }
      ] },
    { id: "yellow",       order: 3,  gup: 8,  nameEnglish: "Yellow Belt",               nameKorean: "노란띠",      rom: "noran tti",
      color: "#f2c744", stripe: null,      dark: false,
      theme: "Leverage — the first joint locks, wider kicks, bigger grabs",
      cumulative: true, provisional: true,
      units: [
        { id: "Y1", title: "How Joints Lock",        blurb: "Levers, circles, and why locks are trained slowly — the theory before the technique." },
        { id: "Y2", title: "The First Three Locks",  blurb: "Outward wrist lock, inward wrist lock, standing arm bar — Hapkido's signature begins." },
        { id: "Y3", title: "Body Words",             blurb: "Hand, arm, elbow, shoulder — the Korean your instructor uses to coach locks." },
        { id: "Y4", title: "Kicks That Turn Away",   blurb: "Back kick and axe kick — power from rotation and height." },
        { id: "Y5", title: "Knife Hand & Inside Block", blurb: "The open-hand strike and the block that crosses the center." },
        { id: "Y6", title: "Bigger Grabs",           blurb: "Two-handed lapel and the grab from behind your shoulder." },
        { id: "Y7", title: "Rolling Both Sides",     blurb: "The forward roll on your other side — throws won't ask which side you prefer." },
        { id: "Y8", title: "Yellow Evaluation",      blurb: "Locks change what examiners watch for." }
      ] },
    { id: "yellow-green", order: 4,  gup: 7,  nameEnglish: "Yellow Belt · Green Stripe", nameKorean: "노란띠 · 초록줄", rom: "noran tti",
      color: "#f2c744", stripe: "#3f9e5f", dark: false, theme: "Awaiting Grandmaster Lee's curriculum", cumulative: true, provisional: true, units: [] },
    { id: "green",        order: 5,  gup: 6,  nameEnglish: "Green Belt",                nameKorean: "초록띠",      rom: "chorok tti",
      color: "#3f9e5f", stripe: null,      dark: true,  theme: "Awaiting Grandmaster Lee's curriculum", cumulative: true, provisional: true, units: [] },
    { id: "green-blue",   order: 6,  gup: 5,  nameEnglish: "Green Belt · Blue Stripe",  nameKorean: "초록띠 · 파란줄", rom: "chorok tti",
      color: "#3f9e5f", stripe: "#3b76d6", dark: true,  theme: "Awaiting Grandmaster Lee's curriculum", cumulative: true, provisional: true, units: [] },
    { id: "blue",         order: 7,  gup: 4,  nameEnglish: "Blue Belt",                 nameKorean: "파란띠",      rom: "paran tti",
      color: "#3b76d6", stripe: null,      dark: true,  theme: "Awaiting Grandmaster Lee's curriculum", cumulative: true, provisional: true, units: [] },
    { id: "blue-red",     order: 8,  gup: 3,  nameEnglish: "Blue Belt · Red Stripe",    nameKorean: "파란띠 · 빨간줄", rom: "paran tti",
      color: "#3b76d6", stripe: "#d64545", dark: true,  theme: "Awaiting Grandmaster Lee's curriculum", cumulative: true, provisional: true, units: [] },
    { id: "red",          order: 9,  gup: 2,  nameEnglish: "Red Belt",                  nameKorean: "빨간띠",      rom: "ppalgan tti",
      color: "#d64545", stripe: null,      dark: true,  theme: "Awaiting Grandmaster Lee's curriculum", cumulative: true, provisional: true, units: [] },
    { id: "red-black",    order: 10, gup: 1,  nameEnglish: "Red Belt · Black Stripe",   nameKorean: "빨간띠 · 검은줄", rom: "ppalgan tti",
      color: "#d64545", stripe: "#23252b", dark: true,  theme: "Awaiting Grandmaster Lee's curriculum", cumulative: true, provisional: true, units: [] },
    { id: "black",        order: 11, gup: 0,  nameEnglish: "Black Belt (1st Dan)",      nameKorean: "검은띠",      rom: "geomeun tti",
      color: "#23252b", stripe: null,      dark: true,  theme: "Awarded by Grandmaster Lee — never by an app", cumulative: true, provisional: true, units: [] }
  ],

  /* ---------------- DOMAINS (configurable; optional per belt) ------
     track: 'knowledge' (terminology, customs, mind) or 'technique'
     (the physical art). This is the ONLY thing that decides which
     course an item belongs to — move a domain's track and every item
     in it moves course, path lane and session with no engine change. */
  domains: [
    { id: "etiquette",   track: "knowledge", nameEnglish: "Etiquette & School Procedures", nameKorean: "예절" },
    { id: "terminology", track: "knowledge", nameEnglish: "Korean Terminology",            nameKorean: "용어" },
    { id: "history",     track: "knowledge", nameEnglish: "History & Philosophy",          nameKorean: "역사와 철학" },
    { id: "safety",      track: "knowledge", nameEnglish: "Safety & Responsible Use",      nameKorean: "안전" },
    { id: "testprep",    track: "knowledge", nameEnglish: "Belt-Test Preparation",         nameKorean: "심사 준비" },
    { id: "stances",     track: "technique", nameEnglish: "Stances & Movement",            nameKorean: "서기·보법" },
    { id: "falling",     track: "technique", nameEnglish: "Falling & Rolling",             nameKorean: "낙법" },
    { id: "strikes",     track: "technique", nameEnglish: "Strikes, Blocks & Kicks",       nameKorean: "타격·막기·차기" },
    { id: "releases",    track: "technique", nameEnglish: "Releases & Escapes",            nameKorean: "빼기" },
    { id: "grabs",       track: "technique", nameEnglish: "Clothing & Body-Grab Defenses", nameKorean: "잡기 방어" },
    { id: "breathing",   track: "technique", nameEnglish: "Breathing & Energy",            nameKorean: "단전호흡" },
    { id: "locks",       track: "technique", nameEnglish: "Joint Locks",                   nameKorean: "관절기" }
  ],

  items: [

  /* ============ W1 · Entering the Dojang ============ */
  { id: "t-dojang", kind: "term", beltId: "white", domain: "terminology", unit: "W1",
    ko: "도장", rom: "dojang", en: "training hall",
    note: "Literally 'the place of the way'. We bow when entering and leaving it." },
  { id: "t-dobok", kind: "term", beltId: "white", domain: "terminology", unit: "W1",
    ko: "도복", rom: "dobok", en: "uniform",
    note: "Keep it clean and tied properly — it shows respect for training." },
  { id: "t-tti", kind: "term", beltId: "white", domain: "terminology", unit: "W1",
    ko: "띠", rom: "tti", en: "belt",
    note: "Your belt records your journey. It is earned on the mat, never in an app." },
  { id: "c-bowing", kind: "concept", beltId: "white", domain: "etiquette", unit: "W1",
    nameEnglish: "Bowing — when and why", nameHangul: "경례",
    body: ["We bow entering and leaving the dojang, at the start and end of class, and to a partner before and after working together.",
      "A bow is not worship — it is a mutual promise: I will train with care, and I will take care of you."],
    keyPoints: ["Bow entering and leaving the training floor", "Bow to your partner before and after practicing", "Eyes stay respectful — a bow is attention, not distraction"],
    quiz: {
      recog:   { q: "What does a bow mean between training partners?", a: "A mutual promise to train with care and take care of each other", d: ["A ranking of who is the better martial artist", "A religious ritual required by Korean tradition", "A signal that sparring is about to begin"], why: "Etiquette in Hapkido is safety culture in miniature — the bow is a promise of care." },
      example: { q: "Which situation calls for a bow?", a: "Stepping onto the training floor at the start of class", d: ["Answering your phone by the water fountain", "Tying your shoes in the lobby", "Watching class from the parents' seats"] },
      scenario:{ q: "Your partner helped you fix your stance all class. What fits Hapkido etiquette when you finish?", a: "Bow and thank them — they took care of your training", d: ["Walk off — helping is just their job", "Offer to pay them", "Challenge them to a match to prove you improved"] }
    } },
  { id: "c-titles", kind: "concept", beltId: "white", domain: "etiquette", unit: "W1",
    nameEnglish: "Addressing your teachers", nameHangul: "관장님 · 사범님",
    body: ["The head of the school is Gwanjangnim (관장님). An instructor is Sabeomnim (사범님).",
      "Answer instructors with respect, and ask questions after class or when invited — questions are welcome; interruptions are not."],
    keyPoints: ["관장님 (gwanjangnim) — head of the school", "사범님 (sabeomnim) — instructor", "Questions are welcome at the right moment"],
    quiz: {
      recog:   { q: "What does 관장님 (gwanjangnim) mean?", a: "The head of the school", d: ["Any black belt", "A training partner", "The referee at a tournament"] },
      example: { q: "Which is the respectful way to get help with a technique?", a: "Ask Sabeomnim at a good moment, like after drilling ends", d: ["Shout the question across the room mid-drill", "Grab the instructor's sleeve during someone else's turn", "Keep quiet forever and guess"] }
    } },
  { id: "c-dojang-rules", kind: "concept", beltId: "white", domain: "etiquette", unit: "W1",
    nameEnglish: "Dojang rules", nameHangul: "도장 규칙",
    body: ["Arrive early enough to be ready. Keep nails trimmed and jewelry off — they cut partners during grab work.",
      "No shoes on the mat, no food or gum, and tell an instructor about any injury before class, not after something worsens."],
    keyPoints: ["Jewelry off, nails trimmed — grab work is close work", "No shoes, food, or gum on the mat", "Report injuries to the instructor before training"],
    quiz: {
      recog:   { q: "Why do we remove jewelry before class?", a: "Rings and bracelets cut skin during grab and release work", d: ["It sets off the metal detector", "Jewelry is disrespectful to Korea", "It slows down your kicks"] },
      unsafe:  { q: "Which of these is the UNSAFE choice?", a: "Hiding a sore wrist so you can keep doing wrist releases", d: ["Telling Sabeomnim about your sore wrist before class", "Sitting out one drill on an instructor's advice", "Asking your partner to grab more lightly today"], why: "Hidden injuries plus joint techniques is how small problems become big ones." }
    } },

  /* ============ W2 · Words of Command ============ */
  { id: "t-charyeot", kind: "term", beltId: "white", domain: "terminology", unit: "W2",
    ko: "차렷", rom: "charyeot", en: "attention",
    note: "Heels together, hands at your sides, eyes forward. The class snaps together on this word." },
  { id: "t-gyeongnye", kind: "term", beltId: "white", domain: "terminology", unit: "W2",
    ko: "경례", rom: "gyeongnye", en: "bow",
    note: "You will hear 차렷, 경례 — attention, bow — at the start and end of every class." },
  { id: "t-junbi", kind: "term", beltId: "white", domain: "terminology", unit: "W2",
    ko: "준비", rom: "junbi", en: "ready",
    note: "Step into ready stance and be still. Ready is a position AND a state of mind." },
  { id: "t-sijak", kind: "term", beltId: "white", domain: "terminology", unit: "W2",
    ko: "시작", rom: "sijak", en: "begin",
    note: "Nothing starts before this word — that pause is a safety habit." },
  { id: "t-geuman", kind: "term", beltId: "white", domain: "terminology", unit: "W2",
    ko: "그만", rom: "geuman", en: "stop",
    note: "Everything stops instantly on 그만. Freezing on command keeps partners safe." },
  { id: "t-baro", kind: "term", beltId: "white", domain: "terminology", unit: "W2",
    ko: "바로", rom: "baro", en: "return / as you were",
    note: "Come back to your starting position, calm and ready." },
  { id: "t-gihap", kind: "term", beltId: "white", domain: "terminology", unit: "W2",
    ko: "기합", rom: "gihap", en: "spirit shout",
    note: "A sharp exhale with sound. It organizes your breathing and commits your technique." },
  { id: "t-gamsahamnida", kind: "term", beltId: "white", domain: "terminology", unit: "W2",
    ko: "감사합니다", rom: "gamsahamnida", en: "thank you",
    note: "Said to instructors and partners. You will use this one constantly." },

  /* ============ W3 · Counting to Ten ============ */
  { id: "n-hana", kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "하나", rom: "hana", en: "one" },
  { id: "n-dul",  kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "둘",   rom: "dul",  en: "two" },
  { id: "n-set",  kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "셋",   rom: "set",  en: "three" },
  { id: "n-net",  kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "넷",   rom: "net",  en: "four" },
  { id: "n-daseot",  kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "다섯", rom: "daseot",  en: "five" },
  { id: "n-yeoseot", kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "여섯", rom: "yeoseot", en: "six" },
  { id: "n-ilgop",   kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "일곱", rom: "ilgop",   en: "seven" },
  { id: "n-yeodeol", kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "여덟", rom: "yeodeol", en: "eight",
    note: "The ㅂ is silent here — sounds like 'yeo-deol'." },
  { id: "n-ahop", kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "아홉", rom: "ahop", en: "nine" },
  { id: "n-yeol", kind: "term", beltId: "white", domain: "terminology", unit: "W3", ko: "열",   rom: "yeol", en: "ten",
    note: "Count kicks out loud in class: 하나, 둘, 셋… all the way to 열." },

  /* ============ W4 · What Hapkido Is ============ */
  { id: "t-hapkido", kind: "term", beltId: "white", domain: "terminology", unit: "W4",
    ko: "합기도", rom: "hapgido", en: "Hapkido — the way of coordinated energy",
    note: "합 hap = join/coordinate · 기 gi = energy · 도 do = way. Commonly spelled 'Hapkido'." },
  { id: "c-meaning", kind: "concept", beltId: "white", domain: "history", unit: "W4",
    nameEnglish: "What the name means", nameHangul: "합기도",
    body: ["Hap (합) means to join or coordinate. Gi (기) is energy. Do (도) is a way or path.",
      "Hapkido: the way of coordinating energy — yours and your partner's. You do not meet force with force; you join it and redirect it."],
    keyPoints: ["합 join · 기 energy · 도 way", "Redirect force instead of colliding with it"],
    quiz: {
      recog: { q: "What does the name 'Hapkido' mean?", a: "The way of coordinating energy", d: ["The way of the fist and foot", "The art of the sword", "The way of stopping conflict by force"] },
      example: { q: "Which choice shows the 'hap' (coordinate) idea?", a: "Turning with a push so the pusher stumbles past you", d: ["Pushing back harder than you were pushed", "Standing perfectly rigid so nothing moves you", "Closing your eyes and hoping"] }
    } },
  { id: "c-origins", kind: "concept", beltId: "white", domain: "history", unit: "W4",
    nameEnglish: "Where Hapkido comes from", nameHangul: "역사",
    body: ["Modern Hapkido traces to Choi Yong-sool (최용술, 1904–1986), who taught in Korea after 1945. He said he studied Daito-ryu aiki-jujutsu in Japan; historians still debate the details, and honest schools say so.",
      "From his students the art spread into many branches — which is why belt colors and requirements differ between schools, and why OUR curriculum comes from Grandmaster Lee, not from the internet."],
    keyPoints: ["Choi Yong-sool, teaching in Korea after 1945", "The early history is genuinely debated", "There is no single universal Hapkido curriculum — ours comes from Grandmaster Lee"],
    quiz: {
      recog: { q: "Who is modern Hapkido traced to?", a: "Choi Yong-sool", d: ["Bruce Lee", "General Choi Hong-hi", "Ip Man"] },
      example: { q: "Why do Hapkido schools have different belt systems?", a: "The art spread through many independent branches with no single governing curriculum", d: ["Belt colors are assigned randomly each year", "Every country is legally required to use its own colors", "Only one school in the world teaches real Hapkido"], why: "This is also why the app treats Grandmaster Lee as the only curriculum authority." }
    } },
  { id: "c-won", kind: "concept", beltId: "white", domain: "history", unit: "W4",
    nameEnglish: "Won — the circle principle", nameHangul: "원 (圓)",
    body: ["Won means circle. Instead of blocking force head-on, Hapkido leads it along a curve — the attacker's own power swings around and works against them.",
      "You will feel this first in wrist releases: you don't yank straight back, you circle out through the weak line of the grip."],
    keyPoints: ["Lead force along a curve instead of colliding", "Circles turn their power into your technique"],
    quiz: {
      recog: { q: "The circle principle (원, won) says…", a: "Redirect force along a curve so it works against the attacker", d: ["Always fight from a circular ring", "Spin as fast as possible at all times", "Strike only with circular weapons"] },
      example: { q: "Which is Won in action?", a: "Circling your gripped hand through the thumb-side gap instead of pulling straight back", d: ["Pulling straight back against all five fingers", "Gripping harder than your partner", "Ignoring the grab and walking away backwards"] }
    } },
  { id: "c-yu", kind: "concept", beltId: "white", domain: "history", unit: "W4",
    nameEnglish: "Yu — the water principle", nameHangul: "유 (流)",
    body: ["Yu is the way of water: continuous, adaptable, never frozen. Water doesn't argue with a stone — it flows around it and keeps going.",
      "In practice: stay relaxed, keep moving, and let your technique adapt to what your partner actually does instead of what you planned."],
    keyPoints: ["Stay relaxed and continuous", "Adapt to what actually happens, like water around a stone"],
    quiz: {
      recog: { q: "The water principle (유, yu) teaches…", a: "Flow continuously and adapt, instead of freezing or forcing", d: ["Train only near water", "Be as heavy as possible", "Never change your plan mid-technique"] },
      example: { q: "Your partner resists the release you started. What is the 'water' answer?", a: "Flow into a different angle their resistance just opened", d: ["Pull harder on the same line until something gives", "Stop completely and restart from zero", "Complain that they resisted wrong"] }
    } },
  { id: "c-hwa", kind: "concept", beltId: "white", domain: "history", unit: "W4",
    nameEnglish: "Hwa — the harmony principle", nameHangul: "화 (和)",
    body: ["Hwa is harmony, or nonresistance: blend with force before you redirect it. If they push, you turn; if they pull, you enter.",
      "Harmony is also the ethic of the dojang — we take care of partners, because they lend us their body to learn with."],
    keyPoints: ["Blend first, redirect second", "If they push, turn; if they pull, enter", "Harmony includes how we treat partners"],
    quiz: {
      recog: { q: "Hwa (화) means…", a: "Blend with incoming force instead of resisting it head-on", d: ["Always attack first", "Match your uniform to your school colors", "Shout louder than your opponent"] },
      example: { q: "Your partner pushes you hard. The Hwa answer is to…", a: "Turn with the push so their force passes you", d: ["Push back with exactly equal force", "Fall down immediately", "Grab their throat"] }
    } },
  { id: "c-principles-deeper", kind: "concept", beltId: "white", domain: "history", unit: "W4", optional: true,
    nameEnglish: "The three principles together (enrichment)", nameHangul: "삼대원리",
    body: ["Won, Yu, and Hwa are one motion seen three ways: blend with the force (hwa), lead it in a curve (won), and keep it flowing (yu).",
      "Different Hapkido lineages phrase the triad differently — wording in this app is provisional until Grandmaster Lee sets ours."],
    keyPoints: ["삼대원리 samdae wolli — the three great principles", "One motion, three views: blend, circle, flow"],
    quiz: {
      recog: { q: "삼대원리 (samdae wolli) refers to…", a: "The three principles: circle, water/flow, harmony", d: ["The three belt colors of Hapkido", "Three forbidden techniques", "The three founders of Taekwondo"] }
    } },

  /* ============ W5 · Training Safely ============ */
  { id: "c-tapping", kind: "concept", beltId: "white", domain: "safety", unit: "W5",
    nameEnglish: "Tapping — the most important technique", nameHangul: "탭",
    body: ["Tapping (on your partner, yourself, or the mat — twice, clearly) means STOP NOW. Releases happen instantly, every time, no questions.",
      "Tap early. Pain is not toughness training in joint work — a tap protects the wrist you need for the next forty years."],
    keyPoints: ["Tap twice, clearly, on partner / yourself / the mat", "Release INSTANTLY when you feel a tap", "Tap early — before pain, at pressure"],
    quiz: {
      recog:  { q: "What does a tap mean?", a: "Stop now — release immediately, no questions", d: ["Try harder", "Switch partners", "The technique was done incorrectly"] },
      unsafe: { q: "Which is the DANGEROUS behavior?", a: "Holding a lock a moment longer after the tap to 'finish' it", d: ["Releasing the instant you feel a tap", "Tapping before it hurts", "Asking your partner to go slower"], why: "The moment after the tap is where training injuries happen. Release is instant, always." },
      scenario: { q: "Mid-technique, something in your wrist feels wrong but it doesn't hurt yet. You…", a: "Tap now — pressure is enough reason", d: ["Wait until it actually hurts to be sure", "Tough it out so you don't look weak", "Yank your arm free as hard as you can"] }
    } },
  { id: "c-partner-care", kind: "concept", beltId: "white", domain: "safety", unit: "W5",
    nameEnglish: "Partner care — slow is smooth", nameHangul: "배려",
    body: ["Your partner lends you their body. Apply techniques slowly, with control, and watch their face — feedback comes before the tap.",
      "Speed is earned: technique first at drilling pace, speed only when the instructor says both of you are ready."],
    keyPoints: ["Slow, controlled application while learning", "Watch your partner's face and posture, not just your grip", "Speed is added only when the instructor says so"],
    quiz: {
      recog:  { q: "When do partners add speed to a defense technique?", a: "When the instructor says both partners are ready", d: ["Whenever the stronger partner feels like it", "On the first repetition, to be realistic", "Only at tournaments"] },
      unsafe: { q: "Which is the unsafe partner?", a: "The one cranking a new lock fast to make it 'work'", d: ["The one drilling slowly with control", "The one asking 'was that pressure okay?'", "The one who stops the moment anything feels wrong"] }
    } },
  { id: "c-supervision", kind: "concept", beltId: "white", domain: "safety", unit: "W5",
    nameEnglish: "Why some techniques are class-only", nameHangul: "지도 감독",
    body: ["Falls, throws, joint locks, and choke defenses are learned ONLY with an instructor present. This is not gatekeeping — beginner injury data in throwing arts is worst in the first year, before falling skill exists.",
      "This app teaches you the names, steps, and safety points so class time goes further. It never replaces the mat, and it never verifies physical skill — instructors do."],
    keyPoints: ["Falls, throws, locks, chokes: instructor-present only", "The app builds knowledge; the instructor verifies skill", "Beginners are the highest-risk group — that is why the rule exists"],
    quiz: {
      recog:  { q: "Why does the app refuse to 'unlock' throws for home practice?", a: "High-risk skills are only safe to learn under an instructor — the app only prepares your knowledge", d: ["To sell a premium subscription", "Because throws are secret", "Because home floors are always dirty"] },
      unsafe: { q: "Which is the UNSAFE plan?", a: "Teaching your friend breakfalls on the driveway after watching a video", d: ["Reviewing the fall's safety points in the app before class", "Asking Sabeomnim to check your side fall next class", "Practicing your stance and footwork at home"], why: "Concrete + no supervision + no falling skill is exactly the beginner-injury pattern." },
      scenario: { q: "You mastered the wrist-release steps in the app. What does that mean?", a: "Your KNOWLEDGE is ready — now practice it in class and get it instructor-verified", d: ["You are now qualified to use it at full speed", "You can skip the next belt test", "You should teach it to classmates yourself"] }
    } },
  { id: "c-responsible", kind: "concept", beltId: "white", domain: "safety", unit: "W5",
    nameEnglish: "When may self-defense be used?", nameHangul: "책임",
    body: ["Hapkido skills exist to protect people, starting with your partners in class. Outside, the first choices are always: be aware, leave, de-escalate, get help.",
      "Physical technique is a last resort when escape isn't possible — and only with the minimum control needed to get safe. This is school policy and good ethics; it is not legal advice."],
    keyPoints: ["Aware → leave → de-escalate → get help → technique last", "Minimum needed to get safe, then get safe", "The app and school teach ethics, not legal advice"],
    quiz: {
      recog:   { q: "What is the FIRST tool of self-defense?", a: "Awareness and leaving early", d: ["A wrist lock", "A loud kihap", "A strong front kick"] },
      scenario:{ q: "A classmate at school shoves you and walks away. Hapkido ethics says…", a: "You're safe — let it end; report it if needed", d: ["Chase them and apply a wrist lock", "Shove them back harder to teach respect", "Challenge them to meet after school"], why: "Technique is for when you cannot get safe any other way. You are already safe." },
      unsafe:  { q: "Which use of training is OUT OF BOUNDS?", a: "Demonstrating a joint lock on an unwilling friend to show it works", d: ["Drilling with a consenting partner in class", "Describing what you learned at dinner", "Practicing stances alone at home"] }
    } },

  /* ============ W6 · Standing Strong ============ */
  { id: "t-seogi", kind: "term", beltId: "white", domain: "terminology", unit: "W6",
    ko: "서기", rom: "seogi", en: "stance" },
  { id: "x-junbi-seogi", kind: "technique", beltId: "white", domain: "stances", unit: "W6",
    nameEnglish: "Ready stance", nameHangul: "준비 서기", romanization: "junbi seogi",
    purpose: "The neutral, balanced position every drill starts and ends in.",
    startingPosition: "Standing naturally, called to 준비.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "From attention, step your left foot out to shoulder width",
      "Bend your knees slightly — soft, not locked",
      "Bring both fists in front of your belt, elbows relaxed",
      "Level your eyes forward and breathe down into your belly"
    ],
    keyDetails: ["Feet shoulder width, weight even on both feet", "Knees soft so you can move any direction instantly", "Shoulders down and relaxed — tension is slow"],
    commonErrors: ["Locking the knees straight", "Shrugging the shoulders up toward the ears", "Staring at the floor instead of level ahead"],
    safetyNotes: ["Completely safe to practice alone."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "Step into ready stance slowly 5 times, checking feet at shoulder width",
      "Hold for 5 slow belly breaths with soft knees",
      "Have someone lightly nudge your shoulder — you should feel stable, not tippy",
      "Check in a mirror: level eyes, relaxed shoulders" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "x-ap-seogi", kind: "technique", beltId: "white", domain: "stances", unit: "W6",
    nameEnglish: "Front stance", nameHangul: "앞 서기", romanization: "ap seogi",
    purpose: "A stable forward stance for stepping, blocking, and striking drills.",
    startingPosition: "From ready stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "Step one foot forward about one walking step",
      "Point both feet mostly forward, back heel grounded",
      "Bend the front knee over the front foot",
      "Keep your torso upright — push the floor, not your nose, forward"
    ],
    keyDetails: ["Front knee bends over the foot, not past the toes", "Back leg strong, back heel pressing the floor", "Hips and shoulders square forward"],
    commonErrors: ["Leaning the chest out over the front knee", "Lifting the back heel off the floor", "Standing on a tightrope — feet in one line, no side-to-side base"],
    safetyNotes: ["Safe to practice alone on a non-slip floor."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "Step forward into front stance 5 times each side, slowly",
      "Freeze and check: is the front knee over the foot?",
      "Feel the back heel pressing the floor for 3 breaths",
      "Walk 4 stances forward, 4 back, keeping height level" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "x-footwork", kind: "technique", beltId: "white", domain: "stances", unit: "W6",
    nameEnglish: "Basic stepping & pivot", nameHangul: "기본 보법", romanization: "gibon bobeop",
    purpose: "Moving without losing your base — the footwork under every Hapkido redirection.",
    startingPosition: "Ready stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "Slide the leading foot in the direction you're going",
      "Push with the other leg and let it follow, back to shoulder width",
      "For a pivot: turn on the ball of one foot, hips leading",
      "Finish every move back in a balanced stance, knees soft"
    ],
    keyDetails: ["Slide-step: feet skim the floor, never cross", "Head stays level — no bobbing up and down", "Hips turn first on pivots; feet follow the hips"],
    commonErrors: ["Crossing the feet mid-step", "Rising tall while moving, then re-bending", "Pivoting on the heel and tipping backward"],
    safetyNotes: ["Safe to practice alone. Clear space, socks off on slick floors."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "Slide-step forward/back/left/right 5 times each, staying level",
      "Pivot 90° on the ball of the foot 5 times each side",
      "String them: step-step-pivot, slowly, without crossing feet",
      "Repeat once with eyes closed at half speed — balance check" ] },
    media: {}, approvalStatus: "provisional" },

  /* ============ W7 · Falling Without Fear ============ */
  { id: "t-nakbeop", kind: "term", beltId: "white", domain: "terminology", unit: "W7",
    ko: "낙법", rom: "nakbeop", en: "breakfall",
    note: "The art of hitting the ground without getting hurt — Hapkido's real first superpower." },
  { id: "x-hubang-nakbeop", kind: "technique", beltId: "white", domain: "falling", unit: "W7",
    nameEnglish: "Back fall", nameHangul: "후방낙법", romanization: "hubang nakbeop",
    purpose: "Absorb a backward fall safely: protect the head, spread the impact.",
    startingPosition: "Learned first from a low squat on mats.",
    safetyClass: "instructorSupervisionRequired", soloSafe: false, partnerRequired: false, instructorRequired: true,
    practiceRestrictions: "Learn the shape and safety points here. Physical attempts happen on mats, with your instructor, starting from a low squat — never at home, never on hard floor.",
    stepSequence: [
      "From a low squat, tuck your chin hard to your chest",
      "Round your back like a rocking chair",
      "Roll backward onto your shoulders — hips first, never flat",
      "Slap the mat with both arms at about 45° as your back lands",
      "Keep your head curled forward off the mat the whole time"
    ],
    keyDetails: ["Chin tucked — eyes on your belt knot", "Arms slap the mat at ~45°, palms down", "Land rounded on the shoulders, never flat on the spine or head"],
    commonErrors: ["Letting the head whip back to the mat", "Reaching back with straight arms to catch the fall", "Landing flat-backed instead of rocking through a curve"],
    safetyNotes: ["Instructor supervision required — this is how falling stays the thing that PROTECTS you.", "In class you will start low and only rise as your instructor approves."],
    instructorCheckpoints: ["Chin stays tucked through the whole fall", "Slap timing — arms strike as the back lands", "No reaching back with straight arms", "Comfortable from squat height before any progression"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-cheukbang-nakbeop", kind: "technique", beltId: "white", domain: "falling", unit: "W7",
    nameEnglish: "Side fall", nameHangul: "측방낙법", romanization: "cheukbang nakbeop",
    purpose: "Absorb a sideways fall: one line of your body and one arm share the impact.",
    startingPosition: "Learned first lying down, then from a squat, on mats.",
    safetyClass: "instructorSupervisionRequired", soloSafe: false, partnerRequired: false, instructorRequired: true,
    practiceRestrictions: "Knowledge and recognition here; physical practice only on mats with your instructor.",
    stepSequence: [
      "From a low squat, sweep one leg across and sit toward that hip",
      "Tuck your chin and curl toward your chest",
      "Land on the side of your body — hip, then shoulder, in one line",
      "Slap the mat with the same-side arm at about 45°",
      "Top leg stays bent, foot flat — never crossed over"
    ],
    keyDetails: ["One straight line of contact: hip to shoulder", "Same-side arm slaps at ~45°, palm down", "Chin tucked, head never touches the mat"],
    commonErrors: ["Catching the fall on a straight arm or elbow", "Landing flat on the back instead of the side line", "Head resting on the mat at the end"],
    safetyNotes: ["Instructor supervision required. Wrists and elbows are exactly what the slap protects — done wrong, they take the hit instead."],
    instructorCheckpoints: ["Single side-line landing (hip→shoulder)", "Slap with the correct arm and angle", "Chin tucked, head clear of the mat", "Controlled from squat height before progression"],
    media: { videoFullSpeed: "assets/videos/missing-demo-sidefall.mp4" }, /* intentionally absent file — exercises the invalid-media state */
    approvalStatus: "provisional" },

  /* ============ W8 · First Strikes & Kicks ============ */
  { id: "t-chagi", kind: "term", beltId: "white", domain: "terminology", unit: "W8",
    ko: "차기", rom: "chagi", en: "kick" },
  { id: "t-makgi", kind: "term", beltId: "white", domain: "terminology", unit: "W8",
    ko: "막기", rom: "makgi", en: "block" },
  { id: "t-jireugi", kind: "term", beltId: "white", domain: "terminology", unit: "W8",
    ko: "지르기", rom: "jireugi", en: "straight punch / thrust" },
  { id: "x-ap-chagi", kind: "technique", beltId: "white", domain: "strikes", unit: "W8",
    nameEnglish: "Front kick", nameHangul: "앞차기", romanization: "ap chagi",
    purpose: "The first kick: a straight, snapping kick to the front with the ball of the foot.",
    startingPosition: "Front stance or ready stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    practiceRestrictions: "Solo practice at SLOW form speed only — height and power are built in class.",
    stepSequence: [
      "Lift the kicking knee toward your chest, foot under the knee",
      "Pull the toes back so the ball of the foot leads",
      "Extend the leg forward in a straight snap",
      "Re-chamber the knee immediately after the kick",
      "Set the foot down in a balanced stance"
    ],
    keyDetails: ["Knee first — the chamber aims the kick", "Toes pulled back; the ball of the foot strikes", "Re-chamber before you set down — never leave the leg hanging"],
    commonErrors: ["Swinging the straight leg up like a soccer kick", "Kicking with the toes instead of the ball of the foot", "Dropping the leg after impact without re-chambering"],
    safetyNotes: ["Solo: slow form only, waist height or below, near a wall or chair for balance at first."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow chamber-extend-rechamber cycles per leg, holding a chair if needed",
      "Check toes: pulled back on every rep",
      "5 kicks per leg at knee height, slow, with full balance on set-down",
      "Count a set out loud in Korean: 하나 … 열" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "x-arae-makgi", kind: "technique", beltId: "white", domain: "strikes", unit: "W8",
    nameEnglish: "Low block", nameHangul: "아래막기", romanization: "arae makgi",
    purpose: "Sweep a low attack away from your body with the forearm.",
    startingPosition: "Front stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "Chamber the blocking fist by the opposite ear, palm in",
      "Sweep the arm down and across your body",
      "Finish with the fist a hand-width above the knee, arm slightly bent",
      "Pull the other hand back to your hip at the same time"
    ],
    keyDetails: ["Block with the outer forearm, not the hand", "Finish slightly bent — a locked elbow absorbs nothing", "The pulling hand at the hip powers the block"],
    commonErrors: ["Blocking with a straight, locked arm", "Sweeping only the arm — no hip turn behind it", "Finishing the block across the wrong knee"],
    safetyNotes: ["Safe to practice alone at slow speed."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow low blocks each side from front stance",
      "Check the finish: fist above the knee, elbow soft",
      "Feel the opposite hand pull to the hip on every rep",
      "5 more with a slow hip turn driving the sweep" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "x-jireugi", kind: "technique", beltId: "white", domain: "strikes", unit: "W8",
    nameEnglish: "Straight punch", nameHangul: "바로 지르기", romanization: "baro jireugi",
    purpose: "The basic straight punch — structure and breath, before power.",
    startingPosition: "Ready stance or front stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "Start with the punching fist palm-up at your hip",
      "Drive it straight out, rotating palm-down at the end",
      "Strike with the first two knuckles, wrist perfectly straight",
      "Pull the other fist back to the hip simultaneously",
      "Exhale sharply (기합) as the punch lands"
    ],
    keyDetails: ["Wrist straight and in line with the forearm", "First two knuckles lead", "Both arms work: one out, one back to the hip"],
    commonErrors: ["Bending the wrist up or down at extension", "Winging the elbow out sideways mid-punch", "Holding the breath instead of exhaling on impact"],
    safetyNotes: ["Solo: punch AIR at slow speed. No walls, no furniture — bare-knuckle contact training is an in-class, instructor-led thing."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow punches per side, watching the wrist stay straight",
      "10 more, coordinating the pull-back hand",
      "5 with a sharp exhale on extension",
      "Shadow-count a set in Korean out loud" ] },
    media: {}, approvalStatus: "provisional" },

  /* ============ W9 · Wrist Releases ============ */
  { id: "t-sonmok", kind: "term", beltId: "white", domain: "terminology", unit: "W9",
    ko: "손목", rom: "sonmok", en: "wrist" },
  { id: "t-hosinsul", kind: "term", beltId: "white", domain: "terminology", unit: "W9",
    ko: "호신술", rom: "hosinsul", en: "self-defense techniques" },
  { id: "x-release-1", kind: "technique", beltId: "white", domain: "releases", unit: "W9",
    nameEnglish: "Same-side wrist release (circle out)", nameHangul: "손목 빼기 1", romanization: "sonmok ppaegi il",
    purpose: "Escape a same-side wrist grab by circling through the thumb — the first taste of Won, the circle.",
    startingPosition: "Partner grabs your right wrist with their left hand (same side).",
    attackOrGrab: "Same-side wrist grab",
    principle: "c-won",
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only. The app can prepare the steps; the feel needs a real grip and an instructor's eye.",
    stepSequence: [
      "Settle: drop your weight slightly and bend the grabbed elbow",
      "Find the thumb — the gap in every grip is where the thumb meets the fingers",
      "Circle your hand toward their thumb, leading with your own thumb-edge",
      "Cut through the gap in one smooth curve as you step to balance",
      "Finish in a ready position, hands up, at a safe angle"
    ],
    keyDetails: ["The thumb side is the door — circle toward it, never against the fingers", "Elbow stays low and bent; power comes from your center turning", "Finish ready, not celebrating — position before pride"],
    commonErrors: ["Yanking straight back against all four fingers", "Raising the elbow high and turning the escape into a struggle", "Standing flat-footed instead of stepping with the circle"],
    safetyNotes: ["Drilling speed with a cooperative partner. Grabs are honest but not crushing while learning.", "Tap or say stop = instant release, both directions."],
    instructorCheckpoints: ["Finds the thumb-gap line consistently", "Uses body turn, not arm yank", "Balanced, protected finish position", "Safe partner behavior both as grabber and escaper"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-release-2", kind: "technique", beltId: "white", domain: "releases", unit: "W9",
    nameEnglish: "Cross-hand wrist release (turn the door)", nameHangul: "손목 빼기 2", romanization: "sonmok ppaegi i",
    purpose: "Escape a cross grab by rotating through the thumb line while stepping offline.",
    startingPosition: "Partner grabs your right wrist with their right hand (cross grab).",
    attackOrGrab: "Cross-hand wrist grab",
    principle: "c-hwa",
    prerequisites: ["x-release-1"],
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only.",
    stepSequence: [
      "Settle your weight and turn your palm up to feel the grip line",
      "Step slightly offline toward their open side",
      "Rotate your hand over the top, toward their thumb",
      "Draw your elbow to your ribs as the hand cuts free",
      "Finish facing them at an angle, hands up and ready"
    ],
    keyDetails: ["Palm rotation finds the thumb line before you pull anything", "Step offline first — angle beats strength", "Elbow to ribs connects the escape to your whole body"],
    commonErrors: ["Wrestling wrist-against-grip with no step", "Rotating away from the thumb, into the strong fingers", "Bending forward at the waist and giving away posture"],
    safetyNotes: ["Same partner rules: drilling speed, honest but easy grips, instant release on any stop signal."],
    instructorCheckpoints: ["Correct rotation direction against both grips", "Offline step before the pull", "Posture kept through the finish", "Controlled, cooperative pace"],
    media: {}, approvalStatus: "provisional" },

  /* ============ W10 · Getting Ready to Test ============ */
  { id: "c-testday", kind: "concept", beltId: "white", domain: "testprep", unit: "W10",
    nameEnglish: "What a belt evaluation looks like", nameHangul: "심사",
    body: ["(Provisional — Grandmaster Lee sets the real standards.) A typical evaluation: line up, bow in, demonstrate your stances, strikes, kicks, falls, and releases when called — often by their Korean names — and answer a question or two about terms or rules.",
      "The app's readiness bars show your PREPARATION: knowledge, practice, and instructor checks. Testing, passing, and the belt itself are decisions made by Grandmaster Lee and your instructors at the school."],
    keyPoints: ["Techniques are called by their Korean names — terminology matters", "Earlier-belt material stays testable (cumulative)", "The app reports preparation; the school awards rank"],
    quiz: {
      recog:   { q: "What do the app's readiness bars actually measure?", a: "Your preparation — knowledge, practice logs, and instructor checks", d: ["Whether you have officially passed the test", "Your legal certification level", "Your ranking against other students"] },
      scenario:{ q: "All five of your readiness bars are full. What does that mean?", a: "You're well prepared — testing and promotion still happen at the school, decided by your instructors", d: ["You are automatically promoted", "You may skip the next class", "The app mails you a belt"] }
    } },

  /* ================================================================
     WHITE · YELLOW STRIPE (9th gup) — PROVISIONAL
     Synthesized from the broadly-shared second-level material across
     published Hapkido syllabi (falls/rolls deepen, kicks widen, more
     releases, first clothing grabs). Original wording; no school's
     curriculum copied. Awaiting Grandmaster Lee's real requirements.
     ================================================================ */

  /* ============ WY1 · Falling Forward ============ */
  { id: "x-jeonbang-nakbeop", kind: "technique", beltId: "white-yellow", domain: "falling", unit: "WY1",
    nameEnglish: "Front fall", nameHangul: "전방낙법", romanization: "jeonbang nakbeop",
    purpose: "Absorb a forward fall on your forearms so face, wrists, and elbows never take the hit.",
    startingPosition: "Learned first from kneeling on mats.",
    safetyClass: "instructorSupervisionRequired", soloSafe: false, partnerRequired: false, instructorRequired: true,
    practiceRestrictions: "Knowledge and recognition here. Physical attempts happen kneeling on mats with your instructor — never at home.",
    stepSequence: [
      "From kneeling, arms up in front, palms facing away",
      "Fall forward keeping your body in one firm line",
      "Strike the mat with both forearms and palms together — one clap, not two",
      "Turn your head to the side, face clear of the mat",
      "Keep your belly and knees holding you off the floor"
    ],
    keyDetails: ["Forearms and palms hit as one unit at about 45°", "Head turned, face never touches", "Body firm — a plank, not a flop"],
    commonErrors: ["Catching the fall on the hands with elbows locked", "Face pointed straight down at the mat", "Sagging at the hips so the belly slaps"],
    safetyNotes: ["Instructor supervision required — wrist protection is the whole point, and it has to be checked in person."],
    instructorCheckpoints: ["Forearm-palm strike lands as one unit", "Head turned, face clear", "Body line firm from knees up", "Comfortable from kneeling before any progression"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-hoejeon-nakbeop", kind: "technique", beltId: "white-yellow", domain: "falling", unit: "WY1",
    nameEnglish: "Forward roll", nameHangul: "회전낙법", romanization: "hoejeon nakbeop",
    purpose: "Convert forward momentum into a smooth diagonal roll — the escape hatch under every throw you will ever take.",
    startingPosition: "Learned first from a low crouch on mats.",
    safetyClass: "instructorSupervisionRequired", soloSafe: false, partnerRequired: false, instructorRequired: true,
    practiceRestrictions: "Sequence and safety points here; rolling happens on mats under your instructor's eye, starting low and slow.",
    stepSequence: [
      "Crouch low, lead foot forward, same-side arm curved like a wheel rim",
      "Tuck your chin and look at your back knee",
      "Reach the curved arm through and roll along its outside edge",
      "Travel diagonally across the back — shoulder to opposite hip",
      "Roll up your feet into a balanced crouch, hands ready"
    ],
    keyDetails: ["Contact rolls along arm edge → shoulder → diagonal back — never the head or spine ridge", "Chin stays tucked the entire way", "The curve of the arm is the wheel; keep it round"],
    commonErrors: ["Placing the top of the head on the mat and tipping over it", "Rolling straight down the spine instead of the diagonal", "Collapsing the arm so the shoulder lands with a thud"],
    safetyNotes: ["Instructor supervision required. Neck position is everything here — this is exactly what in-person coaching exists for."],
    instructorCheckpoints: ["Diagonal path shoulder→opposite hip", "Chin tucked, head clear of the mat", "Round arm maintained under load", "Smooth rise to a ready crouch"],
    media: {}, approvalStatus: "provisional" },

  /* ============ WY2 · Kicking Wider ============ */
  { id: "x-dollyeo-chagi", kind: "technique", beltId: "white-yellow", domain: "strikes", unit: "WY2",
    nameEnglish: "Roundhouse kick", nameHangul: "돌려차기", romanization: "dollyeo chagi",
    purpose: "A turning kick that arrives from the side — your first angled attack.",
    startingPosition: "Fighting or front stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    practiceRestrictions: "Solo at slow form speed, waist height or below. Height and power are class work.",
    stepSequence: [
      "Chamber the kicking knee up and across your body",
      "Pivot the standing foot so its heel points at the target",
      "Let the hip roll over as the leg whips in an arc",
      "Strike with the instep or ball of the foot",
      "Re-chamber and set down facing your target"
    ],
    keyDetails: ["The pivot IS the kick — hips deliver it, the leg just arrives", "Standing heel points at the target at impact", "Guard stays up while the leg travels"],
    commonErrors: ["No pivot — kicking with leg strength alone, hips square", "Dropping both hands as the leg rises", "Leaning far back and falling off the finish"],
    safetyNotes: ["Solo: slow form only, low targets, near support if balance wobbles. No contact with objects."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow chamber-pivot-extend cycles per leg holding a chair",
      "Check the standing heel: pointing at the target at full extension",
      "5 free-standing slow kicks per leg at knee height",
      "Finish each rep balanced, guard up, facing the target" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "x-yeop-chagi", kind: "technique", beltId: "white-yellow", domain: "strikes", unit: "WY2",
    nameEnglish: "Side kick", nameHangul: "옆차기", romanization: "yeop chagi",
    purpose: "A driving linear kick delivered with the blade and heel of the foot from a side-on body position.",
    startingPosition: "Fighting stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    practiceRestrictions: "Solo at slow form speed, low height. Power comes later, in class, on pads.",
    stepSequence: [
      "Chamber the knee high across your body, foot cocked",
      "Pivot the standing foot until your hip stacks toward the target",
      "Drive the foot straight out, blade and heel leading",
      "Push through with the hip, shoulders staying tall",
      "Re-chamber before setting down"
    ],
    keyDetails: ["Heel and outside edge strike — toes pulled back and down", "Hip stacks behind the kick like a piston", "Eyes over the shoulder, on the target, whole time"],
    commonErrors: ["Kicking with the toes or flat sole instead of blade/heel", "No pivot, turning it into a weak sideways push", "Folding at the waist and staring at the floor"],
    safetyNotes: ["Solo: slow form, knee height, support nearby at first."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow chamber-pivot-drive cycles per leg with support",
      "Freeze at extension: is the heel leading? toes back?",
      "5 free-standing slow side kicks per leg, low",
      "Re-chamber cleanly on every single rep" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "x-mureup-chagi", kind: "technique", beltId: "white-yellow", domain: "strikes", unit: "WY2",
    nameEnglish: "Knee strike", nameHangul: "무릎차기", romanization: "mureup chagi",
    purpose: "Close-range power from the knee — simple, strong, and the base of clinch defense later.",
    startingPosition: "Close range, hands in a clinch frame.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "Frame your hands as if holding shoulders in a clinch",
      "Drive the knee straight up and slightly through",
      "Point the toes down so the knee leads sharply",
      "Pull your frame down as the knee rises",
      "Set down in balance, frame still up"
    ],
    keyDetails: ["Toes down — it sharpens the knee", "Hips drive through, not just the leg lifting", "The pull-down and knee-up meet in the middle"],
    commonErrors: ["Lifting the foot with toes up, turning it into a push", "Leaning far back to get the knee higher", "Dropping the hands while kneeing"],
    safetyNotes: ["Solo in the air only. Any partner or pad work is class material."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow knee drives per side with the clinch frame",
      "Toes down on every rep — check at the top",
      "5 reps coordinating pull-down with knee-up",
      "Balance held on the set-down each time" ] },
    media: {}, approvalStatus: "provisional" },

  /* ============ WY3 · Breath & Energy ============ */
  { id: "t-danjeon", kind: "term", beltId: "white-yellow", domain: "breathing", unit: "WY3",
    ko: "단전", rom: "danjeon", en: "the lower-belly energy center",
    note: "Two finger-widths below the navel. Where Hapkido breathing lives." },
  { id: "x-danjeon-hoheup", kind: "technique", beltId: "white-yellow", domain: "breathing", unit: "WY3",
    nameEnglish: "Danjeon breathing", nameHangul: "단전호흡", romanization: "danjeon hoheup",
    purpose: "Slow belly breathing that steadies balance, power, and nerves — before class, before testing, before anything hard.",
    startingPosition: "Seated or standing in ready stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "Sit or stand tall, shoulders soft, tongue on the roof of the mouth",
      "Breathe in slowly through the nose, letting the lower belly expand",
      "Pause gently for a moment at the top",
      "Breathe out longer than you breathed in, belly drawing softly back",
      "Repeat, counting breaths, mind on the danjeon"
    ],
    keyDetails: ["The belly moves, the shoulders don't", "Exhale longer than inhale", "Attention rests low, at the danjeon"],
    commonErrors: ["Chest-and-shoulders breathing with a still belly", "Forcing huge breaths until dizzy — this is calm, not effort", "Racing the count"],
    safetyNotes: ["If you ever feel light-headed, breathe normally and rest. Gentle always."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow breaths seated — hand on belly to feel it move",
      "10 standing in ready stance, shoulders quiet",
      "Make the exhale longer than the inhale for the last 5",
      "Notice: steadier or not? (honest answer, either is fine)" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "c-ki", kind: "concept", beltId: "white-yellow", domain: "history", unit: "WY3",
    nameEnglish: "What 'ki' means here", nameHangul: "기 (氣)",
    body: ["Ki (기) is the traditional word for vital energy. In our training you can hold it lightly: it names the felt sense of breath, structure, timing, and intent working together.",
      "When your stance is grounded, your breath low, and your movement whole-bodied, that coordinated feeling is what the old masters called ki. You don't have to take it on faith — you have to take it to practice."],
    keyPoints: ["기 ki — vital energy / coordinated whole-body feeling", "Trained through breath, structure, and intent together", "A practice word, not a belief requirement"],
    quiz: {
      recog:   { q: "In our training, 'ki' most practically refers to…", a: "Breath, structure, timing, and intent working together as one", d: ["A supernatural force that replaces technique", "The Korean word for kicking", "A ranking above black belt"] },
      example: { q: "Which moment is your ki working, in the practical sense?", a: "A grounded stance, low breath, and one whole-body movement landing together", d: ["Holding your breath and tensing every muscle", "Thinking about dinner mid-technique", "Shouting without moving"] }
    } },

  /* ============ WY4 · Stronger Grips, Smarter Escapes ============ */
  { id: "x-release-3", kind: "technique", beltId: "white-yellow", domain: "releases", unit: "WY4",
    nameEnglish: "Two-hands-on-one wrist release", nameHangul: "손목 빼기 3", romanization: "sonmok ppaegi sam",
    purpose: "Escape when both of their hands trap one of yours — your free hand joins the fight.",
    startingPosition: "Partner grips your right wrist with both hands.",
    attackOrGrab: "Two-handed grab on one wrist",
    principle: "c-won",
    prerequisites: ["x-release-1"],
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only.",
    stepSequence: [
      "Settle your weight and bend the trapped elbow toward your center",
      "Reach your free hand over and grip your own trapped fist",
      "Step in slightly to stack your body behind both arms",
      "Draw both hands together up and through the thumbs' gap",
      "Finish at an angle, hands up and ready"
    ],
    keyDetails: ["Two of your arms + your legs against their grip — use all of it", "The pull travels through the thumb line, never against the palms", "Step IN to power the escape; leaning away feeds their grip"],
    commonErrors: ["Tug-of-war straight backward with one arm", "Forgetting the free hand entirely", "Pulling before stepping — arm strength against body strength loses"],
    safetyNotes: ["Drilling speed, honest but easy grips. Tap or 'stop' releases instantly, both directions."],
    instructorCheckpoints: ["Free hand joins early", "Escape travels through the thumb gap", "Body steps in behind the pull", "Balanced protected finish"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-release-4", kind: "technique", beltId: "white-yellow", domain: "releases", unit: "WY4",
    nameEnglish: "Both-wrists-grabbed release", nameHangul: "양손목 빼기", romanization: "yang sonmok ppaegi",
    purpose: "Escape when both wrists are caught at once — circles beat clamps, twice.",
    startingPosition: "Partner grips both of your wrists from the front.",
    attackOrGrab: "Both wrists grabbed from the front",
    principle: "c-yu",
    prerequisites: ["x-release-1"],
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only.",
    stepSequence: [
      "Settle and soften — locked arms feed their grip",
      "Rotate both palms to find the thumb lines",
      "Step to one side to load one arm's circle first",
      "Circle that hand free through the thumb gap",
      "Use the freed hand's frame to release the second the same way"
    ],
    keyDetails: ["One at a time — the step makes one grip weak before you fight it", "Both escapes travel thumb-side", "Stay soft until the moment of the circle"],
    commonErrors: ["Fighting both grips at once with straight arms", "Circling into the fingers instead of the thumb", "Standing square and flat-footed"],
    safetyNotes: ["Drilling speed with a cooperative partner; instant release on any stop signal."],
    instructorCheckpoints: ["Sides taken one at a time with a step", "Correct thumb-line circles both sides", "Soft-to-sharp timing", "Finishes covered and balanced"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-release-5", kind: "technique", beltId: "white-yellow", domain: "releases", unit: "WY4",
    nameEnglish: "Rear wrist-grab release", nameHangul: "뒤 손목 빼기", romanization: "dwi sonmok ppaegi",
    purpose: "Escape a wrist caught from behind — turn to see, then circle free.",
    startingPosition: "Partner grips your right wrist from behind.",
    attackOrGrab: "Wrist grabbed from behind",
    principle: "c-hwa",
    prerequisites: ["x-release-1", "x-release-2"],
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only.",
    stepSequence: [
      "Feel which way their thumb wraps before you move",
      "Step back-and-turn toward the grabbed side to face them",
      "Keep the trapped arm bent and close as you turn",
      "Circle the hand through the thumb line as the turn completes",
      "Finish facing them at an angle, both hands up"
    ],
    keyDetails: ["The turn does the work — you arrive facing them with the grip already bent weak", "Trapped elbow stays glued near your ribs through the turn", "Read the thumb before choosing the circle's direction"],
    commonErrors: ["Yanking forward away from the grip without turning", "Turning the wrong way and wrapping yourself", "Arm straight and far from the body mid-turn"],
    safetyNotes: ["Turning drills need floor space — check your area before each rep. Drilling speed only."],
    instructorCheckpoints: ["Turn direction matches the grip", "Elbow stays close through the turn", "Grip broken as the turn completes, not after", "Aware finish at an angle"],
    media: {}, approvalStatus: "provisional" },

  /* ============ WY5 · First Clothing Grabs ============ */
  { id: "x-lapel-1", kind: "technique", beltId: "white-yellow", domain: "grabs", unit: "WY5",
    nameEnglish: "Straight lapel-grab release", nameHangul: "옷깃 잡기 방어 1", romanization: "otgit japgi bangeo il",
    purpose: "Clear a single-hand grip on your lapel before it becomes a pull or a punch setup.",
    startingPosition: "Partner grips your lapel with one hand, same side.",
    attackOrGrab: "Single-hand lapel grab",
    principle: "c-won",
    prerequisites: ["x-release-1"],
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only.",
    stepSequence: [
      "Settle; pin their gripping hand flat to your chest with both of yours",
      "Trap it so the grab becomes THEIR trapped hand",
      "Step back a half-step and bow your chest forward over their wrist",
      "Let the bend of your body fold their wrist and loosen the grip",
      "Peel the hand off, step to an angle, hands up"
    ],
    keyDetails: ["Pin FIRST — a pinned grab can't punch, pull, or leave", "Your whole torso bends their wrist; your arms only hold", "SLOW — this folds a joint; your partner's tap ends it instantly"],
    commonErrors: ["Grabbing at their arm without pinning the hand to your chest", "Bending the neck instead of hinging the whole chest", "Cranking fast for effect — never in drilling"],
    safetyNotes: ["This one loads a partner's wrist: slow motion only while learning, tap early, release instantly. Exactly the technique class supervision exists for."],
    instructorCheckpoints: ["Solid two-hand pin before anything else", "Body hinge, not arm crank", "Immediate release on tap — tested both directions", "Angle and cover at the finish"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-sleeve-1", kind: "technique", beltId: "white-yellow", domain: "grabs", unit: "WY5",
    nameEnglish: "Sleeve-grab release", nameHangul: "소매 잡기 방어", romanization: "somae japgi bangeo",
    purpose: "Free a gripped sleeve or forearm with a circle instead of a tug-of-war.",
    startingPosition: "Partner grips your sleeve at the forearm.",
    attackOrGrab: "Sleeve / forearm grab",
    principle: "c-yu",
    prerequisites: ["x-release-1"],
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only.",
    stepSequence: [
      "Settle and let the gripped arm stay heavy and soft",
      "Circle your hand over their wrist, big and smooth",
      "Let the sleeve wind out of the grip through the thumb line",
      "Step offline with the circle, not after it",
      "Finish with the freed hand covering their arm"
    ],
    keyDetails: ["Heavy arm first — a tense arm is easy to hold", "The circle is wide; small tight circles just tighten cloth", "Step and circle are one motion"],
    commonErrors: ["Snatching straight back and stretching cloth against fingers", "Tiny wrist-only circles with a frozen body", "Watching your sleeve instead of your partner"],
    safetyNotes: ["Drilling speed with honest but easy grips; instant release on any stop signal."],
    instructorCheckpoints: ["Soft-heavy arm before moving", "Wide circle through the thumb line", "Step married to the circle", "Cover position at the end"],
    media: {}, approvalStatus: "provisional" },

  /* ============ WY6 · Numbers & Directions ============ */
  { id: "s-il",   kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "일", rom: "il",   en: "one (Sino-Korean)",
    note: "Korean runs two number systems. Native (하나, 둘…) counts reps; Sino-Korean (일, 이…) names ranks, dates, and gup numbers." },
  { id: "s-i",    kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "이", rom: "i",    en: "two (Sino-Korean)" },
  { id: "s-sam",  kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "삼", rom: "sam",  en: "three (Sino-Korean)" },
  { id: "s-sa",   kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "사", rom: "sa",   en: "four (Sino-Korean)" },
  { id: "s-o",    kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "오", rom: "o",    en: "five (Sino-Korean)" },
  { id: "s-yuk",  kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "육", rom: "yuk",  en: "six (Sino-Korean)" },
  { id: "s-chil", kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "칠", rom: "chil", en: "seven (Sino-Korean)" },
  { id: "s-pal",  kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "팔", rom: "pal",  en: "eight (Sino-Korean)" },
  { id: "s-gu",   kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "구", rom: "gu",   en: "nine (Sino-Korean)" },
  { id: "s-sip",  kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "십", rom: "sip",  en: "ten (Sino-Korean)",
    note: "구급 = 9th gup — your rank numbers are Sino-Korean." },
  { id: "t-oenjjok",    kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "왼쪽",   rom: "oenjjok",    en: "left side" },
  { id: "t-oreunjjok",  kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "오른쪽", rom: "oreunjjok",  en: "right side" },
  { id: "t-ap",  kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "앞", rom: "ap",  en: "front",
    note: "You already know it from 앞차기 — front kick." },
  { id: "t-dwi", kind: "term", beltId: "white-yellow", domain: "terminology", unit: "WY6", ko: "뒤", rom: "dwi", en: "back / behind" },

  /* ============ WY7 · The Art Around You ============ */
  { id: "c-belt-meaning", kind: "concept", beltId: "white-yellow", domain: "history", unit: "WY7",
    nameEnglish: "What the belt ladder means", nameHangul: "급과 단",
    body: ["Colored-belt ranks are gup (급) — they count DOWN toward black belt, which begins the dan (단) degrees. A 9th gup is closer to black belt than a 10th.",
      "Belt systems differ between Hapkido schools on purpose — there is no universal ladder. Ours is set by Grandmaster Lee, and this app's version stays marked provisional until he approves it."],
    keyPoints: ["급 gup counts down; 단 dan counts up from black", "No universal Hapkido belt ladder exists", "Our real ladder is Grandmaster Lee's to define"],
    quiz: {
      recog:   { q: "Which direction do gup (급) ranks move?", a: "They count DOWN toward 1st gup, then black belt begins the dan degrees", d: ["They count up forever", "They reset every year", "They are the same as dan degrees"] },
      example: { q: "A student says 'my friend's school has different belt colors — one of you must be wrong.' What's true?", a: "Neither — Hapkido schools legitimately differ; each school's head sets its ladder", d: ["The friend's school is fake", "Belt colors are set by international law", "Whoever has more students is right"] }
    } },
  { id: "c-kihap-why", kind: "concept", beltId: "white-yellow", domain: "history", unit: "WY7",
    nameEnglish: "Why we shout — the kihap", nameHangul: "기합",
    body: ["The kihap is a sharp exhale with voice. It times your breath to your technique, keeps you from holding your breath under pressure, and commits the whole body to one moment.",
      "It is not volume for its own sake — a good kihap comes from the belly (the danjeon), not the throat."],
    keyPoints: ["Exhale + commitment, timed to the technique", "From the belly, not the throat", "Stops breath-holding under pressure"],
    quiz: {
      recog:  { q: "What is the kihap actually for?", a: "Timing breath to technique and committing the whole body", d: ["Scaring the referee", "Warming up the voice for singing", "Signaling that class is over"] },
      unsafe: { q: "Which habit is the kihap designed to prevent?", a: "Holding your breath and tensing up under pressure", d: ["Breathing from the belly", "Exhaling on impact", "Counting reps out loud"] }
    } },

  /* ============ WY8 · Testing Up ============ */
  { id: "c-yellow-test", kind: "concept", beltId: "white-yellow", domain: "testprep", unit: "WY8",
    nameEnglish: "Your second evaluation", nameHangul: "심사 2",
    body: ["(Provisional — Grandmaster Lee sets the real standards.) Second evaluations typically add the new falls, the wider kicks, and the new releases — AND re-test white-belt material. Cumulative is the rule: nothing you learn ever stops counting.",
      "By now examiners also start watching HOW you train: etiquette, control with partners, and whether your Korean commands are automatic."],
    keyPoints: ["New material plus everything from white belt", "Etiquette and partner control are being watched too", "Commands should be automatic by now"],
    quiz: {
      recog:   { q: "What does 'cumulative testing' mean for your second evaluation?", a: "White-belt material can be called again alongside the new requirements", d: ["Only new material is tested", "You retake the exact white-belt test", "Testing is optional from now on"] },
      scenario:{ q: "You've mastered the new kicks but your white-belt counting got rusty. The app will…", a: "Keep scheduling those white-belt cards — earlier material stays live forever", d: ["Delete the old cards as finished", "Lower the passing standard", "Hide the problem from your instructor"] }
    } },

  /* ================================================================
     YELLOW BELT (8th gup) — PROVISIONAL
     The first joint locks. Locks are knowledge/recognition here and
     mats-with-instructor everywhere else — every item below is
     instructorSupervisionRequired with no practice assignment, by
     design. Synthesized from broadly-shared material; original
     wording; awaiting Grandmaster Lee.
     ================================================================ */

  /* ============ Y1 · How Joints Lock ============ */
  { id: "t-gwanjeolgi", kind: "term", beltId: "yellow", domain: "terminology", unit: "Y1",
    ko: "관절기", rom: "gwanjeolgi", en: "joint techniques / joint locks" },
  { id: "t-kkeokgi", kind: "term", beltId: "yellow", domain: "terminology", unit: "Y1",
    ko: "꺾기", rom: "kkeokgi", en: "joint lock (literally 'bending/breaking')",
    note: "The name is honest about the stakes — which is exactly why locks are drilled slowly, with control, under supervision." },
  { id: "c-lock-principle", kind: "concept", beltId: "yellow", domain: "locks", unit: "Y1",
    nameEnglish: "How a lock works", nameHangul: "지렛대의 원리",
    body: ["Every joint lock is a lever: the joint is the fulcrum, your two contact points are the effort and the load. Small force at the right angle beats big force at the wrong one — which is why locks are Won and Yu made visible.",
      "A lock moves a joint toward the edge of its natural range and stops there. Control lives in that 'stops there.' In drilling, the goal is your partner saying 'yes, you have it' and tapping — never pain as proof."],
    keyPoints: ["A lock is a lever: joint = fulcrum, two contacts = effort and load", "Angle beats strength — locks are the circle principle applied", "Control means stopping at the edge of range, on the tap, every time"],
    quiz: {
      recog:   { q: "Mechanically, a joint lock is…", a: "A lever — the joint is the fulcrum between two contact points", d: ["A squeeze that relies on grip strength", "A strike delivered to a joint", "A way of tickling the wrist"] },
      example: { q: "Your lock isn't working on a stronger partner. The Hapkido answer is…", a: "Fix the angle and the lever — leverage, not more muscle", d: ["Crank harder and faster", "Give up — locks only work on weak people", "Switch to punching"] },
      unsafe:  { q: "Which belief is DANGEROUS in lock training?", a: "'If it doesn't hurt yet, I should keep cranking'", d: ["'The tap ends everything instantly'", "'Slow is how locks are learned'", "'Position before pressure'"], why: "Joints give little warning between discomfort and injury. The tap — and stopping at the edge — is the whole discipline." }
    } },
  { id: "c-lock-ethics", kind: "concept", beltId: "yellow", domain: "safety", unit: "Y1",
    nameEnglish: "The ethics of holding a joint", nameHangul: "책임 2",
    body: ["A lock is unusual among techniques: applied with control, it can end a situation without injuring anyone — that is its ethical promise. Applied carelessly, it damages a wrist someone needs for work tomorrow.",
      "In class that promise is practiced as a protocol: slow application, eyes on your partner, pressure that asks a question rather than making a statement, instant release on the tap. Outside class, the same promise means locks are for escaping and controlling — the minimum needed to get safe."],
    keyPoints: ["A controlled lock can end a conflict without injury — that is the point", "Pressure asks a question; the tap is the answer; release is instant", "Escape and control, minimum needed — then get safe"],
    quiz: {
      recog:   { q: "What is the ethical promise of a well-trained joint lock?", a: "Control without injury — ending a situation while protecting even the attacker from damage", d: ["Maximum pain as a deterrent", "Looking impressive at demonstrations", "Never having to learn strikes"] },
      scenario:{ q: "Drilling locks, your partner's wrist reaches its edge but they haven't tapped. You…", a: "Hold at the edge — you already have the lock; pressure past it proves nothing", d: ["Add a little more to make sure they feel it", "Speed up the next rep", "Let go of control and yank"] },
      unsafe:  { q: "Which use of a lock is OUT OF BOUNDS?", a: "Demonstrating one on a classmate in the hallway to show a friend", d: ["Drilling slowly with a consenting partner in class", "Describing the lever principle at dinner", "Reviewing the steps in this app before class"] }
    } },

  /* ============ Y2 · The First Three Locks ============ */
  { id: "x-lock-1", kind: "technique", beltId: "yellow", domain: "locks", unit: "Y2",
    nameEnglish: "Outward wrist lock (turn-out)", nameHangul: "손목 바깥 꺾기", romanization: "sonmok bakkat kkeokgi",
    purpose: "Turn the wrist outward past its comfortable range to break balance and control the whole arm — Hapkido's classic first lock.",
    startingPosition: "From a same-side wrist grab you have just escaped, or a handshake-height grip.",
    attackOrGrab: "Same-side wrist grab (after your release)",
    principle: "c-won",
    prerequisites: ["x-release-1", "c-lock-principle"],
    safetyClass: "instructorSupervisionRequired", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Knowledge and recognition only in the app. Physical practice happens on mats, slowly, with your instructor watching BOTH partners — the falls this lock causes are exactly why breakfalls came first.",
    stepSequence: [
      "Capture their hand with both thumbs on its back, fingers wrapping the palm edge",
      "Step offline to their outside as you settle your weight",
      "Turn their palm outward and back toward their own forearm — a small circle, not a yank",
      "Let the turning wrist bend their elbow and carry their balance up onto their heels",
      "Guide them down with the turn, following with control until they tap or settle"
    ],
    keyDetails: ["Both thumbs stacked on the back of the hand — the hand turns like a doorknob", "Your step and body turn power the lock; the hands only steer", "Their balance breaks BEFORE any real pressure — if you're forcing, the angle is wrong"],
    commonErrors: ["Cranking the wrist with arm strength while standing flat", "Turning the hand without stepping offline — you stay in punching range", "Chasing pain instead of balance — the takedown comes from posture theft, not agony"],
    safetyNotes: ["This lock throws people — the partner receiving it needs breakfall skill and mats.", "Drilling speed is SLOW. The tap ends everything instantly, and the applier guides the descent — never dumps it."],
    instructorCheckpoints: ["Two-thumb capture correct and comfortable", "Offline step before the turn", "Balance broken by angle, not force", "Receiver guided down, never dropped", "Instant release on tap — tested repeatedly"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-lock-2", kind: "technique", beltId: "yellow", domain: "locks", unit: "Y2",
    nameEnglish: "Inward wrist lock (Z-bend)", nameHangul: "손목 안 꺾기", romanization: "sonmok an kkeokgi",
    purpose: "Fold the wrist inward into a Z-shape that drops a resisting partner straight down — the lock that turns a grab into your control.",
    startingPosition: "Their hand gripping your lapel or wrist.",
    attackOrGrab: "Lapel or wrist grip (their hand becomes the lock)",
    principle: "c-hwa",
    prerequisites: ["x-lock-1"],
    safetyClass: "instructorSupervisionRequired", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Knowledge and recognition only in the app; mats and instructor for everything physical. This one loads the wrist quickly — slowest of all to drill.",
    stepSequence: [
      "Pin their gripping hand to your body so it cannot leave or straighten",
      "Wrap your hand over theirs, your forearm rising vertical",
      "Fold their wrist inward so hand, wrist, and forearm form a Z",
      "Drop your weight straight down through the fold — elbows in, no leaning",
      "Control their descent to a knee; hold at the edge until the tap"
    ],
    keyDetails: ["The pin comes first — a free hand escapes, a pinned hand locks", "The Z-shape is the lock; your dropping weight is the power", "Straight down, close to your center — reaching forward loses everything"],
    commonErrors: ["Skipping the pin and chasing a moving hand", "Bending them with arm push instead of body drop", "Applying fast — this lock's edge arrives suddenly, which is why it is drilled slowest"],
    safetyNotes: ["The receiving partner drops to a knee — knees need mats too.", "Applier's responsibility is total here: slow onset, eyes on partner, release-on-tap without a heartbeat of delay."],
    instructorCheckpoints: ["Pin established before the fold", "True Z-shape, elbows connected to the body", "Power from dropping weight, not arm push", "Onset slow enough for a mid-way tap", "Instant vertical release on tap"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-lock-3", kind: "technique", beltId: "yellow", domain: "locks", unit: "Y2",
    nameEnglish: "Standing arm bar (elbow press)", nameHangul: "팔 누르기", romanization: "pal nureugi",
    purpose: "Straighten the arm and press just above the elbow to steer a partner down and forward — control of the whole person through one joint.",
    startingPosition: "After a release or parry that leaves their arm extended.",
    attackOrGrab: "Extended arm (from a grab you escaped or a reaching push)",
    principle: "c-yu",
    prerequisites: ["x-release-2", "c-lock-principle"],
    safetyClass: "instructorSupervisionRequired", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Knowledge and recognition only in the app; physical work on mats under instruction.",
    stepSequence: [
      "Control their wrist with one hand, palm rotated so their elbow points up",
      "Place your other forearm or palm just ABOVE the elbow joint — never on its point",
      "Step through beside them as you extend their arm along a curve",
      "Press down and forward along the arm's line, walking them toward the mat",
      "Lower with control; hold position until the tap, then release fully"
    ],
    keyDetails: ["The wrist rotation aims the elbow — no rotation, no bar", "Pressure lands above the joint on the muscle, steering it, not striking it", "Your feet do the takedown — the press guides while your body walks the curve"],
    commonErrors: ["Pressing directly on the elbow's point instead of above it", "Forgetting the wrist rotation, so the arm just bends away", "Standing still and pushing down with shoulders — strength versus strength again"],
    safetyNotes: ["A straightened arm has almost no slack — the difference between control and injury is inches. That is why this is a supervised technique, full stop.", "Receiver goes forward and down: front-fall skills and mats are prerequisites, not suggestions."],
    instructorCheckpoints: ["Elbow aimed correctly via wrist rotation", "Contact above the joint, never on it", "Movement powers the bar; arms only steer", "Descent controlled the entire way", "Release instant and complete on tap"],
    media: {}, approvalStatus: "provisional" },

  /* ============ Y3 · Body Words ============ */
  { id: "b-son",       kind: "term", beltId: "yellow", domain: "terminology", unit: "Y3", ko: "손",     rom: "son",       en: "hand",
    note: "You know it from 손목 (wrist) — literally 'hand-neck'." },
  { id: "b-pal",       kind: "term", beltId: "yellow", domain: "terminology", unit: "Y3", ko: "팔",     rom: "pal",       en: "arm",
    note: "Same sound as the number 8 (팔) — context tells you which." },
  { id: "b-palkkumchi",kind: "term", beltId: "yellow", domain: "terminology", unit: "Y3", ko: "팔꿈치", rom: "palkkumchi", en: "elbow" },
  { id: "b-eokkae",    kind: "term", beltId: "yellow", domain: "terminology", unit: "Y3", ko: "어깨",   rom: "eokkae",    en: "shoulder" },
  { id: "b-mureup",    kind: "term", beltId: "yellow", domain: "terminology", unit: "Y3", ko: "무릎",   rom: "mureup",    en: "knee",
    note: "You know it from 무릎차기 — knee strike." },
  { id: "b-bal",       kind: "term", beltId: "yellow", domain: "terminology", unit: "Y3", ko: "발",     rom: "bal",       en: "foot",
    note: "발차기 — kicking — is literally 'foot strike'." },
  { id: "b-meori",     kind: "term", beltId: "yellow", domain: "terminology", unit: "Y3", ko: "머리",   rom: "meori",     en: "head" },
  { id: "b-mok",       kind: "term", beltId: "yellow", domain: "terminology", unit: "Y3", ko: "목",     rom: "mok",       en: "neck",
    note: "손목 wrist = hand-neck, 발목 ankle = foot-neck. Korean anatomy is modular." },

  /* ============ Y4 · Kicks That Turn Away ============ */
  { id: "x-dwi-chagi", kind: "technique", beltId: "yellow", domain: "strikes", unit: "Y4",
    nameEnglish: "Back kick", nameHangul: "뒤차기", romanization: "dwi chagi",
    purpose: "A straight thrust behind you with the heel — the strongest kick in the beginner set, powered by looking over your shoulder and driving.",
    startingPosition: "Fighting stance; target behind or turning to be behind.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    practiceRestrictions: "Solo at slow form speed, low height, support nearby — the turn challenges balance before anything else.",
    stepSequence: [
      "Look over your shoulder FIRST — eyes find the target",
      "Pivot on the front foot as the kicking knee chambers to your chest",
      "Drive the heel straight back along your center line",
      "Hips push through; toes point down at impact",
      "Re-chamber and turn out to face, guard up"
    ],
    keyDetails: ["Eyes lead, heel follows — never kick blind", "The path is a straight piston, not a swing", "Toes down, heel first; the back stays fairly upright"],
    commonErrors: ["Kicking before looking — a blind kick is a hope, not a technique", "Swinging the leg in a circle like a mule instead of a straight drive", "Over-rotating into a spin and losing the line"],
    safetyNotes: ["Solo: slow, low, with a wall or chair the first sessions. The turn is the skill; power waits for pads in class."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow look-pivot-chamber cycles per side, no kick yet",
      "10 slow full back kicks per side at knee height with support",
      "Freeze at extension: heel leading? toes down? eyes on target?",
      "5 free-standing reps per side, re-chambering to balance" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "x-naeryeo-chagi", kind: "technique", beltId: "yellow", domain: "strikes", unit: "Y4",
    nameEnglish: "Axe kick", nameHangul: "내려차기", romanization: "naeryeo chagi",
    purpose: "Swing the leg high and drop the heel straight down — gravity as a striking tool.",
    startingPosition: "Fighting stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    practiceRestrictions: "Solo at slow speed and MODERATE height only — hamstring flexibility builds over weeks, not in one brave session.",
    stepSequence: [
      "Swing the straight-ish leg up along your center or slightly outside",
      "Rise only as high as today's flexibility honestly allows",
      "Pull the heel straight DOWN with control",
      "Strike downward with the heel; hips stay square",
      "Set down softly in stance, guard up"
    ],
    keyDetails: ["The downswing is the kick — the upswing is just the backswing", "Height is borrowed from flexibility, never from leaning way back", "Control the drop; a falling leg you can't stop isn't a technique"],
    commonErrors: ["Leaning far backward to fake height and falling off balance", "Slamming the heel down with no control over where it lands", "Forcing height cold — this kick loves a warmed-up hamstring"],
    safetyNotes: ["Warm up before axe-kick practice, every time. Height grows weekly; forcing it teaches your hamstring to fear you."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "Gentle leg swings front and across, 10 per leg, as warm-up",
      "10 slow axe kicks per leg at honest height, controlled down",
      "Check the lean: shoulders roughly over hips at the top",
      "Finish each rep soft and balanced, guard up" ] },
    media: {}, approvalStatus: "provisional" },

  /* ============ Y5 · Knife Hand & Inside Block ============ */
  { id: "x-sudo", kind: "technique", beltId: "yellow", domain: "strikes", unit: "Y5",
    nameEnglish: "Knife-hand strike", nameHangul: "수도 치기", romanization: "sudo chigi",
    purpose: "Strike with the hardened edge of the open hand — precise, fast, and the classic Hapkido complement to circular defense.",
    startingPosition: "Front stance or fighting stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "Form the knife hand: fingers together and slightly curved, thumb tucked tight",
      "Chamber the striking hand by the opposite ear, palm toward you",
      "Whip the hand in an arc as the hips turn behind it",
      "Strike with the fleshy outside edge — never the fingers",
      "Snap back to guard as the other hand returns to the hip"
    ],
    keyDetails: ["Thumb tucked and fingers firm — a loose knife hand hurts its owner", "The arc rides the hip turn; the arm is the whip's end, not the engine", "Contact surface is the muscle edge below the little finger"],
    commonErrors: ["Splayed fingers or a floating thumb", "Arm-only chopping with frozen hips", "Striking with the bony wrist or the finger tips"],
    safetyNotes: ["Solo: air only, slow to medium. Board- and pad-work is class material with conditioning built up gradually."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "Form the knife hand and check it: fingers sealed, thumb tucked",
      "10 slow inward strikes per hand riding the hip turn",
      "10 slow outward (backhand-path) strikes per hand",
      "Finish each rep snapped back to guard" ] },
    media: {}, approvalStatus: "provisional" },
  { id: "x-an-makgi", kind: "technique", beltId: "yellow", domain: "strikes", unit: "Y5",
    nameEnglish: "Inside block", nameHangul: "안막기", romanization: "an makgi",
    purpose: "Sweep an incoming straight attack across your center line — the block that sets up every counter you know.",
    startingPosition: "Front stance.",
    safetyClass: "soloSafe", soloSafe: true, partnerRequired: false, instructorRequired: false,
    stepSequence: [
      "Chamber the blocking arm outside your shoulder, fist high",
      "Sweep the forearm across your body toward your center",
      "Finish with the fist at shoulder height, elbow bent about 90°",
      "Turn the hip slightly into the block for structure",
      "The other hand pulls to the hip, loaded to counter"
    ],
    keyDetails: ["The block crosses the CENTER — that is what makes attacks miss", "Elbow stays bent; a straight arm is a lever for your opponent", "The hip turn makes it a body block, not an arm wave"],
    commonErrors: ["Blocking out wide past the shoulder — you defend air", "Straightening the arm and reaching for the attack", "No hip — the arm alone gets blasted through"],
    safetyNotes: ["Solo air practice safe. Partner blocking drills are class material."],
    practiceAssignment: { type: "checklist", selfRateFirst: true, items: [
      "10 slow inside blocks per arm from front stance",
      "Freeze the finish: fist shoulder height, elbow ~90°, on center",
      "10 more coordinating the hip turn and the pull-back hand",
      "Alternate low block / inside block slowly, 10 total each side" ] },
    media: {}, approvalStatus: "provisional" },

  /* ============ Y6 · Bigger Grabs ============ */
  { id: "x-lapel-2", kind: "technique", beltId: "yellow", domain: "grabs", unit: "Y6",
    nameEnglish: "Two-hand lapel-grab defense", nameHangul: "옷깃 잡기 방어 2", romanization: "otgit japgi bangeo i",
    purpose: "Answer a committed two-handed lapel grab by wedging, turning, and taking the balance they lent you.",
    startingPosition: "Partner grips both lapels, pulling or pushing.",
    attackOrGrab: "Two-handed lapel grab",
    principle: "c-hwa",
    prerequisites: ["x-lapel-1"],
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only.",
    stepSequence: [
      "Settle immediately — drop weight so the grab moves you less",
      "Wedge both your arms up through the inside of theirs",
      "Turn your whole body to one side, arms framing as you go",
      "Let the turn peel their grips and cross their arms",
      "Finish offline at their shoulder, hands covering, balance yours"
    ],
    keyDetails: ["Two hands on you means their face and balance are unguarded — the turn exploits it", "The wedge travels from inside; from outside you're arm-wrestling four limbs", "It is one motion: settle-wedge-turn, not three separate moves"],
    commonErrors: ["Grabbing their wrists and pulling straight — strength against strength, two versus four", "Wedging without the body turn, so the frame just sits there", "Leaning back away from the grab and giving up your posture"],
    safetyNotes: ["Committed grabs move people — footing and mats matter. Drilling speed; release instantly on any stop signal."],
    instructorCheckpoints: ["Immediate settle before anything", "Inside wedge with both arms", "One-motion turn that peels the grips", "Finishes offline, covered, balanced"],
    media: {}, approvalStatus: "provisional" },
  { id: "x-shoulder-rear", kind: "technique", beltId: "yellow", domain: "grabs", unit: "Y6",
    nameEnglish: "Rear shoulder-grab defense", nameHangul: "뒤 어깨 잡기 방어", romanization: "dwi eokkae japgi bangeo",
    purpose: "Turn a grab from behind into a face-to-face angle before it becomes a pull or worse.",
    startingPosition: "Partner grips your shoulder from behind.",
    attackOrGrab: "Single-hand shoulder grab from behind",
    principle: "c-won",
    prerequisites: ["x-release-5"],
    safetyClass: "partnerWithCare", soloSafe: false, partnerRequired: true, instructorRequired: true,
    practiceRestrictions: "Partner practice after in-class introduction, drilling speed only.",
    stepSequence: [
      "Feel the grab's side without turning your head first",
      "Step back-and-around TOWARD the grabbing arm, circling under it",
      "Pin their hand to your shoulder with your near hand as you turn",
      "Arrive facing them, their arm now extended and yours covering it",
      "Finish at an angle with control of their wrist, ready position"
    ],
    keyDetails: ["Turning toward the arm wraps it; away from it stretches you out for them", "The pin turns their grab into a trapped arm — same lesson as the lapel pin", "Your circle brings you INSIDE their reach, not away from it"],
    commonErrors: ["Spinning away from the grabbing arm, straight into a stronger pull", "Forgetting the pin, so the turn just unwinds their grip harmlessly for THEM", "Turning tall and off-balance instead of settled and low"],
    safetyNotes: ["Rear attacks startle — agree on drilling speed before every set. Instant release on any stop signal."],
    instructorCheckpoints: ["Correct turn direction chosen by feel", "Pin married to the turn", "Arrives inside, facing, balanced", "Wrist control at the finish without cranking"],
    media: {}, approvalStatus: "provisional" },

  /* ============ Y7 · Rolling Both Sides ============ */
  { id: "x-hoejeon-2", kind: "technique", beltId: "yellow", domain: "falling", unit: "Y7",
    nameEnglish: "Forward roll — other side", nameHangul: "회전낙법 2", romanization: "hoejeon nakbeop i",
    purpose: "The same forward roll on your non-dominant side. Throws never ask which side you prefer.",
    startingPosition: "Low crouch on mats, weak side leading.",
    prerequisites: ["x-hoejeon-nakbeop"],
    safetyClass: "instructorSupervisionRequired", soloSafe: false, partnerRequired: false, instructorRequired: true,
    practiceRestrictions: "Mats and instructor only, starting low — expect it to feel like learning the roll all over again. That is normal and temporary.",
    stepSequence: [
      "Set up exactly as the strong side, mirrored — weak foot forward, weak arm curved",
      "Tuck the chin and look at the back knee",
      "Roll along the weak arm's edge to the opposite hip — the same diagonal",
      "Let the strangeness be information, not alarm; slower is fine",
      "Rise to a crouch and reset; symmetry is built one rep at a time"
    ],
    keyDetails: ["Everything mirrors — if confused, walk the strong side through slowly and copy it", "The diagonal (shoulder to opposite hip) is identical", "Expect 'day one' feelings on this side; that is how sides get equal"],
    commonErrors: ["Reverting mid-roll to the strong-side pattern and landing crooked", "Rushing to match strong-side speed before the shape exists", "Skipping weak-side reps entirely — the habit that surfaces exactly when a throw goes the other way"],
    safetyNotes: ["Instructor supervision required, same as every fall. Low and slow until the shape is honest."],
    instructorCheckpoints: ["Mirrored setup correct", "Same diagonal path on the weak side", "Chin tucked throughout", "Patient pace accepted without reverting"],
    media: {}, approvalStatus: "provisional" },

  /* ============ Y8 · Yellow Evaluation ============ */
  { id: "c-yellow8-test", kind: "concept", beltId: "yellow", domain: "testprep", unit: "Y8",
    nameEnglish: "Testing with locks on the floor", nameHangul: "심사 3",
    body: ["(Provisional — Grandmaster Lee sets the real standards.) Once locks enter your testing, examiners watch two things at once: whether the technique works, and whether your PARTNER is safe in your hands. Control failures matter more than technique failures.",
      "Expect cumulative material again — releases feeding into locks, falls receiving them — because that is how the art actually connects."],
    keyPoints: ["With locks, partner safety is itself a graded skill", "Control failures outweigh technique failures", "Releases, locks, and falls test as connected chains"],
    quiz: {
      recog:   { q: "When locks appear in a belt test, examiners are watching…", a: "Both the technique and whether your partner is safe in your hands", d: ["Only how fast the lock is", "Only the loudness of your kihap", "Whether you can make your partner tap dramatically"] },
      scenario:{ q: "During a test your lock is working but your partner taps early. You…", a: "Release instantly — that IS the test", d: ["Hold one extra second so the examiner sees it", "Look at the examiner and shrug", "Re-apply it harder"] }
    } }
  ]
};
