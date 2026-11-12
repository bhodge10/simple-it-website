// Notices posted from the Simple IT portal (Operations → Website Notices).
//
// Staff post a short message in the portal — an email outage, a phone problem,
// a weather closure — and this script shows it as a bar across the bottom of
// the site. Nothing here needs editing or deploying to post or remove one: the
// list is read from the portal on every page view (cached for about a minute).
//
// A bottom bar is used (rather than a top banner) because the site nav is
// `position: fixed; top: 0` on every page.
//
// If the portal cannot be reached the script shows nothing. Dismissing a notice
// lasts for the browser session only, so a returning visitor sees it again
// while it is still posted.

(function () {
  if (typeof document === 'undefined' || typeof fetch !== 'function') return;

  var ENDPOINT = 'https://portal.simple-it.us/api/public/website-notices';
  var DISMISS_PREFIX = 'sit_site_notice_dismissed_';
  var STYLES = {
    warning: { bg: '#B45309', edge: '#FCD34D', icon: '⚠️', lead: 'Service notice:' },
    info: { bg: '#0A4FBF', edge: '#00D4AA', icon: 'ℹ️', lead: 'Notice:' }
  };

  // "home_ticket" notices show on the home page and the submit-ticket page only.
  function isKeyPage() {
    var p = (window.location.pathname || '/').toLowerCase().replace(/\.html$/, '').replace(/\/+$/, '');
    return p === '' || p === '/index' || p === '/submit-ticket';
  }

  function isDismissed(id) {
    try {
      return !!window.sessionStorage && window.sessionStorage.getItem(DISMISS_PREFIX + id) === '1';
    } catch (e) {
      return false;
    }
  }

  function rememberDismissed(id) {
    try {
      if (window.sessionStorage) window.sessionStorage.setItem(DISMISS_PREFIX + id, '1');
    } catch (e) {
      // Cannot persist the dismissal — it just reappears on the next page.
    }
  }

  // The message is plain text from the portal and is only ever added as text
  // nodes — never as HTML. US phone numbers in it become tap-to-call links.
  var PHONE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
  function appendMessage(parent, text) {
    var last = 0;
    var m;
    PHONE.lastIndex = 0;
    while ((m = PHONE.exec(text)) !== null) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      var digits = m[0].replace(/\D/g, '');
      if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
      var a = document.createElement('a');
      a.href = 'tel:' + digits;
      a.textContent = m[0];
      a.style.color = '#ffffff';
      a.style.fontWeight = '800';
      a.style.textDecoration = 'underline';
      a.style.whiteSpace = 'nowrap';
      parent.appendChild(a);
      last = m.index + m[0].length;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function render(notices) {
    if (!notices.length || document.getElementById('sit-site-notices')) return;

    var wrap = document.createElement('div');
    wrap.id = 'sit-site-notices';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Service notices');
    var ws = wrap.style;
    ws.position = 'fixed';
    ws.left = '0';
    ws.right = '0';
    ws.bottom = '0';
    ws.zIndex = '2147483000';
    ws.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.35)';

    // Keep clear of anything else pinned to the bottom of the page: sit above a
    // hand-coded notice bar if one is showing, and lift the floating call-to-action.
    var cta = document.querySelector('.sticky-cta');
    var ctaBottom = cta ? cta.style.bottom : '';
    function place() {
      var other = document.getElementById('sit-outage-notice');
      var base = other ? other.offsetHeight : 0;
      ws.bottom = base + 'px';
      if (cta) cta.style.bottom = wrap.parentNode ? (base + wrap.offsetHeight + 16) + 'px' : ctaBottom;
    }

    notices.forEach(function (n) {
      var look = STYLES[n.style] || STYLES.warning;

      var bar = document.createElement('div');
      bar.setAttribute('role', n.style === 'info' ? 'status' : 'alert');
      var s = bar.style;
      s.position = 'relative';
      s.background = look.bg;
      s.color = '#ffffff';
      s.borderTop = '3px solid ' + look.edge;
      s.font = "500 16px/1.45 'Sora', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
      s.padding = '14px 48px';
      s.textAlign = 'center';
      s.overflowWrap = 'anywhere';

      var icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.style.fontSize = '1.15em';
      icon.textContent = look.icon + ' ';
      bar.appendChild(icon);

      var lead = document.createElement('strong');
      lead.textContent = look.lead + ' ';
      bar.appendChild(lead);

      var msg = document.createElement('span');
      appendMessage(msg, n.message);
      bar.appendChild(msg);

      var close = document.createElement('button');
      close.type = 'button';
      close.setAttribute('aria-label', 'Dismiss notice');
      close.textContent = '×';
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
        rememberDismissed(n.id);
        if (bar.parentNode) bar.parentNode.removeChild(bar);
        if (!wrap.firstChild) {
          if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
          window.removeEventListener('resize', place);
        }
        place();
      });
      bar.appendChild(close);

      wrap.appendChild(bar);
    });

    document.body.appendChild(wrap);
    place();
    window.addEventListener('resize', place);
  }

  function load() {
    fetch(ENDPOINT, { credentials: 'omit' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        var list = data && Array.isArray(data.notices) ? data.notices : [];
        var keyPage = isKeyPage();
        render(list.filter(function (n) {
          return n && typeof n.id === 'string' && typeof n.message === 'string' && n.message &&
            (n.pages !== 'home_ticket' || keyPage) && !isDismissed(n.id);
        }));
      })
      .catch(function () {
        // Portal unreachable — show nothing.
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
