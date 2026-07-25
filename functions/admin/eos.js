import eosAnalysis from "../../data/generated/eos-analysis.json";

function adminResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tokenParam(token) {
  return `token=${encodeURIComponent(token)}`;
}

function pct(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

function progress(value, label = "progress") {
  const safeValue = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return `
    <div class="progress" aria-label="${escapeHtml(label)} ${safeValue}%">
      <span style="width: ${safeValue}%"></span>
    </div>
  `;
}

function stars(count) {
  const safeCount = Math.max(1, Math.min(5, Math.round(Number(count) || 1)));
  return `<span class="stars" aria-label="${safeCount} of 5 priority">${"★".repeat(safeCount)}${"☆".repeat(5 - safeCount)}</span>`;
}

function statusClass(statusId) {
  return `status--${String(statusId || "planning").replace(/_/g, "-")}`;
}

function renderNav(token) {
  return `
    <nav class="admin-nav" aria-label="Admin navigation">
      <a class="button-link button-link--active" href="/admin/eos?${tokenParam(token)}">EOS</a>
      <a class="button-link" href="/admin/publisher?${tokenParam(token)}">Publisher</a>
      <a class="button-link" href="/admin/compass?${tokenParam(token)}">Rofo Compass</a>
      <a class="button-link" href="/admin/field-photos?${tokenParam(token)}">Field Photos</a>
      <a class="button-link" href="/admin/coverage?${tokenParam(token)}">Compass Coverage</a>
      <a class="button-link" href="/admin/operations?${tokenParam(token)}">Operations</a>
    </nav>
  `;
}

function renderMetric(label, value, note = "") {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${note ? `<p>${escapeHtml(note)}</p>` : ""}
    </article>
  `;
}

function taskUrl(token, taskId) {
  return `/admin/eos?${tokenParam(token)}&task=${encodeURIComponent(taskId)}`;
}

function plainText(value) {
  return String(value || "").replace(/\r\n/g, "\n").trim();
}

function listLines(items) {
  const values = (items || []).filter(Boolean).map((item) => plainText(item)).filter(Boolean);
  return values.length ? values.map((item) => `- ${item}`).join("\n") : "- None specified";
}

function architectureDocsForTask(task, packet) {
  const docs = new Set([
    "docs/product/rofo-master-plan.md",
    "docs/editorial-operating-system.md",
  ]);
  const category = task.category || "";
  const moduleId = task.suggestedModule && task.suggestedModule.id;
  if (moduleId === "publisher" || category === "commercialEcosystem") {
    docs.add("docs/rofo-publisher.md");
    docs.add("docs/publisher-metro-expansion-planner.md");
  }
  if (moduleId === "compass" || category === "recommendationReadiness") {
    docs.add("docs/rofo-compass.md");
    docs.add("docs/recommendation-expansion-roadmap.md");
  }
  if (moduleId === "fieldMode" || category === "photography") docs.add("docs/field-mode.md");
  if (moduleId === "knowledgeGraph" || category === "districtCoverage" || category === "comparisonGraph" || category === "internalLinking") {
    docs.add("docs/location-knowledge-graph.md");
  }
  if (category === "buildingBriefs") {
    docs.add("docs/building-page-standard.md");
    docs.add("docs/industrial-flex-building-brief-standard.md");
  }
  if (category === "representativeBuildings") docs.add("docs/representative-building-intelligence.md");
  if (category === "commercialEcosystem") docs.add("docs/commercial-ecosystem-data-model.md");
  for (const file of packet.files || []) {
    if (String(file).startsWith("docs/")) docs.add(file);
  }
  return Array.from(docs);
}

function codexPromptForTask(task, packet) {
  const docs = architectureDocsForTask(task, packet);
  const dependencies = packet.dependencies && packet.dependencies.length
    ? `\nDependencies\n${listLines(packet.dependencies)}\n`
    : "";
  return plainText(`
Read docs/product/rofo-master-plan.md and the relevant architecture documentation before making changes.

Relevant architecture documentation
${listLines(docs)}

Task
${plainText(task.title)}

Objective
${plainText(packet.objective)}

Reason
${listLines(packet.reason)}

Current health
${plainText(packet.currentHealth)}

Relevant files
${listLines(packet.files)}
${dependencies}
Acceptance criteria
${listLines(packet.acceptanceCriteria)}

Expected deliverables
${listLines(packet.expectedDeliverables)}

QA commands
${listLines(packet.qaCommands)}

Required review
${packet.requiredReview ? "Yes" : "No"}

Scope constraints
- Inspect the current repository state, git status, and relevant diff before editing.
- Verify this task remains valid against the current generated data before changing source files.
- Preserve Publisher, Compass, EOS, Field Mode, Knowledge Graph, and editorial ownership boundaries.
- Regenerate required snapshots when source data or generated analysis changes.
- Do not broaden scope beyond this execution packet.
- Do not begin persistent lifecycle state, review intake, or EOS v2.3 unless explicitly requested.
- Preserve recommendation rankings, Search Profile behavior, Publisher scoring, public URLs, and unrelated public-page behavior unless this packet explicitly requires otherwise.
- Keep changes additive and deterministic where possible.

Final response
Return your final implementation using the following format exactly.

EOS Standardized Execution Report v1

Architecture Discovery
[Summarize the relevant architecture discovered before implementation.]

Implementation Summary
[Summarize what changed.]

Files Changed
[List source, generated, documentation, and QA files changed.]

Results
[Report measurable before/after results and whether the objective was satisfied.]

Validation
[List commands run and their outcomes.]

Remaining Limitations
[Call out unresolved limitations, deferred work, or review-required items.]

Recommended Next Highest-Leverage Improvement
[Name the next focused improvement suggested by the evidence.]
`);
}

function signalRow(signal) {
  return `
    <div class="signal-row">
      <div>
        <span>${escapeHtml(signal.label)}</span>
        <small>${escapeHtml(signal.state && signal.state.label ? signal.state.label : signal.source || "")}</small>
      </div>
      <strong>${pct(signal.score)}</strong>
      ${progress(signal.score, signal.label)}
    </div>
  `;
}

function renderMetroCard(metro, token) {
  const signals = [
    metro.publisherConfidence,
    metro.commercialEcosystemCoverage,
    metro.recommendationCoverage,
    metro.representativeBuildingCoverage,
    metro.photographyCoverage,
    metro.editorialCoverage,
    metro.internalLinking,
    metro.handbookCoverage,
  ].filter(Boolean);

  return `
    <article class="metro-card">
      <div class="metro-card__top">
        <div>
          <h2>${escapeHtml(metro.metroName)}</h2>
          <span class="status-pill ${statusClass(metro.status.id)}">${escapeHtml(metro.status.label)}</span>
        </div>
        <div class="health-score">
          <strong>${pct(metro.overallEditorialHealth.score)}</strong>
          <span>Overall Editorial Health</span>
        </div>
      </div>
      ${progress(metro.overallEditorialHealth.score, `${metro.metroName} editorial health`)}
      <div class="signal-grid">
        ${signals.map(signalRow).join("")}
      </div>
      <div class="metro-card__footer">
        <p>${escapeHtml((metro.overallEditorialHealth.rationale || [])[0] || metro.source.publisherStatus || "No immediate blocker detected.")}</p>
        <a href="/admin/eos?${tokenParam(token)}&metro=${encodeURIComponent(metro.metroId)}">View plan</a>
      </div>
    </article>
  `;
}

function renderWorkItem(item, token) {
  return `
    <article class="work-item">
      <div class="work-item__priority">
        ${stars(item.priorityStars)}
        <span>${escapeHtml(item.expectedEditorialImpact)} impact</span>
      </div>
      <div class="work-item__body">
        <div class="work-item__heading">
          <div>
            <span class="module-pill">${escapeHtml(item.suggestedModule.label)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.metroName)}${item.itemName ? ` · ${escapeHtml(item.itemName)}` : ""}</p>
          </div>
          <span class="automation">${escapeHtml(item.automationLevel.label)}</span>
        </div>
        <dl>
          <div><dt>Effort</dt><dd>${escapeHtml(item.estimatedEffort)}</dd></div>
          <div><dt>Confidence</dt><dd>${escapeHtml(item.confidence)}</dd></div>
          <div><dt>Status</dt><dd>${escapeHtml(item.status)}</dd></div>
          <div><dt>Category</dt><dd>${escapeHtml(item.categoryLabel)}</dd></div>
        </dl>
        <div class="why">
          <strong>Why this task</strong>
          <ul>
            ${(item.why || []).slice(0, 4).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
          </ul>
        </div>
        ${item.dependencies && item.dependencies.length ? `
          <p class="dependencies"><strong>Dependencies:</strong> ${escapeHtml(item.dependencies.join(", "))}</p>
        ` : ""}
        ${item.executionPacket ? `<a class="start-work" href="${taskUrl(token, item.id)}">Commence Work</a>` : ""}
      </div>
    </article>
  `;
}

function renderExecutionPacket(eos, taskId, token) {
  const allTasks = [
    ...(eos.workQueue || []),
    ...(((eos.portfolioQueues || {}).expansionQueue) || []),
  ];
  const task = allTasks.find((item) => item.id === taskId);
  if (!task || !task.executionPacket) return "";
  const packet = task.executionPacket;
  const codexPrompt = codexPromptForTask(task, packet);
  return `
    <section class="panel execution-packet">
      <a class="back-link" href="/admin/eos?${tokenParam(token)}">Back to EOS</a>
      <div class="section-heading">
        <div>
          <h2>Execution Packet</h2>
          <p>${escapeHtml(task.title)}</p>
        </div>
        <span class="automation">${escapeHtml(packet.automationLevel.label)}</span>
      </div>
      <div class="packet-grid">
        <article>
          <h3>Objective</h3>
          <p>${escapeHtml(packet.objective)}</p>
          <h3>Reason</h3>
          <ul>${(packet.reason || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <h3>Current Health</h3>
          <p>${escapeHtml(packet.currentHealth)}</p>
        </article>
        <article>
          <h3>Execution Providers</h3>
          <ul>${(packet.providers || []).map((provider) => `<li>${escapeHtml(provider.label)} · ${escapeHtml(provider.description)}</li>`).join("")}</ul>
          <h3>Required Review</h3>
          <p>${packet.requiredReview ? "Yes" : "No"}</p>
        </article>
      </div>
      <div class="handoff-rail">
        ${(packet.handoff || []).map((step) => `
          <article>
            <span>${escapeHtml(step.label)}</span>
            <p>${escapeHtml(step.description)}</p>
          </article>
        `).join("")}
      </div>
      <section class="codex-handoff" aria-label="Codex prompt handoff">
        <div class="codex-handoff__top">
          <div>
            <h3>Codex Prompt Handoff</h3>
            <p>Copy a deterministic prompt generated from this execution packet. No execution is started from EOS.</p>
          </div>
          <button class="copy-prompt-button" type="button" data-copy-prompt>Copy Codex Prompt</button>
        </div>
        <p class="terminal-guidance">After copying, run <code>eoscodex</code> if you have that alias configured, or paste the prompt into the current Codex session.</p>
        <details class="prompt-preview">
          <summary>Prompt Preview</summary>
          <textarea class="prompt-preview__text" data-codex-prompt readonly>${escapeHtml(codexPrompt)}</textarea>
        </details>
        <p class="copy-status" data-copy-status role="status" aria-live="polite"></p>
      </section>
      <section class="mission-debrief" aria-label="Mission Debrief">
        <div class="section-heading">
          <div>
            <h3>Mission Debrief</h3>
            <p>Paste EOS Standardized Execution Report here. Imported reports are browser state only and are not persisted.</p>
          </div>
        </div>
        <div class="mission-debrief__actions">
          <button class="secondary-button" type="button" data-import-ser>Import Report</button>
          <button class="secondary-button secondary-button--muted" type="button" data-clear-ser>Clear</button>
        </div>
        <textarea class="mission-debrief__input" data-ser-input placeholder="Paste EOS Standardized Execution Report here."></textarea>
        <div class="mission-review" data-mission-review hidden>
          <section class="mission-review__hero" aria-label="Mission Review">
            <div>
              <span class="mission-kicker">Mission Review</span>
              <h3 data-ser-recommendation>Needs Manual QA</h3>
              <p>Deterministic review generated from the imported execution report. This does not approve or publish work.</p>
            </div>
            <div class="mission-review__status">
              <span>Mission Status</span>
              <strong data-review-status>Report Imported</strong>
            </div>
          </section>
          <div class="review-grid review-grid--hero">
            <article>
              <span>Objective Satisfied</span>
              <strong data-review-completed>Not reported</strong>
            </article>
            <article>
              <span>Validation Outcome</span>
              <strong data-review-validation>Not reported</strong>
            </article>
            <article>
              <span>Current Constraint</span>
              <strong data-review-followup>Not reported</strong>
            </article>
            <article>
              <span>Outstanding Limitations</span>
              <strong data-review-limitations>Not reported</strong>
            </article>
          </div>
          <div class="improvement-panel" data-improvement-panel hidden>
            <span>Measurable Improvement</span>
            <div data-improvement-list></div>
          </div>
          <div class="recommendation-panel">
            <h4>Why this recommendation</h4>
            <p>EOS selected this mission from structured packet evidence:</p>
            <ul>${(packet.reason || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="mission-comparison">
            <article>
              <h3>Mission</h3>
              <dl>
                <div><dt>Objective</dt><dd>${escapeHtml(packet.objective)}</dd></div>
                <div><dt>Current Health</dt><dd>${escapeHtml(packet.currentHealth)}</dd></div>
                <div><dt>Required Review</dt><dd>${packet.requiredReview ? "Yes" : "No"}</dd></div>
              </dl>
              <h4>Acceptance Criteria</h4>
              <ul>${(packet.acceptanceCriteria || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
              <h4>QA Commands</h4>
              <ul>${(packet.qaCommands || []).map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join("")}</ul>
            </article>
            <article>
              <h3>Execution Report</h3>
              <div class="ser-sections" data-ser-sections></div>
              <details class="raw-report">
                <summary>Raw Report</summary>
                <pre data-ser-raw></pre>
              </details>
            </article>
          </div>
          <label class="reviewer-notes">
            <span>Reviewer Notes</span>
            <textarea data-reviewer-notes placeholder="Add manual review notes. Browser state only."></textarea>
          </label>
        </div>
      </section>
      <div class="packet-grid packet-grid--wide">
        <article>
          <h3>Files</h3>
          <ul>${(packet.files || []).map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join("")}</ul>
        </article>
        <article>
          <h3>Acceptance Criteria</h3>
          <ul>${(packet.acceptanceCriteria || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>
        <article>
          <h3>Expected Deliverables</h3>
          <ul>${(packet.expectedDeliverables || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>
        <article>
          <h3>QA Commands</h3>
          <ul>${(packet.qaCommands || []).map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join("")}</ul>
        </article>
      </div>
    </section>
  `;
}

function renderSelectedMetro(eos, metroId, token) {
  const metro = eos.metros.find((item) => item.metroId === metroId);
  if (!metro) return "";
  const queue = eos.workQueue.filter((item) => item.metroId === metroId).slice(0, 8);
  return `
    <section class="panel selected-metro">
      <a class="back-link" href="/admin/eos?${tokenParam(token)}">All metros</a>
      <div class="section-heading">
        <div>
          <h2>${escapeHtml(metro.metroName)} Editorial Plan</h2>
          <p>Health signals and work recommendations generated from Publisher, Compass, Field Mode planning, and EOS rules.</p>
        </div>
        <div class="health-score health-score--large">
          <strong>${pct(metro.overallEditorialHealth.score)}</strong>
          <span>${escapeHtml(metro.status.label)}</span>
        </div>
      </div>
      <div class="selected-grid">
        <div class="signal-grid signal-grid--detail">
          ${Object.values(metro.healthSignals).map(signalRow).join("")}
        </div>
        <div class="detail-panel">
          <h3>Examples</h3>
          <ul>
            ${(metro.examples || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || `<li>No examples available.</li>`}
          </ul>
          <h3>Commercial Ecosystem</h3>
          <p>${escapeHtml(metro.commercialEcosystemCoverage.label || "Not measured")}</p>
          <p>${escapeHtml((metro.commercialEcosystemCoverage.blockingEcosystems || []).length ? `Blocking ecosystems: ${metro.commercialEcosystemCoverage.blockingEcosystems.join(", ")}` : "No blocking ecosystem reported by Publisher.")}</p>
        </div>
      </div>
    </section>
    <section class="queue-section">
      <div class="section-heading">
        <div>
          <h2>${escapeHtml(metro.metroName)} Work Queue</h2>
          <p>Prioritized EOS items with automation level, effort, dependencies, and measurable rationale.</p>
        </div>
      </div>
      <div class="work-queue">${queue.map((item) => renderWorkItem(item, token)).join("")}</div>
    </section>
  `;
}

function renderQueueSummary(eos) {
  const queues = eos.portfolioQueues || {};
  return `
    <section class="queue-summary">
      <article>
        <span>Editorial Queue</span>
        <strong>${escapeHtml((queues.editorialQueue || []).length)}</strong>
        <p>Existing metro improvement work.</p>
      </article>
      <article>
        <span>Expansion Queue</span>
        <strong>${escapeHtml((queues.expansionQueue || []).length)}</strong>
        <p>Future metro projects.</p>
      </article>
      <article>
        <span>Field Mode Queue</span>
        <strong>${escapeHtml((queues.fieldModeQueue || []).length)}</strong>
        <p>Photography summaries by metro.</p>
      </article>
      <article>
        <span>Review Queue</span>
        <strong>${escapeHtml((queues.reviewQueue || []).length)}</strong>
        <p>Returned execution work.</p>
      </article>
    </section>
  `;
}

function renderExpansionProject(project, token) {
  return `
    <article class="expansion-card">
      <div class="expansion-card__top">
        <div>
          <h3>${escapeHtml(project.metroName)}</h3>
          <span class="status-pill status--planning">${escapeHtml(project.statusLabel)}</span>
        </div>
        <div class="health-score">
          <strong>${pct(project.investmentScore.score)}</strong>
          <span>Investment Score</span>
        </div>
      </div>
      ${progress(project.overallProgress, `${project.metroName} expansion progress`)}
      <ol class="stage-list">
        ${(project.stages || []).map((stage) => `<li class="stage stage--${escapeHtml(stage.status)}">${escapeHtml(stage.label)}</li>`).join("")}
      </ol>
      <div class="workstream-list" aria-label="${escapeHtml(project.metroName)} expansion workstreams">
        ${(project.workstreams || []).map((stream) => `
          <div class="workstream-row">
            <span>${escapeHtml(stream.label)}</span>
            <strong>${pct(stream.progress)}</strong>
            ${progress(stream.progress, `${project.metroName} ${stream.label}`)}
          </div>
        `).join("")}
      </div>
      <p>${escapeHtml(project.nextAction)}</p>
      <a href="${taskUrl(token, `expansion-queue:${project.metroId}`)}">Commence Work</a>
    </article>
  `;
}

function renderFieldModeCard(item, token) {
  return `
    <article class="field-mode-card">
      <div>
        <h3>${escapeHtml(item.metroName)}</h3>
        <p>${escapeHtml(item.title)}</p>
      </div>
      <div class="health-score">
        <strong>${pct(item.coverageScore)}</strong>
        <span>Photography Coverage</span>
      </div>
      ${progress(item.coverageScore, item.title)}
      <p><strong>Remaining Targets:</strong> ${escapeHtml(item.remainingTargets)}</p>
      <a href="/admin/field-photos?${tokenParam(token)}">Open Field Mode</a>
    </article>
  `;
}

function renderReviewQueue(eos, token) {
  const items = ((eos.portfolioQueues || {}).reviewQueue || []);
  if (!items.length) {
    return `
      <section class="panel review-empty">
        <h2>Review Queue</h2>
        <p>No autonomous execution work has been returned for review yet. Future providers will move completed packets here before approval.</p>
      </section>
    `;
  }
  return `
    <section class="queue-section">
      <div class="section-heading"><div><h2>Review Queue</h2><p>Returned autonomous work waiting on editorial approval.</p></div></div>
      <div class="work-queue">${items.map((item) => renderWorkItem(item, token)).join("")}</div>
    </section>
  `;
}

function renderHandoffSummary(eos) {
  return `
    <section class="handoff-summary">
      ${(eos.executionHandoff || []).map((step) => `
        <article>
          <span>${escapeHtml(step.label)}</span>
          <p>${escapeHtml(step.description)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderInventory(eos, token) {
  const items = ((eos.portfolioQueues || {}).editorialQueue || []).slice(0, 100);
  return `
    <section class="queue-section">
      <a class="back-link" href="/admin/eos?${tokenParam(token)}">Back to EOS</a>
      <div class="section-heading">
        <div>
          <h2>Opportunity Inventory</h2>
          <p>The complete editorial opportunity inventory remains available, but it is intentionally not the EOS homepage.</p>
        </div>
      </div>
      <div class="work-queue">${items.map((item) => renderWorkItem(item, token)).join("")}</div>
    </section>
  `;
}

function renderOverview(eos, token) {
  const queues = eos.portfolioQueues || {};
  const todaysWork = queues.todaysRecommendedWork || [];
  const inventory = queues.opportunityInventory || {};
  const expansionProjects = eos.expansionProjects || [];
  const fieldMode = (queues.fieldModeQueue || []).slice(0, 4);
  return `
    <section class="metrics" aria-label="EOS overview">
      ${renderMetric("Metros", eos.overview.metroCount, "Publisher-configured operating markets")}
      ${renderMetric("Average Health", pct(eos.overview.averageHealth), "EOS editorial health model")}
      ${renderMetric("Today's Work", eos.overview.activeWorkItems, "Recommended execution focus")}
      ${renderMetric("Opportunity Inventory", inventory.total || 0, "Hidden from homepage by default")}
      ${renderMetric("Expansion Projects", eos.overview.expansionProjects, "Future metros")}
      ${renderMetric("Review Items", eos.overview.reviewItems, "Returned execution work")}
      ${renderMetric("Autonomous Candidates", eos.overview.autonomousCandidates, "Future automation-ready work")}
    </section>

    ${renderQueueSummary(eos)}
    ${renderHandoffSummary(eos)}

    <section class="queue-section">
      <div class="section-heading">
        <div>
          <h2>Today's Recommended Work</h2>
          <p>EOS highlights the next 5-10 editorial items instead of exposing the full opportunity inventory.</p>
        </div>
        <a href="/admin/eos?${tokenParam(token)}&queue=inventory">${escapeHtml(inventory.total || 0)} Opportunities · View All</a>
      </div>
      <div class="work-queue">${todaysWork.map((item) => renderWorkItem(item, token)).join("")}</div>
    </section>

    <section class="section-heading section-heading--standalone">
      <div>
        <h2>Metro Health</h2>
        <p>Overall Editorial Health is separate from the Publisher score and combines coverage, confidence, photography, links, handbook integration, and ecosystem balance.</p>
      </div>
    </section>
    <section class="metro-grid">
      ${eos.metros.map((metro) => renderMetroCard(metro, token)).join("")}
    </section>

    <section class="queue-section">
      <div class="section-heading">
        <div>
          <h2>Expansion Queue</h2>
          <p>Future metros are managed as multi-stage projects with Investment Scores.</p>
        </div>
      </div>
      <div class="expansion-grid">${expansionProjects.map((project) => renderExpansionProject(project, token)).join("")}</div>
    </section>

    <section class="queue-section">
      <div class="section-heading">
        <div>
          <h2>Field Mode Queue</h2>
          <p>Photography work is summarized by metro and executed inside Field Mode.</p>
        </div>
      </div>
      <div class="field-mode-grid">${fieldMode.map((item) => renderFieldModeCard(item, token)).join("")}</div>
    </section>

    ${renderReviewQueue(eos, token)}
  `;
}

function renderSnapshotError(token) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EOS Unavailable | Rofo Admin</title>
</head>
<body>
  <main>
    <h1>EOS snapshot unavailable</h1>
    <p>Run <code>npm run publisher:snapshot</code> and rebuild before opening EOS.</p>
    <p><a href="/admin/operations?${tokenParam(token)}">Back to Operations</a></p>
  </main>
</body>
</html>`;
}

function renderPage({ token, eos, selectedMetro, selectedTask, selectedQueue }) {
  const body = selectedTask
    ? renderExecutionPacket(eos, selectedTask, token)
    : selectedQueue === "inventory"
      ? renderInventory(eos, token)
      : selectedMetro
        ? renderSelectedMetro(eos, selectedMetro, token)
        : renderOverview(eos, token);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Editorial Operating System | Rofo Admin</title>
  <style>
    :root { --ink: #152033; --muted: #66758b; --blue: #2457d6; --border: #dbe4ef; --bg: #f4f7fb; --card: #ffffff; --soft: #f8fafc; --green: #0f766e; --amber: #b45309; --red: #b91c1c; --purple: #6d28d9; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: radial-gradient(circle at top left, #eef5ff 0, transparent 340px), var(--bg); font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1440px, calc(100% - 40px)); margin: 0 auto; padding: 34px 0 58px; }
    h1, h2, h3, p { margin-top: 0; }
    h1 { max-width: 900px; margin-bottom: 10px; font-size: clamp(2.25rem, 4.8vw, 4.6rem); line-height: 0.98; letter-spacing: 0; }
    h2 { margin-bottom: 8px; font-size: 1.35rem; letter-spacing: 0; }
    h3 { margin-bottom: 6px; font-size: 1.05rem; letter-spacing: 0; }
    p, li, dd, small { color: var(--muted); line-height: 1.5; }
    a { color: var(--blue); font-weight: 850; text-decoration: none; }
    .hero { margin-bottom: 24px; }
    .hero p { max-width: 840px; font-size: 1.08rem; }
    .admin-nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 0; }
    .button-link { display: inline-flex; align-items: center; min-height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--card); color: var(--ink); font-weight: 850; }
    .button-link--active { border-color: #bfdbfe; background: #eff6ff; color: #1d4ed8; }
    .metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin: 22px 0; }
    .metric-card, .metro-card, .panel, .work-item { border: 1px solid var(--border); border-radius: 18px; background: rgba(255, 255, 255, 0.94); box-shadow: 0 16px 44px rgba(15, 23, 42, 0.055); }
    .metric-card { padding: 16px; }
    .metric-card span, dt { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
    .metric-card strong { display: block; margin: 8px 0 5px; font-size: 1.55rem; letter-spacing: 0; }
    .metric-card p { margin: 0; font-size: 0.82rem; }
    .section-heading { display: flex; justify-content: space-between; gap: 16px; align-items: start; margin: 0 0 14px; }
    .section-heading--standalone { margin-top: 8px; }
    .section-heading p { max-width: 760px; margin-bottom: 0; }
    .metro-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metro-card { display: grid; gap: 14px; padding: 18px; }
    .metro-card__top { display: flex; justify-content: space-between; gap: 18px; align-items: start; }
    .metro-card__top h2 { margin-bottom: 8px; }
    .health-score { min-width: 116px; text-align: right; }
    .health-score strong { display: block; color: #0f172a; font-size: 2rem; line-height: 1; letter-spacing: 0; }
    .health-score span { color: var(--muted); font-size: 0.74rem; font-weight: 850; }
    .health-score--large strong { font-size: 2.8rem; }
    .status-pill, .module-pill, .automation { display: inline-flex; align-items: center; width: fit-content; border-radius: 999px; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
    .status-pill { padding: 5px 9px; }
    .module-pill { padding: 4px 8px; color: #1e3a8a; background: #dbeafe; }
    .automation { padding: 6px 9px; color: #334155; background: #eef2f7; white-space: nowrap; }
    .status--ready { color: var(--green); background: #ccfbf1; }
    .status--improving { color: #1d4ed8; background: #dbeafe; }
    .status--needs-attention { color: var(--amber); background: #fef3c7; }
    .status--planning { color: var(--purple); background: #ede9fe; }
    .status--research { color: var(--red); background: #fee2e2; }
    .progress { height: 9px; border-radius: 999px; background: #e9eef6; overflow: hidden; }
    .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #2457d6, #14b8a6); }
    .signal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
    .signal-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 7px 10px; padding: 10px; border: 1px solid #e5edf7; border-radius: 12px; background: var(--soft); }
    .signal-row span { display: block; color: #334155; font-size: 0.82rem; font-weight: 850; }
    .signal-row small { display: block; margin-top: 2px; font-size: 0.74rem; }
    .signal-row strong { font-size: 0.9rem; }
    .signal-row .progress { grid-column: 1 / -1; height: 6px; }
    .metro-card__footer { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding-top: 2px; }
    .metro-card__footer p { margin-bottom: 0; font-size: 0.88rem; }
    .queue-section, .panel { margin-top: 20px; }
    .panel { padding: 20px; }
    .work-queue { display: grid; gap: 12px; }
    .work-item { display: grid; grid-template-columns: 124px minmax(0, 1fr); gap: 16px; padding: 16px; }
    .work-item__priority { display: grid; align-content: start; gap: 7px; }
    .stars { color: #f59e0b; font-size: 1.05rem; letter-spacing: 0; }
    .work-item__priority span:last-child { color: var(--muted); font-size: 0.78rem; font-weight: 850; }
    .work-item__heading { display: flex; justify-content: space-between; gap: 14px; align-items: start; }
    .work-item__heading h3 { margin-top: 7px; margin-bottom: 4px; font-size: 1.15rem; }
    .work-item__heading p { margin-bottom: 0; font-size: 0.9rem; }
    .start-work { display: inline-flex; width: fit-content; min-height: 36px; align-items: center; margin-top: 12px; padding: 0 12px; border-radius: 9px; background: var(--blue); color: #fff; font-size: 0.85rem; font-weight: 900; }
    dl { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
    dl div { padding: 9px; border: 1px solid #e5edf7; border-radius: 10px; background: var(--soft); }
    dd { margin: 3px 0 0; color: var(--ink); font-weight: 850; }
    .why { padding: 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #e5edf7; }
    .why strong { display: block; margin-bottom: 7px; }
    .why ul { display: grid; gap: 5px; margin: 0; padding-left: 18px; }
    .dependencies { margin: 10px 0 0; font-size: 0.88rem; }
    .back-link { display: inline-flex; margin-bottom: 12px; color: var(--muted); font-size: 0.86rem; font-weight: 850; }
    .selected-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
    .signal-grid--detail { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .detail-panel { padding: 14px; border: 1px solid #e5edf7; border-radius: 14px; background: var(--soft); }
    .detail-panel ul { margin-top: 0; padding-left: 18px; }
    .queue-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 0 0 24px; }
    .queue-summary article, .expansion-card, .field-mode-card, .execution-packet article, .handoff-summary article, .handoff-rail article { border: 1px solid var(--border); border-radius: 16px; background: rgba(255,255,255,0.94); padding: 16px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.045); }
    .queue-summary span { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
    .queue-summary strong { display: block; margin: 7px 0 4px; font-size: 1.7rem; }
    .queue-summary p, .field-mode-card p, .expansion-card p { margin-bottom: 0; font-size: 0.88rem; }
    .expansion-grid, .field-mode-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .expansion-card, .field-mode-card { display: grid; gap: 12px; }
    .expansion-card__top { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
    .stage-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
    .stage { padding: 4px 7px; border-radius: 999px; background: #eef2f7; color: #64748b; font-size: 0.68rem; font-weight: 900; }
    .stage--completed { background: #ccfbf1; color: #0f766e; }
    .stage--active { background: #dbeafe; color: #1d4ed8; }
    .workstream-list { display: grid; gap: 8px; }
    .workstream-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 10px; align-items: center; padding: 9px; border: 1px solid #e5edf7; border-radius: 12px; background: var(--soft); }
    .workstream-row span { color: #334155; font-size: 0.82rem; font-weight: 850; }
    .workstream-row strong { color: var(--muted); font-size: 0.78rem; }
    .workstream-row .progress { grid-column: 1 / -1; height: 6px; }
    .packet-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
    .packet-grid--wide { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .handoff-summary, .handoff-rail { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 0 0 24px; }
    .handoff-rail { margin: 14px 0 0; }
    .handoff-summary span, .handoff-rail span { display: block; color: #334155; font-size: 0.82rem; font-weight: 900; }
    .handoff-summary p, .handoff-rail p { margin: 6px 0 0; font-size: 0.84rem; }
    .codex-handoff { margin: 16px 0; padding: 16px; border: 1px solid #bfdbfe; border-radius: 16px; background: #eff6ff; }
    .codex-handoff__top { display: flex; justify-content: space-between; gap: 14px; align-items: start; }
    .codex-handoff__top h3 { margin-bottom: 4px; }
    .copy-prompt-button { min-height: 40px; padding: 0 14px; border: 0; border-radius: 10px; background: var(--blue); color: #fff; font: inherit; font-size: 0.88rem; font-weight: 900; cursor: pointer; white-space: nowrap; }
    .copy-prompt-button:disabled { cursor: default; opacity: 0.72; }
    .secondary-button { min-height: 38px; padding: 0 12px; border: 1px solid #bfdbfe; border-radius: 10px; background: #fff; color: #1d4ed8; font: inherit; font-size: 0.86rem; font-weight: 900; cursor: pointer; }
    .secondary-button--muted { border-color: var(--border); color: var(--muted); }
    .terminal-guidance { margin: 8px 0 12px; font-size: 0.88rem; }
    .prompt-preview { border: 1px solid #dbeafe; border-radius: 12px; background: #fff; }
    .prompt-preview summary { padding: 10px 12px; color: #1e3a8a; font-weight: 900; cursor: pointer; }
    .prompt-preview__text { display: block; width: 100%; min-height: 360px; padding: 12px; border: 0; border-top: 1px solid #dbeafe; border-radius: 0 0 12px 12px; color: #0f172a; background: #fff; font: 0.82rem/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; resize: vertical; }
    .copy-status { min-height: 1.3em; margin: 8px 0 0; color: #1e3a8a; font-size: 0.86rem; font-weight: 850; }
    .mission-debrief { margin: 20px 0; padding: 22px; border: 1px solid #dbe4ef; border-radius: 20px; background: #fff; box-shadow: 0 18px 48px rgba(15, 23, 42, 0.055); }
    .mission-debrief__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
    .mission-debrief__input, .reviewer-notes textarea { display: block; width: 100%; min-height: 180px; padding: 12px; border: 1px solid #dbe4ef; border-radius: 12px; color: #0f172a; background: #fff; font: 0.88rem/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; resize: vertical; }
    .mission-review { margin-top: 22px; padding-top: 22px; border-top: 1px solid #e5edf7; }
    .mission-review__hero { display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 18px; align-items: stretch; margin-bottom: 16px; padding: 22px; border: 1px solid #c7d7ee; border-radius: 18px; background: linear-gradient(135deg, #f8fbff, #eef6ff); }
    .mission-kicker { display: block; margin-bottom: 8px; color: #1d4ed8; font-size: 0.72rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
    .mission-review__hero h3 { margin-bottom: 8px; color: #0f172a; font-size: clamp(1.7rem, 3vw, 2.35rem); line-height: 1.05; }
    .mission-review__hero p { max-width: 720px; margin-bottom: 0; }
    .mission-review__status { display: grid; align-content: center; justify-items: start; padding: 14px; border: 1px solid #dbeafe; border-radius: 14px; background: rgba(255, 255, 255, 0.76); }
    .mission-review__status span, .mission-kicker, .improvement-panel span { color: var(--muted); font-size: 0.72rem; font-weight: 950; letter-spacing: 0.07em; text-transform: uppercase; }
    .mission-review__status strong { display: block; margin-top: 6px; color: #0f172a; font-size: 1.02rem; }
    .review-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .review-grid article { padding: 14px; box-shadow: none; }
    .review-grid--hero article { border-color: #dbeafe; background: #fbfdff; }
    .review-grid span, .reviewer-notes span { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
    .review-grid strong { display: block; margin-top: 5px; color: var(--ink); font-size: 0.92rem; }
    .improvement-panel, .recommendation-panel { margin: 0 0 16px; padding: 16px; border: 1px solid #e5edf7; border-radius: 16px; background: #f8fafc; }
    .improvement-panel div { display: grid; gap: 8px; margin-top: 10px; }
    .improvement-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto; gap: 10px; align-items: center; padding: 9px 10px; border-radius: 12px; background: #fff; }
    .improvement-row strong { color: #0f172a; }
    .improvement-row em { color: var(--muted); font-style: normal; font-weight: 850; }
    .recommendation-panel h4 { margin: 0 0 6px; font-size: 1rem; }
    .recommendation-panel p { margin-bottom: 8px; }
    .recommendation-panel ul { display: grid; gap: 5px; margin: 0; padding-left: 18px; }
    .mission-comparison { display: grid; grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr); gap: 18px; align-items: start; margin-top: 20px; }
    .mission-comparison article { box-shadow: none; }
    .mission-comparison h4 { margin: 14px 0 6px; font-size: 0.86rem; }
    .ser-sections { display: grid; gap: 8px; }
    .ser-section { border: 1px solid #e5edf7; border-radius: 13px; background: var(--soft); overflow: hidden; }
    .ser-section summary { padding: 11px 12px; color: #334155; font-size: 0.78rem; font-weight: 950; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; }
    .ser-section p { margin: 0; padding: 0 12px 12px; white-space: pre-wrap; }
    .raw-report { margin-top: 12px; border: 1px solid #e5edf7; border-radius: 12px; background: #fff; }
    .raw-report summary { padding: 9px 10px; cursor: pointer; font-weight: 900; }
    .raw-report pre { max-height: 240px; margin: 0; padding: 10px; overflow: auto; border-top: 1px solid #e5edf7; white-space: pre-wrap; font-size: 0.78rem; }
    .reviewer-notes { display: grid; gap: 7px; margin-top: 12px; }
    .reviewer-notes textarea { min-height: 110px; font-family: inherit; }
    code { padding: 2px 5px; border-radius: 6px; background: #eef2f7; color: #0f172a; font-size: 0.82rem; }
    @media (max-width: 1100px) { .metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); } .metro-grid { grid-template-columns: 1fr; } }
    @media (max-width: 760px) {
      main { width: min(100% - 24px, 1440px); padding-top: 24px; }
      .metrics, .signal-grid, .signal-grid--detail, .selected-grid, dl, .queue-summary, .expansion-grid, .field-mode-grid, .packet-grid, .packet-grid--wide, .handoff-summary, .handoff-rail, .mission-review__hero, .review-grid, .mission-comparison { grid-template-columns: 1fr; }
      .metro-card__top, .metro-card__footer, .section-heading, .work-item__heading, .expansion-card__top, .codex-handoff__top { flex-direction: column; }
      .health-score { text-align: left; }
      .work-item { grid-template-columns: 1fr; }
      .copy-prompt-button { width: 100%; }
    }
  </style>
  <script>
    function copyEosCodexPrompt(button) {
      const section = button.closest(".codex-handoff");
      const prompt = section && section.querySelector("[data-codex-prompt]");
      const status = section && section.querySelector("[data-copy-status]");
      if (!prompt || !status) return;
      const setStatus = (message) => {
        status.textContent = message;
      };
      const resetLabel = () => {
        window.setTimeout(() => {
          button.textContent = "Copy Codex Prompt";
          button.disabled = false;
        }, 1800);
      };
      button.disabled = true;
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        prompt.focus();
        prompt.select();
        setStatus("Clipboard access is unavailable. Select and copy the preview text manually.");
        button.textContent = "Copy manually";
        resetLabel();
        return;
      }
      navigator.clipboard.writeText(prompt.value).then(() => {
        button.textContent = "Copied";
        setStatus("Copied");
        resetLabel();
      }).catch(() => {
        prompt.focus();
        prompt.select();
        button.textContent = "Copy failed";
        setStatus("Clipboard copy failed. Select and copy the preview text manually.");
        resetLabel();
      });
    }

    const SER_SECTIONS = [
      "Architecture Discovery",
      "Implementation Summary",
      "Files Changed",
      "Results",
      "Validation",
      "Remaining Limitations",
      "Recommended Next Highest-Leverage Improvement",
    ];

    function normalizeSerHeading(value) {
      return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    }

    function parseStandardizedExecutionReport(rawReport) {
      const report = String(rawReport || "").trim();
      const sections = Object.fromEntries(SER_SECTIONS.map((section) => [section, ""]));
      if (!report) return { recognized: false, sections, rawReport: "" };
      const headingByNormalized = Object.fromEntries(SER_SECTIONS.map((section) => [normalizeSerHeading(section), section]));
      let current = "";
      for (const line of report.split(/\\r?\\n/)) {
        const normalized = normalizeSerHeading(line);
        if (/^eos standardized execution report v1$/i.test(line.trim())) {
          current = "";
          continue;
        }
        if (headingByNormalized[normalized]) {
          current = headingByNormalized[normalized];
          continue;
        }
        if (current) sections[current] = sections[current] + (sections[current] ? "\\n" : "") + line;
      }
      for (const key of Object.keys(sections)) sections[key] = sections[key].trim();
      return {
        recognized: /EOS Standardized Execution Report v1/i.test(report) || Object.values(sections).some(Boolean),
        sections,
        rawReport: report,
      };
    }

    function reviewRecommendationForReport(parsed) {
      const summary = parsed.sections["Implementation Summary"];
      const results = parsed.sections.Results;
      const validation = parsed.sections.Validation;
      const limitations = parsed.sections["Remaining Limitations"];
      const combined = [summary, results, validation, limitations].join("\\n").toLowerCase();
      if (!summary && !results) return "Needs Clarification";
      if (/\\b(failed|failure|error|errors|build failed|qa failed|not fixed|blocked)\\b/.test(combined)) return "Needs Additional Engineering";
      if (!validation || /\\b(not run|not tested|unable to run|skipped)\\b/.test(validation.toLowerCase())) return "Needs Manual QA";
      if (/\\b(passed|pass|succeeds|succeeded|green|errors: none)\\b/.test(validation.toLowerCase())) return "Ready for Manual Review";
      return "Needs Manual QA";
    }

    function missionReviewForReport(parsed) {
      const recommendation = reviewRecommendationForReport(parsed);
      const validation = parsed.sections.Validation || "";
      const limitations = parsed.sections["Remaining Limitations"] || "";
      const followup = parsed.sections["Recommended Next Highest-Leverage Improvement"] || "";
      return {
        recommendation,
        completed: parsed.sections["Implementation Summary"] || parsed.sections.Results ? "Reported" : "Not reported",
        validationStatus: /\\b(failed|failure|error|errors|build failed|qa failed)\\b/i.test(validation)
          ? "Issues reported"
          : /\\b(passed|pass|succeeds|succeeded|green|errors: none)\\b/i.test(validation)
            ? "Passed"
            : validation
              ? "Needs manual QA"
              : "Not reported",
        limitations: limitations ? "Reported" : "None reported",
        followup: followup || "Not reported",
      };
    }

    function extractMeasurableImprovements(parsed) {
      const source = [parsed.sections.Results, parsed.sections["Implementation Summary"]].filter(Boolean).join("\\n");
      if (!source) return [];
      return source.split(/\\r?\\n/)
        .map((line) => line.replace(/^[-*]\\s*/, "").trim())
        .filter(Boolean)
        .map((line) => {
          const labeledArrow = line.match(/^([^:]{3,72}):\\s*(.+?)\\s*(?:->|\\u2192|\\u2193)\\s*(.+)$/);
          if (labeledArrow) return { label: labeledArrow[1].trim(), before: labeledArrow[2].trim(), after: labeledArrow[3].trim() };
          const inlineArrow = line.match(/^(.{3,72}?)\\s+(\\d+%?|[A-Z][A-Za-z ]{2,40})\\s*(?:->|\\u2192|\\u2193)\\s*(\\d+%?|[A-Z][A-Za-z ]{2,60})$/);
          if (inlineArrow) return { label: inlineArrow[1].trim(), before: inlineArrow[2].trim(), after: inlineArrow[3].trim() };
          return null;
        })
        .filter(Boolean)
        .slice(0, 4);
    }

    function escapeSerHtml(value) {
      return String(value || "").replace(/[&<>"]/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      }[char]));
    }

    function renderSerSections(container, sections) {
      container.innerHTML = SER_SECTIONS.map((section, index) => {
        const value = sections[section] || "Not provided.";
        return '<details class="ser-section"' + (index === 0 ? " open" : "") + '><summary>' + escapeSerHtml(section) + '</summary><p>' + escapeSerHtml(value) + '</p></details>';
      }).join("");
    }

    function renderMeasurableImprovements(section, improvements) {
      const panel = section.querySelector("[data-improvement-panel]");
      const list = section.querySelector("[data-improvement-list]");
      if (!panel || !list) return;
      if (!improvements.length) {
        panel.hidden = true;
        list.innerHTML = "";
        return;
      }
      list.innerHTML = improvements.map((item) =>
        '<div class="improvement-row"><strong>' + escapeSerHtml(item.label) + '</strong><em>' + escapeSerHtml(item.before) + '</em><span aria-hidden="true">&rarr;</span><em>' + escapeSerHtml(item.after) + '</em></div>'
      ).join("");
      panel.hidden = false;
    }

    function importStandardizedExecutionReport(button) {
      const section = button.closest(".mission-debrief");
      if (!section) return;
      const input = section.querySelector("[data-ser-input]");
      const review = section.querySelector("[data-mission-review]");
      const sectionsContainer = section.querySelector("[data-ser-sections]");
      const raw = section.querySelector("[data-ser-raw]");
      if (!input || !review || !sectionsContainer || !raw) return;
      const parsed = parseStandardizedExecutionReport(input.value);
      const missionReview = missionReviewForReport(parsed);
      const improvements = extractMeasurableImprovements(parsed);
      renderSerSections(sectionsContainer, parsed.sections);
      renderMeasurableImprovements(section, improvements);
      raw.textContent = parsed.rawReport || "No report pasted.";
      section.querySelector("[data-ser-recommendation]").textContent = parsed.recognized ? missionReview.recommendation : "Needs Clarification";
      section.querySelector("[data-review-status]").textContent = parsed.recognized ? "Report Imported" : "Needs Clarification";
      section.querySelector("[data-review-completed]").textContent = missionReview.completed;
      section.querySelector("[data-review-validation]").textContent = missionReview.validationStatus;
      section.querySelector("[data-review-limitations]").textContent = missionReview.limitations;
      section.querySelector("[data-review-followup]").textContent = missionReview.followup;
      review.hidden = false;
    }

    function clearStandardizedExecutionReport(button) {
      const section = button.closest(".mission-debrief");
      if (!section) return;
      const input = section.querySelector("[data-ser-input]");
      const notes = section.querySelector("[data-reviewer-notes]");
      const review = section.querySelector("[data-mission-review]");
      const improvements = section.querySelector("[data-improvement-panel]");
      if (input) input.value = "";
      if (notes) notes.value = "";
      if (review) review.hidden = true;
      if (improvements) improvements.hidden = true;
    }

    document.addEventListener("click", (event) => {
      const copyButton = event.target.closest("[data-copy-prompt]");
      if (copyButton) {
        copyEosCodexPrompt(copyButton);
        return;
      }
      const importButton = event.target.closest("[data-import-ser]");
      if (importButton) {
        importStandardizedExecutionReport(importButton);
        return;
      }
      const clearButton = event.target.closest("[data-clear-ser]");
      if (clearButton) {
        clearStandardizedExecutionReport(clearButton);
      }
    });
  </script>
</head>
<body>
  <main>
    <header class="hero">
      <h1>Editorial Operating System</h1>
      <p>EOS is Rofo's planner, prioritizer, and orchestrator for commercial knowledge. It separates active editorial work, expansion projects, Field Mode photography, and review.</p>
      ${renderNav(token)}
    </header>
    ${body}
  </main>
</body>
</html>`;
}

export async function onRequestGet({ request, env }) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    return adminResponse("Admin dashboard is not configured.", 403);
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (token !== configuredToken) {
    return adminResponse("Forbidden", 403);
  }

  if (!eosAnalysis || !Array.isArray(eosAnalysis.metros)) {
    return adminResponse(renderSnapshotError(token), 503);
  }

  return adminResponse(renderPage({
    token,
    eos: eosAnalysis,
    selectedMetro: url.searchParams.get("metro") || "",
    selectedTask: url.searchParams.get("task") || "",
    selectedQueue: url.searchParams.get("queue") || "",
  }));
}
