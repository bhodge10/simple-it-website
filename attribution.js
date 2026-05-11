// Attribution capture for simple-it.us
//
// On every page load, capture utm_* query params, document.referrer, and the
// current URL. Persist the FIRST set of attribution values seen for a visitor
// in localStorage so they survive cross-page navigation. Subsequent visits
// with new UTMs overwrite — that matches how most lead-attribution platforms
// expect things to work (most-recent campaign wins).
//
// Read by lead-capture.js when a form is submitted, so the portal lead row
// carries the same campaign attribution that would otherwise be lost.

(function () {
  if (typeof window === 'undefined' || !window.localStorage) return;

  var STORAGE_KEY = 'sit_attribution';
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  function readUtmsFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var found = {};
      var hasAny = false;
      UTM_KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v) {
          found[k] = v;
          hasAny = true;
        }
      });
      return hasAny ? found : null;
    } catch (e) {
      return null;
    }
  }

  function loadStored() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function persist(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage may be full or blocked; the form will still work without
      // attribution, so swallow.
    }
  }

  var stored = loadStored();
  var newUtms = readUtmsFromUrl();

  if (newUtms) {
    // New campaign click — overwrite. Capture referrer + landing URL as of
    // this click, which is what marketing actually wants for attribution.
    var payload = {
      utm_source: newUtms.utm_source || null,
      utm_medium: newUtms.utm_medium || null,
      utm_campaign: newUtms.utm_campaign || null,
      utm_term: newUtms.utm_term || null,
      utm_content: newUtms.utm_content || null,
      referrer: document.referrer || null,
      landingUrl: window.location.href,
      capturedAt: new Date().toISOString(),
    };
    persist(payload);
  } else if (!stored) {
    // First-ever visit with no UTMs — still capture referrer + landing URL
    // so we at least know how they got here.
    persist({
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      referrer: document.referrer || null,
      landingUrl: window.location.href,
      capturedAt: new Date().toISOString(),
    });
  }

  // Expose a getter so lead-capture.js can read without re-parsing.
  window.SimpleITAttribution = {
    get: function () {
      return loadStored() || {};
    },
  };
})();
