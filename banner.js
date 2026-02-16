// Shared banner behavior across all pages.
// Tuning knobs are intentionally centralized here.
const BANNER_CONFIG = {
  // Starting banner height in pixels.
  maxHeightPx: 300,
  // Compact banner height as a scale of max height (0.25 = 25%).
  minScale: 0.5,
  // Scroll distance in pixels to reach compact size.
  shrinkDistancePx: 280,
  // Progress threshold to switch from full banner to half banner (0..1).
  switchAtProgress: 1
};

function initializeSiteBanner() {
  const banner = document.querySelector("[data-site-banner]");
  if (!banner) {
    return;
  }

  const minScale = Math.min(1, Math.max(0.05, BANNER_CONFIG.minScale));
  const switchAt = Math.min(1, Math.max(0, BANNER_CONFIG.switchAtProgress));
  const shrinkDistance = Math.max(1, BANNER_CONFIG.shrinkDistancePx);

  const root = document.documentElement;
  const maxHeight = BANNER_CONFIG.maxHeightPx;
  const minHeight = Math.round(maxHeight * minScale);
  let isTicking = false;

  const render = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const progress = Math.min(1, Math.max(0, scrollY / shrinkDistance));
    const currentScale = 1 - (1 - minScale) * progress;
    const currentHeight = Math.round(maxHeight * currentScale);
    const useHalfBanner = progress >= switchAt;

    root.style.setProperty("--banner-current-height", `${currentHeight}px`);
    banner.classList.toggle("is-condensed", progress > 0.08);
    banner.classList.toggle("use-half", useHalfBanner);
    isTicking = false;
  };

  const onViewportChange = () => {
    if (isTicking) {
      return;
    }
    isTicking = true;
    window.requestAnimationFrame(render);
  };

  root.style.setProperty("--banner-current-height", `${maxHeight}px`);
  root.style.setProperty("--banner-max-height", `${maxHeight}px`);
  root.style.setProperty("--banner-min-height", `${minHeight}px`);

  render();
  window.addEventListener("scroll", onViewportChange, { passive: true });
  window.addEventListener("resize", onViewportChange);
}

initializeSiteBanner();
