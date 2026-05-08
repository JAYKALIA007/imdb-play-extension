/**
 * adblock.js — runs at document_start in MAIN world, in ALL frames
 *
 * Kills the three techniques streaming ad sites use:
 *  1. window.open() popups triggered by clicks anywhere on the page
 *  2. Invisible overlay divs that intercept clicks and redirect to ads
 *  3. window.location hijacks that navigate the tab/frame to an ad page
 *
 * Runs in every iframe too (all_frames: true in manifest) so ad code
 * inside nested player iframes is neutralised as well.
 */

(function () {

  // ── 1. Block window.open popups ──────────────────────────────────────────
  // Return a dummy window-like object so player code that checks the
  // return value doesn't crash, but the popup never actually opens.
  const _noop = () => ({ focus: () => {}, close: () => {}, closed: true });

  try {
    Object.defineProperty(window, 'open', {
      configurable: false,
      writable: false,
      value: _noop,
    });
  } catch {
    window.open = _noop; // fallback if defineProperty fails
  }


  // ── 2. Block window.location / location.href hijacks ─────────────────────
  // Allow same-host navigation but block anything that looks like an ad redirect.
  const ALLOWED_HOST = location.hostname;

  function isSafeUrl(url) {
    if (!url) return true;
    try {
      const u = new URL(url, location.href);
      // Allow same host, relative paths, about:, blob:, data: (for players)
      if (u.protocol === 'about:' || u.protocol === 'blob:' || u.protocol === 'data:') return true;
      return u.hostname === ALLOWED_HOST || u.hostname.endsWith('.' + ALLOWED_HOST);
    } catch {
      return true;
    }
  }

  try {
    const origAssign   = location.assign.bind(location);
    const origReplace  = location.replace.bind(location);
    location.assign  = (url) => { if (isSafeUrl(url)) origAssign(url);  };
    location.replace = (url) => { if (isSafeUrl(url)) origReplace(url); };

    const origPushState    = history.pushState.bind(history);
    const origReplaceState = history.replaceState.bind(history);
    history.pushState    = (s, t, url) => { if (!url || isSafeUrl(url)) origPushState(s, t, url); };
    history.replaceState = (s, t, url) => { if (!url || isSafeUrl(url)) origReplaceState(s, t, url); };
  } catch {
    // Cross-origin iframes may throw — that's fine, window.open block still applies
  }


  // ── 3. Remove transparent click-trap overlays ─────────────────────────────
  // These are large, invisible fixed/absolute divs placed over the player.
  // We either remove them or strip pointer-events so clicks pass through.

  const PLAYER_KEYWORDS = /player|video|vjs|jwplayer|plyr|embed/i;

  function isAdOverlay(el) {
    // Skip the video element and anything that looks like the real player
    if (el.matches('video, iframe, script, style, head, body, html')) return false;
    if (PLAYER_KEYWORDS.test(el.id + ' ' + el.className))            return false;

    const st  = window.getComputedStyle(el);
    const pos = st.position;
    if (pos !== 'fixed' && pos !== 'absolute') return false;

    const rect = el.getBoundingClientRect();
    const bigEnough =
      rect.width  > window.innerWidth  * 0.4 &&
      rect.height > window.innerHeight * 0.4;
    if (!bigEnough) return false;

    // Transparent or near-invisible = almost certainly a trap
    const opacity = parseFloat(st.opacity);
    const bg      = st.backgroundColor;
    const invisible =
      opacity < 0.05 ||
      bg === 'transparent' ||
      bg === 'rgba(0, 0, 0, 0)';

    return invisible;
  }

  function cleanOverlays() {
    document.querySelectorAll('*').forEach(el => {
      if (isAdOverlay(el)) {
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // Run once DOM is ready, then watch for dynamically injected overlays
  document.addEventListener('DOMContentLoaded', cleanOverlays);

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) {         // Element node
          if (isAdOverlay(node)) {
            node.style.setProperty('pointer-events', 'none', 'important');
            node.style.setProperty('display', 'none', 'important');
          }
        }
      }
    }
  });

  // Start observing as soon as <html> exists
  const startObserver = () =>
    observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.documentElement) {
    startObserver();
  } else {
    new MutationObserver((_, obs) => {
      if (document.documentElement) { startObserver(); obs.disconnect(); }
    }).observe(document, { childList: true });
  }

})();
