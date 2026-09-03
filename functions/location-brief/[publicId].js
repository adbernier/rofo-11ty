import {
  escapeHtml,
  getLocationBrief,
  htmlResponse,
  locationSummary,
  locationIntentLabel,
  sizeSummary,
  spaceSummary,
  trackLocationBriefEvent,
} from "../api/location-brief/_shared.js";
import { getBriefBundle as getLocationBriefV2Bundle, ownsBrief as ownsLocationBriefV2, privateHtml } from "../api/location-brief-v2/_shared.js";
import { renderLocationBriefV2Page } from "../operator/location-brief-v2/[publicId].js";
import { buildProjectSnapshotFromBrief, marketDisplayName } from "../_shared/project-snapshot.js";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  });
}

function statusLabel(status, investigation) {
  if (status === "submitted" && investigation?.investigationIntent) return "Awaiting Expert Review";
  if (status === "submitted") return "Search Profile Ready";
  if (status === "draft") return "Draft";
  return String(status || "Submitted")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function list(items, empty = "None provided.") {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!values.length) return `<p class="location-brief-muted">${escapeHtml(empty)}</p>`;
  return `<ul class="location-brief-list">${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function descriptionList(rows) {
  const filtered = rows.filter(([, value]) => value);
  if (!filtered.length) return "";
  return `
    <dl class="location-brief-details">
      ${filtered.map(([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${value}</dd>
        </div>
      `).join("")}
    </dl>
  `;
}

function supportedMarketEntries(brief) {
  const marketPath = brief.marketPath || {};
  const recommended = Array.isArray(marketPath.recommendedPath) ? marketPath.recommendedPath : [];
  const compareWith = Array.isArray(marketPath.compareWith) ? marketPath.compareWith : [];
  const seen = new Set();
  const entries = [];
  recommended.forEach((item, index) => {
    if (!item || !item.label) return;
    const key = String(item.slug || item.label).toLowerCase();
    seen.add(key);
    entries.push({
      ...item,
      substantive: Boolean(item.summary || item.fitLabel || item.strengths?.length || item.tradeoffs?.length || item.bestFor?.length),
      roleLabel: index === 0 ? "Recommended starting point" : "Also worth comparing",
      reason: item.summary || item.reason || "Worth evaluating before narrowing the search.",
    });
  });
  compareWith.forEach((item) => {
    if (!item || !item.label) return;
    const key = String(item.slug || item.label).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({
      ...item,
      substantive: Boolean(item.reason || item.summary || item.strengths?.length || item.tradeoffs?.length),
      roleLabel: "Also worth comparing",
      reason: item.reason || item.summary || "Worth comparing before narrowing the search.",
    });
  });

  return entries.filter((item) => item.substantive);
}

function renderMarketPath(entries) {
  return entries.map((item) => `
    <article class="location-brief-path-card">
      <span>${escapeHtml(item.roleLabel)}</span>
      <h3>${item.path ? `<a href="${escapeHtml(item.path)}">${escapeHtml(item.label)}</a>` : escapeHtml(item.label)}</h3>
      ${item.fitLabel ? `<strong>${escapeHtml(item.fitLabel)}</strong>` : ""}
      <p>${escapeHtml(item.reason)}</p>
      ${Array.isArray(item.strengths) && item.strengths.length ? list(item.strengths.slice(0, 4), "No supporting notes recorded.") : ""}
    </article>
  `).join("");
}

function renderWhyMarkets(primary) {
  return `
    <p>${escapeHtml(primary.summary || `${primary.label} is the first location to review against this profile.`)}</p>
    <div class="location-brief-two-col">
      <div>
        <h4>Best suited for</h4>
        ${list(primary.bestFor)}
      </div>
      <div>
        <h4>Tradeoffs</h4>
        ${list(primary.tradeoffs)}
      </div>
    </div>
  `;
}

function investigationScopeLabels(investigation) {
  const scope = investigation && investigation.investigationScope || {};
  const labels = {
    currentAvailability: "Current availability",
    futureAvailability: "Future or upcoming availability",
    comparableBuildings: "Comparable buildings",
    leasingActivity: "Recent leasing activity or comps",
    marketInsight: "Market conditions and tenant considerations",
    brokerGuidance: "Broker guidance when available",
  };
  return Object.keys(labels).filter((key) => scope[key]).map((key) => labels[key]);
}

function brokerPreferenceLabel(value) {
  const labels = {
    research_first: "Research first; contact me with findings",
    include_local_broker: "Include local broker guidance when available",
    already_working_with_broker: "I am already working with a broker",
    not_sure: "Not sure yet",
  };
  return labels[value] || value || "";
}

function renderInvestigation(brief) {
  const investigation = brief.liveMarketInvestigation;
  if (!investigation || !investigation.investigationIntent) return "";
  const buildings = Array.isArray(investigation.representativeBuildings)
    ? investigation.representativeBuildings.filter((building) => building && building.selected !== false)
    : [];
  const scope = investigationScopeLabels(investigation);
  const intent = brief.searchProfile && brief.searchProfile.locationIntent;
  const compareCopy = intent === "compare" ? `Rofo will investigate ${investigation.city || "the starting market"} alongside relevant nearby markets rather than limiting the search to the city boundary.` : "";
  return `
      <section class="location-brief-card">
        <h2>What Rofo will investigate</h2>
        ${compareCopy ? `<p>${escapeHtml(compareCopy)}</p>` : ""}
        ${descriptionList([
          ["Investigation scope", scope.length ? list(scope) : ""],
          ["Reference properties", buildings.length ? list(buildings.map((building) => building.name)) : ""],
          ["Research approach", escapeHtml(brokerPreferenceLabel(investigation.brokerPreference))],
        ])}
        ${investigation.additionalNotes ? `<p class="location-brief-note">${escapeHtml(investigation.additionalNotes)}</p>` : ""}
      </section>
  `;
}

function substantiveQuestions(brief) {
  const questions = brief.marketPath && Array.isArray(brief.marketPath.questionsToValidate) ? brief.marketPath.questionsToValidate : [];
  return questions.filter((question) => question && !/confirm commute,? timing,? operating constraints,? and building requirements/i.test(question));
}

function representativeBuildings(brief) {
  return (brief.liveMarketInvestigation?.representativeBuildings || []).filter((building) => building && building.selected !== false && building.name);
}

export function renderLocationBriefPage(brief) {
  const snapshot = buildProjectSnapshotFromBrief(brief);
  const locations = brief.searchProfile && Array.isArray(brief.searchProfile.locations) ? brief.searchProfile.locations : [];
  const location = marketDisplayName({ market: locationSummary(brief), state: locations[0]?.state, locations });
  const space = spaceSummary(brief);
  const size = snapshot.approximateSize || sizeSummary(brief);
  const intent = brief.searchProfile && brief.searchProfile.locationIntent;
  const contact = brief.contact || {};
  const questions = substantiveQuestions(brief);
  const marketEntries = supportedMarketEntries(brief);
  const primaryMarket = marketEntries[0];
  const priorities = Array.isArray(brief.priorities) ? brief.priorities.filter(Boolean) : [];
  const buildings = representativeBuildings(brief);
  const preparedFor = [contact.name, contact.company].filter(Boolean).join(" / ");
  const hasContact = Boolean(contact.name || contact.email || contact.company || contact.phone);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Commercial Location Brief ${escapeHtml(brief.publicId)} | Rofo</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="/assets/css/system.css">
  </head>
  <body class="location-brief-document">
    <main class="location-brief-document__shell">
      <header class="location-brief-document__hero">
        <div>
          <a class="location-brief-brand" href="/">Rofo</a>
          <div class="location-brief-kicker">Rofo Location Brief</div>
          <h1>${escapeHtml(location)} ${escapeHtml(space)} Search</h1>
          <p>Bookmark this page to return to your Location Brief.</p>
        </div>
        <aside>
          ${descriptionList([
            ["Prepared for", escapeHtml(preparedFor)],
            ["Status", escapeHtml(statusLabel(brief.status, brief.liveMarketInvestigation))],
            ["Brief ID", escapeHtml(brief.publicId)],
            ["Submitted", escapeHtml(formatDate(brief.createdAt))],
          ])}
        </aside>
      </header>

      <section class="location-brief-card">
        <h2>Your search</h2>
        ${descriptionList([
          ["Starting market", escapeHtml(location)],
          ["Space type", escapeHtml(space)],
          ["Business / Use", escapeHtml(snapshot.businessUse)],
          ["Size", escapeHtml(size)],
          ["Timing", escapeHtml(snapshot.timing)],
          ["Growth", escapeHtml(snapshot.growth)],
          ["Operating / Work Pattern", escapeHtml((snapshot.operationalUse || []).join(", "))],
          ["Search approach", escapeHtml(locationIntentLabel(intent))],
          ["Feedback", escapeHtml(brief.feedback || "")],
        ])}
      </section>

      ${marketEntries.length ? `<section class="location-brief-card">
        <h2>${escapeHtml(brief.marketPath && brief.marketPath.title || "Recommended starting point")}</h2>
        <div class="location-brief-path-grid">
          ${renderMarketPath(marketEntries)}
        </div>
      </section>` : ""}

      ${renderInvestigation(brief)}

      ${primaryMarket ? `<section class="location-brief-card">
        <h2>Why these markets</h2>
        ${renderWhyMarkets(primaryMarket)}
      </section>` : ""}

      ${priorities.length ? `<section class="location-brief-card">
        <h2>What matters most</h2>
        ${list(priorities)}
      </section>` : ""}

      ${questions.length ? `<section class="location-brief-card">
        <h2>Questions for expert review</h2>
        ${list(questions)}
      </section>` : ""}

      ${brief.notes ? `<section class="location-brief-card">
        <h2>User notes</h2>
        <p class="location-brief-note">${escapeHtml(brief.notes)}</p>
      </section>` : ""}

      ${buildings.length ? `<section class="location-brief-card">
        <h2>Representative buildings</h2>
        <p class="location-brief-muted">These examples illustrate commercial environments and are not confirmed availability.</p>
        ${list(buildings.map((building) => building.name))}
      </section>` : ""}

      ${hasContact ? `<section class="location-brief-card">
        <h2>Contact information</h2>
        ${descriptionList([
          ["Name", escapeHtml(contact.name || "")],
          ["Email", contact.email ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : ""],
          ["Company", escapeHtml(contact.company || "")],
          ["Phone", contact.phone ? `<a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a>` : ""],
          ["Submitted", escapeHtml(formatDate(brief.createdAt))],
        ])}
      </section>` : ""}

    </main>
  </body>
</html>`;
}

export async function onRequestGet({ request, params, env }) {
  const publicId = String(params.publicId || "").trim().toUpperCase();
  if (/^LB2-[A-F0-9]{24}$/.test(publicId)) {
    let bundle;
    try { bundle = await getLocationBriefV2Bundle(env, publicId, false); }
    catch { return privateHtml("Your Location Brief is temporarily unavailable. Please try again.", 503); }
    if (!bundle) return privateHtml("Location Brief not found.", 404);
    const owner = await ownsLocationBriefV2(request, bundle.brief);
    return privateHtml(renderLocationBriefV2Page(bundle, owner, false, { publicExperience: true }));
  }
  if (!/^LB-[A-Z0-9]{6,12}$/.test(publicId)) {
    return htmlResponse("Location Brief not found.", 404);
  }

  let brief = null;
  try {
    brief = await getLocationBrief(env, publicId);
  } catch (error) {
    return htmlResponse("Location Brief storage is not configured.", 503);
  }

  if (!brief) {
    return htmlResponse("Location Brief not found.", 404);
  }

  try {
    await trackLocationBriefEvent(env, "location_brief_viewed", brief, { source: "public_brief" });
  } catch (error) {
    console.warn("Unable to store Location Brief view event", error);
  }

  return htmlResponse(renderLocationBriefPage(brief));
}
