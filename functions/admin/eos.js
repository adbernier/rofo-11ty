import eosAnalysis from "../../data/generated/eos-admin-runtime.json";

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
      <a class="button-link button-link--active" href="/admin/eos?${tokenParam(token)}">Today</a>
      <a class="button-link" href="/admin/eos?${tokenParam(token)}&queue=archive">Mission Archive</a>
      <a class="button-link" href="/admin/publisher?${tokenParam(token)}">Publisher</a>
      <a class="button-link" href="/admin/compass?${tokenParam(token)}">Rofo Compass</a>
      <a class="button-link" href="/admin/field-photos?${tokenParam(token)}">Field Photos</a>
      <a class="button-link" href="/admin/coverage?${tokenParam(token)}">Compass Coverage</a>
      <a class="button-link" href="/admin/operations?${tokenParam(token)}">Operations</a>
    </nav>
  `;
}

function labelOf(value, fallback = "Not measured") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.label || value.state?.label || fallback;
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

function currentFocusSummary(eos, topMission) {
  const flagship = (eos.metros || []).find((metro) => metro.metroId === "san-francisco") || (eos.metros || [])[0];
  if (!topMission) {
    return `${flagship ? `${flagship.metroName} remains the flagship production market while EOS waits for the next measured mission.` : "EOS is waiting for generated mission data."}`;
  }
  const metroLabel = topMission.metroName || topMission.metro || "the next metro";
  const title = topMission.title || "the next focused mission";
  const flagshipClause = flagship && flagship.metroName && flagship.metroName !== metroLabel
    ? ` while ${flagship.metroName} remains the flagship production market`
    : "";
  const constraint = topMission.currentConstraint
    ? ` Current constraint: ${topMission.currentConstraint}.`
    : "";
  return `${title} is the best next focused engineering session for ${metroLabel}${flagshipClause}.${constraint}`;
}

function marketFocusSummary(eos, activeMarkets) {
  const flagship = (eos.metros || []).find((metro) => metro.metroId === "san-francisco") || (eos.metros || [])[0];
  const lead = (activeMarkets || [])[0];
  if (!lead) {
    return `${flagship ? flagship.metroName : "Rofo"} remains the operating reference while Mission Control waits for projected market missions.`;
  }
  const mission = (lead.nextMissions || [])[0];
  const missionTitle = mission ? mission.title : "the next market mission";
  const program = mission ? mission.programLabel : "Mission Control";
  const flagshipClause = flagship && flagship.metroName && flagship.metroName !== lead.label
    ? ` while ${flagship.metroName} remains the flagship production market`
    : "";
  return `${lead.label}: ${missionTitle} is the highest-leverage ${program} mission${flagshipClause}.`;
}

function compactMissionFacts(item) {
  return [
    ["Impact", item.expectedImpact || item.expectedEditorialImpact || ""],
    ["Effort", item.estimatedEffort || ""],
    ["Class", item.missionClass || item.categoryLabel || ""],
    ["Confidence", item.confidence || ""],
  ].filter(([, value]) => value);
}

function taskUrl(token, taskId) {
  return `/admin/eos?${tokenParam(token)}&task=${encodeURIComponent(taskId)}`;
}

function missionById(eos, missionId) {
  return (((eos.portfolioQueues || {}).missionQueue) || []).find((mission) => mission.id === missionId) || null;
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
  if (category === "commercialMarketEvidence" || moduleId === "commercialMarketEvidence") {
    docs.add("docs/commercial-market-evidence.md");
    docs.add("docs/commercial-market-evidence-financial-district.md");
    docs.add("docs/rofo-publisher.md");
  }
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
  const portfolioWorkItems = packet.workItems && Array.isArray(packet.workItems.buildings) && packet.workItems.buildings.length
    ? `\nHidden building Work Items\n${listLines(packet.workItems.buildings.map((item) => `${item.name} — ${item.path}`))}\n`
    : "";
  const componentStatuses = packet.componentStatuses
    ? `\nComponent status\n${listLines([
      packet.componentStatuses.commercialMarketEvidence ? `Commercial Market Evidence: ${packet.componentStatuses.commercialMarketEvidence}` : "",
      packet.componentStatuses.evidenceBuildingProfiles && packet.componentStatuses.evidenceBuildingProfiles.label ? `Evidence Building Profiles: ${packet.componentStatuses.evidenceBuildingProfiles.label}` : "",
      packet.componentStatuses.supportingBuildingProfiles && packet.componentStatuses.supportingBuildingProfiles.label ? `Supporting Building Profiles: ${packet.componentStatuses.supportingBuildingProfiles.label}` : "",
      Number.isFinite(Number(packet.componentStatuses.unresolvedBuildingItems)) ? `Unresolved building items: ${packet.componentStatuses.unresolvedBuildingItems}` : "",
      packet.componentStatuses.validationStatus ? `Validation: ${packet.componentStatuses.validationStatus}` : "",
      packet.componentStatuses.districtBuildingEvidence ? `District Building Evidence: ${packet.componentStatuses.districtBuildingEvidence}` : "",
    ].filter(Boolean))}\n`
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
${componentStatuses}
${packet.includedTasks && packet.includedTasks.length ? `Included tasks\n${listLines(packet.includedTasks.map((item) => `${item.title}${item.reason ? ` — ${item.reason}` : ""}`))}\n\n` : ""}${portfolioWorkItems}${packet.deferredTasks && packet.deferredTasks.length ? `Deferred work\n${listLines(packet.deferredTasks.map((item) => `${item.title}${item.reason ? ` — ${item.reason}` : ""}`))}\n\n` : ""}${packet.reasonForBundling && packet.reasonForBundling.length ? `Reason for bundling\n${listLines(packet.reasonForBundling)}\n\n` : ""}${packet.currentConstraint ? `Current constraint\n${plainText(packet.currentConstraint)}\n\n` : ""}${packet.expectedImpact ? `Expected impact\n${plainText(packet.expectedImpact)}\n\n` : ""}${packet.estimatedEffort ? `Estimated effort classification\n${plainText(packet.estimatedEffort)}\n\n` : ""}${packet.missionSize ? `Mission size\n${plainText(packet.missionSize.label)} (${plainText(packet.missionSize.reviewWindow)})\n\n` : ""}
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
- Verify each included opportunity remains valid against current generated data.
- Complete the coherent mission rather than stopping after the first sub-gap.
- Avoid deferred work unless a deferred item is required to preserve correctness.
- Preserve Publisher, Compass, EOS, Field Mode, Knowledge Graph, and editorial ownership boundaries.
- Run npm run publisher:snapshot before reporting completion so Publisher and EOS measure product impact.
- For portfolio missions, report per-building outcomes and any failed or deferred Work Items.
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
[Report measurable before/after results for each included task when available and whether the objective was satisfied.]

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
  const primarySignals = [
    { label: "Publisher", value: labelOf(metro.source?.publisherStatus || metro.publisherConfidence), note: pct(metro.publisherConfidence?.score) },
    { label: "Knowledge", value: labelOf(metro.knowledgeReadiness), note: "EOS interpretation" },
    { label: "Experience", value: labelOf(metro.experienceReadiness), note: "EOS interpretation" },
    { label: "Recommendation Coverage", value: labelOf(metro.recommendationCoverage?.state || metro.recommendationCoverage), note: pct(metro.recommendationCoverage?.score) },
  ];
  const secondarySignals = [
    metro.commercialEcosystemCoverage,
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
      <div class="readiness-dashboard">
        ${primarySignals.map((signal) => `
          <div class="readiness-tile">
            <span>${escapeHtml(signal.label)}</span>
            <strong>${escapeHtml(signal.value)}</strong>
            <small>${escapeHtml(signal.note)}</small>
          </div>
        `).join("")}
      </div>
      <details class="mission-scope metro-details">
        <summary>More health signals</summary>
        <div class="signal-grid">
          ${secondarySignals.map(signalRow).join("")}
        </div>
      </details>
      <div class="metro-card__footer">
        <p>${escapeHtml((metro.overallEditorialHealth.rationale || [])[0] || metro.source.publisherStatus || "No immediate blocker detected.")}</p>
        <a href="/admin/eos?${tokenParam(token)}&metro=${encodeURIComponent(metro.metroId)}">View plan</a>
      </div>
    </article>
  `;
}

function programStatusTone(status) {
  const text = String(status || "").toLowerCase();
  if (/ready|strong|complete|distribution/.test(text)) return "program-card--strong";
  if (/developed|partial|improving/.test(text)) return "program-card--developed";
  if (/missing|thin|research|attention/.test(text)) return "program-card--attention";
  return "";
}

function renderProjectedProgram(program) {
  const progressLabel = program.progress && program.progress.label ? program.progress.label : "Measured by EOS";
  const nextInitiative = (program.initiatives || []).find((initiative) => initiative.nextMissionId === program.nextMissionId) ||
    (program.initiatives || []).find((initiative) => initiative.id === program.nextInitiativeId);
  const campaign = (program.campaigns || [])[0] || null;
  return `
    <article class="program-card ${programStatusTone(program.status)}">
      <div class="program-card__top">
        <h4>${escapeHtml(program.label)}</h4>
        <span>${escapeHtml(program.status || "Not measured")}</span>
      </div>
      <p>${escapeHtml(progressLabel)}</p>
      ${campaign ? `<p class="program-card__campaign">Campaign: ${escapeHtml(campaign.title)} · ${escapeHtml(String(campaign.missionCount || 0))} mission${campaign.missionCount === 1 ? "" : "s"}</p>` : ""}
      ${nextInitiative ? `<p class="program-card__next">Next: ${escapeHtml(nextInitiative.title)}</p>` : ""}
    </article>
  `;
}

