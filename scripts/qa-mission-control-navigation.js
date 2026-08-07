const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const NAV_PATH = path.join(ROOT, "functions/admin/mission-control-nav.js");
const EOS_PATH = path.join(ROOT, "functions/admin/eos.js");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const navSource = fs.readFileSync(NAV_PATH, "utf8");
const expectedItems = [
  ['id: "today"', 'label: "Today"', 'path: "/admin/eos"'],
  ['id: "markets"', 'label: "Markets"', 'queue: "markets"'],
  ['id: "intelligence"', 'label: "Intelligence"', 'queue: "intelligence"'],
  ['id: "publisher"', 'label: "Publisher"', 'path: "/admin/publisher"'],
  ['id: "compass"', 'label: "Compass"', 'path: "/admin/compass"'],
  ['id: "field"', 'label: "Field"', 'path: "/admin/field-photos"'],
  ['id: "leads"', 'label: "Leads"', 'path: "/admin/operations"'],
  ['id: "archive"', 'label: "Archive"', 'queue: "archive"'],
];

assert(navSource.includes("MISSION_CONTROL_NAV_ITEMS"), "Mission Control nav should have one canonical item definition.");
assert(navSource.includes("renderMissionControlHeader"), "Mission Control nav should expose a shared page header renderer.");
assert(navSource.includes("renderMissionControlNav"), "Mission Control nav should expose a shared nav renderer.");
assert(navSource.includes("mission-control-nav__scroll"), "Mission Control nav should include a mobile-friendly scroll container.");
assert(navSource.includes("overflow-x: auto"), "Mission Control nav should support horizontal mobile scrolling.");
expectedItems.forEach((tokens) => {
  tokens.forEach((token) => assert(navSource.includes(token), `Mission Control nav definition missing ${token}.`));
});

const pages = [
  ["functions/admin/eos.js", "today", ["active: header.active", 'selectedQueue === "markets"', 'selectedQueue === "intelligence"', 'selectedQueue === "archive"']],
  ["functions/admin/publisher.js", "publisher", ['active: "publisher"']],
  ["functions/admin/operations.js", "leads", ['active: "leads"']],
  ["functions/admin/leads.js", "leads", ['active: "leads"']],
  ["functions/admin/compass.js", "compass", ['active: "compass"']],
  ["functions/admin/coverage.js", "compass", ['active: "compass"']],
  ["functions/admin/field-photos.js", "field", ['active: "field"']],
  ["functions/admin/brokers.js", "leads", ['active: "leads"']],
];

pages.forEach(([relativePath, active, requiredTokens]) => {
  const source = read(relativePath);
  assert(source.includes("renderMissionControlHeader"), `${relativePath} should render the shared Mission Control header.`);
  assert(source.includes("MISSION_CONTROL_NAV_CSS"), `${relativePath} should include the shared Mission Control nav CSS.`);
  requiredTokens.forEach((token) => assert(source.includes(token), `${relativePath} missing expected nav/header token ${token}.`));
  if (relativePath !== "functions/admin/eos.js") {
    assert(!source.includes("<nav class=\"nav\""), `${relativePath} should not keep a duplicate local admin nav.`);
    assert(!source.includes("<nav class=\"admin-nav\""), `${relativePath} should not keep a duplicate local admin nav.`);
  }
  assert(source.includes(`active: "${active}"`) || source.includes("active: header.active"), `${relativePath} should set the expected active nav context.`);
});

const eosSource = read("functions/admin/eos.js");
assert(eosSource.includes("missionControlHeaderForRoute"), "EOS should derive page header and active nav context from the selected route.");
assert(eosSource.includes("title: \"Commercial Knowledge Intelligence\""), "Intelligence route should keep the full page title while nav uses Intelligence.");

if (errors.length) {
  console.error("Mission Control navigation QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Mission Control navigation QA passed.");
console.log("Canonical nav: Today, Markets, Intelligence, Publisher, Compass, Field, Leads, Archive.");
