(function() {
  const properties = [
    { id: "56th", name: "1002 S 56th Avenue", district: "Southwest Phoenix Industrial", group: "southwest", format: "Industrial building record", why: "An address to investigate if Southwest Phoenix is your starting area for warehouse or distribution work.", known: "Address, Phoenix municipality and Industrial classification are retained in Rofo\u2019s reviewed building records.", gap: "No independently verified building size, loading, power, yard rights or current offer of space.", question: "Can the available space handle your deliveries, storage and vehicle movements?" },
    { id: "washington", name: "3241 E Washington Street", district: "Airport / South Central Industrial", group: "airport", format: "Industrial building record", why: "An address to investigate when central Phoenix customers or operations are important to your search.", known: "Address, Phoenix municipality and Industrial classification are retained in Rofo\u2019s reviewed building records.", gap: "Exact space size, loading, permitted activities and current offer of space have not been verified.", question: "Would the exact space and access work for your daily service routes and deliveries?" },
    { id: "cotton", name: "4625 E Cotton Center Boulevard", district: "Airport / South Central Industrial", group: "airport", format: "Reviewed office + production example", why: "A place to investigate if you need office work and operational work together, rather than only warehouse storage.", known: "Rofo\u2019s reviewed guide identifies Cotton Flex Center at this address as an office-production example in Cotton Center.", gap: "The office-to-work-area split, usable space size, power, loading and current offer of space need independent confirmation.", question: "Is there a space with the right balance of office and work area for your business?" }
  ];
  const buildingEvidence = Object.fromEntries(properties.map((p) => [p.id, { type: p.id === "cotton" ? "Office + work-area reference" : "Industrial address reference", facts: [["Reviewed identity", p.name], ["Reviewed district", p.district], ["Property classification", "Industrial / Flex reference; specifications not verified"]], reason: p.why, need: "Use this reviewed address as a starting point for investigation. Its location and broad classification do not establish that the building supports your activities.", confirm: [p.question, "Confirm the exact layout, permitted activities, loading, electrical supply and any outside-storage rights.", "Confirm whether any space is offered, its condition, total costs and occupancy timing."], source: "Rofo reviewed public building record", url: "/commercial-real-estate/building/AZ/phoenix/" + { "56th": "1002-s-56th-ave", washington: "3241-e-washington-st", cotton: "4625-e-cotton-center-blvd" }[p.id] + "/", date: "Reviewed foundation: 3 September 2026.", basis: p.known, scope: "Representative reference only. No available area, current rent or building capability is asserted.", placement: "Retained public representative assignment in Rofo\u2019s reviewed Phoenix foundation." }]));
  const app = document.querySelector("#phoenix-industrial-app");
  const areas = {
    southwest: { name: "Southwest Phoenix", context: "Southwest Phoenix Industrial", why: "A starting area for warehouse, distribution and west-side service businesses.", tradeoff: "It covers a large area, so check each address against your customers, staff and deliveries." },
    airport: { name: "Airport / South Central", context: "Airport / South Central Industrial", why: "Explore this mix of service, warehouse and office-with-production settings when central Phoenix matters.", tradeoff: "Being near the airport does not prove good truck access or suitable loading at a building." },
    north: { name: "North Phoenix", context: "North Phoenix Advanced Operations", why: "Explore Deer Valley and the northern semiconductor area for technical production and aerospace-support work.", tradeoff: "These are separate locations, and nearby industry does not establish a building\u2019s equipment or capabilities." }
  };
  const outcomes = {
    warehouse: { title: "Start with Southwest Phoenix", area: "southwest", reason: "Its warehouse and distribution setting makes it a useful starting point for storage and deliveries.", tradeoff: "It covers a large area, so the exact address still needs to work for your customers, staff and delivery routes." },
    technical: { title: "Explore North Phoenix", area: "north", reason: "Deer Valley and the northern semiconductor area are worth exploring for technical production and aerospace-support work.", tradeoff: "They are separate locations, and a nearby factory does not mean another building can support your equipment." },
    mixed: { title: "Two areas are worth exploring", reason: "Cotton Center and parts of Deer Valley both have settings that combine office and operational work.", tradeoff: "The better starting point depends on where your staff, customers and suppliers are; neither area proves a building fits." },
    service: { title: "Your service area changes where to start", reason: "Airport / South Central is worth exploring for central Phoenix service work, while Southwest Phoenix may matter for west-side routes.", tradeoff: "We need to know where your customers are before suggesting one over the other." },
    unsure: { title: "Let\u2019s narrow it down together", reason: "Phoenix has different settings for storage, service work and technical production.", tradeoff: "Without knowing your activities and the people you need to reach, there isn\u2019t a useful single area to suggest." }
  };
  const useLabels = { warehouse: "Store goods and make deliveries", service: "Run a service business with vehicles or supplies", mixed: "Combine office work with a workshop or storage", technical: "Do technical or aerospace-related work", unsure: "Something else / not sure" };
  function readSession(key, fallback) {
    try {
      return JSON.parse(sessionStorage.getItem(key) || "null") || fallback;
    } catch {
      return fallback;
    }
  }
  let journey = readSession("rofoPhoenixIndustrialJourneyV1", {});
  function rememberJourney() {
    try {
      sessionStorage.setItem("rofoPhoenixIndustrialJourneyV1", JSON.stringify(journey));
    } catch {
    }
  }
  function interviewUrl(property) {
    const q = new URLSearchParams({ journey: "new", marketId: "phoenix", city: "Phoenix", state: "AZ", propertyType: "industrial_flex", source: "space_type", sourcePath: "/commercial-real-estate/AZ/phoenix/industrial-space/", phoenixJourney: "1" });
    if (journey.use) q.set("phoenixUse", journey.use);
    const selected = property?.group || journey.area;
    if (selected) {
      q.set("districtId", { southwest: "southwest-phoenix-industrial", airport: "airport-south-central-industrial", north: "north-phoenix-advanced-operations" }[selected]);
      q.set("district", areas[selected].name);
    }
    if (property) q.set("propertyId", { "56th": "1002-s-56th-ave", washington: "3241-e-washington-st", cotton: "4625-e-cotton-center-blvd" }[property.id]);
    return "/location-requirement/?" + q.toString();
  }
  function home() {
    app.innerHTML = `<section class="focus"><div class="eyebrow">Rofo \xB7 Business space in Phoenix</div><h1>Where should your business look in Phoenix?</h1><p class="lead">What will you do in the space?</p><div class="choices" aria-label="Choose your main activity"><button class="choice" onclick="location.hash='start/warehouse'">Store goods and make deliveries <span aria-hidden="true">\u2192</span></button><button class="choice" onclick="location.hash='start/service'">Run a service business with vehicles or supplies <span aria-hidden="true">\u2192</span></button><button class="choice" onclick="location.hash='start/mixed'">Combine office work with a workshop or storage <span aria-hidden="true">\u2192</span></button><button class="choice" onclick="location.hash='start/technical'">Do technical or aerospace-related work <span aria-hidden="true">\u2192</span></button><button class="choice" onclick="location.hash='start/unsure'">Something else / not sure <span aria-hidden="true">\u2192</span></button></div><p class="quiet">Prefer to browse? <a href="#areas">Explore Phoenix areas</a></p><p class="small">Get a starting point before sharing any contact details.</p></section>`;
  }
  function areaMap(id) {
    return `<figure class="area-map"><picture><source media="(max-width:760px)" srcset="/assets/phoenix-industrial-maps/${id}-mobile.svg"><img src="/assets/phoenix-industrial-maps/${id}-desktop.svg" alt="${areas[id].name}: approximate search area, orientation roads and numbered property address points matching the list below." width="760" height="430"></picture><figcaption><div class="map-key"><span><i class="map-dash"></i>Approximate search area</span><span><i class="map-dot">1</i>Property address point</span></div>Dashed area is for orientation, not an official boundary. Pins locate the property address, not a suite entrance.<details><summary>Map sources and accuracy</summary><p>Road geometry: <a href="https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation/MapServer" target="_blank" rel="noopener">U.S. Census Bureau TIGERweb</a> \u2014 <a href="https://www.census.gov/about/policies/open-gov.html" target="_blank" rel="noopener">open data for reuse</a>. Property and landmark points: <a href="https://gis.maricopa.gov/arcgis/rest/services/Geocode/MaricopaCountyGeocodeService/GeocodeServer" target="_blank" rel="noopener">Maricopa County GIS</a>, PointAddress matches, checked 16 Oct 2026. No point is a survey or access guarantee. Shading is Rofo\u2019s approximate editorial orientation envelope, not authoritative district geometry. <a href="/assets/phoenix-industrial-maps/map-provenance.json" target="_blank">Coordinates and source record</a>.</p></details></figcaption></figure>`;
  }
  function exampleRows(id) {
    const ps = properties.filter((p) => p.group === id);
    return ps.length ? `<div class="area-list">${ps.map((p, i) => `<article class="property-row"><span class="status">Example only \xB7 availability unconfirmed</span><p class="eyebrow" style="margin-top:18px">${buildingEvidence[p.id].type}</p><h2><span class="property-number">${i + 1}</span>${p.name}</h2><p>${buildingEvidence[p.id].reason}</p>${i === 0 ? `<a class="button" href="#property/${p.id}">Explore this property example \u2192</a>` : `<a href="#property/${p.id}">See what is known \u2192</a>`}</article>`).join("")}</div>` : '<p class="muted">No approved property example is shown here yet. Nearby technical industries are not evidence that an individual building can support your work.</p>';
  }
  function deeperArea(id) {
    return `<details><summary>More about ${areas[id].name}</summary><p>${id === "southwest" ? "This reviewed west-side employment area includes varied warehouse, distribution and service-industrial settings. It is not one uniform business park." : id === "airport" ? "Central warehouse and service settings sit alongside Cotton Center office-production examples. Different buildings support different activities." : "Deer Valley and the northern semiconductor area are distinct employment settings. Compare the exact location before choosing."}</p><p>Industrial means space used for storage, deliveries, repairs or making products. Flex usually combines office space with a work area or warehouse. Neither label proves your activity is allowed.</p><a href="#evidence">District sources and limits</a></details>`;
  }
  function start(id) {
    journey.use = id;
    rememberJourney();
    const o = outcomes[id] || outcomes.unsure;
    if (o.area) {
      area(o.area, o);
      return;
    }
    let action = id === "mixed" ? '<a class="button" href="#compare/mixed">Compare these two areas \u2192</a>' : id === "service" ? '<a class="button" href="#clarify/service">Choose my service area \u2192</a>' : '<a class="button" href="#areas">Explore the three areas \u2192</a>';
    app.innerHTML = `<section class="focus"><a class="back" href="#home">\u2190 Change my answer</a><h1>${o.title}</h1><p class="lead">${o.reason}</p><p class="lead muted">${o.tradeoff}</p><div class="actions">${action}</div><p class="quiet"><a href="#areas">Compare other Phoenix areas</a></p><p class="demo-label">Preliminary area guidance \xB7 based on reviewed Phoenix district context.</p></section>`;
  }
  function clarify() {
    app.innerHTML = `<section class="focus"><a class="back" href="#start/service">\u2190 Back</a><h1>Where are most of your customers or daily stops?</h1><p class="lead">This helps choose a starting area. The exact address and routes still matter.</p><div class="choices"><button class="choice" onclick="location.hash='area/airport'">Mostly central Phoenix \u2192</button><button class="choice" onclick="location.hash='area/southwest'">Mostly west Phoenix \u2192</button><button class="choice" onclick="location.hash='compare/service'">Spread out / not sure \u2192</button></div><p class="small">Preliminary area guidance. No travel times or property fit have been checked.</p></section>`;
  }
  let selectedCityArea = [journey.citySelection, journey.area, "southwest"].find(id => Object.hasOwn(areas, id));
  const cityDescriptions = { southwest: "A starting area for warehouse, distribution and west-side service businesses.", airport: "Central Phoenix settings for service businesses, warehouses and office-with-work-area searches.", north: "Two separate settings to explore for technical production and aerospace-support work." };
  function selectPhoenixIndustrialArea(id, fromMap = false) {
    if (!areas[id]) return;
    selectedCityArea = id;
    journey.citySelection = id;
    rememberJourney();
    document.querySelectorAll("[data-area]").forEach((e) => {
      const chosen = e.dataset.area === id;
      e.setAttribute("aria-pressed", String(chosen));
      e.classList.toggle("is-selected", chosen);
    });
    const panel = document.querySelector("#city-selected");
    if (panel) {
      panel.innerHTML = `<h2>${areas[id].name}</h2><p>${cityDescriptions[id]}</p><a class="button" href="#area/${id}">Explore this area \u2192</a>`;
      if (fromMap && matchMedia("(max-width:760px)").matches) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
  async function loadCityMap() {
    const target = document.querySelector("#city-map");
    if (!target) return;
    try {
      let response = await fetch(`/assets/phoenix-industrial-maps/city-${matchMedia("(max-width:760px)").matches ? "mobile" : "desktop"}.svg`);
      if (!response.ok) throw Error("map unavailable");
      const markup = await response.text();
      if (!target.isConnected) return;
      target.innerHTML = markup;
      selectPhoenixIndustrialArea(selectedCityArea);
    } catch {
      if (target.isConnected) target.innerHTML = '<p class="small">The map could not load. Choose an area from the text list.</p>';
    }
  }
  function cityExplorer() {
    app.innerHTML = `<section class="city-view"><a class="back" href="#home">\u2190 Start with my business</a><h1>Explore Phoenix industrial areas</h1><p class="lead">Choose an area on the map or in the list.</p><div class="city-explorer"><div class="city-canvas"><div id="city-map"><p class="small">Loading map\u2026 The text list is available below.</p></div><p class="small">Shading shows approximate search areas, not district boundaries.</p></div><div class="city-sidebar"><section id="city-selected" class="selected-panel" aria-live="polite" aria-atomic="true" aria-label="Selected area"></section><div class="text-picker" role="group" aria-label="Choose a Phoenix area using text"><p class="small">Or choose from the list</p>${Object.keys(areas).map((id) => `<button data-area="${id}" aria-pressed="false" onclick="selectPhoenixIndustrialArea('${id}')">${areas[id].name}</button>`).join("")}</div></div></div><details><summary>Map sources and coverage</summary><p>These are three reviewed industrial search contexts, not complete Phoenix coverage. Unshaded places may be unreviewed. Boundaries and overlaps have not been established; the soft focus areas do not settle either.</p><p>Roads: <a href="https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation/MapServer" target="_blank" rel="noopener">U.S. Census Bureau TIGERweb</a> \u2014 <a href="https://www.census.gov/about/policies/open-gov.html" target="_blank" rel="noopener">open geographic data for reuse</a>. Landmark points: <a href="https://gis.maricopa.gov/arcgis/rest/services/Geocode/MaricopaCountyGeocodeService/GeocodeServer" target="_blank" rel="noopener">Maricopa County GIS</a>. Checked 16 Oct 2026.</p><p>Rofo\u2019s reviewed contexts support the area descriptions, not precise boundary polygons. Existing orientation extents are reused only as soft location cues. North Phoenix deliberately appears in two separate locations. These are not zoning boundaries or a claim of complete municipality coverage. No gaps or overlaps have been inferred from polygon containment.</p><a href="/assets/phoenix-industrial-maps/geography-records.json" target="_blank">Shared geographic records and source references \u2192</a></details></section>`;
    selectPhoenixIndustrialArea(selectedCityArea);
    loadCityMap();
  }
  matchMedia("(max-width:760px)").addEventListener("change", () => {
    if (document.querySelector("#city-map")) loadCityMap();
  });
  function areaList(kind) {
    if (!kind) {
      cityExplorer();
      return;
    }
    let ids = kind === "mixed" ? ["airport", "north"] : kind === "service" ? ["airport", "southwest"] : Object.keys(areas);
    app.innerHTML = `<section class="focus"><a class="back" href="#home">\u2190 Start with my business</a><h1>${kind === "mixed" ? "Compare office + work-area settings" : kind === "service" ? "Keep both starting areas open" : "Explore Phoenix areas"}</h1><p class="lead">${kind === "mixed" ? "Cotton Center is part of Airport / South Central. Deer Valley is part of North Phoenix." : kind === "service" ? "Your daily routes may favor different parts of the city. Explore the differences before choosing." : "Choose an area to learn what makes it different."}</p><div class="area-list">${ids.map((id) => `<article><h2>${areas[id].name}</h2><p>${areas[id].why}</p><p class="muted">${areas[id].tradeoff}</p><a href="#area/${id}">Explore this area \u2192</a></article>`).join("")}</div><p class="small">Reviewed district context, not a ranking. <a href="#evidence">Sources and limits</a></p></section>`;
  }
  function area(id, outcome) {
    if (!Object.hasOwn(areas, id)) {
      history.replaceState(null, "", "#areas");
      activeDemoRoute = "#areas";
      cityExplorer(); return;
    }
    journey.area = id;
    journey.areaRoute = location.hash;
    journey.citySelection = id;
    selectedCityArea = id;
    rememberJourney();
    const a = areas[id] || areas.southwest;
    app.innerHTML = `<section class="focus"><a class="back" href="#home">\u2190 Change my answer</a><h1>${outcome ? outcome.title : a.name}</h1><p class="lead">${outcome ? outcome.reason : a.why}</p><p class="lead muted">${outcome ? outcome.tradeoff : a.tradeoff}</p><p class="small">Preliminary area guidance. Your business needs still need the full interview.</p>${areaMap(id)}<p class="quiet"><a href="#areas">Compare other Phoenix areas</a></p>${deeperArea(id)}<div class="divider"></div><h2>${id === "north" ? "Before choosing a property" : "See what a property here can tell you"}</h2>${exampleRows(id)}${id === "north" ? `<div class="actions"><a class="button" href="${interviewUrl()}">Build my Location Brief \u2192</a></div><p class="small">Your Brief is saved after the remaining questions. No request is sent by creating it.</p>` : ""}<p class="demo-label">Preliminary area guidance. Property facts are source-reported; this is not a personal fit assessment.</p><a class="small" href="#evidence">Sources and property limits</a></section>`;
  }
  function propertyList(id) {
    area(id);
  }
  function detail(id) {
    let p = properties.find((x) => x.id === id) || properties[2], e = buildingEvidence[p.id];
    app.innerHTML = `<section class="focus"><a class="back" href="${journey.area === p.group && journey.areaRoute ? journey.areaRoute : "#area/" + p.group}">\u2190 ${areas[p.group].name} examples</a><p><span class="status">Representative example \xB7 availability unconfirmed</span></p><p class="eyebrow">${e.type}</p><h1>${p.name}</h1><dl class="facts">${e.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl><p class="small">${e.scope} <a href="#source/${p.id}">Source and dates \u2192</a></p><h2>Why investigate it?</h2><p>${e.need}</p><h2>What could rule it out?</h2><ul class="checklist">${e.confirm.map((q) => `<li>${q}</li>`).join("")}</ul><details class="property-location"><summary>Locate this property</summary><picture><source media="(max-width:760px)" srcset="/assets/phoenix-industrial-maps/property-${p.id}-mobile.svg"><img src="/assets/phoenix-industrial-maps/property-${p.id}-desktop.svg" alt="Property address point on Census road geometry; not a suite entrance." loading="lazy"></picture><p class="small">Property address point from Maricopa County GIS. Roads: U.S. Census Bureau. No parcel or entrance location is implied. <a href="/assets/phoenix-industrial-maps/geography-records.json" target="_blank">Map sources</a>.</p></details><details><summary>What do the building terms mean?</summary><p>A truck-height loading door lets goods move between the raised truck bed and the building. A vehicle-height entrance is at ground level. Usable height is the space below beams or other overhead obstructions; it is not a guarantee of rack capacity.</p><p>Flex usually means offices combined with warehouse or work areas. Your actual suite may have a different layout, and activities still need permission.</p></details><div class="actions"><a class="button" href="${interviewUrl(p)}">Build my Location Brief \u2192</a></div><p class="small">Answer the remaining business questions to create and save your Location Brief. The recommendation engine needs more than this first choice. Creating a Brief does not contact anyone or confirm availability.</p><p class="quiet"><a href="#source/${p.id}">Evidence, dates and limitations</a></p></section>`;
  }
  function sourcePage(id) {
    let p = properties.find((x) => x.id === id) || properties[0], e = buildingEvidence[p.id];
    app.innerHTML = `<section class="focus"><a class="back" href="#property/${p.id}">\u2190 Property example</a><h1>What supports this example?</h1><h2>${p.name}</h2><p><a href="${e.url}" ${e.url.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${e.source}</a></p><p>${e.date}</p><p>${e.basis}</p><p>${e.scope}</p><h3>District relationship</h3><p>${e.placement}</p><h3>Reuse</h3><p>This example reuses only identity and broad context already published in Rofo\u2019s reviewed building records, with original decision guidance. No listing description, photography, floor plan, logo or newly researched building specification is reproduced.</p><h3>Availability</h3><p>No current offering is confirmed. A source being online is not evidence that a space is still offered. Verify exact space and timing directly before relying on it.</p><a href="#evidence">Full property evidence review \u2192</a></section>`;
  }
  function evidence() {
    app.innerHTML = `<section class="focus"><a class="back" href="#home">\u2190 Start again</a><h1>What is known, and what is not?</h1><p>The three operating areas and retained property references come from Rofo\u2019s reviewed Phoenix foundation, reviewed 3 September 2026. First-choice guidance is preliminary. The existing recommendation interview collects further information before a personalized Location Brief is created.</p><p>Property references establish identity and broad context, not available space, permitted activities or physical capabilities. Loading, power, layout, condition, costs and current offerings need confirmation.</p><p>No listing photographs, floor plans, broker descriptions or unresolved property specifications are reproduced.</p><p>Maps use U.S. Census Bureau open road geometry and Maricopa County property address points. Shading is approximate orientation, not district boundaries; no complete city coverage or resolved overlap is implied.</p><a href="#areas">Explore Phoenix industrial areas \u2192</a></section>`;
  }
  let activeDemoRoute = null;
  const demoScroll = {};
  function render() {
    if (activeDemoRoute) demoScroll[activeDemoRoute] = window.scrollY;
    activeDemoRoute = location.hash || "#home";
    let [route, id] = (location.hash.slice(1) || "home").split("/");
    if (route === "source") sourcePage(id);
    else if (route === "start") start(id);
    else if (route === "clarify") clarify();
    else if (route === "areas") areaList();
    else if (route === "compare") areaList(id);
    else if (route === "area") area(id);
    else if (route === "properties") propertyList(id);
    else if (route === "property") detail(id);
    else if (route === "evidence") evidence();
    else home();
    document.querySelectorAll(".choices button").forEach((b) => {
      const selected = journey.use && b.textContent.trim().startsWith(useLabels[journey.use]);
      b.setAttribute("aria-pressed", String(Boolean(selected)));
      b.classList.toggle("selected", Boolean(selected));
    });
    const heading = app.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    window.scrollTo(0, demoScroll[activeDemoRoute] || 0);
    document.title = "Rofo \xB7 " + ({ property: "Property example", evidence: "Evidence" }[route] || "Find your Phoenix starting point");
  }
  window.selectPhoenixIndustrialArea = selectPhoenixIndustrialArea;
  window.addEventListener("hashchange", render);
  render();
})();