function renderProjectedCampaign(campaign) {
  if (!campaign) return "";
  const progressLabel = campaign.progress && campaign.progress.label ? campaign.progress.label : "Measured by EOS";
  const districtEvidence = campaign.districtBuildingEvidence || null;
  return `
    <article class="campaign-card">
      <div>
        <span>Campaign</span>
        <h4>${escapeHtml(campaign.title)}</h4>
        <p>${escapeHtml(campaign.currentConstraint || "No current constraint reported.")}</p>
      </div>
      <div class="campaign-card__facts">
        <span><em>Progress</em>${escapeHtml(progressLabel)}</span>
        <span><em>Missions</em>${escapeHtml(String(campaign.missionCount || 0))}</span>
        <span><em>Hidden Work</em>${escapeHtml(String(campaign.workItemCount || 0))}</span>
        ${districtEvidence ? `<span><em>Districts Complete</em>${escapeHtml(String(districtEvidence.completeDistrictCount || 0))}</span>` : ""}
        ${districtEvidence ? `<span><em>In Progress</em>${escapeHtml(String(districtEvidence.inProgressDistrictCount || 0))}</span>` : ""}
        ${Number.isFinite(Number(campaign.resolvedPortfolioCount)) ? `<span><em>Portfolios</em>${escapeHtml(String(campaign.resolvedPortfolioCount))}</span>` : ""}
        ${campaign.estimatedMissionsRemaining ? `<span><em>Remaining</em>${escapeHtml(campaign.estimatedMissionsRemaining)}</span>` : ""}
      </div>
      <p>${escapeHtml(campaign.sizingStrategy || "Missions remain bounded and reviewable.")}</p>
    </article>
  `;
}

function renderProjectedMission(mission, eos, token) {
  const canonicalMission = missionById(eos, mission.id) || mission;
  if (!mission) return "";
  const components = mission.componentStatuses || {};
  const evidenceProfiles = components.evidenceBuildingProfiles || null;
  return `
    <article class="market-next-mission">
      <span>${escapeHtml(mission.programLabel || "Mission")} · Next Mission</span>
      <h3>${escapeHtml(mission.title)}</h3>
      <p>${escapeHtml(mission.currentConstraint || "No current constraint reported.")}</p>
      <div class="mission-facts">
        <span><em>Impact</em>${escapeHtml(mission.expectedImpact || "")}</span>
        <span><em>Effort</em>${escapeHtml(mission.estimatedEffort || "")}</span>
        ${mission.missionSize ? `<span><em>Size</em>${escapeHtml(mission.missionSize.label || "")}</span>` : ""}
        ${mission.workItems && mission.workItems.count ? `<span><em>Work Items</em>${escapeHtml(String(mission.workItems.count))}</span>` : ""}
        ${components.commercialMarketEvidence ? `<span><em>CME</em>${escapeHtml(components.commercialMarketEvidence)}</span>` : ""}
        ${evidenceProfiles && evidenceProfiles.label ? `<span><em>Profiles</em>${escapeHtml(evidenceProfiles.label)}</span>` : ""}
        <span><em>Class</em>${escapeHtml(mission.missionClass || "")}</span>
      </div>
      ${canonicalMission.executionPacket ? `<a class="start-work" href="${taskUrl(token, canonicalMission.id)}">Commence Work</a>` : ""}
    </article>
  `;
}

