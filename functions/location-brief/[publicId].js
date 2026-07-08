import {
  escapeHtml,
  getLocationBrief,
  htmlResponse,
  locationSummary,
  sizeSummary,
  spaceSummary,
  trackLocationBriefEvent,
} from "../api/location-brief/_shared.js";

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

function statusLabel(status) {
  if (status === "submitted") return "Awaiting Expert Review";
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
  if (!filtered.length) return `<p class="location-brief-muted">None provided.</p>`;
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

function renderMarketPath(brief) {
  const marketPath = brief.marketPath || {};
  const recommended = Array.isArray(marketPath.recommendedPath) ? marketPath.recommendedPath : [];
  if (!recommended.length && marketPath.primaryLocationLabel) {
    return `<article class="location-brief-path-card">
      <span>Where we'd start</span>
      <h3>${escapeHtml(marketPath.primaryLocationLabel)}</h3>
      <p>${escapeHtml(marketPath.title || "Relevant starting point")}</p>
    </article>`;
  }

  if (!recommended.length) {
    return `<p class="location-brief-muted">A local expert should define the recommended market path.</p>`;
  }

  return recommended.map((item, index) => `
    <article class="location-brief-path-card">
      <span>${index === 0 ? "Where we'd start" : "Next comparison"}</span>
      <h3>${item.path ? `<a href="${escapeHtml(item.path)}">${escapeHtml(item.label)}</a>` : escapeHtml(item.label)}</h3>
      ${item.fitLabel ? `<strong>${escapeHtml(item.fitLabel)}</strong>` : ""}
      ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
      ${list(item.strengths, "No strengths recorded.")}
    </article>
  `).join("");
}

function renderWhyMarkets(brief) {
  const recommended = brief.marketPath && Array.isArray(brief.marketPath.recommendedPath)
    ? brief.marketPath.recommendedPath
    : [];
  const primary = recommended[0];
  if (!primary) {
    return `<p>Rofo captured the search profile and will use expert review to identify the right market path.</p>`;
  }
  return `
    <p>${escapeHtml(primary.summary || `${primary.label} is the first location to review against this profile.`)}</p>
    <div class="location-brief-two-col">
      <div>
        <h4>Best suited for</h4>
        ${list(primary.bestFor, "Expert review will confirm best-fit users.")}
      </div>
      <div>
        <h4>Tradeoffs</h4>
        ${list(primary.tradeoffs, "Live availability, pricing, and lease terms still need to be verified.")}
      </div>
    </div>
  `;
}

function renderComparisons(brief) {
  const compareWith = brief.marketPath && Array.isArray(brief.marketPath.compareWith)
    ? brief.marketPath.compareWith
    : [];
  if (!compareWith.length) return "";
  return `
    <section class="location-brief-card">
      <div class="location-brief-kicker">Nearby alternatives</div>
      <h2>Also worth comparing</h2>
      <div class="location-brief-compare-list">
        ${compareWith.map((item) => `
          <article>
            <h3>${item.path ? `<a href="${escapeHtml(item.path)}">${escapeHtml(item.label)}</a>` : escapeHtml(item.label)}</h3>
            <p>${escapeHtml(item.reason || "Worth comparing before narrowing the search.")}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPage(brief) {
  const location = locationSummary(brief);
  const space = spaceSummary(brief);
  const size = sizeSummary(brief);
  const contact = brief.contact || {};
  const questions = brief.marketPath && Array.isArray(brief.marketPath.questionsToValidate)
    ? brief.marketPath.questionsToValidate
    : [];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Rofo Location Brief ${escapeHtml(brief.publicId)}</title>
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
          <p>A structured consulting document for expert review, broker handoff, and future market investigation.</p>
        </div>
        <aside>
          <span>${escapeHtml(statusLabel(brief.status))}</span>
          <strong>${escapeHtml(brief.publicId)}</strong>
          <small>Submitted ${escapeHtml(formatDate(brief.createdAt))}</small>
        </aside>
      </header>

      <section class="location-brief-card">
        <div class="location-brief-kicker">Business Requirements</div>
        <h2>Search Profile</h2>
        ${descriptionList([
          ["Location", escapeHtml(location)],
          ["Space type", escapeHtml(space)],
          ["Size", escapeHtml(size)],
          ["Feedback", escapeHtml(brief.feedback || "")],
        ])}
      </section>

      <section class="location-brief-card">
        <div class="location-brief-kicker">Recommended Market Path</div>
        <h2>${escapeHtml(brief.marketPath && brief.marketPath.title || "Where we'd start")}</h2>
        <div class="location-brief-path-grid">
          ${renderMarketPath(brief)}
        </div>
      </section>

      ${renderComparisons(brief)}

      <section class="location-brief-card">
        <div class="location-brief-kicker">Advisor Rationale</div>
        <h2>Why these markets</h2>
        ${renderWhyMarkets(brief)}
      </section>

      <section class="location-brief-card">
        <div class="location-brief-kicker">Business Priorities</div>
        <h2>What matters most</h2>
        ${list(brief.priorities, "No priorities selected yet.")}
      </section>

      <section class="location-brief-card">
        <div class="location-brief-kicker">Questions We'll Explore</div>
        <h2>Open questions for expert review</h2>
        ${list(questions, "A local expert should confirm commute, budget, timing, and building requirements.")}
      </section>

      <section class="location-brief-card">
        <div class="location-brief-kicker">Additional Notes</div>
        <h2>User notes</h2>
        <p class="location-brief-note">${escapeHtml(brief.notes || "None provided.")}</p>
      </section>

      <section class="location-brief-card">
        <div class="location-brief-kicker">Representative Buildings</div>
        <h2>Placeholder</h2>
        <p class="location-brief-muted">Representative buildings will be attached after expert review or future recommendation enrichment.</p>
      </section>

      <section class="location-brief-card">
        <div class="location-brief-kicker">Graph Confidence</div>
        <h2>${escapeHtml(brief.marketPath && brief.marketPath.confidenceLabel || "Expert Guided")}</h2>
        <p class="location-brief-muted">Confidence reflects graph-backed location context and search inputs. It does not represent live availability.</p>
      </section>

      <section class="location-brief-card">
        <div class="location-brief-kicker">Contact Information</div>
        <h2>Customer contact</h2>
        ${descriptionList([
          ["Name", escapeHtml(contact.name || "")],
          ["Email", contact.email ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : ""],
          ["Company", escapeHtml(contact.company || "")],
          ["Phone", contact.phone ? `<a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a>` : ""],
          ["Submitted", escapeHtml(formatDate(brief.createdAt))],
        ])}
      </section>

      <section class="location-brief-card location-brief-card--muted">
        <div class="location-brief-kicker">Broker Notes</div>
        <h2>Coming Soon</h2>
        <p>Broker collaboration and notes will be added in a future sprint.</p>
      </section>
    </main>
  </body>
</html>`;
}

export async function onRequestGet({ params, env }) {
  const publicId = String(params.publicId || "").trim().toUpperCase();
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

  return htmlResponse(renderPage(brief));
}
