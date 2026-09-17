# Rofo Growth + Conversion Reality Check

## Executive Answer

**Primary GSC window:** August 17–September 15, 2026 (30 days).  
**Recent GSC window:** September 9–15, 2026 (7 days).  
**Prior comparable GSC window:** July 18–August 16, 2026 (30 days).

Rofo's clearest current growth constraint is **insufficient qualified organic acquisition, driven by weak rankings and extremely low search click-through**. In the primary window Google showed Rofo 95,810 times but produced only 153 clicks. Clicks fell 53.6% from the prior comparable period even though impressions fell only 5.9%; CTR declined from 0.324% to 0.160%, and average position worsened from 28.7 to 35.3.

This is not evidence that the product converts well. It is evidence that downstream conversion is not yet the first bottleneck to attack. Production contains 13 manually verified legitimate Requirements/continuation requests in the window, nine of which were sent to fulfillment. Their acquisition source is generally not recoverable, and the current shared-search Location Brief was not exposed for most of this period. Rofo therefore has enough real demand to justify operating the product, but not enough attributable traffic to diagnose fine-grained conversion.

**CURRENT CONSTRAINT: Rofo is not earning enough qualified organic clicks to feed a learnable customer funnel.**

## Data Quality

| Source | Window/result | Quality |
|---|---|---|
| Live Google Search Console, `sc-domain:rofo.com` | Current through Sep 15 | **Trustworthy** for aggregate clicks/impressions; query rows are privacy-filtered |
| Production D1 `search_profile_events` | Current through Sep 16+ | **Directional** for anonymous starts; bots/internal use cannot be fully removed |
| Production Location Brief, lead, request, and referral tables | Current | **Trustworthy** after case-level spam/test review |
| Mission Control contracts | Canonical stage definitions | **Trustworthy** for semantics; not a universally linked cohort |

The primary D1 window used Pacific-day UTC boundaries (`2026-08-17T07:00Z` through, but not including, `2026-09-15T07:00Z`). All production queries were read-only; Cloudflare reported zero rows written.

Denominator cleaning materially changes the story. Production recorded 47 leads: 34 were explicitly `spam_quarantined`; 13 survived manual review (nine `approved_sent`, four `pending`). In addition, clustered v2 records created seconds apart during market certification were treated as operator/QA activity, not customer demand. Raw journey starts remain directional because their payloads do not reliably identify bots or internal users.

Search Console reported 153 aggregate clicks, but query-visible rows accounted for only nine clicks. Google suppresses/anonymizes many low-volume queries, so query-family analysis is useful for opportunity discovery but cannot reconcile to the click total. Page-dimensional results expose all 153 current clicks (and 331 versus the prior site total of 330, a one-click dimensional discrepancy); page-family attribution is therefore a landing-page proxy, not proof of query intent.

## Search Reality

| Window | Impressions | Clicks | CTR | Average position |
|---|---:|---:|---:|---:|
| Aug 17–Sep 15 | 95,810 | 153 | 0.160% | 35.35 |
| Sep 9–15 | 15,456 | 33 | 0.214% | 35.47 |
| Jul 18–Aug 16 | 101,840 | 330 | 0.324% | 28.73 |

Current versus prior: impressions were down 6,030 (-5.9%), clicks down 177 (-53.6%), CTR down 0.164 percentage points (-50.7%), and average position worsened by 6.62 positions. The recent seven days show a higher 0.214% CTR but essentially the same weak average position; this is not enough volume to call a recovery.

Within query-visible data:

- branded queries containing “rofo”: 610 impressions, two clicks, 0.328% CTR, average position 13.7;
- all query-visible rows: 71,324 impressions and nine clicks, versus 65,468 impressions and 21 clicks prior.

The largest useful non-branded opportunities are not one coherent national query. They are market/category families where Rofo is visible but not yet winning:

| Query/family | Impressions | Clicks | Position | Interpretation |
|---|---:|---:|---:|---|
| commercial real estate | 509 | 0 | 15.9 | Broad intent split across many city URLs; not one clean national target |
| Indianapolis commercial real estate → Indianapolis city | 191 | 0 | 25.4 | Direct READY-market overlap, ranking too low |
| Costa Mesa commercial real estate → Costa Mesa city | 154 | 0 | 12.3 | Strong near-page-one non-READY demand |
| Chula Vista commercial real estate → Chula Vista city | 148 | 0 | 17.0 | Qualified city intent; adjacent to, but not proof of, the READY San Diego flow |
| Fullerton commercial real estate → Fullerton city | 105 | 0 | 18.1 | Direct North OC overlap; recent exact-query rows are suppressed/absent |
| Sacramento industrial space → Industrial page | 99 | 0 | 18.3 | Active Experiment #1; target-page visibility consolidated and improved |
| Jacksonville industrial space → Industrial page | 95 | 0 | 13.9 | New, qualified page-two visibility on a useful non-READY entry |
| Tempe industrial space → Industrial page | 87 | 0 | 11.0 | Closest qualified industrial opportunity to page one |
| Phoenix industrial space → Industrial page | 81 | 0 | 20.9 | READY overlap; recent position improved to 17.8 |

