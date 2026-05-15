const fs = require("fs");
const path = require("path");

const dataPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "atlanta",
  "reviews",
  "atlanta_approved_editorial_signals.json"
);

function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function areaPath(signal) {
  return `/commercial-real-estate/${signal.state}/${slugify(signal.city)}/${slugify(signal.neighborhood)}/`;
}

function loadSignals() {
  if (!fs.existsSync(dataPath)) {
    return [];
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  return (data.signals || []).filter(
    (signal) =>
      signal.source_status === "human_approved" &&
      signal.display_status === "public_safe"
  );
}

const signals = loadSignals();
const byPath = {};
const bySlug = {};
const byName = {};

for (const signal of signals) {
  const pathKey = areaPath(signal);
  const slugKey = slugify(signal.neighborhood);
  const nameKey = clean(signal.neighborhood).toLowerCase();

  byPath[pathKey] = signal;
  bySlug[slugKey] = signal;
  byName[nameKey] = signal;
}

module.exports = {
  signals,
  byPath,
  bySlug,
  byName,
};
