/* ============================================================
   THE DOJANG — collectible characters
   ------------------------------------------------------------
   Characters are drawn from ONE parametric SVG with trait slots
   (skin / hair / uniform / trim / sash / accessory / pose / eyes), so a
   thirty-strong roster costs a few hundred bytes of data instead of thirty
   hand-drawn files. That matters: the deployed app is a single HTML file.

   Two hard rules live in here, not just in the docs:

   1. NO CHARACTER PERFORMS A TECHNIQUE. Poses are standing, guard, bowing,
      stretching and celebrating. An illustrated joint lock or throw is
      safety misinformation with the school's name on it — the same reason
      generated technique art is banned. Never add a pose that shows one
      person doing something TO another.
   2. NOTHING HERE IS RANK. The sashes are costume colours on toys. Only
      Grandmaster Lee awards belts, and the collection screen says so.
      Rarity is never shown as a belt colour, and rarity colour is never the
      only signal — the tier is always spelled out in words.
   ============================================================ */

const DJ_RARITY = {
  common:    { label: 'Common',    c: '#94a3b8', pips: 1, refund: 20 },
  rare:      { label: 'Rare',      c: '#46c9c0', pips: 2, refund: 45 },
  legendary: { label: 'Legendary', c: '#f0a83c', pips: 3, refund: 110 },
  mythical:  { label: 'Mythical',  c: '#c77dff', pips: 4, refund: 260 }
};
const DJ_RARITY_ORDER = ['common', 'rare', 'legendary', 'mythical'];

/* Skin, hair and cloth palettes. Kept small and warm to match the mascot. */
const DJ_SKIN = ['#f0c49a', '#e0a878', '#c68642', '#a1673a', '#f7d7b8'];
const DJ_HAIRC = ['#2b2523', '#4a3428', '#1a1a20', '#6b4a2f', '#8a8f99', '#d9d2c5'];

/* Names are nicknames for toys — deliberately NOT curriculum vocabulary, so
   nobody mistakes a character for something that will be on a test. */