The homepage received 7,215 impressions and six clicks. The San Francisco city page received 2,825 impressions and one click (0.035% CTR, average position 46.9). These are discovery surfaces, but current ranking means most searchers never reach the product.

# Qualified Organic Growth Queue

## Growth Experiment #2 — Costa Mesa Commercial Real Estate title

- **Query:** `costa mesa commercial real estate`
- **Page:** `https://www.rofo.com/commercial-real-estate/CA/costa-mesa/`
- **Baseline window:** August 17–September 15, 2026 — 154 impressions, 0 clicks, 0% CTR, average position 12.3
- **Prior window:** July 18–August 16, 2026 — 142 impressions, 0 clicks, 0% CTR, average position 12.2
- **Recent window:** September 9–15, 2026 — 31 impressions, 0 clicks, 0% CTR, average position 11.4
- **Implementation date:** September 17, 2026; production deployment date not yet known
- **Change:** `Costa Mesa Commercial Real Estate Location Guide | Rofo` → `Costa Mesa Commercial Real Estate: Find the Right Location | Rofo`
- **Primary metrics:** average position, impressions, clicks, and CTR for the exact query/page pair
- **Product metric:** attributable Requirement starts with `sourcePath=/commercial-real-estate/CA/costa-mesa/`
- **Observation:** 14–21 days or approximately 100 new reportable impressions, whichever provides a useful signal; no preset success threshold or traffic forecast

This is a title-only intervention. Meta description, H1, opening, CTA, Location Brief promise, canonical, internal links, structured-data meaning, and Requirement behavior remain control variables. Sacramento Industrial remains unchanged as Experiment #1.

## Why clicks and position fell

The decline has two simultaneous causes. First, high-ranking legacy inventory URLs lost visibility: page-dimensional legacy property/listing traffic fell from 14,217 impressions and 161 clicks at position 12.8 to 7,811 impressions and 43 clicks at position 16.0. That net 118-click loss is largely acceptable because the disappearing URLs are individual buildings, old listings, mobile-host pages, user pages, and address intent that Rofo often cannot answer with current availability.

Second, the modern footprint did weaken. City pages gained impressions (63,339 to 68,710) but lost 32 clicks and moved from position 31.9 to 37.0. Property-type pages lost 17 clicks and moved from 25.9 to 28.0; district/guide pages lost eight clicks and moved from 21.6 to 30.8. The average-position decline therefore reflects both removal of relatively high-ranking legacy URLs and more low-ranked impressions across the newer decision footprint. This qualified loss deserves investigation, but it is smaller than the legacy loss by landing-page family.

Query-visible rows expose only 12 of the 177 lost site-wide clicks. Within that limited set, qualified-modern terms fell from six clicks to one, legacy/availability terms from seven to one, branded terms from three to two, address terms rose from one to two, and other/ambiguous terms fell from four to three. The remaining 165-click site-wide decline has unknown query intent because of GSC privacy filtering. These query counts must not be added to page-family counts; they are two different views of the same traffic.

### Largest meaningful losses

| Query/family | Landing page/family | Prior impressions / clicks / CTR / position | Current impressions / clicks / CTR / position | Change | Type | Importance / do we want it back? |
|---|---|---:|---:|---:|---|---|
| Legacy buildings, listings, mobile-host and user pages | Individual-property family | 14,217 / 161 / 1.132% / 12.8 | 7,811 / 43 / 0.551% / 16.0 | -6,406 impressions, -118 clicks, -3.2 positions | Legacy listing | **Acceptable loss / NO** as a class; do not restore stale availability traffic |
| Modern city intent | City pages | 63,339 / 103 / 0.163% / 31.9 | 68,710 / 71 / 0.103% / 37.0 | +5,371 impressions, -32 clicks, -5.1 positions | Qualified modern, mixed | **Investigate / YES** where the query is commercial and local |
| Modern property-type intent | Office/industrial/retail/flex pages | 7,211 / 35 / 0.485% / 25.9 | 5,382 / 18 / 0.334% / 28.0 | -1,829 impressions, -17 clicks, -2.1 positions | Qualified modern, mixed | **Investigate / YES** for truthful decision intent |
| Modern district/guide intent | District and guide pages | 8,217 / 18 / 0.219% / 21.6 | 7,010 / 10 / 0.143% / 30.8 | -1,207 impressions, -8 clicks, -9.2 positions | Qualified modern, mixed | **Watch / UNCLEAR** until split-intent cases are isolated |
| Homepage discovery | Homepage | 9,204 / 13 / 0.141% / 43.1 | 7,215 / 6 / 0.083% / 54.1 | -1,989 impressions, -7 clicks, -11.0 positions | Ambiguous | **Investigate / UNCLEAR**; broad terms dominate and intent is hidden |
| `commercial real estate` | Many city URLs | 568 / 3 / 0.528% / 13.4 | 509 / 0 / 0% / 15.9 | -59 impressions, -3 clicks, -0.528 pp CTR, -2.5 positions | Ambiguous/broad | **Watch / UNCLEAR**; no single page cleanly owns national intent |
| `rofo.com` | Primarily homepage | 23 / 3 / 13.043% / 3.4 | 33 / 1 / 3.030% / 28.2 | +10 impressions, -2 clicks, -10.013 pp CTR, -24.8 positions | Branded | **Investigate / YES**, but sample is tiny and host/SERP variation may distort position |
| Chicago CRE/lease variants | Chicago city page | 465 visible prior impressions across four leading variants; 0 current | 0 / 0 / — / — | At least -465 visible impressions | Qualified but availability-heavy | **Watch / UNCLEAR**; useful market intent mixed with an availability promise Rofo cannot make |
| `1400 Seaport Blvd Redwood City` | Legacy property context | 124 / 0 / 0% / 14.0 | 1 / 0 / 0% / 16.0 | -123 impressions | Legacy/address | **Acceptable loss / NO** unless current property facts can be maintained |
| `Antioch industrial space for lease` | Antioch city/type footprint | 116 / 0 / 0% / 11.0 | 21 / 0 / 0% / 19.7 | -95 impressions, -8.7 positions | Availability-heavy modern | **Watch / UNCLEAR**; valuable need, but not if the result implies live inventory |

