/**
 * Reviewed-research seed for the disabled SF office pilot.
 * Source: Rofo v2.1 operator-source-ledger.json, 29 October 2026.
 * The ledger is historical advertised evidence, not inventory or a production
 * publication approval. No images, feed rights, live quotes or managed-office
 * entitlement are implied. Every selected draft still needs staff review.
 * Product eligibility/ranking below ports the bounded v2.1 comparison rules;
 * canonical district recommendation scoring remains in Location Brief.
 */
export const CATALOG_VERSION = 'sf-pilot-evidence:2026-10-29:v1';
const seed = [
  {
    "id": "ww535",
    "formats": ["open", "private"],
    "district": "m",
    "operator": "WeWork",
    "name": "WeWork 535 Mission",
    "address": "535 Mission St, 14th floor, San Francisco CA 94105",
    "url": "https://www.wework.com/buildings/535-mission-st--sf-bay-area--CA",
    "fact": "The location advertises private offices and dedicated desks. Its two-person private-office starting offer is tied to a 12-month commitment.",
    "price": "2-person private office from $1,200/month; 12-month commitment, promotions included, taxes/fees extra. Dedicated desk from $656/desk/month is a shared-office product, not an enclosed room.",
    "contract": "12 months for the stated private-office starting offer; other product terms need confirmation.",
    "capacity": "Two-person starting offer published; no exact 8- or 20-person suite verified.",
    "meetings": "Meeting rooms from $39/hour; included allowance and team-room capacity unverified.",
    "extra": "Event-space descriptions conflict between narrative and amenity exclusions. It must not be treated as included.",
    "extraQuestion": "What exact meeting/event facilities, access rights and fees would your agreement include?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "ww2ec",
    "formats": ["open", "private"],
    "district": "f",
    "operator": "WeWork",
    "name": "WeWork Two Embarcadero Center",
    "address": "2 Embarcadero Center, 8th floor, San Francisco CA 94111",
    "url": "https://www.wework.com/buildings/two-embarcadero-center--sf-bay-area--CA",
    "fact": "The operator lists private-office and shared-desk products at this waterfront Financial District address.",
    "price": "2-person private office from $1,450/month with a 12-month commitment, promotions included, taxes/fees extra. Dedicated desk from $608/desk/month is a different shared-office product.",
    "contract": "The stated private-office starting offer requires 12 months. Obtain the actual product agreement.",
    "capacity": "Two-person starting offer published; generic 1–100+ category is not available capacity.",
    "meetings": "Meeting rooms from $39/hour; allowance and suitable room size unverified.",
    "extra": "Parking appears in narrative but is excluded in the amenity list. Included parking is unresolved.",
    "extraQuestion": "Which arrival and parking arrangements would actually be included for your team and clients?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "ww44",
    "formats": ["open", "private"],
    "district": "f",
    "operator": "WeWork",
    "name": "WeWork 44 Montgomery",
    "address": "44 Montgomery St, San Francisco CA 94104",
    "url": "https://www.wework.com/buildings/44-montgomery--sf-bay-area--CA",
    "fact": "The location markets furnished private offices and shared-workspace products. Its published private-office starting offer is for one person.",
    "price": "1-person private office from $740/month with 12-month commitment/promotions, taxes/fees extra. This is not a two-person offer. Dedicated desk from $665/desk/month is separate.",
    "contract": "Twelve months for the stated starting office offer; monthly/annual categories do not establish the same rate on each term.",
    "capacity": "One-person starting office offer only; 8/20-person suite unverified.",
    "meetings": "Meeting rooms from $8/seat/hour, not $8 per whole room. Included credit/room capacity unverified.",
    "extra": "A network-scoped All Access Plus card shows $289/person/month on a 12-month plan ($339 also displayed), one coworking booking per day and three monthly credits. Credits are not hours or a private office.",
    "extraQuestion": "Is this location included, are reservations available, and what named-user/guest rules and overages apply?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "rg580",
    "formats": ["open", "private"],
    "district": "f",
    "operator": "Regus",
    "name": "Regus 580 California",
    "address": "580 California St, 12th and 16th floors, San Francisco CA 94104",
    "url": "https://www.regus.com/en/us/1967",
    "fact": "Regus lists private-office, dedicated-coworking and on-demand products at one building across two floors.",
    "price": "Office advertised from $14/person/day. Billing formula and actual whole-team charge need a proposal. Do not treat it as a casual day office: that separate product starts at $239/person/day.",
    "contract": "The SF city office floor is based on 24-month contracts; a term for this specific offer needs confirmation. Agreements are services, not assumed leases.",
    "capacity": "No exact 2-, 8- or 20-person available office established.",
    "meetings": "Rooms from $69/hour; no included allowance found.",
    "extra": "Advertised 24/7 access is specifically for private-office and dedicated-cowork customers, not every access product.",
    "extraQuestion": "Which access rights, charges and notice terms apply to the precise product being quoted?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "rg505",
    "formats": ["open", "private"],
    "district": "f",
    "operator": "Regus",
    "name": "Regus 505 Montgomery",
    "address": "505 Montgomery St, 10th and 11th floors, San Francisco CA 94111",
    "url": "https://www.regus.com/en/us/328",
    "fact": "The operator places this location in Financial District. It is a Jackson-adjacent comparison, not asserted historic-district membership.",
    "price": "Office from $14/person/day; billing basis and whole-team price unresolved. Day office is a separate product from $209/person/day; do not substitute an access-plan rate.",
    "contract": "City floor is associated with 24-month contracts; obtain the location/product-specific agreement, fees and exit terms.",
    "capacity": "No exact team office or current capacity confirmed.",
    "meetings": "Rooms from $85/hour; included room credit not found.",
    "extra": "A café/barista and restaurant are listed, but included food or coffee has not been established.",
    "extraQuestion": "What food, meeting, mail and other services are included versus charged separately?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "rg1390",
    "formats": ["open", "private"],
    "district": "c",
    "operator": "Regus",
    "name": "Regus 1390 Market",
    "address": "1390 Market St, Suite 200, San Francisco CA 94102",
    "url": "https://www.regus.com/en/us/3214",
    "fact": "Regus lists this Civic Center/Mid-Market location with private-office, dedicated-coworking and on-demand products.",
    "price": "Office from $11/person/day; no whole-team bill or billing formula verified. Day coworking from $59/day and day office from $169/person/day are separate products.",
    "contract": "Regus’s SF office floor is based on 24-month contracts. Do not convert that floor into a monthly or ad-hoc team quote.",
    "capacity": "No exact 2-, 8- or 20-person available office established.",
    "meetings": "Rooms from $75/hour; suitable capacity and included credit unverified.",
    "extra": "Parking is advertised but cost inclusion remains unspecified. Building amenities do not establish free parking.",
    "extraQuestion": "What is the complete quote for the actual team, access schedule, term and meeting pattern?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "canopyf",
    "formats": ["private"],
    "district": "f",
    "operator": "CANOPY",
    "name": "CANOPY Financial District",
    "address": "353 Kearny St, San Francisco CA 94108",
    "url": "https://www.canopy.space/locations/san-francisco-coworking/financial-district/",
    "fact": "The facility advertises private offices for up to 40 team members and quote-only team suites. Advertised capacity is not current inventory.",
    "price": "Private offices from $2,000/month; headcount at that starting rate unspecified. It does not price a 2-, 8- or 20-person office. Team suites require a quote.",
    "contract": "Duration, notice, deposits and expansion rights not published in inspected material.",
    "capacity": "Facility claims up to 40; no actual 8/20-person available office established.",
    "meetings": "Meeting allowances and overages unspecified. A cross-location room claim up to 14 is not a 20-person room at this address.",
    "extra": "Generic shared-membership access lists do not establish that the Jackson Square Hybrid plan applies at this office-focused FiDi facility.",
    "extraQuestion": "Which exact team suite, private meeting facilities, named-user rights and quote apply here?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "canopy",
    "formats": ["open", "private"],
    "district": "j",
    "operator": "CANOPY",
    "name": "CANOPY Jackson Square",
    "address": "595 Pacific Ave, Floor 4, San Francisco CA 94133",
    "url": "https://www.canopy.space/locations/san-francisco-coworking/jackson-square/",
    "fact": "The facility advertises individual shared memberships and private offices up to 40 team members; these are different products.",
    "price": "Hybrid from $445/person/month, up to 10 days/month; Community Table from $700/person/month; private office from $2,000/month with unspecified headcount. Two Hybrid memberships arithmetic starts at $890/month for at most 20 person-days, not transferable seats.",
    "contract": "Exact term, notice, deposits and team-sharing rights not established. Individual products do not imply pooling.",
    "capacity": "Advertised office capacity up to 40 is an inquiry lead, not an available 8/20-person unit.",
    "meetings": "Room credits/charges and whole-team room capacity not established.",
    "extra": "Complimentary café beverages are advertised; parking is not free. Neither substitutes for meeting-room or license entitlement.",
    "extraQuestion": "What named users, attendance days, meeting rooms and fees would the actual agreement cover?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "werq465",
    "formats": ["open", "private"],
    "district": "f",
    "operator": "Werqwise",
    "name": "Werqwise 465 California",
    "address": "465 California St, San Francisco CA 94104",
    "url": "https://www.werqwise.com/465-california/",
    "fact": "The current facility page advertises Roam+ lounge access, Spot+ dedicated desks and quote-only Office+ with tailored layouts.",
    "price": "Roam+ $380/person/month; Spot+ from $400/desk/month. Two memberships/desks arithmetic is $760/$800 monthly before unlisted fees, not a private office. Office+ is quote-only.",
    "contract": "Month-to-month options and longer plans advertised; no claim that every product/rate is month-to-month. Expansion is not guaranteed.",
    "capacity": "No facility-specific 8/20-person office inventory verified.",
    "meetings": "Four conference rooms/eight phone booths advertised; room quota, booking availability and overages unknown.",
    "extra": "The source advertises 24/7 security, which is not the same as contractual 24/7 member access.",
    "extraQuestion": "What access, private rooms, room allocation and change/expansion terms are actually included?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "werq1301",
    "formats": ["open", "private"],
    "district": "n",
    "operator": "Werqwise",
    "name": "Werqwise 1301 Sansome",
    "address": "1301 Sansome St, San Francisco CA 94111",
    "url": "https://www.werqwise.com/1301-sansome/",
    "fact": "The operator identifies this as North Waterfront/Telegraph Hill and advertises shared products plus quote-only Offices+.",
    "price": "Roam+ $380/person/month; Spot+ $490/desk/month. Two-person arithmetic is $760/$980 monthly before unlisted fees, not an enclosed private-office quote.",
    "contract": "Month-to-month through longer commitments described; actual product terms and expansion rights remain unverified.",
    "capacity": "No exact office capacity or current inventory established.",
    "meetings": "Four video-conference rooms advertised; included allowance and charges unspecified.",
    "extra": "Header hours and building amenities do not establish unrestricted member access or confirmed room availability.",
    "extraQuestion": "Does the actual route, access schedule and room allocation fit your team’s busiest days?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "pac315",
    "formats": ["open", "private"],
    "district": "f",
    "operator": "Pacific Workplaces",
    "name": "Pacific Workplaces San Francisco",
    "address": "315 Montgomery St, Suite 900, San Francisco CA 94104",
    "url": "https://pacificworkplaces.com/locations/san-francisco/",
    "fact": "The current facility page lists 315 Montgomery and on-demand workstations, meeting rooms, day offices and quote-only furnished private offices.",
    "price": "Open-workstation passes from $30/person/day; meeting rooms/day offices from $30/hour with no capacity-specific guarantee. Private offices quote-only. No monthly conversion without attendance assumptions.",
    "contract": "On-demand products have no long commitment; private office terms vary from day use to longer suites. Notice/deposit/actual access unverified.",
    "capacity": "Boardrooms advertised for 2–20+ people are meeting-room facts, not private-office seat inventory.",
    "meetings": "Actual room capacity/rate and included membership credit need confirmation.",
    "extra": "24-hour building security/encrypted access does not establish every membership’s access hours.",
    "extraQuestion": "Which rooms, bookings, named-user access, fees and membership rules cover your attendance pattern?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  },
  {
    "id": "werq235",
    "formats": ["private"],
    "district": "f",
    "operator": "Werqwise",
    "name": "Werqwise 235 Pine",
    "address": "235 Pine St, San Francisco CA 94104",
    "url": "https://www.werqwise.com/235-pine/",
    "fact": "The current location page is private-office focused and advertises conferencing, lounge, phone booths and concierge.",
    "price": "Quote-only; no facility-specific private-office price or team capacity established.",
    "contract": "Obtain the specific term, named-user rights, deposits, cancellation and change provisions.",
    "capacity": "No exact 8/20-person office inventory verified.",
    "meetings": "Room allowance, overages, booking availability and appropriate capacity unverified.",
    "extra": "Old Werqwise 149 New Montgomery material must not supply the capacities or prices for this current location.",
    "extraQuestion": "What actual private premises and expansion options are available at this address?",
    "rights": "Factual paraphrase with attribution only; no image or feed permission established.",
    "accessed_at": "2026-10-29 UTC",
    "geography_status": "working location group; not an adopted Rofo polygon"
  }
];

const districts = { f: 'financial-district', m: 'soma', j: 'jackson-square', c: 'mid-market', n: 'north-waterfront' };
const districtAliases = { f: 'financial-district', m: 'soma', j: 'jackson-square', c: 'mid-market', n: 'north-waterfront', s: 'showplace-square', 'financial-district-sf': 'financial-district', 'financial-district-san-francisco': 'financial-district', 'civic-center': 'mid-market', 'civic-center-mid-market': 'mid-market' };
const money = n => Number(n).toLocaleString('en-US');
function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function makeProduct(row, mode, suffix = mode) {
  const shared = mode === 'shared';
  let productName = shared ? 'Shared workspace' : 'Private serviced office inquiry';
  let rate = null;
  let rateUnit = null;
  let ratePeople = null;
  let term = 'quote';
  let price = row.price;
  let access = 'Exact named-user rights and access schedule need an agreement.';
  if (shared) {
    if (row.id === 'pac315') {
      productName = 'Open-workstation day passes'; rate = 30; rateUnit = 'person-day'; term = 'short';
      price = 'Open-workstation passes from $30/person/day. Meeting rooms and day offices are separate products. No monthly or whole-team quote is established.';
      access = 'Each named person needs the appropriate pass; every booking remains subject to availability.';
    } else if (['werq465', 'werq1301'].includes(row.id)) {
      productName = 'Roam+ shared-lounge memberships'; rate = 380; rateUnit = 'person-month'; term = 'short-options';
      price = '$380/person/month advertised for Roam+ shared-lounge access. Unlisted fees, member access and the exact agreement need confirmation; this is not a private office.';
    } else if (row.id === 'ww44') {
      productName = 'All Access Plus membership route'; rate = 289; rateUnit = 'person-month'; term = '12-month';
      price = 'Network card: $289/person/month on a 12-month plan ($339 also displayed). Taxes/fees extra. Not a private office or confirmation of access at 44 Montgomery.';
      access = 'One coworking booking/day; reservations and location coverage unverified. Three monthly credits are not hours or pooled team-room access.';
    } else if (row.id === 'canopy') {
      const hybrid = suffix === 'shared-hybrid';
      productName = hybrid ? 'Hybrid individual memberships' : 'Community Table memberships';
      rate = hybrid ? 445 : 700; rateUnit = 'person-month';
      price = hybrid ? 'Hybrid from $445/person/month, up to 10 days/month per member. Not transferable team seats or an enclosed office.' : 'Community Table from $700/person/month. Communal workspace, not an enclosed office; member access and team rules need confirmation.';
      access = hybrid ? 'Up to 10 days/member/month; unused days are not established as transferable.' : 'Individual communal access; actual guest and team rules need confirmation.';
    } else if (['ww535', 'ww2ec'].includes(row.id)) {
      productName = 'Dedicated desks in a shared office';
      rate = row.id === 'ww535' ? 656 : 608; rateUnit = 'desk-month';
      price = `Dedicated desks from $${rate}/desk/month, taxes/fees extra. This is a shared-office product, distinct from an enclosed private office; actual desks and contract unconfirmed.`;
    }
  } else {
    if (['ww535', 'ww2ec'].includes(row.id)) {
      rate = row.id === 'ww535' ? 1200 : 1450; rateUnit = 'office-month'; ratePeople = 2; term = '12-month';
      price = `2-person private office from $${money(rate)}/month, with 12-month commitment/promotions, taxes/fees extra. Not a confirmed room or offer to this team.`;
    } else if (row.id === 'ww44') {
      rate = 740; rateUnit = 'office-month'; ratePeople = 1; term = '12-month';
      price = '1-person private office from $740/month with a 12-month promotional commitment, taxes/fees extra. This is not a two-person or larger-team price.';
    } else if (row.id.startsWith('rg')) {
      rate = row.id === 'rg1390' ? 11 : 14; rateUnit = 'unresolved-person-day';
      price = `Private office advertised from $${rate}/person/day. Billing formula and whole-team charge are unverified. The SF city starting floor uses 24-month contracts; location/product terms require a proposal. Not an ad-hoc day-office price.`;
    } else if (['canopy', 'canopyf'].includes(row.id)) {
      rate = 2000; rateUnit = 'unknown-office-month';
      price = 'Private offices from $2,000/month; the advertised price does not say how many people it covers. We’ll need to get a price for your team. Team suites are quote-only.';
    } else if (row.id.startsWith('werq')) {
      price = 'We’ll need to get a price for a private Office+ / Offices+ product. Shared-lounge and desk prices do not price this enclosed team office; actual capacity and agreement need confirmation.';
    } else if (row.id === 'pac315') {
      price = 'We’ll need to get a price for a furnished private office. Day-pass and hourly-room prices are different products and do not price this office.';
    }
  }
  return {
    id: `${row.id}--${suffix}`, locationId: row.id, operator: row.operator,
    name: row.name, address: row.address, district: districts[row.district],
    districtScope: row.geography_status, type: shared ? 'shared-membership' : 'private-serviced-office',
    productName,
    privacy: shared ? 'Shared workspace; private calls and room access need separate confirmation.' : 'Enclosed offices are advertised; exact acoustic privacy, room and configuration need confirmation.',
    price, commitment: shared && row.id === 'ww44' ? 'The advertised All Access Plus network card requires a 12-month plan. Shorter-term rates and location coverage need confirmation.' : shared && ['ww535', 'ww2ec'].includes(row.id) ? 'Dedicated-desk terms, deposits and notice need confirmation. The published 12-month private-office offer is a different product.' : shared && row.id === 'pac315' ? 'On-demand workstations have no long commitment; booking and cancellation terms need confirmation.' : row.contract, why: '', sourceUrl: row.url,
    sourceAccessed: '2026-10-29', reviewedAt: null,
    sourceFact: row.fact, qualifications: [row.capacity, row.meetings, row.extra, row.geography_status, 'Availability not verified.', 'Source publication date not stated.', row.rights],
    access, meetings: row.meetings, question: row.extraQuestion,
    availability: 'unverified', priceStatus: 'advertised-reference',
    rate, rateUnit, ratePeople, term, variant: suffix,
    catalogVersion: CATALOG_VERSION, reviewRequired: true,
    image: null, imageRights: 'No operator photograph is licensed by this seed; use a labeled placeholder.'
  };
}
const products = seed.flatMap(row => {
  const result = [makeProduct(row, 'private')];
  if (['ww535', 'ww2ec', 'ww44', 'werq465', 'werq1301', 'pac315'].includes(row.id)) result.push(makeProduct(row, 'shared'));
  if (row.id === 'canopy') result.push(makeProduct(row, 'shared', 'shared-hybrid'), makeProduct(row, 'shared', 'shared-community'));
  return result;
});
// Traditional references retain their own source scope. Occupied business examples,
// showroom addresses, generic managed-office products and reuse-gated Industrious
// material are not promoted to available-office candidates.
products.push(...[
  ['555', '555 California Street', '555 California Street', 'financial-district', 'Vornado', 'Vornado describes an office tower at this address.', 'https://www.vno.com/office/property/555-california-street/3311899/landing', 'An unpriced traditional-office benchmark: compare the actual layout, cooling service and total lease commitment with serviced products.'],
  ['350', '350 California', '350 California Street', 'financial-district', 'The Swig Company', 'Swig’s November 2025 announcement describes side-core office floor plates.', 'https://swigco.com/news/press/the-swig-company-announces-lease-at-350-california-with-turner-townsend', 'An unpriced side-core office comparison, with shared-conference rights and actual fit-out costs still to establish.'],
  ['hooper', '100 Hooper', '100 Hooper Street', 'showplace-square', 'Kilroy Realty', 'Kilroy lists this property and its address; it is a wider-area example, not proof of showroom-core membership.', 'https://100hooper.kilroyrealty.com/contact/', 'A wider-area traditional-office comparison; actual premises, office rights and operating costs need checking.']
].map(([id, name, address, district, operator, sourceFact, sourceUrl, why]) => ({
  id, locationId: id, operator, name, address, district,
  districtScope: 'Working address-based comparison; not a new adopted Rofo polygon.',
  type: 'traditional-lease', productName: 'Traditional leased office',
  privacy: 'Dedicated premises; actual room, layout and acoustic privacy unknown.',
  price: 'We’ll need to get a price for actual premises and full occupancy costs. No available rent or size is claimed.',
  commitment: 'Traditional lease terms, fit-out costs, deposits and exit rights require a proposal.',
  why, sourceUrl, sourceAccessed: '2026-10-29', reviewedAt: null,
  sourceFact, qualifications: ['Representative building evidence, not an offer of available space.', 'Actual suite capacity, configuration, permitted use and suitability remain unverified.', 'No photograph or feed permission established.'],
  access: 'Actual agreement and operating hours unknown.', meetings: 'Actual rooms and operating costs unverified.',
  question: 'Which actual premises, layout, operating costs and lease terms could support your team?',
  availability: 'unverified', priceStatus: 'quote-needed', rate: null, rateUnit: null,
  ratePeople: null, term: 'quote', catalogVersion: CATALOG_VERSION,
  reviewRequired: true, image: null, imageRights: 'No operator photograph licensed; use a labeled placeholder.'
})));
export const catalog = freeze(products);
export const formatGuide = freeze([
  { type: 'shared-membership', label: 'Shared membership', note: 'Individual access to communal space; a peak attendance estimate is not a license count.' },
  { type: 'private-serviced-office', label: 'Private serviced office', note: 'An enclosed office under a services agreement; check actual capacity, access and included rooms.' },
  { type: 'managed-office', label: 'Managed office', note: 'A separately agreed managed workplace. No reviewed managed-office product is established in this seed.' },
  { type: 'traditional-lease', label: 'Traditional office lease', note: 'Dedicated premises under a lease; compare fit-out, operations, commitment and full occupancy costs.' }
]);

function positive(value) { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; }
function searchContext(extension = {}) {
  const people = positive(extension.people);
  const peak = positive(extension.peak);
  const days = positive(extension.days);
  return {
    people, peak, days,
    privacy: ['open', 'calls', 'private'].includes(extension.privacy) ? extension.privacy : 'private',
    meetings: ['occasional', 'daily', 'large'].includes(extension.meetings) ? extension.meetings : 'unknown',
    commitment: ['flexible', 'month', 'compare', 'fixed'].includes(extension.commitment) ? extension.commitment : 'compare',
    budget: positive(extension.budget), budgetBasis: extension.budgetBasis,
    timing: typeof extension.timing === 'string' ? extension.timing.slice(0, 120) : ''
  };
}
function monthlyBudget(r) {
  if (r.budget == null) return null;
  if (r.budgetBasis === 'team-month') return r.budget;
  if (r.budgetBasis === 'person-month' && r.people) return r.budget * r.people;
  if (r.budgetBasis === 'person-day' && r.people && r.days) return r.budget * r.people * r.days;
  return null;
}
function eligible(item, r) {
  if (item.type === 'traditional-lease') return true;
  const shared = item.type === 'shared-membership';
  const privateNeed = r.privacy === 'private' || (r.people >= 8 && r.meetings !== 'occasional');
  if (privateNeed && shared) return false;
  // Calls in communal space are only an inquiry when occasional use is sufficient;
  // regular confidential calls require enclosed premises, not assumed booth rights.
  if (r.privacy === 'calls' && r.meetings !== 'occasional' && shared) return false;
  if (item.variant === 'shared-hybrid' && (!r.days || r.days > 10)) return false;
  if (item.variant === 'shared-community' && r.days && r.days <= 10) return false;
  if (r.commitment === 'month' && shared && item.term === '12-month') return false;
  if (!privateNeed && r.privacy === 'open' && !shared && seed.find(row => row.id === item.locationId)?.formats?.includes('open')) return false;
  return true;
}
function reason(item, r) {
  if (item.type === 'traditional-lease') return item.why;
  if (item.type === 'shared-membership') {
    if (item.locationId === 'pac315') return 'A pay-for-the-days-you-use starting point. You would work in shared space; meeting time is separate and bookings remain unconfirmed.';
    if (item.locationId.startsWith('werq')) return 'A regular shared-workspace home base to compare with day passes. Confirm each member’s access, room allocation, fees and actual agreement.';
    if (item.locationId === 'ww44') return 'Consider network access if a year-long commitment works. This is access for each named person, not a reserved team office or guaranteed seats together.';
    if (item.locationId === 'canopy') return item.variant === 'shared-hybrid' ? 'A part-time individual membership for your attendance pattern. The ten-day cap applies to each member; these are not transferable team seats.' : 'A communal-workspace comparison. Check each member’s access and separate meeting-room rights before comparing it with a private room.';
    return 'A dedicated-desk comparison in a shared office, distinct from an enclosed private office. Check actual seats, access and the product agreement.';
  }
  if (item.locationId === 'ww535' && r.people === 2) return 'A published two-person private-office benchmark, with a twelve-month promotional basis and extra taxes/fees. Confirm the actual room and complete agreement.';
  if (item.locationId.startsWith('ww')) return 'A private-office option to investigate. Its smaller published starting offer cannot be multiplied into a quote for your team.';
  if (item.locationId.startsWith('canopy')) return 'Advertised private-office capability supports a team-capacity inquiry. It does not establish an available room or price your team at the entry rate.';
  if (item.locationId.startsWith('werq')) return 'A private-office conversation with layout and meeting needs in mind. The actual premises, room allocation, price and agreement still need checking.';
  if (item.locationId === 'pac315') return 'Reception and furnished private offices support a workplace inquiry. Advertised boardrooms are meeting-room capacity, not private-office inventory.';
  return 'A serviced-private-office comparison. Request the actual billing basis, named-user rights, term and meeting charges before judging the complete cost.';
}
export function evaluateOption(item, extension = {}) {
  const r = searchContext(extension);
  const result = { ...item, qualifications: [...item.qualifications], why: reason(item, r), namedUsers: r.people, peakAttendance: r.peak, monthlyIllustration: null, priceWithheld: false, budgetStatus: 'unpriced', reviewRequired: true };
  result.qualifications.push(`${r.people || 'All'} named users need appropriate rights; ${r.peak || 'peak'} onsite together does not establish interchangeable memberships or available seats.`);
  if (r.privacy === 'calls' && item.type === 'shared-membership') result.qualifications.push('Suitable only if your calls can use separately confirmed rooms/booths; no private-call entitlement is established.');
  if (item.type === 'private-serviced-office') {
    if (item.rateUnit === 'office-month' && item.ratePeople !== r.people) {
      result.price = 'We’ll need to get a price for your whole team. The published smaller-office starting offer does not price this team and cannot be multiplied into a suite quote.';
      result.priceWithheld = true;
    } else if (item.rateUnit === 'office-month' && item.ratePeople === r.people) result.monthlyIllustration = item.rate;
    if (r.commitment === 'month' && (item.term === '12-month' || item.locationId.startsWith('rg'))) {
      result.price = 'We’ll need to get a month-to-month price for this exact private office. The longer-commitment starting offer is withheld as a matching cost basis.';
      result.monthlyIllustration = null; result.priceWithheld = true;
    }
  } else if (item.type === 'shared-membership' && r.people) {
    if (['person-month', 'desk-month'].includes(item.rateUnit)) result.monthlyIllustration = item.rate * r.people;
    else if (item.rateUnit === 'person-day' && r.days) result.monthlyIllustration = item.rate * r.people * r.days;
    if (result.monthlyIllustration != null) result.price += ` Illustration for ${r.people} named users${item.rateUnit === 'person-day' ? ` × ${r.days} days/member/month` : ''}: $${money(result.monthlyIllustration)}/month before unresolved fees, taxes and extras. This is arithmetic, not a team quote or confirmed booking.`;
  }
  const cap = monthlyBudget(r);
  if (cap != null && result.monthlyIllustration != null) result.budgetStatus = result.monthlyIllustration > cap ? 'higher-budget-alternative' : 'illustration-within-target';
  if (r.commitment === 'flexible' && item.term === '12-month') result.qualifications.push('Longer-commitment alternative: the advertised basis requires twelve months; a separately priced shorter agreement is unverified.');
  result.priceStatus = result.priceWithheld ? 'quote-needed' : item.priceStatus;
  return result;
}
function diverse(items) {
  const seen = new Set(), first = [], later = [];
  for (const item of items) {
    const key = item.type === 'traditional-lease' ? 'traditional' : item.operator;
    if (seen.has(key)) later.push(item); else { seen.add(key); first.push(item); }
  }
  return [...first, ...later];
}
/** Returns draft comparison candidates only. Human review is always required. */
export function selectOptions(extension = {}, preferredDistricts = []) {
  const r = searchContext(extension);
  const wanted = new Set((Array.isArray(preferredDistricts) ? preferredDistricts : []).map(id => districtAliases[id] || id));
  const scoped = catalog.filter(item => (!wanted.size || wanted.has(item.district)) && eligible(item, r));
  const cap = monthlyBudget(r);
  // The bounded v2.1 weights are product-comparison priorities, not new district scores.
  const score = item => {
    if (item.type === 'traditional-lease') return r.people >= 20 || r.commitment === 'fixed' ? 2 : -4;
    const o = evaluateOption(item, extension);
    const affordable = o.monthlyIllustration != null && cap != null ? (o.monthlyIllustration <= cap ? 4 : -3) : 0;
    return affordable
      + ((r.privacy === 'private' || (r.people >= 8 && r.meetings !== 'occasional')) && item.type === 'private-serviced-office' ? 5 : 0)
      + (r.people >= 8 && ['canopyf', 'canopy'].includes(item.locationId) ? 2 : 0)
      + (r.people >= 8 && item.locationId === 'werq465' ? 2 : 0)
      + (r.privacy === 'open' && item.type === 'shared-membership' ? 4 : 0)
      + (r.commitment === 'flexible' && item.term === 'short' ? 3 : 0)
      - (r.commitment === 'flexible' && item.term === '12-month' ? 3 : 0);
  };
  let ranked = scoped.map((item, index) => ({ item, index, score: score(item) })).sort((a, b) => b.score - a.score || a.index - b.index).map(row => row.item);
  if (r.people === 2 && r.privacy === 'private') {
    const benchmark = ranked.find(item => item.id === 'ww535--private') || ranked.find(item => item.id === 'ww2ec--private');
    if (benchmark) ranked = [benchmark, ...ranked.filter(item => item !== benchmark)];
  }
  ranked = diverse(ranked);
  if (r.people >= 20 && r.commitment === 'compare') {
    const traditional = ranked.find(item => item.type === 'traditional-lease');
    if (traditional) { ranked = ranked.filter(item => item !== traditional); ranked.splice(Math.min(2, ranked.length), 0, traditional); }
  }
  if (r.people <= 2 && r.privacy === 'open') {
    const preferred = ['pac315--shared', 'werq465--shared', 'ww44--shared', 'ww535--private'].map(id => catalog.find(item => item.id === id && (!wanted.size || wanted.has(item.district)) && !(r.commitment === 'month' && item.term === '12-month'))).filter(Boolean);
    ranked = [...preferred, ...ranked.filter(item => !preferred.includes(item))];
  }
  // Never fill missing research with invented inventory or substitute an excluded area.
  const seenLocations = new Set();
  const variedLocations = ranked.filter(item => { if (seenLocations.has(item.locationId)) return false; seenLocations.add(item.locationId); return true; });
  return variedLocations.slice(0, 5).map(item => evaluateOption(item, extension));
}