function initiativeStatusClass(status) {
  return `initiative-status--${String(status || "tracked").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function renderProjectedInitiative(initiative, eos, token) {
  const projectedMission = (initiative.missions || [])[0] || null;
  const canonicalMission = projectedMission ? missionById(eos, projectedMission.id) : null;
  return `
    <article class="initiative-row ${initiativeStatusClass(initiative.status || initiative.currentStage)}">
      <div>
        <span>${escapeHtml(initiative.status || initiative.currentStage || "Tracked")}</span>
        <h5>${escapeHtml(initiative.title)}</h5>
        <p>${escapeHtml(initiative.currentConstraint || initiative.objective || "")}</p>
        ${canonicalMission ? `<p class="initiative-row__mission"><strong>Next Mission:</strong> ${escapeHtml(canonicalMission.title)}</p>` : ""}
      </div>
      ${canonicalMission && canonicalMission.executionPacket ? `<a class="start-work start-work--small" href="${taskUrl(token, canonicalMission.id)}">Commence Work</a>` : ""}
    </article>
  `;
}

function renderMarketWorkspaceCard(market, eos, token) {
  const nextMission = (market.nextMissions || [])[0];
  const programs = (market.programs || []).slice(0, 6);
  return `
    <article class="market-workspace-card">
      <div class="market-workspace-card__header">
        <div>
          <span class="mission-kicker">Market Workspace</span>
          <h2>${escapeHtml(market.label)}</h2>
          <p>${escapeHtml(labelOf(market.knowledgeReadiness))} Knowledge · ${escapeHtml(labelOf(market.experienceReadiness))} Experience</p>
        </div>
        <div class="health-score">
          <strong>${pct(market.overallEditorialHealth && market.overallEditorialHealth.score)}</strong>
          <span>${escapeHtml(market.status && market.status.label ? market.status.label : "Health")}</span>
        </div>
      </div>
      ${progress(market.overallEditorialHealth && market.overallEditorialHealth.score, `${market.label} market progress`)}
      ${nextMission ? renderProjectedMission(nextMission, eos, token) : `
        <article class="market-next-mission market-next-mission--empty">
          <span>No active mission</span>
          <h3>${escapeHtml(market.label)} has no projected mission in the current queue.</h3>
          <p>Program progress remains visible for planning.</p>
        </article>
      `}
      <div class="program-grid" aria-label="${escapeHtml(market.label)} active programs">
        ${programs.map(renderProjectedProgram).join("")}
      </div>
      <details class="mission-scope">
        <summary>Programs and Initiatives</summary>
        <div class="initiative-list">
          ${(market.programs || []).map((program) => `
            <article>
              <h4>${escapeHtml(program.label)}</h4>
              <p>${escapeHtml(program.currentConstraint || "No current constraint reported.")}</p>
              ${renderProjectedCampaign((program.campaigns || [])[0])}
              <div class="initiative-rows">
                ${(program.initiatives || []).slice(0, 6).map((initiative) => renderProjectedInitiative(initiative, eos, token)).join("")}
              </div>
            </article>
          `).join("")}
        </div>
      </details>
      <a class="subtle-link" href="/admin/eos?${tokenParam(token)}&metro=${encodeURIComponent(market.id)}">View ${escapeHtml(market.label)} plan</a>
    </article>
  `;
}

function activeProjectedMarkets(eos) {
  const markets = (((eos.marketProjection || {}).markets) || []).slice();
  return markets.sort((a, b) => {
    const missionA = (a.nextMissions || [])[0] || {};
    const missionB = (b.nextMissions || [])[0] || {};
    return (Number(missionB.priorityScore || 0) - Number(missionA.priorityScore || 0)) || a.label.localeCompare(b.label);
  });
}

function renderWorkItem(item, token) {
  const isMission = item.category === "mission";
  const facts = compactMissionFacts(item);
  return `
    <article class="work-item">
      <div class="work-item__priority">
        ${stars(item.priorityStars)}
        <span>${escapeHtml(item.expectedImpact || item.expectedEditorialImpact)} impact</span>
      </div>
      <div class="work-item__body">
        <div class="work-item__heading">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.metroName)}${item.ecosystem ? ` · ${escapeHtml(item.ecosystem)}` : item.itemName ? ` · ${escapeHtml(item.itemName)}` : ""}</p>
          </div>
          <span class="module-pill">${escapeHtml(item.suggestedModule.label)}</span>
        </div>
        <div class="mission-facts">
          ${facts.map(([label, value]) => `<span><em>${escapeHtml(label)}</em>${escapeHtml(value)}</span>`).join("")}
        </div>
        ${item.currentConstraint ? `<p class="current-constraint"><strong>Current Constraint:</strong> ${escapeHtml(item.currentConstraint)}</p>` : ""}
        ${isMission ? `
          <div class="mission-meta">
            <span>${escapeHtml((item.includedTasks || []).length)} included</span>
            <span>${escapeHtml((item.deferredTasks || []).length)} deferred</span>
            <span>${escapeHtml(item.impactEffortClass)}</span>
          </div>
        ` : ""}
        <details class="mission-scope">
          <summary>${isMission ? "Why this mission" : "Why this task"}</summary>
          <ul>${(item.why || []).slice(0, 5).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("") || "<li>No rationale specified.</li>"}</ul>
        </details>
        ${isMission ? `
          <details class="mission-scope">
            <summary>Included work</summary>
            <h4>Included work</h4>
            <ul>${(item.includedTasks || []).map((task) => `<li>${escapeHtml(task.title)}</li>`).join("")}</ul>
          </details>
          <details class="mission-scope">
            <summary>Deferred work</summary>
            <h4>Deferred work</h4>
            <ul>${(item.deferredTasks || []).map((task) => `<li>${escapeHtml(task.title)} · ${escapeHtml(task.reason)}</li>`).join("") || "<li>None specified.</li>"}</ul>
          </details>
        ` : ""}
        ${item.dependencies && item.dependencies.length ? `
          <details class="mission-scope">
            <summary>Dependencies</summary>
            <ul>${item.dependencies.map((dependency) => `<li>${escapeHtml(dependency)}</li>`).join("")}</ul>
          </details>
        ` : ""}
        ${item.executionPacket ? `<a class="start-work" href="${taskUrl(token, item.id)}">Commence Work</a>` : ""}
      </div>
    </article>
  `;
}

function renderExecutionPacket(eos, taskId, token) {
  const allTasks = [
    ...(((eos.portfolioQueues || {}).missionQueue) || []),
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
          ${packet.currentConstraint ? `<h3>Current Constraint</h3><p>${escapeHtml(packet.currentConstraint)}</p>` : ""}
        </article>
        <article>
          <h3>Execution Providers</h3>
          <ul>${(packet.providers || []).map((provider) => `<li>${escapeHtml(provider.label)} · ${escapeHtml(provider.description)}</li>`).join("")}</ul>
          <h3>Required Review</h3>
          <p>${packet.requiredReview ? "Yes" : "No"}</p>
          ${packet.expectedImpact ? `<h3>Mission Classification</h3><p>${escapeHtml(packet.missionClass)} · ${escapeHtml(packet.expectedImpact)} impact · ${escapeHtml(packet.estimatedEffort)} effort</p>` : ""}
        </article>
      </div>
      ${packet.includedTasks && packet.includedTasks.length ? `
        <div class="packet-grid">
          <article>
            <h3>Included Tasks</h3>
            <ul>${packet.includedTasks.map((item) => `<li>${escapeHtml(item.title)}</li>`).join("")}</ul>
          </article>
          <article>
            <h3>Deferred Work</h3>
            <ul>${(packet.deferredTasks || []).map((item) => `<li>${escapeHtml(item.title)} · ${escapeHtml(item.reason)}</li>`).join("") || "<li>None specified.</li>"}</ul>
          </article>
        </div>
      ` : ""}
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
              <span>Publisher Outcome</span>
              <strong data-review-publisher>Not reported</strong>
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
  const projectedMarket = (((eos.marketProjection || {}).markets) || []).find((item) => item.id === metroId);
  const queue = eos.workQueue.filter((item) => item.metroId === metroId).slice(0, 8);
  return `
    <section class="panel selected-metro">
      <a class="back-link" href="/admin/eos?${tokenParam(token)}">All metros</a>
      <div class="section-heading">
        <div>
          <h2>${escapeHtml(metro.metroName)} Market Workspace</h2>
          <p>Market, Program, Initiative, and Mission projection generated by EOS from Publisher and platform evidence.</p>
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
          <h3>Knowledge vs Experience</h3>
          <p>${escapeHtml(`Knowledge Readiness: ${metro.knowledgeReadiness.label}. Experience Readiness: ${metro.experienceReadiness.label}.`)}</p>
        </div>
      </div>
    </section>
    ${projectedMarket ? `
      <section class="queue-section">
        <div class="section-heading">
          <div>
            <h2>${escapeHtml(metro.metroName)} Programs</h2>
            <p>Programs and Initiatives are projected from generated EOS data. Execution packets remain attached to Missions.</p>
          </div>
        </div>
        <div class="program-detail-grid">
          ${(projectedMarket.programs || []).map((program) => `
            <article class="program-detail-card">
              <div class="program-card__top">
                <h3>${escapeHtml(program.label)}</h3>
                <span>${escapeHtml(program.status || "Not measured")}</span>
              </div>
              <p>${escapeHtml(program.progress && program.progress.label ? program.progress.label : "Measured by EOS")}</p>
              <p><strong>Current constraint:</strong> ${escapeHtml(program.currentConstraint || "No current constraint reported.")}</p>
              ${program.nextMissionId ? `<p><strong>Next Mission:</strong> ${escapeHtml(((program.initiatives || []).find((initiative) => initiative.nextMissionId === program.nextMissionId) || {}).title || program.nextMissionId)}</p>` : ""}
              ${renderProjectedCampaign((program.campaigns || [])[0])}
              <details class="mission-scope">
                <summary>Initiatives</summary>
                <div class="initiative-rows">
                  ${(program.initiatives || []).map((initiative) => renderProjectedInitiative(initiative, eos, token)).join("")}
                </div>
              </details>
            </article>
          `).join("")}
        </div>
      </section>
    ` : ""}
    <section class="queue-section">
      <div class="section-heading">
        <div>
          <h2>${escapeHtml(metro.metroName)} Opportunity Inventory</h2>
          <p>Raw measurable gaps remain available for inspection below the Program projection.</p>
        </div>
      </div>
      <div class="work-queue">${queue.map((item) => renderWorkItem(item, token)).join("")}</div>
    </section>
  `;
}

function renderQueueSummary(eos) {
  const queues = eos.portfolioQueues || {};
  const counts = queues.queueCounts || {};
  return `
    <section class="queue-summary">
      <article>
        <span>Editorial Queue</span>
        <strong>${escapeHtml(counts.editorialQueue || (queues.editorialQueue || []).length)}</strong>
        <p>Existing metro improvement work.</p>
      </article>
      <article>
        <span>Expansion Queue</span>
        <strong>${escapeHtml(counts.expansionQueue || (queues.expansionQueue || []).length)}</strong>
        <p>Future metro projects.</p>
      </article>
      <article>
        <span>Field Mode Queue</span>
        <strong>${escapeHtml(counts.fieldModeQueue || (queues.fieldModeQueue || []).length)}</strong>
        <p>Photography summaries by metro.</p>
      </article>
      <article>
        <span>Review Queue</span>
        <strong>${escapeHtml(counts.reviewQueue || (queues.reviewQueue || []).length)}</strong>
        <p>Returned execution work.</p>
      </article>
    </section>
  `;
}

function renderExpansionProject(project, token) {
  const activeStage = (project.stages || []).find((stage) => stage.status === "active") || (project.stages || []).find((stage) => stage.status !== "completed") || {};
  const remainingMilestones = (project.stages || [])
    .filter((stage) => stage.status !== "completed")
    .map((stage) => stage.label);
  const remainingStreams = (project.workstreams || [])
    .filter((stream) => Number(stream.progress) < 100)
    .map((stream) => stream.label);
  const expectedRemainingMissions = remainingStreams.length || remainingMilestones.length || (project.nextAction ? 1 : 0);
  return `
    <article class="expansion-card">
      <div class="expansion-card__top">
        <div>
          <h3>${escapeHtml(project.metroName)}</h3>
          <span class="status-pill status--planning">${escapeHtml(activeStage.label || project.statusLabel)}</span>
        </div>
        <div class="health-score">
          <strong>${pct(project.investmentScore.score)}</strong>
          <span>Investment Score</span>
        </div>
      </div>
      <div class="remaining-work">
        <span>Current Stage</span>
        <strong>${escapeHtml(activeStage.label || project.statusLabel)}</strong>
        <p>${escapeHtml(project.nextAction)}</p>
      </div>
      <div class="remaining-work">
        <span>Remaining Milestones</span>
        <ul>${remainingMilestones.slice(0, 5).map((milestone) => `<li>${escapeHtml(milestone)}</li>`).join("") || "<li>Final review only.</li>"}</ul>
      </div>
      <div class="mission-facts">
        <span><em>Expected Remaining Missions</em>${escapeHtml(expectedRemainingMissions)}</span>
        <span><em>Progress</em>${pct(project.overallProgress)}</span>
      </div>
      <details class="mission-scope">
        <summary>Workstreams</summary>
        <div class="workstream-list" aria-label="${escapeHtml(project.metroName)} expansion workstreams">
          ${(project.workstreams || []).map((stream) => `
            <div class="workstream-row">
              <span>${escapeHtml(stream.label)}</span>
              <strong>${pct(stream.progress)}</strong>
              ${progress(stream.progress, `${project.metroName} ${stream.label}`)}
            </div>
          `).join("")}
        </div>
      </details>
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
      <section class="panel review-empty" id="review-queue">
        <h2>Review Queue</h2>
        <p>No autonomous execution work has been returned for review yet. Future providers will move completed packets here before approval.</p>
      </section>
    `;
  }
  return `
    <section class="queue-section" id="review-queue">
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

