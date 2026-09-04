(function () {
  "use strict";

  function track(element, eventName) {
    var surface = element.closest("[data-commercial-geography-experience], [data-commercial-geography-surface]");
    var payload = JSON.stringify({
      event_name: eventName,
      profile_version: "public-commercial-geography:v1",
      context: {
        page_type: "public_commercial_geography",
        page_url: location.pathname,
        market: element.dataset.market || (surface && surface.dataset.market) || "san-francisco",
        property_type: element.dataset.propertyType || (surface && surface.dataset.propertyType) || "",
        geography_id: element.dataset.geographyId || (surface && surface.dataset.geographyId) || "",
        property_id: element.dataset.propertyId || "",
        source_surface: element.dataset.sourceSurface || "",
      },
      profile: { profile_version: "public-commercial-geography:v1" },
      attribution: { entry_page_type: "public_commercial_geography", landing_page: location.pathname },
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon("/api/analytics/search-profile", new Blob([payload], { type: "application/json" }))) return;
      fetch("/api/analytics/search-profile", { method:"POST", headers:{"content-type":"application/json"}, body:payload, keepalive:true });
    } catch (error) { /* Analytics never blocks navigation. */ }
  }

  function select(root, id, focus) {
    var tab = root.querySelector('[data-geography-id="' + CSS.escape(id) + '"][role="tab"]');
    var panel = root.querySelector('[data-geography-panel="' + CSS.escape(id) + '"]');
    if (!tab || !panel) return;
    root.querySelectorAll('[role="tab"]').forEach(function (item) { item.classList.toggle("is-selected", item === tab); item.setAttribute("aria-selected", item === tab ? "true" : "false"); });
    root.querySelectorAll("[data-geography-panel]").forEach(function (item) { item.hidden = item !== panel; });
    history.replaceState(null, "", "#" + id);
    if (focus) panel.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  document.querySelectorAll("[data-commercial-geography-experience]").forEach(function (root) {
    root.addEventListener("click", function (event) {
      var selectTarget = event.target.closest("[data-select-geography], [role=tab][data-geography-id]");
      if (!selectTarget) return;
      select(root, selectTarget.dataset.selectGeography || selectTarget.dataset.geographyId, Boolean(selectTarget.dataset.selectGeography));
    });
    var initial = location.hash.slice(1);
    if (initial) select(root, initial, false);
  });

  document.querySelectorAll('[data-commercial-geography-surface="sf_geography_route"]').forEach(function (surface) {
    track(surface, "commercial_geography_opened");
  });

  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-geography-event]");
    if (target) track(target, target.dataset.geographyEvent);
  });
}());
