// Service notice for simple-it.us — Microsoft Outlook outage (posted 2026-11-12)
//
// Shows a bar at the bottom of the viewport telling visitors we can't receive
// email requests right now and to call the office instead. A bottom bar is used
// (rather than a top banner) because the site nav is `position: fixed; top: 0`,
// so a top banner would collide with the header.
//
// This notice has NO auto-expiry — nobody knows when the outage ends. To take it
// down, remove the <script src="/outage-notice.js"> tag from index.html (or set
// ENABLED to false below).
//
// Dismissal lasts for the browser session only, so a returning visitor sees it
// again while the outage is still on.

(function () {
  if (typeof document === 'undefined') return;

  var ENABLED = true;
  if (!ENABLED) return;

  var DISMISS_KEY = 'sit_outlook_outage_2026_11_12_dismissed';
  try {
    if (window.sessionStorage && window.sessionStorage.getItem(DISMISS_KEY) === '1') return;
  } catch (e) {
    // sessionStorage blocked/unavailable — fall through and show the notice.
  }

  function build() {
    if (document.getElementById('sit-outage-notice')) return;

    var bar = document.createElement('div');
    bar.id = 'sit-outage-notice';
    bar.setAttribute('role', 'alert');
    bar.setAttribute('aria-label', 'Service notice');
    var s = bar.style;
    s.position = 'fixed';
    s.left = '0';
    s.right = '0';
    s.bottom = '0';
    s.zIndex = '2147483000';
    s.background = '#B45309';
    s.color = '#ffffff';
    s.borderTop = '3px solid #FCD34D';
    s.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.35)';
    s.font = "500 16px/1.45 'Sora', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    s.padding = '14px 48px';
    s.display = 'flex';
    s.alignItems = 'center';
    s.justifyContent = 'center';
    s.gap = '8px';
    s.textAlign = 'center';
    s.flexWrap = 'wrap';

    var msg = document.createElement('span');
    msg.innerHTML =
      '<span aria-hidden="true" style="font-size:1.15em;">⚠️</span> ' +
      '<strong>Service notice:</strong> Microsoft Outlook is currently experiencing an outage, ' +
      'and we are unable to receive requests by email. For support, please call our office at ' +
      '<a href="tel:8594497878" style="color:#ffffff;font-weight:800;text-decoration:underline;white-space:nowrap;">859-449-7878</a>.';
    bar.appendChild(msg);

    // The home page's floating call-to-action sits bottom-right; lift it above the bar.
    var cta = document.querySelector('.sticky-cta');
    var ctaBottom = cta ? cta.style.bottom : '';
    function liftCta() {
      if (cta && bar.parentNode) cta.style.bottom = (bar.offsetHeight + 16) + 'px';
    }

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss service notice');
    close.innerHTML = '&times;';
    var cs = close.style;
    cs.position = 'absolute';
    cs.right = '10px';
    cs.top = '50%';
    cs.transform = 'translateY(-50%)';
    cs.background = 'transparent';
    cs.border = '0';
    cs.color = '#ffffff';
    cs.fontSize = '26px';
    cs.lineHeight = '1';
    cs.cursor = 'pointer';
    cs.padding = '2px 10px';
    cs.opacity = '0.9';
    close.addEventListener('click', function () {
      if (bar.parentNode) bar.parentNode.removeChild(bar);
      if (cta) cta.style.bottom = ctaBottom;
      window.removeEventListener('resize', liftCta);
      try {
        if (window.sessionStorage) window.sessionStorage.setItem(DISMISS_KEY, '1');
      } catch (e) {
        // Can't persist dismissal — no problem, it just reappears next load.
      }
    });
    bar.appendChild(close);

    document.body.appendChild(bar);
    liftCta();
    window.addEventListener('resize', liftCta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