### Current opportunity diagnosis

The top 200 non-branded query/page combinations are dominated by zero-click impressions. The useful subset is local commercial or property-type intent at positions 8–25. Costa Mesa, Tempe, North San Jose, Jacksonville, Chino, Sacramento, Fullerton, Phoenix, San Jose Industrial, and Indianapolis are the strongest bounded cases. Generic queries scattered across unrelated cities, consumer-adjacent terms, and pages ranking beyond roughly position 40 are insufficient evidence for intervention.

The biggest meaningful cannibalization case is `north san jose commercial real estate`: the North San Jose district page has 64 impressions, zero clicks, and position 14.8 (recent: 20 / 0 / 9.8), while the San Jose city page has 40 impressions, zero clicks, and position 21.9 (recent: 6 / 0 / 45.0). The district page should probably own this exact district intent. Google is splitting signals, but the better page is already emerging; strengthen explicit city-to-district context before considering canonical or redirect changes. A smaller Costa Mesa host split (117 impressions on `www`, seven on bare-domain for `costa mesa retail space for lease`) is not a current redirect defect: production sends bare-domain requests to `www` with HTTP 301 and the rendered canonical is `www`.

### Known opportunity queue, recalculated

| Cluster | Target | Prior | Current | Recent Sep 9–15 | Diagnosis |
|---|---|---:|---:|---:|---|
| Sacramento industrial space | `/CA/sacramento/industrial-space/` | 15 / 0 / 0% / 21.3 | 99 / 0 / 0% / 18.3 | 25 / 0 / 0% / 19.7 | **Experiment #1 active.** Visibility consolidated onto the intended page and improved; make no further change during observation |
| Indianapolis commercial real estate | `/IN/indianapolis/` | 159 / 0 / 0% / 26.0 | 191 / 0 / 0% / 25.4 | 32 / 0 / 0% / 30.8 | More demand, still too low; recent ranking weakened |
| Indianapolis industrial space | `/IN/indianapolis/industrial-space/` | 87 / 0 / 0% / 21.7 | 45 / 0 / 0% / 21.1 | Query/page row suppressed or absent | Ranking flat and impressions down; improve authority/alignment only after the broader city experiment |
| Phoenix industrial space | `/AZ/phoenix/industrial-space/` | 16 / 0 / 0% / 22.3 | 81 / 0 / 0% / 20.9 | 21 / 0 / 0% / 17.8 | Growing and improving READY overlap; strong clean experiment candidate |
| Fullerton commercial real estate | `/CA/fullerton/` | 136 / 0 / 0% / 17.2 | 105 / 0 / 0% / 18.1 | Query/page row suppressed or absent | Still relevant READY overlap, but weaker evidence than Phoenix/Costa Mesa/Tempe |

Numbers in this and subsequent tables are impressions / clicks / CTR / average position for the exact query/page pair unless labeled as a family.

### Query/page, title, description, opening, and link findings

