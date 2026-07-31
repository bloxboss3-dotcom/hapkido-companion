// Smoke-test the LIVE site, not the built file.
//
// The main matrix runs against file://, which cannot see Pages-only failures:
// a stale or half-finished deploy, a 404 on an asset that exists locally, a
// wrong Content-Type, Jekyll eating a path. This loads the deployed URL in a
// real browser and checks the app actually boots for a student.
//
// Deliberately OUT of `npm run check` and out of CI: it needs network and it
// tests whatever is currently deployed, not the working tree. Run it after a
// deploy has landed.
//
//   npm run smoke                       # tests the published site
//   npm run smoke -- https://other/     # or any other origin
const { chromium } = require('playwright');

const URL = (process.argv[2] || process.env.SMOKE_URL ||
  'https://bloxboss3-dotcom.github.io/hapkido-companion/').replace(/\/?$/, '/');

const results = [];
function ok(name, cond, detail) {
  results.push({ name, pass: !!cond });
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (cond ? '' : '  :: ' + (detail || '')));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// A smoke test whose whole point is catching a broken deploy must report the
// breakage, not die on it. If the page never loaded, every later probe throws;
// each one should become a FAIL line instead of a stack trace.
async function probe(page, fn) {
  try { return await page.evaluate(fn); } catch (e) { return false; }
}
async function act(fn) {
  try { await fn(); return true; } catch (e) { return false; }
}

// Playwright's browsers ignore the system proxy, so an HTTPS_PROXY in the
// environment (corporate network, sandboxed CI) has to be handed over
// explicitly or every request dies with ERR_CONNECTION_RESET. A local target
// is never proxied — that path is for reaching the public internet.
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/)/.test(URL);
const proxyServer = isLocal ? '' : (process.env.HTTPS_PROXY || process.env.https_proxy || '');
const launchOpts = proxyServer ? { proxy: { server: proxyServer } } : {};

(async () => {
  console.log('smoke-testing ' + URL + (proxyServer ? '  (via proxy ' + proxyServer + ')' : '') + '\n');
  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));

  let resp = null;
  try { resp = await page.goto(URL, { waitUntil: 'load', timeout: 45000 }); }
  catch (e) { console.log('  (navigation failed: ' + e.message.split('\n')[0] + ')'); }
  ok('live site responds 200', resp && resp.status() === 200, resp ? String(resp.status()) : 'no response');
  ok('served as text/html', /text\/html/.test((resp && resp.headers()['content-type']) || ''),
    (resp && resp.headers()['content-type']) || 'no response');

  await sleep(1200);
  ok('app boots: curriculum inlined and debug handle present', await probe(page, () =>
    !!window.CURRICULUM && window.CURRICULUM.items.length > 0 && !!window.__HKD));
  ok('deployed build is current: courses are declared', await probe(page, () =>
    !!window.__HKD && Array.isArray(window.__HKD.COURSES) && window.__HKD.COURSES.length === 2));
  ok('first launch shows the course picker, both courses', await probe(page, () =>
    !!window.__HKD && window.__HKD.view === 'courses' && document.querySelectorAll('.ccard').length === 2));
  ok('no console or page errors on load', errs.length === 0, JSON.stringify(errs).slice(0, 300));

  // The host actually serves the icon we ship. This is the class of bug the
  // file:// matrix structurally cannot catch.
  let icon = null;
  try { icon = await page.request.get(URL + 'apple-touch-icon.png'); } catch (e) { /* reported below */ }
  ok('apple-touch-icon.png is served', icon && icon.status() === 200,
    icon ? 'status ' + icon.status() : 'request failed');
  ok('apple-touch-icon.png served as an image',
    icon && /^image\/png/.test(icon.headers()['content-type'] || ''),
    icon ? icon.headers()['content-type'] : 'request failed');

  // Installability over HTTP. A manifest served with the wrong Content-Type,
  // or an icon that 404s, silently costs the Install prompt — and file://
  // tests cannot see any of it.
  let mf = null, manifest = null;
  try {
    mf = await page.request.get(URL + 'manifest.webmanifest');
    manifest = JSON.parse(await mf.text());
  } catch (e) { /* reported below */ }
  ok('manifest.webmanifest is served', mf && mf.status() === 200,
    mf ? 'status ' + mf.status() : 'request failed');
  // Chrome accepts any JSON-ish type; octet-stream is the sign a host has no
  // mapping for .webmanifest, which is worth knowing about before students hit it.
  ok('manifest served with a JSON content-type', mf &&
    /application\/(manifest\+json|json)/.test(mf.headers()['content-type'] || ''),
    mf ? mf.headers()['content-type'] : 'request failed');
  ok('manifest declares a standalone app', manifest && manifest.display === 'standalone' &&
    !!manifest.name && Array.isArray(manifest.icons) && manifest.icons.length > 0,
    manifest ? JSON.stringify(manifest).slice(0, 120) : 'unparsed');
  if (manifest && Array.isArray(manifest.icons)) {
    for (const ic of manifest.icons) {
      let r = null;
      try { r = await page.request.get(URL + ic.src); } catch (e) { /* reported below */ }
      ok(`manifest icon ${ic.src} is served as an image`,
        r && r.status() === 200 && /^image\/png/.test(r.headers()['content-type'] || ''),
        r ? r.status() + ' ' + r.headers()['content-type'] : 'request failed');
    }
  }

  // A student can start studying, end to end, on the real site.
  await act(async () => { await page.click('[data-course="way"]', { timeout: 5000 }); });
  await sleep(700);
  await act(async () => { await page.click('[data-act="start"]', { timeout: 5000 }); });
  await sleep(900);
  ok('a session starts on the live site', await probe(page, () =>
    !!window.__HKD && !!window.__HKD.sess && !!document.querySelector('.session-wrap')));

  const fails = results.filter(r => !r.pass);
  console.log('\n==== ' + (results.length - fails.length) + '/' + results.length + ' passed ====');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})().catch(e => {
  console.error('\nSMOKE HARNESS ERROR:', e.message);
  console.error('If this is a network/DNS failure, the smoke test needs internet access; ' +
                'the offline matrix (`npm test`) is unaffected.');
  process.exit(2);
});