function renderCommercialMarketEvidenceService(eos) {
  const service = eos.platformServices && eos.platformServices.commercialMarketEvidence;
  if (!service) return "";
  const expansion = service.expansion || {};
  const coverage = expansion.coverageSummary || {};
  const suggested = (expansion.suggestedExpansionOrder || []).slice(0, 8);
  const unresolvedCount = Number(coverage.unresolvedDistricts || 0) + Number(coverage.ambiguousDistricts || 0);
  const confidence = Object.entries(service.confidenceSummary || {})
    .map(([label, count]) => `${label}: ${count}`)
    .join("; ") || "No confidence records";
  const validationNote = service.latestValidation
    ? " · Latest validation: " + service.latestValidation
    : "";
  return `
    <section class="platform-service" id="commercial-market-evidence" aria-label="Commercial Market Evidence">
      <div>
        <span>Commercial Market Evidence</span>
        <h2>${escapeHtml(service.status || service.validationStatus || "Unavailable")}</h2>
        <p>Platform health from the Commercial Market Evidence validator. EOS resolves the next missing district collection into an executable Program Mission in the Market Workspace.</p>
      </div>
      <div class="platform-service__metrics">
        <article><strong>${escapeHtml(String(service.collections || 0))}</strong><span>Collections</span></article>
        <article><strong>${escapeHtml(String(service.evidenceRecords || 0))}</strong><span>Evidence Records</span></article>
        <article><strong>${escapeHtml((service.districts || []).join(", ") || "No districts")}</strong><span>Coverage</span></article>
        <article><strong>${escapeHtml(service.validationStatus || "Unknown")}</strong><span>Validation</span></article>
      </div>
      <p class="platform-service__meta">${escapeHtml(confidence + validationNote)}</p>
      <div class="market-evidence-expansion">
        <div class="section-heading">
          <div>
            <h3>Commercial Market Evidence Expansion</h3>
            <p>Presence-based expansion planning from Knowledge Graph districts. Quality measurement remains deferred, while the next collection per eligible market is executable from its Program Initiative.</p>
          </div>
        </div>
        <div class="platform-service__metrics">
          <article><strong>${escapeHtml(String(coverage.existingCollections || 0))}</strong><span>Existing Collections</span></article>
          <article><strong>${escapeHtml(String(coverage.missingCollections || 0))}</strong><span>Missing Collections</span></article>
          <article><strong>${escapeHtml(String(coverage.knowledgeGraphDistricts || 0))}</strong><span>Knowledge Graph Districts</span></article>
          <article><strong>${escapeHtml(coverage.collectionCoverageLabel || "Unknown")}</strong><span>Coverage Summary</span></article>
        </div>
        ${unresolvedCount ? `<p class="platform-service__meta">Ownership warning: ${escapeHtml(String(unresolvedCount))} district${unresolvedCount === 1 ? "" : "s"} require market ownership review before executable missions are created.</p>` : ""}
        <details class="mission-scope">
          <summary>Suggested Expansion Order</summary>
          <ol class="expansion-order">
            ${suggested.map((item) => `
              <li>
                <strong>${escapeHtml(item.districtName)}</strong>
                <span>${escapeHtml([item.marketName || item.metroName, item.city, item.state].filter(Boolean).join(" · "))}</span>
                <p>${escapeHtml((item.rationale || []).slice(0, 2).join(" "))}</p>
              </li>
            `).join("") || "<li>No missing collections detected.</li>"}
          </ol>
        </details>
        <details class="mission-scope">
          <summary>Ordering Logic</summary>
          <ul>${(expansion.orderingStrategy || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </details>
      </div>
    </section>
  `;
}

function formatIntelligenceMetric(value, fallback = "Pending") {
  return Number.isFinite(Number(value)) ? String(Math.round(Number(value))) : fallback;
}

function renderCommercialKnowledgeIntelligence(eos) {
  const intelligence = eos.commercialKnowledgeIntelligence;
  if (!intelligence) return "";

  const strategic = (intelligence.strategicRoadmap || []).slice(0, 5);
  const opportunities = (((intelligence.googleOpportunity || {}).markets) || []).slice(0, 6);
  const sourceSnapshot = (intelligence.googleOpportunity || {}).sourceSnapshot || {};
  const propertyTypeOpportunities = ((intelligence.googleOpportunity || {}).propertyTypeOpportunities || []).slice(0, 6);
  const themes = (intelligence.topicIntelligence || intelligence.emergingThemes || []).slice(0, 6);
  const searchMissions = (intelligence.searchMissions || []).slice(0, 5);
  const investorSignals = (intelligence.investorFutureSignals || []).slice(0, 4);
  const publisherOpportunities = intelligence.publisherOpportunities || [];

  return `
    <section class="platform-service platform-service--knowledge" aria-label="Commercial Knowledge Intelligence">
      <div>
        <span>Commercial Knowledge Intelligence</span>
        <h2>Where should Rofo get smarter next?</h2>
        <p>EOS v3 keeps strategic expansion separate from observed Google demand, then compares both with knowledge coverage and Publisher readiness.</p>
        <p class="platform-service__inline-meta">Source: ${escapeHtml(sourceSnapshot.status && sourceSnapshot.status.mode ? sourceSnapshot.status.mode : "manual/import")} · Grain: ${escapeHtml(sourceSnapshot.grain || "market-query")}${sourceSnapshot.status && sourceSnapshot.status.stale ? " · Stale data warning" : ""}</p>
      </div>
      <div class="platform-service__metrics">
        <article><strong>${escapeHtml(String(strategic.length))}</strong><span>Strategic Markets</span></article>
        <article><strong>${escapeHtml(String(opportunities.length))}</strong><span>Google Signals</span></article>
        <article><strong>${escapeHtml(String(searchMissions.length))}</strong><span>Search Missions</span></article>
        <article><strong>${escapeHtml(String(publisherOpportunities.length))}</strong><span>Publisher Inputs</span></article>
      </div>
      <div class="knowledge-intelligence-grid">
        <article>
          <span>Recommended Search Missions</span>
          <ul>
            ${searchMissions.map((mission) => `
              <li>
                <strong>${escapeHtml(mission.title)}</strong>
                <small>${escapeHtml(mission.confidence)} confidence · ${escapeHtml(formatIntelligenceMetric(mission.impressions))} impressions · avg position ${escapeHtml(formatIntelligenceMetric(mission.averagePosition))}</small>
                <p>${escapeHtml(mission.whyNow || "Search demand and coverage gaps point to a focused knowledge mission.")}</p>
              </li>
            `).join("") || "<li><strong>No recommended search missions</strong><small>Search Intelligence has not found a high-leverage editorial mission yet.</small></li>"}
          </ul>
        </article>
        <article>
          <span>Strategic Markets + Search Support</span>
          <ul>
            ${strategic.map((market) => `
              <li>
                <strong>${escapeHtml(market.marketName)}</strong>
                <small>${escapeHtml(market.priority)} priority${market.supportingSearchMarkets && market.supportingSearchMarkets.length ? ` · supported by ${escapeHtml(market.supportingSearchMarkets.map((item) => item.marketName).join(", "))}` : ""}</small>
              </li>
            `).join("")}
          </ul>
        </article>
      </div>
      <div class="knowledge-intelligence-grid">
        <article>
          <span>Strategic Expansion</span>
          <ul>
            ${strategic.map((market) => `
              <li>
                <strong>${escapeHtml(market.marketName)}</strong>
                <small>${escapeHtml(market.priority)} priority · ${escapeHtml(market.nextKnowledgeNeed || "")}</small>
              </li>
            `).join("")}
          </ul>
        </article>
        <article>
          <span>Google Opportunity</span>
          <ul>
            ${opportunities.map((market) => `
              <li>
                <strong>${escapeHtml(market.marketName)}</strong>
                <small>${escapeHtml(market.googleOpportunity)} · ${escapeHtml(formatIntelligenceMetric(market.impressions))} impressions · avg position ${escapeHtml(formatIntelligenceMetric(market.averagePosition))}${market.momentum && market.momentum.twentyEightDay ? ` · 28d ${escapeHtml(market.momentum.twentyEightDay.impressionMomentum)}` : ""}</small>
                <p>${escapeHtml((market.dominantThemes || []).slice(0, 3).map((theme) => theme.label).join(", ") || "Themes pending")}</p>
              </li>
            `).join("")}
          </ul>
        </article>
      </div>
      <div class="knowledge-intelligence-grid knowledge-intelligence-grid--three">
        <article>
          <span>Why Now</span>
          <ul>
            ${opportunities.slice(0, 3).map((market) => `
              <li>
                <strong>${escapeHtml(market.marketName)}</strong>
                <small>${escapeHtml((market.rationale || []).join(" "))}</small>
              </li>
            `).join("")}
          </ul>
        </article>
        <article>
          <span>Emerging Themes</span>
          <ul>
            ${themes.map((theme) => `
              <li><strong>${escapeHtml(theme.label)}</strong><small>${escapeHtml(String(theme.marketCount))} markets · ${escapeHtml(formatIntelligenceMetric(theme.impressions || theme.queryCount, "0"))} impressions · avg position ${escapeHtml(formatIntelligenceMetric(theme.averagePosition))}</small></li>
            `).join("")}
          </ul>
        </article>
        <article>
          <span>Property-Type Signals</span>
          <ul>
            ${propertyTypeOpportunities.length ? propertyTypeOpportunities.map((item) => `
              <li><strong>${escapeHtml(`${item.marketName} ${item.propertyType}`)}</strong><small>${escapeHtml(formatIntelligenceMetric(item.impressions))} impressions · avg position ${escapeHtml(formatIntelligenceMetric(item.averagePosition))}</small></li>
            `).join("") : "<li><strong>No property-type signals</strong><small>Run Search Intelligence sync with page/query rows to populate this layer.</small></li>"}
          </ul>
        </article>
        <article>
          <span>Investor / Future Signals</span>
          <ul>
            ${investorSignals.length ? investorSignals.map((market) => `
              <li><strong>${escapeHtml(market.marketName)}</strong><small>${escapeHtml(market.note)}</small></li>
            `).join("") : "<li><strong>No separated future signals</strong><small>Investor demand remains outside the current occupier roadmap.</small></li>"}
          </ul>
        </article>
      </div>
      <p class="platform-service__meta">Phase 1 is advisory only. Publisher receives recommendations, but EOS does not automatically modify public content.</p>
    </section>
  `;
}