- **Strongest title opportunity:** Phoenix Industrial. The current title, `Phoenix Industrial, Warehouse and Flex Location Guide | Rofo`, is truthful but frames the page as a guide while the proven query is `phoenix industrial space`. Test `Phoenix Industrial Space: Compare Locations for Your Business | Rofo`; do not imply inventory.
- **Strongest meta-description opportunity:** Jacksonville Industrial. The generic description (`Compare industrial location options...`) undersells the Requirement/Location Brief entry and the opening mentions public and private availability. Replace only the description with a direct, truthful promise: tell Rofo how the operation works, compare Jacksonville location considerations, and create a Location Brief; do not promise available listings.
- **Strongest opening-content opportunity:** Fullerton city. The opening starts with Fullerton's role in a North Orange County search, but the visible query is broad `fullerton commercial real estate`. Lead by answering the Fullerton need, then explain the bounded North Orange County industrial/flex distinction and the next step.
- **Strongest internal-link opportunity:** Indianapolis Industrial. The built site has many more links to the city page than the industrial page (141 versus 25 pages in the rendered build). Add a small, relevant cluster of descriptive `Indianapolis industrial space` links from the Indianapolis city page, nearby industrial pages, and the two governed Indianapolis district pages; do not create sitewide links.
- **Titles:** Costa Mesa and Fullerton both append `Location Guide` to exact commercial-real-estate queries. This is accurate but weaker than the searcher's language. Phoenix uses the same guide framing for exact industrial-space demand. Jacksonville's and Sacramento's titles already align well; Sacramento must remain unchanged.
- **Descriptions:** Indianapolis city is clear/strong. Phoenix is accurate but weak and district-system-oriented. Fullerton and Costa Mesa are accurate but weak. Jacksonville is accurate but generic. North San Jose is clear but does not state Rofo's next step. None justify mass rewriting.
- **Openings/product entry:** Modern pages generally expose `Tell us what you need` and the Location Brief promise. Phoenix, Sacramento, Indianapolis Industrial, Tempe, and North San Jose immediately provide useful local context. Indianapolis city is still selector-led; Fullerton is region-framing-led; Jacksonville is generic and availability-adjacent. Those are bounded content/alignment opportunities, not product-redesign requests.

### Exactly ten qualified organic opportunities

| # | Query / target | Current baseline | Recent trend | Diagnosis and value | Exact first intervention | Mechanism and measurement |
|---:|---|---:|---|---|---|
| 1 | `sacramento industrial space` → Sacramento Industrial | 99 / 0 / 0% / 18.3 | 25 impressions, position 19.7 | Active qualified READY experiment; target-page impressions increased from 15 prior | **No change.** Preserve the existing title, meta, CTA, and opening through observation | Measure exact query/page impressions, position, CTR, clicks, and attributed starts; review after 21–28 days or 100 additional impressions |
| 2 | `tempe industrial space` → Tempe Industrial | 87 / 0 / 0% / 11.0 | 21 impressions, position 10.4 | Ranking opportunity at the page-one boundary; strong operational intent | Test the meta description only: lead with Tempe industrial-space decisions and the Location Brief next step, retaining I-10 context | Improve qualified CTR/product expectation; watch exact query/page CTR, clicks, position, and starts for 14–21 days / about 60 impressions |
| 3 | `costa mesa commercial real estate` → Costa Mesa city | 154 / 0 / 0% / 12.3 | 31 impressions, position 11.4 | Highest-volume clean near-page-one city opportunity | Test title `Costa Mesa Commercial Real Estate: Compare Locations | Rofo`; keep non-listings promise and page body stable | Improve relevance/CTR; watch exact query/page and close variants for 14–21 days / about 100 impressions |
| 4 | `north san jose commercial real estate` → North San Jose district | 64 / 0 / 0% / 14.8; city competitor 40 / 0 / 0% / 21.9 | District improved to 9.8; city fell to 45.0 | Cannibalization with a clear preferred page and valuable district intent | Add one explicit, descriptive link from San Jose city to North San Jose and align nearby San Jose navigation anchors; do not canonicalize | Consolidate relevance; measure impressions/position by both URLs, aggregate CTR/clicks, and whether the district remains the dominant URL for 21–28 days |
| 5 | `jacksonville industrial space` → Jacksonville Industrial | 95 / 0 / 0% / 13.9 | 33 impressions, position 13.8 | New qualified visibility; page can accept a Requirement without READY intelligence | Replace only the generic meta description with a truthful industrial-decision + Location Brief promise | Improve CTR and product entry; measure exact pair CTR/clicks/position and attributed starts for 14–21 days / about 75 impressions |
| 6 | `phoenix industrial space` → Phoenix Industrial | 81 / 0 / 0% / 20.9 | 21 impressions, position 17.8 | Growing READY overlap; title describes a guide rather than exact space intent | Test title `Phoenix Industrial Space: Compare Locations for Your Business | Rofo`; leave Sacramento and Phoenix body/meta stable | Improve relevance and ranking, secondarily CTR; measure exact pair plus close industrial variants for 21–28 days / about 75 impressions |
| 7 | `fullerton commercial real estate` → Fullerton city | 105 / 0 / 0% / 18.1 | Exact recent row absent/suppressed | READY overlap but current opening over-frames the regional model | Revise only the first paragraph to answer Fullerton CRE intent, then explain North OC industrial/flex scope and `Tell us what you need` | Improve relevance and product comprehension; measure exact pair, Fullerton industrial/flex variants, clicks, and starts for 28 days |
| 8 | `indianapolis commercial real estate` / `indianapolis industrial space` → city + Industrial | City 191 / 0 / 0% / 25.4; Industrial 45 / 0 / 0% / 21.1 | City position 30.8; industrial row absent | High qualified READY demand, but ranking is not yet a snippet-only problem | Strengthen a bounded internal-link cluster from city and relevant governed district/nearby industrial pages to the Industrial page using descriptive anchors | Improve authority and intent ownership; measure both exact pairs, URL distribution, position, and attributed starts for 28 days |
| 9 | `san jose industrial space` → San Jose Industrial | 108 / 0 / 0% / 22.0 | 26 impressions, position 21.0 | Qualified operational intent and an existing useful decision page | Add a prominent contextual link from San Jose city and North San Jose district to the Industrial page, with language distinguishing citywide industrial intent from district intent | Improve ranking and intent hierarchy; measure exact pair and competing URLs for 21–28 days / about 90 impressions |
| 10 | `chula vista commercial real estate` → Chula Vista city | 148 / 0 / 0% / 17.0 | 31 impressions, position 15.3 | Qualified non-READY city demand; ranking recently recovering after a 4.9-position period decline | Improve only the opening with query-first Chula Vista context and the universal Location Brief promise; do not imply San Diego Industrial/Flex coverage | Improve relevance and qualified entry; measure exact pair position, CTR/clicks, and attributed starts for 21–28 days / about 100 impressions |

