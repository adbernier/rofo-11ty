(function () {
  const root = document.querySelector("[data-sf-office-interactive]");
  const dataNode = document.querySelector("[data-sf-office-interactive-data]");
  if (!root || !dataNode) return;

  const prototypeData = JSON.parse(dataNode.textContent || "{}");
  const resultsByKey = prototypeData.resultsByKey || {};
  const baseSourceAnswers = prototypeData.policy.baseSourceAnswers || {};
  const workspaceSections = prototypeData.policy.workspaceSections || [];
  const scenarios = prototypeData.scenarios || [];

  const els = {
    editor: root.querySelector("[data-sf-profile-editor]"),
    bestFits: root.querySelector("[data-sf-best-fits]"),
    fitIntro: root.querySelector("[data-sf-fit-intro]"),
    changeMessage: root.querySelector("[data-sf-change-message]"),
    districtDetail: root.querySelector("[data-sf-district-detail]"),
    debug: root.querySelector("[data-sf-debug]"),
    reset: root.querySelector("[data-sf-reset]"),
    createBrief: root.querySelector("[data-sf-create-brief]"),
    briefStatus: root.querySelector("[data-sf-brief-status]"),
    brief: root.querySelector("[data-sf-brief]"),
  };

  const state = {
    sourceAnswers: {},
    selectedDistrictId: "",
    previousResult: null,
    briefVisible: false,
  };

  const districtDetailCopy = {
    "financial-district": {
      character: "Traditional downtown office core with a strong client-facing and professional-services role.",
      ecosystem: "Professional services, finance, and central business access.",
      exploration: "Explore when credibility, client convenience, and downtown access matter most.",
    },
    soma: {
      character: "Central technology and creative office environment with adaptive and modern options.",
      ecosystem: "Technology, product, creative, and central access.",
      exploration: "Explore when talent access, collaboration, and a less traditional office identity matter.",
    },
    "mission-bay": {
      character: "Modern growth district with innovation and UCSF-adjacent context.",
      ecosystem: "Technology, life science, healthcare-adjacent work, and growth-oriented teams.",
      exploration: "Explore when modern offices, growth plans, and southern/Peninsula orientation matter.",
    },
    "jackson-square": {
      character: "Boutique, polished, lower-rise professional environment.",
      ecosystem: "Client-facing professional services, design-adjacent work, and distinctive offices.",
      exploration: "Explore when a smaller-scale but credible office setting is important.",
    },
    "south-beach": {
      character: "Access-oriented district bridging downtown, SoMa, waterfront, and Transbay context.",
      ecosystem: "Client-facing teams, technology, and central access.",
      exploration: "Explore when a central, polished, access-friendly alternative is useful.",
    },
    "showplace-square": {
      character: "Creative and product-oriented district with less conventional office character.",
      ecosystem: "Design, product, hardware, and creative teams.",
      exploration: "Explore when creative character and a lower-rise pattern matter more than downtown formality.",
    },
    dogpatch: {
      character: "Industrial-heritage and innovation-oriented office/R&D context near Mission Bay.",
      ecosystem: "Technology, product, life-science-adjacent, hardware, and creative teams.",
      exploration: "Explore when industrial character, modern adjacency, and practical access are important.",
    },
    "design-district": {
      character: "Design, showroom, and product-oriented commercial environment.",
      ecosystem: "Design, showroom, product, and creative businesses.",
      exploration: "Explore when the office should support presentation, design identity, or client experience.",
    },
    "potrero-hill": {
      character: "Neighborhood-scale creative office context near Mission Bay, Dogpatch, and Showplace Square.",
      ecosystem: "Creative, product, and neighborhood-oriented teams.",
      exploration: "Explore when lower-rise character and a quieter office setting matter.",
    },
    "mission-district": {
      character: "Neighborhood, creative, nonprofit, and mission-driven office context.",
      ecosystem: "Creative, nonprofit, mission-driven, and local-service organizations.",
      exploration: "Explore when walkability, neighborhood identity, and informal office character matter.",
    },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function compactSourceAnswers(sourceAnswers) {
    const withBase = { ...baseSourceAnswers, ...clone(sourceAnswers) };
    const ordered = {};
    Object.keys(withBase).sort().forEach((field) => {
      const value = withBase[field];
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return;
      ordered[field] = value;
    });
    return ordered;
  }

  function answerKey(sourceAnswers) {
    return JSON.stringify(compactSourceAnswers(sourceAnswers));
  }

  function currentEntry() {
    return resultsByKey[answerKey(state.sourceAnswers)] || null;
  }

  function visibleSections() {
    const sourceAnswers = compactSourceAnswers(state.sourceAnswers);
    return workspaceSections.filter((section) => {
      if (!section.condition) return true;
      return sourceAnswers[section.condition.field] === section.condition.value;
    });
  }

  function optionSelected(section, option) {
    const sourceAnswers = compactSourceAnswers(state.sourceAnswers);
    if (section.locked) return true;
    if (section.multi) {
      return (sourceAnswers[section.field] || []).includes(option.value);
    }
    const patch = option.patch || {};
    const value = patch[section.field];
    if (value === undefined) return sourceAnswers[section.field] === undefined;
    return sourceAnswers[section.field] === value;
  }

  function cleanPatch(section, option) {
    if (section.multi) return {};
    const patch = clone(option.patch || {});
    if (patch[section.field] === undefined) {
      patch[section.field] = undefined;
    }
    return patch;
  }

  function setField(field, value) {
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      delete state.sourceAnswers[field];
    } else {
      state.sourceAnswers[field] = value;
    }
  }

  function updateFromOption(section, option) {
    state.previousResult = currentEntry() && currentEntry().result ? clone(currentEntry().result) : state.previousResult;
    state.briefVisible = false;
    if (section.multi) {
      const current = Array.isArray(state.sourceAnswers[section.field])
        ? state.sourceAnswers[section.field].slice()
        : [];
      const exists = current.includes(option.value);
      const next = exists ? current.filter((item) => item !== option.value) : [...current, option.value];
      setField(section.field, next);
    } else {
      Object.entries(cleanPatch(section, option)).forEach(([field, value]) => setField(field, value));
      if (section.field === "businessType" && option.patch && option.patch.businessType !== "life_science") {
        delete state.sourceAnswers.institutionProximity;
      }
    }
    render();
  }

  function readableValue(value) {
    if (Array.isArray(value)) return value.map(readableValue).join(", ");
    return String(value || "").replace(/_/g, " ");
  }

  function confidenceLabel(result, candidate) {
    if (!result) return "Needs Details";
    if (result.state.id === "refined_shortlist" && candidate.score >= 8) return "Excellent Fit";
    if (result.state.id === "refined_shortlist") return "Strong Fit";
    if (result.state.id === "emerging_ranking") return "Good Fit";
    return "Early Direction";
  }

  function candidateReasons(candidate) {
    const reasons = [];
    if (candidate.reason && candidate.reason.signalLabel) reasons.push(candidate.reason.signalLabel);
    if (candidate.strategyRole) reasons.push(candidate.strategyRole);
    if (candidate.score > 0) reasons.push("Matches the current Business Profile better than weaker alternatives.");
    return reasons.slice(0, 3);
  }

  function summarySentence(candidate) {
    const detail = districtDetailCopy[candidate.districtId];
    if (detail) return detail.character;
    return candidate.strategyRole || "A defensible place to begin based on the current Business Profile.";
  }

  function bestFitItems(entry) {
    if (!entry || !entry.interaction || !entry.interaction.revealRecommendation || !entry.result) return [];
    const result = entry.result;
    const items = result.orderedCandidates && result.orderedCandidates.length
      ? result.orderedCandidates
      : result.shortlist;
    return items.slice(0, 5);
  }

  function changeMessage(previous, current) {
    if (!previous || !current) return "";
    const before = (previous.shortlist || []).map((item) => item.districtId).join("|");
    const after = (current.shortlist || []).map((item) => item.districtId).join("|");
    if (before !== after) return "The Best Fits changed because the updated Business Profile shifted which district attributes matter most.";
    if ((previous.explanations || []).length !== (current.explanations || []).length) return "The Best Fits stayed stable, but Rofo has a clearer reason for them.";
    return "";
  }

  function renderProfileEditor() {
    els.editor.innerHTML = visibleSections().map((section) => `
      <section class="sf-workspace-section" data-section="${section.id}">
        <div class="sf-workspace-section__head">
          <h3>${section.label}</h3>
          <span class="sf-workspace-muted">${section.locked ? "Locked" : section.multi ? "Select any" : "Editable"}</span>
        </div>
        <p class="sf-workspace-muted">${section.helper || ""}</p>
        <div class="sf-workspace-options">
          ${(section.options || []).map((option, index) => `
            <button
              class="sf-workspace-chip"
              type="button"
              data-section-id="${section.id}"
              data-option-index="${index}"
              aria-pressed="${optionSelected(section, option) ? "true" : "false"}"
              ${section.locked ? "disabled" : ""}
            >${option.label}</button>
          `).join("")}
        </div>
      </section>
    `).join("");

    els.editor.querySelectorAll("[data-section-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const section = workspaceSections.find((item) => item.id === button.dataset.sectionId);
        const option = section && section.options[Number(button.dataset.optionIndex)];
        if (!section || !option || section.locked) return;
        updateFromOption(section, option);
      });
    });
  }

  function renderBestFits(entry) {
    const result = entry && entry.result;
    const fits = bestFitItems(entry);
    const canCreate = fits.length > 0;
    els.createBrief.disabled = !canCreate;
    els.briefStatus.textContent = canCreate
      ? "Create a Location Brief snapshot from the current Business Profile."
      : "Complete a few more business details to create your Location Brief.";

    if (!entry) {
      els.fitIntro.textContent = "This Business Profile combination is outside the current static prototype bridge.";
      els.bestFits.innerHTML = "<div class=\"sf-workspace-empty\">Reset or load a scenario to continue review.</div>";
      els.districtDetail.hidden = true;
      return;
    }

    if (!canCreate) {
      els.fitIntro.textContent = "Complete a few business details to see Rofo's best places to begin looking.";
      els.bestFits.innerHTML = "<div class=\"sf-workspace-empty\">Rofo knows this is a San Francisco office search, but the profile is not yet specific enough to show Best Fits.</div>";
      els.districtDetail.hidden = true;
      return;
    }

    els.fitIntro.textContent = "These are the places Rofo would begin looking from the current Business Profile.";
    if (!state.selectedDistrictId || !fits.some((item) => item.districtId === state.selectedDistrictId)) {
      state.selectedDistrictId = fits[0].districtId;
    }

    const change = changeMessage(state.previousResult, result);
    els.changeMessage.innerHTML = change ? `<p class="sf-workspace-muted"><strong>Why this changed:</strong> ${change}</p>` : "";

    els.bestFits.innerHTML = fits.map((candidate) => `
      <button class="sf-workspace-fit-card" type="button" data-district-id="${candidate.districtId}" aria-selected="${candidate.districtId === state.selectedDistrictId ? "true" : "false"}">
        <h3>
          <span>${candidate.districtName}</span>
          <span class="sf-workspace-confidence">${confidenceLabel(result, candidate)}</span>
        </h3>
        <p class="sf-workspace-muted">${summarySentence(candidate)}</p>
        <ul class="sf-workspace-reasons">
          ${candidateReasons(candidate).map((reason) => `<li>Fit: ${reason}</li>`).join("")}
        </ul>
      </button>
    `).join("");

    els.bestFits.querySelectorAll("[data-district-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedDistrictId = button.dataset.districtId;
        state.briefVisible = false;
        render();
      });
    });
  }

  function renderDistrictDetail(entry) {
    const fits = bestFitItems(entry);
    const candidate = fits.find((item) => item.districtId === state.selectedDistrictId);
    if (!candidate) {
      els.districtDetail.hidden = true;
      return;
    }
    const detail = districtDetailCopy[candidate.districtId] || {};
    const secondary = entry.result.secondaryAlternatives
      .slice(0, 3)
      .map((item) => item.districtName)
      .join(", ");
    els.districtDetail.hidden = false;
    els.districtDetail.innerHTML = `
      <p class="sf-workspace-kicker">District Detail</p>
      <h3>${candidate.districtName}</h3>
      <p class="sf-workspace-muted">${detail.exploration || candidate.strategyRole}</p>
      <div class="sf-workspace-detail-grid">
        <div class="sf-workspace-detail-item">
          <h4>Office character</h4>
          <p class="sf-workspace-muted">${detail.character || candidate.strategyRole}</p>
        </div>
        <div class="sf-workspace-detail-item">
          <h4>Commercial ecosystem</h4>
          <p class="sf-workspace-muted">${detail.ecosystem || "Review ecosystem detail in the Location Brief."}</p>
        </div>
        <div class="sf-workspace-detail-item">
          <h4>Nearby exploration</h4>
          <p class="sf-workspace-muted">${secondary || "Rofo will compare nearby alternatives in the Location Brief."}</p>
        </div>
      </div>
    `;
  }

  function renderBrief(entry) {
    if (!state.briefVisible || !entry || !entry.result) {
      els.brief.hidden = true;
      return;
    }
    const selected = bestFitItems(entry).find((item) => item.districtId === state.selectedDistrictId) || bestFitItems(entry)[0];
    const profile = compactSourceAnswers(state.sourceAnswers);
    els.brief.hidden = false;
    els.brief.innerHTML = `
      <p class="sf-workspace-kicker">Location Brief Snapshot</p>
      <h3>Based on the Business Profile below, begin with ${selected.districtName}.</h3>
      <p class="sf-workspace-muted">This prototype snapshot is intentionally lighter than the full Location Brief. Editing the Business Profile lets the brief be recreated from the current recommendation.</p>
      <h4>Business Profile</h4>
      <ul class="sf-workspace-reasons">
        ${Object.entries(profile).map(([field, value]) => `<li><strong>${field}:</strong> ${readableValue(value)}</li>`).join("")}
      </ul>
      <h4>Best Fit Reason</h4>
      <p class="sf-workspace-muted">${summarySentence(selected)}</p>
    `;
  }

  function renderDebug(entry) {
    els.debug.textContent = JSON.stringify({
      sourceAnswers: compactSourceAnswers(state.sourceAnswers),
      normalizedProfile: entry && entry.normalized,
      resolverState: entry && entry.result && entry.result.state,
      candidateSet: entry && entry.result && entry.result.currentCandidates,
      ignoredEconomics: entry && entry.normalized && entry.normalized.ignoredEconomicSignals,
      tradeoffs: entry && entry.result && entry.result.unresolvedTradeoffs,
      confidence: entry && entry.result && entry.result.confidence,
      questionMetadata: entry && entry.interaction && entry.interaction.nextQuestion,
    }, null, 2);
  }

  function render() {
    const entry = currentEntry();
    renderProfileEditor();
    renderBestFits(entry);
    renderDistrictDetail(entry);
    renderBrief(entry);
    renderDebug(entry);
    if (entry && entry.result) state.previousResult = clone(entry.result);
  }

  function reset(sourceAnswers) {
    state.sourceAnswers = clone(sourceAnswers || {});
    state.selectedDistrictId = "";
    state.previousResult = null;
    state.briefVisible = false;
    render();
  }

  els.reset.addEventListener("click", () => reset({}));
  els.createBrief.addEventListener("click", () => {
    if (els.createBrief.disabled) return;
    state.briefVisible = true;
    render();
  });

  root.querySelectorAll("[data-sf-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      const scenario = scenarios.find((item) => item.id === button.dataset.sfScenario);
      reset(scenario ? scenario.sourceAnswers : {});
    });
  });

  reset({});
})();
