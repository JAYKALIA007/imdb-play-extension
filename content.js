/**
 * IMDB Play Button — content script
 * Opens the title on streamimdb.ru when the Play button is clicked.
 */

function getTitleId() {
  const match = window.location.pathname.match(/\/title\/(tt\d+)/);
  return match ? match[1] : null;
}

function isTvSeries() {
  const ld = document.querySelector('script[type="application/ld+json"]');
  if (!ld) return false;
  try {
    const data = JSON.parse(ld.textContent);
    const type = (data["@type"] || "").toLowerCase();
    return type.includes("tvseries") || type.includes("tvepisode");
  } catch {
    return false;
  }
}

function buildWidget(titleId) {
  const isTV = isTvSeries();
  const streamUrl = isTV
    ? `https://streamimdb.ru/embed/tv/${titleId}`
    : `https://streamimdb.ru/embed/movie/${titleId}`;

  const btn = document.createElement("button");
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <span>Play ${isTV ? "Series" : "Movie"}</span>
  `;
  btn.style.cssText = `
    position: fixed;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f5c518;
    color: #000;
    border: none;
    border-radius: 6px;
    padding: 10px 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .3px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0,0,0,.45);
    transition: transform .15s, box-shadow .15s;
    white-space: nowrap;
  `;

  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "translateY(-50%) scale(1.05)";
    btn.style.boxShadow = "0 6px 20px rgba(0,0,0,.55)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translateY(-50%) scale(1)";
    btn.style.boxShadow = "0 4px 14px rgba(0,0,0,.45)";
  });

  btn.addEventListener("click", () => {
    window.open(streamUrl, "_blank");
    // Track click — fire and forget, won't affect the stream opening
    fetch("https://imdb-play-counter.jaykalia047.workers.dev/hit").catch(() => {});
  });

  document.body.appendChild(btn);
}

(function init() {
  const titleId = getTitleId();
  if (!titleId) return;

  if (document.querySelector('h1[data-testid="hero__pageTitle"]')) {
    buildWidget(titleId);
  } else {
    const observer = new MutationObserver(() => {
      if (document.querySelector('h1[data-testid="hero__pageTitle"]')) {
        observer.disconnect();
        setTimeout(() => buildWidget(titleId), 300);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