`vacaville industrial space for lease` (65 impressions, zero clicks, position 10.4) and `chino commercial real estate` (84, zero, 10.5) are strong watch-list signals, but are outside the ten because Vacaville carries a live-availability expectation and Chino needs another period to distinguish durable demand from newly expanded visibility.

### Next three interventions after Sacramento

1. **Costa Mesa title experiment.** Query/page: `costa mesa commercial real estate` → Costa Mesa city. Problem: 154 impressions at position 12.3 and zero clicks; accurate `Location Guide` framing is weaker than the exact query. First change: title only, to `Costa Mesa Commercial Real Estate: Compare Locations | Rofo`. Baseline: 154 / 0 / 0% / 12.3; recent 31 / 0 / 0% / 11.4. Observe 14–21 days or until roughly 100 post-change impressions, whichever is later.
2. **Tempe meta experiment.** Query/page: `tempe industrial space` → Tempe Industrial. Problem: position 11.0 (10.4 recent), zero clicks, and a technically framed description. First change: meta description only, expressing the industrial-space decision and Location Brief next step. Baseline: 87 / 0 / 0% / 11.0; recent 21 / 0 / 0% / 10.4. Observe 14–21 days or roughly 60 impressions.
3. **Phoenix title experiment.** Query/page: `phoenix industrial space` → Phoenix Industrial. Problem: improving visibility but `Location Guide` framing does not lead with exact space intent. First change: title only, to `Phoenix Industrial Space: Compare Locations for Your Business | Rofo`. Baseline: 81 / 0 / 0% / 20.9; recent 21 / 0 / 0% / 17.8. Observe 21–28 days or roughly 75 impressions.

These experiments do not overlap pages, and Sacramento remains untouched. Indianapolis and Fullerton remain next in line if their recent exact-query visibility persists.

### Small-space signal and traffic not worth recovering

**Small-space customer pattern: WEAK SIGNAL in search, supported signal in customer cases.** Query-visible small/size-explicit searches increased from 740 impressions to 1,092, but produced zero clicks and worsened from position 43.7 to 50.3. The current set includes `small building for rent` (104 impressions), `small commercial space for rent` (43), `small business space for rent` (42), `small industrial units to rent near me` (35), and `office space 500 sq ft` in the recent window (nine). This proves search demand exists, not that Rofo is acquiring it or that every term is commercial. Combined with nine of 13 legitimate prior cases under 5,000 SF, it justifies watching small commercial office/industrial/flex language without declaring a target market.

Rofo should not optimize to recover stale individual-address and building queries; old `m.rofo.com` building URLs; old `/listings/` and user pages; availability-led queries where current availability cannot be answered; property-for-sale terms that do not match the product; generic consumer/service terms (including template-driven `commercial packers` visibility); or residential-adjacent `near me` traffic without clear commercial intent. The lost Chattanooga, Livonia, Camden Avenue, Natchez, Wake Forest, Sneads Ferry, Santa Fe, Chicago, and similar individual-property clicks belong in this acceptable-loss bucket unless durable, current property facts exist.

### Bounded technical check

