import assert from 'node:assert/strict';
import { catalog, selectOptions, evaluateOption, formatGuide, CATALOG_VERSION } from '../functions/_sf-pilot/catalog.mjs';

const results = [];
function test(name, fn) { fn(); results.push({ name, passed: true }); }
const get = id => { const item = catalog.find(row => row.id === id); assert(item, id); return item; };
const base = { people: 2, peak: 2, privacy: 'open', budget: 1000, budgetBasis: 'team-month', commitment: 'compare', timing: 'Within three months', days: 8, meetings: 'occasional' };

test('Seed records preserve attributable, dated, unconfirmed evidence and no photo rights', () => {
  assert(catalog.length > 0);
  assert.equal(new Set(catalog.map(item => item.id)).size, catalog.length);
  for (const item of catalog) {
    assert.equal(item.catalogVersion, CATALOG_VERSION);
    assert.match(item.sourceUrl, /^https:\/\//);
    assert.equal(item.sourceAccessed, '2026-10-29');
    assert(item.sourceFact.length > 15);
    assert.equal(item.availability, 'unverified');
    assert.equal(item.reviewRequired, true);
    assert.equal(item.reviewedAt, null, 'No production reviewer is fabricated');
    assert.equal(item.image, null);
    assert(item.qualifications.length >= 2);
    assert(Object.isFrozen(item));
    assert(Object.isFrozen(item.qualifications));
  }
});
test('Incomplete or reuse-gated products and stale addresses are excluded', () => {
  for (const item of catalog) {
    for (const forbidden of ['ind77', '301 Howard', '201 Spear', '149 New Montgomery']) assert(![item.id, item.name, item.address].join(' ').includes(forbidden), forbidden);
  }
  assert(!catalog.some(item => item.type === 'managed-office'));
  assert(formatGuide.some(row => row.type === 'managed-office' && row.note.includes('No reviewed')));
});
test('Small-team open comparison includes day pass and named membership approaches', () => {
  const selected = selectOptions(base);
  assert.equal(selected.length, 5);
  assert.equal(selected[0].id, 'pac315--shared');
  assert.equal(selected[1].id, 'werq465--shared');
  assert(selected.some(item => item.id === 'ww44--shared'));
  assert(selected.some(item => item.id === 'ww535--private'));
});
test('Eight-person private search excludes all shared memberships', () => {
  const selected = selectOptions({ ...base, people: 8, peak: 6, privacy: 'private', meetings: 'daily' });
  assert(selected.length >= 3 && selected.length <= 5);
  assert(selected.every(item => item.type !== 'shared-membership'));
  assert(selected.every(item => item.monthlyIllustration == null));
});
test('Twenty-person hybrid comparison retains full roster and a traditional-office alternative', () => {
  const selected = selectOptions({ ...base, people: 20, peak: 8, privacy: 'private', meetings: 'large' });
  assert(selected.length >= 3 && selected.length <= 5);
  assert(selected.some(item => item.type === 'traditional-lease'));
  assert(selected.every(item => item.namedUsers === 20 && item.peakAttendance === 8));
  assert(selected.every(item => item.qualifications.some(note => note.includes('does not establish interchangeable memberships'))));
});
test('Membership arithmetic always uses roster, never peak attendance', () => {
  const item = evaluateOption(get('werq465--shared'), { ...base, people: 20, peak: 8 });
  assert.equal(item.monthlyIllustration, 7600);
  assert.notEqual(item.monthlyIllustration, 3040);
  assert.match(item.price, /20 named users/);
  assert.match(item.price, /not a team quote/);
});
test('Day-pass illustration requires explicit attendance and uses all named people', () => {
  const item = evaluateOption(get('pac315--shared'), { ...base, people: 20, peak: 8, days: 8 });
  assert.equal(item.monthlyIllustration, 4800);
  assert.match(item.price, /20 named users × 8 days/);
  assert.equal(evaluateOption(get('pac315--shared'), { ...base, days: undefined }).monthlyIllustration, null);
});
test('Exact two-person private benchmark is never multiplied into larger-suite quote', () => {
  const small = evaluateOption(get('ww535--private'), { ...base, privacy: 'private' });
  assert.equal(small.monthlyIllustration, 1200);
  for (const people of [8, 20]) {
    const large = evaluateOption(get('ww535--private'), { ...base, people, peak: 2, privacy: 'private' });
    assert.equal(large.monthlyIllustration, null);
    assert.equal(large.priceWithheld, true);
    assert.match(large.price, /cannot be multiplied/);
  }
});
test('One-person private starting offer is not a two-person office quote', () => {
  const item = evaluateOption(get('ww44--private'), { ...base, privacy: 'private' });
  assert.equal(item.monthlyIllustration, null);
  assert.equal(item.priceWithheld, true);
  assert.match(item.price, /smaller-office starting offer/);
});
test('Month-to-month never uses twelve-month membership or office price as a fit basis', () => {
  const selected = selectOptions({ ...base, commitment: 'month' });
  assert(!selected.some(item => item.id === 'ww44--shared'));
  for (const id of ['ww535--private', 'ww2ec--private', 'ww44--private']) {
    const item = evaluateOption(get(id), { ...base, commitment: 'month', privacy: 'private' });
    assert.equal(item.monthlyIllustration, null);
    assert.equal(item.priceWithheld, true);
    assert.match(item.price, /longer-commitment starting offer is withheld/);
  }
});
test('Short-commitment preferences retain an explicit long-term alternative qualification', () => {
  const item = evaluateOption(get('ww44--shared'), { ...base, commitment: 'flexible' });
  assert(item.qualifications.some(note => note.includes('requires twelve months')));
  assert.match(item.access, /location coverage unverified/);
  assert.match(item.access, /credits are not hours/);
});
test('Regus person/day headlines never become monthly team totals or casual day offices', () => {
  for (const id of ['rg580--private', 'rg505--private', 'rg1390--private']) {
    const item = evaluateOption(get(id), { ...base, people: 20, peak: 8, privacy: 'private' });
    assert.equal(item.monthlyIllustration, null);
    assert.equal(item.budgetStatus, 'unpriced');
    assert.match(item.price, /24-month/);
    assert.match(item.price, /Not an ad-hoc/);
    const monthly = evaluateOption(get(id), { ...base, commitment: 'month', privacy: 'private' });
    assert.equal(monthly.priceWithheld, true);
  }
});
test('Unknown private-office starting headcount does not create team affordability', () => {
  const item = evaluateOption(get('canopyf--private'), { ...base, people: 20, peak: 8, privacy: 'private', budget: 3000 });
  assert.equal(item.monthlyIllustration, null);
  assert.equal(item.budgetStatus, 'unpriced');
  assert.match(item.price, /does not say how many people/);
  assert.match(item.sourceFact, /not current inventory/);
});
test('CANOPY attendance chooses only the applicable individual shared plan', () => {
  const short = selectOptions({ ...base, days: 8 }, ['jackson-square']);
  assert(short.some(item => item.id === 'canopy--shared-hybrid'));
  assert(!short.some(item => item.id === 'canopy--shared-community'));
  const long = selectOptions({ ...base, days: 15 }, ['jackson-square']);
  assert(long.some(item => item.id === 'canopy--shared-community'));
  assert(!long.some(item => item.id === 'canopy--shared-hybrid'));
});
test('Confidential regular calls do not inherit unverified shared-booth rights', () => {
  const occasional = selectOptions({ ...base, privacy: 'calls', meetings: 'occasional' });
  for (const item of occasional.filter(item => item.type === 'shared-membership')) assert(item.qualifications.some(note => note.includes('no private-call entitlement')));
  const regular = selectOptions({ ...base, privacy: 'calls', meetings: 'daily' });
  assert(regular.every(item => item.type !== 'shared-membership'));
});
test('Explicit district scope excludes removed areas and does not pad unknown coverage', () => {
  const selected = selectOptions({ ...base, people: 20, privacy: 'private' }, ['jackson-square']);
  assert.equal(selected.length, 1);
  assert.equal(selected[0].district, 'jackson-square');
  assert.deepEqual(selectOptions(base, ['unsupported-area']), []);
  assert(selectOptions(base, ['f']).every(item => item.district === 'financial-district'));
  assert(selectOptions(base, ['financial-district-sf']).every(item => item.district === 'financial-district'));
});
test('Budget basis remains separate from price units and commitment', () => {
  const item = get('werq465--shared');
  assert.equal(evaluateOption(item, { ...base, budget: 400, budgetBasis: 'person-month' }).budgetStatus, 'illustration-within-target');
  assert.equal(evaluateOption(item, { ...base, budget: 400, budgetBasis: 'team-month' }).budgetStatus, 'higher-budget-alternative');
  assert.equal(evaluateOption(item, { ...base, budget: 400, budgetBasis: 'unknown' }).budgetStatus, 'unpriced');
});
test('Missing meeting needs never become an occasional-use assumption for larger teams', () => {
  const selected = selectOptions({ ...base, people: 20, peak: 8, meetings: undefined });
  assert(selected.every(item => item.type !== 'shared-membership'));
});
test('Product commitment text does not assign private-office terms to shared desk products', () => {
  assert.match(get('ww44--shared').commitment, /All Access Plus/);
  assert.match(get('ww535--shared').commitment, /different product/);
  assert.match(get('pac315--shared').commitment, /On-demand workstations/);
});
test('Selections are deterministic, independent serializable snapshots without catalog mutation', () => {
  const before = JSON.stringify(catalog);
  const a = selectOptions(base), b = selectOptions(base);
  assert.deepEqual(a, b);
  a[0].qualifications.push('tenant-only mutation');
  assert.notDeepEqual(a, b);
  assert.equal(JSON.stringify(catalog), before);
  assert.doesNotThrow(() => JSON.stringify(selectOptions(base)));
});
test('All 54 scenario/privacy/meeting/term combinations preserve publication and price safeguards', () => {
  let cases = 0;
  for (const people of [2, 8, 20]) for (const privacy of ['open', 'private']) for (const meetings of ['occasional', 'daily', 'large']) for (const commitment of ['flexible', 'month', 'compare']) {
    const selected = selectOptions({ ...base, people, peak: Math.min(people, 8), privacy, meetings, commitment });
    assert(selected.length <= 5);
    assert.equal(new Set(selected.map(item => item.id)).size, selected.length);
    assert.equal(new Set(selected.map(item => item.locationId)).size, selected.length, 'Do not fill the shortlist with multiple products at one building');
    assert(selected.every(item => item.reviewRequired && item.availability === 'unverified' && item.reviewedAt === null));
    if (privacy === 'private' || people >= 8 && meetings !== 'occasional') assert(selected.every(item => item.type !== 'shared-membership'));
    for (const item of selected) if (item.type === 'private-serviced-office' && item.rateUnit === 'office-month' && (item.ratePeople !== people || commitment === 'month')) assert.equal(item.monthlyIllustration, null);
    cases++;
  }
  assert.equal(cases, 54);
});
console.log(JSON.stringify({ suite: 'sf-pilot-catalog', tests: results.length, passed: results.length, scenarioCases: 54, results }, null, 2));