function firstActionableMission(eos) {
  const markets = activeProjectedMarkets(eos);
  for (const market of markets) {
    const mission = (market.nextMissions || [])[0];
    const canonicalMission = mission ? missionById(eos, mission.id) || mission : null;
    if (canonicalMission) {
      return { market, mission: canonicalMission };
    }
  }
  return null;
}

function todayRecommendations(eos, token) {
  const recommendations = [];
  const queues = eos.portfolioQueues || {};
  const reviewQueue = queues.reviewQueue || [];
  const marketEvidence = eos.platformServices && eos.platformServices.commercialMarketEvidence;
  const intelligence = eos.commercialKnowledgeIntelligence || {};
  const googleMarkets = (((intelligence.googleOpportunity || {}).markets) || []);
  const searchMissions = intelligence.searchMissions || [];

  if ((marketEvidence && marketEvidence.validationStatus && marketEvidence.validationStatus !== "PASS") || reviewQueue.length) {
    recommendations.push({
      type: "QA",
      title: reviewQueue.length ? `${reviewQueue.length} Review Item${reviewQueue.length === 1 ? "" : "s"}` : "Commercial Market Evidence Needs Review",
      reason: reviewQueue.length
        ? "Returned work is waiting on editorial review before it can be considered complete."
        : "A platform validation check needs attention before follow-on Publisher work should proceed.",
      effort: "Small",
      impact: "High",
      actionLabel: reviewQueue.length ? "Open Review" : "Review QA",
      href: reviewQueue.length ? `/admin/eos?${tokenParam(token)}#review-queue` : `/admin/eos?${tokenParam(token)}&queue=markets#commercial-market-evidence`,
    });
  }

  const searchMission = searchMissions[0];
  if (searchMission) {
    const markets = (searchMission.supportingMarkets || []).slice(0, 3).map((market) => market.marketName).join(", ");
    recommendations.push({
      type: "Search Mission",
      title: searchMission.title,
      reason: `${searchMission.whyNow || "Search Intelligence identified a focused editorial mission."}${markets ? ` Evidence: ${markets}.` : ""}`,
      effort: searchMission.type === "market_specific" ? "Small" : "Medium",
      impact: searchMission.confidence === "high" ? "High" : "Medium",
      actionLabel: "Review Mission",
      href: `/admin/eos?${tokenParam(token)}&queue=intelligence`,
    });
  } else {
    const searchLed = googleMarkets.find((market) =>
      (market.googleOpportunity === "high" || market.googleOpportunity === "theme_signal")
      && !["san-francisco", "denver"].includes(market.marketId)
    ) || googleMarkets[0];
    if (searchLed) {
      const themes = (searchLed.dominantThemes || []).slice(0, 3).map((theme) => theme.label).join(", ");
      recommendations.push({
        type: "Google Opportunity",
        title: `${searchLed.marketName}${themes ? ` ${themes}` : ""}`,
        reason: (searchLed.rationale || []).join(" ") || "Google is already testing Rofo for this commercial knowledge while coverage remains incomplete.",
        effort: "Small",
        impact: searchLed.googleOpportunity === "high" ? "High" : "Medium",
        actionLabel: "Review Opportunity",
        href: `/admin/eos?${tokenParam(token)}&queue=intelligence`,
      });
    }
  }

  const missionRecord = firstActionableMission(eos);
  if (missionRecord) {
    const { market, mission } = missionRecord;
    recommendations.push({
      type: "Strategic",
      title: `${market.label}: ${mission.title}`,
      reason: mission.currentConstraint || "Highest-priority market mission from the current EOS market projection.",
      effort: mission.estimatedEffort || "Medium",
      impact: mission.expectedImpact || "High",
      actionLabel: "Commence Work",
      href: mission.executionPacket ? taskUrl(token, mission.id) : `/admin/eos?${tokenParam(token)}&queue=markets`,
    });
  }

  return recommendations.slice(0, 3);
}

function todayChanged(eos) {
  const intelligence = eos.commercialKnowledgeIntelligence || {};
  const topOpportunity = (((intelligence.googleOpportunity || {}).markets) || [])[0];
  const marketEvidence = eos.platformServices && eos.platformServices.commercialMarketEvidence;
  const changes = [];

  if (topOpportunity) {
    changes.push({
      source: "Google",
      text: `${topOpportunity.marketName} is the strongest current search-led knowledge opportunity${topOpportunity.averagePosition ? ` at average position ${Number(topOpportunity.averagePosition).toFixed(1)}` : ""}.`,
    });
  }

  if (marketEvidence) {
    changes.push({
      source: "QA",
      text: marketEvidence.validationStatus === "PASS"
        ? "Commercial Market Evidence validation is passing."
        : "Commercial Market Evidence validation needs attention.",
    });
  }

  if (intelligence.publisherOpportunities && intelligence.publisherOpportunities.length) {
    changes.push({
      source: "Publisher",
      text: `${intelligence.publisherOpportunities.length} Commercial Knowledge Intelligence opportunities are prepared for Publisher review.`,
    });
  }

  return changes.slice(0, 4);
}

function todayAttentionItems(eos) {
  const queues = eos.portfolioQueues || {};
  const marketEvidence = eos.platformServices && eos.platformServices.commercialMarketEvidence;
  const expansion = marketEvidence && marketEvidence.expansion;
  const coverage = expansion && expansion.coverageSummary;
  const attention = [];

  if ((queues.reviewQueue || []).length) {
    attention.push(`${(queues.reviewQueue || []).length} review item${(queues.reviewQueue || []).length === 1 ? "" : "s"} waiting.`);
  }

  if (marketEvidence && marketEvidence.validationStatus !== "PASS") {
    attention.push("Commercial Market Evidence validation is not passing.");
  }

  if (coverage && Number(coverage.missingCollections || 0) > 0) {
    attention.push(`${coverage.missingCollections} Commercial Market Evidence collection${Number(coverage.missingCollections) === 1 ? "" : "s"} remain missing.`);
  }

  if (!attention.length) {
    attention.push("No QA or review blockers are visible in the generated EOS snapshot.");
  }

  return attention.slice(0, 4);
}

function renderTodayRecommendation(card) {
  return `
    <article class="today-card">
      <span>${escapeHtml(card.type)}</span>
      <h2>${escapeHtml(card.title)}</h2>
      <p>${escapeHtml(card.reason)}</p>
      <div class="today-card__facts">
        <span><em>Effort</em>${escapeHtml(card.effort)}</span>
        <span><em>Impact</em>${escapeHtml(card.impact)}</span>
      </div>
      <a class="start-work" href="${escapeHtml(card.href)}">${escapeHtml(card.actionLabel)}</a>
    </article>
  `;
}