No material technical SEO defect was found on the leading opportunity pages. The rendered pages are indexable, use self-referencing `https://www.rofo.com/...` canonicals, appear in the generated sitemap, and return HTML successfully. Bare-domain Costa Mesa redirects to `www` with HTTP 301. No accidental `noindex` was found on the audited city, space-type, or district templates; `noindex` is limited to intended Requirement/private/prototype surfaces. The sitemap currently contains 13,571 URLs.

The large reduction in page-dimensional rows (9,090 prior to 4,752 current) and legacy page impressions is consistent with the legacy-footprint transition and September redirect work, not proof of a new indexing failure. Continue to watch modern sitemap URL indexing and the small host-variant residue, but do not launch canonical or redirect work from this evidence alone.

### Plain-English answer and growth-mode process

**Clicks fell primarily because Rofo lost high-ranking legacy property/listing traffic, while the newer city, property-type, and district footprint also ranked worse and earned fewer clicks.** By landing-page family, 118 net lost clicks were on legacy property/listing URLs and 57 were on modern city/type/district URLs; homepage/other pages netted approximately three additional lost clicks. By query, Google reveals only 12 of the 177 lost site-wide clicks: six legacy/availability, five qualified-modern, one branded, one other lost, partly offset by one address gain. Query intent for the other 165 lost clicks is unknown. Landing-page and query classifications overlap and must not be summed.

**Is the decline strategically alarming? PARTLY.** The majority of the observable landing-page loss is low-value legacy inventory traffic that Rofo should not chase. The modern 57-click loss, broad ranking deterioration, zero-click near-page-one opportunities, and branded anomaly are real growth concerns. They call for small, measurable relevance and intent-ownership experiments—not restoration of stale listings and not more product.

Operating loop: use live GSC to choose one commercially qualified query/page pair; record exact query/page and page totals; diagnose ranking, CTR, alignment, URL competition, and truthful product fit; make the smallest isolated change; preserve sourcePath attribution; observe until the page has enough impressions to judge; then keep, iterate, or stop before moving on. Use 14–21 days for opportunities producing roughly 20–30 impressions per week, and 21–28 days for lower-volume or ranking/link experiments. Never call a result from calendar time alone when the impression sample is still weak.

## Market Reality

| READY flow | Live search signal | Conclusion |
|---|---|---|
| SF Office | SF commercial query: 139 impressions, position 47.6; city page: 2,731 impressions, one click | Visibility without usable ranking |
| San Diego Industrial/Flex | Chula Vista family has page-two visibility; no clean current Industrial/Flex click signal | Nearby opportunity, intent needs validation |
| North Orange County Industrial/Flex | Fullerton at position 18.1; Costa Mesa at 12.4 but outside the exact certified universe | Best near-ranking regional cluster, with geography caveat |
| Phoenix Industrial/Flex | “Phoenix industrial space” at position 18.2 in the last seven days | Exact but low-volume opportunity |
| Indianapolis Industrial/Flex | 187 impressions for Indianapolis CRE, position 25.3 | Most visible exact READY-market family, ranking too low |
| Sacramento Industrial/Flex | “Sacramento industrial space” at position 19.9 in the last seven days | Exact, low-volume page-two opportunity |

Capability and acquisition do overlap, but none of these READY flows currently receives enough qualified clicks to justify another market expansion. Fullerton, Sacramento Industrial, Phoenix Industrial, and Indianapolis deserve focused search work because the product already exists behind them.

## Funnel Reality

| Stage | Sep 8–14 | Aug 17–Sep 14 | Status |
|---|---:|---:|---|
| Product/Requirement starts | 17 raw legacy starts | 127 raw starts (82 legacy, 45 v2) | **Directional**; internal/bot linkage incomplete |
| Legitimate Requirement records completed enough to continue | 3 | 13 | **Trustworthy**, case-reviewed |
| Intelligence delivered | 3 | 13 | **Trustworthy** for those cases: 12 legacy Expert Guided, one v2 FULL |
| Location Brief engaged/viewed | 0 linked real cases | 0 linked real cases | **Unreliable as behavior**; legacy views are not measured, one raw v2 view was QA-like |
| Continuation requested | 3 | 13 | **Trustworthy**; 12 legacy investigations plus one v2 commercial request |
| Fulfillment sent | 3 | 9 | **Trustworthy** |

The prior 29 days contained 156 raw legacy starts, 13 non-spam leads, and one fulfillment recorded within that same window. The current period contains fewer raw starts but the same number of legitimate requests and substantially more fulfillment.

No honest end-to-end conversion rate is reported. Search clicks, raw sessions, legacy intake, v2 Briefs, and fulfillment are not universally joined to a common person. The strongest linked fact is downstream: of 13 verified requests, nine were fulfilled and four remained pending at the end of the window.

**Where volume disappears:** before a trustworthy product cohort exists. Rofo receives 95,810 search impressions but only 153 clicks, then loses attribution between landing and durable Requirement. There is no evidence in this window that Brief confirmation is the primary bottleneck; most legitimate cases used the legacy continuation path, and the new shared-search Brief is too recent to evaluate.

