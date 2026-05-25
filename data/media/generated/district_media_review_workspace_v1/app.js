const DATA = window.DISTRICT_MEDIA_REVIEW_WORKSPACE_V1;
const STATE_KEY = "rofo:district-media-review:v1";
const districtSelect = document.getElementById("districtSelect");
const districtStats = document.getElementById("districtStats");
const districtTitle = document.getElementById("districtTitle");
const districtKicker = document.getElementById("districtKicker");
const reviewCounts = document.getElementById("reviewCounts");
const candidateGroups = document.getElementById("candidateGroups");
const imagesOnly = document.getElementById("imagesOnly");
const needsReviewOnly = document.getElementById("needsReviewOnly");

let reviewState = loadState();

function loadState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || "{}"); }
  catch (_) { return {}; }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(reviewState));
}

function keyFor(candidate, image) {
  return [candidate.district_slug, candidate.building_id, image && image.filename ? image.filename : "no-image"].join("::");
}

function imageSrc(image) {
  if (!image) return "";
  return image.local_relative_path || (image.absolute_path ? "file://" + image.absolute_path : "");
}

function displayName(candidate) {
  return candidate.building_name || candidate.address || "Building " + candidate.building_id;
}

function allDistrictCandidates(district) {
  return [
    ...district.priority_review.map((item) => ({...item, tier: "priority_review"})),
    ...district.secondary_review.map((item) => ({...item, tier: "secondary_review"})),
  ];
}

function candidateImages(candidate) {
  return candidate.image_candidate_summaries && candidate.image_candidate_summaries.length
    ? candidate.image_candidate_summaries
    : [null];
}

function stateCounts(district) {
  const counts = {accepted: 0, rejected: 0, hero_candidate: 0, supporting_candidate: 0, unreviewed: 0};
  for (const candidate of allDistrictCandidates(district)) {
    for (const image of candidateImages(candidate)) {
      const state = reviewState[keyFor(candidate, image)] || "unreviewed";
      counts[state] = (counts[state] || 0) + 1;
    }
  }
  return counts;
}

function renderStats(district) {
  const stats = district.coverage_stats || {};
  districtStats.innerHTML = [
    ["Buildings", stats.building_count],
    ["Covered", stats.buildings_with_original_image_coverage],
    ["Images", stats.original_image_count],
    ["Coverage", ((stats.coverage_rate || 0) * 100).toFixed(1) + "%"],
  ].map(([label, value]) => '<div class="stat"><span>' + label + '</span><strong>' + value + '</strong></div>').join("");
}

function renderCounts(district) {
  const counts = stateCounts(district);
  reviewCounts.innerHTML = Object.entries(counts)
    .map(([label, value]) => '<span class="pill">' + label.replace("_", " ") + ': ' + value + '</span>')
    .join("");
}

function shouldShow(candidate, image) {
  if (imagesOnly.checked && !image) return false;
  if (needsReviewOnly.checked && reviewState[keyFor(candidate, image)]) return false;
  return true;
}

function renderCandidate(candidate) {
  const cards = [];
  for (const image of candidateImages(candidate)) {
    if (!shouldShow(candidate, image)) continue;
    const key = keyFor(candidate, image);
    const active = reviewState[key] || "";
    const img = image ? '<img loading="lazy" src="' + imageSrc(image) + '" alt="">' : '<span>No matched original image</span>';
    const file = image ? (image.local_relative_path || image.filename) : "pending image match";
    const source = image && image.original_absolute_path ? '<div class="path">source: ' + image.original_absolute_path + '</div>' : "";
    cards.push('<article class="candidate-card">' +
      '<div class="image-frame">' + img + '</div>' +
      '<div class="card-body">' +
      '<h3 class="building-title">' + displayName(candidate) + '</h3>' +
      '<div class="meta">' + candidate.address + ' · ' + candidate.visual_environment_category + '</div>' +
      '<div class="candidate-tags">' +
      '<span class="tag">' + candidate.tier.replace("_", " ") + '</span>' +
      '<span class="tag">' + candidate.original_image_count + ' originals</span>' +
      '<span class="tag">' + (candidate.published ? 'published/historical' : 'unpublished/context') + '</span>' +
      (candidate.representative_building_seed ? '<span class="tag">representative seed</span>' : '') +
      '</div>' +
      '<div class="path">' + file + '</div>' +
      source +
      '<div class="review-buttons">' +
      button("accepted", active, key) +
      button("rejected", active, key) +
      button("hero_candidate", active, key) +
      button("supporting_candidate", active, key) +
      '</div>' +
      '</div>' +
      '</article>');
  }
  return cards.join("");
}

function button(state, active, key) {
  return '<button class="review-button ' + (active === state ? 'active' : '') + '" data-state="' + state + '" data-key="' + key + '">' + state.replace("_", " ") + '</button>';
}

function renderDistrict() {
  const slug = districtSelect.value;
  const district = DATA.districts.find((item) => item.district_slug === slug);
  if (!district) return;
  districtTitle.textContent = district.district_name;
  districtKicker.textContent = district.district_slug;
  renderStats(district);
  renderCounts(district);
  const groups = [
    ["Priority review", district.priority_review.map((item) => ({...item, tier: "priority_review"}))],
    ["Secondary review", district.secondary_review.map((item) => ({...item, tier: "secondary_review"}))],
  ];
  candidateGroups.innerHTML = groups.map(([title, candidates]) => {
    const cards = candidates.map(renderCandidate).join("");
    return '<section><h2 class="group-title">' + title + '</h2><div class="card-grid">' + (cards || '<div class="meta">No candidates match the current filters.</div>') + '</div></section>';
  }).join("");
}

function init() {
  districtSelect.innerHTML = DATA.districts.map((district) => '<option value="' + district.district_slug + '">' + district.district_name + '</option>').join("");
  districtSelect.addEventListener("change", renderDistrict);
  imagesOnly.addEventListener("change", renderDistrict);
  needsReviewOnly.addEventListener("change", renderDistrict);
  candidateGroups.addEventListener("click", (event) => {
    const button = event.target.closest(".review-button");
    if (!button) return;
    const key = button.dataset.key;
    const state = button.dataset.state;
    reviewState[key] = reviewState[key] === state ? "" : state;
    if (!reviewState[key]) delete reviewState[key];
    saveState();
    renderDistrict();
  });
  document.getElementById("exportReview").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({generated_at: new Date().toISOString(), state: reviewState}, null, 2)], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "district-media-review-state-v1.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });
  document.getElementById("clearFilters").addEventListener("click", () => {
    imagesOnly.checked = false;
    needsReviewOnly.checked = false;
    renderDistrict();
  });
  renderDistrict();
}

init();