const DJ_ROSTER = [
  // ---- common (12) ----
  { id: 'sparrow',  name: 'Sparrow',      r: 'common',    skin: 0, hair: 0, hc: 0, uni: 0, trim: 0, sash: 0, acc: 0, pose: 'ready',   eyes: 'open',  blurb: 'First week, front row, tries everything twice.' },
  { id: 'pebble',   name: 'Pebble',       r: 'common',    skin: 1, hair: 1, hc: 1, uni: 0, trim: 1, sash: 0, acc: 0, pose: 'ready',   eyes: 'happy', blurb: 'Small, steady, never skips the warm-up.' },
  { id: 'sprout',   name: 'Sprout',       r: 'common',    skin: 4, hair: 2, hc: 0, uni: 0, trim: 0, sash: 1, acc: 0, pose: 'stretch', eyes: 'happy', blurb: 'Grew two inches since the last belt test.' },
  { id: 'mitten',   name: 'Mitten',       r: 'common',    skin: 0, hair: 3, hc: 3, uni: 1, trim: 0, sash: 0, acc: 0, pose: 'ready',   eyes: 'open',  blurb: 'Keeps losing one glove. Only ever one.' },
  { id: 'acorn',    name: 'Acorn',        r: 'common',    skin: 2, hair: 0, hc: 2, uni: 0, trim: 2, sash: 1, acc: 0, pose: 'bow',     eyes: 'happy', blurb: 'Bows to the doorway even when nobody is watching.' },
  { id: 'radish',   name: 'Radish',       r: 'common',    skin: 1, hair: 4, hc: 0, uni: 0, trim: 0, sash: 0, acc: 1, pose: 'ready',   eyes: 'open',  blurb: 'Headband on backwards, entirely on purpose.' },
  { id: 'puddle',   name: 'Puddle',       r: 'common',    skin: 3, hair: 1, hc: 2, uni: 1, trim: 1, sash: 1, acc: 0, pose: 'ready',   eyes: 'calm',  blurb: 'Falls over a lot. Gets up slightly faster each time.' },
  { id: 'clover',   name: 'Clover',       r: 'common',    skin: 4, hair: 5, hc: 1, uni: 0, trim: 0, sash: 2, acc: 0, pose: 'stretch', eyes: 'happy', blurb: 'Convinced the stretching is the best part.' },
  { id: 'biscuit',  name: 'Biscuit',      r: 'common',    skin: 0, hair: 2, hc: 3, uni: 0, trim: 2, sash: 0, acc: 2, pose: 'ready',   eyes: 'open',  blurb: 'Brings snacks. Shares them. Mostly.' },
  { id: 'thimble',  name: 'Thimble',      r: 'common',    skin: 2, hair: 3, hc: 0, uni: 1, trim: 0, sash: 2, acc: 0, pose: 'bow',     eyes: 'calm',  blurb: 'Quietest one in class, hears everything.' },
  { id: 'marbles',  name: 'Marbles',      r: 'common',    skin: 1, hair: 0, hc: 1, uni: 0, trim: 1, sash: 1, acc: 1, pose: 'cheer',   eyes: 'happy', blurb: 'Cheers loudest for other people.' },
  { id: 'juniper',  name: 'Juniper',      r: 'common',    skin: 3, hair: 4, hc: 2, uni: 0, trim: 0, sash: 0, acc: 0, pose: 'guard',   eyes: 'open',  blurb: 'Practises the same stance until it is boring, then again.' },

  // ---- rare (10) ----
  { id: 'kestrel',  name: 'Kestrel',      r: 'rare',      skin: 0, hair: 5, hc: 0, uni: 2, trim: 3, sash: 3, acc: 0, pose: 'guard',   eyes: 'calm',  blurb: 'Reads the room before the room knows it is being read.' },
  { id: 'lantern',  name: 'Lantern',      r: 'rare',      skin: 4, hair: 1, hc: 5, uni: 2, trim: 4, sash: 3, acc: 3, pose: 'ready',   eyes: 'happy', blurb: 'Turns up early to switch the lights on.' },
  { id: 'ripple',   name: 'Ripple',       r: 'rare',      skin: 1, hair: 2, hc: 1, uni: 2, trim: 3, sash: 4, acc: 0, pose: 'stretch', eyes: 'calm',  blurb: 'Redirects everything, including arguments.' },
  { id: 'ember',    name: 'Ember',        r: 'rare',      skin: 2, hair: 0, hc: 0, uni: 3, trim: 5, sash: 3, acc: 1, pose: 'guard',   eyes: 'open',  blurb: 'Small and extremely difficult to put out.' },
  { id: 'willow',   name: 'Willow',       r: 'rare',      skin: 3, hair: 5, hc: 4, uni: 2, trim: 4, sash: 4, acc: 0, pose: 'bow',     eyes: 'calm',  blurb: 'Bends the whole way and never breaks.' },
  { id: 'compass',  name: 'Compass',      r: 'rare',      skin: 0, hair: 3, hc: 2, uni: 3, trim: 3, sash: 3, acc: 2, pose: 'ready',   eyes: 'open',  blurb: 'Always facing the right way. Nobody knows how.' },
  { id: 'tinder',   name: 'Tinder',       r: 'rare',      skin: 4, hair: 4, hc: 3, uni: 2, trim: 5, sash: 4, acc: 0, pose: 'cheer',   eyes: 'happy', blurb: 'Catches enthusiasm off other people instantly.' },
  { id: 'quill',    name: 'Quill',        r: 'rare',      skin: 1, hair: 1, hc: 0, uni: 3, trim: 4, sash: 3, acc: 3, pose: 'ready',   eyes: 'calm',  blurb: 'Writes the terminology out by hand. Every week.' },
  { id: 'otter',    name: 'Otter',        r: 'rare',      skin: 2, hair: 2, hc: 1, uni: 2, trim: 3, sash: 4, acc: 0, pose: 'stretch', eyes: 'happy', blurb: 'Rolls beautifully. Would roll everywhere if allowed.' },
  { id: 'anvil',    name: 'Anvil',        r: 'rare',      skin: 3, hair: 0, hc: 2, uni: 3, trim: 5, sash: 3, acc: 2, pose: 'guard',   eyes: 'open',  blurb: 'Immovable. Cheerful about it.' },

  // ---- legendary (6) ----
  { id: 'nightheron', name: 'Night Heron', r: 'legendary', skin: 0, hair: 5, hc: 2, uni: 4, trim: 6, sash: 5, acc: 4, pose: 'guard',   eyes: 'calm',  blurb: 'Stands on one leg for an hour. Nobody has out-waited them.' },
  { id: 'stonebear',  name: 'Stone Bear',  r: 'legendary', skin: 2, hair: 0, hc: 0, uni: 4, trim: 7, sash: 5, acc: 0, pose: 'ready',   eyes: 'open',  blurb: 'Moves slowly right up until the moment they do not.' },
  { id: 'pinewind',   name: 'Pine Wind',   r: 'legendary', skin: 4, hair: 2, hc: 5, uni: 5, trim: 6, sash: 6, acc: 3, pose: 'stretch', eyes: 'calm',  blurb: 'Trains outside in weather everyone else complains about.' },
  { id: 'brasslamp',  name: 'Brass Lamp',  r: 'legendary', skin: 1, hair: 3, hc: 4, uni: 4, trim: 7, sash: 5, acc: 4, pose: 'bow',     eyes: 'calm',  blurb: 'Taught half the room and mentions it to nobody.' },
  { id: 'riverstone', name: 'River Stone', r: 'legendary', skin: 3, hair: 1, hc: 5, uni: 5, trim: 6, sash: 6, acc: 0, pose: 'ready',   eyes: 'calm',  blurb: 'Smoothed by about forty thousand repetitions.' },
  { id: 'firstlight', name: 'First Light', r: 'legendary', skin: 4, hair: 4, hc: 5, uni: 4, trim: 7, sash: 5, acc: 3, pose: 'cheer',   eyes: 'happy', blurb: 'Unlocks the door at dawn. Every single morning.' },

  // ---- mythical (2) ----
  { id: 'cranemaster', name: 'The Crane',  r: 'mythical',  skin: 4, hair: 5, hc: 5, uni: 6, trim: 8, sash: 7, acc: 5, pose: 'guard',   eyes: 'calm',  blurb: 'Older than the building. Balance like a rumour.' },
  { id: 'quietmtn',    name: 'Quiet Mountain', r: 'mythical', skin: 2, hair: 0, hc: 5, uni: 6, trim: 8, sash: 7, acc: 4, pose: 'bow',   eyes: 'calm',  blurb: 'Says almost nothing. You practise harder anyway.' }
];
const DJ_BY_ID = Object.fromEntries(DJ_ROSTER.map(c => [c.id, c]));