function renderTodayExplore(token) {
  const links = [
    { label: "Explore Markets", href: `/admin/eos?${tokenParam(token)}&queue=markets`, note: "Market Workspace, metro health, expansion, Field Mode, and review queues." },
    { label: "Commercial Knowledge Intelligence", href: `/admin/eos?${tokenParam(token)}&queue=intelligence`, note: "Strategic roadmap, Google opportunity, knowledge gaps, and Publisher inputs." },
    { label: "Publisher", href: `/admin/publisher?${tokenParam(token)}`, note: "Publishing readiness and metro analysis." },
    { label: "Lead Operations", href: `/admin/operations?${tokenParam(token)}`, note: "New requirements, routing, email status, and fulfillment workflow." },
    { label: "Field Mode", href: `/admin/field-photos?${tokenParam(token)}`, note: "Photography coverage and field execution." },
    { label: "Mission Archive", href: `/admin/eos?${tokenParam(token)}&queue=archive`, note: "Completed mission summaries and review history." },
  ];

  return `
    <section class="today-explore" aria-label="Explore EOS systems">
      <div class="section-heading">
        <div>
          <h2>Explore More</h2>
          <p>The operational systems are still available. Today only changes what gets attention first.</p>
        </div>
      </div>
      <div class="today-explore__grid">
        ${links.map((link) => `
          <a href="${escapeHtml(link.href)}">
            <strong>${escapeHtml(link.label)}</strong>
            <span>${escapeHtml(link.note)}</span>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function renderIntelligenceExplorer(eos, token) {
  return `
    <a class="back-link" href="/admin/eos?${tokenParam(token)}">Back to Today</a>
    ${renderCommercialKnowledgeIntelligence(eos)}
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

const missionArchive = [
  {
    mission: "Denver Industrial & Flex Ecosystem Balance Sprint",
    metro: "Denver",
    date: "2026-07-26",
    publisherBeforeAfter: "Industrial Flex Brief Concentrated -> Balanced",
    objective: "Restore commercial ecosystem balance after industrial/flex Brief depth improved.",
    filesChanged: "_data/commercialBuildingIntelligence.js, generated Publisher/EOS snapshots",
    serSummary: "Added bounded office, retail, and medical Building Profiles so industrial/flex depth no longer masked other ecosystems.",
    currentConstraint: "Life Science subtype coverage remains the next ecosystem constraint.",
  },
  {
    mission: "Seattle Office Ecosystem Completion",
    metro: "Seattle",
    date: "2026-07-26",
    publisherBeforeAfter: "Office Missing -> Strong",
    objective: "Complete Seattle office district, representative-building, and initial Building Brief coverage.",
    filesChanged: "_data/locationKnowledgeGraph.js, _data/seattleOfficeBuildingBriefs.js, generated Publisher/EOS snapshots",
    serSummary: "Created a multi-district Seattle office foundation and migrated initial office Building Profiles.",
    currentConstraint: "Medical ecosystem foundation remains before final Live readiness.",
  },
  {
    mission: "San Francisco Industrial & Flex Ecosystem Completion",
    metro: "San Francisco",
    date: "2026-07-27",
    publisherBeforeAfter: "Industrial/Flex Briefs 0 -> 6; Office Brief Concentrated -> Balanced",
    objective: "Migrate a bounded industrial/flex Building Profile set across Bay Area operating models.",
    filesChanged: "_data/sanFranciscoIndustrialFlexBuildingBriefs.js, _data/commercialBuildingIntelligence.js, generated Publisher/EOS snapshots",
    serSummary: "Added West Berkeley, Moffett Park, Hayward, Union City, and Warm Springs industrial/flex Building Profiles.",
    currentConstraint: "Industrial/flex representative-role breadth remains too narrow.",
  },
];

function renderMissionArchive(eos, token) {
  return `
    <section class="queue-section mission-archive">
      <a class="back-link" href="/admin/eos?${tokenParam(token)}">Back to Mission Control</a>
      <div class="section-heading">
        <div>
          <h2>Mission Archive</h2>
          <p>Mocked browser-only history that demonstrates the intended review model before persistent mission state exists.</p>
        </div>
        <span class="archive-note">Architecture preview · No persistence</span>
      </div>
      <div class="archive-grid">
        ${missionArchive.map((item) => `
          <article class="archive-card">
            <div>
              <span class="mission-kicker">${escapeHtml(item.metro)} · ${escapeHtml(item.date)}</span>
              <h3>${escapeHtml(item.mission)}</h3>
              <p>${escapeHtml(item.objective)}</p>
            </div>
            <dl>
              <div><dt>Publisher Before/After</dt><dd>${escapeHtml(item.publisherBeforeAfter)}</dd></div>
              <div><dt>Current Constraint</dt><dd>${escapeHtml(item.currentConstraint)}</dd></div>
            </dl>
            <details class="mission-scope">
              <summary>SER summary</summary>
              <p>${escapeHtml(item.serSummary)}</p>
            </details>
            <details class="mission-scope">
              <summary>Files changed</summary>
              <p>${escapeHtml(item.filesChanged)}</p>
            </details>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderExploreWorkspace(eos, token) {
  const queues = eos.portfolioQueues || {};
  const inventory = queues.opportunityInventory || {};
  const expansionProjects = eos.expansionProjects || [];
  const fieldMode = (queues.fieldModeQueue || []).slice(0, 4);
  const projectedMarkets = activeProjectedMarkets(eos);
  const activeMarkets = projectedMarkets.filter((market) => (market.nextMissions || []).length).slice(0, 4);
  const remainingMarkets = projectedMarkets.filter((market) => !activeMarkets.some((active) => active.id === market.id));
  const projectionSummary = (eos.marketProjection && eos.marketProjection.summary) || {};
  return `
    <a class="back-link" href="/admin/eos?${tokenParam(token)}">Back to Today</a>
    <section class="current-focus" aria-label="Current Focus">
      <span>Current Focus</span>
      <p>${escapeHtml(marketFocusSummary(eos, activeMarkets))}</p>
    </section>

    <section class="metrics metrics--mission-control" aria-label="Mission Control overview">
      ${renderMetric("Markets", projectionSummary.markets || eos.overview.metroCount, "Primary planning objects")}
      ${renderMetric("Programs", projectionSummary.markets && projectionSummary.programsPerMarket ? projectionSummary.markets * projectionSummary.programsPerMarket : "", "Projected across markets")}
      ${renderMetric("Campaigns", projectionSummary.campaigns || 0, "Market completion progress")}
      ${renderMetric("Initiatives", projectionSummary.initiatives || 0, "Program milestones")}
      ${renderMetric("Missions", projectionSummary.missions || 0, "Executable packets unchanged")}
    </section>

    <section class="market-workspace" aria-label="Market Workspace">
      <div class="section-heading">
        <div>
          <h2>Market Workspace</h2>
          <p>Markets are the primary Mission Control object. Each market shows a single top mission and active Programs from the EOS market projection.</p>
        </div>
        <a class="subtle-link" href="/admin/eos?${tokenParam(token)}&queue=inventory">${escapeHtml(inventory.total || 0)} Hidden Work Items</a>
      </div>
      <div class="market-workspace-grid">
        ${activeMarkets.map((market) => renderMarketWorkspaceCard(market, eos, token)).join("")}
      </div>
      ${remainingMarkets.length ? `
        <details class="show-all-missions show-all-markets">
          <summary>Show All Markets</summary>
          <div class="market-workspace-grid">
            ${remainingMarkets.map((market) => renderMarketWorkspaceCard(market, eos, token)).join("")}
          </div>
        </details>
      ` : ""}
    </section>

    ${renderQueueSummary(eos)}
    ${renderHandoffSummary(eos)}
    ${renderCommercialKnowledgeIntelligence(eos)}
    ${renderCommercialMarketEvidenceService(eos)}

    <section class="section-heading section-heading--standalone">
      <div>
        <h2>Metro Health</h2>
        <p>Mission Control separates Publisher state, Knowledge Readiness, Experience Readiness, and Recommendation Coverage before showing secondary diagnostics.</p>
      </div>
    </section>
    <section class="metro-grid">
      ${eos.metros.map((metro) => renderMetroCard(metro, token)).join("")}
    </section>

    <section class="queue-section">
      <div class="section-heading">
        <div>
          <h2>Expansion Queue</h2>
          <p>Future metros are shown by what remains before they can become Live, not only by completion percentage.</p>
        </div>
      </div>
      <div class="expansion-grid">${expansionProjects.map((project) => renderExpansionProject(project, token)).join("")}</div>
    </section>

    <section class="inventory-strip">
      <div>
        <span>Opportunity Inventory</span>
        <strong>${escapeHtml(inventory.total || 0)} Opportunities</strong>
        <p>Raw measurable gaps remain available, but they are intentionally secondary to the Market Workspace.</p>
      </div>
      <a href="/admin/eos?${tokenParam(token)}&queue=inventory">View Inventory</a>
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

function renderOverview(eos, token) {
  const recommendations = todayRecommendations(eos, token);
  const changes = todayChanged(eos);
  const attention = todayAttentionItems(eos);

  return `
    <section class="today-hero" aria-label="Today's Briefing">
      <span>Today</span>
      <h2>If you only had one hour today, start here.</h2>
      <p>Generated from EOS strategy, Publisher readiness, Commercial Knowledge Intelligence, QA, Field Mode, and review queues.</p>
    </section>

    <section class="today-section" aria-label="What should I work on today?">
      <div class="section-heading">
        <div>
          <h2>What should I work on today?</h2>
          <p>Maximum three recommendations. Everything else is available under Explore.</p>
        </div>
      </div>
      <div class="today-card-grid">
        ${recommendations.map(renderTodayRecommendation).join("")}
      </div>
    </section>

    <section class="today-briefing-grid">
      <article class="today-panel">
        <span>What Changed</span>
        <ul>
          ${changes.map((item) => `<li><strong>${escapeHtml(item.source)}</strong><p>${escapeHtml(item.text)}</p></li>`).join("") || "<li><strong>No material changes</strong><p>No meaningful generated changes are visible in the current snapshot.</p></li>"}
        </ul>
        <a class="subtle-link" href="/admin/eos?${tokenParam(token)}&queue=intelligence">Explore more</a>
      </article>
      <article class="today-panel">
        <span>Needs Attention</span>
        <ul>
          ${attention.map((item) => `<li><p>${escapeHtml(item)}</p></li>`).join("")}
        </ul>
        <a class="subtle-link" href="/admin/eos?${tokenParam(token)}&queue=markets">Explore more</a>
      </article>
    </section>

    ${renderTodayExplore(token)}
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
    : selectedQueue === "archive"
      ? renderMissionArchive(eos, token)
      : selectedQueue === "markets"
      ? renderExploreWorkspace(eos, token)
      : selectedQueue === "intelligence"
      ? renderIntelligenceExplorer(eos, token)
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
  <title>Mission Control | Rofo Admin</title>
  <style>
    :root { --ink: #152033; --muted: #66758b; --blue: #2457d6; --border: #dbe4ef; --bg: #f4f7fb; --card: #ffffff; --soft: #f8fafc; --green: #0f766e; --amber: #b45309; --red: #b91c1c; --purple: #6d28d9; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: linear-gradient(180deg, #f8fbff 0, #f4f7fb 460px, #f4f7fb 100%); font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1360px, calc(100% - 48px)); margin: 0 auto; padding: 38px 0 64px; }
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
    .current-focus { margin: 0 0 20px; padding: 24px 28px; border-radius: 24px; background: #0f172a; box-shadow: 0 20px 52px rgba(15, 23, 42, 0.16); }
    .current-focus span { display: block; margin-bottom: 8px; color: #93c5fd; font-size: 0.76rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
    .current-focus p { max-width: 980px; margin: 0; color: #f8fafc; font-size: clamp(1.25rem, 2vw, 1.8rem); line-height: 1.28; }
    .today-hero { margin: 0 0 28px; padding: clamp(26px, 5vw, 48px); border: 1px solid #dbeafe; border-radius: 28px; background: linear-gradient(135deg, #ffffff, #f8fbff); box-shadow: 0 22px 58px rgba(15, 23, 42, 0.07); }
    .today-hero span, .today-card span, .today-panel > span { display: block; color: #1d4ed8; font-size: 0.74rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
    .today-hero h2 { max-width: 760px; margin: 10px 0; color: #0f172a; font-size: clamp(2rem, 4.2vw, 4rem); line-height: 1.02; letter-spacing: 0; }
    .today-hero p { max-width: 760px; margin: 0; font-size: 1.05rem; }
    .today-section { margin: 0 0 24px; }
    .today-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .today-card { display: grid; gap: 12px; align-content: start; padding: 20px; border: 1px solid rgba(203, 213, 225, 0.9); border-radius: 22px; background: #fff; box-shadow: 0 16px 42px rgba(15, 23, 42, 0.055); }
    .today-card h2 { margin: 0; color: #0f172a; font-size: 1.22rem; line-height: 1.18; }
    .today-card p { margin: 0; font-size: 0.92rem; }
    .today-card__facts { display: flex; flex-wrap: wrap; gap: 7px; }
    .today-card__facts span { display: inline-flex; gap: 6px; align-items: baseline; min-height: 28px; padding: 0 9px; border-radius: 999px; background: #f1f5f9; color: #0f172a; font-size: 0.78rem; font-weight: 850; }
    .today-card__facts em { color: var(--muted); font-style: normal; font-size: 0.66rem; font-weight: 950; letter-spacing: 0.04em; text-transform: uppercase; }
    .today-card .start-work { margin-top: 4px; }
    .today-briefing-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 0 0 28px; }
    .today-panel { padding: 20px; border: 1px solid rgba(203, 213, 225, 0.9); border-radius: 22px; background: rgba(255,255,255,0.94); box-shadow: 0 14px 36px rgba(15, 23, 42, 0.045); }
    .today-panel ul { display: grid; gap: 10px; margin: 12px 0 14px; padding: 0; list-style: none; }
    .today-panel li { padding: 10px 0; border-bottom: 1px solid #edf2f7; }
    .today-panel li:last-child { border-bottom: 0; }
    .today-panel strong { display: block; margin-bottom: 3px; color: #0f172a; font-size: 0.9rem; }
    .today-panel p { margin: 0; font-size: 0.9rem; }
    .today-explore { margin-top: 18px; }
    .today-explore__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .today-explore__grid a { display: grid; gap: 6px; min-height: 116px; padding: 16px; border: 1px solid #e5edf7; border-radius: 18px; background: #fff; color: #0f172a; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04); }
    .today-explore__grid strong { font-size: 1rem; }
    .today-explore__grid span { color: var(--muted); font-size: 0.85rem; font-weight: 650; line-height: 1.42; }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 22px 0; }
    .metrics--mission-control { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .metric-card, .metro-card, .panel, .work-item { border: 1px solid rgba(203, 213, 225, 0.86); border-radius: 20px; background: rgba(255, 255, 255, 0.96); box-shadow: 0 14px 36px rgba(15, 23, 42, 0.045); }
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
    .readiness-dashboard { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .readiness-tile { min-height: 92px; padding: 12px; border-radius: 14px; background: #f8fafc; }
    .readiness-tile span { display: block; color: var(--muted); font-size: 0.68rem; font-weight: 950; letter-spacing: 0.06em; text-transform: uppercase; }
    .readiness-tile strong { display: block; margin: 7px 0 3px; color: #0f172a; font-size: 1.02rem; line-height: 1.12; }
    .readiness-tile small { font-size: 0.74rem; }
    .signal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
    .signal-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 7px 10px; padding: 10px; border: 1px solid #e5edf7; border-radius: 12px; background: var(--soft); }
    .signal-row span { display: block; color: #334155; font-size: 0.82rem; font-weight: 850; }
    .signal-row small { display: block; margin-top: 2px; font-size: 0.74rem; }
    .signal-row strong { font-size: 0.9rem; }
    .signal-row .progress { grid-column: 1 / -1; height: 6px; }
    .readiness-split, .mission-meta { display: flex; flex-wrap: wrap; gap: 8px; }
    .readiness-split span, .mission-meta span { display: inline-flex; align-items: center; min-height: 28px; padding: 0 9px; border: 1px solid #dbeafe; border-radius: 999px; background: #eff6ff; color: #475569; font-size: 0.78rem; font-weight: 850; }
    .readiness-split strong { color: #0f172a; margin-left: 4px; }
    .metro-card__footer { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding-top: 2px; }
    .metro-card__footer p { margin-bottom: 0; font-size: 0.88rem; }
    .queue-section, .panel { margin-top: 20px; }
    .panel { padding: 20px; }
    .market-workspace { margin-top: 22px; }
    .market-workspace-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .market-workspace-card { display: grid; gap: 14px; padding: 18px; border: 1px solid rgba(203, 213, 225, 0.86); border-radius: 22px; background: rgba(255,255,255,0.97); box-shadow: 0 18px 46px rgba(15, 23, 42, 0.055); }
    .market-workspace-card__header { display: flex; justify-content: space-between; gap: 16px; align-items: start; }
    .market-workspace-card__header h2 { margin-bottom: 5px; font-size: 1.55rem; }
    .market-workspace-card__header p { margin-bottom: 0; font-size: 0.9rem; }
    .market-next-mission { display: grid; gap: 8px; padding: 15px; border: 1px solid #bfdbfe; border-radius: 16px; background: linear-gradient(135deg, #eff6ff, #f8fafc); }
    .market-next-mission span:first-child { display: block; color: #1d4ed8; font-size: 0.7rem; font-weight: 950; letter-spacing: 0.07em; text-transform: uppercase; }
    .market-next-mission h3 { margin: 0; font-size: 1.14rem; line-height: 1.22; }
    .market-next-mission p { margin: 0; color: #475569; font-size: 0.9rem; }
    .market-next-mission--empty { border-color: #e5edf7; background: #f8fafc; }
    .program-grid, .program-detail-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
    .program-card, .program-detail-card { padding: 11px; border: 1px solid #e5edf7; border-radius: 14px; background: #f8fafc; }
    .program-card--strong { border-color: #b7efe3; background: #f0fdfa; }
    .program-card--developed { border-color: #bfdbfe; background: #eff6ff; }
    .program-card--attention { border-color: #fed7aa; background: #fff7ed; }
    .program-card__top { display: flex; justify-content: space-between; gap: 8px; align-items: start; }
    .program-card h4, .program-card__top h3 { margin: 0; color: #0f172a; font-size: 0.86rem; line-height: 1.2; }
    .program-card__top span { color: var(--muted); font-size: 0.68rem; font-weight: 950; letter-spacing: 0.05em; text-transform: uppercase; text-align: right; }
    .program-card p, .program-detail-card p { margin: 7px 0 0; color: #475569; font-size: 0.78rem; line-height: 1.35; }
    .program-card__next { color: #0f172a !important; font-weight: 800; }
    .program-card__campaign { color: #64748b !important; font-size: 0.74rem !important; }
    .campaign-card { display: grid; gap: 9px; margin: 12px 0; padding: 13px; border: 1px solid #e5edf7; border-radius: 14px; background: #f8fafc; }
    .campaign-card span:first-child { display: block; color: #1d4ed8; font-size: 0.68rem; font-weight: 950; letter-spacing: 0.07em; text-transform: uppercase; }
    .campaign-card h4 { margin: 0 0 4px; font-size: 1rem; line-height: 1.2; }
    .campaign-card p { margin: 0; color: #64748b; font-size: 0.84rem; }
    .campaign-card__facts { display: flex; flex-wrap: wrap; gap: 7px; }
    .campaign-card__facts span { display: inline-flex; gap: 6px; align-items: baseline; min-height: 26px; padding: 0 8px; border-radius: 999px; background: #fff; color: #0f172a; font-size: 0.78rem; font-weight: 850; }
    .campaign-card__facts em { color: var(--muted); font-style: normal; font-size: 0.66rem; font-weight: 950; letter-spacing: 0.04em; text-transform: uppercase; }
    .initiative-list { display: grid; gap: 10px; margin-top: 10px; }
    .initiative-list article { padding: 10px; border: 1px solid #e5edf7; border-radius: 12px; background: #f8fafc; }
    .initiative-list h4 { margin: 0 0 4px; font-size: 0.9rem; }
    .initiative-list p { margin: 0 0 6px; font-size: 0.82rem; }
    .initiative-list ul { display: grid; gap: 4px; margin: 0; padding-left: 18px; }
    .initiative-rows { display: grid; gap: 8px; margin-top: 8px; }
    .initiative-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px; border: 1px solid #e5edf7; border-radius: 12px; background: #fff; }
    .initiative-row span { display: block; margin-bottom: 4px; color: var(--muted); font-size: 0.66rem; font-weight: 950; letter-spacing: 0.06em; text-transform: uppercase; }
    .initiative-row h5 { margin: 0 0 3px; color: #0f172a; font-size: 0.9rem; line-height: 1.22; }
    .initiative-row p { margin: 0; color: #64748b; font-size: 0.78rem; }
    .initiative-row__mission { margin-top: 6px !important; color: #334155 !important; }
    .initiative-status--next { border-color: #bfdbfe; background: #eff6ff; }
    .initiative-status--complete { border-color: #b7efe3; background: #f0fdfa; }
    .initiative-status--queued { border-color: #e5edf7; background: #f8fafc; }
    .initiative-status--not-currently-prioritized { opacity: 0.76; }
    .work-queue { display: grid; gap: 12px; }
    .work-item { display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 14px; padding: 14px; }
    .work-item__priority { display: grid; align-content: start; gap: 7px; }
    .stars { color: #f59e0b; font-size: 1.05rem; letter-spacing: 0; }
    .work-item__priority span:last-child { color: var(--muted); font-size: 0.78rem; font-weight: 850; }
    .work-item__heading { display: flex; justify-content: space-between; gap: 14px; align-items: start; }
    .work-item__heading h3 { margin: 0 0 4px; font-size: 1.08rem; }
    .work-item__heading p { margin-bottom: 0; font-size: 0.9rem; }
    .start-work { display: inline-flex; width: fit-content; min-height: 36px; align-items: center; margin-top: 10px; padding: 0 12px; border-radius: 9px; background: var(--blue); color: #fff; font-size: 0.85rem; font-weight: 900; }
    .start-work--small { min-height: 32px; margin-top: 0; padding: 0 10px; font-size: 0.78rem; white-space: nowrap; }
    .mission-facts { display: flex; flex-wrap: wrap; gap: 7px; margin: 11px 0 9px; }
    .mission-facts span { display: inline-flex; gap: 6px; align-items: baseline; min-height: 28px; padding: 0 9px; border-radius: 999px; background: #f1f5f9; color: #0f172a; font-size: 0.8rem; font-weight: 850; }
    .mission-facts em { color: var(--muted); font-style: normal; font-size: 0.68rem; font-weight: 950; letter-spacing: 0.04em; text-transform: uppercase; }
    .current-constraint { margin: 0 0 8px; color: #334155; font-size: 0.9rem; }
    dl { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
    dl div { padding: 9px; border: 1px solid #e5edf7; border-radius: 10px; background: var(--soft); }
    dd { margin: 3px 0 0; color: var(--ink); font-weight: 850; }
    .why { padding: 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #e5edf7; }
    .why strong { display: block; margin-bottom: 7px; }
    .why ul { display: grid; gap: 5px; margin: 0; padding-left: 18px; }
    .mission-meta { margin: -2px 0 12px; }
    .mission-meta span { border-color: #e5edf7; background: #fff; }
    .mission-scope { margin-top: 8px; padding: 10px 12px; border: 1px solid #e5edf7; border-radius: 12px; background: #fff; }
    .mission-scope summary { color: #1e3a8a; font-size: 0.86rem; font-weight: 900; cursor: pointer; }
    .mission-scope h4 { margin: 12px 0 6px; font-size: 0.82rem; letter-spacing: 0; }
    .mission-scope ul { margin: 0; padding-left: 18px; }
    .mission-scope p { margin: 8px 0 0; }
    .show-all-missions { margin-top: 14px; padding: 14px; border: 1px solid rgba(203, 213, 225, 0.82); border-radius: 18px; background: rgba(255,255,255,0.72); }
    .show-all-missions summary { color: #1d4ed8; font-weight: 950; cursor: pointer; }
    .show-all-missions .work-queue { margin-top: 14px; }
    .show-all-markets .market-workspace-grid { margin-top: 14px; }
    .subtle-link { color: #64748b; font-size: 0.9rem; }
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
    .remaining-work { padding: 12px; border-radius: 14px; background: #f8fafc; }
    .remaining-work span, .archive-note { display: block; color: var(--muted); font-size: 0.7rem; font-weight: 950; letter-spacing: 0.06em; text-transform: uppercase; }
    .remaining-work strong { display: block; margin: 5px 0 4px; color: #0f172a; }
    .remaining-work ul { display: grid; gap: 4px; margin: 8px 0 0; padding-left: 18px; }
    .inventory-strip { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin: 22px 0; padding: 16px 18px; border-radius: 18px; background: rgba(255,255,255,0.62); }
    .inventory-strip span { display: block; color: var(--muted); font-size: 0.7rem; font-weight: 950; letter-spacing: 0.06em; text-transform: uppercase; }
    .inventory-strip strong { display: block; margin: 4px 0 3px; color: #334155; font-size: 1.12rem; }
    .inventory-strip p { margin: 0; font-size: 0.86rem; }
    .archive-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .archive-card { display: grid; gap: 10px; padding: 18px; border: 1px solid rgba(203, 213, 225, 0.84); border-radius: 20px; background: rgba(255,255,255,0.96); box-shadow: 0 14px 36px rgba(15, 23, 42, 0.045); }
    .archive-card h3 { margin-bottom: 6px; font-size: 1.15rem; }
    .archive-card dl { grid-template-columns: 1fr; margin: 4px 0; }
    .packet-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
    .packet-grid--wide { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .handoff-summary, .handoff-rail { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 0 0 24px; }
    .handoff-rail { margin: 14px 0 0; }
    .handoff-summary span, .handoff-rail span { display: block; color: #334155; font-size: 0.82rem; font-weight: 900; }
    .handoff-summary p, .handoff-rail p { margin: 6px 0 0; font-size: 0.84rem; }
    .platform-service { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 18px; align-items: start; margin: 0 0 24px; padding: 20px; border: 1px solid #c7d7ee; border-radius: 20px; background: rgba(255,255,255,0.9); box-shadow: 0 16px 44px rgba(15, 23, 42, 0.055); }
    .platform-service span { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 950; letter-spacing: 0.06em; text-transform: uppercase; }
    .platform-service h2 { margin: 7px 0 8px; font-size: 1.55rem; }
    .platform-service p { margin-bottom: 0; }
    .platform-service__inline-meta { margin-top: 10px !important; color: #64748b; font-size: 0.84rem; font-weight: 800; }
    .platform-service__metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .platform-service__metrics article { padding: 12px; border: 1px solid #e5edf7; border-radius: 14px; background: #f8fafc; box-shadow: none; }
    .platform-service__metrics strong { display: block; margin-bottom: 4px; color: #0f172a; font-size: 1.05rem; line-height: 1.18; }
    .platform-service__meta { grid-column: 1 / -1; padding-top: 4px; font-size: 0.84rem; }
    .platform-service--knowledge { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); }
    .knowledge-intelligence-grid { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding-top: 12px; border-top: 1px solid #e5edf7; }
    .knowledge-intelligence-grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 0; padding-top: 0; }
    .knowledge-intelligence-grid article { padding: 13px; border: 1px solid #e5edf7; border-radius: 14px; background: #f8fafc; }
    .knowledge-intelligence-grid ul { display: grid; gap: 8px; margin: 9px 0 0; padding: 0; list-style: none; }
    .knowledge-intelligence-grid li { padding: 9px; border-radius: 11px; background: #fff; }
    .knowledge-intelligence-grid strong { display: block; color: #0f172a; font-size: 0.9rem; line-height: 1.22; }
    .knowledge-intelligence-grid small { display: block; margin-top: 3px; color: #64748b; font-size: 0.76rem; }
    .knowledge-intelligence-grid p { margin: 5px 0 0; color: #475569; font-size: 0.78rem; }
    .market-evidence-expansion { grid-column: 1 / -1; padding-top: 12px; border-top: 1px solid #e5edf7; }
    .market-evidence-expansion .section-heading { margin-bottom: 10px; }
    .expansion-order { display: grid; gap: 10px; margin: 10px 0 0; padding-left: 20px; }
    .expansion-order li { padding: 10px; border: 1px solid #e5edf7; border-radius: 12px; background: #f8fafc; }
    .expansion-order strong { display: block; color: #0f172a; }
    .expansion-order span { display: block; margin-top: 2px; color: var(--muted); font-size: 0.78rem; font-weight: 850; letter-spacing: 0; text-transform: none; }
    .expansion-order p { margin: 6px 0 0; font-size: 0.84rem; }
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
    .review-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
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
      .metrics, .signal-grid, .signal-grid--detail, .selected-grid, dl, .queue-summary, .expansion-grid, .field-mode-grid, .packet-grid, .packet-grid--wide, .handoff-summary, .handoff-rail, .platform-service, .platform-service__metrics, .mission-review__hero, .review-grid, .mission-comparison, .market-workspace-grid, .program-grid, .program-detail-grid, .knowledge-intelligence-grid, .knowledge-intelligence-grid--three, .today-card-grid, .today-briefing-grid, .today-explore__grid { grid-template-columns: 1fr; }
      .metro-card__top, .metro-card__footer, .section-heading, .work-item__heading, .expansion-card__top, .codex-handoff__top, .market-workspace-card__header { flex-direction: column; }
      .health-score { text-align: left; }
      .work-item { grid-template-columns: 1fr; }
      .initiative-row { grid-template-columns: 1fr; }
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
      const improvements = extractMeasurableImprovements(parsed);
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
        publisherOutcome: improvements[0] ? improvements[0].before + " -> " + improvements[0].after : "Not reported",
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
      section.querySelector("[data-review-publisher]").textContent = missionReview.publisherOutcome;
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
      <h1>Today</h1>
      <p>EOS is Rofo's executive operating system. The home screen is an opinionated briefing for what deserves attention, what changed, and what can wait.</p>
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