## Real Customer Cases

All 13 non-spam cases were inspected. Labels below are anonymized; no email, phone, or unnecessary PII is included.

| Date | Business label | Acquisition | Market / type | Requirement / recommendation | Brief / continuation | Fulfillment | Observation |
|---|---|---|---|---|---|---|---|
| Aug 19 | Professional-services office | Unknown | Burlingame, CA / Office | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Aug 19 | Under 2,500 SF, urgent |
| Aug 21 | Architecture/design firm | SF Marina district page in persisted context; originating query unknown | San Francisco / Office | v2 Requirement; FULL | v2 Brief and commercial request | Pending | Only legitimate v2 continuation in window; 5,000 SF |
| Aug 24 | Industrial user | Unknown | Novi, MI / Industrial | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Aug 24 | 5,000–10,000 SF, within three months |
| Aug 26 | Professional-services flex user | Unknown | Naperville, IL / Flex | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Pending | Small, urgent search |
| Aug 27 | Professional-services retailer | Unknown | Derry/Salem/Londonderry, NH / Retail | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Pending | Multi-place location intent |
| Aug 28 | Storefront business | Unknown | Manchester, NH / Retail | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Pending | 2,500–5,000 SF, 6–12 months |
| Sep 1 | Professional-services flex user | Unknown | Trenton, MI / Flex | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Sep 1 | Small, urgent search |
| Sep 2 | Painting subcontractor | Unknown | Palmetto, FL / Office | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Sep 2 | 2,500–5,000 SF, urgent |
| Sep 3 | ABA-services office | Unknown | Kansas City, KS / Office | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Sep 3 | Under 2,500 SF |
| Sep 3 | Frozen-food retailer | Unknown | Bridgeport, CT / Retail | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Sep 3 | 2,500–5,000 SF |
| Sep 9 | Behavioral-services office | Unknown | Joliet, IL / Office | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Sep 9 | Under 2,500 SF, urgent |
| Sep 10 | Liquidation warehouse user | Unknown | Monroe, MI / Industrial | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Sep 10 | Under 2,500 SF, urgent |
| Sep 13 | Sign printing/installation service | Unknown | Austell, GA / Flex | Complete enough; Expert Guided | Legacy Brief submitted; investigation requested | Sent Sep 13 | Under 2,500 SF, 6–12 months |

What these cases teach us:

- Demand is geographically diffuse: only one verified case was in a current READY recommendation flow.
- Nine of 13 searches were under 5,000 SF, and many were under 2,500 SF; current real demand skews small.
- Use cases are operationally diverse, but the legacy flow can capture enough context to route them.
- Fulfillment works operationally when a request is approved; response/outcome data after sending is absent.
- Acquisition attribution is the largest case-level blind spot. `source=location_brief` describes the submitting product, not how the person found Rofo.

## Acquisition Attribution

The SF architecture/design case preserves an entry from the Marina district route. For the other 12 primary cases, query, referrer, and original landing page are **UNKNOWN**. Search Console cannot identify individuals, and legacy lead/Brief records do not retain those acquisition fields.

Event aggregates show that city and district pages do feed the Requirement journey, but journey IDs do not reliably connect those events to the durable legacy lead. Attribution is therefore not strong enough to say organic search produced the 13 cases.

## Landing Page Reality

The homepage and SF city page have the most visible current signals, but almost no clicks relative to impressions. Meanwhile, several market pages/queries sit near page two: Costa Mesa, Fullerton, Chula Vista, Sacramento Industrial, and Phoenix Industrial. These pages are the practical acquisition frontier.

The diagnosis is not “redesign landing pages.” It is that most qualified searchers are not reaching them. For pages already near positions 11–20, the immediate work should be search-result alignment and focused ranking improvement: make titles/descriptions and page intent clearly answer the exact commercial-space query, then observe impressions, position, clicks, and product starts. Pages at position 35–50 should not be treated primarily as CTA problems.

## Requirement Journey

Production recorded 127 raw starts and 13 verified completed/continued cases. That apparent gap is not a valid 10% completion rate: starts contain unidentified internal/bot activity, while durable cases come from two generations of the journey with incomplete identifiers.

The event stream shows 50 legacy size completions and 46 feature completions, but it cannot connect every abandonment to a legitimate human. There is no trustworthy evidence that one specific question is causing loss. Mobile/desktop differences are likewise below the standard needed for a conclusion.

## Location Brief + Continuation

Twelve verified cases used the legacy Location Brief investigation path; one used Location Brief v2 and created a commercial request. All 13 reached continuation by construction of the durable record. Nine were sent to fulfillment.

Brief viewing remains unmeasurable for the legacy cohort. The one raw `vnext_brief_viewed` event in the window belonged to a Sacramento record created in a certification-like cluster, not a verified customer. No verified `vnext_brief_confirmed`, `vnext_find_spaces_clicked`, or `vnext_research_submitted` event occurred in the primary window.

