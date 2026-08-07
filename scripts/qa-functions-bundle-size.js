const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const ADMIN_EOS_PATH = path.join(ROOT, "functions", "admin", "eos.js");
const ADMIN_RUNTIME_PATH = path.join(ROOT, "data", "generated", "eos-admin-runtime.json");
const FULL_EOS_PATH = path.join(ROOT, "data", "generated", "eos-analysis.json");
const SEARCH_SNAPSHOT_PATH = path.join(ROOT, "data", "generated", "search-console-opportunity.json");
const DEFAULT_BUNDLE_PATH = "/tmp/rofo-functions-build/index.js";
const MAX_RUNTIME_BYTES = 8 * 1024 * 1024;
const MAX_BUNDLE_BYTES = 25 * 1024 * 1024;

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function sizeOf(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).size : null;
}

const adminSource = fs.readFileSync(ADMIN_EOS_PATH, "utf8");
assert(adminSource.includes("../../data/generated/eos-admin-runtime.json"), "EOS admin Function should import the compact runtime snapshot.");
assert(!adminSource.includes("../../data/generated/eos-analysis.json"), "EOS admin Function must not statically import full eos-analysis.json.");
assert(!adminSource.includes("../../data/generated/search-console-opportunity.json"), "EOS admin Function must not statically import raw Search Intelligence snapshots.");

const runtimeSize = sizeOf(ADMIN_RUNTIME_PATH);
const fullEosSize = sizeOf(FULL_EOS_PATH);
const searchSnapshotSize = sizeOf(SEARCH_SNAPSHOT_PATH);
assert(runtimeSize !== null, "EOS admin runtime snapshot should exist.");
assert(runtimeSize === null || runtimeSize < MAX_RUNTIME_BYTES, `EOS admin runtime snapshot should stay below ${MAX_RUNTIME_BYTES} bytes; current size is ${runtimeSize}.`);
assert(fullEosSize === null || runtimeSize === null || runtimeSize < fullEosSize, "EOS admin runtime snapshot should be smaller than full EOS analysis.");

const bundlePath = process.argv[2] || DEFAULT_BUNDLE_PATH;
const bundleSize = sizeOf(bundlePath);
if (bundleSize !== null) {
  const bundle = fs.readFileSync(bundlePath, "utf8");
  assert(bundleSize < MAX_BUNDLE_BYTES, `Pages Functions bundle should stay below ${MAX_BUNDLE_BYTES} bytes; current size is ${bundleSize}.`);
  assert(!bundle.includes('"rawRows"'), "Pages Functions bundle should not include raw Search Intelligence rows.");
  assert(!bundle.includes('"rawObservationSummary"') || bundle.includes('"eos-commercial-knowledge-intelligence-v1"'), "Pages Functions bundle should not embed the full raw Search Intelligence artifact.");
}

if (errors.length) {
  console.error("Functions bundle-size QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Functions bundle-size QA passed.");
console.log(`EOS admin runtime: ${runtimeSize} bytes.`);
console.log(`Full EOS analysis: ${fullEosSize} bytes.`);
console.log(`Search snapshot: ${searchSnapshotSize} bytes.`);
if (bundleSize !== null) console.log(`Pages Functions bundle: ${bundleSize} bytes.`);
