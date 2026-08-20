(function locationBriefV2Browser(global) {
  "use strict";
  function initialize(rootDocument) {
    const doc = rootDocument || global.document;
    if (!doc) return;
    doc.querySelectorAll("[data-comparison-focus-root],[data-location-focus-root]").forEach((root) => {
      if (root.dataset.focusBound === "true") return;
      root.dataset.focusBound = "true";
      const panels = Array.from(root.querySelectorAll("[data-focus-panel]"));
      const buttons = Array.from(root.querySelectorAll("[data-focus-button]"));
      const focus = (name) => {
        panels.forEach((panel) => { panel.hidden = panel.dataset.focusPanel !== name; });
        buttons.forEach((button) => {
          const active = button.dataset.focusButton === name;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", String(active));
        });
      };
      buttons.forEach((button) => button.addEventListener("click", () => focus(button.dataset.focusButton)));
      const initial = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
      if (initial) focus(initial.dataset.focusButton);
    });
    doc.querySelectorAll("[data-focus-alternative]").forEach((button) => {
      if (button.dataset.focusBound === "true") return;
      button.dataset.focusBound = "true";
      button.addEventListener("click", () => {
        const root = doc.querySelector("[data-comparison-focus-root]");
        const target = root && root.querySelector('[data-focus-button="alternative"]');
        if (target) { target.click(); root.scrollIntoView({ behavior: "smooth", block: "start" }); }
      });
    });
  }
  global.RofoLocationBriefV2 = { initialize };
  if (global.document?.readyState === "loading") global.document.addEventListener("DOMContentLoaded", () => initialize(global.document), { once: true });
  else initialize(global.document);
})(window);
