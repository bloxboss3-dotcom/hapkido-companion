/* ================================================================
   COURSE EMBLEMS — the two "flags" a student picks between.
   ----------------------------------------------------------------
   Vector, not raster, on purpose: the app makes no external requests
   and ships as one file, so 1.5 KB of SVG that stays crisp at any
   size beats 60 KB of base64 that does not. `currentColor` means each
   emblem is painted by its own course accent, in either theme.

   Want to swap in artwork instead (a photo, a school crest, a
   generated image)? Do NOT edit these. Add a file that sets:

       window.HKD_COURSE_ART = { way: "<url or data: URI>",
                                 art: "<url or data: URI>" };

   ...and it wins over the emblem below, per course, with no other
   change. Keep it a data: URI (or a file under assets/) so the app
   still runs with the network switched off.
   ================================================================ */
window.HKD_COURSE_EMBLEM = {

  /* Terminology & Philosophy — an open ink circle over three stacked
     strokes: lines of writing, fading as they settle into memory. */
  way: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="hkdWayInk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="currentColor" stop-opacity=".30"/>
      <stop offset=".42" stop-color="currentColor" stop-opacity="1"/>
      <stop offset="1" stop-color="currentColor" stop-opacity=".62"/>
    </linearGradient></defs>
    <path d="M67 20.6 A34 34 0 1 0 81.9 38.4" fill="none" stroke="url(#hkdWayInk)"
          stroke-width="7.4" stroke-linecap="round"/>
    <g stroke="currentColor" stroke-linecap="round" fill="none">
      <path d="M35 42h30" stroke-width="5.4" opacity=".95"/>
      <path d="M35 52.5h30" stroke-width="5.4" opacity=".66"/>
      <path d="M35 63h19" stroke-width="5.4" opacity=".38"/>
    </g>
  </svg>`,

  /* Techniques — an open ink circle around two strokes chasing each
     other: redirection, the thing every hapkido movement is made of. */
  art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="hkdArtInk" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="currentColor" stop-opacity=".32"/>
      <stop offset=".46" stop-color="currentColor" stop-opacity="1"/>
      <stop offset="1" stop-color="currentColor" stop-opacity=".60"/>
    </linearGradient></defs>
    <path d="M33 79.4 A34 34 0 1 0 18.1 61.6" fill="none" stroke="url(#hkdArtInk)"
          stroke-width="7.4" stroke-linecap="round"/>
    <g stroke="currentColor" stroke-linecap="round" fill="none" stroke-width="6.6">
      <path d="M50 28.5 C65 33 67.5 50.5 56 59" opacity=".95"/>
      <path d="M50 71.5 C35 67 32.5 49.5 44 41" opacity=".62"/>
    </g>
  </svg>`
};
