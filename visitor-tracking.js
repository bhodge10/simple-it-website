// First-party visitor tracking for simple-it.us → Simple IT portal CRM.
//
// Assigns each browser a random "sv_…" visitor id (localStorage + a 1-year
// cookie), and beacons one page-view record per page load to the portal:
//   POST https://portal.simple-it.us/api/public/track   (text/plain JSON)
// The portal keeps path / title / referrer / campaign only — nothing
// personal — until the visitor identifies themselves by submitting a form
// (lead-capture.js sends the id with the form), scanning a postcard QR
// (the landing URL carries ?sit_vid=…), or clicking a nurture email (the
// link carries a signed ?sit_pid=…). From then on the pages they read show
// on their prospect card and feed the lead score.
//
// Load AFTER attribution.js (both deferred, document order) so the UTM
// capture is already stored. Respects Global Privacy Control. Fire-and-
// forget: a portal outage never affects the page.

(function () {
  if (typeof window === 'undefined' || !window.document) return;
  try { if (navigator.globalPrivacyControl === true) return; } catch (e) {}

  var ENDPOINT = 'https://portal.simple-it.us/api/public/track';
  var VID_KEY = 'sit_vid';
  var PID_KEY = 'sit_pid';
  var SESSION_KEY = 'sit_sid';
  var VID_RE = /^sv_[A-Za-z0-9_-]{16,40}$/;
  var ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function randomString(n) {
    var out = '';
    try {
      var bytes = new Uint8Array(n);
      (window.crypto || window.msCrypto).getRandomValues(bytes);
      for (var i = 0; i < n; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
      return out;
    } catch (e) {
      for (var j = 0; j < n; j++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      return out;
    }
  }
  function readStorage(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) {}
    // Cookie fallback — Safari caps script-set storage at 7 days of
    // inactivity; keeping both maximizes the chance the id survives.
    try { document.cookie = key + '=' + encodeURIComponent(value) + '; Max-Age=31536000; Path=/; SameSite=Lax; Secure'; } catch (e) {}
  }
  function readCookie(key) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }

  var params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { params = { get: function () { return null; } }; }

  // Visitor id: existing → adopt a postcard QR id if we have none → mint one.
  var vid = readStorage(VID_KEY) || readCookie(VID_KEY);
  var urlVid = params.get('sit_vid');
  if (!vid && urlVid && VID_RE.test(urlVid)) vid = urlVid;
  if (!vid || !VID_RE.test(vid)) vid = 'sv_' + randomString(20);
  writeStorage(VID_KEY, vid);

  // Signed prospect token from a nurture-email link — remember it so later
  // page views stay identified even after the URL param is gone.
  var urlPid = params.get('sit_pid');
  if (urlPid && /^[A-Za-z0-9]{10,40}\.[a-f0-9]{16}$/.test(urlPid)) writeStorage(PID_KEY, urlPid);
  var pid = readStorage(PID_KEY) || readCookie(PID_KEY);

  // Per-tab session id (one "visit" = one tab session).
  var sid = null;
  try {
    sid = window.sessionStorage.getItem(SESSION_KEY);
    if (!sid) { sid = randomString(16); window.sessionStorage.setItem(SESSION_KEY, sid); }
  } catch (e) {}

  var attribution = {};
  try {
    if (window.SimpleITAttribution && typeof window.SimpleITAttribution.get === 'function') attribution = window.SimpleITAttribution.get() || {};
  } catch (e) {}

  var payload = JSON.stringify({
    vid: vid,
    pid: pid || null,
    path: window.location.pathname || '/',
    title: (document.title || '').slice(0, 200),
    referrer: document.referrer || null,
    utmCampaign: params.get('utm_campaign') || attribution.utm_campaign || null,
    sessionId: sid,
    ts: Date.now(),
  });

  function send() {
    try {
      // sendBeacon with a string body posts text/plain — a CORS "simple
      // request", so no preflight on every page view.
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, payload)) return;
    } catch (e) {}
    try {
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: payload, keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  send();

  // lead-capture.js reads this to attach the visitor id to form submissions.
  window.SimpleITVisitor = {
    get: function () { return { vid: vid, pid: pid || null, sessionId: sid }; },
  };
})();