/* Cloth palettes — index into these from the roster rows. Uniform and trim
   are costume only; the sash colours are deliberately NOT the belt ladder's
   colours, so a toy can never be misread as a rank. */
const DJ_UNI = ['#eef1f5', '#e4e8ee', '#dfe6f2', '#e8e2f4', '#2b3242', '#26303f', '#1d2331'];
const DJ_TRIM = ['#c9d2de', '#b9c4d4', '#a9b8cc', '#7f9bc4', '#8f7fc0', '#c98f5a', '#5f7fa8', '#c2a15e', '#9d7fd0'];
const DJ_SASH = ['#b9c2cf', '#8fa3bd', '#6f86a8', '#3f7fa8', '#4a8f86', '#8a6fb8', '#b4823c', '#6a4fa0'];

/* Hair shapes, drawn to sit on a head of r=13 centred at (32, 25). */
const DJ_HAIR = [
  // 0 — short cap with a fringe
  'M19 26 C19 15 25 10 32 10 C39 10 45 15 45 26 L42 26 C42 20 40 17 37 16 C35 19 33 20 32 20 C31 20 29 19 27 16 C24 17 22 20 22 26 Z',
  // 1 — bowl cut
  'M18.5 26 C18.5 14 25 9.5 32 9.5 C39 9.5 45.5 14 45.5 26 L42.5 24.5 C41 21 38 19.5 32 19.5 C26 19.5 23 21 21.5 24.5 Z',
  // 2 — topknot
  'M20 25 C20 15 25.5 11 32 11 C38.5 11 44 15 44 25 L41 24 C40 19 37 17 32 17 C27 17 24 19 23 24 Z M32 4.5 a3.6 3.6 0 1 1 0 7.2 a3.6 3.6 0 1 1 0-7.2 Z',
  // 3 — side part
  'M19 26 C19 14.5 25 10 32 10 C39.5 10 45 15 45 26 L42 25 C42 19 39.5 16.5 35 16 C31 20 26 21.5 22 21 C21 22.5 20.5 24 20.5 26 Z',
  // 4 — twin buns
  'M20 25 C20 15 25.5 11 32 11 C38.5 11 44 15 44 25 L41 24 C40 19 37 17 32 17 C27 17 24 19 23 24 Z M17.5 13.5 a4 4 0 1 1 0 8 a4 4 0 1 1 0-8 Z M46.5 13.5 a4 4 0 1 1 0 8 a4 4 0 1 1 0-8 Z',
  // 5 — long, tied back
  'M18.5 27 C18.5 14 25 9.5 32 9.5 C39 9.5 45.5 14 45.5 27 L45.5 34 L42.5 34 L42.5 22 C41 19 38 17.5 32 17.5 C26 17.5 23 19 21.5 22 L21.5 34 L18.5 34 Z'
];

