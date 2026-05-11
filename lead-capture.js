// Portal lead-capture helper for simple-it.us
//
// Provides a single function `submitLeadToPortal(formKey, fields)` that POSTs
// to https://portal.simple-it.us/api/public/leads with the form fields plus
// any attribution captured by attribution.js. Fire-and-forget by design:
// callers do NOT await this — the existing Netlify Forms (or send-guide
// function) path remains the customer-visible source of truth, and a portal
// outage must never break a lead capture. Errors are logged to the console.

(function () {
  var PORTAL_LEADS_URL = 'https://portal.simple-it.us/api/public/leads';

  function getAttribution() {
    try {
      if (window.SimpleITAttribution && typeof window.SimpleITAttribution.get === 'function') {
        return window.SimpleITAttribution.get();
      }
    } catch (e) {}
    return {};
  }

  function buildPayload(formKey, fields) {
    var attr = getAttribution();
    var payload = {
      formKey: formKey,
    };
    // Copy whitelisted fields the portal /api/public/leads endpoint accepts.
    // Anything else gets routed into `extra` so the portal never rejects on
    // unknown keys.
    var SCHEMA_KEYS = [
      'email', 'firstName', 'lastName', 'fullName', 'company', 'phone',
      'title', 'message', 'industry', 'employeeCountRange', 'complianceFlags',
      'marketingConsent',
    ];
    var extra = {};
    Object.keys(fields || {}).forEach(function (key) {
      var value = fields[key];
      if (value === null || value === undefined || value === '') return;
      if (SCHEMA_KEYS.indexOf(key) >= 0) {
        payload[key] = value;
      } else {
        extra[key] = value;
      }
    });
    if (Object.keys(extra).length > 0) {
      payload.extra = extra;
    }
    payload.utmSource = attr.utm_source || null;
    payload.utmMedium = attr.utm_medium || null;
    payload.utmCampaign = attr.utm_campaign || null;
    payload.utmTerm = attr.utm_term || null;
    payload.utmContent = attr.utm_content || null;
    payload.referrer = attr.referrer || (document.referrer || null);
    payload.landingUrl = attr.landingUrl || window.location.href;
    return payload;
  }

  window.submitLeadToPortal = function (formKey, fields) {
    try {
      var body = JSON.stringify(buildPayload(formKey, fields));
      fetch(PORTAL_LEADS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
      })
        .then(function (res) {
          if (res.ok) {
            console.log('[lead-capture] portal accepted lead (' + formKey + '):', res.status);
          } else {
            console.warn('[lead-capture] portal returned ' + res.status + ' for lead (' + formKey + ')');
          }
        })
        .catch(function (err) {
          console.warn('[lead-capture] portal POST failed for lead (' + formKey + '):', err);
        });
    } catch (e) {
      console.warn('[lead-capture] unexpected error building lead payload:', e);
    }
  };
})();
