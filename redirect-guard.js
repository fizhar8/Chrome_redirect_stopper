(() => {
  const originalOpen = window.open;
  let recentClick = null;

  function isInteractive(element) {
    return Boolean(
      element.closest(
        "a[href], button, input, select, textarea, [role='button'], [role='link']",
      ),
    );
  }

  function isTransparentOverlay(element, x, y) {
    for (
      let current = element;
      current && current !== document.documentElement;
      current = current.parentElement
    ) {
      const style = window.getComputedStyle(current);
      const zIndex = Number.parseInt(style.zIndex, 10);
      if (
        (style.position !== "fixed" && style.position !== "absolute") ||
        style.pointerEvents === "none" ||
        !Number.isFinite(zIndex) ||
        zIndex < 10
      ) {
        continue;
      }

      const bounds = current.getBoundingClientRect();
      const viewportArea = window.innerWidth * window.innerHeight;
      const overlayArea = Math.max(0, bounds.width) * Math.max(0, bounds.height);
      const opacity = Number.parseFloat(style.opacity);
      const containsClick =
        x >= bounds.left &&
        x <= bounds.right &&
        y >= bounds.top &&
        y <= bounds.bottom;

      if (
        containsClick &&
        viewportArea > 0 &&
        overlayArea / viewportArea >= 0.45 &&
        Number.isFinite(opacity) &&
        opacity <= 0.05
      ) {
        return true;
      }
    }

    return false;
  }

  document.addEventListener(
    "click",
    (event) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;

      if (isTransparentOverlay(event.target, event.clientX, event.clientY)) {
        recentClick = null;
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      const click = { target: event.target };
      recentClick = click;
      setTimeout(() => {
        if (recentClick === click) recentClick = null;
      }, 0);
    },
    true,
  );

  window.open = function (url, target, features) {
    const click = recentClick;
    recentClick = null;
    if (!click) return null;

    const anchor = click.target.closest("a[href]");
    if (anchor) {
      try {
        if (new URL(String(url), location.href).href !== anchor.href) return null;
      } catch {
        return null;
      }
    } else if (!isInteractive(click.target)) {
      return null;
    }

    return originalOpen.call(window, url, target, features);
  };
})();
