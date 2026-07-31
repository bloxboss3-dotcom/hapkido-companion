const MASCOT_SVG = `
<svg viewBox="0 0 120 124" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- 수련생 — your avatar. The belt (and its stripe) take the color of the
       belt you are currently training for, via --beltc / --beltstripe. -->
  <g class="tg-body">
    <!-- ears (kept as hooks: they wiggle on 'wow') -->
    <g class="tg-ear tg-ear-l"><circle cx="30" cy="52" r="6" fill="#f0c49a"/><circle cx="30" cy="52" r="2.4" fill="#dfa77a"/></g>
    <g class="tg-ear tg-ear-r"><circle cx="90" cy="52" r="6" fill="#f0c49a"/><circle cx="90" cy="52" r="2.4" fill="#dfa77a"/></g>

    <!-- head -->
    <circle cx="60" cy="50" r="29" fill="#f0c49a"/>

    <!-- hair: soft cap with a center-parted fringe -->
    <path d="M31 52 C31 30 44 20 60 20 C76 20 89 30 89 52
             L83 52 C83 42 79 37 74 34 C76 30 75 27 73 25
             C69 30 65 32 60 32 C55 32 51 30 47 25
             C45 27 44 30 46 34 C41 37 37 42 37 52 Z" fill="#2b2523"/>

    <!-- blush -->
    <ellipse class="tg-blush" cx="42" cy="61" rx="6" ry="4" fill="#f79fae" opacity=".5"/>
    <ellipse class="tg-blush" cx="78" cy="61" rx="6" ry="4" fill="#f79fae" opacity=".5"/>

    <!-- eyes -->
    <g class="tg-eyes tg-e-open">
      <ellipse cx="48" cy="53" rx="4.6" ry="5.4" fill="#33210f"/>
      <ellipse cx="72" cy="53" rx="4.6" ry="5.4" fill="#33210f"/>
      <circle cx="49.6" cy="51" r="1.7" fill="#fff"/>
      <circle cx="73.6" cy="51" r="1.7" fill="#fff"/>
    </g>
    <g class="tg-eyes tg-e-happy" stroke="#33210f" stroke-width="3.6" stroke-linecap="round" fill="none">
      <path d="M43 55 c2.8-5 8.2-5 11 0"/>
      <path d="M66 55 c2.8-5 8.2-5 11 0"/>
    </g>
    <g class="tg-eyes tg-e-wow">
      <ellipse cx="48" cy="52" rx="6.2" ry="7" fill="#33210f"/>
      <ellipse cx="72" cy="52" rx="6.2" ry="7" fill="#33210f"/>
      <circle cx="50.2" cy="49.4" r="2.4" fill="#fff"/>
      <circle cx="74.2" cy="49.4" r="2.4" fill="#fff"/>
      <circle cx="46" cy="55" r="1.2" fill="#fff" opacity=".85"/>
      <circle cx="70" cy="55" r="1.2" fill="#fff" opacity=".85"/>
    </g>
    <g class="tg-eyes tg-e-oops">
      <ellipse cx="48" cy="54" rx="4.4" ry="4.8" fill="#33210f"/>
      <ellipse cx="72" cy="54" rx="4.4" ry="4.8" fill="#33210f"/>
      <circle cx="49.4" cy="52.4" r="1.5" fill="#fff"/>
      <circle cx="73.4" cy="52.4" r="1.5" fill="#fff"/>
      <g stroke="#3c2c1a" stroke-width="3" stroke-linecap="round">
        <path d="M41 45 q6-4 13-1.5"/>
        <path d="M79 45 q-6-4 -13-1.5"/>
      </g>
    </g>
    <g class="tg-eyes tg-e-think">
      <ellipse cx="50" cy="51" rx="4.5" ry="5" fill="#33210f"/>
      <ellipse cx="74" cy="51" rx="4.5" ry="5" fill="#33210f"/>
      <circle cx="51.6" cy="48.6" r="1.6" fill="#fff"/>
      <circle cx="75.6" cy="48.6" r="1.6" fill="#fff"/>
    </g>
    <g class="tg-eyes tg-e-blink" stroke="#33210f" stroke-width="3.6" stroke-linecap="round">
      <path d="M42 53 h11"/>
      <path d="M66 53 h11"/>
    </g>

    <!-- nose -->
    <path d="M58 59 q2 2.6 4 0" fill="none" stroke="#d99e70" stroke-width="2" stroke-linecap="round"/>

    <!-- mouths -->
    <g class="tg-mouth tg-m-smile" stroke="#5a3a20" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M52 67 c4 4.5 12 4.5 16 0"/>
    </g>
    <g class="tg-mouth tg-m-grin">
      <path d="M48 66 c4 9 20 9 24 0 z" fill="#5a3a20"/>
      <path d="M54 72 c2.5 3.5 9.5 3.5 12 0 z" fill="#f2828f"/>
    </g>
    <g class="tg-mouth tg-m-wow">
      <ellipse cx="60" cy="70" rx="8" ry="7" fill="#5a3a20"/>
      <ellipse cx="60" cy="73.4" rx="4.6" ry="3.2" fill="#f2828f"/>
    </g>
    <g class="tg-mouth tg-m-oops" stroke="#5a3a20" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M51 69 c3-2.5 5.5 1 9-1 s5.5 2 9-1"/>
    </g>
    <g class="tg-mouth tg-m-o" stroke="#5a3a20" stroke-width="3" fill="none">
      <ellipse cx="60" cy="69.6" rx="3.6" ry="3.2" fill="#5a3a20" stroke="none"/>
    </g>

    <!-- dobok -->
    <path d="M31 124 L33 97 C35 87 43 81 52 79 L60 86 L68 79 C77 81 85 87 87 97 L89 124 Z"
          fill="#f6f3ea" stroke="#cfc8b8" stroke-width="1.5"/>
    <path d="M52 79 L60 95 L68 79" fill="none" stroke="#c4bca9" stroke-width="4" stroke-linecap="round"/>
    <path d="M54.5 81 L60 91.5 L65.5 81 L60 87 Z" fill="#e9e3d4"/>

    <!-- the belt: your current color, stripe included -->
    <rect x="32" y="104" width="56" height="9.5" rx="2" fill="var(--beltc, #e8e6da)" stroke="rgba(0,0,0,.35)" stroke-width="1.4"/>
    <rect x="33" y="109.6" width="54" height="2.6" fill="var(--beltstripe, transparent)"/>
    <rect x="53.5" y="101.5" width="13" height="14" rx="3.5" fill="var(--beltc, #e8e6da)" stroke="rgba(0,0,0,.4)" stroke-width="1.6"/>
    <path d="M55 115.5 L50.5 123.5 L58 123.5 Z" fill="var(--beltc, #e8e6da)" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
    <path d="M65 115.5 L69.5 123.5 L62 123.5 Z" fill="var(--beltc, #e8e6da)" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
  </g>
</svg>`;