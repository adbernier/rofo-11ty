const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rofo-phoenix-followup-'));
try {
  const output = path.join(temp, 'lead-shared.cjs');
  execFileSync(path.join(__dirname, '../node_modules/esbuild/bin/esbuild'), [path.join(__dirname, '../functions/api/leads/_shared.js'), '--bundle', '--platform=node', '--format=cjs', `--outfile=${output}`], { stdio: 'pipe' });
  const { buildVnextTenantConfirmationHtml, buildVnextTenantConfirmationText } = require(output);
  for (const location of [{ marketId: 'phoenix', propertyType: 'industrial_flex' }, { marketId: 'phoenix-metro', city: 'Phoenix', propertyType: 'industrial_flex' }]) for (const nested of [false, true]) {
    const lead = { location_brief_v2_context: { schemaVersion: 'vnext-commercial-context:v1', ...(nested ? { locationRequirement: location } : location) } };
    for (const rendered of [buildVnextTenantConfirmationHtml(lead), buildVnextTenantConfirmationText(lead)]) {
      assert(rendered.includes('awaiting Rofo review for possible referral through OfficeFinder'));
      assert(rendered.includes('dedicated Phoenix partner, response time and available space are not confirmed'));
      assert(!rendered.includes('A local commercial real estate expert can also review'));
      assert(!/within \d+|follow up shortly|will contact you/i.test(rendered));
    }
  }
  for (const location of [{ marketId: 'san-francisco', propertyType: 'office' }, { marketId: 'phoenix', propertyType: 'office' }, { marketId: 'phoenix-metro', propertyType: 'industrial_flex' }, { marketId: 'phoenix-metro', city: 'Tempe', propertyType: 'industrial_flex' }]) {
    const lead = { location_brief_v2_context: { schemaVersion: 'vnext-commercial-context:v1', locationRequirement: location } };
    assert(buildVnextTenantConfirmationText(lead).includes('A local commercial real estate expert can also review'));
    assert(!buildVnextTenantConfirmationHtml(lead).includes('dedicated Phoenix partner'));
  }
  console.log('Phoenix Industrial follow-up wording QA passed: flat/nested context, honest review/OfficeFinder wording, unchanged other-market/type wording. No email sent.');
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
