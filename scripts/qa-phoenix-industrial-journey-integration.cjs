/* Run against a local Pages preview with the existing Phoenix test activation.
 * ROFO_BROWSER_MODULE may point to an existing Playwright installation.
 * This script never submits leads. All non-Brief API writes are blocked.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.ROFO_QA_BASE_URL || 'http://127.0.0.1:8789';
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname), 'Local preview required; never run this mutation fixture on production.');
const { chromium } = require(process.env.ROFO_BROWSER_MODULE || 'playwright');
const landing = '/commercial-real-estate/AZ/phoenix/industrial-space/';
const interview = '/location-requirement/?journey=new&marketId=phoenix&city=Phoenix&propertyType=industrial_flex&source=space_type&phoenixJourney=1&phoenixUse=warehouse&districtId=southwest-phoenix-industrial&propertyId=1002-s-56th-ave';
async function finishWarehouse(page) {
  for (let step = 0; step < 20; step++) {
    if (/\/location-brief\/LB2-/.test(page.url())) return;
    const control = page.locator('[data-answer-control]');
    const ids = await control.locator('input').evaluateAll(list => list.map(input => input.value));
    const prompt = await page.locator('[data-question-prompt]').innerText();
    let choices = [];
    if (prompt.startsWith('Any parts')) choices = ['southwest-phoenix-industrial'];
    else if (ids.includes('storage') && ids.includes('distribution')) choices = ['storage', 'distribution'];
    else choices = ['relocate', 'semi', 'either'].filter(id => ids.includes(id)).slice(0, 1);
    for (const id of choices) {
      const input = control.locator(`input[value="${id}"]`);
      if (!await input.isChecked()) await input.locator('..').click();
    }
    if (!choices.length) {
      const none = control.getByRole('button', { name: 'No, nothing else', exact: true });
      if (await none.count()) await none.click();
      else await control.locator('textarea:visible,input[type=text]:visible').first().fill(prompt.includes('much space') ? '20,000 square feet' : 'Conventional warehouse storage and distribution.');
    }
    await page.locator('[data-continue-question]').click();
    await page.waitForTimeout(100);
  }
  throw Error('Synthetic interview did not finish');
}
(async () => {
  const launch = { headless: true };
  if (process.env.ROFO_CHROME_PATH) launch.executablePath = process.env.ROFO_CHROME_PATH;
  const browser = await chromium.launch(launch);
  const results = [];
  try {
    for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const errors = [], forbiddenWrites = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/**', route => {
        const request = route.request();
        if (request.method() !== 'GET' && !request.url().includes('/api/location-brief-v2/')) {
          if (request.url().includes('/api/analytics/') || request.url().includes('/api/events')) return route.fulfill({ status: 204, body: '' });
          forbiddenWrites.push(request.url());
          return route.abort();
        }
        return route.continue();
      });
      await page.goto(base + landing);
      await page.getByRole('button', { name: 'Store goods and make deliveries' }).click();
      await page.getByRole('link', { name: 'Explore this property example' }).click();
      await page.getByRole('link', { name: 'Build my Location Brief →', exact: true }).click();
      await page.locator('[data-continue-question]').click();
      await page.locator('input[value=relocate]').locator('..').click();
      await page.locator('[data-continue-question]').click();
      const other = page.locator('[data-other-text]');
      await page.locator('[data-answer-control]').getByRole('button', { name: 'Something else', exact: true }).click();
      await other.fill('Occasional instrument inspection');
      await page.reload();
      await other.waitFor({ state: 'visible' });
      assert.equal(await other.inputValue(), 'Occasional instrument inspection', 'Unsubmitted custom draft survives refresh');
      await page.locator('[data-continue-question]').click();
      await page.locator('[data-back-question]').click();
      assert.equal(await other.inputValue(), 'Occasional instrument inspection');
      await page.reload();
      await other.waitFor({ state: 'visible' });
      assert.equal(await other.inputValue(), 'Occasional instrument inspection', 'Back-restored answer survives refresh');
      assert(await page.locator('[data-continue-question]').isEnabled());
      const resumedInterviewUrl = page.url();
      const draftBefore = await page.evaluate(() => sessionStorage.getItem('rofoPhoenixRequirementDraftV1'));
      await page.goto(base + landing + '#areas');
      await page.locator('.text-picker [data-area=north]').click();
      for (const hash of ['#area/unknown', '#area/', '#properties/not-an-area']) {
        await page.goto(base + landing + hash);
        await page.locator('#city-selected').waitFor();
        assert.equal(new URL(page.url()).hash, '#areas');
        assert((await page.locator('#city-selected').innerText()).includes('North Phoenix'));
        assert.equal(await page.evaluate(() => sessionStorage.getItem('rofoPhoenixRequirementDraftV1')), draftBefore);
        assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('rofoPhoenixIndustrialJourneyV1')).use), 'warehouse');
      }
      await page.goto(resumedInterviewUrl);
      await other.waitFor({ state: 'visible' });
      assert.equal(await other.inputValue(), 'Occasional instrument inspection');
      // Start a separate synthetic warehouse, without reusing the earlier custom-answer draft.
      await page.evaluate(() => sessionStorage.removeItem('rofoPhoenixRequirementDraftV1'));
      await page.goto(base + interview);
      await finishWarehouse(page);
      await page.locator('.phoenix-starting-context').waitFor();
      const briefUrl = page.url(), id = briefUrl.split('/').pop();
      const getBundle = () => page.evaluate(async id => (await fetch('/api/location-brief-v2/' + id)).json(), id);
      let bundle = await getBundle();
      assert.equal(bundle.currentRevision.requirement.sizeCapacity.summary, '20,000 square feet');
      // Local fixture: a legitimate saved size plus fleet evidence, as can follow an operating-needs edit.
      const requirement = bundle.currentRevision.requirement;
      const fleet = { id: 'qa-fleet', dimension: 'industrial.site.fleet_storage', label: 'Fleet storage', value: { text: '10 vehicles', number: null, boolean: null, list: [] }, status: 'REQUIRED', scope: 'property', source: 'user_statement', authority: 'business', confidence: 1, confirmed: true, requiresConfirmation: false };
      requirement.criteria.push(fleet);
      const seeded = await page.evaluate(async ({ id, requirement, revision }) => {
        const { normalizeRequirement } = await import('/js/requirements/requirement-domain-v1.mjs');
        const response = await fetch('/api/location-brief-v2/' + id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ requirement: normalizeRequirement(requirement), expectedRevision: revision }) });
        return { status: response.status, body: await response.json() };
      }, { id, requirement, revision: bundle.currentRevision.revisionNumber });
      assert.equal(seeded.status, 200);
      const savedFleet = (await getBundle()).currentRevision.requirement.criteria.find(item => item.id === fleet.id);
      await page.reload();
      await page.getByRole('link', { name: 'Edit my search' }).click();
      await page.getByRole('button', { name: 'Change space size', exact: true }).click();
      const size = page.locator('[data-phoenix-size]');
      assert.equal(await size.inputValue(), '20,000 square feet');
      for (const invalid of ['', '0', '-100', 'not a size']) {
        await size.fill(invalid);
        await page.locator('[data-phoenix-size-save]').click();
        assert(await size.isVisible());
        assert((await page.getByRole('alert').innerText()).includes('positive approximate size'));
        assert.equal((await getBundle()).currentRevision.requirement.sizeCapacity.summary, '20,000 square feet');
      }
      await page.locator('[data-phoenix-size-cancel]').click();
      await page.reload();
      await page.getByRole('button', { name: 'Change space size', exact: true }).click();
      assert.equal(await size.inputValue(), '20,000 square feet');
      await size.fill('30,000 square feet');
      if (device === 'desktop') { await page.locator('[data-phoenix-size-save]').focus(); await page.keyboard.press('Enter'); }
      else await page.locator('[data-phoenix-size-save]').click();
      await page.reload();
      await page.getByRole('button', { name: 'Change space size', exact: true }).click();
      assert.equal(await size.inputValue(), '30,000 square feet', 'Accepted unsaved edit survives refresh');
      await page.locator('[data-phoenix-size-cancel]').click();
      await page.locator('[data-view-recommendations]').click();
      await page.waitForURL(briefUrl);
      bundle = await getBundle();
      assert.equal(bundle.currentRevision.requirement.sizeCapacity.summary, '30,000 square feet');
      assert.deepEqual(bundle.currentRevision.requirement.criteria.find(item => item.id === fleet.id), savedFleet);
      assert.equal(bundle.entryContext.propertyId, '1002-s-56th-ave');
      // Editing drafts must also retain free-text answers without bypassing owner/revision checks.
      await page.getByRole('link', { name: 'Edit my search' }).click();
      await page.getByRole('button', { name: 'Review operating needs', exact: true }).click();
      await page.locator('[data-answer-control]').getByRole('button', { name: 'Something else', exact: true }).click();
      await other.fill('Equipment inspection, not a warehouse');
      await page.reload();
      await other.waitFor({ state: 'visible' });
      assert.equal(await other.inputValue(), 'Equipment inspection, not a warehouse');
      // A newer saved revision supersedes an old local edit draft.
      const fresh = await getBundle();
      const externalEdit = await page.evaluate(async ({ id, requirement, revision }) => {
        const response = await fetch('/api/location-brief-v2/' + id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ requirement, expectedRevision: revision }) });
        return response.status;
      }, { id, requirement: fresh.currentRevision.requirement, revision: fresh.currentRevision.revisionNumber });
      assert.equal(externalEdit, 200);
      await page.reload();
      await page.getByRole('button', { name: 'Change space size', exact: true }).waitFor();
      assert(!await page.locator('[data-answer-control]').isVisible(), 'Stale edit draft must not replace a newer saved revision');
      await page.goto(briefUrl);
      assert((await page.locator('main').innerText()).includes('possible referral through OfficeFinder'));
      await page.locator('a[data-vnext-research]').click();
      const copy = await page.locator('main').innerText();
      assert(copy.includes('dedicated Phoenix partner, response time and available space are not confirmed'));
      assert(!copy.includes('Rofo may use a local commercial real estate expert'));
      assert.equal(await page.locator('[data-research-form]').getAttribute('action'), '/api/leads/submit');
      assert.deepEqual(errors, []);
      assert.deepEqual(forbiddenWrites, []);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      results.push({ device, briefUrl, checks: ['custom draft refresh', 'custom answer back+refresh', 'invalid-area recovery preserves selection and answers', 'fleet size invalid/cancel preserve original', 'valid fleet size saved/reopened; fleet evidence preserved', 'edit draft refresh', 'Phoenix fulfillment wording', 'no lead submission or client error'] });
      await context.close();
    }
    if (process.env.ROFO_QA_RESULTS) fs.writeFileSync(process.env.ROFO_QA_RESULTS, JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
