import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-admin-leads-"));
const output = path.join(temp, "admin-leads.cjs");
execFileSync(path.join(root, "node_modules/esbuild/bin/esbuild"), [
  path.join(root, "functions/admin/leads.js"),
  "--bundle",
  "--platform=node",
  "--format=cjs",
  `--outfile=${output}`,
], { stdio: "pipe" });

const admin = createRequire(import.meta.url)(output);

const normal = admin.detectAdminSpamSignals({
  name: "Dashboard User",
  email: "user@example.com",
  phone: "(415) 555-0123",
}, "San Francisco");
assert.equal(normal.hasSuspiciousPhone, false);
assert(!normal.signals.some((signal) => signal.startsWith("Phone has")));

for (const phone of [null, ""]) {
  const empty = admin.detectAdminSpamSignals({ name: "Dashboard User", phone }, "San Francisco");
  assert.equal(empty.hasSuspiciousPhone, false);
}

const malformed = admin.detectAdminSpamSignals({ name: "Dashboard User", phone: "123" }, "San Francisco");
assert.equal(malformed.hasSuspiciousPhone, true);
assert(malformed.signals.includes("Phone has fewer than 10 digits (3)"));

await assert.doesNotReject(async () => admin.detectAdminSpamSignals({ name: "Dashboard User", phone: 4155550123 }, "San Francisco"));

const forbidden = await admin.onRequestGet({
  request: new Request("https://www.rofo.com/admin/leads?token=wrong"),
  env: { ADMIN_DASHBOARD_TOKEN: "correct" },
  waitUntil() {},
});
assert.equal(forbidden.status, 403);
assert.equal(await forbidden.text(), "Forbidden");

const source = fs.readFileSync(path.join(root, "functions/admin/leads.js"), "utf8");
assert(!/\bdigits\.length\b/.test(source), "Admin dashboard must not reference an undeclared digits variable");

console.log("Admin lead dashboard phone render QA passed.");