/* Accessories. None of them are protective gear — nothing here should read as
   "you are equipped to do the restricted thing". */
const DJ_ACC = [
  '',
  // 1 headband
  '<path d="M19.5 22 h25 v3.6 h-25 Z" fill="#c85f5f"/><path d="M44 22 l6 2 l-6 2.4 Z" fill="#c85f5f"/>',
  // 2 round glasses
  '<g fill="none" stroke="#4a4a55" stroke-width="1.3"><circle cx="26.6" cy="26" r="4.2"/><circle cx="37.4" cy="26" r="4.2"/><path d="M30.8 26 h2.4"/></g>',
  // 3 small hair clip
  '<path d="M40.5 15.5 h6 v2.4 h-6 Z" fill="#e8b84b"/>',
  // 4 shoulder cloak clasp
  '<circle cx="32" cy="40" r="2.6" fill="#e8c86b"/><circle cx="32" cy="40" r="1.1" fill="#8a6a20"/>',
  // 5 straw hat
  '<path d="M13 20 C13 12 22 6.5 32 6.5 C42 6.5 51 12 51 20 Z" fill="#d9b877"/><path d="M13 20 h38 v2.4 h-38 Z" fill="#c2a05e"/>'
];

const DJ_EYES = {
  open:  '<ellipse cx="27" cy="26" rx="2.1" ry="2.5" fill="#33210f"/><ellipse cx="37" cy="26" rx="2.1" ry="2.5" fill="#33210f"/><circle cx="27.7" cy="25.1" r=".8" fill="#fff"/><circle cx="37.7" cy="25.1" r=".8" fill="#fff"/>',
  happy: '<g stroke="#33210f" stroke-width="1.7" stroke-linecap="round" fill="none"><path d="M24.6 27 c1.3-2.3 3.8-2.3 5.1 0"/><path d="M34.6 27 c1.3-2.3 3.8-2.3 5.1 0"/></g>',
  calm:  '<g stroke="#33210f" stroke-width="1.7" stroke-linecap="round" fill="none"><path d="M24.6 26.2 h5"/><path d="M34.6 26.2 h5"/></g>'
};

/* Arm shapes per pose. Standing, guard, bow, stretch, cheer — a person doing
   something on their own. Never one person applying anything to another. */
