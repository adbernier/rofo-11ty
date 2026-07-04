import {
  ensureSearchProfileEventsTable,
  scheduleSearchProfileEventIndexes,
} from "../_shared/search-profile-events.js";

const DEFAULT_LOOKBACK_DAYS = 7;
const MAX_LOOKBACK_DAYS = 90;
const RECENT_EVENTS_LIMIT = 50;
const RECENT_SUBMISSIONS_LIMIT = 20;
const ANALYTICS_SAMPLE_LIMIT = 1000;
const TOP_LIST_LIMIT = 10;
const PROFILE_DIMENSION_SAMPLE_LIMIT = 500;
const VIEW_SAMPLE_LIMIT = 1000;
const MIN_RECOMMENDATION_SIGNAL = 2;
const V2_FUNNEL_EVENTS = [
  "search_profile_viewed",
  "search_profile_started",
  "search_profile_find_matching_buildings_clicked",
  "search_profile_contact_screen_viewed",
  "search_profile_submitted",
];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function adminResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function percent(numerator, denominator) {
  const top = Number(numerator || 0);
  const bottom = Number(denominator || 0);
  if (!bottom) return "0%";
  return `${Math.round((top / bottom) * 100)}%`;
}

function ratio(numerator, denominator) {
  const top = Number(numerator || 0);
  const bottom = Number(denominator || 0);
  if (!bottom) return 0;
  return top / bottom;
}

function getAnalyticsDb(env) {
  return env.SEARCH_PROFILE_EVENTS_DB || env.LEADS_DB;
}

function isMissingTableError(error) {
  return /no such table|search_profile_events/i.test(String(error && error.message || ""));
}

function normalizeLookbackDays(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LOOKBACK_DAYS;
  return Math.min(Math.floor(parsed), MAX_LOOKBACK_DAYS);
}

function normalizeMode(value) {
  return value === "detail" ? "detail" : "fast";
}

function lookbackStartIso(days) {
  const date = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  return date.toISOString();
}

function tableCell(value) {
  return `<td>${escapeHtml(value === undefined || value === null || value === "" ? "—" : value)}</td>`;
}

function linkCell(value) {
  if (!value) return "<td>—</td>";
  const safeValue = escapeHtml(value);
  return `<td><a href="${safeValue}" target="_blank" rel="noopener">${safeValue}</a></td>`;
}

function metricCard(label, value, helper = "") {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${helper ? `<small>${escapeHtml(helper)}</small>` : ""}
    </article>
  `;
}

function metricValue(value) {
  return value === null || value === undefined ? "Not queried" : value;
}

function renderRecommendationMetricCards(rows) {
  if (!rows.length) {
    return `<p class="empty-cell">No Find Locations recommendation events have been recorded yet.</p>`;
  }

  return `<div class="metrics metrics--compact">${rows.map((row) => `
    ${metricCard(`${row.days} days views`, metricValue(row.views || 0))}
    ${metricCard(`${row.days} days CTA clicks`, metricValue(row.clicks || 0))}
    ${metricCard(`${row.days} days CTR`, percent(row.clicks, row.views), "clicks / views")}
  `).join("")}</div>`;
}

function renderEventRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="6" class="empty-cell">No events yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(formatDate(row.created_at))}
      ${tableCell(row.event_name)}
      ${tableCell(row.page_type)}
      ${tableCell(row.location_display)}
      ${tableCell(row.space_type)}
      ${linkCell(row.page_url)}
    </tr>
  `).join("");
}

function renderSubmissionRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="7" class="empty-cell">No submissions yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(formatDate(row.created_at))}
      ${tableCell(row.page_type)}
      ${tableCell(row.location_display)}
      ${tableCell(row.space_type)}
      ${tableCell(row.city)}
      ${tableCell(row.district)}
      ${linkCell(row.page_url)}
    </tr>
  `).join("");
}

function renderPageTypeRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="4" class="empty-cell">No page type data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.page_type || "unknown")}
      ${tableCell(row.started || 0)}
      ${tableCell(row.submitted || 0)}
      ${tableCell(percent(row.submitted, row.started))}
    </tr>
  `).join("");
}

function renderStartRateByPageTypeRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="9" class="empty-cell">No Search Profile start-rate data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.page_type || "unknown")}
      ${tableCell(row.views || 0)}
      ${tableCell(row.started || 0)}
      ${tableCell(row.find_clicked || 0)}
      ${tableCell(row.contact_viewed || 0)}
      ${tableCell(percent(row.started, row.views))}
      ${tableCell(row.submitted || 0)}
      ${tableCell(percent(row.submitted, row.views))}
      ${tableCell(percent(row.submitted, row.started))}
    </tr>
  `).join("");
}

function renderVersionPerformanceRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="10" class="empty-cell">No profile-version data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.profile_version || "unknown")}
      ${tableCell(row.views || 0)}
      ${tableCell(row.started || 0)}
      ${tableCell(row.find_clicked || 0)}
      ${tableCell(row.contact_viewed || 0)}
      ${tableCell(row.submitted || 0)}
      ${tableCell(percent(row.started, row.views))}
      ${tableCell(percent(row.submitted, row.views))}
      ${tableCell(percent(row.submitted, row.started))}
      ${tableCell(row.avg_completion_time)}
    </tr>
  `).join("");
}

function renderSimplifiedFunnelRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="4" class="empty-cell">No simplified funnel data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.label)}
      ${tableCell(row.count)}
      ${tableCell(row.previous_rate)}
      ${tableCell(row.view_rate)}
    </tr>
  `).join("");
}

function renderDailyTrendRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="8" class="empty-cell">No daily trend data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.day)}
      ${tableCell(row.views || 0)}
      ${tableCell(row.started || 0)}
      ${tableCell(row.find_clicked || 0)}
      ${tableCell(row.contact_viewed || 0)}
      ${tableCell(row.submitted || 0)}
      ${tableCell(percent(row.started, row.views))}
      ${tableCell(percent(row.submitted, row.started))}
    </tr>
  `).join("");
}

function renderTopSearchRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="5" class="empty-cell">No completed Search Profile searches yet.</td></tr>`;
  }

  return rows.map((row) => {
    const label = [row.location_display, row.space_type, row.size_or_people].filter(Boolean).join(" • ");
    return `
      <tr>
        ${tableCell(label || "unknown")}
        ${tableCell(row.completed || 0)}
        ${tableCell(row.submitted || 0)}
        ${tableCell(percent(row.submitted, row.completed))}
        ${tableCell(row.profile_version || "mixed")}
      </tr>
    `;
  }).join("");
}

function renderRecentActivityRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="7" class="empty-cell">No meaningful Search Profile activity yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(formatDate(row.created_at))}
      ${tableCell(row.event_name)}
      ${tableCell(row.page_type || row.page_title)}
      ${tableCell(row.location_display)}
      ${tableCell(row.space_type)}
      ${tableCell(row.size_or_people)}
      ${tableCell(row.profile_version)}
    </tr>
  `).join("");
}

