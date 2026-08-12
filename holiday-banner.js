// Holiday closure notice for simple-it.us
//
// Shows a dismissible bar at the bottom of the viewport announcing the
// Independence Day closure. A bottom bar is used (rather than a top banner)
// because the site nav is `position: fixed; top: 0` on every page, so a top
// banner would collide with the header differently on each layout.
//
// Auto-expires: after the holiday window the script renders nothing, so it is
// safe to leave the file and <script> tags in place and remove them at leisure.
// Once a visitor dismisses it, it stays dismissed for that browser.

(function () {
  if (typeof document === 'undefined') return;

  // Stop showing once the holiday has passed. Month is 0-indexed: 6 = July.
  // Shows through July 4, 2026; hidden from midnight July 5 onward (local time).
  var HIDE_AFTER = new Date(2026, 6, 5, 0, 0, 0);
  if (new Date() >= HIDE_AFTER) return;

  var DISMISS_KEY = 'sit_holiday_july4_2026_dismissed';
  try {
    if (window.localStorage && window.localStorage.getItem(DISMISS_KEY) === '1') return;
  } catch (e) {
    // localStorage blocked/unavailable — fall through and show the notice.
  }

  function build() {
    if (document.getElementById('sit-holiday-banner')) return;

    var bar = document.createElement('div');
    bar.id = 'sit-holiday-banner';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Holiday hours notice');
    var s = bar.style;
    s.position = 'fixed';
    s.left = '0';
    s.right = '0';
    s.bottom = '0';
    s.zIndex = '2147483000';
    s.background = 'linear-gradient(90deg, #0A0E27 0%, #0066FF 100%)';
    s.color = '#ffffff';
    s.borderTop = '3px solid #00D4AA';
    s.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.35)';
    s.font = "500 15px/1.45 'Sora', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    s.padding = '12px 48px';
    s.display = 'flex';
    s.alignItems = 'center';
    s.justifyContent = 'center';
    s.gap = '8px';
    s.textAlign = 'center';
    s.flexWrap = 'wrap';

    var msg = document.createElement('span');
    msg.innerHTML =
      '<span aria-hidden="true" style="font-size:1.15em;">🎆</span> ' +
      '<strong>Holiday Hours:</strong> Simple IT will be closed ' +
      '<strong>Friday, July 3rd</strong> in observance of Independence Day. ' +
      'Need urgent help? Call ' +
      '<a href="tel:8594497878" style="color:#00D4AA;font-weight:700;text-decoration:underline;white-space:nowrap;">859-449-7878</a>.';
    bar.appendChild(msg);

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss holiday notice');
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
    cs.opacity = '0.85';
    close.addEventListener('click', function () {
      if (bar.parentNode) bar.parentNode.removeChild(bar);
      try {
        if (window.localStorage) window.localStorage.setItem(DISMISS_KEY, '1');
      } catch (e) {
        // Can't persist dismissal — no problem, it just reappears next load.
      }
    });
    bar.appendChild(close);

    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