The newly implemented shared-search Brief should not be judged from this historical cohort. Its confirmation and continuation behavior needs forward observation after release, not retrospective inference.

## Good Sense Coffee

Good Sense Coffee is outside the primary GSC window but was traced in production:

- September 16, 2026 at 11:59 a.m. Pacific: legacy Location Brief created, expert review requested, Brief submitted, and live-market investigation requested within about one second.
- Howell, Michigan / Flex; coffee roasting; two people; under 2,500 SF; as soon as possible; office plus warehouse/easy-access needs.
- Recommendation remained Expert Guided / investigation required, consistent with unsupported-market handling.
- Fulfillment was sent at 12:13 p.m. Pacific, about 13 minutes 40 seconds after the request.
- Acquisition query, referrer, and original landing page are **UNKNOWN**; the persisted `source=location_brief` identifies the product handoff, not acquisition.
- Customer follow-up, OfficeFinder response, and final outcome are not recorded in the queried loop.

This case proves that Rofo can collect enough context to route a small, urgent, unsupported-market search quickly. It does not prove that organic acquisition or the new shared Brief caused the request.

## Current Constraint

**CURRENT CONSTRAINT:**

Rofo is not earning enough qualified organic clicks to feed a learnable customer funnel.

**EVIDENCE:**

1. Search produced 95,810 impressions but only 153 clicks (0.160% CTR).
2. Versus the prior comparable period, clicks fell 53.6% while impressions fell 5.9%; average position worsened from 28.73 to 35.35.
3. Important READY-market queries sit mostly at positions 18–48 with zero clicks.
4. Only 13 legitimate requests existed in 29 days, and just one was in a READY recommendation flow.
5. Downstream operations did fulfill nine of those 13; there is no comparable evidence that fulfillment capacity is the binding constraint.

**WHY THIS MATTERS:**

Rofo cannot learn whether the new Requirement/Brief experience converts qualified visitors until enough qualified visitors actually reach it. Improving downstream product now would optimize a stage with almost no observable cohort.

**WHAT WE STILL DON'T KNOW:**

Which channel generated 12 of 13 real cases; whether legitimate humans account for most raw journey starts; how the new shared-search Brief affects engagement; and what happens after fulfillment.

## Next Two Weeks

1. **Run isolated acquisition experiments.** Leave Sacramento Industrial unchanged as Experiment #1. Queue Costa Mesa title, Tempe meta, and Phoenix title tests in that order, one change per page, with the baselines and stopping rules above.

2. **Repair attribution continuity using the fields and events already present.** Verify that landing page, referrer, journey ID, and Brief/lead identity survive from product entry into the durable request for all new cases. This is a diagnosis/QA task, not a new analytics system. Success is knowing the source or honestly labeling it unknown for every new legitimate case.

3. **Review every real case daily and leave the downstream product stable.** Track new legitimate requests, pending-versus-sent state, and any customer outcome. Observe the current shared-search Brief prospectively; do not change it until several real exposed cases exist.

## What Stays Parked

- downstream broker workflow development;
- Property Evaluation;
- availability infrastructure;
- marketplace and Submit-a-Space;
- broad Market Pack migration;
- new markets without acquisition evidence;
- Requirement, Recommendation, or Location Brief redesign;
- architectural cleanup;
- new dashboards or analytics systems.

## New Morning Operating Sheet

```text
OBJECTIVE
Increase qualified traffic and learn whether it becomes real Briefs and requests.

TRAFFIC
7d (Sep 9–15): 15,456 impressions | 33 clicks | 0.214% CTR | position 35.47
30d (Aug 17–Sep 15): 95,810 impressions | 153 clicks | 0.160% CTR | position 35.35
Prior 30d: 101,840 impressions | 330 clicks | 0.324% CTR | position 28.73

CONVERSION
7d: 17 raw starts (directional) | 3 real Requirements/requests | 3 sent
29d: 127 raw starts (directional) | 13 real Requirements/requests | 9 sent | 4 pending
Brief views/confirmations: not trustworthy for the real cohort

REAL CUSTOMERS
Last 7d: behavioral-services Office; liquidation Industrial; sign-service Flex.
All three fulfilled. Good Sense Coffee followed Sep 16 and was sent in ~14 minutes.

CURRENT CONSTRAINT
Too few qualified organic clicks; ranking and CTR weakened versus the prior period.

TODAY'S WORK
Keep Sacramento Industrial stable; prepare the isolated Costa Mesa title experiment.

WATCH
Sacramento exact query/page; Costa Mesa, Tempe, Phoenix, North San Jose URL split;
sourcePath and originating journey on every new legitimate request; pending cases.

PARKED
Property Evaluation, availability, marketplace, new markets, broker workflow,
broad Market Pack migration, product redesign, new dashboards.
```