function renderTopRows(rows, columns, emptyMessage = "No data yet.") {
  if (!rows.length) {
    return `<tr><td colspan="${columns.length}" class="empty-cell">${escapeHtml(emptyMessage)}</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${columns.map((column) => {
        const value = typeof column.value === "function" ? column.value(row) : row[column.key];
        return column.link ? linkCell(value) : tableCell(value);
      }).join("")}
    </tr>
  `).join("");
}

function renderStepRows(stepCounts) {
  const steps = [
    "location_completed",
    "space_type_completed",
    "timing_completed",
    "size_completed",
    "features_completed",
    "contact_completed",
  ];

  return steps.map((step) => `
    <tr>
      ${tableCell(step)}
      ${tableCell(stepCounts[step] || 0)}
    </tr>
  `).join("");
}

function renderFunnelInsightRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="5" class="empty-cell">No funnel data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.step)}
      ${tableCell(row.count)}
      ${tableCell(row.completion)}
      ${tableCell(row.dropoff)}
      ${tableCell(row.avg_time)}
    </tr>
  `).join("");
}

function renderRecommendationCards(recommendations) {
  if (!recommendations.length) {
    return `<p class="empty-cell">No rule-based recommendations match the current date range yet. This is expected with low event volume.</p>`;
  }

  return `
    <div class="recommendation-grid">
      ${recommendations.map((item) => `
        <article class="recommendation-card recommendation-card--${escapeHtml(String(item.priority || "low").toLowerCase())}">
          <div class="recommendation-card__top">
            <h3>${escapeHtml(item.title)}</h3>
            <span class="priority-pill">${escapeHtml(item.priority || "Low")}</span>
          </div>
          <p><strong>Why it appeared:</strong> ${escapeHtml(item.reason)}</p>
          <ul>
            ${(item.metrics || []).map((metric) => `<li>${escapeHtml(metric)}</li>`).join("")}
          </ul>
          <p><strong>Suggested action:</strong> ${escapeHtml(item.action)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderGrowthRecommendations(groups = {}) {
  const sections = [
    ["Growth Opportunities", groups.growth || []],
    ["Top Performers", groups.performers || []],
    ["Funnel Opportunities", groups.funnel || []],
    ["Content Opportunities", groups.content || []],
  ];

  return sections.map(([title, recommendations]) => `
    <section class="growth-group">
      <h3>${escapeHtml(title)}</h3>
      ${renderRecommendationCards(recommendations)}
    </section>
  `).join("");
}

function summarizeRows(rows, includeViewed = false) {
  const funnel = { viewed: includeViewed ? 0 : null, started: 0, submitted: 0 };
  const stepCounts = {};
  const pageTypes = new Map();
  const stepEvents = new Set([
    "location_completed",
    "space_type_completed",
    "timing_completed",
    "size_completed",
    "features_completed",
    "contact_completed",
  ]);

  for (const row of rows) {
    if (includeViewed && row.event_name === "search_profile_viewed") {
      funnel.viewed += 1;
    }
    if (row.event_name === "search_profile_started") {
      funnel.started += 1;
    }
    if (row.event_name === "search_profile_submitted") {
      funnel.submitted += 1;
    }
    if (stepEvents.has(row.event_name)) {
      stepCounts[row.event_name] = (stepCounts[row.event_name] || 0) + 1;
    }
    if (row.event_name === "search_profile_started" || row.event_name === "search_profile_submitted") {
      const pageType = row.page_type || "unknown";
      const current = pageTypes.get(pageType) || { page_type: pageType, started: 0, submitted: 0 };
      if (row.event_name === "search_profile_started") current.started += 1;
      if (row.event_name === "search_profile_submitted") current.submitted += 1;
      pageTypes.set(pageType, current);
    }
  }

  return {
    funnel,
    stepCounts,
    pageTypes: Array.from(pageTypes.values())
      .sort((a, b) => (b.submitted - a.submitted) || (b.started - a.started))
      .slice(0, 50),
  };
}

function normalizeAggregateRows(rows, labelKey) {
  return rows.map((row) => ({
    ...row,
    [labelKey]: row[labelKey] || "unknown",
    started: Number(row.started || 0),
    find_clicked: Number(row.find_clicked || 0),
    contact_viewed: Number(row.contact_viewed || 0),
    submitted: Number(row.submitted || 0),
  }));
}

function normalizeStartRateRows(rows) {
  return rows.map((row) => ({
    page_type: row.page_type || "unknown",
    views: Number(row.views || 0),
    started: Number(row.started || 0),
    find_clicked: Number(row.find_clicked || 0),
    contact_viewed: Number(row.contact_viewed || 0),
    submitted: Number(row.submitted || 0),
  }));
}

function normalizeVersionRows(rows) {
  return rows.map((row) => ({
    profile_version: row.profile_version || "unknown",
    views: Number(row.views || 0),
    started: Number(row.started || 0),
    find_clicked: Number(row.find_clicked || 0),
    contact_viewed: Number(row.contact_viewed || 0),
    submitted: Number(row.submitted || 0),
    avg_completion_time: row.avg_completion_time ? `${Math.round(Number(row.avg_completion_time || 0) / 1000)}s` : "—",
  }));
}

function normalizeDailyRows(rows) {
  return rows.map((row) => ({
    day: row.day || "unknown",
    views: Number(row.views || 0),
    started: Number(row.started || 0),
    find_clicked: Number(row.find_clicked || 0),
    contact_viewed: Number(row.contact_viewed || 0),
    submitted: Number(row.submitted || 0),
  }));
}

function normalizeTopSearchRows(rows) {
  return rows.map((row) => ({
    location_display: row.location_display || "",
    space_type: row.space_type || "",
    size_or_people: row.size_or_people || "",
    profile_version: row.profile_version || "",
    completed: Number(row.completed || 0),
    submitted: Number(row.submitted || 0),
  }));
}

function buildSimplifiedFunnel(funnel) {
  const ordered = [
    ["Search Profile viewed", Number(funnel.viewed || 0)],
    ["Started", Number(funnel.started || 0)],
    ["Find Matching Buildings clicked", Number(funnel.find_clicked || 0)],
    ["Contact screen viewed", Number(funnel.contact_viewed || 0)],
    ["Submitted", Number(funnel.submitted || 0)],
  ];
  const views = ordered[0][1];

  return ordered.map(([label, count], index) => {
    const previous = index === 0 ? count : ordered[index - 1][1];
    return {
      label,
      count,
      previous_rate: index === 0 ? "—" : percent(count, previous),
      view_rate: index === 0 ? "100%" : percent(count, views),
    };
  });
}

function buildFunnelInsights(funnel, stepCounts, stepDurations = {}) {
  const ordered = [
    ["Started", funnel.started || 0, "search_profile_started"],
    ["Find Matching Buildings clicked", funnel.find_clicked || 0, "search_profile_find_matching_buildings_clicked"],
    ["Contact screen viewed", funnel.contact_viewed || 0, "search_profile_contact_screen_viewed"],
    ["Location completed", stepCounts.location_completed || 0, "location_completed"],
    ["Space type completed", stepCounts.space_type_completed || 0, "space_type_completed"],
    ["Timing completed", stepCounts.timing_completed || 0, "timing_completed"],
    ["Size completed", stepCounts.size_completed || 0, "size_completed"],
    ["Features completed", stepCounts.features_completed || 0, "features_completed"],
    ["Contact completed", stepCounts.contact_completed || 0, "contact_completed"],
    ["Submitted", funnel.submitted || 0, "search_profile_submitted"],
  ];
  const started = Number(funnel.started || 0);
  let previous = started;

  return ordered.map(([step, count, eventName], index) => {
    const numericCount = Number(count || 0);
    const dropoff = index === 0 ? 0 : Math.max(0, previous - numericCount);
    previous = numericCount;
    const avgMs = Number(stepDurations[eventName] || 0);
    return {
      step,
      count: numericCount,
      completion: percent(numericCount, started),
      dropoff: index === 0 ? "—" : percent(dropoff, Math.max(previous + dropoff, 0)),
      avg_time: avgMs ? `${Math.round(avgMs / 1000)}s` : "—",
    };
  });
}

function topFeaturesFromRows(rows) {
  const counts = new Map();
  for (const row of rows) {
    String(row.features || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((feature) => counts.set(feature, (counts.get(feature) || 0) + 1));
  }
  return Array.from(counts.entries())
    .map(([feature, submitted]) => ({ feature, submitted }))
    .sort((a, b) => b.submitted - a.submitted || a.feature.localeCompare(b.feature))
    .slice(0, TOP_LIST_LIMIT);
}

function topViewedPagesFromRows(rows) {
  const counts = new Map();
  for (const row of rows) {
    const pageUrl = row.page_url || "";
    if (!pageUrl) continue;
    const current = counts.get(pageUrl) || { page_url: pageUrl, page_type: row.page_type || "", viewed: 0 };
    current.viewed += 1;
    if (!current.page_type && row.page_type) current.page_type = row.page_type;
    counts.set(pageUrl, current);
  }
  return Array.from(counts.values())
    .sort((a, b) => b.viewed - a.viewed)
    .slice(0, TOP_LIST_LIMIT);
}

function recommendation({ title, reason, metrics = [], action, priority = "Low" }) {
  return { title, reason, metrics, action, priority };
}

function rowLabel(row, keys) {
  for (const key of keys) {
    if (row && row[key]) return row[key];
  }
  return "Unknown";
}

function pageStartsByUrl(topPages) {
  return new Map(topPages.map((row) => [row.page_url, row]));
}

function recommendationsForHighViewsLowStarts(topViewedPages, topPages) {
  const startsByUrl = pageStartsByUrl(topPages);
  return topViewedPages
    .filter((row) => row.viewed >= Math.max(5, MIN_RECOMMENDATION_SIGNAL))
    .map((row) => {
      const started = Number((startsByUrl.get(row.page_url) || {}).started || 0);
      const startRate = ratio(started, row.viewed);
      if (started > 0 && startRate >= 0.08) return null;
      return recommendation({
        title: "High views but low Search Profile starts",
        reason: "A page appeared often in the recent viewed-event sample but generated few or no Search Profile starts.",
        metrics: [
          `Page: ${row.page_url}`,
          `Views in bounded sample: ${row.viewed}`,
          `Starts: ${started}`,
          `Start rate: ${percent(started, row.viewed)}`,
        ],
        action: "Review Search Profile placement, above-the-fold visibility, and CTA clarity on this page.",
        priority: row.viewed >= 20 && started === 0 ? "High" : "Medium",
      });
    })
    .filter(Boolean)
    .slice(0, 3);
}

function recommendationsForStartsLowSubmissions(topPages) {
  return topPages
    .filter((row) => Number(row.started || 0) >= Math.max(3, MIN_RECOMMENDATION_SIGNAL))
    .map((row) => {
      const conversion = ratio(row.submitted, row.started);
      if (row.submitted > 0 && conversion >= 0.25) return null;
      return recommendation({
        title: "Starts without enough submissions",
        reason: "This page is getting Search Profile starts, but submissions are not keeping pace.",
        metrics: [
          `Page: ${row.page_url}`,
          `Starts: ${row.started}`,
          `Submissions: ${row.submitted}`,
          `Submit rate: ${percent(row.submitted, row.started)}`,
        ],
        action: "Review the transition into contact collection, trust cues, and whether the page context matches user intent.",
        priority: row.started >= 8 && row.submitted === 0 ? "High" : "Medium",
      });
    })
    .filter(Boolean)
    .slice(0, 3);
}

function recommendationsForStartsLowFindClicks(rows) {
  return rows
    .filter((row) => Number(row.started || 0) >= Math.max(3, MIN_RECOMMENDATION_SIGNAL))
    .map((row) => {
      const findRate = ratio(row.find_clicked, row.started);
      if (row.find_clicked > 0 && findRate >= 0.5) return null;
      return recommendation({
        title: "Starts are not reaching Find Matching Buildings",
        reason: "Users are beginning Search Profile but not completing the simplified first screen often enough.",
        metrics: [
          `Page type: ${row.page_type || "unknown"}`,
          `Starts: ${row.started || 0}`,
          `Find Matching Buildings clicks: ${row.find_clicked || 0}`,
          `Click-through from start: ${percent(row.find_clicked, row.started)}`,
        ],
        action: "Review Step 1 choice density, location defaults, and CTA clarity for this page type.",
        priority: Number(row.started || 0) >= 8 && Number(row.find_clicked || 0) === 0 ? "High" : "Medium",
      });
    })
    .filter(Boolean)
    .slice(0, 3);
}

function recommendationsForFindClicksLowSubmissions(rows) {
  return rows
    .filter((row) => Number(row.find_clicked || 0) >= Math.max(3, MIN_RECOMMENDATION_SIGNAL))
    .map((row) => {
      const submitRate = ratio(row.submitted, row.find_clicked);
      if (row.submitted > 0 && submitRate >= 0.3) return null;
      return recommendation({
        title: "Shortlist intent is not becoming submissions",
        reason: "Users click Find Matching Buildings, then do not submit contact details at the expected rate.",
        metrics: [
          `Page type: ${row.page_type || "unknown"}`,
          `Find Matching Buildings clicks: ${row.find_clicked || 0}`,
          `Contact screen views: ${row.contact_viewed || 0}`,
          `Submissions: ${row.submitted || 0}`,
          `Submission rate after click: ${percent(row.submitted, row.find_clicked)}`,
        ],
        action: "Review Step 2 trust, contact-field friction, and whether the recap clearly matches the user's search.",
        priority: Number(row.find_clicked || 0) >= 8 && Number(row.submitted || 0) === 0 ? "High" : "Medium",
      });
    })
    .filter(Boolean)
    .slice(0, 3);
}

function searchPatternRecommendations(topSearches) {
  return (topSearches || [])
    .filter((row) => Number(row.completed || 0) >= MIN_RECOMMENDATION_SIGNAL || Number(row.submitted || 0) > 0)
    .slice(0, 2)
    .map((row) => recommendation({
      title: "Strong search pattern",
      reason: "A repeated location, space type, and size combination appeared in completed Search Profile searches.",
      metrics: [
        `Search: ${[row.location_display, row.space_type, row.size_or_people].filter(Boolean).join(" • ") || "unknown"}`,
        `Completed searches: ${row.completed || 0}`,
        `Submissions: ${row.submitted || 0}`,
      ],
      action: "Expand related content, comparison links, and representative building coverage for this demand pattern.",
      priority: Number(row.submitted || 0) > 0 ? "High" : "Medium",
    }));
}

function recommendationsForStrongRows(rows, labelKey, title, action, minimumStarted = MIN_RECOMMENDATION_SIGNAL) {
  return rows
    .filter((row) => Number(row.started || 0) >= minimumStarted || Number(row.submitted || 0) > 0)
    .slice(0, 2)
    .map((row) => recommendation({
      title,
      reason: "This segment has observed Search Profile engagement in the current reporting window.",
      metrics: [
        `${labelKey}: ${row[labelKey] || "unknown"}`,
        `Starts: ${row.started || 0}`,
        `Submissions: ${row.submitted || 0}`,
        `Submit rate: ${percent(row.submitted, row.started)}`,
      ],
      action,
      priority: Number(row.submitted || 0) > 0 ? "High" : "Medium",
    }));
}

function bestConvertingRows(rows, labelKeys, title, action) {
  return rows
    .filter((row) => Number(row.started || 0) >= MIN_RECOMMENDATION_SIGNAL && Number(row.submitted || 0) > 0)
    .sort((a, b) => ratio(b.submitted, b.started) - ratio(a.submitted, a.started) || Number(b.submitted || 0) - Number(a.submitted || 0))
    .slice(0, 2)
    .map((row) => recommendation({
      title,
      reason: "This segment has the strongest observed conversion among segments with enough signal in this date range.",
      metrics: [
        `Segment: ${rowLabel(row, labelKeys)}`,
        `Starts: ${row.started || 0}`,
        `Submissions: ${row.submitted || 0}`,
        `Submit rate: ${percent(row.submitted, row.started)}`,
      ],
      action,
      priority: "High",
    }));
}

function largestFunnelDropRecommendations(funnelInsights) {
  const candidates = funnelInsights
    .slice(1)
    .map((row, index) => {
      const previous = funnelInsights[index];
      const previousCount = Number(previous && previous.count || 0);
      const count = Number(row.count || 0);
      return { row, previous, previousCount, count, drop: Math.max(0, previousCount - count) };
    })
    .filter((item) => item.previousCount >= MIN_RECOMMENDATION_SIGNAL && item.drop > 0)
    .sort((a, b) => b.drop - a.drop)
    .slice(0, 1);

  return candidates.map((item) => recommendation({
    title: "Largest funnel drop",
    reason: "This step lost the most users compared with the previous step in the current date range.",
    metrics: [
      `Step: ${item.row.step}`,
      `Previous step count: ${item.previousCount}`,
      `Current step count: ${item.count}`,
      `Drop-off: ${percent(item.drop, item.previousCount)}`,
    ],
    action: "Review copy, interaction clarity, and friction around this step before changing the full flow.",
    priority: item.drop >= 5 ? "High" : "Medium",
  }));
}

function timingRecommendations(funnelInsights) {
  const submitted = funnelInsights.find((row) => row.step === "Submitted");
  if (!submitted || submitted.avg_time === "—") return [];
  const seconds = Number(String(submitted.avg_time).replace(/\D/g, ""));
  if (!seconds) return [];
  if (seconds < 20) {
    return [recommendation({
      title: "Very fast profile submissions",
      reason: "Average submitted-profile duration is unusually short for a multi-step profile.",
      metrics: [`Average time to submit: ${submitted.avg_time}`],
      action: "Review submitted leads for quality and confirm users are not skipping context unintentionally.",
      priority: "Low",
    })];
  }
  if (seconds > 300) {
    return [recommendation({
      title: "Long profile completion time",
      reason: "Average submitted-profile duration is long enough to suggest possible hesitation or interruption.",
      metrics: [`Average time to submit: ${submitted.avg_time}`],
      action: "Review whether contact collection, feature selection, or page context creates unnecessary uncertainty.",
      priority: "Medium",
    })];
  }
  return [];
}

function industrialContentRecommendations(topSpaceTypes, topFeatures) {
  const industrialSpace = topSpaceTypes.find((row) => /industrial|warehouse|flex/i.test(row.space_type || ""));
  const industrialFeatureCount = topFeatures
    .filter((row) => /loading|clear height|yard|power|freeway|warehouse/i.test(row.feature || ""))
    .reduce((sum, row) => sum + Number(row.submitted || 0), 0);
  const submitted = Number(industrialSpace && industrialSpace.submitted || 0) + industrialFeatureCount;
  if (submitted < MIN_RECOMMENDATION_SIGNAL) return [];
  return [recommendation({
    title: "Industrial intent is showing up in Search Profile",
    reason: "Industrial or warehouse space types/features have appeared in submitted profiles.",
    metrics: [
      industrialSpace ? `Industrial/flex submissions: ${industrialSpace.submitted}` : "Industrial/flex submissions: 0",
      `Industrial feature selections: ${industrialFeatureCount}`,
    ],
    action: "Prioritize industrial district comparisons, representative building depth, and logistics-focused location guidance in markets where these submissions originate.",
    priority: submitted >= 5 ? "High" : "Medium",
  })];
}

function buildGrowthRecommendations(data) {
  const growth = [
    ...recommendationsForHighViewsLowStarts(data.topViewedPages || [], data.topPages || []),
    ...recommendationsForStartsLowFindClicks(data.startRatesByPageType || []),
    ...recommendationsForFindClicksLowSubmissions(data.startRatesByPageType || []),
    ...recommendationsForStartsLowSubmissions(data.topPages || []),
    ...recommendationsForStrongRows(data.topDistricts || [], "district", "District generating strong engagement", "Expand nearby comparison pages and strengthen representative building coverage for this district."),
    ...recommendationsForStrongRows(data.topEcosystems || [], "business_ecosystem", "Business ecosystem generating engagement", "Expand ecosystem-oriented comparison content and make related districts easier to discover."),
  ].slice(0, 8);

  const performers = [
    ...bestConvertingRows(data.topPages || [], ["page_url"], "Highest converting page", "Use this page as a pattern for Search Profile placement and contextual copy."),
    ...bestConvertingRows(data.topDistricts || [], ["district"], "Highest converting district", "Expand adjacent district comparisons and deepen representative building coverage."),
    ...bestConvertingRows(data.topComparisons || [], ["page_url"], "Highest converting comparison page", "Build adjacent comparison pages around the same decision path."),
    ...bestConvertingRows(data.topEcosystems || [], ["business_ecosystem"], "Highest converting ecosystem", "Create more content around this business ecosystem and its competing locations."),
    ...bestConvertingRows(data.topCities || [], ["city"], "Highest converting city", "Prioritize district coverage and internal links for this city."),
  ].slice(0, 8);

  const funnel = [
    ...largestFunnelDropRecommendations(data.funnelInsights || []),
    ...recommendationsForStartsLowSubmissions((data.topPages || []).filter((row) => Number(row.submitted || 0) === 0)),
    ...timingRecommendations(data.funnelInsights || []),
  ].slice(0, 8);

  const content = [
    ...recommendationsForStrongRows(data.topDistricts || [], "district", "Strong district signal", "Add or improve comparison pages connecting this district to likely alternatives."),
    ...recommendationsForStrongRows(data.topComparisons || [], "page_url", "Strong comparison signal", "Expand the nearby comparison graph around this decision."),
    ...recommendationsForStrongRows(data.topEcosystems || [], "business_ecosystem", "Strong ecosystem signal", "Build additional ecosystem context and cross-market alternatives."),
    ...recommendationsForStrongRows(data.topCities || [], "city", "Strong city signal", "Add district coverage or improve city-to-district navigation where coverage is thin."),
    ...searchPatternRecommendations(data.topSearches || []),
    ...industrialContentRecommendations(data.topSpaceTypes || [], data.topFeatures || []),
  ].slice(0, 8);

  return { growth, performers, funnel, content };
}

function renderEmptyState(token, lookbackDays = DEFAULT_LOOKBACK_DAYS) {
  return renderPage({
    token,
    lookbackDays,
    mode: "fast",
    emptyMessage: "No Search Profile analytics table exists yet. Events will appear here after the first Search Profile event is stored.",
    funnel: { viewed: 0, started: 0, find_clicked: 0, contact_viewed: 0, submitted: 0 },
    stepCounts: {},
    versionPerformance: [],
    simplifiedFunnel: [],
    dailyTrend: [],
    pageTypes: [],
    startRatesByPageType: [],
    topSearches: [],
    recentEvents: [],
    recentSubmissions: [],
  });
}

function renderPage({
  token,
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
  mode = "fast",
  emptyMessage = "",
  errors = [],
  funnel = {},
  stepCounts = {},
  versionPerformance = [],
  simplifiedFunnel = [],
  dailyTrend = [],
  funnelInsights = [],
  pageTypes = [],
  startRatesByPageType = [],
  topSearches = [],
  topPages = [],
  topDistricts = [],
  topComparisons = [],
  topCities = [],
  topEcosystems = [],
  topSpaceTypes = [],
  topFeatures = [],
  topTimings = [],
  topSizes = [],
  topLandingPages = [],
  submissionSources = [],
  growthRecommendations = {},
  recommendationMetrics = [],
  recentEvents = [],
  recentSubmissions = [],
}) {
  const safeMode = normalizeMode(mode);
  const adminBaseUrl = `/admin/search-profile-analytics?token=${encodeURIComponent(token)}`;
  const rangeBaseUrl = `${adminBaseUrl}&mode=${encodeURIComponent(safeMode)}`;
  const modeBaseUrl = `${adminBaseUrl}&days=${encodeURIComponent(lookbackDays)}`;
  const recentEventsNote = safeMode === "fast"
    ? "Shows the latest 25 meaningful funnel events and excludes high-volume viewed events."
    : "Detailed mode still keeps recent activity bounded to meaningful funnel events.";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Search Profile Analytics | Rofo Admin</title>
  <style>
    :root { color-scheme: light; --bg: #f6f8fb; --ink: #172033; --muted: #607083; --border: #d9e2ec; --blue: #173f8a; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
    a { color: #174ea6; }
    .shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 52px; }
    header { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; margin-bottom: 20px; }
    h1 { margin: 0 0 6px; font-size: clamp(28px, 4vw, 42px); line-height: 1.05; }
    h2 { margin: 0 0 12px; font-size: 20px; }
    p { margin: 0; color: var(--muted); }
    .admin-link { display: inline-flex; align-items: center; min-height: 40px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: #fff; font-weight: 800; text-decoration: none; }
    .notice { margin: 0 0 16px; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px; background: #eff6ff; color: #1e3a8a; font-weight: 700; }
    .notice--error { border-color: #fecdd3; background: #fff1f2; color: #9f1239; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; }
    .toolbar a { display: inline-flex; min-height: 34px; align-items: center; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: #fff; color: var(--ink); font-size: 13px; font-weight: 800; text-decoration: none; }
    .toolbar a.is-active { border-color: var(--blue); color: var(--blue); box-shadow: 0 0 0 2px rgba(23, 63, 138, .12); }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 20px 0; }
    .metric-card, .panel { background: #fff; border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 8px 24px rgba(23, 32, 51, .06); }
    .metric-card { display: grid; gap: 6px; padding: 16px; }
    .metric-card span, th { color: var(--muted); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
    .metric-card strong { font-size: 30px; line-height: 1; }
    .metric-card small { color: var(--muted); }
    .panel { padding: 18px; margin: 16px 0; overflow: hidden; }
    .panel-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .growth-group { margin-top: 18px; }
    .growth-group h3 { margin: 0 0 10px; font-size: 16px; }
    .recommendation-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .recommendation-card { display: grid; gap: 10px; padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: #f8fafc; }
    .recommendation-card--high { border-color: #fed7aa; background: #fff7ed; }
    .recommendation-card--medium { border-color: #bfdbfe; background: #eff6ff; }
    .recommendation-card__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
    .recommendation-card h3 { margin: 0; font-size: 15px; line-height: 1.25; }
    .recommendation-card p { font-size: 13px; line-height: 1.45; }
    .recommendation-card ul { margin: 0; padding-left: 18px; color: var(--muted); font-size: 13px; line-height: 1.45; }
    .priority-pill { flex: 0 0 auto; display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; background: #fff; border: 1px solid var(--border); color: var(--ink); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 680px; }
    th, td { padding: 10px 8px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; font-size: 14px; }
    td { overflow-wrap: anywhere; }
    tr:last-child td { border-bottom: 0; }
    .empty-cell { color: var(--muted); font-style: italic; }
    @media (max-width: 860px) {
      header { display: grid; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .panel-grid { grid-template-columns: 1fr; }
      .recommendation-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .metrics { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <h1>Search Profile Analytics</h1>
        <p>Lightweight funnel events for Search Profile V1 and V2. Showing the last ${escapeHtml(lookbackDays)} day${lookbackDays === 1 ? "" : "s"}.</p>
        <nav class="toolbar" aria-label="Analytics date range">
          <a class="${lookbackDays === 7 ? "is-active" : ""}" href="${rangeBaseUrl}&days=7">7 days</a>
          <a class="${lookbackDays === 30 ? "is-active" : ""}" href="${rangeBaseUrl}&days=30">30 days</a>
          <a class="${lookbackDays === 90 ? "is-active" : ""}" href="${rangeBaseUrl}&days=90">90 days</a>
          <a class="${safeMode === "fast" ? "is-active" : ""}" href="${modeBaseUrl}&mode=fast">Fast mode</a>
          <a class="${safeMode === "detail" ? "is-active" : ""}" href="${modeBaseUrl}&mode=detail">Detailed events</a>
        </nav>
      </div>
      <a class="admin-link" href="/admin/leads?token=${encodeURIComponent(token)}">Lead dashboard</a>
    </header>
    ${emptyMessage ? `<div class="notice">${escapeHtml(emptyMessage)}</div>` : ""}
    ${errors.length ? `<div class="notice notice--error"><strong>Some analytics queries failed.</strong><br>${errors.map((error) => escapeHtml(error)).join("<br>")}</div>` : ""}
    <section class="metrics" aria-label="Funnel summary">
      ${metricCard("Viewed", metricValue(funnel.viewed))}
      ${metricCard("Started", metricValue(funnel.started || 0))}
      ${metricCard("Find clicks", metricValue(funnel.find_clicked || 0))}
      ${metricCard("Contact views", metricValue(funnel.contact_viewed || 0))}
      ${metricCard("Submitted", metricValue(funnel.submitted || 0))}
      ${metricCard("Completion", percent(funnel.submitted, funnel.started), "submitted / started")}
    </section>
    <section class="panel">
      <h2>Recommendations</h2>
      <p>Early engagement with the Find Locations entry point for the Recommendation Experience.</p>
      ${renderRecommendationMetricCards(recommendationMetrics)}
    </section>
    <section class="panel">
      <h2>V1 vs V2 Performance</h2>
      <p>V2-only middle steps show as zero for older V1 events. Average completion time uses submitted-event duration when available.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Version</th><th>Views</th><th>Starts</th><th>Find clicks</th><th>Contact views</th><th>Submissions</th><th>Start rate</th><th>Submission rate</th><th>Completion rate</th><th>Avg completion</th></tr></thead>
          <tbody>${renderVersionPerformanceRows(versionPerformance)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Simplified V2 Funnel</h2>
      <p>Reflects the current V2 journey from visibility to submission.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Step</th><th>Count</th><th>% of previous</th><th>% of views</th></tr></thead>
          <tbody>${renderSimplifiedFunnelRows(simplifiedFunnel)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Daily Conversion Trend</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Day</th><th>Views</th><th>Starts</th><th>Find clicks</th><th>Contact views</th><th>Submissions</th><th>Start rate</th><th>Completion rate</th></tr></thead>
          <tbody>${renderDailyTrendRows(dailyTrend)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Growth Opportunities</h2>
      <p>Transparent rule-based guidance from observed Search Profile metrics. Recommendations disappear when the underlying signal no longer matches the rule.</p>
      ${renderGrowthRecommendations(growthRecommendations)}
    </section>
    <section class="panel">
      <h2>Search Profile Start Rate by Page Type</h2>
      <p>Uses the selected date range. Start rate is starts divided by viewed events; completion rate is submissions divided by starts.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Page Type</th><th>Views</th><th>Starts</th><th>Find clicks</th><th>Contact views</th><th>Start Rate</th><th>Submissions</th><th>Submission Rate</th><th>Completion Rate</th></tr></thead>
          <tbody>${renderStartRateByPageTypeRows(startRatesByPageType)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Top Searches</h2>
      <p>Grouped by location, space type, and size from completed V2 searches and submissions.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Search</th><th>Completed</th><th>Submissions</th><th>Completion rate</th><th>Version</th></tr></thead>
          <tbody>${renderTopSearchRows(topSearches)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Funnel Insights</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Step</th><th>Count</th><th>Completion</th><th>Drop-off from previous</th><th>Avg time from start</th></tr></thead>
          <tbody>${renderFunnelInsightRows(funnelInsights)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Step Counts</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Step event</th><th>Count</th></tr></thead>
          <tbody>${renderStepRows(stepCounts)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Top Pages</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Page</th><th>Page type</th><th>Started</th><th>Submitted</th><th>Submit rate</th></tr></thead>
          <tbody>${renderTopRows(topPages, [
            { key: "page_url", link: true },
            { key: "page_type" },
            { key: "started" },
            { key: "submitted" },
            { value: (row) => percent(row.submitted, row.started) },
          ])}</tbody>
        </table>
      </div>
    </section>
    <div class="panel-grid">
      <section class="panel">
        <h2>Top Districts</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>District</th><th>Started</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topDistricts, [{ key: "district" }, { key: "started" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Top Cities</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>City</th><th>Started</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topCities, [{ key: "city" }, { key: "started" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
    </div>
    <section class="panel">
      <h2>Top Comparison Pages</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Comparison</th><th>Started</th><th>Submitted</th><th>Submit rate</th></tr></thead>
          <tbody>${renderTopRows(topComparisons, [
            { key: "page_url", link: true },
            { key: "started" },
            { key: "submitted" },
            { value: (row) => percent(row.submitted, row.started) },
          ])}</tbody>
        </table>
      </div>
    </section>
    <div class="panel-grid">
      <section class="panel">
        <h2>Top Ecosystems</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Ecosystem</th><th>Started</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topEcosystems, [{ key: "business_ecosystem" }, { key: "started" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Submission Sources</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Source page</th><th>Page type</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(submissionSources, [{ key: "page_url", link: true }, { key: "page_type" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
    </div>
    <div class="panel-grid">
      <section class="panel">
        <h2>Top Space Types</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Space type</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topSpaceTypes, [{ key: "space_type" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Top Move-in Timings</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Timing</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topTimings, [{ key: "timing" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Top Size Requests</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Size / people</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topSizes, [{ key: "size_or_people" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Top Requested Features</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Feature</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topFeatures, [{ key: "feature" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
    </div>
    <section class="panel">
      <h2>Top Landing Pages</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Landing page</th><th>Submitted</th></tr></thead>
          <tbody>${renderTopRows(topLandingPages, [{ key: "landing_page", link: true }, { key: "submitted" }])}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Page Type Breakdown</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Page type</th><th>Started</th><th>Submitted</th><th>Submit rate</th></tr></thead>
          <tbody>${renderPageTypeRows(pageTypes)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Recent Activity</h2>
      <p>${escapeHtml(recentEventsNote)}</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Created</th><th>Event</th><th>Page type</th><th>Location</th><th>Space type</th><th>Size</th><th>Version</th></tr></thead>
          <tbody>${renderRecentActivityRows(recentEvents)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Recent Submissions</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Created</th><th>Page type</th><th>Location</th><th>Space type</th><th>City</th><th>District</th><th>Page URL</th></tr></thead>
          <tbody>${renderSubmissionRows(recentSubmissions)}</tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>`;
}

async function runAnalyticsQuery(db, label, query, bindings, errors) {
  try {
    const result = await db.prepare(query).bind(...bindings).all();
    return result.results || [];
  } catch (error) {
    if (isMissingTableError(error)) throw error;
    errors.push(`${label}: ${error.message || "query failed"}`);
    return [];
  }
}

async function fetchAnalytics(db, options = {}) {
  const lookbackDays = normalizeLookbackDays(options.lookbackDays);
  const mode = normalizeMode(options.mode);
  const lookbackStart = lookbackStartIso(lookbackDays);
  const errors = [];
  const includeViewed = mode === "detail";

  const eventCounts = await runAnalyticsQuery(db, "Event counts", `
    select event_name, count(*) as count, avg(nullif(duration_ms, 0)) as avg_duration_ms
    from search_profile_events
    where created_at >= ?
    group by event_name
    limit 20
  `, [lookbackStart], errors);

  const recommendationMetricRows = await runAnalyticsQuery(db, "Find Locations recommendation metrics", `
    select
      sum(case when created_at >= ? and event_name = 'find_locations_page_viewed' then 1 else 0 end) as views_7,
      sum(case when created_at >= ? and event_name = 'find_locations_primary_cta_clicked' then 1 else 0 end) as clicks_7,
      sum(case when event_name = 'find_locations_page_viewed' then 1 else 0 end) as views_30,
      sum(case when event_name = 'find_locations_primary_cta_clicked' then 1 else 0 end) as clicks_30
    from search_profile_events
    where created_at >= ?
      and event_name in ('find_locations_page_viewed', 'find_locations_primary_cta_clicked')
  `, [lookbackStartIso(7), lookbackStartIso(7), lookbackStartIso(30)], errors);

  const funnel = { viewed: 0, started: 0, find_clicked: 0, contact_viewed: 0, submitted: 0 };
  const stepCounts = {};
  const stepDurations = {};
  const recommendationMetricRow = recommendationMetricRows[0] || {};
  const recommendationMetrics = [
    {
      days: 7,
      views: Number(recommendationMetricRow.views_7 || 0),
      clicks: Number(recommendationMetricRow.clicks_7 || 0),
    },
    {
      days: 30,
      views: Number(recommendationMetricRow.views_30 || 0),
      clicks: Number(recommendationMetricRow.clicks_30 || 0),
    },
  ];
  for (const row of eventCounts) {
    if (row.event_name === "search_profile_viewed") funnel.viewed = Number(row.count || 0);
    if (row.event_name === "search_profile_started") funnel.started = Number(row.count || 0);
    if (row.event_name === "search_profile_find_matching_buildings_clicked") funnel.find_clicked = Number(row.count || 0);
    if (row.event_name === "search_profile_contact_screen_viewed") funnel.contact_viewed = Number(row.count || 0);
    if (row.event_name === "search_profile_submitted") funnel.submitted = Number(row.count || 0);
    if (String(row.event_name || "").endsWith("_completed")) stepCounts[row.event_name] = Number(row.count || 0);
    stepDurations[row.event_name] = Number(row.avg_duration_ms || 0);
  }

  const sampleRows = await runAnalyticsQuery(db, "Recent analytics sample", `
    select created_at, event_name, profile_version, page_type, location_display, space_type, size_or_people, page_url
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_find_matching_buildings_clicked', 'search_profile_contact_screen_viewed', 'search_profile_submitted')
    order by created_at desc
    limit 25
  `, [lookbackStart], errors);

  const viewedRows = await runAnalyticsQuery(db, "Recent viewed-page sample", `
    select page_url, page_type
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_viewed'
      and page_url != ''
    order by created_at desc
    limit ?
  `, [lookbackStart, VIEW_SAMPLE_LIMIT], errors);

  const sampleSummary = summarizeRows(sampleRows, includeViewed);
  if (!eventCounts.length) {
    funnel.viewed = sampleSummary.funnel.viewed;
    funnel.started = sampleSummary.funnel.started;
    funnel.submitted = sampleSummary.funnel.submitted;
    Object.assign(stepCounts, sampleSummary.stepCounts);
  }

  const versionPerformance = await runAnalyticsQuery(db, "V1 vs V2 performance", `
    select coalesce(nullif(profile_version, ''), 'V1D') as profile_version,
      sum(case when event_name = 'search_profile_viewed' then 1 else 0 end) as views,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_find_matching_buildings_clicked' then 1 else 0 end) as find_clicked,
      sum(case when event_name = 'search_profile_contact_screen_viewed' then 1 else 0 end) as contact_viewed,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted,
      avg(case when event_name = 'search_profile_submitted' then nullif(duration_ms, 0) else null end) as avg_completion_time
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_viewed', 'search_profile_started', 'search_profile_find_matching_buildings_clicked', 'search_profile_contact_screen_viewed', 'search_profile_submitted')
    group by coalesce(nullif(profile_version, ''), 'V1D')
    order by profile_version desc
    limit 10
  `, [lookbackStart], errors);

  const dailyTrend = await runAnalyticsQuery(db, "Daily conversion trend", `
    select substr(created_at, 1, 10) as day,
      sum(case when event_name = 'search_profile_viewed' then 1 else 0 end) as views,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_find_matching_buildings_clicked' then 1 else 0 end) as find_clicked,
      sum(case when event_name = 'search_profile_contact_screen_viewed' then 1 else 0 end) as contact_viewed,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_viewed', 'search_profile_started', 'search_profile_find_matching_buildings_clicked', 'search_profile_contact_screen_viewed', 'search_profile_submitted')
    group by substr(created_at, 1, 10)
    order by day desc
    limit ?
  `, [lookbackStart, lookbackDays], errors);

  const pageTypes = await runAnalyticsQuery(db, "Page type breakdown", `
    select page_type,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_find_matching_buildings_clicked' then 1 else 0 end) as find_clicked,
      sum(case when event_name = 'search_profile_contact_screen_viewed' then 1 else 0 end) as contact_viewed,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_find_matching_buildings_clicked', 'search_profile_contact_screen_viewed', 'search_profile_submitted')
    group by page_type
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const startRatesByPageType = await runAnalyticsQuery(db, "Start rate by page type", `
    select page_type,
      sum(case when event_name = 'search_profile_viewed' then 1 else 0 end) as views,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_find_matching_buildings_clicked' then 1 else 0 end) as find_clicked,
      sum(case when event_name = 'search_profile_contact_screen_viewed' then 1 else 0 end) as contact_viewed,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_viewed', 'search_profile_started', 'search_profile_find_matching_buildings_clicked', 'search_profile_contact_screen_viewed', 'search_profile_submitted')
    group by page_type
    order by submitted desc, started desc, views desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topSearches = await runAnalyticsQuery(db, "Top searches", `
    select location_display, space_type, size_or_people,
      coalesce(nullif(profile_version, ''), 'V1D') as profile_version,
      sum(case when event_name in ('search_profile_find_matching_buildings_clicked', 'search_profile_submitted') then 1 else 0 end) as completed,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_find_matching_buildings_clicked', 'search_profile_submitted')
      and (location_display != '' or space_type != '' or size_or_people != '')
    group by location_display, space_type, size_or_people, coalesce(nullif(profile_version, ''), 'V1D')
    order by submitted desc, completed desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topPages = await runAnalyticsQuery(db, "Top pages", `
    select page_url, page_type,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and page_url != ''
    group by page_url, page_type
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topDistricts = await runAnalyticsQuery(db, "Top districts", `
    select district,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and district != ''
    group by district
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topComparisons = await runAnalyticsQuery(db, "Top comparison pages", `
    select page_url,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and page_type = 'comparison'
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and page_url != ''
    group by page_url
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topCities = await runAnalyticsQuery(db, "Top cities", `
    select city,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and city != ''
    group by city
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topEcosystems = await runAnalyticsQuery(db, "Top ecosystems", `
    select business_ecosystem,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and business_ecosystem != ''
    group by business_ecosystem
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topSpaceTypes = await runAnalyticsQuery(db, "Top space types", `
    select space_type, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and space_type != ''
    group by space_type
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topTimings = await runAnalyticsQuery(db, "Top move-in timings", `
    select timing, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and timing != ''
    group by timing
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topSizes = await runAnalyticsQuery(db, "Top size requests", `
    select size_or_people, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and size_or_people != ''
    group by size_or_people
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topLandingPages = await runAnalyticsQuery(db, "Top landing pages", `
    select landing_page, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and landing_page != ''
    group by landing_page
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const submissionSources = await runAnalyticsQuery(db, "Submission sources", `
    select page_url, page_type, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and page_url != ''
    group by page_url, page_type
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const featureRows = await runAnalyticsQuery(db, "Requested features", `
    select features
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and features != ''
    order by created_at desc
    limit ?
  `, [lookbackStart, PROFILE_DIMENSION_SAMPLE_LIMIT], errors);

  const recentSubmissions = await runAnalyticsQuery(db, "Recent submissions", `
    select created_at, page_type, location_display, space_type, city, district, page_url
    from search_profile_events
    where event_name = 'search_profile_submitted'
      and created_at >= ?
    order by created_at desc
    limit ?
  `, [lookbackStart, RECENT_SUBMISSIONS_LIMIT], errors);

  const normalizedData = {
    funnel,
    stepCounts,
    versionPerformance: normalizeVersionRows(versionPerformance),
    simplifiedFunnel: buildSimplifiedFunnel(funnel),
    dailyTrend: normalizeDailyRows(dailyTrend),
    funnelInsights: buildFunnelInsights(funnel, stepCounts, stepDurations),
    pageTypes: normalizeAggregateRows(pageTypes, "page_type"),
    startRatesByPageType: normalizeStartRateRows(startRatesByPageType),
    topSearches: normalizeTopSearchRows(topSearches),
    topPages: normalizeAggregateRows(topPages, "page_url"),
    topDistricts: normalizeAggregateRows(topDistricts, "district"),
    topComparisons: normalizeAggregateRows(topComparisons, "page_url"),
    topCities: normalizeAggregateRows(topCities, "city"),
    topEcosystems: normalizeAggregateRows(topEcosystems, "business_ecosystem"),
    topSpaceTypes,
    topFeatures: topFeaturesFromRows(featureRows),
    topTimings,
    topSizes,
    topLandingPages,
    submissionSources,
    recommendationMetrics,
    topViewedPages: topViewedPagesFromRows(viewedRows),
  };

  return {
    lookbackDays,
    mode,
    errors,
    ...normalizedData,
    growthRecommendations: buildGrowthRecommendations(normalizedData),
    recentEvents: sampleRows.slice(0, RECENT_EVENTS_LIMIT),
    recentSubmissions,
  };
}

export async function onRequestGet({ request, env, waitUntil }) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    return adminResponse("Admin dashboard is not configured.", 403);
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const lookbackDays = normalizeLookbackDays(url.searchParams.get("days"));
  const mode = normalizeMode(url.searchParams.get("mode"));
  if (token !== configuredToken) {
    return adminResponse("Forbidden", 403);
  }

  const db = getAnalyticsDb(env);
  if (!db) {
    return adminResponse("<h1>Search Profile Analytics</h1><p>SEARCH_PROFILE_EVENTS_DB or LEADS_DB D1 binding is not configured.</p>", 500);
  }

  try {
    await ensureSearchProfileEventsTable(db);
    scheduleSearchProfileEventIndexes(waitUntil, db);
    const data = await fetchAnalytics(db, { lookbackDays, mode });
    return adminResponse(renderPage({ token, ...data }));
  } catch (error) {
    if (isMissingTableError(error)) {
      return adminResponse(renderEmptyState(token, lookbackDays));
    }
    return adminResponse(renderPage({
      token,
      lookbackDays,
      mode,
      errors: [error.message || "Search Profile analytics failed before data could be loaded."],
      funnel: { viewed: 0, started: 0, find_clicked: 0, contact_viewed: 0, submitted: 0 },
      stepCounts: {},
      versionPerformance: [],
      simplifiedFunnel: [],
      dailyTrend: [],
      pageTypes: [],
      startRatesByPageType: [],
      topSearches: [],
      recommendationMetrics: [],
      recentEvents: [],
      recentSubmissions: [],
    }), 200);
  }
}