function djArms(pose, uni, trim) {
  const s = `fill="${uni}" stroke="${trim}" stroke-width="1"`;
  if (pose === 'guard') return `<path d="M20 44 q-3 5 1 9 q3 3 5 0 q1-4-1-7 Z" ${s}/><path d="M44 44 q3 5-1 9 q-3 3-5 0 q-1-4 1-7 Z" ${s}/>`;
  if (pose === 'bow') return `<path d="M21 45 q-2 7 4 10 h14 q6-3 4-10 q-3 6-11 6 q-8 0-11-6 Z" ${s}/>`;
  if (pose === 'stretch') return `<path d="M20 44 q-4 -8 -1 -13 q3-2 4 1 q1 5-1 12 Z" ${s}/><path d="M44 44 q3 6-1 11 q-3 2-4-1 q-1-4 2-10 Z" ${s}/>`;
  if (pose === 'cheer') return `<path d="M20 44 q-5 -7 -2 -12 q3-2 4 1 q1 5-2 11 Z" ${s}/><path d="M44 44 q5 -7 2 -12 q-3-2-4 1 q-1 5 2 11 Z" ${s}/>`;
  return `<path d="M20 43 q-3 7 -1 13 q2 3 4 1 q1-6 0-14 Z" ${s}/><path d="M44 43 q3 7 1 13 q-2 3-4 1 q-1-6 0-14 Z" ${s}/>`;
}

/* One character, as an inline SVG string. */
function djCharSvg(c, opts) {
  const o = opts || {};
  const skin = DJ_SKIN[c.skin % DJ_SKIN.length];
  const hairc = DJ_HAIRC[c.hc % DJ_HAIRC.length];
  const uni = DJ_UNI[c.uni % DJ_UNI.length];
  const trim = DJ_TRIM[c.trim % DJ_TRIM.length];
  const sash = DJ_SASH[c.sash % DJ_SASH.length];
  const lean = c.pose === 'bow' ? ' transform="rotate(9 32 62)"' : '';
  return `<svg class="dj-svg${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 64 84" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(c.name)}">
  <ellipse cx="32" cy="79" rx="15" ry="3.2" fill="#000" opacity=".22"/>
  <g${lean}>
    <rect x="25" y="60" width="6" height="17" rx="2.4" fill="${uni}"/>
    <rect x="33" y="60" width="6" height="17" rx="2.4" fill="${uni}"/>
    <rect x="23.5" y="74.5" width="8.5" height="3.6" rx="1.6" fill="#3b4250"/>
    <rect x="32" y="74.5" width="8.5" height="3.6" rx="1.6" fill="#3b4250"/>
    <path d="M22 42 q10-5 20 0 l3 19 q-13 4-26 0 Z" fill="${uni}" stroke="${trim}" stroke-width="1.1"/>
    <path d="M32 39 l-7 3 l5 15 Z" fill="${trim}" opacity=".55"/>
    <path d="M32 39 l7 3 l-5 15 Z" fill="${trim}" opacity=".35"/>
    ${djArms(c.pose, uni, trim)}
    <rect x="18.5" y="55" width="27" height="5.2" rx="1.8" fill="${sash}"/>
    <path d="M40 60 l3.5 7 l-3 .8 Z" fill="${sash}"/>
    <circle cx="19" cy="27" r="3" fill="${skin}"/><circle cx="45" cy="27" r="3" fill="${skin}"/>
    <circle cx="32" cy="25" r="13" fill="${skin}"/>
    <path d="${DJ_HAIR[c.hair % DJ_HAIR.length]}" fill="${hairc}"/>
    <ellipse cx="25" cy="30" rx="2.6" ry="1.7" fill="#f79fae" opacity=".45"/>
    <ellipse cx="39" cy="30" rx="2.6" ry="1.7" fill="#f79fae" opacity=".45"/>
    ${DJ_EYES[c.eyes] || DJ_EYES.open}
    <path d="M30 32.5 q2 1.8 4 0" stroke="#b5745a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${DJ_ACC[c.acc % DJ_ACC.length]}
  </g>
</svg>`;
}

/* ============================================================
   THE OBSTACLES — what the class actually trains against
   ------------------------------------------------------------
   Deliberately NOT people. Two reasons, both load-bearing:

   1. The no-technique rule above applies here too. A fight scene between
      illustrated humans is exactly the "here is how you do it to someone"
      picture that safety misinformation is made of. Abstract shapes cannot
      be copied onto a training partner.
   2. The curriculum this app teaches says leave > control > damage, lowest
      rung first, and that you are responsible for the other person. A game
      where the class gangs up on a human and empties their health bar
      argues the opposite of the Green belt content. So the enemy is what
      genuinely defeats martial artists: forgetting, impatience, sloppiness,
      overconfidence.

   Nothing here is rank, and beating one never awards a belt.
   ============================================================ */

const BOSS_ROSTER = [
  { id: 'forgetting', name: 'The Forgetting', ko: '망각', rom: 'manggak',
    hp: 330, atk: 9, tint: '#5b6b8c', shape: 'drift',
    blurb: 'Eats whatever you stop revisiting. Slow, patient, always there.',
    line: 'It is not fast. It simply never stops.',
    rewardTier: 'rare' },
  { id: 'impatience', name: 'Impatience', ko: '조급함', rom: 'jogeupham',
    hp: 720, atk: 18, tint: '#b3673f', shape: 'spike',
    blurb: 'Wants it all today. Skips the warm-up, rushes the rep, learns nothing.',
    line: 'Hits first, hits often, and tires early.',
    rewardTier: 'rare' },
  { id: 'sloppiness', name: 'Sloppiness', ko: '허술함', rom: 'heosulham',
    hp: 1080, atk: 26, tint: '#6a7f52', shape: 'blob',
    blurb: 'Good enough, near enough, close enough — until the day it is not.',
    line: 'Soaks up damage the way bad habits soak up time.',
    rewardTier: 'legendary' },
  { id: 'overconfidence', name: 'Overconfidence', ko: '자만', rom: 'jaman',
    hp: 1550, atk: 34, tint: '#7d5b9e', shape: 'crown',
    blurb: 'The last one, and the one that catches people who think they have arrived.',
    line: 'Strongest when you think you have already won.',
    rewardTier: 'mythical' }
];
const BOSS_BY_ID = Object.fromEntries(BOSS_ROSTER.map(b => [b.id, b]));

/* One obstacle, as an inline SVG. Shapes are deliberately non-human: a mass
   with eyes, never a figure with limbs a student could imitate. */
function bossSvg(b, opts) {
  const o = opts || {};
  const t = b.tint;
  const body = {
    drift: 'M32 6 q20 2 24 20 q4 18 -6 30 q-10 12 -18 12 q-8 0 -18 -12 q-10 -12 -6 -30 q4 -18 24 -20 Z',
    spike: 'M32 4 l9 14 l15 -6 l-6 15 l14 9 l-14 9 l6 15 l-15 -6 l-9 14 l-9 -14 l-15 6 l6 -15 l-14 -9 l14 -9 l-6 -15 l15 6 Z',
    blob:  'M32 8 q22 0 26 18 q4 16 -4 26 q-8 10 -22 10 q-14 0 -22 -10 q-8 -10 -4 -26 q4 -18 26 -18 Z',
    crown: 'M32 4 l8 12 l10 -8 l2 14 l12 4 l-10 10 l6 14 l-14 -2 l-6 14 l-8 -12 l-8 12 l-6 -14 l-14 2 l6 -14 l-10 -10 l12 -4 l2 -14 l10 8 Z'
  }[b.shape] || 'M32 8 q22 0 26 18 q4 16 -4 26 q-8 10 -22 10 q-14 0 -22 -10 q-8 -10 -4 -26 q4 -18 26 -18 Z';
  return `<svg class="boss-svg${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 64 76" xmlns="http://www.w3.org/2000/svg"
    role="img" aria-label="${esc(b.name)}">
    <ellipse cx="32" cy="71" rx="19" ry="3.5" fill="#000" opacity=".28"/>
    <path d="${body}" fill="${t}" opacity=".92"/>
    <path d="${body}" fill="none" stroke="#000" stroke-width="1" opacity=".28"/>
    <ellipse cx="25" cy="32" rx="4.6" ry="5.4" fill="#0e1016"/>
    <ellipse cx="39" cy="32" rx="4.6" ry="5.4" fill="#0e1016"/>
    <circle cx="26.4" cy="30.2" r="1.5" fill="#fff" opacity=".9"/>
    <circle cx="40.4" cy="30.2" r="1.5" fill="#fff" opacity=".9"/>
    <path d="M25 45 q7 -4 14 0" stroke="#0e1016" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;
}
